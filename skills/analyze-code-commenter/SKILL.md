---
name: analyze-code-commenter
description: Analyze code and add bilingual comments (Traditional Chinese zh-TW + English). Use when users request (1) Adding comments to code, (2) Code documentation, (3) Explaining code logic with comments, (4) "為代碼添加註解", (5) "分析並註解程式碼", (6) "為代碼更新註解", (6) "為代碼修正註解", (7) "重構代碼更新註解", (8) "雙語註釋/雙語註解". Uses ONLY block comments (single-line or multi-line). Never uses inline comments.
---

# Analyze Code Commenter

Add bilingual comments (Traditional Chinese zh-TW + English) to code without modifying original formatting.
**Uses only block comments (`/** ... */`) - never inline comments (`//`).**

## Workflow

1. **Read code** - Load target file completely
2. **Analyze structure** - Identify:
   - Core business logic and algorithms
   - Class members/methods/properties
   - Complex internal logic blocks, functions, and array/object elements
3. **Identify logic blocks** - Find all logic blocks requiring comments (see Logic Block Requirements below)
4. **Generate bilingual comments** (Traditional Chinese zh-TW + English) - Apply format rules below
5. **Apply changes** - Insert comments using `edit_file` tool

## Logic Block Requirements (Required for ALL logic blocks)

**All logic blocks MUST be commented, including private/non-public internal logic.** Comments help future developers understand complex control flow, business rules, and edge case handling.

### What are Logic Blocks?

Logic blocks are code sections that implement specific functionality, including but not limited to:

| Type | Examples |
|------|----------|
| Control flow | `if/else`, `switch/case`, `try/catch/finally`, loop blocks |
| Business logic | Data transformation, validation, calculation algorithms |
| Conditional branches | Complex conditions with multiple operators |
| Nested logic | Nested loops, nested conditionals, callback functions |
| Error handling | Exception catching, fallback logic, retry mechanisms |
| State management | State transitions, state machine logic |
| Data processing | Array operations, filtering, mapping, reducing |

### Comment Requirements for Logic Blocks

- **ALL logic blocks require comments** - No exception for private/internal logic
- **Explain WHY, not just WHAT** - Focus on business purpose and intent
- **Complex conditions need explanation** - Document the reasoning behind complex boolean expressions
- **Edge cases must be documented** - Explain why certain conditions are handled

### Examples of Logic Blocks Requiring Comments

```typescript
// ❌ Avoid: Complex logic without comments
if (user.isActive && subscription.status === 'active' &&
	(payment.lastPaymentDate > thirtyDaysAgo || payment.isAutoRenew))
{
	// grant access
}

// ✅ Prefer: Complex conditions with explanation (using block comment)
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

```typescript
// ❌ Avoid: Nested logic blocks without comments
async function processOrder(order)
{
	const validated = validateOrder(order);
	if (validated)
	{
		const inventory = await checkInventory(order.items);
		if (inventory.available)
		{
			await reserveInventory(order.items);
			if (order.payment.method === 'card')
			{
				// process payment
			}
		}
	}
}

// ✅ Prefer: Each logic block explained with block comments
async function processOrder(order)
{
	/**
	 * 驗證訂單資料格式與必填欄位
	 * Validate order data format and required fields
	 */
	const validated = validateOrder(order);
	if (validated)
	{
		/**
		 * 檢查庫存是否足夠
		 * Check if inventory is sufficient
		 */
		const inventory = await checkInventory(order.items);
		if (inventory.available)
		{
			/**
			 * 預留庫存以防止超賣
			 * Reserve inventory to prevent overselling
			 */
			await reserveInventory(order.items);
			/**
			 * 信用卡支付需要額外驗證
			 * Card payments require additional verification
			 */
			if (order.payment.method === 'card')
			{
				// process payment
			}
		}
	}
}
```

### Priority for Logic Block Comments

1. **High Priority** - Complex nested logic (3+ levels), business rules, critical paths
2. **Medium Priority** - Conditional branches, loop logic, error handling
3. **Low Priority** - Simple one-line conditions, straightforward logic

## Bilingual Comment Format Rules

## All Members Use Block Comments (Required)

**All members must use block comments (`/** ... */`), NOT inline comments (`// ...`).**

