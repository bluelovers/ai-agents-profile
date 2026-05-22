---
name: typescript-unimplemented-handler
description: 處理 TypeScript 類型系統無法實現的代碼模式。當遇到受限於 TypeScript 類型系統而無法實現的功能時，保留原始實作為註解並提供雙語說明。適用於：(1) 需要保留無法實現的類型定義時，(2) 處理 TypeScript 類型系統限制，(3) 為未來可能的實現預留參考。
tags:
  - typescript
  - type-system
  - unimplemented
  - limitations
  - documentation
  - agents/skills
---

# TypeScript 無法實現代碼處理器

本技能指導如何在 TypeScript 開發中處理因類型系統限制而無法實現的代碼，確保代码可维护性和未來擴展性。

## 核心原則

### 1. 保留為註解

當遇到 TypeScript 類型系統無法實現的功能時，**必須保留原始實現作為參考**。這不是簡單地刪除代碼，而是將其轉化為有意義的文檔。

```typescript
// ❌ 不正確：直接刪除無法實現的代碼
// 這會喪失重要的技術上下文

// ✅ 正確：保留原始實現為註解
// 原始實現：TypeScript 無法在編譯時實現動態類型推斷
// Original implementation: TypeScript cannot implement dynamic type inference at compile time
/**
 * 類型安全的配置驗證器
 * Type-safe configuration validator
 *
 * TODO: [TypeScript Limitation] 無法實現完整的運行時類型驗證
 *       原因：TypeScript 類型在編譯後會被移除，無法在運行時獲取類型資訊
 *       參考價值：了解類型系統的靜態特性 vs 運行時動態特性
 *       替代方案：使用 run-time type guard 或 zod/joi 等運行時驗證庫
 *
 * Original implementation (無法實現 / Not achievable):
 * ```typescript
 * type ExtractRuntimeType<T> = T extends infer U ? U : never;
 * // 嘗試在運行時獲取類型資訊 - 失敗
 * ```
 */
type IConfigValidator<T> = {
    validate: (value: unknown) => value is T;
};
```

### 2. 雙語說明

**所有無法實現的代碼都必須包含中文和英文說明**，確保不同背景的開發者都能理解。

```typescript
/**
 * 類型級別的遞迴深度計算
 * Type-level recursive depth calculation
 *
 * 原始實現 (不可行 / Not feasible):
 * ```typescript
 * type DeepNest<T, Depth extends number> = ...
 * // 嘗試實現任意深度遞迴 - 達到 TypeScript 遞迴深度限制
 * ```
 *
 * 限制原因 / Limitation reason:
 * TypeScript 對遞迴類型有深度限制（約 50-100 層），無法實現真正的無限深度類型
 * TypeScript has a recursion depth limit for types (approx 50-100 levels),
 * making true infinite depth types impossible
 */
```

### 3. TODO 標記

每個無法實現的類型都必須有清晰的 **TODO 標記**，說明：
- 為什麼無法實現
- 是否有替代方案
- 未來可能的實現方式

```typescript
// TODO: [TS-001] TypeScript 類型系統限制
// TODO: [TS-001] TypeScript type system limitation
// 
// 無法實現：/ Cannot implement:
// - 運行時類型反射 / Runtime type reflection
// - 動態類型生成 / Dynamic type generation
// 
// 替代方案：/ Alternative solutions:
// - 使用 class-transformer 或 zod 進行運行時驗證
// - Use class-transformer or zod for runtime validation
// 
// 未來可能：/ Future possibility:
// - TypeScript 5.x 引入了更多類型運算功能
// - TypeScript 5.x introduces more type manipulation features
```

## 處理流程

### 步驟 1：識別無法實現的類型

```
遇到類型錯誤
    │
    ▼
這是 TypeScript 類型系統限制嗎？
    │
    ├─ 是 → 進入無法實現處理流程
    │
    └─ 否 → 嘗試修復或尋找替代類型設計
```

### 步驟 2：分類限制類型

| 限制類型 | 範例 | 處理方式 |
|---------|------|---------|
| 運行時反射 | `typeof instance` 在類型上下文 | 使用 class-transformer |
| 遞迴深度 | 深層嵌套類型 | 設定合理的深度上限 |
| 條件類型複雜度 | 過於複雜的 infer 推斷 | 簡化或拆分類型 |
| 動態類型 | 根據運行時輸入生成類型 | 使用泛型或運行時驗證 |

