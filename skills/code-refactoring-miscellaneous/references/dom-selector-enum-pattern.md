---
title: 🧠 DOM Selector Enum Pattern - 高階架構模式
description: Refactoring hardcoded selectors into unified Enums, elevating UI element management from a 'lookup tool' to a 'semantic contract'.
---

# 🌐 DOM Selector Enum Pattern：從定位器到語義合約的昇華

## 🎯 概述 / Overview
本規則定義了一個強大的設計模式，旨在將前端應用程式中分散且脆弱的**硬編碼 DOM 元素 ID** 與 **CSS 類別選擇器**重構為一套統一的 Enum 管理體系。這項工作不只是簡單地替換字串，更是將前端的「物理定位行為」提升到「業務語義狀態」管理的層級，建立整個應用程式的**單一事實來源 (Single Source of Truth, SoT)**。

## 🚨 問題情境 / Architectural Problem
當我們直接使用硬編碼字串來引用 UI 元素時（例如 `document.getElementById('searchResults')`），我們將以下幾項風險固化在代碼中：
1.  **低可維護性與高耦合 (High Coupling)：** 業務邏輯層被緊密耦合於底層的 DOM 定位細節。任何 UI 設計師對元素的微小變動（如 ID 名稱更改）都會導致全局的編譯期或運行時崩潰。
2.  **零編譯器安全檢查 (Zero Compile-Time Safety)：** 選擇器的拼寫錯誤只會在用戶操作到該界面時，才以一個難以追蹤的運行時錯誤表現出來。
3.  **缺乏開發者體驗 (Poor DX)：** IDE 無法提供自動完成（IntelliSense）或跨文件重構支援。

### 不良範例 / Bad Practice

```typescript
// ❌ 硬編碼 ID - 維護困難、容易出錯
const element = document.getElementById('searchResults');
const input = document.getElementById('searchInput') as HTMLInputElement;

// ❌ 硬編碼 CSS 類別選擇器
const radio = document.querySelector<HTMLInputElement>('.ide-source-radio:checked');
const checkbox = document.querySelector('.ide-checkbox');
const tabs = document.querySelector('.tabs');
```

```jsx
// ❌ JSX 中的硬編碼 ID - 同樣是風險來源
function SearchPanel() {
  return (
    <div id="searchPanel" className="panel active">
      <input type="text" id="searchInput" className="search-input" />
      <div id="searchResults" className="results-container">
        {/* 搜尋結果 */}
      </div>
    </div>
  );
}

// ❌ 與之對應的業務邏輯 - 字串完全獨立，無任何機制保證同步
function handleSearch() {
  const input = document.getElementById('searchInput');  // ← 這裡的 'searchInput'
  const results = document.getElementById('searchResults');  // ← 與 JSX 中的 id 是兩回事
  // ...
}
```

**具體問題：**
- 字串分散在多處，修改時需要全局搜尋替換
- 無法在編譯期檢查錯誤，只能在執行期發現
- 容易造成拼寫錯誤導致選擇器失效
- 更新或維護時不易查詢相關代碼分散在何處，容易遺漏造成重構後產生不一致

> **⚠️ 重要提醒：** 問題不僅僅存在於 JavaScript/TypeScript 程式碼中。**HTML 與 JSX 中的硬編碼 `id` 和 `className` 同樣是風險來源。** 當你在 JSX 中寫下 `<div id="sync">`，這個 `"sync"` 字串與 TypeScript 邏輯中的 `'sync'` 是兩處獨立的硬編碼。它們表面上「相同」，但本質上沒有任何機制保證一致性——這正是語義斷裂的根源。

## ✨ 解決方案：兩層級抽象與關注點分離 / The Two-Layer Abstraction Solution

為了解決上述耦合問題，我們必須區分兩種不同層次的識別符，並讓它們各自服務於不同的系統需求：**物理定位器 (Physical Locator)** 與 **業務語義符 (Semantic Contract)**。

