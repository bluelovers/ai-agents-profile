# 🛠 註解格式規範

## 核心原則

IDE 及 AI 在處理程式碼時，會優先解析 **語義化標籤**（如 JSDoc）與 **上下文關聯**。為了確保代碼的可維護性與提示的精準度，請遵循以下邏輯與範式。

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

對於使用 TypeScript 的變數或屬性，若程式碼中已明確標註型別（例如 `private ideList: IIDEInfo[]`），則無需在 JSDoc 中再次使用 `@type` 標註。當新增簡短說明時，可直接使用單行區塊註解（`/** 註解內容 */`）以保持簡潔與一致性。

- **格式：**`/** 註解內容 */`
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
private ideList: IIDEInfo[] = [];
```

---

## 雙語註解格式規範 (Bilingual Comment Format)

當註解需要使用**雙語**（繁體中文 + 英文）時，請遵循以下格式規範：

### 格式選擇

| 格式 | 適用場景 | 範例 |
|------|----------|------|
| **單行格式** | 簡短說明 | `/** 說明 / Description */` |
| **多行格式** | 詳細說明或翻譯較長時 | `/** 說明\n * Description */` |

### 語言順序

- **中文在前，英文在後**
- 使用 `/` 分隔，或分行書寫
- 禁止「英文 + 英文」的假雙語

```typescript
// ✅ 正確：單行格式
/** 是否成功 / Whether successful */
const isActive = true;

// ✅ 正確：多行格式
/**
 * 取得分組鍵的函式
 * Function to get grouping key
 *
 * @param item - 要分組的元素 / Element to group
 */
getKey?(item: T, index: number, arr: T[]): any

// ❌ 錯誤：假雙語（兩行都是英文）
/**
 * Process data
 * Process data
 */
```

### JSDoc 標籤雙語格式

JSDoc 標籤（如 `@param`、`@returns`、`@throws` 等）中的描述也可以使用雙語格式：

```typescript
/**
 * 取得使用者資料
 * Get user data
 *
 * @param userId - 使用者識別碼 / User identifier
 * @param options - 選項配置 / Options configuration
 * @returns 使用者資料 / User data
 * @throws 當使用者不存在時拋出錯誤 / Throws error when user not found
 */
function getUserData(userId: string, options?: GetUserOptions): UserData {
    // ...
}
```

**格式說明：**
- 在 `-` 後面使用 `描述 / Description` 格式
- 中文在前，英文在後，使用 `/` 分隔
- 適用於所有 JSDoc 標籤： `@param`、`@returns`、`@throws`、`@see` 等

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

---

## 註解位置規範 (Placement Rules)

**註解應放置於代碼上方，而非代碼後方。** 這樣的安排有助於提升代碼的可讀性，並使 IDE 及 AI 能夠更好地理解上下文關聯。

### 對陣列元素的註解

```typescript
// ✅ 推薦：註解放在上方
let arr = [
    /** 數字 / Numbers */
    /[\d０-９]+(?:,[\d０-９]+)?(?:\.[\d０-９]+)?/,
    /** 英文及擴展拉丁字母 / English and extended Latin */
    /[\w０-９Ａ-Ｚａ-ｚ\u0100-\u017F\u00A1-\u00FF]+/,
    /** 阿拉伯文 / Arabic */
    /[\u0600-\u06FF\u0750-\u077F]+/,
    /** 俄文（西里爾字母）/ Russian (Cyrillic) */
    /[\u0400-\u04FF]+/,
    /** 希臘文 / Greek */
    /[\u0370-\u03FF]+/,
];
```

### 對物件屬性的註解

```typescript
// ✅ 推薦：使用文檔區塊註解，放置於屬性上方
let jsonHandlerOptions = {
	/**
	 * 是否允許註解
	 * @default true
	 */
	allowComments: true
}
```

### Interface 與 Type 成員註解規則

**禁止在 Interface 或 Type 的 JSDoc 中使用 `@property` 描述成員**，應在每個成員上方直接添加註解：

```typescript
// ❌ 錯誤：使用 @property 在 interface JSDoc 中描述成員
/**
 * 工具配置介面
 * Tool configuration interface
 *
 * @property description - 描述說明 / Description
 * @property shortDescription - 簡短描述 / Short description
 * @property args - 參數 / Arguments
 */
