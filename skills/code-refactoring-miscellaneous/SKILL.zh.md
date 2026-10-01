---
name: code-refactoring-miscellaneous
description: >-
  TypeScript/Node.js 重構的雜項案例與概念，補充核心重構指南。
  涵蓋額外的模式、邊緣案例和專門的重構技術，這些內容不適合放在核心重構原則中。
  適用於：
  (1) 處理複雜的重構場景，
  (2) 解決標準指南未涵蓋的程式碼異味，
  (3) 進階 TypeScript 模式，
  (4) Node.js 特定考量，
  (5) React/JSX/HTML/DOM/CSS 特定考量，
  以及 (6) 跨領域關注點。
  當使用者詢問「雜項重構」、「邊緣案例」、「進階模式」或核心指南需要補充時使用此 Skill。
tags:
  - refactoring
  - TypeScript
  - nodejs
  - edge-cases
  - React
  - Storybook
  - CSS
---

# TypeScript/Node.js 重構 - 雜項案例與概念

您是處理複雜和專門重構場景的專家，這些場景超出了標準模式的本範圍。
本指南補充核心重構原則，提供額外的案例、邊緣條件和進階技術。

> 📋 **本指南的目的**：
> - **處理邊緣案例**：涵蓋標準模式未涉及的重構場景
> - **進階模式**：複雜 TypeScript/Node.js 狀況的專門技術
> - **跨領域關注點**：跨越多個領域的重構考量
> - **實用補充**：真實世界的複雜情況及其解決方案

[code-refactoring-expert-typescript](../code-refactoring-expert-typescript/SKILL.md) - 核心重構原則

- **數值/計算邏輯的 SSOT**：請見核心指南中的 **規範 B-2：在計算密集型專案中，連「瑣碎」運算也要抽離為公用邏輯** —— 將 SSOT 原則應用於數值密集型專案的共用運算工具，並附 `percent.ts` 具體案例。

---

## Async/Await 與 生成器 (Generator) 邊緣案例

### 平行執行 vs 循序執行

**問題**：獨立非同步操作的不必要循序執行。

#### ❌ 反模式：循序執行獨立呼叫

```typescript
// 總耗時 = 3s (每個 1s)
const user = await fetchUser(id);
const profile = await fetchProfile(id);
```

#### ✅ 解決方案：使用 Promise.all 平行執行

```typescript
// 總耗時 = 1s (同時執行)
const [user, profile] = await Promise.all([
    fetchUser(id),
    fetchProfile(id)
]);
```

#### ✅ 容錯處理：Promise.allSettled 處理部分失敗
```typescript
const [userResult] = await Promise.allSettled([fetchUser(id), fetchProfile(id)]);
const user = userResult.status === 'fulfilled' ? userResult.value : null;
```

### 非同步產生器重構

**問題**：處理大型資料集時將所有資料載入記憶體。

#### ❌ 反模式：載入所有資料

```typescript
const allRecords = await fetchAllRecords(); // 記憶體爆炸！
for (const record of allRecords) processRecord(record);
```

#### ✅ 解決方案：非同步產生器

```typescript
async function* processRecordsGenerator(): AsyncGenerator<Record> {
    let cursor = null;
    while (cursor !== null) {
        const { records, nextCursor } = await fetchRecordBatch(cursor);
        for (const record of records) yield record;
        cursor = nextCursor;
    }
}

for await (const record of processRecordsGenerator()) {
    await processRecord(record);
}
```

### Generator 底層抽象重構模式

**問題**：多個 Generator 函數中有重複的遍歷邏輯。

#### ❌ 重構前：重複的遍歷邏輯
```typescript
// 每個函數都有相同的遞迴邏輯
function* convertTokenKeysToCSSVarGenerator(tokenObj, options) {
    const { deep = false } = options || {};

    function* processObject(obj) {
        for (const key of Object.keys(obj)) {
            const cssVarKey = antdTokenToCSSVar(key);
            const value = obj[key];

            // 重複的深度遍歷邏輯
            if (deep && value && typeof value === 'object' && !Array.isArray(value)) {
                yield* processObject(value);
            } else {
                yield [cssVarKey, value];
            }
        }
    }

    yield* processObject(tokenObj);
}
```

#### ✅ 重構後：底層抽象 + 組合模式
```typescript
// 底層抽象：專門處理遍歷
function* walkTokenObjectGenerator(obj, options) {
    const { deep = false } = options || {};

    for (const key of Object.keys(obj)) {
        const value = obj[key];

        if (deep && value && typeof value === 'object' && !Array.isArray(value)) {
            yield* walkTokenObjectGenerator(value, { deep });
        } else {
            yield [key, value];
        }
    }
}

// 組合模式：基於底層抽象
function* convertTokenKeysToCSSVarGenerator(tokenObj, options) {
    for (const [key, value] of walkTokenObjectGenerator(tokenObj, options)) {
        const cssVarKey = antdTokenToCSSVar(key);
        yield [cssVarKey, value];
    }
}
```