### 步驟 3：生成保留代碼

```typescript
/**
 * [無法實現的類型定義]
 * [Unimplementable type definition]
 *
 * TODO: [TS-XXX] 具體限制描述
 *
 * 原始代碼：
 * ```typescript
 * // 這裡是原本嘗試實現但失敗的代碼
 * ```
 *
 * 限制原因：
 * - 中文說明 / English explanation
 *
 * 參考價值：
 * - 學習價值：了解 TypeScript 類型系統的限制
 * - 未來實現：當 TypeScript 版本更新時可能支援
 * - 替代方案：可以基於這些邏輯設計運行時解決方案
 */
```

## 常見無法實現模式

### 模式 1：運行時類型反射

```typescript
// ❌ 無法實現 / Cannot implement
/**
 * 嘗試從實例獲取運行時類型
 * Attempt to get runtime type from instance
 *
 * TODO: [TS-Reflection-001]
 * TypeScript 類型在編譯後被完全擦除，無法在運行時獲取類型資訊
 * TypeScript types are completely erased after compilation,
 * making runtime type information inaccessible
 *
 * 原始實現：
 * ```typescript
 * type InstanceType<T> = T extends new (...args: any) => infer R ? R : any;
 * // 問題：無法區分實例的具體類型成員
 * ```
 *
 * 替代方案：
 * - 使用 zod/joi/ Yup 等運行時驗證庫
 * - 使用 class-transformer 的 class-transformer
 * - 為每個類型手動定義 runtime type guard
 */
```

### 模式 2：動態條件類型

```typescript
// ❌ 無法實現 / Cannot implement
/**
 * 根據運行時值動態推斷類型
 * Dynamically infer type based on runtime value
 *
 * TODO: [TS-Conditional-001]
 * TypeScript 條件類型只能在編譯時求值，無法根據運行時數據動態生成類型
 * TypeScript conditional types can only be evaluated at compile time,
 * cannot dynamically generate types based on runtime data
 *
 * 原始實現：
 * ```typescript
 * type DynamicType<T> = T extends string 
 *   ? StringProcessor<T> 
 *   : T extends number 
 *   ? NumberProcessor<T>
 *   : UnknownProcessor;
 * // 問題：無法根據運行時的實際值類型來選擇類型
 * ```
 */
```

### 模式 3：深度遞迴類型

```typescript
// ❌ 無法實現 / Cannot implement
/**
 * 任意深度的嵌套類型
 * Arbitrarily deep nested types
 *
 * TODO: [TS-Recursion-001]
 * TypeScript 對遞迴類型有深度限制（約 50-100 層取決於複雜度）
 * TypeScript has depth limits for recursive types
 * (approx 50-100 levels depending on complexity)
 *
 * 原始實現：
 * ```typescript
 * type DeepNest<T, N extends number> = 
 *   N extends 0 ? T : DeepNest<{ [K in keyof T]: DeepNest<T[K], [-1] extends [N] ? never : N] }, [-1] extends [N] ? never : N>;
 * // 問題：達到最大遞迴深度時會出現錯誤
 * ```
 *
 * 替代方案：
 * - 設定合理的最大深度（如 10 層）
 * - 使用迭代而非遞迴
 * - 使用特定的工具類型（如 DeepPartial）而非通用實現
 */
```

## 組織結構

### 使用說明

本技能包含以下內容：

- **SKILL.md** (本檔案)：核心處理原則和流程
- **references/limitations.md**：常見 TypeScript 類型系統限制詳細說明
- **references/alternatives.md**：替代方案和運行時解決方案
- **references/examples.md**：完整的無法實現類型處理範例

### 載入時機

當遇到以下情況時，載入相關參考文檔：

1. 遇到 TypeScript 類型錯誤且無法通過正常方式解決
2. 需要為無法實現的功能預留擴展點
3. 需要為未來的 TypeScript 版本更新做準備
4. 需要為團隊提供類型系統限制的文檔

### 參考資源

詳見：
- [limitations.md](references/limitations.md) - TypeScript 類型系統限制清單
- [alternatives.md](references/alternatives.md) - 運行時替代方案
- [examples.md](references/examples.md) - 完整處理範例
