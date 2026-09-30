---
name: comment-format-rules-js
description: |-
  JS/TS 註解格式規範：區塊註解、JSDoc、雙語註解（中文＋英文）、註解位置與更新規則。
  Use when users mention:
  - "JS/TS 註解規範", "JavaScript 註解格式", "TypeScript 註解格式"
  - "JSDoc 格式", "JSDoc 規範", "文件註解格式"
  - "雙語註解格式", "中英雙語註解", "bilingual comment format"
  - "區塊註解規範", "註解位置規範", "註解格式規範"
  - "無意義註解", "無意義註解刪除", "meaningless comment"
  - "行內註解轉換", "inline to block comment converter"
  - "comment format rules", "JSDoc comment format", "block comment rules"
  Apply when writing, updating, or reviewing code comments in JS/TS projects.
tags:
  - comments/format
  - documentation/jsdoc
  - javascript/comments
  - typescript/comments
  - agents/skills
---

# JS/TS 註解格式規範 (Comment Format Rules)

規範 JavaScript/TypeScript 程式碼註解的撰寫、更新與審查。CSS/SCSS 請改用 [comment-format-rules-css](../comment-format-rules-css/SKILL.md)。

## 核心原則

IDE 及 AI 在處理程式碼時，會優先解析 **語義化標籤**（如 JSDoc）與 **上下文關聯**。為確保代碼的可維護性與提示的精準度，撰寫或更新註解時遵循：

