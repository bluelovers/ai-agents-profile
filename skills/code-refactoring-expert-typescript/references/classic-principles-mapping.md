---
tags:
  - documentation/references
  - refactoring
  - TypeScript
  - nodejs
---

# 經典重構原則與 TypeScript/Node.js 對照表

## 概述

本文檔對照經典重構原則（Martin Fowler《重構》）與現代 TypeScript/Node.js 開發環境的調整與增強。

---

## 對照總表

| 經典原則 (Classic) | 現代 TS/Node.js 調整 |
| :--- | :--- |
| **Long Method** (> 20 lines) | **強化：** 若包含多個 `async`/`await`，視為潛在的 **Asynchronous Bottleneck**。必須分解 I/O 操作。 |
| **Primitive Obsession** | **強化：** 使用 `interface`/`type`/`enum` 建立型別層次，提供編譯期保護。 |
| **Data Clumps** | **強化：** 執行 **SSoT 原則**，使用 `extends` 或巢狀組合建立資料關係。 |
| **Replace Conditional with Polymorphism** | **適用性高：** 透過 Interface Implementation 實現，或使用 **Discriminated Unions** 進行型別安全分派。 |
| **Switch Statements** | **調整：** 在 TS 中，Discriminated Unions 搭配 switch 是類型安全的最佳實踐，不應一概視為壞味道。 |
| **Long Parameter List** | **調整：** 現代 TS 常見 Options Pattern `function foo({ a, b, c }: IOptions)`，參數數量限制應放寬至邏輯複雜度導向。 |
| **Dead Code** | **新增考量：** 檢查是否為未釋放的資源或事件監聽器 (**Memory Leak Risk**)。 |

---

## 詳細說明

### Long Method → Asynchronous Bottleneck

**經典定義：** 方法超過 20 行

**TS/Node 增強：**
- 非同步函式的「複雜度」應考慮 `await` 呼叫數量而非單純行數
- 連續 3 個以上的獨立 I/O 操作應考慮分解
- 每個 I/O 步驟應可獨立測試

### Primitive Obsession → Strict Type Control

**經典定義：** 使用原始型別而非小物件

**TS/Node 增強：**
- 不僅要建立物件，更要使用 TypeScript 的型別系統
- 業務狀態優先使用 `enum` 而非字串聯合型別
- 使用 Interface 繼承建立型別層次

### Data Clumps → Single Source of Truth

**經典定義：** 相同的資料群組在多處重複出現

**TS/Node 增強：**
- 提取為獨立的 Interface/Type
- 使用 `extends` 建立繼承關係
- 使用巢狀組合而非重複定義

### Switch Statements → Discriminated Unions

**經典定義：** 可使用多型取代的條件語句

**TS/Node 調整：**
- 在 TypeScript 中，`switch` 搭配 Discriminated Unions 是類型安全的
- 編譯器會檢查 exhaustive cases
- 不應一概視為壞味道

---

## 新增氣味 (TS/Node 特有)

| 新增氣味 | 描述 | 對應重構 |
| :--- | :--- | :--- |
| **Asynchronous Bottleneck** | 過多連續 `await` 導致的測試困難 | Extract Async Method |
| **Memory Leak Risk** | 未正確釋放的 EventEmitter/Stream | Introduce Resource Management |
| **any Type Abuse** | 過度使用 `any` 失去型別安全 | Replace with Unknown + Type Guard |
