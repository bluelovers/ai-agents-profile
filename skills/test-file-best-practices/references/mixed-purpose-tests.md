---
description: >-
  單一測試混雜多個目的的不良實作與改善：
  一個 test() 同時驗證守衛行為與後續邏輯、測試內重複實作被測函式的控制流、
  以前置守衛 early return 讓測試可能靜默通過、冗餘斷言與哨兵字串欄位等雜訊；
  應拆分為「一個測試一個目的」，移除非必要雜訊，但保留外部套件實例結構快照。
  另收錄檔案層級混雜多個功能模組的分割案例。
tags:
  - documentation/references
  - testing
  - testing/organization
---

# 單一測試混雜多個目的 (Mixed Purposes in a Single Test)

**一個 `test()` 應只驗證一個目的。** 當測試標題只描述行為 A，卻同時驗證行為 A 與行為 B，或在測試內重新實作被測函式的控制流時，失敗訊息將無法指出真正出錯的環節，維護者也難以判斷該拆還是該留。

主文件僅保留原則摘要與判斷準則，完整不良案例、問題解析與改善版本集中於此。

---

## 判斷準則 (Rule of Thumb)

| 徵兆 | 說明 | 處理 |
|------|------|------|
| **標題與內容不符** | 標題只寫守衛行為，內容卻也斷言了後續邏輯的具體輸出 | 拆成兩筆測試，各自命名 |
| **測試內重複實作控制流** | 測試自己寫了一份 `if (!guard) return ...`，複製被測函式的走訪流程 | 直接呼叫被測函式，或拆分守衛與邏輯各自的測試 |
| **前置守衛 early return** | `if (!condition) return` 讓守衛失敗時測試未執行任何斷言卻仍通過 | 移除守衛，讓測試必定執行到斷言 |
| **冗餘斷言** | `Array.isArray(x)` 與 `deepStrictEqual` 重複、`.length` 與陣列比對重複 | 保留資訊量最高的一筆斷言 |
| **描述性欄位混入資料** | `label`、`isLibIgnore` 等僅供閱讀的欄位與實際輸入混在同一陣列 | 移除可由其他欄位推得的描述欄位，保留必要者（如 `label`、`instance`） |

### 不必要雜訊速查 (Noise Quick Reference)

| 雜訊 | 範例 | 為何是雜訊 | 簡化後 |
|------|------|-----------|--------|
| **哨兵字串欄位** | `isLibIgnore: false, rules: '(skipped)'` | 兩個欄位表達同一件事，`rules` 已足以判斷 | 只保留 `rules: null` |
| **非必要欄位** | `isLibIgnore: true` | 與「`instance` 為 ignore 實例」重複 | 移除，改保留 `instance` |
| **冗餘型別斷言** | `t.assert.ok(Array.isArray(rules))` | 後續 `deepStrictEqual` 已涵蓋 | 移除 |
| **冗餘長度斷言** | `t.assert.strictEqual(rules?.length, 3)` | 後續 `deepStrictEqual` 已涵蓋 | 移除 |
| **非必要 `?.`** | `rules?.map(...)` | 已確認為陣列時無需防禦 | `rules.map(...)` |
| **區塊式 early return** | `if (!x) { return {...} }` | 可用三元表達式取代 | `cond ? a : b` |

---

## 案例一：守衛流程與規則抽取混雜 (Case 1: Guard Flow Mixed With Rule Extraction)

**單一測試同時驗證「前置守衛的走訪結果」與「規則抽取的具體內容」，並在測試內重複實作了被測函式的守衛流程。**

### 不良範例

```typescript
test(`_extractRules 只在 _isLibIgnore 為 true 時才驗證後續邏輯`, (t: test.TestContext) =>
{
	const lib = ignore().add([
		'*.log',
		'!keep.log',
		'node_modules/',
	])

	const __cases: { label: string, value: unknown }[] = [
		{ label: 'ignore 實例', value: lib },
		{ label: '一般物件', value: {} },
	]

	/**
	 * 快照保存「守衛 → 抽取」的走訪結果：
	 * 守衛通過才取出規則，未通過一律標記為略過，完全不碰規則邏輯
	 */
	t.assert.snapshot(__cases.map(({ label, value }) =>
	{
		/**
		 * 前置守衛：不是 ignore 套件實例就跳過後續規則邏輯
		 */
		if (!_isLibIgnore(value))
		{
			return {
				label,
				isLibIgnore: false,
				rules: '(skipped)',
			}
		}

		return {
			label,
			isLibIgnore: true,
			rules: _extractRules(value),
		}
	}))

	/**
	 * 前置守衛通過才做最小斷言
	 */
	if (!_isLibIgnore(lib))
	{
		return
	}

	const rules = _extractRules(lib)

	t.assert.ok(Array.isArray(rules), `回傳規則陣列`)
	t.assert.strictEqual(rules?.length, 3)
	t.assert.deepStrictEqual(rules?.map(({ pattern, negative }) => ({ pattern, negative })), [
		{ pattern: '*.log', negative: false },
		{ pattern: '!keep.log', negative: true },
		{ pattern: 'node_modules/', negative: false },
	])
})
```

**問題解析：**

