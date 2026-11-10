---
description: >-
  測試框架相容性與 API 對應：Jest / Vitest / Bun / Node.js(node:test) 四框架的
  測試檔命名規則與預設匹配模式、測試檔 Header（含 Jest v30 移除 toThrowError、
  Vitest toThrowError 已棄用）、常用命令列參數對照、matcher 與 API 對應表，
  以及各框架注意事項與危險注意事項
  （Bun matcher：property matcher / toMatchObject 比對後可能改寫原物件）。
tags:
  - documentation/references
  - testing
  - testing/frameworks
  - testing/jest
---

# 測試框架相容性與 API 對應 / Framework Compatibility & API Mapping

本文件收錄 `SKILL.md` 的測試檔命名規範與測試檔 Header，以及原 `examples.md` 的框架相容性速查表，
統整為 Jest / Vitest / Bun / Node.js（`node:test`）四框架的對照，作為框架選擇與 API 比較的單一事實來源。
關於轉換既有測試至 Node.js 原生測試的完整指南，請參閱 [test-convert-to-node-test](../../test-convert-to-node-test/SKILL.md)（轉換時以既有代碼為使用指南，禁止預先探索無關檔案、依賴、實作細節、API、快照或環境；僅實際遇錯或必要資訊不足時，才做最小範圍查詢）。

---

## 框架總覽 (Framework Overview)

| 框架 | 測試入口 | 斷言 API | 測試命令 |
|------|---------|---------|---------|
| **Jest** | `@jest/globals` 或全域 | `expect` | `jest` |
| **Vitest** | `vitest` | `expect`（Jest 相容） | `vitest` |
| **Bun** | `bun:test` | `expect`（Jest-like，未 100% 實作） | `bun test` |
| **Node.js 原生測試** | `node:test` | `t.assert`（除非例外否則不用 `node:assert/strict`） | `node --test <filter>` |

---

### 命令列參數對應表 (CLI Flags Mapping)

**常用命令列參數集中列於此表；其他章節僅以文字指向本表，不再重複列出。**

| 用途 | Jest | Vitest | Bun | Node.js |
|------|------|--------|-----|---------|
| **覆蓋率** | `--coverage`（內建） | `--coverage`（需另裝 provider 套件，如 `@vitest/coverage-v8`） | `--coverage`（內建） | `--experimental-test-coverage`（實驗性，或 `c8`） |
| **Watch 模式** | `--watch`（僅變更） / `--watchAll`（全部） | `-w, --watch`（預設即為 watch，`vitest run` 為單次執行） | `--watch` | `--watch` |
| **快照建立（本地首次）** | 自動建立 | 自動建立 | 自動建立 | ⚠️ 需 `--test-update-snapshots`，否則測試失敗 |
| **快照建立（CI 環境）** | 帶 `--ci` 時不寫入、測試失敗 | `process.env.CI` 為真時不寫入、測試失敗 | 不寫入新快照 | 仍需 `--test-update-snapshots` |
| **快照更新** | `-u, --updateSnapshot` | `-u, --update`（可帶 `new` / `all` / `none`） | `--update-snapshots` | `--test-update-snapshots`（與建立為同一旗標） |
| **依名稱篩選測試** | `-t <pattern>` / `--testNamePattern=<regex>` | `-t, --testNamePattern <pattern>` | `-t, --test-name-pattern <pattern>` | `--test-name-pattern <pattern>` |
| **依檔案篩選測試（位置參數）** | `jest <regexForTestFiles>` | `vitest <filter>`（檔名篩選） | `bun test <filter>`（單檔需 `./` 或 `/` 前綴） | `node --test <filter>` |