interface I_AriseToolsConfigEntry {
	description?: string;
	shortDescription: string;
	args: unknown;
}

// ✅ 正確：在每個成員上方直接添加註解
interface I_AriseToolsConfigEntry
{
	/** 描述說明 / Description */
	description?: string;
	/** 簡短描述 / Short description */
	shortDescription: string;
	/** 參數 / Arguments */
	args: unknown;
}
```

**原因：**
- `@property` 標籤需要額外維護，且容易與實際成員脫節
- 成員上方的註解更直觀，IDE 可正確識別並顯示 IntelliSense
- 符合「每個成員獨立註解」的核心原則

### 注意事項

- **避免代碼後方註解** (`code // comment`)：直行註解會降低代碼的視覺層級，分散閱讀焦點
- **對齊與視覺性**：註解在上方時，能清晰分隔邏輯段落，提升掃描效率
- **IDE 支援**：將註解置於上方，更能幫助編輯器正確識別與該代碼相關的上下文

#### 例外情況：JSDoc `@example` 區塊內的行內註解

在 JSDoc 的 `@example` 程式碼範例區塊中，**允許使用行內註解 (`//`)**。這是因為：

1. 範例中的註解屬於文件展示用途，非實際執行代碼
2. 用於說明預期輸出或行為（如 `console.log(x); // 輸出: 3`）
3. 系統限制：範例內無法使用巢狀的區塊註解