#### 收益

- **消除重複**：遍歷邏輯統一在底層
- **職責分離**：遍歷與轉換邏輯分離
- **可擴展性**：基於底層快速組合新功能

📚 **完整案例參考**：[Generator 底層抽象重構模式 - 完整案例分析](./references/generator-foundation-abstraction.md)

---

## 型別系統進階模式

### 範本字面型別

**問題**：從字串模式建立型別。

#### ✅ 解決方案：使用列舉建立有效值

```typescript
enum EnumHttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}

type IEndpoint = `/api/${EnumHttpMethod}/${string}`;

function handleRequest(endpoint: IEndpoint) { /* ... */ }

handleRequest('/api/GET/users');    // ✅ 有效
handleRequest('/api/PATCH/users');  // ❌ 無效
```

---

## 外部 API 類型安全封裝

### 概述

將**鬆散類型的外部 API**（如 VS Code `Memento`、`localStorage` 等）封裝為**嚴格類型的內部接口**，實現編譯期類型安全與運行時數據一致性。

### 核心問題

外部 API 通常為了最大靈活性而使用 `string` 鍵 + `any` 值：

```typescript
// ❌ 外部 API 的類型定義過於寬鬆
interface Memento {
    get<T>(key: string): T | undefined;     // key 是任意 string
    update(key: string, value: any): void;  // value 是 any
}

// ❌ 直接使用導致的問題
context.globalState.get('serchHistory');        // 拼寫錯誤！編譯器不報錯
context.globalState.update('selectedIDEs', 'x'); // 類型錯誤！應該是 number[]
```

### 封裝策略

#### 1. 定義鍵枚舉 + 鍵值類型映射

```typescript
export const enum EnumGlobalStateName {
    searchHistory = 'searchHistory',
    selectedIDEs = 'selectedIDEs',
}

// 為每個鍵定義對應的值類型
export interface IGlobalStateSearchHistory {
    key: EnumGlobalStateName.searchHistory;
    value: string[];
}

export interface IGlobalStateSelectedIDEs {
    key: EnumGlobalStateName.selectedIDEs;
    value: number[];
}

export type IGlobalStateAll = IGlobalStateSearchHistory | IGlobalStateSelectedIDEs;
```

#### 2. 創建類型安全封裝類

```typescript
export class VscodeExtensionContextGlobalState {
    constructor(protected globalState: Memento) {}

    /**
     * 使用泛型條件類型實現鍵→值的類型映射
     * K extends EnumGlobalStateName: 限制鍵必須是枚舉值
     * Extract<IGlobalStateAll, { key: K }>: 從聯合類型中提取匹配的接口
     * T["value"]: 獲取該接口的 value 類型
     */
    get<K extends EnumGlobalStateName, T extends Extract<IGlobalStateAll, { key: K }>>(
        key: K,
        defaultValue?: T["value"]
    ): T["value"] | undefined {
        return this.globalState.get(key, defaultValue);
    }

    update<K extends EnumGlobalStateName, T extends Extract<IGlobalStateAll, { key: K }>>(
        key: K,
        value: T["value"]
    ): Thenable<void> {
        return this.globalState.update(key, value);
    }
}
```

#### 3. 類型安全的使用

```typescript
const state = new VscodeExtensionContextGlobalState(context.globalState);

// ✅ 鍵名有智能提示和編譯檢查
const history = state.get(EnumGlobalStateName.searchHistory);
//    ^? 類型推導為 string[] | undefined

// ✅ 鍵名錯誤會立即報錯
state.get('serchHistory'); // ❌ 錯誤：類型不匹配

// ✅ 值類型有編譯檢查
state.update(EnumGlobalStateName.selectedIDEs, [1, 2, 3]);      // ✅ number[]
state.update(EnumGlobalStateName.selectedIDEs, 'invalid');      // ❌ 類型錯誤！
```

### 重點收益

| 收益 | 說明 |
|------|------|
| **編譯期類型安全** | 鍵名拼寫錯誤、值類型錯誤在編譯階段即可發現 |
| **智能提示** | IDE 提供鍵名自動完成和值類型提示 |
| **可重構性** | 重命名枚舉值可通過 IDE 全局重構 |
| **向後兼容** | 底層外部 API 變更時，只需修改封裝層 |

### 適用場景

- VS Code Extension 的 `globalState` / `workspaceState`
- 瀏覽器 `localStorage` / `sessionStorage`
- 鍵值數據庫客戶端（Redis 等）
- 任何 `string` 鍵 + `any` 值的外部 API

### 進階用法：抽象類整合