### 🥇 第一層級：`EnumWebviewElemId` & `EnumCssClassSelector` - 物理錨點（The Physical Anchor）
*   **職責：** 定義 DOM 元素的 ID 與 CSS 類別的統一識別符，作為連接代碼與 HTML 的字串橋樑。
*   **性質：** **被動、物理的 (Passive, Physical)。** 它反映了 UI 層級的 *實體存在*。
*   **應用場景：** 僅用於底層 Helper Function，負責將抽象 Enum 轉換為瀏覽器可接受的 CSS Selector 字串 (`#id` 或 `.class`)。

### 🥈 第二層級：`EnumTabName` - 業務語義符（The Semantic Contract）
*   **職責：** 定義業務狀態與行為的語義識別符（如分頁名稱、操作模式），讓邏輯代碼獨立於 DOM 結構。
*   **性質：** **主動、穩定的 (Active, Stable)。** 它定義了整個業務流程的 *邏輯合約*。
*   **關鍵價值：關注點分離 (SoC)：** 核心業務邏輯（例如，切換 Tab 的函數）應該只引用 `EnumTabName`，而不需要知道該狀態最終會被哪個 ID 來渲染或查詢。這使我們將「*要達到什麼目的*」與「*如何找到它*」徹底分離。
*   **關於雙重角色的設計考量：** 當業務語義符的值**恰好等於**對應的物理 ID 時（如 `sync` 既是 Tab 名稱也是元素 ID），`EnumTabName` 可以**直接兼任**兩種職責。這是一種**有意識的設計簡化**，前提是：
    1.  該語義與 ID 存在穩定的一對一關係
    2.  該關係在可預見的未來不會改變
    3.  團隊明確知曉並接受此耦合

    若未來出現「同一語義對應多個 ID」或「ID 需動態變更」的情況，應立即引入明確的映射層（如 `EnumTabName → EnumWebviewElemId`）進行分離。

### 📝 實作範例 / Implementation Example

#### 1. Enum 定義 / Enum Definitions

```typescript
// scripts/elem-get.ts

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
  // ... 其他 ID
}

/**
 * CSS 類別選擇器列舉（單一事實來源）
 * CSS class selector enum (Single Source of Truth)
 */
export const enum EnumCssClassSelector
{
  /** 分頁導航容器 / Tab navigation container */
  tabs = 'tabs',
  /** IDE 項目元素 / IDE item element */
  ideItem = 'ide-item',
  /** IDE 勾選框 / IDE checkbox */
  ideCheckbox = 'ide-checkbox',
  /** IDE 來源單選按鈕 / IDE source radio button */
  ideSourceRadio = 'ide-source-radio',
}

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
  /** 匯出/匯入分頁 / Export/Import tab */
  exportImport = 'export-import',
}

/** 所有分頁的有序陣列 / Ordered array of all tabs */
export const ALL_TAB_NAMES: EnumTabName[] = [
  EnumTabName.sync,
  EnumTabName.values,
  EnumTabName.selected,
  EnumTabName.exportImport,
];
```

#### 2. Helper 函式實作 / Helper Functions Implementation

```typescript
/**
 * 將 EnumWebviewElemId 轉換為 CSS ID 選擇器字串（帶 # 前綴）
 * Convert EnumWebviewElemId to CSS ID selector string (with # prefix)
 * @param id - 元素 ID 列舉值 / Element ID enum value
 * @param suffix - 選擇器後綴 / Selector suffix
 * @returns CSS ID 選擇器字串 / CSS ID selector string
 */
export function getElemIdSelector(id: EnumWebviewElemId, suffix?: string): string
{
	return `#${id}${suffix ?? ''}`;
}

/**
 * 將 EnumCssClassSelector 轉換為 CSS 類別選擇器字串（帶 . 前綴）
 * Convert EnumCssClassSelector to CSS class selector string (with . prefix)
 * @param className - CSS 類別列舉值 / CSS class enum value
 * @param suffix - 選擇器後綴 / Selector suffix
 * @returns CSS 類別選擇器字串 / CSS class selector string
 */
