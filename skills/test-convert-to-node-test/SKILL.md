---
name: test-convert-to-node-test
description: >-
  將其他測試框架（Jest、Vitest、Bun、Mocha 等）轉換或遷移至 Node.js 原生測試（node:test + t.assert）的規範與實作指南。
  當用戶請求 (1) 將測試轉換為 nodejs 原生測試、(2) 測試遷移至 node:test、(3) "轉換為 node:test" / "轉為原生測試"、
  (4) "Jest 轉 node:test" / "Vitest 轉 node:test" / "Bun 轉 node:test" / "Mocha 轉 node:test"、
  (5) "測試框架遷移"、(6) "node:test 斷言轉換" / "t.assert 規範"、(7) "測試快照遷移至 node:test"、
  (8) "Mock 遷移至 t.mock" 時使用此技能。
tags:
  - agents/skills
  - testing
  - testing/nodejs
  - testing/node-test
  - testing/migration
  - testing/jest
  - testing/vitest
  - testing/bun
---

# 測試轉換為 Node.js 原生測試規範 / Convert Tests to Node.js Native Test Runner

## 概述 (Overview)

本技能提供將既有測試（Jest、Vitest、Bun、Mocha 等）完整轉換與遷移至 **Node.js 原生測試執行器（`node:test` + `t.assert`）** 的標準作業程序、語法對應與約束原則。

> 📌 **版本前提與探測限制**：執行遷移與改寫時，除非專案已明定版本，否則一律**假設處於支援 `node:test` 與 `t.assert` 的最新版 Node.js 環境（v22+ / v24+）**；不主動進行環境探測或版本查詢，若遇不相容將自錯誤訊息被動得知。

---

## 核心原則與最高約束 (Core Principles & Constraints)

在將任何測試重構或遷移至 `node:test` 時，必須嚴格遵守以下四大強制規範：

### 1. 範例與測試回呼參數一律標註 `t: test.TestContext` (Strict Type Annotation)

**所有測試函式（`test`、`it`）的回呼參數，一律顯式標註 `t: test.TestContext`。**

```typescript
// ❌ 錯誤：未標註回呼參數型別
test('驗證計算結果', (t) => {
	t.assert.strictEqual(add(1, 2), 3);
});

// ✅ 正確：一律顯式標註 t: test.TestContext
test('驗證計算結果', (t: test.TestContext) => {
	t.assert.strictEqual(add(1, 2), 3);
});
```

- **理由**：部分編輯器與語言伺服器（如 VSCode、WebStorm、TypeScript LSP）在未顯式標註回呼參數型別時，對 `t.assert.*` 或 `t.mock.*` 可能因型別上下文推導不完整而產生誤報（即使在執行期能正常運行）。顯式標註 `t: test.TestContext` 能確保所有開發環境與靜態分析工具皆具備完美的型別推導與自動補完。

---

### 2. 測試中一律強制使用 `t.assert`，嚴禁使用 `node:assert/strict` (Assert via Test Context)

**在測試中，除非有不可抗的環境因素、相容性問題或特定意圖以外，否則應一律使用 `t.assert` 而非 `node:assert/strict`（或 `import assert from 'node:assert/strict'`）。**

```typescript
// ❌ 不良寫法：直接使用獨立的 node:assert/strict 進行斷言
import assert from 'node:assert/strict';

test('驗證字串轉換', (t: test.TestContext) => {
	assert.strictEqual(toUpper('hello'), 'HELLO');
});

// ✅ 良好寫法：一律透過測試上下文 t.assert 呼叫斷言
test('驗證字串轉換', (t: test.TestContext) => {
	t.assert.strictEqual(toUpper('hello'), 'HELLO');
});
```

#### 為什麼必須使用 `t.assert`？

1. **斷言計數追蹤（Assertion Plan & Count）**：
   - `t.assert` 是綁定於當前測試上下文（`TestContext`）的斷言代理。
   - 只有透過 `t.assert` 呼叫的斷言才會被 `node:test` 執行器計入測試案例的斷言數，對應 Jest 等框架回報的斷言數與 plan 檢驗。
   - 使用獨立的 `node:assert/strict` 時，執行器無法感知斷言的發生，斷言數統計將保持為 0。
