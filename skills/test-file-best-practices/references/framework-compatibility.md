---
description: >-
  測試框架相容性與 API 對應：Jest / Vitest / Bun / Node.js(node:test) 四框架的
  測試檔命名規則與預設匹配模式、測試檔 Header（含 Jest v30 移除 toThrowError、
  Vitest toThrowError 已棄用）、matcher 與 node:assert/strict 的 API 對應表
  （含 toThrow error 參數形式對應、toMatchSnapshot 近似、Strict/Legacy 模式），
  以及各框架的 Mock、Snapshot、覆蓋率差異與危險注意事項：Bun matcher
  （property matcher / toMatchObject 等）比對後可能改寫原物件、
  Node --test-update-snapshots 同時控管快照建立與更新。
tags:
  - documentation/references
  - testing
  - testing/frameworks
  - testing/jest
---

# 測試框架相容性與 API 對應 / Framework Compatibility & API Mapping

本文件收錄 `SKILL.md` 的測試檔命名規範與測試檔 Header，以及原 `examples.md` 的框架相容性速查表，
統整為 Jest / Vitest / Bun / Node.js（`node:test`）四框架的對照，作為框架選擇與 API 遷移的單一事實來源。

---

## 框架總覽 (Framework Overview)

| 框架 | 測試入口 | 斷言 API | 測試命令 |
|------|---------|---------|---------|
| **Jest** | `@jest/globals` 或全域 | `expect` | `jest` |
| **Vitest** | `vitest` | `expect`（Jest 相容） | `vitest` |
| **Bun** | `bun:test` | `expect`（Jest-like，未 100% 實作） | `bun test` |
| **Node.js 原生測試** | `node:test` | `node:assert/strict` | `node --test` |

---

## 測試檔命名規範 / Test File Naming

**根據測試框架使用不同的檔案副檔名，以便未來同時使用多個測試工具時能夠區分。**

### 命名規則

| 測試框架 | 推薦檔名格式 | 範例 |
|---------|------------|------|
| **Jest** | `*.spec.ts` | `user-service.spec.ts` |
| **Vitest** | `*.spec.ts` | `user-service.spec.ts` |
| **Bun** | `*.test.ts` | `user-service.test.ts` |
| **Mocha** | `*.test.ts` | `user-service.test.ts` |
| **Node.js 原生測試** | `*.test.ts` | `user-service.test.ts` |

### 命名範例

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

### 設計理念

1. **框架識別** - 一眼即可辨識該測試檔案所使用的測試框架
2. **並行使用** - 當專案需要同時使用多個測試工具（如 Jest 單元測試 + Node.js 整合測試）時，可透過檔名模式輕鬆區分
3. **設定隔離** - 便於在測試設定檔中針對不同框架設定不同的匹配模式：
   - Jest: `testMatch: ["**/*.spec.ts"]`
   - Vitest: `include: ["**/*.spec.ts"]`
   - Mocha: `"test/**/*.test.ts"`
   - Node.js: `node --test "test/**/*.test.ts"`

### 注意事項

- 在同一專案中應保持命名慣例的一致性
- 若專案僅使用單一測試框架，仍建議遵循此規範以便未來擴展
- TypeScript 專案亦可使用 `.spec.tsx` 或 `.test.tsx` 測試 React 組件

---

