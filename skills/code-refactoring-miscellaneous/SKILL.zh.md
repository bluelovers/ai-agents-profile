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
  (5) React/JSX/HTML/DOM 特定考量，
  以及 (6) 跨領域關注點。
  當使用者詢問「雜項重構」、「邊緣案例」、「進階模式」或核心指南需要補充時使用此 Skill。
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

---

## Async/Await 邊緣案例

### 平行執行 vs 循序執行

**問題**：獨立非同步操作的不必要循序執行。

#### ❌ 反模式：循序執行獨立呼叫

```typescript
async function processUserData(userId: string) {
    const user = await fetchUser(userId);      // 等待完成
    const profile = await fetchProfile(userId); // 等待完成
    const settings = await fetchSettings(userId); // 等待完成

    return { user, profile, settings };
}
```

#### ✅ 解決方案：使用 Promise.all 平行執行

```typescript
async function processUserData(userId: string) {
    const [user, profile, settings] = await Promise.all([
        fetchUser(userId),
        fetchProfile(userId),
        fetchSettings(userId)
    ]);

    return { user, profile, settings };
}
```

#### ✅ 進階：使用 Promise.allSettled 處理部分失敗

```typescript
async function processUserDataSafe(userId: string) {
    const results = await Promise.allSettled([
        fetchUser(userId),
        fetchProfile(userId),
        fetchSettings(userId)
    ]);

    return {
        user: results[0].status === 'fulfilled' ? results[0].value : null,
        profile: results[1].status === 'fulfilled' ? results[1].value : null,
        settings: results[2].status === 'fulfilled' ? results[2].value : null,
        errors: results.filter(r => r.status === 'rejected').map(r => r.reason)
    };
}
```

### 非同步產生器重構

**問題**：處理大型資料集時將所有資料載入記憶體。

#### ❌ 反模式：載入所有資料

```typescript
async function processAllRecords() {
    const allRecords = await fetchAllRecords(); // 可能達百萬筆！
    for (const record of allRecords) {
        await processRecord(record);
    }
}
```

#### ✅ 解決方案：非同步產生器

```typescript
async function* processRecordsGenerator(): AsyncGenerator<Record> {
    let cursor = null;
    do {
        const { records, nextCursor } = await fetchRecordsBatch(cursor);
        for (const record of records) {
            yield record;
        }
        cursor = nextCursor;
    } while (cursor);
}

async function processAllRecords() {
    for await (const record of processRecordsGenerator()) {
        await processRecord(record);
    }
}
```

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
// ✅ 使用 Enum - 類型安全、可維護
import { EnumWebviewElemId, EnumCssClassSelector, EnumTabName } from './scripts/elem-get';

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
// ❌ 之前 - 硬編碼 ID / Before - Hardcoded IDs
<div id="sync" className="tab-content active">
  <div className="section">
    <h2>Search & Sync Settings</h2>
    <div className="search-container">
      <input type="text" className="search-input" id="searchInput" />
    </div>
    <div id="searchResults" className="results-container">
      {/* 搜尋結果 / Search results */}
    </div>
  </div>
</div>

// ✅ 之後 - 使用 Enum / After - Using Enums
<div id={EnumTabName.sync} className="tab-content active">
  <div className="section">
    <h2>Search & Sync Settings</h2>
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        id={EnumWebviewElemId.searchInput}
      />
    </div>
    <div id={EnumWebviewElemId.searchResults} className="results-container">
      {/* 搜尋結果 / Search results */}
    </div>
  </div>
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

這是一份針對 React 重構時，關於 **State**、**RefObject** 與 **`IRefObjectMaybe<T>` (Value/RefObject)**、**Memo** 的選擇與判定指南。你可以將這套邏輯應用在開發 Hook 或複雜組件的決策中。

---

## 🟢 React 數據流判定矩陣 (Decision Matrix)

