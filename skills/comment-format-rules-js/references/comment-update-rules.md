---
description: >-
  更新既有註解時的規則：保留原始錯誤資訊與技術細節、驗證 Issue 連結相關性，
  以及更新前的檢查清單。
tags:
  - comments/format
  - documentation/jsdoc
  - documentation/references
---

# 註解更新規則 (Comment Update Rules)

更新既有註解時，遵循以下規則以保留有價值的技術資訊。

## 保留原始錯誤資訊

當代碼包含錯誤碼、錯誤訊息時，**只能添加翻譯，不得刪除**：

```typescript
// ✅ 正確：保留原始錯誤碼和訊息
/**
 * 工具建立函式（避免 TypeScript 推導錯誤）
 * Tool creation function (avoids TypeScript inference errors)
 *
 * > error TS2742: 原始錯誤訊息 (保留不刪)
 */

// ❌ 錯誤：刪除原始錯誤資訊
/**
 * 工具建立函式
 * Tool creation function
 */
```

## Issue 連結需驗證相關性

新增 Issue/文件連結前，必須確認內容確實相關。無法確認時，應標註「可能相關，未驗證」。

## 更新前檢查清單

- [ ] 原始註解的技術資訊是否保留？（錯誤碼、版本號、檔案路徑等）
- [ ] 新增的連結是否已驗證相關性？
- [ ] 是否與代碼/問題/邏輯/意圖相關？
