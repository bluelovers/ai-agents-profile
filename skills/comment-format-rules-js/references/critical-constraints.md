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

**原因：** 特殊指令（如 `// @ts-ignore`）需要緊鄰目標代碼才能生效；區塊註解是說明性質，應放在特殊指令之前，以確保特殊指令正確作用於目標代碼。

### 常見特殊指令 (Common Special Directives)

| 指令 / Directive | 用途 / Purpose |
|-----------------|----------------|
| `// @ts-ignore` | 忽略 TypeScript 型別檢查錯誤 / Ignore TypeScript type checking errors |
| `// @ts-expect-error` | 預期會有型別錯誤（用於測試）/ Expect type errors (for testing) |
| `// eslint-disable` | 停用 ESLint 規則 / Disable ESLint rules |
| `// eslint-disable-next-line` | 停用下一行的 ESLint 規則 / Disable ESLint rules for next line |
| `// @ts-nocheck` | 停用整個檔案的 TypeScript 檢查 / Disable TypeScript checking for entire file |

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

某些命名（如 `Lazy`、`Helper`、`Util`）可能只是組織慣例，而非特定技術意涵。註解時應：

- **不**為其添加原本沒有的意義
- 如果有必要則明確標記為「命名慣例」或「無特殊含義」
- 或者直接忽略，視為不存在（避免多餘無意義註解）

### 如何判斷無特殊含義

| 命名 / Naming | 判斷方式 / How to Check |
|---------------|------------------------|
| `Lazy` | 檢查是否有延遲執行邏輯（Promise、callback、getter、計算屬性）。若無，則為命名慣例 |
| `Helper` / `Util` | 檢查是否僅是工具函式集合。若無特定領域抽象，則為命名慣例 |
| `Base` / `Core` | 檢查是否有繼承或組合關係。若僅是組織結構，則為命名慣例 |
| `Impl` | 檢查是否有介面/抽象類。若無，則為命名慣例 |

若無對應的設計模式或技術含義，則視為命名慣例。

### 正確範例

```typescript
/**
 * 配置獲取值型別
 * Config getter value type
 *
 * @note Lazy 為命名慣例，無「延遲/惰性」意涵
 * @note Lazy is a naming convention, no "lazy/惰性" meaning
 */
export type ILazyConfigGetterValue = ...

/**
 * 工具函式集合
 * Utility functions collection
 *
 * @note Helper 為命名慣例，僅表示此模組為工具函式集
 * @note Helper is a naming convention, only indicates this module is a utility collection
 */
export class StringHelper { ... }
```

### 錯誤範例

```typescript
// ❌ 錯誤：為命名慣例添加原本不存在的意義
/**
 * 懶惰載入配置
 * Lazy load configuration
 *
 * 此類採用延遲初始化模式...
 * This class uses lazy initialization pattern...
 */
// 實際程式碼並無延遲執行邏輯

export type ILazyConfigGetterValue = ...

// ✅ 正確：若無法判斷，可標註為「可能相關，未驗證」
/**
 * 配置獲取值型別
 * Config getter value type
 *
 * @note 命名可能與 Lazy Loading 相關，未驗證
 * @note Naming may be related to Lazy Loading, unverified
 */
export type ILazyConfigGetterValue = ...
```
