---
name: comment-format-rules-js
description: |-
  JS/TS 註解語法與排版格式規範：強制區塊註解 (/** ... */)、JSDoc 排版標籤、雙語排版、註解位置結構與更新維護規則；內容只寫行為事實與意圖，不寫設計原則口號（漂移、SSOT、移動紀錄、任務報告）。
  註解意圖決定、何時需要註解與無意義註解審查由 analyze-code-commenter 負責；通用雙語標準由 bilingual-standardization-rule 定義。
  Use when users mention:
  - "JS/TS 註解規範", "JavaScript 註解格式", "TypeScript 註解格式"
  - "JSDoc 格式", "JSDoc 規範", "文件註解格式"
  - "雙語註解格式", "中英雙語註解", "bilingual comment format"
  - "區塊註解規範", "註解位置規範", "註解格式規範"
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

規範 JavaScript/TypeScript 程式碼註解的語法格式、排版結構、放置位置與更新維護。CSS/SCSS 請改用 [comment-format-rules-css](../comment-format-rules-css/SKILL.md)。

## 職責邊界與核心原則

為確保代碼排版的一致性與 IDE / AI 的提示精準度，遵循以下分工與格式原則：

> **職責邊界**：
> - **本技能負責【註解語法與格式結構】**：一律使用區塊註解、JSDoc 結構排版、單多行格式、緊鄰目標代碼上方、特殊指令順序與批次轉換工具。
> - **註解意圖與內容品質由 [analyze-code-commenter](../analyze-code-commenter/SKILL.md) 負責**：決定何處需要註解、分析 WHY 而非僅 WHAT、約束與邊界條件、審查並清除無意義註解與重構／遷移紀錄。
> - **雙語通用標準由 [bilingual-standardization-rule](../bilingual-standardization-rule/SKILL.md) 規範**：語言順序、判定基準、術語保留與彈性取捨等最高原則。

### 格式核心原則

