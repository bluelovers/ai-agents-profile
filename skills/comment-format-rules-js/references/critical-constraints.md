---
description: >-
  註解的強制性約束：一律使用區塊註解（含分隔線）、特殊指令的放置順序、更新時保留技術術語
  與識別無語義命名慣例。
tags:
  - comments/format
  - documentation/jsdoc
  - documentation/references
---

# 重要約束 (Critical Constraints)

## 區塊註解強制使用

- **一律使用區塊註解 (`/** ... */`)** - 任何代碼都不使用行內註解 (`//`)
- **例外**：JSDoc `@example` 區塊內、特殊指令（`// @ts-ignore` 等）

### 分隔線註解規則

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

## 特殊指令放置規則

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

## 保留技術術語

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

## 識別無語義命名慣例

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