在大型專案中，可將 GlobalState 封裝整合到抽象基類中，簡化多個類別的狀態管理：

#### 模式一：自動懶加載（推薦）

```typescript
/**
 * 自動由 ExtensionContext 初始化 GlobalState
 * 透過 getter 實現懶加載
 */
export abstract class AbstractClassWithContextGlobalState
{
    protected context!: ExtensionContext;
    #globalState!: VscodeExtensionContextGlobalState;

    protected get globalState(): VscodeExtensionContextGlobalState
    {
        if (!this.#globalState)
        {
            this.#globalState = new VscodeExtensionContextGlobalState(this.context.globalState);
        }
        return this.#globalState;
    }
}

// 使用
export class MyController extends AbstractClassWithContextGlobalState
{
    async saveData(data: string[]): Promise<void>
    {
        await this.globalState.update(EnumGlobalStateName.searchHistory, data);
    }
}
```

#### 模式二：工廠函數

```typescript
export function newVscodeExtensionContextGlobalState(globalState: ExtensionContext["globalState"])
{
    return new VscodeExtensionContextGlobalState(globalState);
}

// 使用
const state = newVscodeExtensionContextGlobalState(context.globalState);
```

📚 **完整案例參考**：[外部 API 類型安全封裝模式](./references/external-api-type-safe-wrapper.md)

---

## DOM Selector Enum Pattern

### 概述

將前端應用程式中分散且脆弱的**硬編碼 DOM 元素 ID** 與 **CSS 類別選擇器**重構為一套統一的 Enum 管理體系，建立**單一事實來源 (Single Source of Truth)**。

### 問題情境

直接使用硬編碼字串來引用 UI 元素會帶來以下風險：

1. **低可維護性與高耦合** - 業務邏輯層被緊密耦合於底層的 DOM 定位細節
2. **零編譯器安全檢查** - 選擇器的拼寫錯誤只會在運行時發現
3. **缺乏開發者體驗** - IDE 無法提供自動完成或跨文件重構支援
4. **HTML/JSX 層的隱藏風險** - 問題不僅存在於 JavaScript 邏輯代碼中，**HTML 與 JSX 模板中的硬編碼 `id` 和 `className` 同樣是風險來源**。而且相較於 JS 代碼，HTML/JSX 的維護更難發現問題（缺乏類型檢查、跨文件引用不透明），日後重構時更容易遺漏

#### ❌ 反模式

```typescript
// 硬編碼 ID - 維護困難、容易出錯
const element = document.getElementById('searchResults');
const input = document.getElementById('searchInput') as HTMLInputElement;

// 硬編碼 CSS 類別選擇器
const radio = document.querySelector<HTMLInputElement>('.ide-source-radio:checked');
```

### 解決方案：兩層級抽象

#### 🥇 第一層級：物理錨點

`EnumWebviewElemId` 與 `EnumCssClassSelector` - 定義 DOM 元素的 ID 與 CSS 類別的統一識別符，作為連接代碼與 HTML 的字串橋樑。

```typescript
/**
 * DOM 元素 ID 列舉（單一事實來源）
 * DOM element ID enum (Single Source of Truth)
 */
export const enum EnumWebviewElemId
{
    /** 搜尋結果容器 / Search results container */
    searchResults = 'searchResults',
    /** 搜尋輸入框 / Search input field */
    searchInput = 'searchInput',
    /** 訊息顯示容器 / Message display container */
    message = 'message',
}

/**
 * CSS 類別選擇器列舉（單一事實來源）
 * CSS class selector enum (Single Source of Truth)
 */
export const enum EnumCssClassSelector
{
    /** 分頁導航容器 / Tab navigation container */
    tabs = 'tabs',
    /** IDE 勾選框 / IDE checkbox */
    ideCheckbox = 'ide-checkbox',
    /** IDE 來源單選按鈕 / IDE source radio button */
    ideSourceRadio = 'ide-source-radio',
}
```

#### 🥈 第二層級：業務語義符

`EnumTabName` - 定義業務狀態與行為的語義識別符（如分頁名稱、操作模式），讓邏輯代碼獨立於 DOM 結構。

```typescript
/**
 * Tab 名稱列舉 - 業務語義符
 * Tab name enum - Business semantic identifier
 */
export const enum EnumTabName
{
    /** 同步設定分頁 / Sync settings tab */
    sync = 'sync',
    /** 檢視所有設定分頁 / View all settings tab */
    values = 'values',
    /** 已選設定分頁 / Selected settings tab */
    selected = 'selected',
}
```

### Helper 函式實作