The format depends on how much explanation is needed:
- **Simple/brief explanation**: Use single-line block comment `/** 說明 / Description */`
- **Detailed explanation or long comment** (e.g., bilingual translation makes comment longer): Use multi-line block comment `/** ... */`

### Member Types Requiring Block Comments

| Category | Examples |
|----------|----------|
| Type definitions | `enum` members, `interface` members, `type` members |
| Class members | Properties, methods, constructors |
| Function members | Parameters, return values |
| Variable declarations | `const`, `let`, `var` with assignment |
| Object members | Object properties, return statement members |

### Core Principles

| Item | Rule |
|------|------|
| **Comment Type** | **MUST use block comments (`/** ... */`), NEVER inline comments (`//`)** |
| Position | Each member gets its own block comment, placed **above** the member |
| Comment Length | Brief explanation: single-line block `/`** 說明 / Description */`<br>Detailed or long explanation: multi-line block `/** ... */` |
| Bilingual Format | Two formats allowed:<br>1. Chinese first, English translation after (separated by `/`)<br>2. Chinese above, English translation below |

---

#### Applicable Scope (Full List)
- `enum` members
- `interface` members
- `type` members
- `class` properties and methods
- Function parameters and return values
- Variable declarations (`const`/`let`/`var`)
- Object properties (including return statement members)
- Object shorthand properties

---

### Wrong Format vs Correct Format

#### Wrong Format (Using Inline Comments)
```typescript
// ❌ Using inline comments for members (WRONG)
export interface IOptionsForMap<T>
{
	getKey?,    // 取得分組鍵的函式
	init?,      // 初始化 Map 的函式
}

const config = loadConfig();    // 載入配置
return {
	cwd,        // 當前工作目錄
	modules,    // 找到的模組
}
```

#### Correct Format (Using Block Comments)
```typescript
// ✅ Using block comments for members (CORRECT)
export interface IOptionsForMap<T>
{
	/**
	 * 取得分組鍵的函式 / Function to get grouping key
	 *
	 * @param item - 要分組的元素 / Element to group
	 * @param index - 元素在陣列中的索引 / Index of element in array
	 * @param arr - 陣列本身 / Array itself
	 */
	getKey?(item: T, index: number, arr: T[]): any

	/** 初始化 Map 的函式 / Function to initialize Map */
	init?(): Map<any, T[]>,
}

/** 載入應用程式配置 / Load application configuration */
const config = loadConfig();

return {
	/** 當前工作目錄 / Current working directory */
	cwd,
	/** 找到的模組陣列 / Array of found modules */
	modules,
}
```

---

### Single-line vs Multi-line Block Comments

The choice depends on **how much explanation is needed** (not code complexity).

> **Preserve Existing Style**:
> - If existing comment is already using single-line or multi-line format correctly, do NOT change it
> - Both formats are valid bilingual styles:
>   - Single-line: `/** 说明 / Description */`
>   - Multi-line: `/** 说明 * Description */`
> - Only adjust when the format violates the rules (e.g., using inline comments instead of block comments, or single-line comment is too long for readability)

#### Single-line Block Comment
Use when the explanation is brief:

```typescript
/** 是否成功 / Whether successful */
const isActive = true;

/** 使用者名稱 / User name */
userName: string;

/** 取得列表 / Get list */
getItems(): Item[];
```

#### Multi-line Block Comment
Use when detailed explanation is needed OR the comment is long (e.g., bilingual translation makes it longer):

```typescript
/**
 * 取得分組鍵的函式
 * Function to get grouping key
 *
 * @param item - 要分組的元素 / Item to be grouped
 * @param index - 元素在陣列中的索引 / Index in array
 * @param arr - 陣列本身 / The array itself
 */
getKey?(item: T, index: number, arr: T[]): any

/**
 * 解析 URL 查詢參數為鍵值對象
 * Parse URL query string into key-value object
 *
 * 處理步驟：
 * 1. 取得目前的搜尋參數
 * 2. 轉換為鍵值對象
 * 3. 返回結果
 */
const queryParams = new URLSearchParams(window.location.search);
```

---

## JSDoc (methods/classes/properties)

```typescript
/**
 * 繁體中文說明
 * English Description
 *
 * 詳細解釋「為什麼」而非「做什麼」。未來修改或除錯時可快速理解代碼意圖。
 * Explain "why" not just "what". Helps future self or others quickly understand the code's intent during maintenance or debugging.
 *
 * @param {type} name - 參數說明 / Parameter description
 * @returns {type} 返回值說明 / Return description
 */