export function getClassSelector(className: EnumCssClassSelector, suffix?: string): string
{
	return `.${className}${suffix ?? ''}`;
}

/**
 * 透過 EnumWebviewElemId 或 EnumTabName 查詢單一元素
 * Query single element by EnumWebviewElemId or EnumTabName
 * @param id - 元素 ID 列舉值或 Tab 名稱（當兼任元素 ID 時）/ Element ID enum value or Tab name (when it doubles as element ID)
 * @returns 查詢到的元素或 null / Queried element or null
 * @remarks 當 EnumTabName 兼任元素 ID 時可直接傳入，無需額外轉換
 */
export function querySelectorById<T extends HTMLElement>(id: EnumWebviewElemId | EnumTabName): T | null
{
	return document.getElementById(id) as T | null;
}

/**
 * 透過 EnumCssClassSelector 查詢單一元素
 * Query single element by EnumCssClassSelector
 * @param classSelector - CSS 類別列舉值 / CSS class enum value
 * @param suffix - 選擇器後綴 / Selector suffix
 * @returns 查詢到的元素或 null / Queried element or null
 */
export function querySelectorByClass<T extends HTMLElement>(classSelector: EnumCssClassSelector, suffix?: string): T | null
{
	return document.querySelector<T>(getClassSelector(classSelector, suffix));
}

/**
 * 透過 EnumCssClassSelector 查詢所有匹配元素
 * Query all elements by EnumCssClassSelector
 * @param classSelector - CSS 類別列舉值 / CSS class enum value
 * @param suffix - 選擇器後綴 / Selector suffix
 * @returns 查詢到的元素列表 / Queried elements NodeList
 */
export function querySelectorAllByClass<T extends HTMLElement>(classSelector: EnumCssClassSelector, suffix?: string): NodeListOf<T>
{
	return document.querySelectorAll<T>(getClassSelector(classSelector, suffix));
}
```

### ⚙️ 重構流程步驟 / Refactoring Steps
1.  **識別所有選擇器：** 使用工具（如 `grep -r "getElementById|querySelector"`）全局掃描專案，找出所有硬編碼的 ID/Class 字串。
2.  **建立物理錨點 (EnumWebviewElemId & EnumCssClassSelector)：** 在基礎模組中集中定義所有的 DOM ID 和 CSS 類別字串。
3.  **建立查詢層 Helper Functions：** 編寫 `getElemIdSelector()` 和 `getClassSelector()` 等輔助函式，將 **物理 Enum → Selector 字串** 的轉換邏輯封裝起來。
4.  **建立業務語義符 (EnumTabName)：** 當一個識別符同時承擔「實體 ID」和「狀態意義」時，必須創建第二個、獨立的 Enum 來管理其業務層面的完整性（例如：`sync`, `values`）。
5.  **逐步替換與驗證：**
    *   將所有邏輯判斷 (`if (id === 'sync')`) 替換為語義引用 (`if (currentState === EnumTabName.sync)`)。
    *   將所有 DOM 查詢 (`document.getElementById('searchResults')`) 替換為 Helper Function 呼叫 (`querySelectorById(EnumWebviewElemId.searchResults)`）。

### 使用範例 / Usage Examples

```typescript
// ✅ 使用 Enum - 類型安全、可維護
import { EnumWebviewElemId, EnumCssClassSelector, EnumTabName } from './scripts/elem-get';
import { getClassSelector, querySelectorById, querySelectorByClass, querySelectorAllByClass } from './scripts/elem-get';

// 基本元素查詢 / Basic element query
const searchResults = querySelectorById<HTMLDivElement>(
  EnumWebviewElemId.searchResults
);

// 帶偽類選擇器 / With pseudo-class selector
const checkedRadio = querySelectorByClass<HTMLInputElement>(
  EnumCssClassSelector.ideSourceRadio,
  ':checked'
);