```typescript
/**
 * 透過 EnumWebviewElemId 查詢單一元素
 * Query single element by EnumWebviewElemId
 */
export function querySelectorById<T extends HTMLElement>(id: EnumWebviewElemId | EnumTabName): T | null
{
    return document.getElementById(id) as T | null;
}

/**
 * 透過 EnumCssClassSelector 查詢單一元素
 * Query single element by EnumCssClassSelector
 */
export function querySelectorByClass<T extends HTMLElement>(classSelector: EnumCssClassSelector, suffix?: string): T | null
{
    return document.querySelector<T>(`.${classSelector}${suffix ?? ''}`);
}

/**
 * 透過 EnumCssClassSelector 查詢所有匹配元素
 * Query all elements by EnumCssClassSelector
 */
export function querySelectorAllByClass<T extends HTMLElement>(classSelector: EnumCssClassSelector, suffix?: string): NodeListOf<T>
{
    return document.querySelectorAll<T>(`.${classSelector}${suffix ?? ''}`);
}
```

### 使用範例

```typescript
// 基本元素查詢
const searchResults = querySelectorById<HTMLDivElement>(EnumWebviewElemId.searchResults);

// 帶偽類選擇器
const checkedRadio = querySelectorByClass<HTMLInputElement>(
    EnumCssClassSelector.ideSourceRadio,
    ':checked'
);

// Tab 切換邏輯 - 使用業務語義符
ALL_TAB_NAMES.forEach(tabName => {
    const el = querySelectorById<HTMLDivElement>(tabName);
    el?.classList.toggle('active', tabName === currentTab);
});
```

### 架構級別優勢

1. **單一事實來源** - 所有選擇器定義集中於 Enum 文件，修改一處全局生效
2. **編譯期保證安全** - TypeScript 編譯器會捕捉對不存在的 Enum 值的引用
3. **可測試性和隔離性** - 業務邏輯可獨立於 DOM 環境進行單元測試
4. **IDE 支援與 DX** - 自動完成、重構支援、導航功能提升開發效率
5. **可發現性** - 新開發者可快速找到所有可用選擇器

### 命名規範

| 類型 | 命名模式 | 範例 | 職責層級 |
| :--- | :--- | :--- | :--- |
| **DOM ID** | `Enum{Name}ElemId` | `EnumWebviewElemId` | 物理定位器（底層） |
| **CSS 類別** | `Enum{Name}ClassSelector` | `EnumCssClassSelector` | 物理定位器（底層） |
| **Tab/狀態** | `Enum{Name}` (獨立) | `EnumTabName` | 業務語義符（高階） |

### HTML & JSX 整合（重要！維護難度更高）

**為什麼這特別重要**：

許多開發者只關注 JavaScript 邏輯代碼的重構，卻忽略了 **HTML/JSX 模板層**的硬編碼問題。事實上，**HTML/JSX 的維護難度往往比 JS 代碼更高**：

- **缺乏類型保護**：JSX 中的 `id="sync"` 不會經過 TypeScript 編譯器檢查，拼寫錯誤只能在運行時發現
- **跨文件引用不透明**：JS 代碼可以追蹤變量引用，但 HTML 中的字串與邏輯代碼之間沒有顯式連結，修改時極易遺漏
- **視覺契約層的語義斷裂**：HTML/JSX 是前端應用程式的**視覺契約層**。在這一層直接使用硬編碼字串，會導致語義斷裂與執行期炸彈

#### 完整頁面結構

```jsx
// ❌ 硬編碼
<div id="sync" className="tab-content">
    <input id="searchInput" />
</div>

// ✅ 使用 Enum
<div id={EnumTabName.sync} className="tab-content">
    <input id={EnumElemId.searchInput} />
</div>
```

#### 導航組件

```typescript
// ❌ 之前 - 硬編碼 Tab 名稱 / Before - Hardcoded tab names
export function SettingsNavigation()
{
  return (
    <>
      <button className={`tab${activeTab === 'sync' ? ' active' : ''}`}
        onClick={() => setActiveTab('sync')}>Sync</button>
      <button className={`tab${activeTab === 'values' ? ' active' : ''}`}
        onClick={() => setActiveTab('values')}>Values</button>
    </>
  );
}

// ✅ 之後 - 使用 EnumTabName / After - Using EnumTabName
export function SettingsNavigation()
{
  return (
    <>
      {ALL_TAB_NAMES.map(tabName => (
        <button
          key={tabName}
          className={`tab${activeTab.value === tabName ? ' active' : ''}`}
          onClick={() => { activeTab.value = tabName; }}
        >
          {getTabLabel(tabName)}
        </button>
      ))}
    </>
  );
}
```

---

## 類成員訪問修飾符最佳實踐

### 預設使用 `protected` 而非 `private`

除非有特殊需求或使用者明確要求，否則**不建議使用 `private`**。建議**預設使用 `protected`** 來處理非公開成員。

#### 原因