2. **測試生命週期與子測試隔離（Subtest Isolation & Diagnostics）**：
   - `t.assert` 能精確將斷言失敗定位在對應的子測試或測試步驟中，並附帶該測試步驟的診斷資訊。
   - 若使用全域或獨立的 `assert`，在非同步並行或深層巢狀子測試中，失敗堆疊與錯誤關聯可能無法精準歸屬至該特定測試案例。
3. **避免冗餘頂層匯入**：
   - 使用 `t.assert` 讓測試檔通常**不需要**再額外 `import assert from 'node:assert/strict'`，減少模組污染。

#### 允許使用 `node:assert/strict` 的三大例外情境

僅在以下情境下，才允許使用獨立的 `node:assert` 或 `node:assert/strict`：

| 例外情境 | 具體情境說明 | 範例與處理方式 |
|---------|------------|---------------|
| **不可抗的環境因素** | 執行於非 `node:test` 回呼上下文（例如模組頂層前置檢查、獨立測試前置／後置腳本），或極舊 Node.js 環境不支援 `t.assert` | 在非測試回呼的獨立初始化腳本中斷言前置環境 |
| **相容性問題** | 現有共用函式庫、第三方 helper 或既有 utility 尚未重構注入 `t: test.TestContext` 參數 | 過渡期間共用 helper 內部維持 `node:assert/strict`，但測試檔本體呼叫時仍使用 `t.assert` |
| **特定意圖** | 測試的目標本身就是驗證斷言庫（Assert library）的原生丟錯行為，或需檢驗未綁定上下文的原生斷言實例 | 測試斷言庫擴充插件時直接斷言 `node:assert` 本體行為 |

---

### 3. 一律使用 Strict 系方法 (Prefer Strict Methods)

**`t.assert` 內含 Legacy 與 Strict 兩系方法，一律呼叫 Strict 系（如 `t.assert.strictEqual` 等），禁止使用 Legacy 鬆散比對（如 `equal`）。**

- `t.assert.strictEqual` 代替 `t.assert.equal`
- `t.assert.notStrictEqual` 代替 `t.assert.notEqual`
- `t.assert.deepStrictEqual` 代替 `t.assert.deepEqual`
- `t.assert.notDeepStrictEqual` 代替 `t.assert.notDeepEqual`

---

### 4. 禁止非必要探查：既有代碼已展現足夠資訊 (Avoid Unnecessary Probing)

**轉換測試時，既有代碼已經展現足夠的資訊。基本上無需主動去理解相關代碼的實作、讀取快照檔內容，或進行偵測環境（例如 Node.js 版本、tsx 路徑等）等非必要行為。**

- **無需主動理解相關代碼的實作細節**：
  - 轉換的核心在於「測試語法與斷言 API 的映射轉換」（如 `expect().toBe()` → `t.assert.strictEqual()`）。
  - 測試案例的名稱、輸入參數、預期回傳值與 Mock 定義已完整體現受測行為的合約，**無需主動深入閱讀被測試業務代碼的底層實作**。
- **無需讀取快照檔（Snapshot）內容**：
  - 遷移快照測試時，只需將語法轉換為相應的原生快照 API（如 `t.assert.snapshot()` 或 `toMatchSnapshot(t, ...)` helper）。
  - 快照檔案的內容由測試執行器在帶入 `--test-update-snapshots` 旗標時自動建立或校驗，**主動讀取 `.snap` 或 `.snapshot` 的檔案內容為多餘行為**。
- **嚴禁主動偵測環境（Node.js 版本、tsx 路徑等）**：
  - 一律假設處於支援最新特性的現代 Node.js 環境。
  - **禁止主動執行指令偵測環境**（如 `node -v`、`which tsx`、查詢 `package.json` 中的各類執行路徑等）；若有環境不相容，執行測試時自然會被動地從錯誤訊息中得知，無需事前主動探查。

---

## 測試檔案 Header 與 檔名規範 (Test File Header & Naming)

### 檔名規範

除非有特殊需求，或多測試框架共存，否則不需要更改檔名。

### Header 標準寫法

```typescript
/// <reference types="node" />
import { after, afterEach, before, beforeEach, describe, it, test, type TestContext } from 'node:test';
```

> ⚠️ 測試中斷言一律由回呼傳入的 `t.assert.*` 提供，**通常無需匯入 `node:assert/strict`**。