- **一律使用區塊註解 `/** ... */`**（含分隔線註解），全面禁用行內註解 `//`；例外僅限 JSDoc `@example` 區塊內代碼與特殊編譯器指令（`// @ts-ignore` 等）。詳見 [重要約束](#重要約束-critical-constraints)。
- **註解放置於代碼上方**，緊鄰目標代碼，避免代碼後方的行內註解。詳見 [註解位置規範](./references/comment-placement.md)。
- **註解必須緊鄰其所描述的宣告**（中間不得隔著 `import`、常數或其他陳述式）；描述宣告的註解不得寫成檔頭註解。詳見 [錯誤註解案例](../analyze-code-commenter/references/bad-comment-examples.md)。
- **格式結構分工：宣告層級 JSDoc 描述合約，陳述式層級邏輯區塊描述實作緣由。** 詳見 [JSDoc 與邏輯區塊職責分離](#jsdoc-與邏輯區塊職責分離-responsibility-separation)。
- **雙語排版格式**：單行術語以 `/` 分隔，JSDoc 標籤採 `- 中文 / English` 格式。詳見 [雙語註解格式](./references/bilingual-comment-format.md)。
- **更新既有註解時保留原始技術資訊**（錯誤碼、術語、檔案路徑、多語言註解）。詳見 [註解更新規則](./references/comment-update-rules.md)。

---

## 結構化文檔註解 (Documentation Blocks)

凡是涉及 **函式定義、類別、介面、重要常數或設定值、關鍵演算法**，必須使用編輯器可識別的標準區塊註解。這有助於 IDE 及 AI 在提供自動補全（IntelliSense）時顯示正確的提示訊息。對於公開 API 或複雜演算法，務必補上完整範例或使用情境。

- **格式：** 使用 `/** ... */`
- **適用場景：** 模組、API 接口、函式定義、類別、介面、重要常數與設定值。

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
僅限於單行的簡短邏輯說明或暫時性標記。否則請使用多行區塊註解格式。

對於使用 TypeScript 的變數或屬性，若程式碼中已明確標註型別（例如 `protected ideList: IIDEInfo[]`），則無需在 JSDoc 中再次使用 `@type` 標註。當新增簡短說明時，可直接使用單行區塊註解（`/** 註解內容 */`）以保持簡潔與一致性。

- **格式：** `/** 註解內容 */`
- **適用場景：** 變數聲明、配置項、常數說明、簡短邏輯分段、TODO 標記。

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

```typescript
/** 若命中快取則直接回傳，避免重複解析運算 */
if (cache.has(key)) return cache.get(key);

/** TODO: 優化大數據量下的迴圈效能 */
processData(data);
```
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

## 邏輯區塊註解格式規範 (Logic Block Comment Formatting)

> **意圖與範圍參照**：邏輯區塊的業務意圖判定（解釋 WHY 而非僅 WHAT）、邊界分析與需要註解的代碼範圍，請參閱 [analyze-code-commenter — 邏輯區塊意圖規範](../analyze-code-commenter/SKILL.md#logic-block-requirements-required-for-all-logic-blocks)。

在編寫邏輯區塊註解時，必須嚴格遵守以下格式規範：

### 強制區塊註解格式

**所有邏輯區塊上方一律使用區塊註解格式 `/** ... */`**，不可使用行內註解 `//`：

```typescript
// ❌ 錯誤：邏輯區塊使用行內註解
if (user.isActive && subscription.status === 'active' &&
    (payment.lastPaymentDate > thirtyDaysAgo || payment.isAutoRenew))
{
    // 檢查訂閱有效性
}

// ✅ 正確：使用區塊註解排版
/**
 * 檢查使用者是否有有效訂閱且最近有付款記錄，
 * 或具備自動續訂資格以確保服務不中斷
 */
if (user.isActive && subscription.status === 'active' &&
    (payment.lastPaymentDate > thirtyDaysAgo || payment.isAutoRenew))
{
    // ...
}
```

### 禁止堆疊多個單行註解

**禁止對同一個代碼元素或陳述式堆疊多個單行註解**（無論是單行區塊註解 `/** ... */` 或行內註解 `//`），應合併為單一多行區塊註解：

```typescript
// ❌ 錯誤：多個單行區塊註解堆疊
/** 驗證訂單資料格式 */
/** 檢查必填欄位 */
const validated = validateOrder(order);

// ❌ 錯誤：多個單行行內註解堆疊
// 驗證訂單資料格式
// 檢查必填欄位
const validated = validateOrder(order);

// ✅ 正確：合併為單一多行區塊註解
/**
 * 驗證訂單資料格式與必填欄位完整性
 */
const validated = validateOrder(order);
```

### 連續邏輯區塊的合併排版

對 **3 個以上連續相關的陳述式**統整註解時，使用單一多行區塊註解分段排版，避免零碎的逐行註解：

```typescript
/**
 * 依序執行前置檢查與初始化：
 *
 * 1. 驗證連線設定與授權憑證
 * 2. 初始化重試機制與備用佇列
 * 3. 註冊生命週期監聽器
 */
```

---

## JSDoc 與邏輯區塊職責分離 (Responsibility Separation)

> **錯置案例參照**：關於層級錯置（JSDoc 夾帶內部陳述式細節）的詳細對照與修正，請參閱 [錯誤註解案例 — 案例六](../analyze-code-commenter/references/bad-comment-examples.md)。

**核心原則：** 宣告層級的 JSDoc 描述「合約與對外意圖」；陳述式層級的邏輯區塊描述「局部實作緣由」。

| 註解層級 | 格式結構與受眾 | 應包含 | 嚴禁包含 |
|----------|----------------|--------|----------|
| **宣告層級 (JSDoc)** | 位於 class/function/interface 上方，面向外部呼叫端與 IntelliSense | 模組或函式用途、API 合約、前置條件、參數約束 (`@param`)、回傳值 (`@returns`)、異常拋出 (`@throws`) | 函式體內具體陳述式的實作步驟、內部暫存快取重設等私有細節 |
| **陳述式層級 (邏輯區塊)** | 位於函式體內部的具體陳述式上方，面向內部維護實作者 | 該陳述式或分支的局部意圖與實作原因（相容性防禦理由、特殊邊界處理、快取失效或重算時機） | 外部 API 合約描述、全域架構口號；**嚴禁單純翻譯語法字面**（例如「使用 as any 繞過推導」、「使用短路運算實現」等無業務語義的語法雜訊） |

```typescript
// ❌ 錯誤：將內部陳述式層級的實作細節堆在 JSDoc
/**
 * 取得舊版插件名稱清單
 * Get legacy plugin names
 *
 * 內部檢查舊版名稱與當前名稱是否衝突，並在有資料時提取；
 * 否則回傳空陣列
 */
function getLegacyPluginNames(result: Record<string, unknown[]>) {
    return (LEGACY_PLUGIN_NAME !== PLUGIN_NAME) && result[LEGACY_PLUGIN_NAME] || [];
}

// ✅ 正確：JSDoc 宣告合約，邏輯區塊說明局部相容性與防禦理由
/**
 * 取得已註冊的相容舊版插件名稱清單
 * Get registered legacy plugin names for backward compatibility
 *
 * @param result - 插件掃描結果物件
 * @returns 舊版插件名稱陣列，若無相容項目則回傳空陣列
 */
function getLegacyPluginNames(result: Record<string, unknown[]>): string[] {
    /**
     * 相容性防禦：當前插件與舊版名稱相同時不需重疊提取；
     * 若未載入舊版設定則回傳空陣列以維持回傳型別一致性
     */
    return (LEGACY_PLUGIN_NAME !== PLUGIN_NAME) && result[LEGACY_PLUGIN_NAME] || [];
}
```

### 影響 API 合約的邏輯

當邏輯**影響 API 合約**（如權限判斷條件、驗證規則）時，應在 JSDoc 中說明，讓呼叫端了解行為約束；
函式內部的邏輯區塊僅在有特殊邊界防禦或非直觀處理時添加說明，避免重複抄寫 JSDoc 已有的規則清單：

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
function canAccess(user: IUser, resource: IResource): boolean {
    return user.isActive && user.subscription === 'pro' &&
        (resource.createdBy === user.id || resource.isPublic);
}
```

### 檢查清單 (Checklist)

- [ ] JSDoc 中是否夾帶內部陳述式的實作細節？（內部暫存重設等細節應下沉至陳述式上方）
- [ ] 邏輯區塊內的註解是否僅僅翻譯語法字面（如運算子、型別斷言等無語義雜訊）？應改為說明局部業務緣由或邊界防禦意圖

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

> **Reference**: 無意義註解（重複宣告、羅列結構）的判定與處理由 [analyze-code-commenter](../analyze-code-commenter/SKILL.md) 負責，判斷基準、錯誤案例與改寫指引見 [無意義註解](../analyze-code-commenter/references/meaningless-comments.md)。

---

## 重要約束 (Critical Constraints)

以下為強制規則，完整錯誤與正確範例見 [references/critical-constraints.md](./references/critical-constraints.md)：

- **區塊註解強制使用**：任何代碼都不使用行內註解 `//`；例外僅限 JSDoc `@example` 區塊內、特殊指令（`// @ts-ignore` 等）。
- **分隔線註解**：即使是 `// ====` 分隔線也必須使用區塊註解 `/** ... */`，不得使用行內註解。
- **特殊指令放置**：`// @ts-ignore` 必須緊鄰目標代碼，區塊註解放在特殊指令**之前**。
- **保留技術術語**：更新註解時不得刪除原始技術術語（如 Non-Null Assertion Operator、Dijkstra、Singleton），只能新增翻譯或說明。
- **識別無語義命名慣例**：`Lazy`、`Helper`、`Util` 可能僅是命名慣例，必要時以 `@note` 說明其無特定技術意涵。
- **只寫行為事實與意圖，不寫設計原則口號**：註解須描述代碼「做什麼、為什麼這樣做」；禁止寫入「避免漂移」、「SSOT／單一事實來源」等原則口號，以及移動紀錄（「已移至／原位於」）與任務報告（「已完成重構」）。完整錯例與改寫見 [錯誤註解案例 — 案例五](../analyze-code-commenter/references/bad-comment-examples.md)。

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
    /** 若包含名詞標籤，則標記為真 */
    if (m & POSTAG.D_N)
    {
        bool = true;
    }
}
```

**改善重點：**
- 文檔註解提供清晰的邏輯意圖
- 內部邏輯說明同樣採用區塊註解 `/** ... */`，不可使用行內 `//`
- 如果有必要則使用 TODO / FIXME 等追蹤標籤

---

## 詳細規範 (Detailed References)

按需載入以下參考文件：

- [雙語註解格式規範](./references/bilingual-comment-format.md) — JS/TS 雙語區塊註解排版與 JSDoc 標籤格式（通用規則與最高原則以 [bilingual-standardization-rule](../bilingual-standardization-rule/SKILL.md) 為 SSoT）
- [註解位置規範](./references/comment-placement.md) — 陣列元素、物件屬性、Interface/Type 成員、`@example` 行內註解例外
- [重要約束](./references/critical-constraints.md) — 區塊註解強制、分隔線、特殊指令放置、保留技術術語
- [註解更新規則](./references/comment-update-rules.md) — 保留原始錯誤資訊、Issue 驗證、多語言註解保留、更新前檢查清單
- [行內註解轉換工具](./references/convert-inline-to-block.md) — 將行內註解 (`//`) 批次轉為區塊註解 (`/** ... */`)，預設 dry-run，加 `--write` 才寫入

---

## 相關技能 (Related Skills)

- [bilingual-standardization-rule](../bilingual-standardization-rule/SKILL.md) — 繁中＋英文雙語標準化規範（SSoT）：最高原則、語言順序、判定基準與多語言保留。
- [analyze-code-commenter](../analyze-code-commenter/SKILL.md) — 分析程式碼並決定註解意圖的實作技能；代碼結構分析、[錯誤註解案例](../analyze-code-commenter/references/bad-comment-examples.md) 與 [無意義註解](../analyze-code-commenter/references/meaningless-comments.md) 的內容品質判定由該技能負責。