```

### Logic Block Comments

For logic blocks (if/else, loops, try/catch, etc.), use block comments above the block:

```typescript
/** 檢查使用者權限 / Check user permissions */
if (user.hasAccess)
{
	// logic
}

/** 遍历所有项目并处理 / Iterate through all items and process */
for (const item of items)
{
	// logic
}

/** 尝试保存数据，失败时回滚 / Attempt to save data, rollback on failure */
try
{
	// logic
}
catch (error)
{
	// error handling
}
```

#### Multiple Single-line Block Comments Rule

**NEVER use multiple single-line block comments for the same code element.** Merge them into one multi-line block comment.

```typescript
// ❌ Avoid: Multiple single-line block comments (WRONG)
/** 驗證訂單資料格式與必填欄位 */
/** Validate order data format and required fields */
const validated = validateOrder(order);

// ✅ Correct: Merge into single multi-line block comment
/**
 * 驗證訂單資料格式與必填欄位
 * Validate order data format and required fields
 */
const validated = validateOrder(order);
```

#### Multiple Logic Blocks Rule

When adding comments to **3 or more consecutive logic blocks**, use multi-line block comment:

```typescript
/**
 * 逻辑说明一 / Logic description one
 *
 * 逻辑说明二 / Logic description two
 *
 * 逻辑说明三 / Logic description three
 */
```

#### Logic Comments Placement (Internal Implementation Details)

**Core Principle**: Comments about implementation logic should be placed **near the code logic**, not in JSDoc documentation. Only document what is helpful for **callers** in JSDoc.

| Location | What to Document |
|----------|------------------|
| **JSDoc (function/class level)** | API usage, parameters, return values, public contracts, side effects visible to callers |
| **Logic block (inside function)** | Internal implementation reasoning, specific business rules, why this approach was chosen, edge case handling |

**Rationale**:
- JSDoc is for external consumers/callers - it describes the "contract"
- Internal logic comments are for maintainers - they explain "why" the code does what it does internally
- Placing logic comments near the code helps future developers understand the implementation without jumping between documentation and code

**Examples**:

```typescript
// ❌ Avoid: Putting internal logic explanations in JSDoc
/**
 * Process user data
 *
 * 1. Validates input
 * 2. Checks cache
 * 3. Fetches from database if not cached
 *
 * @param userId - User identifier
 * @returns Processed user data
 */
function getUserData(userId: string): UserData {
    // ... implementation
}

// ✅ Prefer: JSDoc for callers, logic comments near code
/**
 * 取得使用者資料
 * Get user data
 *
 * @param userId - 使用者識別碼 / User identifier
 * @returns 使用者資料 / User data
 */
function getUserData(userId: string): UserData {
    /** 檢查快取是否已有資料 / Check if data exists in cache */
    const cached = cache.get(userId);
    if (cached) {
        return cached;
    }

    /**
     * 資料不在快取中，需從資料庫取得
     * Data not in cache, need to fetch from database
     *
     * 特定業務規則：因為使用者可能被停用，所以需要檢查狀態
     * Specific business rule: need to check status because user may be disabled
     */
    const user = database.find(userId);
    if (user && user.status === 'active') {
        cache.set(userId, user);
    }

    return user;
}
```

```typescript
// ✅ Good: Important business logic in BOTH JSDoc AND near code
// When logic affects the API contract, document it in JSDoc for callers
// 同時在 JSDoc 和程式碼區塊中說明重要的業務邏輯

/**
 * 檢查使用者是否有權存取資源
 * Check if user has permission to access resource
 *
 * 權限判斷條件 / Permission check conditions:
 * 1. 使用者必須處於啟用狀態 / User must be active
 * 2. 必須有專業版訂閱 / Must have Pro subscription
 * 3. 資源為本人建立 或 資源為公開 / Resource created by user OR resource is public
 *
 * @param user - 使用者物件 / User object
 * @param resource - 資源物件 / Resource object
 * @returns 是否允許存取 / Whether access is allowed
 */
