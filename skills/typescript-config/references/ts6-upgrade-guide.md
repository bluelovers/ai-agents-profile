---
tags:
  - typescript
  - typescript/upgrade
  - typescript/migration
  - typescript/v6
  - agents/guidelines
  - documentation/references
---

# TypeScript 6 升級完整指南
# TypeScript 6 Upgrade Complete Guide

## 概述

本指南提供從 TypeScript 5.x 升級到 6.x 的完整步驟、注意事項和故障排除。

This guide provides complete steps, considerations, and troubleshooting for upgrading from TypeScript 5.x to 6.x.

---

## 升級前準備

### 1. 環境檢查

```bash
# 檢查當前 TypeScript 版本
npx tsc --version

# 檢查專案依賴
npm list typescript
# 或使用 pnpm
pnpm list typescript
```

### 2. 備份重要檔案

```bash
# 備份 tsconfig.json
cp tsconfig.json tsconfig.backup.json

# 備份 package.json（可選）
cp package.json package.backup.json

# 備份 lock 檔案（可選）
cp package-lock.json package-lock.backup.json
# 或
cp pnpm-lock.yaml pnpm-lock.backup.yaml
```

### 3. 檢查專案狀態

- 確保所有測試通過
- 確保程式碼已提交至版本控制
- 記錄當前已知問題

---

## 升級步驟

### 步驟 1：升級 TypeScript 核心套件

#### 使用 npm

```bash
npm install --save-dev typescript@latest
```

#### 使用 pnpm

```bash
pnpm add -D typescript@latest
```

#### 使用 yarn

```bash
yarn add -D typescript@latest
```

### 步驟 2：升級類型定義套件

```bash
# 升級所有 @types/* 套件
npm update --save-dev @types/node @types/react @types/...

# 或使用 pnpm
pnpm update -D @types/node @types/react

# 檢查是否有遺漏的類型定義
npm outdated | findstr types
```

### 步驟 3：新增 ignoreDeprecations

在 `tsconfig.json` 的 `compilerOptions` 中加入：

```json
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0"
  }
}
```

### 步驟 4：執行編譯測試

```bash
# 檢查型別但不輸出檔案
npx tsc --noEmit

# 如果使用 pnpm
pnpm tsc --noEmit
```

### 步驟 5：修復編譯錯誤

根據錯誤訊息進行以下操作：

#### 錯誤類型 1：Cannot find name 'XXX'

**解決方案：**
1. 安裝對應的 `@types/` 套件
2. 在 `tsconfig.json` 的 `types` 陣列中加入該套件名稱

```bash
# 安裝 @types/node
npm install --save-dev @types/node

# 更新 tsconfig.json
{
  "compilerOptions": {
    "types": ["node", "..."]
  }
}
```

#### 錯誤類型 2：Property 'XXX' does not exist

**解決方案：** 提升 `lib` 版本

```json
{
  "compilerOptions": {
    "lib": ["ES2020", "ES2021", "..."]
  }
}
```

#### 錯誤類型 3：Deprecation warnings

**解決方案：**
1. 根據警告訊息修改程式碼
2. 或暫時保留，在完成所有升級後再處理

### 步驟 6：移除 ignoreDeprecations

當所有警告都修復後，從 `tsconfig.json` 移除 `ignoreDeprecations` 並再次測試：

```bash
npx tsc --noEmit
```

### 步驟 7：執行完整測試

```bash
# 執行單元測試
npm test

# 執行 linting
npm run lint

# 建置專案
npm run build
```

---

## 常見問題與解決方案

### Q1：升級後出現大量 "Cannot find name" 錯誤

**原因：** TypeScript 6 不再自動載入所有 `@types/*` 套件

**解決：**
1. 檢查錯誤中提到的名稱（如 `http`, `process`, `Buffer`）
2. 安裝對應的類型定義套件
3. 在 `tsconfig.json` 的 `types` 陣列中明確列出

```json
{
  "compilerOptions": {
    "types": ["node", "jest", "express"]
  }
}
```