| # | 問題 | 說明 |
|---|------|------|
| 1 | **混雜兩個目的** | 標題只談守衛，內容卻也斷言了 `_extractRules` 的具體輸出（`pattern` / `negative`）。守衛出錯與規則出錯會落在同一筆測試，失敗時難以定位 |
| 2 | **測試內重複實作守衛流程** | `map` 內的 `if (!_isLibIgnore(value)) { return ... }` 是被測函式控制流的複本。測試自己寫了一份邏輯，等於以「重寫」而非「驗證」來確認行為 |
| 3 | **前置守衛讓測試可能靜默通過** | `if (!_isLibIgnore(lib)) { return }` — 一旦守衛失敗，測試不會執行任何斷言卻仍然通過，覆蓋率與信心同時流失 |
| 4 | **哨兵欄位冗餘** | `isLibIgnore: false` 與 `rules: '(skipped)'` 表達同一件事；`isLibIgnore: true` 更與「`instance` 為 ignore 實例」重複 |
| 5 | **冗餘斷言** | `Array.isArray(rules)` 與 `rules?.length === 3` 都已被後續的 `deepStrictEqual` 涵蓋 |
| 6 | **非必要 `?.`** | 已確認回傳陣列後仍寫 `rules?.`，徒增防禦分支 |

### 良好範例

拆成兩筆測試，各負責一個目的，並移除所有冗餘欄位與斷言：

```typescript
test('_isLibIgnore 守衛：未通過守衛的案例不接觸規則邏輯', (t: test.TestContext) =>
{
	const cases = [
		{
			label: 'ignore 實例',
			value: ignore().add(['*.log', '!keep.log', 'node_modules/']),
		},
		{
			label: '一般物件',
			value: {},
		},
	]

	/**
	 * 快照保存「守衛 → 抽取」的走訪結果，並一併留下實例本身：
	 * ignore 為外部套件，實例結構可據以理解其內部欄位；
	 * 守衛未通過時 rules 為 null，完全不碰規則邏輯
	 */
	t.assert.snapshot(cases.map(({ label, value }) => ({
		label,
		instance: value,
		rules: _isLibIgnore(value) ? _extractRules(value) : null,
	})))
})

test('_extractRules：回傳 ignore 套件的規則陣列', (t: test.TestContext) =>
{
	const rules = _extractRules(ignore().add([
		'*.log',
		'!keep.log',
		'node_modules/',
	]))

	t.assert.deepStrictEqual(rules.map(({ pattern, negative }) => ({ pattern, negative })), [
		{ pattern: '*.log', negative: false },
		{ pattern: '!keep.log', negative: true },
		{ pattern: 'node_modules/', negative: false },
	])
})
```

### 改寫對照

| 原本 | 處理 | 理由 |
|------|------|------|
| 單一 `test()` 同時涵蓋守衛與抽取 | **拆成兩筆測試** | 一個測試一個目的；失敗時可直接定位是守衛錯還是抽取錯 |
| `map` 內的 `if (!_isLibIgnore(value)) { return ... }` | → 三元表達式 | 以表達式描述分支，不再以區塊複製被測控制流 |
| `isLibIgnore: false` + `rules: '(skipped)'` | → `rules: null` | 哨兵收斂為單一欄位，型別乾淨且無歧義 |
| `isLibIgnore: true` | **刪除** | 與「`instance` 為 ignore 實例」重複，實例本身已可判斷守衛結果 |
| 只留下通過守衛的抽取結果 | → **一律保留 `instance`** | `ignore` 為外部套件，實例結構正是快照要記錄的對象，守衛未通過也應留下 |
| `if (!_isLibIgnore(lib)) { return }` | **刪除** | 測試必定執行到斷言，不會靜默通過 |
| `t.assert.ok(Array.isArray(rules))` | **刪除** | 已被 `deepStrictEqual` 涵蓋 |
| `t.assert.strictEqual(rules?.length, 3)` | **刪除** | 已被 `deepStrictEqual` 涵蓋 |
| `rules?.map(...)` | → `rules.map(...)` | 已確認為陣列，無需防禦 |

**原則：快照記錄「走訪結果與實例結構」，具體輸出交給明確斷言。** 兩者各司其職，不要在同一筆測試中同時承擔。

---

## 案例二：單一檔案混雜多個功能模組 (Case 2: Multiple Modules in One File)

**混雜不只發生在單一測試內，檔案層級同樣適用：單一測試檔案放置過多不同功能的測試案例，會使維護者難以找到目標測試。**

### 不良範例

```typescript
// ❌ 單一檔案混雜多個功能模組的測試
describe('UserService', () => {
	describe('create', () => { /* 50+ 測試案例 */ });
	describe('update', () => { /* 50+ 測試案例 */ });
	describe('delete', () => { /* 50+ 測試案例 */ });
	describe('query', () => { /* 50+ 測試案例 */ });
});
```

### 良好範例

```typescript
// ✅ 分割後的測試檔案
// test/user-service/create.spec.ts
describe('UserService.create', () => { /* 相關測試 */ });

// test/user-service/update.spec.ts
describe('UserService.update', () => { /* 相關測試 */ });
```

完整的分割準則與目錄結構，請參閱 [SKILL.md - 測試檔案分割原則](../SKILL.md#2-測試檔案分割原則--test-file-splitting)。

---

## 相關資源 (Related Resources)

- [SKILL.md](../SKILL.md)
- [避免無意義的測試：判定與改寫](./meaningless-tests.md)
- [斷言語法優化：可讀性 matcher 與物件比對](./assertion-syntax.md)
- [測試框架 API 重構範例](./examples.md)