// 帶屬性選擇器 / With attribute selector
const radioByValue = querySelectorByClass<HTMLInputElement>(
  EnumCssClassSelector.ideSourceRadio,
  `[value="${uuid}"]`
);

// 查詢所有匹配元素 / Query all matching elements
querySelectorAllByClass<HTMLInputElement>(
  EnumCssClassSelector.ideCheckbox,
  ':checked'
).forEach(cb => {
  // 處理勾選框
});

// Tab 切換邏輯 - 使用業務語義符
import { ALL_TAB_NAMES } from './enums';

ALL_TAB_NAMES.forEach(tabName => {
  const el = querySelectorById<HTMLDivElement>(tabName);
  el?.classList.toggle('active', tabName === currentTab);
});
```

### 重構前後對照 / Before & After Comparison

#### 替換 getElementById
```typescript
// ❌ 之前 / Before
const el = document.getElementById('searchResults');

// ✅ 之後 / After
const el = querySelectorById<HTMLDivElement>(EnumWebviewElemId.searchResults);
```

#### 替換 querySelector（基本類別）
```typescript
// ❌ 之前 / Before
const el = document.querySelector<HTMLElement>('.tabs');

// ✅ 之後 / After
const el = querySelectorByClass<HTMLElement>(EnumCssClassSelector.tabs);
```

#### 替換 querySelector（帶偽類）
```typescript
// ❌ 之前 / Before
const radio = document.querySelector<HTMLInputElement>('.ide-source-radio:checked');

// ✅ 之後 / After
const radio = querySelectorByClass<HTMLInputElement>(
  EnumCssClassSelector.ideSourceRadio,
  ':checked'
);
```

#### 替換 querySelector（帶屬性）
```typescript
// ❌ 之前 / Before
const radio = document.querySelector<HTMLInputElement>(`.ide-source-radio[value="${uuid}"]`);

// ✅ 之後 / After
const radio = querySelectorByClass<HTMLInputElement>(
  EnumCssClassSelector.ideSourceRadio,
  `[value="${uuid}"]`
);
```

#### 替換 querySelectorAll
```typescript
// ❌ 之前 / Before
document.querySelectorAll('.ide-checkbox:checked').forEach(cb => { ... });

// ✅ 之後 / After
querySelectorAllByClass<HTMLInputElement>(EnumCssClassSelector.ideCheckbox, ':checked').forEach(cb => { ... });
```

### HTML & JSX 範例 / Example

**為什麼這很重要 / Why This Matters**

HTML/JSX 是前端應用程式的**視覺契約層 (Visual Contract Layer)**。在這一層直接使用硬編碼字串，會導致以下問題：

1.  **語義斷裂：** HTML 中的 `id="sync"` 與 TypeScript 中的 `if (tab === 'sync')` 看似相同，實際上是兩處獨立的硬編碼。修改時必須同時更新多處，極易遺漏。
2.  **執行期炸彈：** 拼寫錯誤（如 `id="synv"`）不會在編譯期被捕捉，只在用戶點擊 Tab 時才會發現元素找不到。
3.  **難以重構：** 當設計師要求將 `searchResults` 改成 `searchOutput` 時，你需要在 HTML、CSS、TypeScript 中全局搜尋替換，且無法確保沒有遺漏。

**透過 Enum 統一管理 ID 與 Class，HTML/JSX 層與邏輯層共享同一個「語義事實來源」。** 以下範例展示如何將視覺標記與業務邏輯透過 Enum 緊密但安全地連結。

#### 完整頁面結構 / Complete Page Structure

```jsx
// ❌ 之前 - 硬編碼 ID 與 Class / Before - Hardcoded IDs and Classes
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
      <!-- 搜尋結果 / Search results -->
    </div>
  </div>
