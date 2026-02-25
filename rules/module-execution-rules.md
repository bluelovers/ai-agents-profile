# 模組執行規則

## 概述

本規則定義了 agents 在執行 `jest`、`tsx`、`mocha` 等模組時的標準處理流程。

## 執行策略

### 優先順序

1. **首先直接呼叫模組**
   - 直接呼叫模組名稱，例如 `jest`、`tsx`、`mocha`
   - 不使用 `npx` 或其他包管理器

2. **若直接呼叫失敗，則改用 `pnpm dlx` 或 `npx`**
   - 當直接呼叫模組失敗時，使用 `pnpm dlx` 或 `npx` 執行
   - 例如 `pnpm dlx jest`、`pnpm dlx tsx`、`pnpm dlx mocha` 或 `npx jest`、`npx tsx`、`npx mocha`

### 呼叫方式

#### 正確範例

```bash
# 直接呼叫
jest
tsx path/to/file.ts
mocha test/**/*.spec.ts

# 若直接呼叫失敗，改用 npx
npx jest
npx tsx path/to/file.ts
npx mocha test/**/*.spec.ts
```

#### 錯誤範例

```bash
# 不應直接使用 npx
npx jest
npx tsx path/to/file.ts
npx mocha test/**/*.spec.ts

# 不應使用其他包管理器
yarn jest
npm exec jest
pnpm jest
```

### 失敗紀錄

當發生以下情況時，必須將該模組記錄至 根目錄下的 `docs/npx-required.md`：

- 直接呼叫模組失敗
- 模組需要使用 `npx` 才能正常運行

## 相關資源

- [npx 官方文件](https://www.npmjs.com/package/npx)
- [Jest 官方文件](https://jestjs.io/docs/getting-started)
- [tsx 官方文件](https://tsx.is/)
- [Mocha 官方文件](https://mochajs.org/)