- **支援內部繼承**：當類別需要被繼承時（即使是內部繼承），`protected` 允許子類別訪問父類別的成員，而 `private` 會完全阻斷訪問
- **避免重構時的破壞性變更**：若日後需要將類別擴展為可繼承，從 `private` 改為 `protected` 是一個破壞性變更
- **TypeScript 的軟性限制**：TypeScript 的 `private` 僅在編譯期檢查，運行時仍可訪問；相比之下，`protected` 提供了合理的封裝同時保留擴展彈性

#### 範例

```typescript
// ❌ 不建議：過度限制，阻斷繼承可能性
class DataProcessor {
    private cache = new Map<string, unknown>();
    private logger = console;

    process(data: unknown) {
        this.logger.log('Processing...');
        // 子類別無法訪問 this.cache 和 this.logger
    }
}

// ✅ 建議：保留繼承擴展的彈性
class DataProcessor {
    protected cache = new Map<string, unknown>();
    protected logger = console;

    process(data: unknown) {
        this.logger.log('Processing...');
        // 子類別可以正常訪問和覆寫這些成員
    }
}

// 內部繼承時可正常運作
class ExtendedDataProcessor extends DataProcessor {
    async processAsync(data: unknown) {
        // 可以訪問父類別的 protected 成員
        this.logger.log('Async processing...');
        const cached = this.cache.get('key');
        // ...
    }
}
```

#### 例外情況

以下情況**仍可考慮使用 `private`**：

1. **嚴格封裝需求**：當成員完全是內部實作細節，且確定永遠不會被繼承類別需要時
2. **明確的設計意圖**：當團隊有明確約定，特定成員絕對不應被覆寫或訪問時

> **總結**：`protected` 是更安全的預設選擇，它在封裝與擴展性之間取得平衡，避免因過度限制而導致日後重構困難。

---

## React State/Ref/Memo 判定指南

📚 **完整指南**：[React State/Ref/Memo 判定指南 - 數據流判定矩陣、詳細判定標準、重構實戰流程與總結建議](./references/react/react-state-ref-memo-decision-guide.md)

- **判定矩陣**：State（驅動者）/ RefObject（存儲器）/ `IRefObjectMaybe<T>`（配置項）/ Memo（派生者）
- 📚 **完整案例**：[useFacilityPointBlocksData 完整 Before/After 與 ManualLocationHandler 錯誤判斷案例](./references/react/react-state-ref-memo-refactoring.md)

---

## React 組件重構模式

📚 **完整指南**：[React 組件重構模式 - 組件提取、條件渲染、參數傳遞優化等實用技巧](./references/react/react-component-refactoring-patterns.md)

涵蓋：組件提取與抽象化、條件渲染重構、參數傳遞優化、CSS 變數優化、組件組合與自定義 Hook 抽象。

📚 **延伸案例參考**：
- [Ant Design 主題系統架構重構 - 從動態計算到預生成架構的優化實踐](./references/react/antd/theme-system-architecture-refactoring.md)

---

## Storybook 重構模式

📚 **完整指南**：[Storybook 重構指南 - 公用 Decorator、同源根 Decorator、共用樣式載入與 fixture 資料抽離](./references/react/storybook/storybook-decorator-fixture-refactoring.md)

- **抽離公用 Decorator 與同源根 Decorator**：將重複的故事包裝抽離為公用 Decorator；推薦建立（或以工廠繼承）單一同源的根 Decorator，讓所有 Decorator／Story 從同一個樣式入口、同一個根 class 起算
- **在根 Decorator 引用公用樣式**：token／全域樣式／story 工具類統一由根 Decorator 檔案載入——避免「定義了卻沒效果」（Storybook 不渲染 `App.tsx`）與「效果不完整」（包裝節點破壞佈局條件）
- **fixture 分類抽離**：展示資料**優先採用共同的 fixtures 路徑**（`src/stories/fixtures/`）作為預設位置——查找統一、跨組件共用；僅組件專屬資料放本地 `stories/fixtures/`；依領域分檔、依情境命名 export，以 `args` 引用；Decorator 只管環境，story 不內聯資料
- **多級 `meta.title` 分類**：以顯式且統一的多級架構（領域／分類／組件...，**深度 5 級以內**）整理側邊欄——避免 title 缺省或不一致導致難以找尋組件，也避免層級過深、單項資料夾造成過度碎片化；story 案例由 export 表達、檔案路徑與 title 對齊

---

## CSS 重構模式

📚 **完整指南**：[CSS 重構指南 - 抽離共用樣式值、作用域覆寫、共用 class/mixin 組合等實用模式](./references/css/css-refactoring-guide.md)

- **抽離共用樣式值**：將多個選擇器重複的字面值（濾鏡、陰影、顏色...）重構為單一 CSS 自訂屬性（或 SCSS `$` 變數），在樣式層級建立 SSoT——改一次、全域同步，避免修改樣式或追加新特效時缺漏同步更新
- 涵蓋：抽離判斷準則、命名慣例、基礎層/特效層拆分、作用域覆寫、SCSS `$` vs CSS `var()`、常見陷阱與重構步驟