> 完整參數見官方文件：[Jest CLI](https://jestjs.io/docs/cli) · [Vitest CLI](https://vitest.dev/guide/cli) · [Bun test](https://bun.com/docs/test) · [Node.js CLI](https://nodejs.org/api/cli.html) · [Node.js snapshot testing](https://nodejs.org/api/test.html#snapshot-testing)

---

### 測試檔命名規範 / Test File Naming

**根據測試框架使用不同的檔案副檔名，以便未來同時使用多個測試工具時能夠區分。**

#### 命名規則

| 測試框架 | 推薦檔名格式 | 範例 |
|---------|------------|------|
| **Jest** | `*.spec.ts` | `user-service.spec.ts` |
| **Vitest** | `*.spec.ts` | `user-service.spec.ts` |
| **Bun** | `*.test.ts` | `user-service.test.ts` |
| **Mocha** | `*.test.ts` | `user-service.test.ts` |
| **Node.js 原生測試** | `*.test.ts`, `*.node-test.ts` | `user-service.test.ts` |

#### 命名範例

```
test/
├── module/
│   ├── feature-a.spec.ts      # Jest 或 Vitest 測試檔案
│   ├── feature-b.spec.ts      # Jest 或 Vitest 測試檔案
│   ├── integration.test.ts    # Bun、Mocha 或 Node.js 測試檔案
│   └── unit.test.ts
```

### 各框架預設檔名匹配模式 (Default Test File Patterns)

| 框架 | 預設匹配模式 |
|------|------------|
| **Jest** | `**/__tests__/**/*.[jt]s?(x)`、`**/?(*.)+(spec\|test).[jt]s?(x)` |
| **Vitest** | `**/*.{test,spec}.?(c\|m)[jt]s?(x)` |
| **Bun** | 結尾為 `.test.*` / `_test.*` / `.spec.*` / `_spec.*`（`js|jsx|ts|tsx|mjs|cjs|mts|cts`） |
| **Node.js** | 結尾為 `.test.*` / `-test.*` / `_test.*`、開頭為 `test-`、名為 `test.*`，以及 `test/` 目錄下的檔案；可用 `node --test "<glob>"` 自訂 |

> ⚠️ Bun 與 Node.js 預設**皆同時接受** `.test` 與 `.spec`；同一專案並用兩者時，請以目錄區隔或於設定檔限定匹配模式。

#### 設計理念

1. **框架識別** - 一眼即可辨識該測試檔案所使用的測試框架
2. **並行使用** - 當專案需要同時使用多個測試工具（如 Jest 單元測試 + Node.js 整合測試）時，可透過檔名模式輕鬆區分
3. **設定隔離** - 便於在測試設定檔中針對不同框架設定不同的匹配模式：
   - Jest: `testMatch: ["**/*.spec.ts"]`
   - Vitest: `include: ["**/*.spec.ts"]`
   - Mocha: `"test/**/*.test.ts"`
   - Node.js: `node --test "test/**/*.test.ts"`, `tsx --test "test/**/*.test.ts"`

#### 注意事項

- 在同一專案中應保持命名慣例的一致性
- 若專案僅使用單一測試框架，仍建議遵循此規範以便未來擴展
- TypeScript 專案亦可使用 `.spec.tsx` 或 `.test.tsx` 測試 React 組件

---

## Test File Header

**測試檔案開頭應加入 TypeScript 三斜線參考指令（並依框架匯入測試函數），以確保正確引入類型定義。**

### 通用（Node.js 環境）

適用於 Node.js 環境的一般測試檔案 (請勿用於 PHP 或 Python 等環境)：

```typescript
// @allowUnusedLabels:true
// @noImplicitAny:false
// @noPropertyAccessFromIndexSignature:false
// @noUnusedLocals:false
//@noUnusedParameters:false
/// <reference types="node" />
```

- https://github.com/microsoft/TypeScript-Website/tree/v2/packages/tsconfig-reference/copy/en/options

### Jest

```typescript
//@noUnusedParameters:false
/// <reference types="node" />
/// <reference types="jest" />
```

#### Jest v30+ 注意事項

> 自 Jest v30 起，`toThrowError` 已被移除，請改用 `toThrow`。

- 錯誤拋出測試請使用 `toThrow()` 而非 `toThrowError()`
- Snapshot 錯誤比對請使用 `toThrowErrorMatchingSnapshot()`（仍支援）

### Vitest

```typescript
//@noUnusedParameters:false
/// <reference types="node" />
/// <reference types="vitest" />
import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';
```

- 使用全域模式（不 import）時，於 `tsconfig.json` 加入 `"types": ["vitest/globals"]`
- Mock 一律使用 `vi.*`（`vi.fn()` = `jest.fn()`、`vi.mock()` = `jest.mock()`、`vi.spyOn()` = `jest.spyOn()`）
- ⚠️ 勿同時啟用 `@types/jest` 與 `vitest`／`vitest/globals` 型別，兩者皆定義 `expect`，會造成型別衝突

### Bun

```typescript
/// <reference types="bun" />
/// <reference types="bun-types" />
import { describe, expect, it, test, beforeEach, afterEach, mock } from "bun:test";
```

### Node.js 原生測試（node:test）

```typescript
/// <reference types="node" />
import { afterEach, beforeEach, describe, it, test, type TestContext } from 'node:test';
```

- **強制使用 `t.assert` 與回呼型別約束**：在測試中除非特殊例外，一律使用 `t.assert`，回呼參數標註 `t: test.TestContext`。詳細規範與三大例外情境請參閱 [test-convert-to-node-test](../../test-convert-to-node-test/SKILL.md)。
- **Mock 支援**：需要 Mock 時使用測試上下文 `t.mock.fn()` / `t.mock.method()`，跨框架詳細規範請參閱 [test-file-best-practices-mock](../../test-file-best-practices-mock/SKILL.md)。

---

## Matcher / API 對應表 (Matcher & API Mapping)

> 圖例：✅ 原生支援　⚠️ 可表達但需改寫　❌ 無對應　🐛 已知危險 Bug

| 斷言意圖 | Jest | Vitest | Bun | Node.js（`t.assert`） |
|---------|:----:|:------:|:---:|--------------------------------|
| `toBe`（嚴格相等） | ✅ | ✅ | ✅ | `t.assert.strictEqual` |
| `toEqual`（深度相等） | ✅ | ✅ | ✅ | `t.assert.deepStrictEqual`（⚠️ 比 Jest 嚴格：比對 type tag 與 `[[Prototype]]`） |
| `toStrictEqual` | ✅ | ✅ | ✅ | `t.assert.deepStrictEqual`（✅ 語意最接近） |
| `toMatchObject`（部分比對） | ✅ | ✅ | 🐛 比對後可能改寫原物件 | ⚠️ `t.assert.partialDeepStrictEqual`（v22.13.0+ / v23.4.0+） |
| `toHaveProperty` | ✅ | ✅ | ✅ | ⚠️ 巢狀路徑需自行存取：`t.assert.ok('b' in obj)` + `t.assert.strictEqual(obj.b.c, v)` |
| `toHaveLength` | ✅ | ✅ | ✅ | ❌ 無對應（僅能 `t.assert.strictEqual(x.length, n)`） |
| `toBeGreaterThan` / `OrEqual` | ✅ | ✅ | ✅ | ⚠️ `t.assert.ok(a >= b)`（無專用 matcher） |
| `toBeLessThan` / `OrEqual` | ✅ | ✅ | ✅ | ⚠️ `t.assert.ok(a <= b)`（無專用 matcher） |
| `toBeCloseTo`（浮點精度） | ✅ | ✅ | ✅ | ⚠️ `t.assert.ok(Math.abs(a - b) < 1e-9)` |
| `toContain` | ✅ | ✅ | ⚠️ 建議 `toEqual(expect.arrayContaining())` | ⚠️ `t.assert.ok(array.includes(v))` |
| `toContainEqual` | ✅ | ✅ | ⚠️ 需配合 `expect.arrayContaining()` | ⚠️ `t.assert.ok(array.some((x) => isDeepStrictEqual(x, v)))`（`node:util`） |
| `toMatch`（正則） | ✅ | ✅ | ✅ | ✅ `t.assert.match(str, regexp)`（**僅接受 RegExp**） |
| `toBeNull` / `toBeUndefined` / `toBeDefined` | ✅ | ✅ | ✅ | ✅ `t.assert.strictEqual(x, null/undefined)` / `t.assert.notStrictEqual(x, undefined)` |
| `toBeTruthy` / `toBeFalsy` | ✅ | ✅ | ✅ | ⚠️ `t.assert.ok(x)` / `t.assert.ok(!x)` |
| `toBeInstanceOf` | ✅ | ✅ | ✅ | ⚠️ `t.assert.ok(x instanceof T)` |
| `toThrow` | ✅ | ✅（`toThrowError` 已棄用） | ✅ | ✅ `t.assert.throws(fn, ...)`（形式對應見下方） |
| `.not.toThrow()` | ✅ | ✅ | ✅ | ⚠️ `t.assert.doesNotThrow(fn)`（文件標註實益不大，多數情況直接呼叫即可） |
| `.rejects` | ✅ | ✅ | ✅ | ✅ `await t.assert.rejects(asyncFn, ...)`（`error` 參數形式同 `throws`） |
| `.resolves` | ✅ | ✅ | ✅ | ⚠️ `await` 之後再斷言（無鏈式 API） |
| `toHaveBeenCalled` / `Times` / `With` | ✅ | ✅（`vi.fn()`） | ✅（`mock()`） | ⚠️ `t.mock.fn()` + `t.assert.strictEqual(fn.mock.callCount(), n)` |
| `toMatchSnapshot`（含 property matcher） | ✅ | ✅ | 🐛 property matcher 有改寫原物件風險 | ✅ `t.assert.snapshot()` + `t.assert.partialDeepStrictEqual()`（見下方近似寫法） |
| `toThrowErrorMatchingSnapshot` | ✅ | ✅ | ✅ | ⚠️ `t.assert.throws` 驗證函式內呼叫 `t.assert.snapshot()`（見下方近似寫法） |
| `expect.objectContaining` | ✅ | ✅ | 🐛 同一 asymmetric 機制風險 | ⚠️ `t.assert.partialDeepStrictEqual`（巢狀部分比對） |
| `expect.any(Class)` | ✅ | ✅ | 🐛 比對後可能改寫原物件 | ❌ 無 asymmetric matcher（自行 `t.assert.ok(v instanceof T)`） |

### 對應表注意事項

- **`toEqual` 的嚴格度差異**：`t.assert.deepStrictEqual` 會比對 type tag 與 `[[Prototype]]`（`===`），而 Jest `toEqual` 忽略 `undefined` 屬性、不比對類別；Jest 的 `toStrictEqual` 才是語意最接近者
- **`toMatchObject` ≈ `partialDeepStrictEqual`**：僅比對 `expected` 上存在的屬性，可巢狀遞迴，且會通過所有 `t.assert.deepStrictEqual` 的測試案例（為其超集）；`[[Prototype]]` 不比較、`Map`/`Set` 無序、`WeakMap`/`WeakSet`/`Promise` 需同引用、稀疏陣列忽略 hole
- **`toContainEqual` 需要「回傳布林值」的深度比對**：`t.assert` 一律以丟出例外表達失敗，改用 `node:util` 的 `isDeepStrictEqual(actual, expected)` 搭配 `array.some()`
- **`toThrow` 的 RegExp 行為不同**：Node 對 error 執行 `.toString()` 再比對（結果含 error name，如 `/^Error: Wrong value$/`），Jest 只比對 `error.message`，詳見下方形式對應表
- **Node.js 沒有 matcher 層**：所有「非等值」意圖（大小比較、instanceof、長度、包含）皆需以 `t.assert.ok()` 自行表達，錯誤訊息不如 Jest 詳盡
- **`toHaveLength` 無對應**：`t.assert` 只能斷言 `.length`，這是框架限制；Jest / Vitest / Bun 環境仍應遵循主文件的 `toHaveLength()` 規則
- **逾時設定**：`jest.setTimeout(timeout)` → `test(name, { timeout })`
- **Bun 目標相容 Jest 但未實作全部**：`toContain` / `toContainEqual` 建議改用 `expect.arrayContaining()`
- **Vitest 幾乎為 Jest 的 drop-in**：matcher 與 snapshot 用法相同，僅 Mock 命名空間由 `jest.*` 改為 `vi.*`

> 💡 **專屬技能指引**：
> - **Node.js 原生測試深入對應**：關於 `t.assert` 的 Strict vs Legacy 模式、`toThrow` / `rejects` 錯誤參數比對規則，以及 Jest-like API（`toMatchSnapshot` / `toThrowErrorMatchingSnapshot`）的 Node 近似實作與封裝 Helper，請參閱專屬技能 [test-convert-to-node-test](../../test-convert-to-node-test/SKILL.md)。
> - **跨框架 Mock 與系統資源隔離**：關於 Jest / Vitest / Bun / Node.js 的 Mock API 詳細對照、Fake Timers、環境變數與網路請求隔離，請參閱專屬技能 [test-file-best-practices-mock](../../test-file-best-practices-mock/SKILL.md)。

---

## 各框架注意事項 (Framework Notes)

| 面向 | Jest | Vitest | Bun | Node.js |
|------|------|--------|-----|---------|
| **Mock** | `jest.fn()` / `jest.mock()` | `vi.fn()` / `vi.mock()` | `mock()` / `mock.method()`（`bun:test`，Jest-like） | `t.mock.fn()` / `t.mock.method()` |
| **Snapshot 檔** | `__snapshots__/*.snap` | `__snapshots__/*.snap` | `__snapshots__/*.snap` | `*.snapshot`（同名檔案） |
| **Fake Timers** | `jest.useFakeTimers()` | `vi.useFakeTimers()` | `setSystemTime()`（`bun:test`） | `t.mock.timers` |
| **已知版本差異** | v30 移除 `toThrowError` | `toThrowError` 為已棄用別名 | 相容性以 tracking issue 為準 | v22.3.0+ `t.assert.snapshot()`、v22.13.0+ / v23.4.0+ `partialDeepStrictEqual`（v24.0.0 起 Stable） |
| **已知危險 Bug** | — | — | asymmetric matcher（如 `expect.any` / `expect.objectContaining`）比對後可能改寫原物件，**詳見「Bun matcher 的危險已知 Bug」小節** | — |

### ⚠️ Bun matcher 的危險已知 Bug：比對後改寫原物件 (Dangerous Mutation Bug)

**Bun 的 asymmetric matcher（`expect.any(...)` 等）可能在比對過程中把 matcher 物件本身「寫回」被比對物件，導致原始資料被改寫，後續所有基於該物件的比對結果失真。**

```typescript
// ❌ Bun：第一次斷言後，obj.bar 已被改寫
const obj = { foo: 'foo', bar: 'bar' };

expect(obj).toMatchObject({ bar: expect.any(String) });
console.log(obj.bar); // Bun 下變為 Any<String>（原本應為 'bar'）

expect(obj).toMatchObject({ bar: expect.any(String) }); // 第二次比對結果不正確
```

- **影響範圍**：`expect.any(...)`（issue #3521 實證）、`expect.objectContaining(...)` 等 asymmetric matcher 作為巢狀 matcher，用於 `toMatchObject()` 與 `toMatchSnapshot({ 欄位: expect.any(...) })`（property matcher）等「比對部分結構」的 API
- **污染會擴散**：若被比對的是共用 fixture、模組層級常數或跨測試共用的 state，後續測試會接著失敗，甚至**誤判為通過**——屬測試可信度問題，不是單純輸出錯誤
- **建議做法（Bun 專案）**：
  1. 避免在 Bun 使用 `expect.any()` / `expect.objectContaining()`，改以明確值搭配 `toEqual()` 比對
  2. 無法避免時，於斷言前先複製一份（`structuredClone(obj)`）再比對
  3. 關鍵的型別／結構斷言改在 Jest / Vitest 執行
- Issue：[oven-sh/bun#3521](https://github.com/oven-sh/bun/issues/3521)（`bug` / `bun:test`，2023-07 開立，截至查證時仍為 **Open**）

---

## 相關資源 (Related Resources)

- [SKILL.md](../SKILL.md)
- [測試轉換為 Node.js 原生測試規範 (`test-convert-to-node-test`)](../../test-convert-to-node-test/SKILL.md)
- [測試框架 API 重構範例](./examples.md)
- [斷言語法優化：可讀性 matcher 與物件比對](./assertion-syntax.md)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Node.js assert Module](https://nodejs.org/api/t.assert.html)
- [Vitest expect API](https://vitest.dev/api/expect)
- [Bun Test Runner](https://bun.com/docs/test)
- [Bun Issue #3521 - `expect.any` / `toMatchObject` mutates the object](https://github.com/oven-sh/bun/issues/3521)
