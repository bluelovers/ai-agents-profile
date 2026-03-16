---
name: analyze-code-commenter
description: Analyze code and add bilingual comments (Traditional Chinese zh-TW + English). Use when users request (1) Adding comments to code, (2) Code documentation, (3) Explaining code logic with comments, (4) "為代碼添加註解", (5) "分析並註解程式碼", (6) "為代碼更新註解", (6) "為代碼修正註解". Uses ONLY block comments (single-line or multi-line). Never uses inline comments.
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
    (payment.lastPaymentDate > thirtyDaysAgo || payment.isAutoRenew)) {
    // grant access
}

// ✅ Prefer: Complex conditions with explanation (using block comment)
/**
 * 檢查使用者是否有有效訂閱且最近有付款記錄
 * 或啟用自動續訂功能的使用者
 * Check if user has active subscription with recent payment OR auto-renew enabled
 */
if (user.isActive && subscription.status === 'active' &&
    (payment.lastPaymentDate > thirtyDaysAgo || payment.isAutoRenew)) {
    // grant access
}
```

```typescript
// ❌ Avoid: Nested logic blocks without comments
async function processOrder(order) {
    const validated = validateOrder(order);
    if (validated) {
        const inventory = await checkInventory(order.items);
        if (inventory.available) {
            await reserveInventory(order.items);
            if (order.payment.method === 'card') {
                // process payment
            }
        }
    }
}

// ✅ Prefer: Each logic block explained with block comments
async function processOrder(order) {
    /**
     * 驗證訂單資料格式與必填欄位
     * Validate order data format and required fields
     */
    const validated = validateOrder(order);
    if (validated) {
        /**
         * 檢查庫存是否足夠
         * Check if inventory is sufficient
         */
        const inventory = await checkInventory(order.items);
        if (inventory.available) {
            /**
             * 預留庫存以防止超賣
             * Reserve inventory to prevent overselling
             */
            await reserveInventory(order.items);
            /**
             * 信用卡支付需要額外驗證
             * Card payments require additional verification
             */
            if (order.payment.method === 'card') {
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
if (user.hasAccess) {
    // logic
}

/** 遍历所有项目并处理 / Iterate through all items and process */
for (const item of items) {
    // logic
}

/** 尝试保存数据，失败时回滚 / Attempt to save data, rollback on failure */
try {
    // logic
} catch (error) {
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

### Preserve Original Style

If original comments use block style `/** ... */`, preserve format and add English translation. Do not convert to inline comments.

## Critical Constraints

- **ALWAYS use block comments (`/** ... */`)** - Never use inline comments (`//`) for any code
- **NEVER** modify existing code formatting (indentation, line breaks, spaces)
- **NEVER** delete old commented-out code (e.g., `// old code...`, `/* old code... */`, or `/** @deprecated */`)
- **NEVER** convert existing CJK characters to Traditional Chinese - only use Traditional Chinese in NEW comments
- **NEVER** write "English + English" as fake bilingual comments - each comment pair MUST contain Traditional Chinese followed by English, not two English lines
- For key terms, add English in parentheses: `快取 (Cache)`, `佇列 (Queue)`, `遞迴 (Recursion)`

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