---

## 錯誤處理與重構模式

📚 **完整案例參考**：[React 組件重構模式 - 組件提取、條件渲染、參數傳遞優化等實用技巧](./references/react/react-component-refactoring-patterns.md)

### 概念

將分散的錯誤處理邏輯重構為統一的錯誤處理模式，提升代碼的健壯性和可維護性。

### 重構前：分散的錯誤處理

```typescript
// ❌ 錯誤處理邏輯分散，缺乏一致性
async function fetchUserData(userId: string) {
    try {
        const user = await fetchUser(userId);
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
}

async function fetchUserProfile(userId: string) {
    try {
        const profile = await fetchProfile(userId);
        return profile;
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        return null;
    }
}
```

### 重構後：統一錯誤處理

```typescript
// ✅ 統一的錯誤處理模式
interface IApiError {
    code: string;
    message: string;
    details?: unknown;
}

type TResult<T> =
    | { success: true; data: T }
    | { success: false; error: IApiError };

async function safeApiCall<T>(
    apiCall: () => Promise<T>,
    context: string
): Promise<TResult<T>> {
    try {
        const data = await apiCall();
        return { success: true, data };
    } catch (error) {
        const apiError: IApiError = {
            code: 'API_ERROR',
            message: `Failed to ${context}`,
            details: error
        };

        console.error(`${context} error:`, apiError);
        return { success: false, error: apiError };
    }
}

// 使用統一的錯誤處理
async function fetchUserData(userId: string) {
    const result = await safeApiCall(() => fetchUser(userId), 'fetch user');
    return result.success ? result.data : null;
}

async function fetchUserProfile(userId: string) {
    const result = await safeApiCall(() => fetchProfile(userId), 'fetch profile');
    return result.success ? result.data : null;
}
```

### 收益

- **一致性**：所有 API 調用使用相同的錯誤處理模式
- **類型安全**：明確的成功/失敗類型定義
- **可追蹤**：統一的錯誤日誌格式
- **可擴展**：容易添加重試、降級等邏輯

---

## 數據驗證重構模式

### 概念

將分散的驗證邏輯重構為可重用的驗證器模式，提升代碼的可重用性和類型安全性。

### 重構前：內聯驗證

```typescript
// ❌ 驗證邏輯分散，難以重用
function createUser(userData: any) {
    if (!userData.name || typeof userData.name !== 'string') {
        throw new Error('Name is required and must be string');
    }

    if (!userData.email || !userData.email.includes('@')) {
        throw new Error('Valid email is required');
    }

    if (userData.age && (typeof userData.age !== 'number' || userData.age < 0)) {
        throw new Error('Age must be a positive number');
    }

    // 創建用戶邏輯...
}
```

### 重構後：驗證器模式

```typescript
// ✅ 可重用、可組合的驗證規則
type IValidationRule<T> = (value: T) => string | null;

// 選填欄位（undefined）直接略過驗證
function validate<T>(value: T | undefined, rules: IValidationRule<T>[]): string[] {
    if (value === undefined) return [];
    return rules.flatMap(rule => {
        const error = rule(value);
        return error ? [error] : [];
    });
}

// 規則定義一次，處處重用
const required = (message: string): IValidationRule<string> =>
    value => (value ? null : message);

const email: IValidationRule<string> =
    value => (value.includes('@') ? null : 'Invalid email format');

const positiveNumber = (message: string): IValidationRule<number> =>
    value => (value > 0 ? null : message);

interface IUserData {
    name: string;
    email: string;
    age?: number;
}

function createUser(userData: IUserData) {
    const errors = [
        ...validate(userData.name, [required('Name is required')]),
        ...validate(userData.email, [required('Email is required'), email]),
        ...validate(userData.age, [positiveNumber('Age must be positive')])
    ];

    if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // 創建用戶邏輯...
}
```

### 收益

- **可重用性**：驗證規則可在多個地方使用
- **組合性**：可以組合多個驗證規則
- **類型安全**：明確的輸入輸出類型
- **可測試性**：每個驗證規則可獨立測試

---

## Barrel Index 避免規則

### 概述

**Barrel index**（又稱 barrel file 或 index barrel）是一種模式：建立一個中央的 `index.ts` 文件，重新導出（re-export）多個模組，以簡化導入路徑。

#### 什麼是 Barrel Index？

```typescript
// ❌ Barrel file 模式 (index.ts)
// 不從特定文件導入，而是透過中央文件重新導出所有內容
export * from './UserService';
export * from './OrderService';
export * from './ProductService';

// 使用方式 - 路徑變短但變得模糊
import { UserService, OrderService } from './services';  // 從 index.ts 導入
```

