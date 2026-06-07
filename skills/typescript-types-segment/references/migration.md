---
title: TypeScript Semantic Types Migration Guide
description: >-
  從原始型別遷移至語意化型別的完整步驟指南。
  包含識別目標、批次重構、測試驗證的流程說明。
tags:
  - typescript
  - type-system
  - semantic-types
  - migration
  - refactoring
  - agents/skills
  - documentation/references
---

# 語意化型別遷移指南 | Migration Guide

本文件說明如何將現有程式碼從原始型別（`string`、`number`）逐步遷移至語意化型別別名。

---

## 遷移策略

### 1. 識別遷移目標

從以下方向尋找候選：

- **外部 API 邊界**：函式參數與回傳值
- **業務核心模型**：Domain Model 中的關鍵實體
- **重複出現的 magic values**：時間戳、ID、金額等
- **含糊的註解**：well-named type 本身就是最好的文件

### 2. 批次重構

依風險與優先級分階段進行：

```
階段 1：新增型別定義檔案（不修改使用處）
    ↓
階段 2：在單一模組內啟用型別別名
    ↓
階段 3：橫向擴展至相關模組
    ↓
階段 4：清理多餘的型別別名（如 ITimestampUnknown → ITimestampUnix）
```

### 3. 測試驗證

每次重構後確保：

- TypeScript 編譯無誤
- 相關單元測試通過
- IDE 自動補全正常運作

---

## 工具輔助

善用 IDE 與工具的型別檢查功能加速遷移：

- TypeScript 編譯器 (`tsc --noEmit`)
- ESLint 規則（`@typescript-eslint/restrict-plus-operands` 等）
- IDE 的型別提示與重構功能

---

## 常見問題

**Q: 型別別名會增加 bundle size 嗎？**
A: 不會。TypeScript 型別別名在編譯後完全移除，零 runtime overhead。

**Q: 何時應該使用 `interface` 而非 `type`？**
A: 語意化型別別名的目的是為了**約束值**而非描述形狀，統一使用 `type` 別名。

**Q: 模板字面量型別（Template Literal Types）的效能如何？**
A: 現代 TypeScript 編譯器對模板字面量型別有良好的優化，但若型別定義過於複雜可能影響 IDE 性能。適度使用即可。