---

## Matcher / API 遷移對照表 (Matcher & API Mapping)

將 Jest / Vitest / Bun 的斷言語法遷移至 Node.js `t.assert`：

> 圖例：✅ 原生支援　⚠️ 可表達但需改寫　❌ 無對應（以替代方案呈現）

| 原始斷言 (Jest / Vitest / Bun) | Node.js 原生測試 (`t.assert`) | 說明與改寫注意事項 |
|--------------------------------|-------------------------------|-------------------|
| `expect(a).toBe(b)` | ✅ `t.assert.strictEqual(a, b)` | 嚴格相等（`===`） |
| `expect(a).not.toBe(b)` | ✅ `t.assert.notStrictEqual(a, b)` | 嚴格不相等（`!==`） |
| `expect(a).toEqual(b)` | ⚠️ `t.assert.deepStrictEqual(a, b)` | 比 Jest 嚴格：比對型別標記與原型 |
| `expect(a).toStrictEqual(b)` | ✅ `t.assert.deepStrictEqual(a, b)` | 語意最接近 |
| `expect(a).toMatchObject(b)` | ⚠️ `t.assert.partialDeepStrictEqual(a, b)` | v22.13.0+ / v23.4.0+，部分深度比對 |
| `expect(a).toHaveProperty(k, v)` | ⚠️ `t.assert.strictEqual(a[k], v)` | 需自行讀取屬性比對；存在性可用 `'k' in a` |
| `expect(a).toHaveLength(n)` | ❌ `t.assert.strictEqual(a.length, n)` | 需直接斷言 `.length` 屬性 |
| `expect(a).toBeGreaterThan(b)` | ⚠️ `t.assert.ok(a > b)` | 無專用 matcher，以布林斷言表達 |
| `expect(a).toBeGreaterThanOrEqual(b)` | ⚠️ `t.assert.ok(a >= b)` | 無專用 matcher，以布林斷言表達 |
| `expect(a).toBeLessThan(b)` | ⚠️ `t.assert.ok(a < b)` | 無專用 matcher，以布林斷言表達 |
| `expect(a).toBeLessThanOrEqual(b)` | ⚠️ `t.assert.ok(a <= b)` | 無專用 matcher，以布林斷言表達 |
| `expect(a).toBeCloseTo(b, p)` | ⚠️ `t.assert.ok(Math.abs(a - b) < 10 ** -p)` | 浮點精度比對 |
| `expect(a).toContain(item)` | ⚠️ `t.assert.ok(a.includes(item))` | 陣列或字串包含 |
| `expect(a).toContainEqual(item)` | ⚠️ `t.assert.ok(a.some(x => isDeepStrictEqual(x, item)))` | 需搭配 `node:util` 的 `isDeepStrictEqual` |
| `expect(a).toMatch(regex)` | ✅ `t.assert.match(a, regex)` | **僅接受 RegExp**，不接受純字串 |
| `expect(a).not.toMatch(regex)` | ✅ `t.assert.doesNotMatch(a, regex)` | 正則不匹配 |
| `expect(a).toBeNull()` | ✅ `t.assert.strictEqual(a, null)` | Null 檢查 |
| `expect(a).toBeUndefined()` | ✅ `t.assert.strictEqual(a, undefined)` | Undefined 檢查 |
| `expect(a).toBeDefined()` | ✅ `t.assert.notStrictEqual(a, undefined)` | 已定義檢查 |
| `expect(a).toBeTruthy()` | ⚠️ `t.assert.ok(a)` | 真值檢查 |
| `expect(a).toBeFalsy()` | ⚠️ `t.assert.ok(!a)` | 假值檢查 |
| `expect(a).toBeInstanceOf(Class)` | ⚠️ `t.assert.ok(a instanceof Class)` | 實例檢查 |
| `expect(fn).toThrow(expected)` | ✅ `t.assert.throws(fn, expected)` | 詳見下方 `toThrow` 形式差異 |
| `expect(fn).not.toThrow()` | ⚠️ `t.assert.doesNotThrow(fn)` | 不拋出錯誤 |
| `await expect(p).rejects.toThrow(...)` | ✅ `await t.assert.rejects(p, ...)` | 非同步拋錯（`error` 參數同 `throws`） |
| `await expect(p).resolves.toBe(v)` | ⚠️ `t.assert.strictEqual(await p, v)` | 直接 await 後斷言 |
| `expect(fn).toHaveBeenCalled()` | ⚠️ `t.assert.strictEqual(fn.mock.callCount() > 0, true)` | 搭配 `t.mock.fn()` |
| `expect(fn).toHaveBeenCalledTimes(n)` | ⚠️ `t.assert.strictEqual(fn.mock.callCount(), n)` | 搭配 `t.mock.fn()` |
| `expect(fn).toHaveBeenCalledWith(...args)` | ⚠️ `t.assert.deepStrictEqual(fn.mock.calls[0].arguments, [...args])` | 檢查特定呼叫參數 |
| `expect(a).toMatchSnapshot()` | ✅ `t.assert.snapshot(a)` | 快照測試（詳見快照章節） |
| `expect(a).toMatchSnapshot(partial)` | ⚠️ `t.assert.snapshot(a)` + `t.assert.partialDeepStrictEqual(...)` | 近似寫法或使用封裝 helper |
| `expect(fn).toThrowErrorMatchingSnapshot()` | ⚠️ `t.assert.throws` 驗證函式內呼叫 `t.assert.snapshot()` | 詳見近似寫法或使用封裝 helper |

