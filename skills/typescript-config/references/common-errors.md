# TypeScript 常見錯誤與解決方案
# TypeScript Common Errors and Solutions

## 概述

本文件收錄 TypeScript 編譯和配置過程中的常見錯誤及其解決方案。

This document collects common TypeScript compilation and configuration errors with their solutions.

---

## 目錄

1. [類型相關錯誤](#1-類型相關錯誤)
2. [模組解析錯誤](#2-模組解析錯誤)
3. [配置錯誤](#3-配置錯誤)
4. [版本升級錯誤](#4-版本升級錯誤)
5. [環境相關錯誤](#5-環境相關錯誤)

---

## 1. 類型相關錯誤

### 錯誤 TS2591：Cannot find name 'XXX'

**錯誤訊息：**
```
error TS2591: Cannot find name 'http'.
Do you need to install type definitions for node?
Try `npm i --save-dev @types/node` and then add 'node' to the types field in your tsconfig.
```

**原因：**
1. 缺少類型定義套件（`@types/node` 等）
2. TypeScript 6+ 要求明確在 `types` 陣列中列出
3. `lib` 設定不完整

**解決方案：**

```bash
# 1. 安裝對應的類型定義
npm install --save-dev @types/node

# 2. 更新 tsconfig.json
{
  "compilerOptions": {
    "types": ["node"],  // 明確列出需要的類型
    "lib": ["ES2020"]   // 確保包含必要的 lib
  }
}
```

**檢查清單：**
- [ ] 是否已安裝 `@types/` 套件？
- [ ] `tsconfig.json` 的 `types` 陣列是否包含該套件？
- [ ] `lib` 是否包含對應的 ES 版本？

---

### 錯誤 TS2304：Cannot find name 'XXX'

**錯誤訊息：**
```
error TS2304: Cannot find name 'PromiseFulfilledResult'.
```

**原因：** `lib` 版本過低，缺少對應的 API 類型定義。

**解決方案：**

提升 `lib` 版本：

```json
{
  "compilerOptions": {
    "lib": ["ES2020"]  // 從 ES5/ES6 提升到 ES2020
  }
}
```

**常見 API 與 lib 版本對照：**

| API | 需要的 lib 版本 |
|-----|----------------|
| `Object.entries` / `Object.values` | `ES2017` |
| `Object.fromEntries` | `ES2019` |
| `Array.prototype.flat` | `ES2019` |
| `Promise.allSettled` | `ES2020` |
| `String.prototype.matchAll` | `ES2020` |
| `globalThis` | `ES2020` |

---

### 錯誤 TS2550：Property 'XXX' does not exist

**錯誤訊息：**
```
error TS2550: Property 'fromEntries' does not exist on type 'ObjectConstructor'.
```

**原因：** 同上，`lib` 版本不足。

**解決方案：** 同上，提升 `lib` 版本。

---

### 錯誤 TS2345：Argument of type 'X' is not assignable to parameter of type 'Y'

**錯誤訊息：**
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

**原因：** 類型不匹配。

**解決方案：**

```typescript
// ❌ 錯誤
function process(num: number) {}
process('123');

// ✅ 正確
function process(num: number | string) {
  // 或進行類型轉換
  process(Number('123'));
}
```

---

### 錯誤 TS2322：Type 'X' is not assignable to type 'Y'

**錯誤訊息：**
```
error TS2322: Type 'string' is not assignable to type 'number'.
```

**原因：** 賦值類型不匹配。

**解決方案：**
1. 檢查變數宣告類型
2. 檢查函式返回值類型
3. 使用類型斷言（如確定安全）

```typescript
// 使用類型斷言（謹慎使用）
const value = someValue as unknown as number;
```

---

## 2. 模組解析錯誤

### 錯誤 TS2307：Cannot find module 'XXX'

**錯誤訊息：**
```
error TS2307: Cannot find module 'express' or its corresponding type declarations.
```

**原因：**
1. 模組未安裝
2. 缺少類型定義
3. `moduleResolution` 設定不正確

**解決方案：**

```bash
# 1. 安裝模組
npm install express

# 2. 安裝類型定義（如需要）
npm install --save-dev @types/express

# 3. 檢查 tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",  // 確保使用 node 模式
    "esModuleInterop": true      // 啟用 ES 模組兼容
  }
}
```

---

### 錯誤 TS1192：Module '"XXX"' has no exported member 'YYY'

**錯誤訊息：**
```
error TS1192: Module '"fs"' has no exported member 'promises'.
```

**原因：**
1. TypeScript 版本過低，不支援該 API
2. `lib` 版本不足
3. 模組本身沒有該導出

**解決方案：**

```bash
# 升級 TypeScript
npm install --save-dev typescript@latest

# 更新 lib 設定
{
  "compilerOptions": {
    "lib": ["ES2020"]  // fs.promises 需要 ES2020+
  }
}
```

---

## 3. 配置錯誤

### 錯誤 TS18003：No inputs were found in config file

**錯誤訊息：**
```
error TS18003: No inputs were found in config file '/tsconfig.json'.
```

**原因：**
1. `include` 或 `files` 欄位為空
2. 路徑模式不匹配任何檔案

**解決方案：**

```json
{
  "compilerOptions": {},
  "include": ["src/**/*"],  // 確保包含實際檔案路徑
  "exclude": ["node_modules"]
}
```

**檢查：**
```bash
# 檢查 include 路徑是否正確
ls src/
```

---

### 錯誤 TS18004：Project file 'tsconfig.json' is empty

**錯誤訊息：**
```
error TS18004: Project file 'tsconfig.json' is empty.
```

**原因：** `tsconfig.json` 檔案為空或格式錯誤。

**解決方案：**
1. 檢查 `tsconfig.json` 是否為有效 JSON
2. 確保至少包含 `compilerOptions` 欄位

```json
{
  "compilerOptions": {
    "target": "ES2020"
  }
}
```

---

### 錯誤 TS5063：Option 'XXX' is deprecated

**錯誤訊息：**
```
error TS5063: Option 'XXX' is deprecated.
```

**原因：** 使用了已棄用的編譯選項。

**解決方案：**
1. 查閱官方文檔了解替代選項
2. 更新程式碼使用新語法
3. 暫時使用 `ignoreDeprecations` 抑制警告

```json
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0"
  }
}
```

---

## 4. 版本升級錯誤

### TypeScript 6 升級：types 必須明確列出

**錯誤：** 大量 `Cannot find name` 錯誤

**原因：** TS6 移除了自動載入 `@types/*` 的行為。

**解決方案：**

```json
{
  "compilerOptions": {
    "types": ["node", "jest", "express"]  // 明確列出所有需要的類型
  }
}
```

**如何知道需要哪些類型？**
1. 查看錯誤訊息中提到的名稱
2. 檢查 `import` 的模組
3. 查看 `package.json` 的 `dependencies`

---

### TypeScript 6 升級：lib 必須包含使用中的 ES 版本

**錯誤：** `Property 'XXX' does not exist`

**原因：** `lib` 陣列缺少必要的 ES 版本。

**解決方案：**

```json
{
  "compilerOptions": {
    "lib": ["ES2020", "DOM"]  // 根據實際使用的 API 添加
  }
}
```

---

## 5. 環境相關錯誤

### 錯誤 TS5033：Error while reading file 'XXX'

**錯誤訊息：**
```
error TS5033: Error while reading file 'node_modules/@types/node/index.d.ts'.
```

**原因：**
1. 檔案權限問題
2. 磁碟空間不足
3. 檔案損壞

**解決方案：**
```bash
# 1. 清除 node_modules 重新安裝
rm -rf node_modules
npm install

# 2. 檢查磁碟空間
df -h

# 3. 檢查檔案權限（Linux/Mac）
ls -la node_modules/@types/
```

---

### 錯誤 TS6133：'XXX' is declared but its value is never read

**錯誤訊息：**
```
error TS6133: 'unusedVar' is declared but its value is never read.
```

**原因：** 變數宣告後未使用。

**解決方案：**

```typescript
// ❌ 錯誤
const unusedVar = 123;

// ✅ 正確
// 刪除未使用的變數
// 或使用 suppresses（不推薦）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const usedVar = 123;
```

**或關閉檢查：**
```json
{
  "compilerOptions": {
    "noUnusedLocals": false,
    "noUnusedParameters": false
  }
}
```

---

### 錯誤 TS2323：Cannot set property 'XXX' of undefined

**錯誤訊息：**
```
error TS2323: Cannot set property 'prototype' of undefined.
```

**原因：** 通常在 polyfill 或擴展內建物件時發生。

**解決方案：**
```typescript
// ❌ 錯誤
String.prototype.newMethod = function() {};

// ✅ 正確（使用宣告合併）
declare global {
  interface String {
    newMethod(): string;
  }
}
```

---

## 快速診斷流程

```
遇到 TypeScript 錯誤
    │
    ▼
錯誤類型？
    │
    ├─ Cannot find name → 檢查 types 和 lib
    │   ├─ 安裝 @types/* 套件
    │   └─ 更新 tsconfig.json 的 types 陣列
    │
    ├─ Property does not exist → 檢查 lib 版本
    │   └─ 提升 lib 到 ES2020 或更高
    │
    ├─ Cannot find module → 檢查模組安裝
    │   ├─ npm install 模組
    │   └─ 檢查 moduleResolution 設定
    │
    ├─ 配置錯誤 → 檢查 tsconfig.json 格式
    │   ├─ 確保 JSON 格式正確
    │   └─ 確認 include/exclude 路徑正確
    │
    └─ 版本升級錯誤 → 檢查 TS 版本
        ├─ 升級 TypeScript
        └─ 更新所有 @types/* 套件
```

---

## 預防措施

### 1. 定期更新依賴

```bash
# 檢查過期套件
npm outdated

# 更新所有套件
npm update
```

### 2. 使用嚴謹的配置

```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 3. 啟用 CI 檢查

在 CI 流程中加入：
```yaml
- run: npx tsc --noEmit
```

### 4. 使用 Pre-commit Hook

```bash
# 使用 husky + lint-staged
"lint-staged": {
  "*.ts": ["npx tsc --noEmit"]
}
```

---

## 更多幫助

如遇到未列出的錯誤：

1. **查閱官方文檔：** https://www.typescriptlang.org/docs
2. **搜尋 Stack Overflow：** 使用錯誤代碼搜尋
3. **檢查 GitHub Issues：** 對應的 TypeScript 倉庫
4. **建立最小重現案例：** 便於排查問題

---

**最後更新：** 2024-01-15
**適用版本：** TypeScript 6.0+
