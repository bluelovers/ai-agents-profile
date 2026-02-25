# Agents 執行 TypeScript 檔案規則

## 概述

本規則定義了 agents 在執行 `.ts` 檔案時的標準處理流程。

## 執行策略

### 優先順序

1. **首先使用 `tsx` 執行**
   - 直接呼叫 `tsx <檔案路徑>`
   - 不使用 `npx` 或其他包管理器，除非 tsx 執行失敗

2. **若 tsx 載入失敗，則改用 `ts-node`**
   - 直接呼叫 `ts-node <檔案路徑>`
   - 不使用 `npx` 或其他包管理器，除非 ts-node 執行失敗

### 失敗紀錄

當發生以下情況時，必須將該檔案記錄至 根目錄下的 `docs/ts-node-required.md`：

- tsx 無法正確載入或執行 TypeScript 檔案
- 檔案需要使用 ts-node 才能正常運行

## 呼叫方式

### 正確範例

```bash
tsx path/to/file.ts
ts-node path/to/file.ts
```

### 錯誤範例

```bash
npx tsx path/to/file.ts
npx ts-node path/to/file.ts
yarn tsx path/to/file.ts
npm exec tsx path/to/file.ts
```

## 紀錄檔案

請參閱 `docs/ts-node-required.md` 了解哪些檔案需要使用 ts-node。
