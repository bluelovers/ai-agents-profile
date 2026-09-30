---
name: analyze-code-commenter
description: |-
  Analyze code and add bilingual comments (Chinese + English). Uses ONLY block comments (single-line or multi-line). Never uses inline comments.
  Comment format rules (block comment layout, bilingual format, comment placement, JSDoc structure, update rules) are defined by the comment-format-rules-js skill; this skill focuses on analyzing code to decide what needs comments.

  Use when users request (1) Adding comments to code, (2) Code documentation, (3) Explaining code logic with comments, or mention keywords such as:
  - "為代碼添加註解", "分析並註解程式碼", "為代碼更新註解", "為代碼修正註解"
  - "重構代碼更新註解", "雙語註釋/雙語註解", "添加註釋"
  - "程式碼註解", "文件註解", "JSDoc", "區塊註解", "註解格式"
  - "程式碼說明", "註釋翻譯"
  - "code comments", "bilingual comments", "block comments"
tags:
  - comments
  - bilingual
  - documentation
  - JSDoc
  - agents/skills
---

# Analyze Code Commenter

Add bilingual comments (Traditional Chinese zh-TW + English) to code without modifying original formatting.
**Uses only block comments (`/** ... */`) - never inline comments (`//`).**

> **Comment format rules are owned by [comment-format-rules-js](../comment-format-rules-js/SKILL.md)**
> this skill decides *where* comments are needed and *what* they should say.

## Workflow

1. **Read code** - Load target file completely
2. **Analyze structure** - Identify:
   - Core business logic and algorithms
   - Class members/methods/properties
   - Complex internal logic blocks, functions, and array/object elements
3. **Identify logic blocks** - Find all logic blocks requiring comments (see Logic Block Requirements below)
4. **Generate bilingual comments** (Traditional Chinese zh-TW + English) - apply the format rules from [comment-format-rules-js](../comment-format-rules-js/SKILL.md)
5. **Apply changes** - Insert comments using `edit_file` tool

## Logic Block Requirements (Required for ALL logic blocks)

> **Reference**: For detailed logic block comment rules (placement, merging, layout), see [comment-format-rules-js](../comment-format-rules-js/SKILL.md#邏輯區塊註解規範-logic-block-comments).

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

## What Needs Comments (Scope)

Each item below gets **its own block comment placed above the member**. The comment format (block vs inline, single-line vs multi-line, length, bilingual layout) is defined in [comment-format-rules-js](../comment-format-rules-js/SKILL.md).

| Category | Examples |
|----------|----------|
| Type definitions | `enum` members, `interface` members, `type` members |
| Class members | Properties, methods, constructors |
| Function members | Parameters, return values |
| Variable declarations | `const`, `let`, `var` with assignment |
| Object members | Object properties, return statement members |

**Applicable Scope (Full List)**

- `enum` members
- `interface` members
- `type` members
- `class` properties and methods
- Function parameters and return values
- Variable declarations (`const`/`let`/`var`)
- Object properties (including return statement members)
- Object shorthand properties

> **Reference**: For member comment format rules (block comment requirement, no `@property` in Interface/Type JSDoc, placement), see [comment-format-rules-js](../comment-format-rules-js/references/comment-placement.md#interface-與-type-成員註解規則) and [critical-constraints](../comment-format-rules-js/references/critical-constraints.md#區塊註解強制使用).
>
> **參考**：成員註解格式規範（強制區塊註解、Interface/Type 禁用 `@property`、放置位置）請參閱上述 comment-format-rules-js 文件。

## Bilingual Comment Content

When generating comment content, follow these rules (format details live in [comment-format-rules-js](../comment-format-rules-js/references/bilingual-comment-format.md)):

- **Each comment pair MUST contain Traditional Chinese followed by English** - never "English + English" fake bilingual comments
- **Technical terms keep bilingual notation on first occurrence**: `快取 (Cache)`、`佇列 (Queue)`、`遞迴 (Recursion)`
- **When bilingual hurts readability or runs long**, keep the clearest single language (see [彈性捨棄雙語原則](../comment-format-rules-js/references/bilingual-comment-format.md#彈性捨棄雙語原則-flexible-bilingual-omission))
- **Preserve comments in other languages** (Japanese, Korean, German, French, ...): keep the original language, then append zh-TW + English (see [保留其他語言的原始註解](../comment-format-rules-js/references/comment-update-rules.md#保留其他語言的原始註解-preserve-other-languages))

## Critical Constraints (Behavioral)

These behavioral rules apply to every edit this skill makes; format constraints (block comment enforcement, separators, special directives, technical terms) are defined in [comment-format-rules-js](../comment-format-rules-js/references/critical-constraints.md).

- **NEVER** modify existing code formatting (indentation, line breaks, spaces)
- **NEVER** delete old commented-out code (e.g., `// old code...`, `/* old code... */`, or `/** @deprecated */`)
- **NEVER** convert existing CJK characters to Traditional Chinese - only use Traditional Chinese in NEW comments
- **DELETE meaningless comments that merely restate the declaration keyword** (e.g., `/** 介面 / interface */` above `interface ISkillDef`, `/** 枚舉 */` above `enum`, `/** type */` above `type`) - they add no information and must be removed, not rewritten (see [無意義註解](../comment-format-rules-js/references/meaningless-comments.md))

## Comment Update Rules

When updating existing comments, preserve valuable technical information (error codes, file paths, issue links) and verify link relevance before adding any:

> **Reference**: [comment-update-rules](../comment-format-rules-js/references/comment-update-rules.md#註解更新規則-comment-update-rules) - 保留原始錯誤資訊、Issue 驗證、多語言註解保留、更新前檢查清單.

## Comment Format Rules (comment-format-rules-js)

All comment and formatting conventions for JS/TS live in the comment-format-rules-js skill. Consult it for:

- [comment-format-rules-js](../comment-format-rules-js/SKILL.md) — core principles, block comment layout, logic block comments, responsibility separation, critical constraints
- [雙語註解格式規範](../comment-format-rules-js/references/bilingual-comment-format.md) — format choice, language order, flexible omission, JSDoc tag bilingual format
- [註解位置規範](../comment-format-rules-js/references/comment-placement.md) — array elements, object properties, Interface/Type members, `@example` inline exception
- [重要約束](../comment-format-rules-js/references/critical-constraints.md) — block comment enforcement, separators, special directives, technical terms, non-semantic naming
- [註解更新規則](../comment-format-rules-js/references/comment-update-rules.md) — preserve original error info, issue verification, multilingual comments, update checklist
- [行內註解轉換工具](../comment-format-rules-js/references/convert-inline-to-block.md) — batch-convert `//` comments into block comments (`/** ... */`)

## Examples

See [references/examples.md](references/examples.md) for detailed before/after examples covering:
- Class and member comments (using block comments)
- Complex logic blocks (using block comments)
- Array element comments (using block comments)
- Preserving original block comment style
- Single-line vs multi-line block comments