```typescript
/**
 * @example
 * ```typescript
 * // 修改克隆的樣式不會影響原始
 * cloned._styles.push({ open: '\\x1b[34m', close: '\\x1b[39m', closeRe: /\\x1b[39m/ });
 * console.log(source._styles.length); // 2（原始未變）
 * console.log(cloned._styles.length); // 3（克隆已修改）
 * ```
 */
```


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

## 短註解 (Inline/Short Comments)

僅限於兩行（含）以內的簡單邏輯說明或暫時性標記。否則請使用多行區塊註解格式。

- **格式：** `//`
- **適用場景：** 簡單的邏輯分段、TODO 標記、臨時排除代碼。

範例：

```js
// 如果快取存在則直接回傳
if (cache.has(key)) return cache.get(key);

// TODO: 優化大數據量下的迴圈效能
processData(data);
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
     * Condition check: ensure legacy and current plugin names are actually different
     *
     * 使用 `as any` 繞過 TypeScript 推導
     * Uses `as any` to bypass TypeScript inference
     *
     * 短路運算實現：(condition && value) || default
     * Short-circuit evaluation implementation
     */
    return (LEGACY_PLUGIN_NAME !== PLUGIN_NAME as any) && result[LEGACY_PLUGIN_NAME] || [];
}
```

---

## 重要約束 (Critical Constraints)

### 區塊註解強制使用

- **一律使用區塊註解 (`/** ... */`)** - 任何代碼都不使用行內註解 (`//`)
- **例外**：JSDoc `@example` 區塊內、特殊指令（`// @ts-ignore` 等）

#### 分隔線註解規則

即使是分隔線類型的註解，也必須使用**區塊註解**，不得使用行內註解：

```typescript
// ❌ 錯誤：使用行內註解作為分隔線
// ==================== Zod Schema 工廠函數 ====================

// ❌ 錯誤：使用行內註解作為分隔線（等號分隔線）
// ============================================================
// 差異比較工具 / Difference Comparison Utilities
// ============================================================

// ✅ 正確：使用單行區塊註解作為分隔線
/** ==================== Zod Schema 工廠函數 ==================== */

// ✅ 正確：使用多行區塊註解作為等號分隔線
/**
 * ============================================================
 * 差異比較工具 / Difference Comparison Utilities
 * ============================================================
 */

// ✅ 正確：使用多行區塊註解作為分隔線
/**
 * ==================== Zod Schema 工廠函數 ====================
 */
```

**錯誤原因：** 誤以為分隔線只是視覺分隔，不需要遵循區塊註解規則。

**解決方法：** 所有註解（包含分隔線）都必須使用 `/** ... */` 格式。

### 特殊指令放置規則

特殊指令（如 `// @ts-ignore`、`// eslint-disable`）必須**緊鄰目標代碼**，區塊註解應放在特殊指令**之前**：

```typescript
// ❌ 錯誤：特殊指令放在區塊註解之前
// @ts-ignore
/**
 * 將 Console2 類別指派給原型屬性
 * Assign Console2 class to prototype property
 */
Console2.prototype.Console = Console2

// ✅ 正確：區塊註解放在特殊指令之前
/**
 * 將 Console2 類別指派給原型屬性
 * Assign Console2 class to prototype property
 */
// @ts-ignore
Console2.prototype.Console = Console2
```

### 保留技術術語

更新註解時**不得刪除原始技術術語**，只能新增翻譯或說明：

| 術語類型 | 範例 |
|----------|------|
| TypeScript/JavaScript 術語 | Non-Null Assertion Operator (`!`)、Union Type、Type Guard |
| 演算法名稱 | Dijkstra、Binary Search、Quick Sort |
| 設計模式 | Singleton、Factory、Observer、Strategy |
| 資料結構 | Linked List、Hash Map、Binary Tree |

```typescript
// ✅ 正確：保留原始術語並添加翻譯
/**
 * 使用 Non-Null Assertion Operator (!) 確保值不為 null
 * Uses Non-Null Assertion Operator (!) to ensure value is not null
 */
const value = nullableValue!;

// ❌ 錯誤：刪除原始術語
/**
 * 使用驚嘆號確保值不為空
 * Uses exclamation mark to ensure value is not empty
 */
const value = nullableValue!;
```

### 識別無語義命名慣例

某些命名（如 `Lazy`、`Helper`、`Util`）可能只是組織慣例，而非特定技術意涵：

```typescript
/**
 * 配置獲取值型別
 * Config getter value type
 *
 * @note Lazy 為命名慣例，無「延遲/惰性」意涵
 * @note Lazy is a naming convention, no "lazy/惰性" meaning
 */
export type ILazyConfigGetterValue = ...
```

---

## 註解更新規則 (Comment Update Rules)

更新既有註解時，遵循以下規則以保留有價值的技術資訊：

### 保留原始錯誤資訊

當代碼包含錯誤碼、錯誤訊息時，**只能添加翻譯，不得刪除**：

```typescript
// ✅ 正確：保留原始錯誤碼和訊息
/**
 * 工具建立函式（避免 TypeScript 推導錯誤）
 * Tool creation function (avoids TypeScript inference errors)
 *
 * > error TS2742: 原始錯誤訊息 (保留不刪)
 */

// ❌ 錯誤：刪除原始錯誤資訊
/**
 * 工具建立函式
 * Tool creation function
 */
```

### Issue 連結需驗證相關性

新增 Issue/文件連結前，必須確認內容確實相關。無法確認時，應標註「可能相關，未驗證」。

### 更新前檢查清單

- [ ] 原始註解的技術資訊是否保留？（錯誤碼、版本號、檔案路徑等）
- [ ] 新增的連結是否已驗證相關性？
- [ ] 是否與代碼/問題/邏輯/意圖相關？

---

## 詳細註解內容參考 (Detailed Comment Content)

有關雙語註解的範例、JSDoc 模板與具體實作細節，請參閱技能文檔：

- [skills/analyze-code-commenter/SKILL.md](../skills/analyze-code-commenter/SKILL.md)

此處包含雙語註解模板、inline/block 使用準則及多種範例，作為撰寫與自動化註解的參考。

---

## 額外建議

- 對公開/內部 API、library 函式與複雜演算法務必補上完整範例或使用情境。