| 數據類型 | 變動時是否需要 UI 更新？ | 是否作為 Hook 依賴 (Dependency)？ | 核心定位 |
| :--- | :--- | :--- | :--- |
| **State** (`useState`) | **是** | 是 | **驅動者 (Driver)**：改變它，就是為了讓畫面或邏輯重新跑一遍。 |
| **RefObject** (`useRef`) | **否** | 否 | **存儲器 (Storage)**：改變它，只是為了「記住」值，不希望驚動 UI。 |
| **`IRefObjectMaybe<T>`** (通用型) | **視傳入情況而定** | 否 (通常不放) | **配置項 (Config)**：提供彈性，讓外部決定要不要驅動更新。 |
| **Memo** (`useMemo`) | **是** (計算結果變化時) | 是 (被記憶化的計算) | **派生者 (Deriver)**：從其他數據推導計算，保持引用穩定。 |

---

## 🛠️ 詳細判定指南

### 1. 什麼時候該用 State (`useState`)？

當該數據的「值」是 **UI 的一部分**，或 **邏輯的觸發開關** 時。
*   **關鍵問題**：如果這個值變了，使用者應該看到變化嗎？或是某個 Hook（如 `useSWR`, `useEffect`）應該立刻重新執行嗎？
*   **範例**：
    *   API 回傳的資料 (`data`)。
    *   分頁、搜尋關鍵字。
    *   控制 SWR 請求的 `activeKey`。
*   **重構信號**：如果你發現某個變數改變後，必須呼叫另一個 `set` 或觸發 `render` 才能生效，它就必須是 State。

### 2. 什麼時候該用 RefObject (`useRef`)？

當該數據是 **純邏輯判定** 或 **實例引用**，且不直接參與渲染時。
*   **關鍵問題**：我是否需要「跨渲染週期」記住這個值，但又不希望值改變時導致畫面閃爍或多餘重繪？
*   **範例**：
    *   **邊界快取**：如你案例中的 `boundsRef`，只用來判定「要不要發請求」。
    *   **計時器 ID**：`setTimeout` 的 ID。
    *   **DOM 元素**：`inputRef`。
    *   **上一次的 Props**：用來做 PrevProps 比較。
*   **重構信號**：如果你發現某個 `useState` 產生的值，在程式碼中只出現在 `if` 判斷裡，從來沒出現在 JSX 中，請考慮將它重構成 RefObject 以優化效能。

### 3. 什麼時候該用 `IRefObjectMaybe<T>` (`T | RefObject<T>`)？

當你在寫一個 **通用 Hook (Utility Hook)**，且希望由 **外部調用者** 決定數據的「反應式特性」時。
*   **判定情境**：
    *   **傳入 Value**：外部希望「只要這個設定一變，Hook 就立刻重跑」。
    *   **傳入 RefObject**：外部希望「我改設定時 Hook 先別動，等你下次因為其他原因（如位置變動）重跑時再順便讀取我」。
*   **範例**：
    *   `ignoreCacheCheck` 開關。
    *   自定義的 `enabled` 旗標。
*   **重構信號**：如果你正在寫一個 Library 給別人用，或者這個 Hook 會在很多不同場景出現，使用 `IRefObjectMaybe<T>` + `unwrapRefObject` 能提供最高水平的彈性。

### 4. 什麼時候該用 Memo (`useMemo`)？

當該數據是 **可以從其他 State/Props 推導出來的計算結果**，且 **需要保持引用穩定** 時。
*   **關鍵問題**：
    *   這個值是否只是其他數據的「轉換」或「篩選」結果？
    *   是否需要在多次渲染間保持相同的引用（避免子組件不必要的 re-render）？
    *   計算成本是否較高，值得記憶化？
*   **範例**：
    *   **API 數據的轉換**：如 `fillFacilityPointData(batchData?.data)`，將原始 API 響應轉換為組件需要的格式。
    *   **派生狀態的封裝**：將多個相關數據封裝成單一回傳物件，確保引用穩定。
    *   **過濾/排序後的列表**：從原始列表派生的過濾結果。
    *   **計算屬性**：複雜的數據轉換或聚合。
