---
name: analyze-code-commenter
description: Analyze code and add bilingual comments (Traditional Chinese and English). Use when users request: (1) Adding comments to code, (2) Code documentation, (3) Explaining code logic with comments, (4) "為代碼添加註解", (5) "分析並註解程式碼". Preserves original formatting while adding detailed comments to core logic, complex blocks, functions, class members/methods, and array/object elements.
---

# Analyze Code Commenter

Add bilingual comments (Traditional Chinese zh-TW + English) to code without modifying original formatting.

## Workflow

1. **Read code** - Load target file completely
2. **Analyze structure** - Identify:
   - Core business logic and algorithms
   - Class members/methods/properties
   - Complex internal logic blocks, functions, and array/object elements
3. **Generate comments** - Apply format rules below
4. **Apply changes** - Insert comments using `edit_file` tool

## Comment Format Rules

### JSDoc (methods/classes/properties)

```typescript
/**
 * 繁體中文說明
 * English Description
 *
 * 詳細解釋「為什麼」而非「做什麼」。
 * Explain "why" not just "what".
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
| Array elements | Comment above element: `// 中文 / English` |
| Multiple (≥3 lines) | Use block format `/** ... */` instead of multiple `//` |

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
- For key terms, add English in parentheses: `快取 (Cache)`, `佇列 (Queue)`, `遞迴 (Recursion)`

## Examples

See [references/examples.md](references/examples.md) for detailed before/after examples covering:
- Class and member comments
- Complex logic blocks
- Array element comments
- Preserving original block comment style
- Long inline comments split across lines
