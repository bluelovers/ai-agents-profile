---
name: typescript-config
description: |-
  協助設定和維護 TypeScript 專案配置。
  使用時機：
  - 建立/更新 tsconfig.json
  - 診斷配置問題
  - 升級 TypeScript 版本
  - 理解 compilerOptions
  - 配置 monorepo
  - 整合特定框架
  觸發關鍵字：
  - tsconfig
  - compilerOptions
  - TypeScript 升級
  - strict mode
  - type definitions
  - module resolution
  - target/lib/types
tags:
  - typescript
  - configuration
  - tsconfig
  - compiler-options
  - setup
---

# TypeScript 配置技能

## 核心目標

提供 TypeScript 專案配置的實用指導，包含 tsconfig.json 設定、編譯選項解釋、版本升級指南與問題診斷。

---

## 快速開始

### 立即解決常見問題

**Property 'fromEntries' does not exist**

**原因 (WHY)：** `Object.fromEntries` 等新 API 屬於較新的 ECMAScript 標準。如果 `tsconfig.json` 中的 `lib` 或 `target` 配置過舊（例如 `ES2015`），TypeScript 編譯器就不會載入對應的內建型別聲明，導致編譯失敗。

**做法 (WHAT)：** 提升 `lib` 版本至包含該 API 的 ECMAScript 標準（如 `ES2022` 或更新版本）。
```json
{
  "compilerOptions": {
    "lib": [
      "ES2022"
    ]
  }
}
```

---

## TypeScript 6 關鍵變更

### 1. types 必須明確列出 (解決升級後 "Cannot find name" 錯誤)

**變更：** TypeScript 6 不再自動載入 `node_modules/@types` 下的所有型別定義。

**原因 (WHY)：**
- **效能提升：** 避免編譯器掃描和載入整個專案下龐大但未使用的型別檔案，減少編譯時的效能負擔。
- **穩定性與隔離性：** 防止不同套件全域擴充帶來的不可預期型別污染與衝突，使型別依賴更加顯式且可控。

**做法 (WHAT)：** 必須在 `compilerOptions.types` 中明確列出專案所依賴的全域型別（如 `node`、`jest` 等），否則編譯時會出現 `"Cannot find name"` 錯誤。
```json
{
  "compilerOptions": {
    "types": [
      "node",
      "jest"
    ]
  }
}
```

### 2. ignoreDeprecations 過渡選項

**變更：** 提供 `ignoreDeprecations` 選項以抑制特定版本的棄用警告。

**原因 (WHY)：** 專案在升級至 TypeScript 6.0 時，可能仍包含已被棄用或將移除的舊版配置項。此選項允許團隊在不被大量編譯警告阻塞的情況下完成升級，爭取時間逐步重構與清理技術債。

**做法 (WHAT)：**
```json
{
  "compilerOptions": {
    "ignoreDeprecations": "6.0"
  }
}
```

---

## 除錯快速參考

當遇到編譯問題時，按以下項目進行檢查，以釐清問題根源：

- **檢查 `types` 和 `@types/*` 安裝**
  - **WHY：** 若缺少宣告，編譯器無法識別環境全域變數或第三方模組的型別，常導致 `"Cannot find name"` 錯誤。
- **檢查 `lib` 版本**
  - **WHY：** 決定編譯器內建哪些 JS 標準物件和 DOM API，配置不當會導致 `"Property X does not exist on type Y"`。
- **檢查模組安裝和 `moduleResolution`**
  - **WHY：** 確保解析模組的行為（例如 `node`、`bundler` 等）與實際運行環境相符，否則會出現 `"Cannot find module"` 錯誤。
- **檢查 `include` / `exclude` 路徑**
  - **WHY：** 控制哪些檔案交由 TS 編譯。若路徑配置錯誤，會導致程式碼未被編譯，或者不該被檢查的檔案（如構建輸出物）被掃描。

---

## 工具與資源

- [TypeScript 官方文件](https://www.typescriptlang.org/docs)
- [TypeScript 6.0 發布說明](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [TS Config Validator](https://json.schemastore.org/tsconfig)