*   **重構信號**：
    *   如果你發現自己為了「組裝回傳物件」而創建多個獨立的 `useState`，這些都應該用 `useMemo` 取代。
    *   如果子組件因為父組件傳入的物件引用變化而過度 re-render，使用 `useMemo` 保持引用穩定。

---

## 🏗️ 重構實戰流程 (Refactoring Workflow)

當你看到一段「笨重」的代碼（如你原本那堆 `useState`），請按照以下步驟清理：

### Step 1: 找出「真．驅動源」

找出那個**一旦改變，全世界都要跟著動**的變數。
*   在你的案例中，是 `activeKey`。它動了，SWR 就動。

### Step 2: 降級「靜態記憶」為 RefObject

找出那些**只在 `onSuccess` 寫入、只在 `if` 裡讀取**的變數。
*   例如 `matchedRangeBounds`, `triggerThresholdRangeBounds`。這些本質上是「輔助判斷的記憶」，不應該是驅動 UI 的 State。

### Step 3: 處理「外部配置」為 `IRefObjectMaybe<T>`

處理那些從參數傳進來的開關。
*   使用 `unwrapRefObject(config)` 在 Effect 內部「拆箱」。

### Step 4: 轉化「派生數據」為 Memo

找出那些**可以從 API 結果推導出來**的值。
*   例如 `categories`、`matchedRangeBounds`、`triggerThresholdRangeBounds`。這些都只是 `batchData` 的一部分，不需要自己的 `useState`。
*   **使用 `useMemo` 的好處**：
    *   確保回傳物件的 **引用穩定**（Referential Stability），避免子組件不必要的 re-render
    *   將多個相關數據封裝成單一回傳物件，簡化接口
    *   計算邏輯只在依賴項變化時執行，避免重複計算
*   **實作模式**：
    ```typescript
    return useMemo(() => ({
        data: fillFacilityPointData(batchData?.data),
        matchedRangeBounds: batchData?.matchedRangeBounds ?? null,
        triggerThresholdRangeBounds: batchData?.triggerThresholdRangeBounds ?? null,
        blockScanRangeBounds: batchData?.blockScanRangeBounds ?? null,
        categories: batchData?.categories ?? [],
        error,
        isLoading,
    }), [batchData, error, isLoading]);
    ```

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

## React 組件重構模式

### 概念

將 React 組件中的複雜邏輯重構為更清晰、可維護的模式。

### 組件提取與抽象化

**重構前**：內嵌組件依賴外部變數
```typescript
const BottomListPanel = () => (
    <Flex vertical style={{ background: token.colorBgContainer }}>
        <DataList data={data} onClick={handleClick} />
    </Flex>
);
```

**重構後**：獨立組件明確依賴
```typescript
interface IBottomListPanelProps {
    data: IDataItem[];
    onItemClick: (item: IDataItem) => void;
    background?: string;
}

const BottomListPanel = (props: IBottomListPanelProps) => (
    <Flex vertical style={{ background: props.background }}>
        <DataList data={props.data} onClick={props.onItemClick} />
    </Flex>
);
```

### 條件渲染重構

**重構前**：重複的 JSX 結構
```typescript
{displayMode === 'sidebar' ? (
    <Layout.Content>...</Layout.Content>
) : (
    <Layout style={{ flex: 1 }}>
        <Layout.Content>...</Layout.Content>
        <BottomPanel />
    </Layout>
)}
```

**重構後**：抽象佈局組件
```typescript
function ConditionalLayout(props: IConditionalLayoutProps) {
    if (props.displayMode !== EnumDisplayMode.SIDEBAR) {
        return (
            <Layout style={{ flex: 1 }}>
                {props.children}
                {props.bottomPanel}
            </Layout>
        );
    }
    return <>{props.children}</>;
}
```

### 參數傳遞優化

**重構前**：隱式依賴外部變數
**重構後**：明確的 props 傳遞，提升組件獨立性

### CSS 變數使用優化

**重構前**：直接使用 token 值
**重構後**：使用 CSS 變數支援動態主題切換

### 組件組合模式

**重構前**：複雜的單一組件
**重構後**：使用組件組合替代繼承

### Hook 抽象模式