---

## `toThrow` 與 `rejects` 的錯誤比對差異 (Error Assertion Differences)

Jest 與 Node.js 對錯誤比對的規則存在重要差異，遷移時特別容易踩坑：

| 原始語法 (Jest) | Node.js 原生 (`t.assert.throws`) | 核心差異與處理方式 |
|----------------|----------------------------------|-------------------|
| `toThrow(TypeError)` | `t.assert.throws(fn, TypeError)` | ✅ 相同：直接傳入 Error Class |
| `toThrow(/message/)` | `t.assert.throws(fn, /message/)` | ⚠️ **重要**：Node.js 是對 `error.toString()` 做正則比對（字串中包含 `Error: ` 名稱），Jest 只比對 `error.message`。若使用首尾錨定 `/^Wrong value$/`，在 Node 需寫為 `/^Error: Wrong value$/` 或 `{ message: /^Wrong value$/ }` |
| `toThrow('substring')` | `t.assert.throws(fn, { message: /substring/ })` | ⚠️ **Node 不接受純字串**！必須改為驗證物件內的 RegExp 做子字串比對 |
| `toThrow(expect.objectContaining({ code: 'ERR' }))` | `t.assert.throws(fn, { code: 'ERR' })` | ✅ 傳入比對物件，指定屬性比對 |
| `toThrow((err) => boolean)` | `t.assert.throws(fn, (err: any) => true)` | ✅ 驗證函式回傳 truthy 即通過驗證 |

---

## 快照測試遷移 (Snapshot Testing Migration)

### 快照檔案與 CLI

- **快照儲存格式**：Node.js 將快照存於同一目錄下的 `<filename>.test.ts.snapshot`。
- **首次建立與更新快照**：
  - 首次建立快照時，Node.js 不會自動寫入，**必須帶 `--test-update-snapshots`**，否則測試會直接失敗。
  - 更新快照指令：`node --test --test-update-snapshots`。

### Jest Property Matcher 的 Node 近似實作

在 Jest 中，`toMatchSnapshot({ id: expect.any(String) })` 支援部分動態欄位遮蔽與快照。Node 原生無此參數，需以「全值快照」＋「部分比對」近似，或封裝成共用 helper：

```typescript
// ✅ 直接寫法：全值快照 + 指定欄位驗證
test('version output', (t: test.TestContext) => {
	t.assert.snapshot(actual);
	t.assert.partialDeepStrictEqual(actual, {
		versionOld: '1.2.3',
		versionNew: '2.0.0',
	});
});
```

### 封裝共用 Helper (Shared Helpers)

為保持與 Jest / Vitest 相近的簡潔語義，可在測試共用模組（如 `test/helpers/snapshot.ts`）中統一定義：