- **一律使用區塊註解 `/** ... */`**（含分隔線註解），例外僅限 JSDoc `@example` 區塊內與特殊指令（`// @ts-ignore` 等）。詳見 [重要約束](#重要約束-critical-constraints)。
- **解釋 WHY（為什麼），而非僅解釋 WHAT（做什麼）**：複雜條件需說明理由，邊界情況必須記錄。
- **註解放置於代碼上方**，避免代碼後方的行內註解。詳見 [註解位置規範](./references/comment-placement.md)。
- **雙語註解：中文在前、英文在後**，禁止「英文＋英文」的假雙語。詳見 [雙語註解格式](./references/bilingual-comment-format.md)。
- **職責分離：JSDoc 描述合約與意圖，邏輯區塊描述實作細節。**
- **更新既有註解時保留原始技術資訊**（錯誤碼、術語、檔案路徑）。詳見 [註解更新規則](./references/comment-update-rules.md)。

---

## 結構化文檔註解 (Documentation Blocks)

凡是涉及 **函式定義、類別、介面、重要的常數或設定值、複雜邏輯區塊、關鍵邏輯或算法**，必須使用編輯器可識別的標準區塊註解。這有助於 IDE 及 AI 在提供自動補全（IntelliSense）時顯示正確的提示訊息。

- **格式：** 使用 `/** ... */`
- **適用場景：** 模組、API 接口、函式定義、類別、介面、重要的常數或設定值、複雜邏輯區塊、關鍵邏輯或算法。

範例：

```js
/**
 * 處理用戶訂單並計算總金額
 * @param {Object} order - 訂單物件
 * @param {number} taxRate - 稅率 (例如 0.05)
 * @returns {number} 含稅後的總金額
 */
function calculateTotal(order, taxRate) {
    // ...邏輯
}

/**
 * 安全上限 - 用於格式偵測的效能保護
 * Safety limits - performance protection for format detection
 *
 * @type {number}
 */
const MAX_CHARS = 2000;
```

---

## 單行區塊註解 (Single-line Block)

對於能夠被編輯器標記，但內容較短的說明，使用單行的區塊註解格式。
僅限於單行的簡單邏輯說明或暫時性標記。否則請使用多行區塊註解格式。

對於使用 TypeScript 的變數或屬性，若程式碼中已明確標註型別（例如 `protected ideList: IIDEInfo[]`），則無需在 JSDoc 中再次使用 `@type` 標註。當新增簡短說明時，可直接使用單行區塊註解（`/** 註解內容 */`）以保持簡潔與一致性。

- **格式：** `/** 註解內容 */`
- **適用場景：** 變數聲明、配置項、常數說明。

範例：

```js
/** 設定 API 請求的超時時間（毫秒） */
const API_TIMEOUT = 5000;

/** 初始化用戶狀態快取 */
let userCache = new Map();
```

```typescript
/** IDE 列表：存儲成功偵測到的可用 IDE */
protected ideList: IIDEInfo[] = [];
```

- **適用場景：** 簡單的邏輯分段、TODO 標記。

範例：

```js
/** 如果快取存在則直接回傳 */
if (cache.has(key)) return cache.get(key);

/** TODO: 優化大數據量下的迴圈效能 */
processData(data);
```

---

## 區塊註解排版規則

將單行註解轉換為多行區塊註解，或合併多個單行註解時，必須維持標準排版：

- 開頭 `/**` **獨立一行**
- 每行內容前加 `* ` 並與開頭對齊
- 結尾 `*/` 與開頭 `/**` 對齊

```typescript
// ❌ 錯誤：開頭 `/**` 與第一行文字同行，導致縮排混亂
/** 如果是 optional 類型，遞迴處理其內部類型
	 * If it's an optional type, recursively process its inner type
	 */

// ✅ 正確：開頭 `/**` 獨立一行，後續行正確對齊
/**
 * 如果是 optional 類型，遞迴處理其內部類型
 * If it's an optional type, recursively process its inner type
 */
```

---

## 短註解代碼 (Inline Comments)

- **格式：** `//`
- **適用場景：** 排除代碼。

範例：

```js
// processData(data);
```

---

## 邏輯區塊註解規範 (Logic Block Comments)

**所有邏輯區塊都需要註解**，包括私有/內部邏輯：

| 邏輯類型 | 範例 |
|----------|------|
| 控制流程 | `if/else`, `switch/case`, `try/catch`, 迴圈 |
| 業務邏輯 | 資料轉換、驗證、計算算法 |
| 錯誤處理 | 異常捕獲、降級邏輯、重試機制 |
| 巢狀邏輯 | 巢狀迴圈、巢狀條件、回呼函式 |

### 註解內容原則

- **解釋 WHY（為什麼），而非僅解釋 WHAT（做什麼）**
- 複雜條件需要說明理由
- 邊界情況必須記錄

```typescript
// ❌ 避免：複雜邏輯無註解
if (user.isActive && subscription.status === 'active' &&
    (payment.lastPaymentDate > thirtyDaysAgo || payment.isAutoRenew))
{
    // grant access
}

// ✅ 推薦：複雜條件加上說明
/**
 * 檢查使用者是否有有效訂閱且最近有付款記錄
 * 或啟用自動續訂功能的使用者
 * Check if user has active subscription with recent payment OR auto-renew enabled
 */
if (user.isActive && subscription.status === 'active' &&
    (payment.lastPaymentDate > thirtyDaysAgo || payment.isAutoRenew))
{
    // grant access
}
```

### 禁止多個單行註解

**禁止對同一個代碼元素使用多個單行註解**（無論是單行區塊註解 `/** ... */` 或單行行內註解 `//`），應合併為一個多行區塊註解：

```typescript
// ❌ 錯誤：多個單行區塊註解
/** 驗證訂單資料格式與必填欄位 */
/** Validate order data format and required fields */
const validated = validateOrder(order);

// ❌ 錯誤：多個單行行內註解
// 驗證訂單資料格式與必填欄位
// Validate order data format and required fields
const validated = validateOrder(order);

// ✅ 正確：合併為單一多行區塊註解
/**
 * 驗證訂單資料格式與必填欄位
 * Validate order data format and required fields
 */
const validated = validateOrder(order);
```

### 連續邏輯區塊的合併

對 **3 個以上連續的邏輯區塊**加上註解時，使用單一多行區塊註解統整，避免零碎的連續註解：

```typescript
/**
 * 邏輯說明一 / Logic description one
 *
 * 邏輯說明二 / Logic description two
 *
 * 邏輯說明三 / Logic description three
 */
```

---

## JSDoc 與邏輯區塊職責分離 (Responsibility Separation)

**核心原則：** JSDoc 描述「合約/意圖」，邏輯區塊描述「實作細節」。

| 位置 | 應包含 | 不應包含 |
|------|--------|----------|
| **JSDoc** | 函式用途、設計邏輯、為什麼這樣設計 | 具體如何實現、語法細節 |
| **邏輯區塊** | 具體實作邏輯、技術細節（as any、運算子等） | 為什麼要這樣設計 |

```typescript
// ❌ 錯誤：將實作細節放在 JSDoc
/**
 * 處理資料（錯誤：將實作細節放在 JSDoc）
 * Process data (wrong: implementation details in JSDoc)
 *
 * 使用短路運算實現：(condition && value) || default
 */
function process(result) {
  return condition && value || [];
}

// ✅ 正確：JSDoc 描述意圖，邏輯區塊描述實作
/**
 * 從結果中取得舊版插件名稱
 * Get legacy plugin names from result
 */
function getLegacyPluginNamesFromResult(result) {
    /**
     * 條件判斷：確保新舊插件名稱確實不同
     *
     * 使用 `as any` 繞過 TypeScript 推導
     *
     * 短路運算實現：(condition && value) || default
     * Short-circuit evaluation implementation
     */
    return (LEGACY_PLUGIN_NAME !== PLUGIN_NAME as any) && result[LEGACY_PLUGIN_NAME] || [];
}
```

### 影響 API 合約的邏輯

當邏輯**影響 API 合約**（如權限判斷條件、驗證規則）時，應**同時**在 JSDoc 中說明，讓呼叫者了解行為；
若邏輯僅是內部實現細節（如效能優化、內部演算法），則只需在程式碼區塊內說明：

```typescript
/**
 * 檢查使用者是否有權存取資源
 * Check if user has permission to access resource
 *
 * 權限判斷條件:
 * 1. 使用者必須處於啟用狀態
 * 2. 必須有專業版訂閱
 * 3. 資源為本人建立 或 資源為公開
 *
 * @param user - 使用者物件
 * @param resource - 資源物件
 * @returns 是否允許存取
 */
function canAccess(user, resource) {
    /**
     * 執行權限檢查 / Perform permission check
     *
     * 判斷邏輯:
     * - 使用者狀態是否啟用 / Check if user is active
     * - 訂閱類型是否為 Pro / Check if subscription is Pro
     * - 資源是否為本人建立或是公開資源
     */
    return user.isActive && user.subscription === 'pro' &&
        (resource.createdBy === user.id || resource.isPublic);
}
```

### 檢查清單 (Checklist)

- [ ] JSDoc 中是否包含「如何實現」的語法細節？（如短路運算、`as any`）
- [ ] 邏輯區塊內的註解是否僅描述「實作」，而非包含「設計意圖」？

### JSDoc 避免冗餘描述

不需要「標題 + 與標題相同意思的描述」，兩段意思相同的註解只保留一組完整的描述即可。

```typescript
// ❌ 錯誤：意思重複（標題「處理資料」與描述「此函數用於處理資料」意思相同）
/**
 * 處理資料
 * Process data
 *
 * 此函數用於處理資料
 * This function is used to process data
 */

// ✅ 正確：只保留一組完整的描述
/**
 * 此函數用於處理資料
 */
```

**例外：多個獨立說明區塊可使用簡短標題。**
當 JSDoc 需要包含多個獨立說明區塊時，可以使用簡短標題：

```typescript
/**
 * 工具函式集合
 * Utility functions collection
 *
 * 錯誤處理工具：
 * Error handling utilities:
 * ...
 *
 * 資料轉換工具：
 * Data transformation utilities:
 * ...
 */
```

### 無意義註解（重複宣告、羅列結構）

屬**無意義註解**的三類情形（不得新增，遇到既有者直接刪除）：

1. 僅重複宣告關鍵字本身（如 `/** 介面 */` + `interface`）
2. 僅重複宣告語意（如 `/** 型別守衛 */` + `function isX(v): v is X`）
3. 羅列應由代碼管理的宣告、描述檔案「長什麼樣」而非「為什麼存在」的檔頭註解（what 而非 why）

> **Reference**: [無意義註解](./references/meaningless-comments.md) - 錯誤案例、正確處理與改寫指引.

---

## 重要約束 (Critical Constraints)

以下為強制規則，完整錯誤與正確範例見 [references/critical-constraints.md](./references/critical-constraints.md)：

- **區塊註解強制使用**：任何代碼都不使用行內註解 `//`；例外僅限 JSDoc `@example` 區塊內、特殊指令（`// @ts-ignore` 等）。
- **分隔線註解**：即使是 `// ====` 分隔線也必須使用區塊註解 `/** ... */`，不得使用行內註解。
- **特殊指令放置**：`// @ts-ignore` 必須緊鄰目標代碼，區塊註解放在特殊指令**之前**。
- **保留技術術語**：更新註解時不得刪除原始技術術語（如 Non-Null Assertion Operator、Dijkstra、Singleton），只能新增翻譯或說明。
- **識別無語義命名慣例**：`Lazy`、`Helper`、`Util` 可能僅是命名慣例，必要時以 `@note` 說明其無特定技術意涵。

---

## 靈活性原則 (Flexibility Principle)

在不違反上述規則的情況下，可保持原有的註解風格。對於既有代碼庫或特定邏輯區塊，如果已有清晰且一致的註解慣例，無需強制改寫。重點是確保：

- **邏輯清晰**：註解準確表達意圖
- **一致性**：同一文件或模組內保持同一風格
- **可維護性**：未來的開發者能快速理解

### 改善既有代碼的註解

當遇到需要優化的既有註解時，應同時改善邏輯清晰度和註解品質。以下是改善範例：

❌ **改善前**

```typescript
/**
 * 不確定沒有BUG 但原始模式已經不合需求 因為單一項目多個詞性
 */
else if (m = (w1.p & w2.p))
{
    if (1 || m & POSTAG.D_N)
    {
        bool = true;
    }
}
```

✅ **改善後**

```typescript
/**
 * 檢查是否有共同詞性標籤
 * 注意：原始模式已不合需求，因為單一項目可能有多個詞性
 * TODO: 確認潛在 BUG 的有效性
 */
else if (m = (w1.p & w2.p))
{
    // 若包含名詞標籤，則標記為真
    if (m & POSTAG.D_N)
    {
        bool = true;
    }
}
```

**改善重點：**
- 文檔註解提供清晰的邏輯意圖
- 如果有必要則使用 TODO / FIXME 等追蹤標籤

---

## 詳細規範 (Detailed References)

按需載入以下參考文件：

- [雙語註解格式規範](./references/bilingual-comment-format.md) — 格式選擇、語言順序、彈性捨棄雙語、JSDoc 標籤雙語格式
- [註解位置規範](./references/comment-placement.md) — 陣列元素、物件屬性、Interface/Type 成員、`@example` 行內註解例外
- [重要約束](./references/critical-constraints.md) — 區塊註解強制、分隔線、特殊指令放置、保留技術術語
- [註解更新規則](./references/comment-update-rules.md) — 保留原始錯誤資訊、Issue 驗證、多語言註解保留、更新前檢查清單
- [無意義註解](./references/meaningless-comments.md) — 重複宣告關鍵字／語意、羅列代碼管理的宣告（what 而非 why）的註解判定，不得新增、遇到直接刪除
- [行內註解轉換工具](./references/convert-inline-to-block.md) — 將行內註解 (`//`) 批次轉為區塊註解 (`/** ... */`)，預設 dry-run，加 `--write` 才寫入

---

## 相關技能 (Related Skills)

- [analyze-code-commenter](../analyze-code-commenter/SKILL.md) — 分析程式碼並自動加入雙語註解的實作技能，包含邏輯區塊分析規範與多種範例；格式規範由本技能定義。

---

## 額外建議

- 對公開/內部 API、library 函式與複雜演算法務必補上完整範例或使用情境。