function canAccess(user, resource) {
    /**
     * 執行權限檢查 / Perform permission check
     *
     * 判斷邏輯：/ Logic:
     * - 使用者狀態是否啟用 / Check if user is active
     * - 訂閱類型是否為 Pro / Check if subscription is Pro
     * - 資源是否為本人建立或是公開資源 / Check if resource is created by user or public
     */
    return user.isActive && user.subscription === 'pro' &&
        (resource.createdBy === user.id || resource.isPublic);
}
```

**Note 說明**: 當邏輯**影響 API 合約**（如權限判斷條件、驗證規則）時，應同時在 JSDoc 中說明，讓呼叫者了解行為。若邏輯僅是內部實現細節（如效能優化、内部演算法），則只需在程式碼區塊內說明。

---

#### JSDoc vs Logic Block Responsibility Separation (Preventing Information Redundancy)

**Core Principle / 核心原則：** JSDoc describes "contract/intent", logic blocks describe "implementation details".

| 位置 / Location | 應包含 / Should Include | 不應包含 / Should NOT Include |
|----------------|------------------------|------------------------------|
| **JSDoc** | 函式用途、設計邏輯、為什麼這樣設計 / Function purpose, design logic, why this design | 具體如何實現、程式碼語法細節 / How to implement, code syntax details |
| **邏輯區塊 / Logic Block** | 具體實作邏輯、技術細節（as any、運算子等）/ Specific implementation logic, technical details (as any, operators, etc.) | 為什麼要這樣設計 / Why this design |

**Error Example / 錯誤示範（資訊冗餘）：**

```typescript
/**
 * 處理資料（錯誤：將實作細節放在 JSDoc）
 * Process data (wrong: implementation details in JSDoc)
 *
 * 使用短路運算實現：(condition && value) || default  ← ❌ 冗餘
 */
function process(result) {
  /** 短路運算：(condition && value) || default */  ← ✅ 正確位置
  return condition && value || [];
}
```

**Correct Example / 正確範例：**

```typescript
/**
 * 從結果中取得舊版插件名稱
 * Get legacy plugin names from result
 *
 * 邏輯說明 / Logic description:
 * 1. 首先檢查 LEGACY_PLUGIN_NAME 是否與 PLUGIN_NAME 不同
 *    First check if LEGACY_PLUGIN_NAME is different from PLUGIN_NAME
 * 2. 只有當兩者不同時，才有意義區分「舊版插件」
 *    Only when the two are different does it make sense to distinguish "legacy plugin"
 */
function getLegacyPluginNamesFromResult(result) {
    /**
     * 條件判斷：確保新舊插件名稱確實不同
     * Condition check: ensure legacy and current plugin names are actually different
     *
     * 使用 `as any` 繞過 TypeScript 推導
     * 因為 TS 知道這兩個 const 永遠不同，但 runtime 可能會變化
     *
     * Uses `as any` to bypass TypeScript inference
     * Because TS knows these two consts are always different, but runtime may change
     *
     * 短路運算實現 / Short-circuit evaluation implementation:
     * (condition && value) || default
     * - 當 condition 為 true，回傳 value / When condition is true, return value
     * - 當 condition 為 false，回傳 [] / When condition is false, return []
     */
    return (LEGACY_PLUGIN_NAME !== PLUGIN_NAME as any) && result[LEGACY_PLUGIN_NAME] || [];
}
```

**Checklist / 檢查清單：**

- [ ] JSDoc 中是否包含「如何實現」的語法細節？（如短路運算、as any）
      Does JSDoc contain "how to implement" syntax details? (e.g., short-circuit evaluation, as any)
- [ ] 邏輯區塊內的註解是否僅描述「實作」，而非包含「設計意圖」？
      Do logic block comments only describe "implementation", not include "design intent"?

---

### Preserve Original Style

If original comments use block style `/** ... */`, preserve format and add English translation. Do not convert to inline comments.

**Do NOT change between single-line and multi-line formats** - both are valid bilingual styles:
- Single-line: `/** 说明 / Description */`
- Multi-line: `/** 说明 * Description */`

Only convert when the format violates the rules (e.g., using inline comments instead of block comments, or single-line comment is too long for readability)

## Critical Constraints

- **ALWAYS use block comments (`/** ... */`)** - Never use inline comments (`//`) for any code
- **NEVER** modify existing code formatting (indentation, line breaks, spaces)
- **NEVER** delete old commented-out code (e.g., `// old code...`, `/* old code... */`, or `/** @deprecated */`)
- **NEVER** convert existing CJK characters to Traditional Chinese - only use Traditional Chinese in NEW comments
- **NEVER** write "English + English" as fake bilingual comments - each comment pair MUST contain Traditional Chinese followed by English, not two English lines
- For key terms, add English in parentheses: `快取 (Cache)`, `佇列 (Queue)`, `遞迴 (Recursion)`