## 測試檔 Header / Test File Header

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
import { afterEach, beforeEach, describe, it, test } from 'node:test';
import assert from 'node:assert/strict';
```

- 使用 `node:assert/strict` 模組：其 `assert.equal` / `assert.deepEqual` 即為 `strictEqual` / `deepStrictEqual`，建議直接呼叫 `strictEqual` 明確表達
- 需要被測試執行器計數的斷言，改用測試上下文 `t.assert.*`（如 `t.assert.strictEqual()`、`t.assert.snapshot()`）；`assert.*` 直接呼叫不計入斷言數
- 需要 Mock 時，於測試回呼中使用測試上下文 `t.mock.fn()` / `t.mock.method()`

---

## Matcher / API 對應表 (Matcher & API Mapping)

> 圖例：✅ 原生支援　⚠️ 可表達但需改寫　❌ 無對應　🐛 已知危險 Bug

| 斷言意圖 | Jest | Vitest | Bun | Node.js（`node:assert/strict`） |
|---------|:----:|:------:|:---:|--------------------------------|
| `toBe`（嚴格相等） | ✅ | ✅ | ✅ | `assert.strictEqual` |
| `toEqual`（深度相等） | ✅ | ✅ | ✅ | `assert.deepStrictEqual`（⚠️ 比 Jest 嚴格：比對 type tag 與 `[[Prototype]]`） |
| `toStrictEqual` | ✅ | ✅ | ✅ | `assert.deepStrictEqual`（✅ 語意最接近） |
| `toMatchObject`（部分比對） | ✅ | ✅ | 🐛 比對後可能改寫原物件 | ⚠️ `assert.partialDeepStrictEqual`（v22.13.0+ / v23.4.0+） |
| `toHaveProperty` | ✅ | ✅ | ✅ | ⚠️ 巢狀路徑需自行存取：`assert.ok('b' in obj)` + `strictEqual(obj.b.c, v)` |
| `toHaveLength` | ✅ | ✅ | ✅ | ❌ 無對應（僅能 `assert.strictEqual(x.length, n)`） |
| `toBeGreaterThan` / `OrEqual` | ✅ | ✅ | ✅ | ⚠️ `assert.ok(a >= b)`（無專用 matcher） |
| `toBeLessThan` / `OrEqual` | ✅ | ✅ | ✅ | ⚠️ `assert.ok(a <= b)`（無專用 matcher） |
| `toBeCloseTo`（浮點精度） | ✅ | ✅ | ✅ | ⚠️ `assert.ok(Math.abs(a - b) < 1e-9)` |
| `toContain` | ✅ | ✅ | ⚠️ 建議 `toEqual(expect.arrayContaining())` | ⚠️ `assert.ok(array.includes(v))` |
| `toContainEqual` | ✅ | ✅ | ⚠️ 需配合 `expect.arrayContaining()` | ⚠️ `assert.ok(array.some((x) => isDeepStrictEqual(x, v)))`（`node:util`） |
| `toMatch`（正則） | ✅ | ✅ | ✅ | ✅ `assert.match(str, regexp)`（v13.6.0+，**僅接受 RegExp**） |
| `toBeNull` / `toBeUndefined` / `toBeDefined` | ✅ | ✅ | ✅ | ✅ `strictEqual(x, null/undefined)` / `notStrictEqual(x, undefined)` |
| `toBeTruthy` / `toBeFalsy` | ✅ | ✅ | ✅ | ⚠️ `assert.ok(x)` / `assert.ok(!x)` |
| `toBeInstanceOf` | ✅ | ✅ | ✅ | ⚠️ `assert.ok(x instanceof T)` |
| `toThrow` | ✅ | ✅（`toThrowError` 已棄用） | ✅ | ✅ `assert.throws(fn, ...)`（形式對應見下方） |
| `.not.toThrow()` | ✅ | ✅ | ✅ | ⚠️ `assert.doesNotThrow(fn)`（文件標註實益不大，多數情況直接呼叫即可） |
| `.rejects` | ✅ | ✅ | ✅ | ✅ `await assert.rejects(asyncFn, ...)`（v10.0.0+，`error` 參數形式同 `throws`） |
| `.resolves` | ✅ | ✅ | ✅ | ⚠️ `await` 之後再斷言（無鏈式 API） |
| `toHaveBeenCalled` / `Times` / `With` | ✅ | ✅（`vi.fn()`） | ✅（`mock()`） | ⚠️ `t.mock.fn()` + `strictEqual(fn.mock.callCount(), n)` |
| `toMatchSnapshot`（含 property matcher） | ✅ | ✅ | 🐛 property matcher 有改寫原物件風險 | ✅ `t.assert.snapshot()` + `t.assert.partialDeepStrictEqual()`（見下方近似寫法） |
| `toThrowErrorMatchingSnapshot` | ✅ | ✅ | ✅ | ⚠️ 需自行擷取 `error.message` 後 snapshot |
| `expect.objectContaining` | ✅ | ✅ | 🐛 同一 asymmetric 機制風險 | ⚠️ `assert.partialDeepStrictEqual`（巢狀部分比對） |
| `expect.any(Class)` | ✅ | ✅ | 🐛 比對後可能改寫原物件 | ❌ 無 asymmetric matcher（自行 `assert.ok(v instanceof T)`） |

### 對應表注意事項

- **表中的 `assert.*` 可換成 `t.assert.*`**：`node:test` 測試上下文的 `t.assert` 會被執行器計數斷言（對應 Jest 回報的斷言數），直接呼叫 `assert.*` 則不計入；`toMatchSnapshot` 的近似即屬此類，見下方小節
- **`toEqual` 的嚴格度差異**：`assert.deepStrictEqual` 會比對 type tag 與 `[[Prototype]]`（`===`），而 Jest `toEqual` 忽略 `undefined` 屬性、不比對類別；Jest 的 `toStrictEqual` 才是語意最接近者
- **`toMatchObject` ≈ `partialDeepStrictEqual`**：僅比對 `expected` 上存在的屬性，可巢狀遞迴，且會通過所有 `deepStrictEqual` 的測試案例（為其超集）；`[[Prototype]]` 不比較、`Map`/`Set` 無序、`WeakMap`/`WeakSet`/`Promise` 需同引用、稀疏陣列忽略 hole
- **`toContainEqual` 需要「回傳布林值」的深度比對**：`node:assert` 一律以丟出例外表達失敗，改用 `node:util` 的 `isDeepStrictEqual(actual, expected)`（v9.0.0+）搭配 `array.some()`
- **`toThrow` 的 RegExp 行為不同**：Node 對 error 執行 `.toString()` 再比對（結果含 error name，如 `/^Error: Wrong value$/`），Jest 只比對 `error.message`，詳見下方形式對應表
- **Node.js 沒有 matcher 層**：所有「非等值」意圖（大小比較、instanceof、長度、包含）皆需以 `assert.ok()` 自行表達，錯誤訊息不如 Jest 詳盡
- **`toHaveLength` 無對應**：`node:assert` 只能斷言 `.length`，這是框架限制；Jest / Vitest / Bun 環境仍應遵循主文件的 `toHaveLength()` 規則
- **Bun 目標相容 Jest 但未實作全部**：`toContain` / `toContainEqual` 建議改用 `expect.arrayContaining()`
- **Vitest 幾乎為 Jest 的 drop-in**：matcher 與 snapshot 用法相同，僅 Mock 命名空間由 `jest.*` 改為 `vi.*`

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

### `toThrow` / `rejects` 的 error 參數對應 (Error Parameter Mapping)

**兩者接受的形式不完全相同，字串與 RegExp 的語意尤其容易踩坑。**

| Jest / Vitest / Bun `toThrow(...)` 傳入 | Node `assert.throws(fn, error)` 對應 | 說明 |
|------------------------------------------|-------------------------------------|------|
| `toThrow(TypeError)`（error class） | ✅ `assert.throws(fn, TypeError)` | 同為建構子比對 |
| `toThrow(/regex/)` | ⚠️ `assert.throws(fn, /^Error: Wrong value$/)` | **Node 比對 `error.toString()`，需含 error name**；Jest 只比對 `error.message` |
| `toThrow('substring')`（字串） | ⚠️ `assert.throws(fn, { message: /substring/ })` | Node 不接受字串；改用驗證物件內的 RegExp 做子串比對 |
| `toThrow(expect.objectContaining({...}))` | ✅ `assert.throws(fn, { ... })` | 驗證物件只列出要比對的屬性；**巢狀物件屬性須齊全**，且巢狀屬性不可用 RegExp |
| `toThrow((e) => boolean)`（驗證函式） | ✅ `assert.throws(fn, (e) => true)` | 回傳 truthy 即通過 |
| `.rejects.toThrow(...)` | ✅ `await assert.rejects(asyncFn, ...)` | `error` 參數形式同上：`Class` / `RegExp` / `Function` / `Object` / `Error` |

### `toMatchSnapshot` 的 Node 近似 (Node Approximation)

**Node 沒有 property matcher 參數，Jest 的 `toMatchSnapshot({ 指定欄位 })` 需以「全值快照」＋「部分比對」兩者並用近似。**

```typescript
// ✅ Jest / Vitest：全值快照，同時鎖定指定欄位的值
it('version output', () => {
	expect(actual).toMatchSnapshot({
		versionOld: '1.2.3',
		versionNew: '2.0.0',
	});
});
```

```typescript
// ✅ Node.js：t.assert.snapshot()（全值快照，v22.3.0+）
//          + t.assert.partialDeepStrictEqual()（指定欄位，v22.13.0+ / v23.4.0+，v24.0.0 起 Stable）
it('version output', (t) => {
	t.assert.snapshot(actual);
	t.assert.partialDeepStrictEqual(actual, {
		versionOld: '1.2.3',
		versionNew: '2.0.0',
	});
});
```

| 職責 | Jest / Vitest / Bun | Node.js（`node:test`） |
|------|---------------------|------------------------|
| 全值結構快照 | `toMatchSnapshot()` | `t.assert.snapshot()` |
| 指定欄位的值 | property matcher 參數 | `t.assert.partialDeepStrictEqual()` |
| **快照建立** | 首次執行自動建立 | ⚠️ **必須帶 `--test-update-snapshots`** |
| 快照更新 | `-u` / `--updateSnapshot` | `--test-update-snapshots`（與建立為同一旗標） |

> ⚠️ **`--test-update-snapshots` 同時控管「建立」與「更新」**：Node 只在啟動時帶有該旗標，才會把序列化結果**寫入**快照檔；未帶旗標時僅與既有檔案比對，**快照檔不存在則測試直接失敗**。因此首次執行必須先帶旗標建立 snap，其後不帶旗標的執行才會通過。
>
> 對照 Jest / Vitest / Bun：首次執行**自動建立**、只有「更新」才需 `-u`；Node 若不加旗標連建立都無法執行，CI 首跑必須留意。
>
> 詳見 [Snapshot testing - Node.js Test Runner](https://nodejs.org/api/test.html#snapshot-testing)。

---

## 各框架注意事項 (Framework Notes)

| 面向 | Jest | Vitest | Bun | Node.js |
|------|------|--------|-----|---------|
| **Mock** | `jest.fn()` / `jest.mock()` | `vi.fn()` / `vi.mock()` | `mock()` / `mock.method()`（`bun:test`，Jest-like） | `t.mock.fn()` / `t.mock.method()` |
| **Snapshot 檔** | `__snapshots__/*.snap` | `__snapshots__/*.snap` | `__snapshots__/*.snap` | `*.snapshot`（同名檔案；**建立與更新皆需** `--test-update-snapshots`，未帶旗標不寫入，見上方近似小節） |
| **Fake Timers** | `jest.useFakeTimers()` | `vi.useFakeTimers()` | `setSystemTime()`（`bun:test`） | `t.mock.timers` |
| **覆蓋率** | `jest --coverage`（內建） | `vitest --coverage`（需 provider） | `bun test --coverage`（內建） | `--experimental-test-coverage`（實驗性）或 c8 |
| **已知版本差異** | v30 移除 `toThrowError` | `toThrowError` 為已棄用別名 | 相容性以 tracking issue 為準 | v22.3.0+ `t.assert.snapshot()`、v22.13.0+ / v23.4.0+ `partialDeepStrictEqual`（v24.0.0 起 Stable）、v13.6.0+ `assert.match` |
| **已知危險 Bug** | — | — | asymmetric matcher（如 `expect.any` / `expect.objectContaining`）比對後可能改寫原物件，**詳見上方「Bun matcher 的危險已知 Bug」小節** | 快照未帶 `--test-update-snapshots` 時連建立都不會執行 |

### node:assert 的 Strict / Legacy 模式 (Strict vs Legacy Mode)

**建議統一使用 `node:assert/strict`（v15.0.0 起以 `require('node:assert/strict')` / `import ... from 'node:assert/strict'` 匯入）：strict 模式下非嚴格方法會表現為對應的嚴格方法。**

| Legacy（`node:assert`） | Strict（`node:assert/strict`） | 說明 |
|--------------------------|-------------------------------|------|
| `assert.equal`（`==`） | `assert.strictEqual` 的別名 | 淺層強制轉換相等（Legacy 狀態：Stability 3 - Legacy） |
| `assert.notEqual`（`!=`） | `assert.notStrictEqual` 的別名 | |
| `assert.deepEqual` | `assert.deepStrictEqual` 的別名 | 深度比對（Legacy 以 `==` 比較原始值、不比對 type tag） |
| `assert.notDeepEqual` | `assert.notDeepStrictEqual` 的別名 | |

- `assert.strictEqual` / `deepStrictEqual` 會比對 type tag、`[[Prototype]]`（`===`）與 `Error` 的 `name` / `message` / `cause` / `errors`
- Jest `toEqual` 的寬鬆度較接近 Legacy 模式，但兩者規則不同（如 `undefined` 屬性、類別），**不可直接等同**，近似時一律以 `deepStrictEqual` 為準
- 需要「回傳布林值」而非丟例外的深度比對時，改用 `node:util` 的 `isDeepStrictEqual(val1, val2[, options])`
  - 參數 `{ skipPrototype: true }`（v24.9.0+）可略過 prototype / constructor 比較，在比對「不同類別但結構相同」的物件時較接近 Jest `toEqual`；但仍會比對 `undefined` 屬性，**不完全等價**

---

## 相關資源 (Related Resources)

- [SKILL.md](../SKILL.md)
- [測試框架 API 重構範例](./examples.md)
- [斷言語法優化：可讀性 matcher 與物件比對](./assertion-syntax.md)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Node.js assert Module](https://nodejs.org/api/assert.html)
- [Vitest expect API](https://vitest.dev/api/expect)
- [Bun Test Runner](https://bun.com/docs/test)
- [Bun Issue #3521 - `expect.any` / `toMatchObject` mutates the object](https://github.com/oven-sh/bun/issues/3521)