```typescript
// ✅ 直接從源文件導入（推薦）
import { UserService } from './services/UserService';
import { OrderService } from './services/OrderService';
import { ProductService } from './services/ProductService';
```

### 為什麼要避免 Barrel Index？

#### 1. **隱藏的依賴關係**

Barrel file 遮蔽了實際的模組依賴，使得難以理解某個文件真正依賴了哪些內容。

```typescript
// ❌ 使用 barrel - 不清楚實際使用了哪些依賴
import { UserService, OrderService } from './services';

// ✅ 不使用 barrel - 明確、清晰的依賴
import { UserService } from './services/UserService';
import { OrderService } from './services/OrderService';
```

#### 2. **Tree Shaking 問題**

Barrel exports 會干擾 Webpack、Rollup 或 ESBuild 等 bundler 的 tree shaking，可能導致 bundle size 增加，因為 bundler 無法輕易消除未使用的 exports。

```typescript
// 即使你只使用 UserService，barrel file 可能導致
// 所有 services 都被包含在 bundle 中
import { UserService } from './services';  // 可能也包含了 OrderService、ProductService！
```

#### 3. **IDE 與工具限制**

- **Find All References**：IDE 無法追蹤符號實際來自哪個特定文件
- **Rename Refactoring**：全局重命名可能意外破壞東西
- **Navigation**：「Go to Definition」帶你到 barrel file 而非實際源文件
- **Circular Dependency Detection**：更難檢測循環依賴

#### 4. **編譯效能**

即使只使用單一模組，TypeScript 仍需要處理所有 re-exports，這可能減緩大型專案的編譯速度。

#### 5. **維護問題**

當模組被移除或重新命名時，barrel file 必須同步更新，造成額外的維護負擔和過時參考的風險。

### 規則：直接從源路徑導入

**除非使用者或專案明確要求，否則不要創建或使用 barrel index files。所有模組應直接從原始路徑載入。**

```typescript
// ❌ 避免 - 使用 barrel index
import { UserService } from '../services';  // 路徑模糊

// ✅ 推薦 - 明確的源路徑
import { UserService } from '../services/UserService';
```

### 何時 Barrel Index 可能可接受

只有在以下情況**明確要求**時才使用 barrel index：

1. **Public API 設計**：當設計函式庫的公開接口時，希望提供乾淨、統一的進入點
2. **專案慣例**：當專案有 established convention 要求使用 barrel files
3. **向後兼容**：當維護已廣泛使用 barrel files 的舊有程式碼時

即使在此情況下，也應仔細權衡取捨。

### 最佳實踐：明確導入

```typescript
// ✅ 清晰、明確的導入 - 推薦風格
import { UserService } from './services/UserService';
import { OrderService } from './services/OrderService';
import { ProductService } from './services/ProductService';

// ✅ 對於同一模組的多個導入，使用 namespace import 或 named imports
import * as UserModule from './services/UserService';
import { UserService, IUserRepository } from './services/UserService';
```

### 遷移策略

#### 漸進式遷移（推薦用於已有大量 barrel files 的舊有程式碼）

如果專案已經廣泛使用 barrel files，避免一次性大規模重寫。改用漸進式方式：

1. **新模組**：不要建立新的 barrel files，也不要向現有的 barrel files 添加新的 exports
2. **重構時**：當你修改某個文件時，優先將其 barrel imports 轉換為直接源導入
3. **不要強制遷移**：不要修改未被主動修改的導入 — 讓它自然發生
4. **最終清理**：一旦所有導入都已轉換，刪除不再需要的 barrel files

#### 完整遷移（適用於新專案或小型程式碼庫）

如果專案是新的或夠小，可以一次性遷移：

1. **識別 barrel files**：找出所有僅重新導出的 `index.ts` 文件
2. **更新導入**：將 barrel imports 替換為直接源導入
3. **移除 barrel files**：刪除現已不需要的 barrel files

---

## TypeScript 6 升級與型別解析邊界情況 (Migration & Edge Cases)

### 概述

從 TypeScript 5.x 升級至 6+ 引入了更嚴格的型別檢查與模組解析。重構舊代碼時，需理解 TS6 如何處理泛型、模組路徑與隱式型別，優先採用自然推導，而非強制轉型。

### 1. `Uint8Array` 與 `ArrayBuffer` 的處理

**問題**：TS6 將 `Uint8Array` 改為泛型 `Uint8Array<T extends ArrayBufferLike>`。它嚴格區分 `Uint8Array` 與 `ArrayBuffer`，這破壞了 TS5 中將兩者互換使用的代碼。

#### ❌ 負面案例：強制 `.buffer` 轉換或錯誤的型別註記