## Comment Update Rules (Preventing Comment Update Errors)

When updating existing comments, follow these additional rules to preserve valuable technical information.

### Rule 1: Preserve Original Error Information

When code contains error codes, error messages, or other original technical information, **only add translation, do NOT delete**.

```typescript
// ✅ Correct - Preserve original error code and message
/**
 * 工具建立函式（避免 TypeScript 推導錯誤）
 * Tool creation function (avoids TypeScript inference errors)
 *
 * > error TS2742: 原始錯誤訊息 (保留不刪)
 */

// ❌ Wrong - Delete original error information
/**
 * 工具建立函式
 * Tool creation function
 */
```

### Rule 2: Issue Links Must Verify Relevance

Before adding Issue/document links, must confirm the content is actually related.

```
新增條件：
1. 已閱讀 Issue 內容
2. 確認與代碼/問題/邏輯/意圖有直接關聯
3. 無法確認時 → 不新增，或標註「可能相關，未驗證」

Add conditions:
1. Have read the Issue content
2. Confirm direct relevance to code/problem/logic/intent
3. If unable to verify → Do not add, or mark as "possibly related, unverified"
```

### Rule 3: Value of Error Messages

| 資訊類型 / Information Type | 價值 / Value |
|---------------------------|-------------|
| 錯誤碼 (`TS2742`) | 可搜尋、可引用 / Searchable, can be referenced |
| 完整路徑 (`.pnpm/zod@4.1.8/...`) | 有助於定位問題 / Helps locate the problem |
| 錯誤描述 | 社群已知問題的驗證 / Verification of known community issues |

**這些都不應被視為「冗餘」而刪除。**
**These should NOT be deleted as "redundant".**

### Rule 4: Comment Update Checklist

每次更新他人註解前，確認：
Before updating others' comments, verify:

- [ ] 原始註解的技術資訊是否保留？（錯誤碼、版本號、檔案路徑等）
      Is original technical information preserved? (error codes, version numbers, file paths, etc.)
- [ ] 新增的連結是否已驗證相關性？
      Have added links been verified for relevance?
- [ ] 是否與 代碼/問題/邏輯/意圖 相關？
      Is it related to code/problem/logic/intent?

### Bilingual Comment Validation

Every bilingual comment MUST use block comment format:

```typescript
/**
 * 繁體中文說明
 * English description
 */

/**
 * 繁體中文說明 / English description
 */
```

**Incorrect patterns to avoid:**
```typescript
// ❌ Using inline comments (NOT allowed - must use block comments)
const value = 1; // 這是錯的

// ❌ English only (fake bilingual)
/**
 * Process data
 * Process data
 */

// ❌ Two English lines (no Chinese)
/**
 * English description
 * English description
 */

// ❌ English first, Chinese second (wrong order)
/**
 * English description / 繁體中文說明
 */

// ❌ English only (fake bilingual)
// Process data
// Process data
```

**Correct patterns:**
```typescript
// ✅ Single-line block comment
/** 繁體中文說明 / English description */

// ✅ Multi-line block comment
/**
 * 繁體中文說明
 * English description
 */

// ✅ All member comments use block comments
/** 當前工作目錄 / Current working directory */
const cwd = process.cwd();
```

**Correct patterns:**
```typescript
// ✅ Single-line block comment
/** 處理資料 / Process data */

// ✅ Multi-line block comment
/**
 * 處理使用者輸入資料並進行驗證
 * Process and validate user input data
 */

// ✅ Single-line with detail
/** 處理使用者輸入資料並進行驗證 / Process and validate user input data */
```

## Code Formatting Rules

The project-wide comment and formatting rules live in the repository rules. For guidance on comment placement, block vs inline preferences, and other project conventions, please refer to:

- [rules/comment-format-rules.md](../../rules/comment-format-rules.md)

## Examples

See [references/examples.md](references/examples.md) for detailed before/after examples covering:
- Class and member comments (using block comments)
- Complex logic blocks (using block comments)
- Array element comments (using block comments)
- Preserving original block comment style
- Single-line vs multi-line block comments
