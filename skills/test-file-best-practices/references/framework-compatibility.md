---
description: >-
  測試框架相容性與 API 對應：Jest / Vitest / Bun / Node.js(node:test) 四框架的
  測試檔命名規則與預設匹配模式、測試檔 Header（含 Jest v30 移除 toThrowError、
  Vitest toThrowError 已棄用）、matcher 與 node:assert/strict 的 API 對應表，
  以及各框架的 Mock、Snapshot、覆蓋率差異。
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

> 圖例：✅ 原生支援　⚠️ 可表達但需改寫　❌ 無對應

| 斷言意圖 | Jest | Vitest | Bun | Node.js（`node:assert/strict`） |
|---------|:----:|:------:|:---:|--------------------------------|
| `toBe`（嚴格相等） | ✅ | ✅ | ✅ | `assert.strictEqual` |
| `toEqual`（深度相等） | ✅ | ✅ | ✅ | `assert.deepStrictEqual` |
| `toStrictEqual` | ✅ | ✅ | ✅ | `assert.deepStrictEqual`（不區分 toEqual/toStrict 差異） |
| `toMatchObject`（部分比對） | ✅ | ✅ | ✅ | ⚠️ `assert.partialDeepStrictEqual`（Node v23.4.0+） |
| `toHaveProperty` | ✅ | ✅ | ✅ | ⚠️ `assert.ok(obj && 'key' in obj)` 再 `strictEqual` |
| `toHaveLength` | ✅ | ✅ | ✅ | ❌ 無對應（僅能 `assert.strictEqual(x.length, n)`） |
| `toBeGreaterThan` / `OrEqual` | ✅ | ✅ | ✅ | ⚠️ `assert.ok(a >= b)`（無專用 matcher） |
| `toBeLessThan` / `OrEqual` | ✅ | ✅ | ✅ | ⚠️ `assert.ok(a <= b)`（無專用 matcher） |
| `toBeCloseTo`（浮點精度） | ✅ | ✅ | ✅ | ⚠️ `assert.ok(Math.abs(a - b) < 1e-9)` |
| `toContain` | ✅ | ✅ | ⚠️ 建議 `toEqual(expect.arrayContaining())` | ⚠️ `assert.ok(array.includes(v))` |
| `toContainEqual` | ✅ | ✅ | ⚠️ 需配合 `expect.arrayContaining()` | ⚠️ `assert.ok(array.some(...))` |
| `toMatch`（正則） | ✅ | ✅ | ✅ | ✅ `assert.match(string, regexp)` |
| `toBeNull` / `toBeUndefined` / `toBeDefined` | ✅ | ✅ | ✅ | ✅ `strictEqual(x, null/undefined)` / `notStrictEqual(x, undefined)` |
| `toBeTruthy` / `toBeFalsy` | ✅ | ✅ | ✅ | ⚠️ `assert.ok(x)` / `assert.ok(!x)` |
| `toBeInstanceOf` | ✅ | ✅ | ✅ | ⚠️ `assert.ok(x instanceof T)` |
| `toThrow` | ✅ | ✅（`toThrowError` 已棄用） | ✅ | ✅ `assert.throws(fn, ...)` |
| `.rejects` | ✅ | ✅ | ✅ | ✅ `await assert.rejects(asyncFn, ...)` |
| `.resolves` | ✅ | ✅ | ✅ | ⚠️ `await` 之後再斷言（無鏈式 API） |
| `toHaveBeenCalled` / `Times` / `With` | ✅ | ✅（`vi.fn()`） | ✅（`mock()`） | ⚠️ `t.mock.fn()` + `strictEqual(fn.mock.callCount(), n)` |
| `toMatchSnapshot`（含 property matcher） | ✅ | ✅ | ✅ | ✅ `t.assert.snapshot()` + `t.assert.partialDeepStrictEqual()`（見下方近似寫法） |
| `toThrowErrorMatchingSnapshot` | ✅ | ✅ | ✅ | ⚠️ 需自行擷取 `error.message` 後 snapshot |
| `expect.objectContaining` / `expect.any` | ✅ | ✅ | ✅ | ❌ 無 asymmetric matchers |

### 對應表注意事項

- **表中的 `assert.*` 可換成 `t.assert.*`**：`node:test` 測試上下文的 `t.assert` 會被執行器計數斷言（對應 Jest 回報的斷言數），直接呼叫 `assert.*` 則不計入；`toMatchSnapshot` 的近似即屬此類，見下方小節
- **Node.js 沒有 matcher 層**：所有「非等值」意圖（大小比較、instanceof、長度、包含）皆需以 `assert.ok()` 自行表達，錯誤訊息不如 Jest 詳盡
- **`toHaveLength` 無對應**：`node:assert` 只能斷言 `.length`，這是框架限制；Jest / Vitest / Bun 環境仍應遵循主文件的 `toHaveLength()` 規則
- **Bun 目標相容 Jest 但未實作全部**：`toContain` / `toContainEqual` 建議改用 `expect.arrayContaining()`
- **Vitest 幾乎為 Jest 的 drop-in**：matcher 與 snapshot 用法相同，僅 Mock 命名空間由 `jest.*` 改為 `vi.*`

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
//          + t.assert.partialDeepStrictEqual()（指定欄位，v23.4.0+）
it('version output', (t) => {
	t.assert.snapshot(actual);
	t.assert.partialDeepStrictEqual(actual, {
		versionOld: '1.2.3',
		versionNew: '2.0.0',
	});
});
```

| 職責 | Jest / Vitest | Node.js（`node:test`） |
|------|---------------|------------------------|
| 全值結構快照 | `toMatchSnapshot()` | `t.assert.snapshot()` |
| 指定欄位的值 | property matcher 參數 | `t.assert.partialDeepStrictEqual()` |
| 快照更新 | `-u` / `--updateSnapshot` | `--test-update-snapshots` |

---

## 各框架注意事項 (Framework Notes)

| 面向 | Jest | Vitest | Bun | Node.js |
|------|------|--------|-----|---------|
| **Mock** | `jest.fn()` / `jest.mock()` | `vi.fn()` / `vi.mock()` | `mock()` / `mock.method()`（`bun:test`，Jest-like） | `t.mock.fn()` / `t.mock.method()` |
| **Snapshot 檔** | `__snapshots__/*.snap` | `__snapshots__/*.snap` | `__snapshots__/*.snap` | `*.snapshot`（同名檔案，`--test-update-snapshots` 更新） |
| **Fake Timers** | `jest.useFakeTimers()` | `vi.useFakeTimers()` | `setSystemTime()`（`bun:test`） | `t.mock.timers` |
| **覆蓋率** | `jest --coverage`（內建） | `vitest --coverage`（需 provider） | `bun test --coverage`（內建） | `--experimental-test-coverage`（實驗性）或 c8 |
| **已知版本差異** | v30 移除 `toThrowError` | `toThrowError` 為已棄用別名 | 相容性以 tracking issue 為準 | v22.3.0+ `t.assert.snapshot()`、v23.4.0+ `t.assert.partialDeepStrictEqual()` |

---

## 相關資源 (Related Resources)

- [SKILL.md](../SKILL.md)
- [測試框架 API 重構範例](./examples.md)
- [斷言語法優化：可讀性 matcher 與物件比對](./assertion-syntax.md)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Vitest expect API](https://vitest.dev/api/expect)
- [Bun Test Runner](https://bun.com/docs/test)
