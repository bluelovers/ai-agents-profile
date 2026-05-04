---
name: code-refactoring-miscellaneous
description: >-
  TypeScript/Node.js 重構的雜項案例與概念，補充核心重構指南。
  涵蓋額外的模式、邊緣案例和專門的重構技術，這些內容不適合放在主要分類中。
  適用於：
  (1) 處理複雜的重構場景，
  (2) 解決標準指南未涵蓋的程式碼異味，
  (3) 進階 TypeScript 模式，
  (4) Node.js 特定考量，
  以及 (5) 跨領域關注點。
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

- [DOM Selector Enum Pattern - 完整參考](./references/dom-selector-enum-pattern.md) - 詳細的 HTML/JSX 整合範例與進階應用

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
