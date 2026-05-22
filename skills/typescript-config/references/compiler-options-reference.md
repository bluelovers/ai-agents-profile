---
tags:
  - typescript
  - typescript/tsconfig/compiler-options
  - documentation/references
  - typescript/tsconfig
  - configuration
---

# TypeScript 編譯選項完整參考
# TypeScript Compiler Options Complete Reference

## 概述

本文件提供所有 TypeScript 編譯選項的完整說明、使用場景和最佳實踐。

This document provides complete descriptions, use cases, and best practices for all TypeScript compiler options.

---

## 目錄

1. [基本選項 (Basic Options)](#1-基本選項)
2. [嚴格檢查選項 (Strict Options)](#2-嚴格檢查選項)
3. [模組解析選項 (Module Resolution)](#3-模組解析選項)
4. [輸出選項 (Output Options)](#4-輸出選項)
5. [類型定義選項 (Type Definition Options)](#5-類型定義選項)
6. [實驗性選項 (Experimental Options)](#6-實驗性選項)
7. [性能選項 (Performance Options)](#7-性能選項)
8. [其他選項 (Other Options)](#8-其他選項)

---

## 1. 基本選項

### `target`

**類型：** `string`

**預設值：** `ES3`

**說明：** 指定編譯後的 JavaScript 版本。

**可選值：**
- `ES3` - ECMAScript 3（最舊，不建議使用）
- `ES5` - ECMAScript 5（IE9+）
- `ES2015` / `ES6` - ES6+（包含 ES5）
- `ES2016` / `ES7` - 包含 `**` 運算子
- `ES2017` / `ES8` - 包含 `Object.entries/values`
- `ES2018` / `ES9` - 包含 `async/await`
- `ES2019` / `ES10` - 包含 `Array.flat`
- `ES2020` / `ES11` - 包含 `Promise.allSettled`
- `ES2021` / `ES12` - 包含 `String.replaceAll`
- `ES2022` / `ES13` - 包含 `class.field`
- `ESNext` - 最新提案（ bleeding edge）

**使用場景：**
```json
{
  "compilerOptions": {
    "target": "ES2020"  // Node.js 14+、現代瀏覽器
  }
}
```

**注意事項：**
- 較低的 `target` 會向下兼容，但缺少新功能
- 較高的 `target` 需要現代運行環境支援

---

### `module`

**類型：** `string`

**預設值：** `CommonJS`（根據 `target` 可能變化）

**說明：** 指定生成的模組系統。

**可選值：**
- `CommonJS` - Node.js 傳統模組
- `AMD` - 非同步模組定義（瀏覽器）
- `System` - SystemJS
- `UMD` - 通用模組定義
- `ES2015` / `ES2020` / `ESNext` - ES 模組

**使用場景：**
```json
{
  "compilerOptions": {
    "module": "commonjs",    // Node.js 後端
    // 或
    "module": "esnext",      // 現代前端（配合 Vite/Webpack）
    // 或
    "module": "umd"          // 函式庫發布
  }
}
```

**決策指南：**
- Node.js 後端 → `commonjs`
- React/Vue 前端 → `esnext`
- 函式庫 → `esnext` 或 `umd`

---

### `lib`

**類型：** `string[]`

**預設值：** 根據 `target` 自動推斷

**說明：** 指定編譯時包含的標準庫 API 類型定義。

**常用組合：**

#### Node.js 後端
```json
{
  "compilerOptions": {
    "lib": ["ES2020"]
  }
}
```

#### 瀏覽器前端
```json
{
  "compilerOptions": {
    "lib": ["DOM", "DOM.Iterable", "ES2020"]
  }
}
```

#### 全棧專案
```json
{
  "compilerOptions": {
    "lib": ["DOM", "ES2020"]
  }
}
```

**重要規則：**
- `lib` 必須包含 `target` 所暗示的所有功能
- 如果 `target` 是 `ES6`，預設包含 `ES6` 但不包含 `DOM`
- TypeScript 6 要求明確列出所有需要的 lib 版本

**常見缺失的 lib：**
```typescript
// 使用 Object.entries → 需要 ES2017
// 使用 Array.flat → 需要 ES2019
// 使用 Promise.allSettled → 需要 ES2020
// 使用 globalThis → 需要 ES2020
```

---

### `jsx`

**類型：** `string`

**預設值：** `Preserve`（根據 `module` 可能變化）

**說明：** 指定 JSX 代碼的生成方式。

**可選值：**
- `Preserve` - 保留 JSX，輸出為 `.jsx` 檔案
- `React` - 轉換為 `React.createElement`
- `React-jsx` - React 17+ 新 JSX 轉換
- `React-jsxdev` - 開發模式 JSX 轉換

**使用場景：**
```json
{
  "compilerOptions": {
    "jsx": "react-jsx"  // React 17+
  }
}
```

---

## 2. 嚴格檢查選項

### `strict`

**類型：** `boolean`

**預設值：** `false`

**說明：** 啟用所有嚴格類型檢查選項。

**包含的選項：**
- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `strictBindCallApply`
- `strictPropertyInitialization`
- `noImplicitThis`
- `alwaysStrict`

**強烈建議啟用：**
```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

---

### `noImplicitAny`

**類型：** `boolean`

**預設值：** `false`（若 `strict` 為 `true` 則為 `true`）

**說明：** 禁止隱式的 `any` 類型。

**效果：**
```typescript
// ❌ 錯誤：隱式 any
function foo(x) {
  // Parameter 'x' implicitly has an 'any' type
  return x;
}

// ✅ 正確：明確指定類型
function foo(x: number) {
  return x;
}
```

---

### `strictNullChecks`

**類型：** `boolean`

**預設值：** `false`（若 `strict` 為 `true` 則為 `true`）

**說明：** 嚴格檢查 `null` 和 `undefined`。

**效果：**
```typescript
// ❌ 錯誤：null/undefined 不能賦值給其他類型
let name: string = null;

// ✅ 正確：使用聯合類型
let name: string | null = null;
```

---

### `strictFunctionTypes`

**類型：** `boolean`

**預設值：** `false`（若 `strict` 為 `true` 則為 `true`）

**說明：** 嚴格檢查函式類型。

---

### `strictBindCallApply`

**類型：** `boolean`

**預設值：** `false`（若 `strict` 為 `true` 則為 `true`）

**說明：** 嚴格檢查 `bind`、`call`、`apply` 方法。

---

### `strictPropertyInitialization`

**類型：** `boolean`

**預設值：** `false`（若 `strict` 為 `true` 則為 `true`）

**說明：** 檢查類別屬性是否在建構子中初始化。

**效果：**
```typescript
class User {
  name: string;  // ❌ 錯誤：屬性 'name' 沒有初始化器

  constructor() {
    this.name = '';  // ✅ 正確
  }
}
```

---

### `noImplicitThis`

**類型：** `boolean`

**預設值：** `false`（若 `strict` 為 `true` 則為 `true`）

**說明：** 禁止 `this` 隱式具有 `any` 類型。

---

### `alwaysStrict`

**類型：** `boolean`

**預設值：** `false`（若 `strict` 為 `true` 則為 `true`）

**說明：** 以嚴格模式解析並輸出每個檔案。

---

## 3. 模組解析選項

### `moduleResolution`

**類型：** `string`

**預設值：** `Classic`（根據 `module` 可能變化）

**說明：** 指定模組解析策略。

**可選值：**
- `Classic` - TypeScript 傳統方式（已過時）
- `Node` - 模仿 Node.js 模組解析（推薦）
- `Bundler` - 針對 bundler 優化（TS 5.0+）

**使用場景：**
```json
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}
```

---

### `baseUrl`

**類型：** `string`

**預設值：** `.`（當前目錄）

**說明：** 指定非相對模組引入的基礎目錄。

**使用場景：**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

### `paths`

**類型：** `{ [pattern: string]: string[] }`

**預設值：** `undefined`

**說明：** 指定模組引入的別名映射。

**使用場景：**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/utils/*": ["src/utils/*"]
    }
  }
}
```

---

## 4. 輸出選項

### `outDir`

**類型：** `string`

**預設值：** `undefined`

**說明：** 指定輸出目錄。

**使用場景：**
```json
{
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

---

### `rootDir`

**類型：** `string`

**預設值：** `undefined`

**說明：** 指定原始碼根目錄。

---

### `declaration`

**類型：** `boolean`

**預設值：** `false`

**說明：** 生成 `.d.ts` 類型宣告檔。

**使用場景：** 函式庫開發
```json
{
  "compilerOptions": {
    "declaration": true
  }
}
```

---

### `declarationMap`

**類型：** `boolean`

**預設值：** `false`

**說明：** 為 `.d.ts` 檔生成 source map。

---

### `sourceMap`

**類型：** `boolean`

**預設值：** `false`

**說明：** 生成 `.map` 檔以便除錯。

---

### `inlineSourceMap`

**類型：** `boolean`

**預設值：** `false`

**說明：** 將 source map 內嵌到輸出檔中。

---

### `inlineSources`

**類型：** `boolean`

**預設值：** `false`

**說明：** 將原始碼內嵌到 source map 中。

---

## 5. 類型定義選項

### `types`

**類型：** `string[]`

**預設值：** `[]`（TypeScript 6+ 不再自動載入所有）

**說明：** 指定要包含的類型定義套件名稱。

**TypeScript 6 重要變更：**
```json
{
  "compilerOptions": {
    "types": ["node", "jest", "express"]  // 必須明確列出
  }
}
```

**常見值：**
- `node` - Node.js 核心類型
- `jest` - Jest 測試框架
- `mocha` - Mocha 測試框架
- `react` - React 類型
- `express` - Express.js 類型

---

### `typeRoots`

**類型：** `string[]`

**預設值：** `["./node_modules/@types"]`

**說明：** 指定類型定義檔案的目錄。

**使用場景：**
```json
{
  "compilerOptions": {
    "typeRoots": ["./node_modules/@types", "./custom-types"]
  }
}
```

---

### `typesMissingAction`

**類型：** `string`

**預設值：** `"error"`（TS 6.0+）

**說明：** 當找不到類型定義時的行為。

**可選值：**
- `"error"` - 報錯（預設）
- `"ignore"` - 忽略
- `"warn"` - 僅警告

---

## 6. 實驗性選項

### `experimentalDecorators`

**類型：** `boolean`

**預設值：** `false`

**說明：** 啟用裝飾器（Decorators）實驗性支援。

**使用場景：** 使用 class-validator、TypeORM 等庫
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

### `emitDecoratorMetadata`

**類型：** `boolean`

**預設值：** `false`

**說明：** 為裝飾器生成類型中繼資料。

---

### `useDefineForClassFields`

**類型：** `boolean`

**預設值：** `true`（TS 6.0+）

**說明：** 使用 `Object.defineProperty` 輸出 ECMAScript 標準的 class fields。

---

## 7. 性能選項

### `skipLibCheck`

**類型：** `boolean`

**預設值：** `false`

**說明：** 跳過所有宣告檔（`.d.ts`）的類型檢查。

**優點：**
- 大幅提升編譯速度
- 減少第三方庫的類型錯誤干擾

**缺點：**
- 可能隱藏類型錯誤

**推薦設定：**
```json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

---

### `skipDefaultLibCheck`

**類型：** `boolean`

**預設值：** `false`

**說明：** 跳過預設 lib 檔（如 `lib.d.ts`）的檢查。

---

## 8. 其他選項

### `esModuleInterop`

**類型：** `boolean`

**預設值：** `false`

**說明：** 為 CommonJS 模組生成更好的導入語法。

**效果：**
```typescript
// ❌ 沒有 esModuleInterop
import * as express from 'express';

// ✅ 有 esModuleInterop
import express from 'express';
```

**強烈建議啟用：**
```json
{
  "compilerOptions": {
    "esModuleInterop": true
  }
}
```

---

### `forceConsistentCasingInFileNames`

**類型：** `boolean`

**預設值：** `false`

**說明：** 強制檔案名稱大小寫一致。

**推薦啟用：**
```json
{
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true
  }
}
```

---

### `resolveJsonModule`

**類型：** `boolean`

**預設值：** `false`

**說明：** 允許導入 `.json` 檔。

**使用場景：**
```typescript
import config from './config.json';
```

**啟用：**
```json
{
  "compilerOptions": {
    "resolveJsonModule": true
  }
}
```

---

### `isolatedModules`

**類型：** `boolean`

**預設值：** `false`

**說明：** 確保每個檔案可以獨立轉譯（用於並行編譯）。

**使用場景：** 使用 Babel 或 ts-loader 時

---

### `noEmit`

**類型：** `boolean`

**預設值：** `false`

**說明：** 僅進行類型檢查，不生成輸出檔。

**使用場景：**
```bash
npx tsc --noEmit
```

---

### `noEmitOnError`

**類型：** `boolean`

**預設值：** `true`

**說明：** 有錯誤時不生成輸出檔。

---

### `incremental`

**類型：** `boolean`

**預設值：** `false`

**說明：** 啟用增量編譯，加快後續編譯速度。

**使用場景：**
```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
```

---

### `composite`

**類型：** `boolean`

**預設值：** `false`

**說明：** 啟用 project references 的組合專案。

**使用場景：** Monorepo
```json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true
  }
}
```

---

## 選項速查表

### 最小配置
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Node.js 後端推薦配置
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"],
    "resolveJsonModule": true
  }
}
```

### React 前端推薦配置
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "esnext",
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "jsx": "react-jsx",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["react", "node"]
  }
}
```

---

## 決策流程圖

```
開始設定 tsconfig.json
    │
    ▼
選擇目標環境
    │
    ├─ Node.js 後端
    │   ├─ target: ES2020
    │   ├─ module: commonjs
    │   ├─ lib: ["ES2020"]
    │   └─ types: ["node"]
    │
    ├─ 瀏覽器前端
    │   ├─ target: ES2020
    │   ├─ module: esnext
    │   ├─ lib: ["DOM", "ES2020"]
    │   └─ jsx: react-jsx（如使用 React）
    │
    └─ 函式庫
        ├─ target: ES2020
        ├─ module: esnext
        ├─ lib: ["ES2020"]
        ├─ declaration: true
        └─ types: []
```

---

## 官方資源

- [TypeScript Compiler Options](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig)

---

**最後更新：** 2024-01-15
**適用版本：** TypeScript 6.0+
