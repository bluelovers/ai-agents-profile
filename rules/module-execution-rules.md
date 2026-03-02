# 模組執行規則

## 概述

本規則定義了 agents 在執行 `jest`、`tsx`、`mocha` 等模組以及 TypeScript 檔案時的標準處理流程。

---

## 1. TypeScript 檔案執行

### 優先順序

1. **首先使用 `tsx` 執行**
   - 直接呼叫 `tsx <檔案路徑>`
   - 不使用 `npx` 或其他包管理器，除非 tsx 執行失敗

2. **若 tsx 載入失敗，則改用 `ts-node`**
   - 直接呼叫 `ts-node <檔案路徑>`
   - 不使用 `npx` 或其他包管理器，除非 ts-node 執行失敗

### 呼叫方式

#### 正確範例

```bash
tsx path/to/file.ts
ts-node path/to/file.ts
```

#### 錯誤範例

```bash
npx tsx path/to/file.ts
npx ts-node path/to/file.ts
yarn tsx path/to/file.ts
npm exec tsx path/to/file.ts
```

### 失敗紀錄

當發生以下情況時，必須將該檔案記錄至 根目錄下的 `docs/ts-node-required.md`：

- tsx 無法正確載入或執行 TypeScript 檔案
- 檔案需要使用 ts-node 才能正常運行

---

## 2. 測試/工具模組執行

### 優先順序

1. **首先直接呼叫模組**
   - 直接呼叫模組名稱，例如 `jest`、`tsx`、`mocha`
   - 不使用 `npx` 或其他包管理器

2. **若直接呼叫失敗，則改用 `pnpm dlx` 或 `npx`**
   - 當直接呼叫模組失敗時，使用 `pnpm dlx` 或 `npx` 執行
   - 例如 `pnpm dlx jest`、`npx jest`

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

---

## 3. 紀錄檔案

- `docs/ts-node-required.md` - 需要使用 ts-node 的檔案清單
- `docs/npx-required.md` - 需要使用 npx 的模組清單

---

## 相關資源

- [npx 官方文件](https://www.npmjs.com/package/npx)
- [Jest 官方文件](https://jestjs.io/docs/getting-started)
- [tsx 官方文件](https://tsx.is/)
- [Mocha 官方文件](https://mochajs.org/)