**重構前**：組件內複雜邏輯
**重構後**：提取為自定義 Hook

### 收益

- **可重用性**：組件和邏輯可在多個地方使用
- **可維護性**：邏輯分離，易於修改
- **類型安全**：明確的輸入輸出類型
- **可測試性**：每個部分可獨立測試

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
// ✅ 可重用的驗證器模式
interface IValidationRule<T> {
    validate: (value: T) => string | null;
    required?: boolean;
}

interface IValidator<T> {
    rules: IValidationRule<T>[];
    validate: (value: T) => string[];
}

// 創建驗證器工廠
function createValidator<T>(rules: IValidationRule<T>[]): IValidator<T> {
    return {
        rules,
        validate: (value: T): string[] => {
            const errors: string[] = [];

            for (const rule of rules) {
                if (!rule.required && (value === undefined || value === null)) {
                    continue;
                }

                const error = rule.validate(value);
                if (error) {
                    errors.push(error);
                }
            }

            return errors;
        }
    };
}

// 常用驗證規則
const ValidationRules = {
    required: (message: string): IValidationRule<string> => ({
        validate: (value) => !value ? message : null,
        required: true
    }),

    email: (): IValidationRule<string> => ({
        validate: (value) => {
            if (!value) return null;
            return !value.includes('@') ? 'Invalid email format' : null;
        }
    }),

    positiveNumber: (message: string): IValidationRule<number> => ({
        validate: (value) => {
            if (value === undefined) return null;
            return typeof value !== 'number' || value < 0 ? message : null;
        }
    })
};

// 使用驗證器
const userValidator = createValidator({
    name: ValidationRules.required('Name is required'),
    email: [ValidationRules.required('Email is required'), ValidationRules.email()],
    age: ValidationRules.positiveNumber('Age must be positive')
});

interface IUserData {
    name: string;
    email: string;
    age?: number;
}

function createUser(userData: IUserData) {
    const errors = [
        ...userValidator.validate(userData.name),
        ...userValidator.validate(userData.email),
        ...userValidator.validate(userData.age)
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

## 📝 總結建議 (Pro Tips)

> **"State 是為了觸發，RefObject 是為了記住。"**

*   如果你想要 **Reactive (反應式)** → **State**。
*   如果你想要 **Performance (效能/靜音)** → **RefObject**。
*   如果你想要 **Polymorphic (多態/通用)** → **`IRefObjectMaybe<T>`**。
*   如果你想要 **Derived (派生計算)** → **useMemo**。

你在重構 `useFacilityPointBlocksData` 時，將原本散落的 5 個 `useState` 壓縮成 1 個 `activeKey` (State) + 1 個 `boundsRef` (Ref) + 1 個 `useMemo` (Derived Data)，這正是這套指南最完美的實踐。

- [React State/Ref/Memo 重構案例](./references/react/react-state-ref-memo-refactoring.md) - `useFacilityPointBlocksData` 完整重構案例，展示 State + RefObject + useMemo 的優化模式

---

## 參考資源

- [Martin Fowler - Refactoring](https://refactoring.com/)
- [Single Source of Truth 設計模式](https://en.wikipedia.org/wiki/Single_source_of_truth)
- [TypeScript Design Patterns](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Functional Error Handling in TypeScript](https://dev.to/gcanti/functional-error-handling-in-typescript-2g5o)
- [TypeScript Enum 文件](https://www.typescriptlang.org/docs/handbook/enums.html)

## 相關技能

- [code-refactoring-expert-typescript](../code-refactoring-expert-typescript/SKILL.md) - 核心重構原則
- [typescript-unimplemented-handler](../typescript-unimplemented-handler/SKILL.md) - 處理 TypeScript 限制

## 延伸閱讀

- [外部 API 類型安全封裝模式](./references/external-api-type-safe-wrapper.md) - 將鬆散類型的外部 API（如 VS Code Memento）封裝為嚴格類型的內部接口
- [DOM Selector Enum Pattern - 完整參考](./references/dom-selector-enum-pattern.md) - 詳細的 HTML/JSX 整合範例與進階應用