```typescript
// test/helpers/snapshot.ts
import type test from 'node:test';

/**
 * 近似 Jest 的 toMatchSnapshot（支援 property matcher）
 */
export function toMatchSnapshot<T>(t: test.TestContext, actual: T, expectedPartial?: Partial<T>)
{
	t.assert.snapshot(actual);

	if (expectedPartial !== undefined)
	{
		t.assert.partialDeepStrictEqual(actual, expectedPartial);
	}
}

/**
 * 近似 Jest 的 toThrowErrorMatchingSnapshot
 */
export function toThrowErrorMatchingSnapshot(t: test.TestContext, block: () => unknown)
{
	t.assert.throws(block, (err: any) =>
	{
		t.assert.snapshot({
			[err.name ?? 'Error']: err.message,
		});
		return true;
	});
}
```

```typescript
// 測試檔案使用範例
import { test, type TestContext } from 'node:test';
import { toMatchSnapshot, toThrowErrorMatchingSnapshot } from '../helpers/snapshot';

test('快照比對範例', (t: test.TestContext) => {
	toMatchSnapshot(t, actual, { timestamp: 123456789 });
});

test('拋錯快照比對範例', (t: test.TestContext) => {
	toThrowErrorMatchingSnapshot(t, () => {
		throw new TypeError('Invalid input');
	});
});
```

> 📌 **共用原則**：此類 helper **必須以共用模組公開匯出**，禁止在個別測試檔各自複製一份，以維持單一事實來源（SSoT）。

---

## Mock 與 Timer 遷移 (Mock & Timers Migration)

Node.js 原生測試自帶 `t.mock`，其生命週期綁定於當前測試案例：

| Jest | Node.js 原生 (`t.mock`) |
|------|------------------------|
| `jest.fn()` | `t.mock.fn()` |
| `jest.spyOn(obj, 'method')` | `t.mock.method(obj, 'method')` |
| `jest.useFakeTimers()` | `t.mock.timers.enable()` |
| `jest.advanceTimersByTime(ms)` | `t.mock.timers.tick(ms)` |
| `jest.useRealTimers()` | `t.mock.timers.reset()` |
| `jest.clearAllMocks()` | 測試結束自動清理，或 `t.mock.reset()` |

```typescript
test('驗證事件處理器被調用', (t: test.TestContext) => {
	const callback = t.mock.fn();

	emitter.on('event', callback);
	emitter.emit('event', 'payload');

	t.assert.strictEqual(callback.mock.callCount(), 1);
	t.assert.deepStrictEqual(callback.mock.calls[0].arguments, ['payload']);
});
```

---

## 測試結構與生命週期 Hook 遷移 (Structure & Hooks)

| 功能 | Jest / Vitest | Node.js 原生測試 |
|------|---------------|-----------------|
| 測試套件 | `describe('suite', () => {})` | `describe('suite', () => {})` |
| 測試案例 | `test('name', () => {})` / `it('name', () => {})` | `test('name', (t: test.TestContext) => {})` |
| 全域前置 | `beforeAll(() => {})` | `before(() => {})` |
| 全域後置 | `afterAll(() => {})` | `after(() => {})` |
| 案例前置 | `beforeEach(() => {})` | `beforeEach(() => {})` |
| 案例後置 | `afterEach(() => {})` | `afterEach(() => {})` |
| 子測試 | 巢狀 `describe` | `await t.test('subtest', (t: test.TestContext) => {})` |

```typescript
describe('使用者服務', () => {
	before(() => {
		// 全域初始化
	});

	beforeEach(() => {
		// 每次測試前重置
	});

	test('支援巢狀子測試', async (t: test.TestContext) => {
		await t.test('子行為 A', (t: test.TestContext) => {
			t.assert.strictEqual(1, 1);
		});

		await t.test('子行為 B', (t: test.TestContext) => {
			t.assert.ok(true);
		});
	});
});
```

---

## 命令列執行與指令遷移 (CLI Commands)

| 用途 | Jest | Vitest | Node.js 原生測試 |
|------|------|--------|-----------------|
| **執行測試** | `jest` | `vitest run` | `node --test` / `tsx --test` |
| **執行特定路徑** | `jest path/to/file` | `vitest path/to/file` | `node --test path/to/file` |
| **名稱篩選** | `-t <pattern>` | `-t <pattern>` | `--test-name-pattern="<pattern>"` |
| **快照更新/建立** | `-u` | `-u` | `--test-update-snapshots` |
| **Watch 模式** | `--watch` | `-w` | `--watch` |
| **覆蓋率** | `--coverage` | `--coverage` | `--experimental-test-coverage`（或 `c8`） |

