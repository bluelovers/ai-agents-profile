---
name: analyze-code-commenter
description: Analyze code and add bilingual comments (Traditional Chinese and English). Use when users request (1) Adding comments to code, (2) Code documentation, (3) Explaining code logic with comments, (4) "為代碼添加註解", (5) "分析並註解程式碼", (6) "為代碼更新註解", (6) "為代碼修正註解". Preserves original formatting while adding detailed comments to core logic, complex blocks, functions, class members/methods, and array/object elements.
---

# Analyze Code Commenter

Add bilingual comments (Traditional Chinese zh-TW + English) to code without modifying original formatting.

## Workflow

1. **Read code** - Load target file completely
2. **Analyze structure** - Identify:
   - Core business logic and algorithms
   - Class members/methods/properties
   - Complex internal logic blocks, functions, and array/object elements
3. **Generate bilingual comments** (Traditional Chinese zh-TW + English) - Apply format rules below
4. **Apply changes** - Insert comments using `edit_file` tool

## Bilingual Comment Format Rules

## Member Comment Format Rules (enum/interface/type/class/function return members)

### Core Principles
| Item | Rule |
|------|------|
| Position | Each member gets its own JSDoc block, placed **above** the member |
| Message Length | Short messages use single-line `/** */`, complex or multi-line use multi-line `/** */` |
| Bilingual Format | Two formats allowed:<br>1. Chinese first, English translation after (separated by `/`)<br>2. Chinese above, English translation below |

---

### Wrong Format vs Correct Format

#### Wrong Format
```typescript
/**
 * 將陣列元素分組為 Map 的選項
 * Options for grouping array elements into Map
 *
 * @property getKey - 取得分組鍵的函式 / Function to get grouping key
 * @property init - 初始化 Map 的函式 / Function to initialize Map
 */
export interface IOptionsForMap<T>
{
	getKey?(item: T, index: number, arr: T[]): any

	init?(): Map<any, T[]>,
}
```

#### Correct Format
```typescript
/**
 * 將陣列元素分組為 Map 的選項
 * Options for grouping array elements into Map
 */
export interface IOptionsForMap<T>
{
	/**
	 * 取得分組鍵的函式
	 * Function to get grouping key
	 *
	 * @param item - 要分組的元素
	 * @param index - 元素在陣列中的索引
	 * @param arr - 陣列本身
	 */
	getKey?(item: T, index: number, arr: T[]): any

	/** 初始化 Map 的函式 / Function to initialize Map */
	init?(): Map<any, T[]>,
}
```

---

### Applicable Scope
- `enum` members
- `interface` members
- `type` members
- `class` properties and methods
- Function parameters and return values

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

### Inline Comments

| Type | Format |
|------|--------|
| Short | `// 中文說明 / English description` |
| Long | Two lines: `// 中文說明` then `// English description` |
| Array/Object elements | Comment above element: `// 中文 / English` |
| Multiple (≥3 lines) | Use block format `/** ... */` instead of multiple `//` |
| Object shorthand properties | Block comment above property: `/** 中文說明 */ propertyName` |

#### Object Shorthand Property Comments

When adding comments to object shorthand properties (ES6 shorthand: `{ propertyName }` instead of `{ propertyName: propertyName }`), place the comment **above** the property using block comment format:

```typescript
// ❌ Avoid: Inline comment after property (wrong position)
return {
    cwd,      // 當前工作目錄
    modules,  // 找到的模組陣列
}

// ✅ Prefer: Block comment above property
return {
    /** 當前工作目錄 / Current working directory */
    cwd,
    /** 找到的模組陣列 / Array of found modules */
    modules,
}
```

This follows the project convention of placing comments above code, not after.

#### Return Statement Members

**All members in return statements must have comments.** This ensures the caller understands what each returned value represents.

```typescript
// ❌ Avoid: Return members without comments
return {
    cwd,
    modules,
}

// ✅ Prefer: All return members have comments
return {
    /** 當前工作目錄 / Current working directory */
    cwd,
    /** 找到的模組陣列 / Array of found modules */
    modules,
}
```

#### Multiple Comments Rule

When adding **3 or more consecutive inline comments**, use block comment format:

```typescript
// ❌ Avoid: Multiple single-line comments
// 中文說明一
// English description one
// 中文說明二
// English description two
// 中文說明三
// English description three

// ✅ Prefer: Block comment format
/**
 * 中文說明一
 * English description one
 *
 * 中文說明二
 * English description two
 *
 * 中文說明三
 * English description three
 */
```

### Preserve Original Style

If original comments use block style `/** ... */`, preserve format and add English translation. Do not convert to inline comments.

## Critical Constraints

- **NEVER** modify existing code formatting (indentation, line breaks, spaces)
- **NEVER** delete old commented-out code (e.g., `// old code...` or `/* ... */`)
- **NEVER** convert existing CJK characters to Traditional Chinese - only use Traditional Chinese in NEW comments
- **NEVER** write "English + English" as fake bilingual comments - each comment pair MUST contain Traditional Chinese followed by English, not two English lines
- For key terms, add English in parentheses: `快取 (Cache)`, `佇列 (Queue)`, `遞迴 (Recursion)`

### Bilingual Comment Validation

Every bilingual comment MUST follow this pattern:
```
// 繁體中文說明 / English description

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
// ❌ English only / English only (fake bilingual)
// Process data / Process data

// ❌ Two English lines (no Chinese)
// Process the data
// Process the data

// ❌ English first, Chinese second (wrong order)
// English description / 繁體中文說明

// ❌ Two English lines (no Chinese)
/**
 * English description
 * English description
 */
```

**Correct patterns:**
```typescript
// ✅ Traditional Chinese + English
// 處理資料 / Process data

// ✅ Two-line format for longer comments
// 處理使用者輸入資料並進行驗證
// Process and validate user input data

/**
 * 處理使用者輸入資料並進行驗證
 * Process and validate user input data
 */

/**
 * 處理使用者輸入資料並進行驗證 / Process and validate user input data
 */
```

## Code Formatting Rules

The project-wide comment and formatting rules live in the repository rules. For guidance on comment placement, block vs inline preferences, and other project conventions, please refer to:

- [rules/comment-format-rules.md](../../rules/comment-format-rules.md)

## Examples

See [references/examples.md](references/examples.md) for detailed before/after examples covering:
- Class and member comments
- Complex logic blocks
- Array element comments
- Preserving original block comment style
- Long inline comments split across lines
