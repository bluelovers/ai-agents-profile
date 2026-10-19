---
description: >-
  Node.js 原生測試斷言（t.assert）與 Jest / Vitest / Bun 完整 Matcher 對應參考手冊：
  收錄所有常規斷言、數值浮點、物件結構部分比對、正則匹配、拋錯比對細節與邊界案例。
tags:
  - documentation/references
  - testing
  - testing/nodejs
  - testing/node-test
  - testing/assertions
---

# Matcher 深入對應與邊界案例手冊 / Matcher Mapping & Edge Cases Reference

本文件為 `SKILL.md` 的補充參考資料，詳述從 Jest / Vitest / Bun 遷移至 Node.js `t.assert` 時的邊界情況、型別差異與實作細節。

---

## 斷言原則回顧

1. **回呼參數一律標註 `t: test.TestContext`**。
2. **測試中一律強制使用 `t.assert`，嚴禁使用 `node:assert/strict`**（除非有不可抗的環境因素、相容性問題或特定意圖）。
3. **一律使用 Strict 系方法**（如 `strictEqual`、`deepStrictEqual`）。

---

## 完整 API 詳細對照 (Exhaustive Matcher Mapping)

### 1. 相等性比對 (Equality)

#### `toBe` vs `strictEqual`
- Jest: `expect(a).toBe(b)`（底層使用 `Object.is(a, b)`）
- Node.js: `t.assert.strictEqual(a, b)`（底層使用 `Object.is(a, b)`）
- 邊界特性：
  - `NaN` 與 `NaN` 視為相等
  - `+0` 與 `-0` 視為不相等

#### `toEqual` vs `toStrictEqual` vs `deepStrictEqual`
- **差異警示**：
  - Jest `toEqual` 忽略物件屬性值為 `undefined` 的欄位，且不檢查建構子原型（prototype）。
  - Jest `toStrictEqual` 檢查 `undefined` 屬性與原型。
  - Node.js `t.assert.deepStrictEqual` 的嚴格程度等同甚至略高於 Jest `toStrictEqual`：它會嚴格檢查物件的 `[[Prototype]]`、tag 與屬性描述符。
- 若需要如 Jest `toEqual` 般忽略 prototype 差異（例如由不同 Realm 或同結構不同類別產生的物件）：
  - 可於 Node.js v24.9.0+ 使用 `node:util` 的 `isDeepStrictEqual(a, b, { skipPrototype: true })` 搭配 `t.assert.ok(...)`。

---

### 2. 物件部分比對 (Partial Object Matching)

#### `toMatchObject`
- Node.js 原生自 v22.13.0+ / v23.4.0+（v24.0.0+ 標記為 Stable）引入 `t.assert.partialDeepStrictEqual(actual, expected)`。
- 行為：
  - 只比對 `expected` 中存在的鍵與巢狀結構。
  - 若 `expected` 具備的所有屬性在 `actual` 中皆深度嚴格相等，則通過斷言。

#### `toHaveProperty`
- Jest: `expect(obj).toHaveProperty('a.b.c', value)`
- Node.js 改寫：
  ```typescript
  test('驗證巢狀屬性', (t: test.TestContext) => {
  	t.assert.ok('a' in obj && 'b' in obj.a);
  	t.assert.strictEqual(obj.a.b.c, value);
  });
  ```

---

### 3. 陣列與包含比對 (Array & Containment)

#### `toContain`
- 基礎型別陣列或字串子串：
  ```typescript
  test('驗證陣列包含純值', (t: test.TestContext) => {
  	t.assert.ok(list.includes('target'));
  });
  ```

#### `toContainEqual`
- 物件深度比對包含：
  - Node.js 沒有內建「回傳布林值」的丟錯式斷言，需藉助 `node:util` 的 `isDeepStrictEqual`：
  ```typescript
  import { isDeepStrictEqual } from 'node:util';

  test('驗證陣列包含特定結構物件', (t: test.TestContext) => {
  	const exists = list.some((item) => isDeepStrictEqual(item, { id: 1, role: 'admin' }));
  	t.assert.ok(exists, '陣列中應包含符合結構的物件');
  });
  ```

---

### 4. 錯誤拋出與非同步拋錯 (Errors & Rejections)

#### `toThrow` 正則比對陷阱
在 Jest 中：
```typescript
expect(() => { throw new Error('invalid id'); }).toThrow(/^invalid id$/);
```
在 Node.js 中，`t.assert.throws(fn, regex)` 是拿正則與 `err.toString()`（即 `'Error: invalid id'`）進行比對！
若直接寫 `/^invalid id$/` 會失敗。

正確改寫方式有兩種：
```typescript
// 寫法 1：加上 Error 前綴
t.assert.throws(fn, /^Error: invalid id$/);

// 寫法 2：改用驗證物件比對 message（推薦）
t.assert.throws(fn, {
	message: /^invalid id$/,
});
```

#### 字串匹配
Node.js `t.assert.throws` 不接受直接傳入字串作為預期錯誤訊息：
```typescript
// ❌ 錯誤：Node.js 不支援直接傳入字串
t.assert.throws(fn, 'invalid id');

// ✅ 正確：透過 message 物件包裝 RegExp
t.assert.throws(fn, {
	message: /invalid id/,
});
```

#### 非同步拋錯 `rejects`
```typescript
test('非同步驗證拋錯', async (t: test.TestContext) => {
	await t.assert.rejects(
		async () => {
			await fetchUser(-1);
		},
		{
			name: 'NotFoundError',
			message: /User not found/,
		},
	);
});
```

---

### 5. 快照限制與注意事項 (Snapshot Caveats)

1. **循環引用（Circular References）**：
   `t.assert.snapshot()` 使用 JSON 序列化，當物件存在循環引用時會拋出 `TypeError: Converting circular structure to JSON`。若遇循環結構，應先挑選目標屬性或透過自訂序列化函式轉換後再傳入 `snapshot()`。
2. **快照檔案位置**：
   預設產生的快照檔案名為 `<test-file-name>.snapshot`，存於該測試檔相同資料夾內。
3. **CI 環境**：
   CI 環境若遺漏快照或快照不一致，必須由本地產生並提交，CI 中不應傳入 `--test-update-snapshots`。