---

## 實戰轉換對照範例 (Before & After Walkthrough)

### 原始 Jest 測試檔案 (`user-service.spec.ts`)

```typescript
import { UserService } from './user-service';

describe('UserService', () => {
	let service: UserService;

	beforeEach(() => {
		service = new UserService();
	});

	it('should create user correctly', () => {
		const user = service.create('Alice');
		expect(user.name).toBe('Alice');
		expect(user.id).toBeDefined();
		expect(user).toMatchSnapshot({
			id: expect.any(String),
		});
	});

	it('should throw error for invalid name', () => {
		expect(() => service.create('')).toThrow('Name is required');
	});

	it('should call notification mock', () => {
		const notify = jest.fn();
		service.setNotifier(notify);
		service.create('Bob');
		expect(notify).toHaveBeenCalledTimes(1);
	});
});
```

### 遷移後 Node.js 原生測試 (`user-service.test.ts`)

```typescript
/// <reference types="node" />
import { beforeEach, describe, it, test, type TestContext } from 'node:test';
import { UserService } from './user-service';
import { toMatchSnapshot } from '../helpers/snapshot';

describe('UserService', () => {
	let service: UserService;

	beforeEach(() => {
		service = new UserService();
	});

	it('should create user correctly', (t: test.TestContext) => {
		const user = service.create('Alice');
		t.assert.strictEqual(user.name, 'Alice');
		t.assert.notStrictEqual(user.id, undefined);
		toMatchSnapshot(t, user, { name: 'Alice' });
	});

	it('should throw error for invalid name', (t: test.TestContext) => {
		t.assert.throws(
			() => service.create(''),
			{ message: /Name is required/ },
		);
	});

	it('should call notification mock', (t: test.TestContext) => {
		const notify = t.mock.fn();
		service.setNotifier(notify);
		service.create('Bob');
		t.assert.strictEqual(notify.mock.callCount(), 1);
	});
});
```

---

## 遷移檢核清單 (Migration Checklist)

遷移測試檔案時，請依序完成以下檢查：

1. [ ] 測試檔命名已改為 `*.test.ts` 或 `*.node-test.ts`。
2. [ ] 測試檔頂部已加入 `/// <reference types="node" />` 與 `import { ... } from 'node:test'`。
3. [ ] 除非具備三大例外情境，測試本體未引用 `node:assert/strict`。
4. [ ] 範例代碼與測試回呼參數一律標註 `t: test.TestContext`。
5. [ ] 斷言一律以 `t.assert.*` 呼叫，且一律使用 Strict 系方法（`strictEqual`、`deepStrictEqual` 等）。
6. [ ] `toThrow` / `rejects` 的字串與 RegExp 已正確修正（字串改為 `{ message: /pattern/ }`，RegExp 考慮 `error.toString()` 格式）。
7. [ ] 快照測試已改用 `t.assert.snapshot()` 或共用 helper，且首次執行帶有 `--test-update-snapshots`。
8. [ ] 共用 helper 已集中於 `helpers/` 或 `test-utils/` 目錄匯出，未在各檔重複貼上。
9. [ ] Mock 與 Spy 已轉換為 `t.mock.fn()` 與 `t.mock.method()`。
10. [ ] `npm test` 執行腳本已更新為 `node --test` 或 `tsx --test`。
11. [ ] 未進行非必要行為（未主動閱讀原始碼實作、未讀取快照檔內容、未主動偵測環境如 Node.js 版本或 tsx 路徑）。

---

## 相關資源 (Related Resources)

- [Matcher 深入對應與邊界案例手冊](./references/matcher-mapping.md)
- [Node.js Test Runner 官方文件](https://nodejs.org/api/test.html)
- [Node.js Assert 官方文件](https://nodejs.org/api/assert.html)
- [測試檔案最佳實踐規範 (`test-file-best-practices`)](../test-file-best-practices/SKILL.md)
- [測試語意與已知缺陷規範 (`test-file-best-practices-extension`)](../test-file-best-practices-extension/SKILL.md)
- [測試檔案系統 Mock 指南 (`test-js-mock`)](../test-js-mock/SKILL.md)
- [測試快照文件化技能 (`test-snapshot-documentation`)](../test-snapshot-documentation/SKILL.md)
