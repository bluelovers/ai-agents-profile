---
description: >-
  註解的強制性約束：一律使用區塊註解（含分隔線）、特殊指令的放置順序、更新時保留技術術語、
  識別無語義命名慣例，以及只寫行為事實與意圖、不寫設計原則口號與代碼編輯過程紀錄
  （關鍵字如漂移、SSOT、移動紀錄、任務報告僅為例示，判定依「描述代碼本身 vs 描述代碼如何被編輯」）。
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

/* ==================== Zod Schema 工廠函數 ==================== */

// ✅ 正確：使用多行區塊註解作為等號分隔線
/**
 * ============================================================
 * 差異比較工具 / Difference Comparison Utilities
 * ============================================================
 */

/*
 * ============================================================
 * 差異比較工具 / Difference Comparison Utilities
 * ============================================================
 */

// ✅ 正確：使用多行區塊註解作為分隔線
/**
 * ==================== Zod Schema 工廠函數 ====================
 */

/*
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
 */
Console2.prototype.Console = Console2

// ✅ 正確：區塊註解放在特殊指令之前
/**
 * 將 Console2 類別指派給原型屬性
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
// ✅ 正確：保留原始技術術語，並說明前置前提與意圖
/**
 * 經前置檢查已確認初始化，使用 Non-Null Assertion Operator (!) 斷言不為 null
 */
const value = nullableValue!;

// ❌ 錯誤：刪除原始技術術語（退化為口語化描述）
/**
 * 使用驚嘆號確保值不為空
 */
const value = nullableValue!;
```

## 只寫行為事實與意圖，不寫設計原則口號

註解必須描述代碼的**行為事實與意圖**（做什麼、為什麼這樣做），**不得描述代碼被編輯的過程**。

### 判準（先判定，再看詞表）

一句話若回答的是「這段代碼是怎麼被產生、搬移、整理出來的」，而非「這段代碼本身做什麼、為何如此設計」，即屬禁止——**與用詞無關**，不限於下表所列。自測兩問：

1. **主詞測試**：句子的主詞是代碼／行為，還是「本次修改／這次重構／我」？後者禁止。
2. **存續測試**：若日後代碼再次被搬移或重構，這句話會失效或需要改寫嗎？會過期的是過程紀錄；行為事實與意圖不會因重構而過期。

### 常見形態（例示，非窮舉）

未列出的措辭只要通過上述判定，同樣不寫；不得以「不在此表」為由另立變體規則。

| 形態 | 例句 |
|----------|--------------|
| 設計原則口號 | 「避免各處漂移」、「單一事實來源」、「SSOT：…」 |
| 位置／搬移紀錄 | 「已移至 F2」、「原位於 F1」 |
| 重構動機與集中紀錄 | 「為何集中：原本散落在三處，抽為純函式後…」 |
| 任務報告 | 「任務報告：已完成本檔重構」 |

```typescript
// ❌ 錯誤：設計原則口號與任務報告，未描述代碼行為
/**
 * 此常數與 F2 同步，避免漂移
 * SSOT：單一事實來源
 * 任務報告：已完成本檔重構
 */
export const MAX_RETRIES = 3;

// ❌ 錯誤：重構動機紀錄——描述代碼如何被整理，而非代碼做什麼
/**
 * 為何集中：權重欄位的推導原本散落在 genPrompt、renderTag、tagMixin 三處，
 * 抽為純函式後宿主只負責把狀態與副作用接上，被測邏輯與線上執行的是同一份程式碼
 */
export function deriveWeight(tag) {}

// ✅ 正確：行為事實與意圖
/**
 * 單次請求的最大重試次數；超過後直接回傳失敗，避免無限重試拖垮下游服務
 */
export const MAX_RETRIES = 3;
```

**原因：** 口號與過程紀錄不提供該代碼的業務定義，且迅速過期；歷程交由 git 記錄。

錯例、問題解析與更多改寫對照見 [錯誤註解案例 — 案例五](../../analyze-code-commenter/references/bad-comment-examples.md)（位於 `analyze-code-commenter`）。

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
 *
 * @note Lazy 為命名慣例，無「延遲/惰性」意涵
 */
export type ILazyConfigGetterValue = ...

/**
 * 工具函式集合
 *
 * @note Helper 為命名慣例，僅表示此模組為工具函式集
 */
export class StringHelper { ... }
```

### 錯誤範例

```typescript
// ❌ 錯誤：為命名慣例添加原本不存在的意義
/**
 * 懶惰載入配置
 *
 * 此類採用延遲初始化模式...
 */
// 實際程式碼並無延遲執行邏輯

export type ILazyConfigGetterValue = ...

// ✅ 正確：若無法判斷，可標註為「可能相關，未驗證」
/**
 * 配置獲取值型別
 *
 * @note 命名可能與 Lazy Loading 相關，未驗證
 */
export type ILazyConfigGetterValue = ...
```