```typescript
// ❌ 錯誤的回傳型別註記，迫使不必要的轉換
const stringToBuffer = (input: string): ArrayBuffer => {
   const buf = new Uint8Array(input.length);
   // ...
   return buf.buffer;  // 治標不治本
};

// ❌ 參數型別過窄，拒絕合法輸入
const base64Url = (buf: ArrayBuffer): string => { /* ... */ }
base64Url(arr.buffer); // 呼叫端被 .buffer 污染
```

#### ✅ 解決方案：讓型別自然流通

移除錯誤的型別註記，並為參數使用聯合型別。

```typescript
// ✅ 讓 TS 自然推導出 Uint8Array
const stringToBuffer = (input: string) => {
  const buf = new Uint8Array(input.length);
  return buf;
};

// ✅ 放寬參數型別
const base64Url = (buf: ArrayBuffer | Uint8Array): string => { /* ... */ }
```

> **注意**：像 `crypto.subtle.digest()` 這類 API 接受 `BufferSource`，因此 `Uint8Array` 可以直接傳入，不需要 `.buffer`。

### 2. 第三方套件的子路徑導入 (Subpath Imports)

**問題**：TS6 嚴格檢查子路徑導入的型別宣告。如果一個套件（如 `markdown-it`）僅為主模組提供型別，子路徑導入（如 `markdown-it/lib/token`）將會報錯。

#### ❌ 負面案例：自建 `declare module` 或假的 paths

```typescript
// ❌ 不要為第三方子路徑自建假的宣告模組
declare module 'markdown-it/lib/token' { /* ... */ }
```

#### ✅ 解決方案：從主模組導入

確保 `tsconfig.json` 的 `"types"` 中包含 `["package-name"]`，並從主要入口解構導入所需的型別。

```typescript
// ✅ 改從實際匯出型別的主模組導入
import MarkdownIt, { StateBlock, StateInline, Token } from 'markdown-it';
```

### 3. 安全的 `Blob` 建構子轉型

**問題**：`BlobPart[]` 預期接收 `BufferSource`，但 `Uint8Array<ArrayBufferLike>` 與 `ArrayBufferView<ArrayBuffer>` 並不嚴格相容，因為它們的 `.buffer` 屬性型別有差異。

#### ✅ 解決方案：安全的 `as any`

```typescript
const body: (Uint8Array | ArrayBuffer)[] = [];
// ...
// ✅ 安全的繞過方式：兩者在運行時都是合法的 BlobParts
return new Blob(body as any).arrayBuffer();
```

### 4. `http` 模組事件回呼的型別推導

**問題**：Node 的 `http.createServer()` 回呼中 `req`/`res` 顯示為 `any`，是因為沒有正確載入 `@types/node`，導致推導失敗。

#### ✅ 解決方案：明確引入 Node 型別

不要手動為 `req`/`res` 標註型別。相反，請在 `tsconfig.json` 的 `compilerOptions.types` 加上 `"node"`，讓 TS 能夠從 `createServer()` 自動推導。

📚 **完整案例參考**：[TypeScript 6 Migration & Source Changes](./references/ts6-migration.md)

---

## 參考資源

- [Martin Fowler - Refactoring](https://refactoring.com/)
- [Single Source of Truth 設計模式](https://en.wikipedia.org/wiki/Single_source_of_truth)
- [TypeScript Design Patterns](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Functional Error Handling in TypeScript](https://dev.to/gcanti/functional-error-handling-in-typescript-2g5o)
- [TypeScript Enum 文件](https://www.typescriptlang.org/docs/handbook/enums.html)

### 相關技能

- [code-refactoring-expert-typescript](../code-refactoring-expert-typescript/SKILL.md) - 核心重構原則
- **數值/計算邏輯的 SSOT**：在計算密集型專案中將瑣碎運算抽離為共用工具，請見核心指南的 **規範 B-2**（`percent.ts` 模式）。
- [typescript-unimplemented-handler](../typescript-unimplemented-handler/SKILL.md) - 處理 TypeScript 限制

### 延伸閱讀

- [外部 API 類型安全封裝模式](./references/external-api-type-safe-wrapper.md) - 將鬆散類型的外部 API（如 VS Code Memento）封裝為嚴格類型的內部接口
- [DOM Selector Enum Pattern - 完整參考](./references/dom-selector-enum-pattern.md) - 詳細的 HTML/JSX 整合範例與進階應用
- [CSS 重構指南](./references/css/css-refactoring-guide.md) - 將共用樣式值抽離為 CSS 自訂屬性，讓跨選擇器樣式保持同步 (SSoT)
- [Storybook 重構指南](./references/react/storybook/storybook-decorator-fixture-refactoring.md) - 公用 Decorator、同源根 Decorator 與共用樣式載入、fixture 展示資料分類抽離、多級 meta.title 分類整理
