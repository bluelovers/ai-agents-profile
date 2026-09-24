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
| **Primitive Obsession** | **強化：** 使用 `interface`/`type`/`enum` 建立型別層次，提供編譯期保護；業務狀態或數字旗標優先採用 `enum` 而非字串/數字聯合（如 `0 \| 1` 魔術數字），避免日後二度重構。 |
| **Data Clumps** | **強化：** 執行 **SSoT 原則（最優先原則）**，同領域型別優先使用 `extends` 繼承，重複邏輯抽離共用。 |
| **Duplicate Code** | **強化：** 執行 **SSoT 原則**，重複邏輯（計算、校驗、轉換）必須抽離為共用模組，杜絕各處各自維護與更新遺漏。 |
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
- 業務狀態或數字旗標優先使用 `enum` 而非字串或數字聯合型別（如 `0 \| 1` 魔術數字），避免日後因需求擴展再次將字面值聯合重構為 Enum
- 使用 Interface 繼承建立型別層次

### Data Clumps & Duplicate Code → Single Source of Truth (SSoT)

**經典定義：** 相同的資料群組在多處重複出現；重複程式碼散落各處

**TS/Node 增強：**
- **SSoT 為最高原則**：架構設計、實作與重構時置於首要地位
- **同領域型別優先繼承**：同領域或重複定義的型別，優先使用 `extends` 建立血緣繼承關係，而非各自獨立定義
- **重複邏輯抽離共用**：計算、驗證與轉換等業務邏輯抽離為共用函式，消除散落各處各自維護與更新不一致
- **阻礙測試或複用時抽離細化**：當實作難以測試或複用時，應抽離細化為獨立純函式單元，**嚴禁為了測試而複製邏輯**，防止脫離 SSoT
- **優先採用 Enum**：有限狀態集或數字標記優先設計為 Enum，一步到位確立型別與數值的單一事實來源
- **型別可追溯性**：使用索引存取或 `Pick` 保持引用鏈，確保型別變更自動傳播

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