</div>
```

#### 導航組件 / Navigation Component

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
      <button className={`tab${activeTab === 'selected' ? ' active' : ''}`}
        onClick={() => setActiveTab('selected')}>Selected</button>
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

## 🚀 重構帶來的架構級別優勢 / Architectural Benefits

1.  **單一事實來源 (Single Source of Truth)：** 所有選擇器定義集中於 Enum 文件，實現全局可追蹤性。修改一處，全局生效。
2.  **編譯期保證安全 (Compile-Time Safety)：** TypeScript 編譯器會立即捕捉到對不存在的 Enum 值的引用，從而將運行時錯誤前置化（Shift Left）。
3.  **可測試性和隔離性 (Testability & Isolation)：** 業務邏輯可以完全獨立於 DOM 環境進行單元測試。我們在測試中驗證的是「當狀態是 `EnumTabName.sync` 時，行為是否正確」，而非「我能否找到 ID 為 `sync` 的元素」。
4.  **IDE 支援與開發者體驗 (DX)：** 自動完成（IntelliSense）、重構支援、導航功能大幅提升開發效率。
5.  **可發現性 (Discoverability)：** 新開發者可快速找到所有可用選擇器，無需遍歷整個代碼庫。
6.  **設計師級別的思考 (Design Thinking)：** 此模式證明了程式碼不僅是在執行功能，更是在定義一個*可演化、高內聚、低耦合*的應用系統架構。

## 📜 命名規範參考 / Naming Convention Summary
| 類型 | 命名模式 | 範例 | 職責層級 |
| :--- | :--- | :--- | :--- |
| **DOM ID** | `Enum{Name}ElemId` | `EnumWebviewElemId` | 物理定位器（底層） |
| **CSS 類別** | `Enum{Name}ClassSelector` | `EnumCssClassSelector` | 物理定位器（底層） |
| **Tab/狀態** | `Enum{Name}` (獨立) | `EnumTabName` | 業務語義符（高階） |

**原則：** 所有 Enum 成員名稱應遵循 `camelCase` 或 `PascalCase`，移除原始的連字符號 (`-`)。

### Enum 成員命名對照 / Enum Member Naming

| 原始字串 / Original String | Enum 成員名稱 / Enum Member Name |
|:--------------------------|:--------------------------------|
| `search-results` | `searchResults` |
| `ide-checkbox` | `ideCheckbox` |
| `source-ide-indicator` | `sourceIdeIndicator` |
| `tab-content` | `tabContent` |
| `export-import` | `exportImport` |

## 🚫 例外情況 / Exceptions

此模式極為強大且建議在所有組件中實踐。以下情況可保留硬編碼：

### 1. 動態生成的選擇器 / Dynamic Selectors

包含運行時變數插值的選擇器：

```typescript
// ✅ 可接受：動態 index / Acceptable: dynamic index
document.querySelector(`[data-index="${index}"]`)
```

這時，我們必須利用 **Helper Function + Dynamic Interpolation** 的組合來處理：

```typescript
// 使用 Helper Function 處理動態選擇器
const dynamicSelector = `${getClassSelector(EnumCssClassSelector.ideItem)}[data-index="${index}"]`;
const element = document.querySelector(dynamicSelector);
```

### 2. 測試檔案 / Test Files

**舊有測試：** 已存在的測試代碼可保留硬編碼選擇器，避免大幅度更動代碼引入回歸風險。

**新寫測試：** 一律使用 Enum，確保測試代碼與生產代碼共享同一語義來源：

```typescript
// ✅ 新測試應該這樣寫 / New tests should use enum
const testElement = querySelectorById(EnumWebviewElemId.testContainer);

// ⚠️ 舊測試可暫時保留（但建議標註 TODO 以便未來重構）
// TODO: Refactor to Enum
const legacyElement = document.getElementById('test-container');
```

### 3. 第三方庫整合 / Third-Party Library Integration

外部庫要求的特定選擇器格式：

```typescript
// 外部框架要求的特定格式 / Required by external framework
const element = document.querySelector('[data-testid="component"]');
```

---

## 相關資源 / Related Resources

- [TypeScript Enum 文件](https://www.typescriptlang.org/docs/handbook/enums.html)
- [Single Source of Truth 設計模式](https://en.wikipedia.org/wiki/Single_source_of_truth)