### Q2：lib 相關錯誤如何判斷需要哪些版本？

**方法 1：根據錯誤訊息判斷**

```
error TS2550: Property 'fromEntries' does not exist on type 'ObjectConstructor'.
```
→ 需要 `ES2019` 或更高版本

```
error TS2304: Cannot find name 'PromiseFulfilledResult'.
```
→ 需要 `ES2020`

**方法 2：檢查程式碼使用的 API**

```typescript
// 使用 Object.entries → 需要 ES2017
// 使用 Array.flat → 需要 ES2019
// 使用 Promise.allSettled → 需要 ES2020
// 使用 globalThis → 需要 ES2020
```

**方法 3：使用最小配置逐步增加**

```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM"]
  }
}
```

### Q3：是否必須立即移除 ignoreDeprecations？

**不需要立即移除**，可以：

1. **短期**：保留 `ignoreDeprecations: "6.0"` 讓專案先編譯通過
2. **中期**：逐步修復棄用警告
3. **長期**：移除 `ignoreDeprecations` 並確保無警告

### Q4：第三方套件的類型定義也需要列入 types 嗎？

**是的**，TypeScript 6 中，所有類型定義都需要明確列出：

```json
{
  "compilerOptions": {
    "types": [
      "node",           // Node.js 核心類型
      "markdown-it",    // 第三方套件類型
      "express",        // 框架類型
      "jest"            // 測試框架類型
    ]
  }
}
```

### Q5：升級後執行時出現錯誤？

**檢查項目：**
1. 是否所有依賴都已更新至相容版本？
2. 是否有 breaking changes 影響運行時行為？
3. 是否需調整建置流程（如 bundler 設定）？

---

## 版本兼容性矩陣

| TypeScript 版本 | Node.js 版本 | 主要特性 |
|----------------|--------------|---------|
| TS 6.x | Node 18+ | types 必須明確列出、棄用警告強化 |
| TS 5.x | Node 14+ | 穩定版本，自動載入 @types |
| TS 4.x | Node 12+ | 舊版支援 |

---

## 降級策略

如果升級後遇到無法解決的問題，可以降級：

```bash
# 降級到 TS 5.x
npm install --save-dev typescript@5

# 或指定具體版本
npm install --save-dev typescript@5.4.5
```

並移除 `tsconfig.json` 中的 `ignoreDeprecations` 和新增的 `types` 項目（如果不需要）。

---

## 最佳實踐建議

### 1. 漸進升級

不要一次性升級所有套件，先升級 TypeScript 核心，再逐步升級其他套件。

### 2. 使用版本控制

```bash
# 建立升級分支
git checkout -b upgrade/typescript-6

# 完成升級後再合併
git add .
git commit -m "chore: upgrade to TypeScript 6"
```

### 3. 保留備份

```bash
# 保留備份檔案（但不提交）
echo "tsconfig.backup.json" >> .gitignore
echo "package.backup.json" >> .gitignore
```

### 4. 團隊協作

- 在團隊中公告升級計畫
- 提供升級指引文件
- 約定統一升級時間點

---

## 相關資源

- [TypeScript 6.0 官方發布說明](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [TypeScript 官方文件 - Breaking Changes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html)
- [TypeScript Config Explorer](https://www.typescriptlang.org/tsconfig)

---

## 升級後檢查清單

- [ ] TypeScript 版本已升級至 6.x
- [ ] 所有 `@types/*` 套件已更新
- [ ] `tsconfig.json` 已新增 `types` 陣列
- [ ] `tsconfig.json` 已補齊缺失的 `lib` 版本
- [ ] 已新增 `ignoreDeprecations: "6.0"`（過渡期）
- [ ] 所有編譯錯誤已修復
- [ ] 所有測試通過
- [ ] 程式碼可以正常執行
- [ ] 團隊成員已被告知升級完成

---

**最後更新：** 2024-01-15
**適用版本：** TypeScript 6.0+
