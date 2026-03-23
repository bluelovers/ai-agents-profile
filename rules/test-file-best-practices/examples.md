# 測試框架 API 重構範例
# Test Framework API Refactoring Examples

本文件提供 Jest 與 Bun 測試相容的 API 重構範例，補充 `test-file-best-practices.md` 中未涵蓋的模式，同時收錄主文件中已提及的重構概念以便完整參照。

---

## 0. API 可讀性原則

**編寫測試時，應盡量使用具有可讀性/識別性的 API，使錯誤訊息更容易理解。**

```typescript
// ❌ 不良範例：使用不易識別的 API，錯誤訊息模糊
expect(result.enableGlobalCache).toBe(false);
expect(items.length).toBe(0);

// ✅ 良好範例：使用具有可讀性的 API，錯誤訊息清晰
expect(result).toHaveProperty('enableGlobalCache', false);
expect(items).toHaveLength(0);
```

---

## 1. Snapshot 測試優先原則

### 1.1 基本 Snapshot 使用

```typescript
// ❌ 不良範例：手動驗證多個欄位
it('should parse configuration correctly', () => {
    const result = parseConfig(rawConfig);
    expect(result.name).toBe('config');
    expect(result.version).toBe('1.0.0');
    expect(result.enabled).toBe(true);
});

// ✅ 良好範例：使用 toMatchSnapshot 驗證複雜輸出
it('should parse configuration correctly', () => {
    const result = parseConfig(rawConfig);
    expect(result).toMatchSnapshot();
});

// ✅ 使用 toThrowErrorMatchingSnapshot 驗證錯誤
it('should throw error for invalid input', () => {
    expect(() => validateInput(invalidInput)).toThrowErrorMatchingSnapshot();
});
```

### 1.2 Property Matchers - 驗證特定欄位

```typescript
// ❌ 不良範例：手動驗證每個欄位
const result = npa('my-lodash@npm:lodash@4.17.21');
expect(result.name).toBe('my-lodash');
expect(result.subSpec.name).toBe('lodash');
expect(result.subSpec.rawSpec).toBe('4.17.21');

// ✅ 良好範例：驗證特定欄位，其餘交給 snapshot
expect(result).toMatchSnapshot({
  "name": "my-lodash",
  "subSpec": {
    "name": "lodash",
    "rawSpec": "4.17.21",
  }
});
```

### 1.3 動態資料處理

對於動態資料（如時間戳、隨機 ID），可使用 Asymmetric matchers：

```typescript
// ✅ 使用 expect.any() 處理動態資料
expect(result).toMatchSnapshot({
    id: expect.any(String),
    timestamp: expect.any(Number),
});

// ✅ 使用 expect.arrayContaining() 處理動態陣列
expect(result.items).toMatchSnapshot({
    items: expect.arrayContaining([expect.anything()]),
});
```

---

## 2. 單一屬性驗證

**單一屬性的測試，且沒有使用快照或物件比對的狀況下，應使用 `toHaveProperty()`。**

```typescript
// ❌ 不良範例：直接存取屬性，錯誤時不易識別是哪個屬性問題
expect(result.enableGlobalCache).toBe(false);
expect(result.timeout).toBe(3000);

// ✅ 良好範例：使用 toHaveProperty，錯誤訊息更清晰
expect(result).toHaveProperty('enableGlobalCache', false);
expect(result).toHaveProperty('timeout', 3000);
```

---

## 3. 陣列長度驗證

**測試陣列長度時，應使用 `toHaveLength()` 而非 `expect(array.length).toBe()`。**

```typescript
// ❌ 不良範例：使用 .length.toBe()
expect(ALL_ARISE_TOOLS.length).toBe(enumValues.length);
expect(items.length > 0).toBe(true);

// ✅ 良好範例：使用 toHaveLength
expect(ALL_ARISE_TOOLS).toHaveLength(enumValues.length);
expect(items).toHaveLength(3);
expect(tags.length).toBeGreaterThan(0);
```

`toHaveLength()` 提供更清晰的錯誤訊息，當測試失敗時可以更容易識別問題。

---

## 4. 物件屬性重構（進階）

### 4.1 toMatchObject 與 toEqual 比較

```typescript
// ❌ 不良範例：使用 toEqual 驗證部分屬性
it('should validate version numbers', () => {
    expect(actual).toEqual({
        versionOld: '1.2.3',
        versionNew: '2.0.0',
    });
});

// ✅ 良好範例：使用 toMatchObject 允許其他屬性
expect(actual).toMatchObject({
    versionOld: '1.2.3',
    versionNew: '2.0.0',
});
```

### 4.2 expect.objectContaining 巢狀使用

```typescript
// ✅ 使用 objectContaining 進行非嚴格匹配，可以巢狀嵌套在 toEqual 或 toHaveBeenCalledWith 中
test('使用 objectContaining 進行非嚴格匹配', () => {
    expect(actual).toEqual(
        expect.objectContaining({
            versionOld: '1.2.3',
            versionNew: '2.0.0',
        })
    );
});

// ✅ 在 toHaveBeenCalledWith 中使用
test('驗證函式被正確調用', () => {
    expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'UPDATE' })
    );
});
```

### 4.3 toHaveProperty 鏈式使用

```typescript
// ❌ 不良範例：多次斷言難以維護
expect(result.id).toBe(123);
expect(result.name).toBe('Test');
expect(result.status).toBe('active');
expect(result.timestamp).toBeDefined();

// ✅ 良好範例：使用 toMatchObject 搭配特定值
expect(result).toMatchObject({
    id: 123,
    name: 'Test',
    status: 'active',
});
expect(result.timestamp).toBeDefined();
```

---

## 5. 數值比較重構

### 5.1 大於 / 小於比較

```typescript
// ❌ 不良範例：使用 toBe true/false
expect(score >= 60).toBe(true);
expect(discount < 50).toBe(true);

// ✅ 良好範例：使用專用比較 matcher
expect(score).toBeGreaterThanOrEqual(60);
expect(discount).toBeLessThan(50);
```

### 5.2 浮點數精度比較

```typescript
// ❌ 不良範例：直接使用 toBe 比較浮點數
expect(price * quantity).toBe(99.99);

// ✅ 良好範例：使用 toBeCloseTo 避免浮點誤差
expect(price * quantity).toBeCloseTo(99.99);
expect(price * quantity).toBeCloseTo(99.99, 2); // 精確到小數點後 2 位
```

---

## 6. 布林值與真假值重構

### 6.1 否定断言重構

```typescript
// ❌ 不良範例：雙重否定語義不清
expect(isValid !== false).toBe(true);
expect(hasError !== true).toBe(true);

// ✅ 良好範例：使用 not.toBe
expect(isValid).not.toBe(false);
expect(hasError).not.toBe(true);

// ✅ 更簡潔：直接使用 toBeTruthy / toBeFalsy
expect(isValid).toBeTruthy();
expect(hasError).toBeFalsy();
```

### 6.2 Null / Undefined 檢查

```typescript
// ❌ 不良範例
expect(value === null).toBe(true);
expect(value === undefined).toBe(true);
expect(value == null).toBe(true);

// ✅ 良好範例
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeNull(); // 包含 null 和 undefined
```

### 6.3 明確的真假值檢查

```typescript
// ❌ 不良範例：語意不明
expect(isActive).toBe(true);
expect(isEmpty).toBe(false);

// ✅ 良好範例：語意清晰
expect(isActive).toBeTruthy();
expect(isActive).toBe(true);      // 當需要嚴格比對 true 時
expect(isEmpty).toBeFalsy();
expect(isEmpty).not.toBe(true);   // 當需要嚴格比對非 true 時
```

---

## 7. 字串匹配重構

### 7.1 子字串包含檢查

```typescript
// ❌ 不良範例
expect(message.includes('error')).toBe(true);
expect(url.indexOf('https') === 0).toBe(true);

// ✅ 良好範例：使用 toMatch (正則)
expect(message).toMatch(/error/);       // 正則匹配
expect(url).toMatch(/^https/);          // 開頭匹配
```

### 7.2 正則表達式匹配

```typescript
// ❌ 不良範例
expect(/^\d{3}-\d{4}$/.test(phone)).toBe(true);

// ✅ 良好範例
expect(phone).toMatch(/^\d{3}-\d{4}$/);
expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
```

---

## 8. 陣列操作重構

### 8.1 陣列包含元素

```typescript
// ❌ 不良範例
expect(roles.includes('admin')).toBe(true);
expect(items.indexOf('featured') !== -1).toBe(true);

// ✅ 良好範例：使用 toContain (Jest)
expect(roles).toContain('admin');

// Bun: 使用 toEqual 搭配 expect.arrayContaining
expect(roles).toEqual(expect.arrayContaining(['admin']));
```

### 8.2 陣列包含匹配元素

```typescript
// ❌ 不良範例
expect(users.some(u => u.id === 1)).toBe(true);

// ✅ 良好範例：使用 toContainEqual (Jest)
expect(users).toContainEqual(expect.objectContaining({ id: 1 }));

// Bun: 使用 toEqual 搭配 expect.arrayContaining
expect(users).toEqual(expect.arrayContaining([
  expect.objectContaining({ id: 1 })
]));
```

---

## 9. 類型與實例重構

### 9.1 類別實例檢查

```typescript
// ❌ 不良範例
expect(error instanceof TypeError).toBe(true);
expect(obj.constructor.name).toBe('CustomError');

// ✅ 良好範例：使用 toBeInstanceOf
expect(error).toBeInstanceOf(TypeError);
expect(error).toBeInstanceOf(Error);
```

---

## 10. Promise / Async 重構

### 10.1 Promise 解決值檢查

```typescript
// ❌ 不良範例：手動等待
async function test() {
    const result = await fetchData();
    expect(result.status).toBe(200);
}

// ✅ 良好範例：使用 resolves matcher
await expect(fetchData()).resolves.toMatchObject({
    status: 200,
});
await expect(fetchData()).resolves.toHaveProperty('data');
```

### 10.2 Promise 拒絕錯誤檢查

```typescript
// ❌ 不良範例
try {
    await riskyOperation();
} catch (e) {
    expect(e.message).toContain('failed');
}

// ✅ 良好範例：使用 rejects matcher
await expect(riskyOperation()).rejects.toThrow('failed');
await expect(riskyOperation()).rejects.toMatchObject({
    message: expect.stringContaining('failed'),
});
```

> **Jest v30+ 注意**：已移除 `toThrowError`，請統一使用 `toThrow()`。

---

## 11. Mock / Spy 重構

### 11.1 函式調用次數

```typescript
// ❌ 不良範例
expect(mockFn.mock.calls.length).toBe(2);
expect(spy.calls.length).toBeGreaterThan(0);

// ✅ 良好範例
expect(mockFn).toHaveBeenCalledTimes(2);
expect(spy).toHaveBeenCalled();
```

### 11.2 函式調用參數

```typescript
// ❌ 不良範例
expect(mockFn.mock.calls[0][0]).toBe('arg1');
expect(mockFn.mock.calls[0][1]).toBe(42);

// ✅ 良好範例
expect(mockFn).toHaveBeenCalledWith('arg1', 42);
expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
```

---

## 12. 其他常見重構

### 12.1 定義性檢查

```typescript
// ❌ 不良範例
expect(value !== undefined && value !== null).toBe(true);
expect(typeof value !== 'undefined').toBe(true);

// ✅ 良好範例
expect(value).toBeDefined();
```

### 12.2 完全相等

```typescript
// ❌ 不良範例
expect(actual === expected).toBe(true);

// ✅ 良好範例
expect(actual).toBe(expected);        // 嚴格相等 (===)
expect(actual).toEqual(expected);     // 深度相等
```

---

## 13. 重要例外：物件引用 Identity 測試

當測試 **物件引用 identity**（兩個變數是否指向記憶體中同一個物件）時，**必須使用 `toBe()`**。這在測試物件克隆行為時特別重要。

### 13.1 基礎範例

```typescript
/**
 * 測試物件是否為同一個引用（淺拷貝 vs 深拷貝）
 * Test whether object is same reference (shallow copy vs deep copy)
 */

// ❌ 不良範例：無法區分引用 identity
expect(mergedWithClone['a']).toEqual(firstObject.a);  // 值相等，但無法測試引用

// ✅ 良好範例：測試物件引用 identity
/** 未使用 clone：應該是同一個引用 */
expect(mergedWithoutClone['a']).toBe(firstObject.a);
expect(mergedWithoutClone['b']).toBe(secondObject.b);

/** 使用 clone：應該是不同的引用 */
expect(mergedWithClone['a']).not.toBe(firstObject.a);
expect(mergedWithClone['b']).not.toBe(secondObject.b);
```

### 13.2 完整克隆測試模式

以下提供一個完整的克隆驗證模式，同時驗證 **物件值相等** 與 **物件引用 identity**：

```typescript
/**
 * 測試選項介面 - 用於驗證物件是否被克隆
 * Test options interface - for verifying whether objects are cloned
 *
 * @interface IOptionsIsClone
 * @template T - 目標物件類型 / Target object type
 */
interface IOptionsIsClone<T>
{
	/** 是否不應該被克隆 / Whether should NOT be cloned */
	isNotClone?: boolean;
	/** 預期的部分物件 / Expected partial object */
	expected?: Partial<T>;
}

/**
 * 測試選項輸入類型 - 支援布林值或選項物件
 * Test options input type - supports boolean or options object
 *
 * @type IOptionsIsCloneInput
 * @template T - 目標物件類型 / Target object type
 */
type IOptionsIsCloneInput<T> = boolean | IOptionsIsClone<T>;

/**
 * 處理克隆選項參數
 * Handle clone options parameter
 *
 * 將布林值或選項物件標準化為統一的選項格式
 * Normalize boolean or options object to unified options format
 *
 * @template T - 目標物件類型 / Target object type
 * @param isNotClone - 布林值或選項物件 / Boolean or options object
 * @returns 標準化的選項物件 / Normalized options object
 */
export function _handleIsCloneEntryOptions<T>(isNotClone?: IOptionsIsCloneInput<T>)
{
	/**
	 * 如果是布林值，直接包裝為物件
	 * If boolean, wrap directly as object
	 */
	if (typeof isNotClone === 'boolean')
	{
		return {
			isNotClone,
		}
	}

	/**
	 * 否則使用空物件或傳入的選項
	 * Otherwise use empty object or passed options
	 */
	return isNotClone ?? {};
}

/**
 * 測試單一條目是否被克隆
 * Test if single entry is cloned
 *
 * 驗證兩個物件是否相等，以及是否為同一個引用
 * Verify two objects are equal, and whether they are the same reference
 *
 * @template A - 第一個物件類型 / First object type
 * @template B - 第二個物件類型（預設與 A 相同）/ Second object type (default same as A)
 * @param a - 第一個物件 / First object
 * @param b - 第二個物件 / Second object
 * @param isNotClone - 是否不應該被克隆的選項 / Options for whether should NOT be cloned
 */
export function _isCloneEntry<A, B = A>(a: A, b: B, isNotClone?: IOptionsIsCloneInput<A>)
{
	isNotClone = _handleIsCloneEntryOptions(isNotClone);

	/**
	 * 首先驗證物件內容是否相等
	 * First verify object content is equal
	 */
	expect(a).toStrictEqual(b);

	/**
	 * 如果有預期物件，額外驗證
	 * If expected object exists, additionally verify
	 */
	if (isNotClone.expected)
	{
		expect(a).toStrictEqual(isNotClone.expected);
	}

	/**
	 * 測試物件是否為同一個引用（克隆測試）
	 * Test if objects are the same reference (clone test)
	 */
	if (isNotClone.isNotClone)
	{
		/** 用於測試物件與來源物件是同一個物件 / for test object is same object with a source object */
		expect(a).toBe(b);
	}
	else
	{
		/** 用於測試克隆物件與來源物件是不同的物件 / for test cloned object is different object with a source object */
		expect(a).not.toBe(b);
	}
}

/**
 * 測試合併後的物件是否被正確克隆
 * Test if merged objects are correctly cloned
 *
 * 驗證合併後的物件包含預期的屬性，並對每個屬性進行克隆測試
 * Verify merged object contains expected properties, and perform clone test for each property
 *
 * @template A - 合併後物件類型 / Merged object type
 * @template B - 預期屬性映射類型 / Expected property map type
 * @param merged - 合併後的物件 / Merged object
 * @param map - 預期屬性映射 / Expected property map
 * @param isNotClone - 是否不應該被克隆的選項 / Options for whether should NOT be cloned
 */
export function _isCloneMerged<A, B = Partial<A>>(merged: A, map: B, isNotClone?: IOptionsIsCloneInput<A>)
{
	isNotClone = _handleIsCloneEntryOptions(isNotClone);

	/**
	 * 驗證合併後的物件包含預期的屬性
	 * Verify merged object contains expected properties
	 */
	expect(merged).toMatchObject(map);

	/**
	 * 如果有額外的預期物件，進行額外驗證
	 * If additional expected object exists, perform additional verification
	 */
	if (isNotClone.expected)
	{
		expect(merged).toMatchObject(isNotClone.expected);
	}

	/**
	 * 對映射中的每個鍵進行克隆測試
	 * Perform clone test for each key in the map
	 */
	for (const key of Object.keys(map))
	{
		_isCloneEntry(merged[key], map[key], {
			isNotClone: isNotClone.isNotClone,
		});
	}
}
```

### 13.3 使用範例

```typescript
// 測試未克隆的物件（共享引用）
_isCloneEntry(mergedWithoutClone, sourceObject, true);

// 測試已克隆的物件（不同引用）
_isCloneEntry(mergedWithClone, sourceObject, false);

// 或使用物件選項
_isCloneEntry(mergedWithClone, sourceObject, {
	isNotClone: false,
	expected: { name: 'Test' }
});

// 測試合併物件的克隆行為
_isCloneMerged(mergedObject, {
	a: sourceObject.a,
	b: sourceObject.b,
	c: sourceObject.c,
}, false);
```

### toBe vs toEqual vs toMatchObject 比較

```typescript
const original = { id: 1, data: { value: 100 } };
const copy = { id: 1, data: { value: 100 } };
const reference = original;

// toBe: 嚴格相等 (===) - 測試引用 identity
expect(reference).toBe(original);         // ✅ 通過 (同一個物件)
expect(copy).toBe(original);              // ❌ 失敗 (不同物件)

// toEqual: 深度相等 - 測試值相等
expect(copy).toEqual(original);           // ✅ 通過 (值相同)

// toStrictEqual: 嚴格深度相等 - 測試值相等（更嚴格）
expect(copy).toStrictEqual(original);      // ✅ 通過 (值相同)

// toMatchObject: 部分相等 - 測試包含指定屬性
expect(copy).toMatchObject({ id: 1 });    // ✅ 通過 (包含該屬性)
```

### 決策規則

| 測試目標 | 應使用的 Matcher |
|---------|-----------------|
| **物件引用 identity**（是否同一個記憶體位置） | `toBe()` / `not.toBe()` |
| **物件值相等**（結構相同） | `toEqual()` / `toStrictEqual()` |
| **物件包含特定屬性**（部分比對） | `toMatchObject()` / `toHaveProperty()` |

---

## Jest / Bun 相容性速查表

| Matcher | Jest | Bun | 備註 |
|---------|:----:|:---:|------|
| `toBeGreaterThan` | ✅ | ✅ | |
| `toBeGreaterThanOrEqual` | ✅ | ✅ | |
| `toBeLessThan` | ✅ | ✅ | |
| `toBeLessThanOrEqual` | ✅ | ✅ | |
| `toBeCloseTo` | ✅ | ✅ | 浮點數精度 |
| `toContain` | ✅ | ⚠️ | Bun 建議用 `toEqual(expect.arrayContaining())` |
| `toContainEqual` | ✅ | ⚠️ | Bun 需配合 `expect.arrayContaining()` |
| `toMatch` | ✅ | ✅ | |
| `toMatchObject` | ✅ | ✅ | |
| `toHaveProperty` | ✅ | ✅ | |
| `toHaveLength` | ✅ | ✅ | |
| `toBeNull` | ✅ | ✅ | |
| `toBeUndefined` | ✅ | ✅ | |
| `toBeDefined` | ✅ | ✅ | |
| `toBeTruthy` | ✅ | ✅ | |
| `toBeFalsy` | ✅ | ✅ | |
| `toBeInstanceOf` | ✅ | ✅ | |
| `toHaveBeenCalled` | ✅ | ✅ | |
| `toHaveBeenCalledTimes` | ✅ | ✅ | |
| `toHaveBeenCalledWith` | ✅ | ✅ | |
| `.resolves` | ✅ | ✅ | |
| `.rejects` | ✅ | ✅ | |

---

## 決策流程圖

```
開始編寫斷言
    │
    ▼
斷言目標類型?
    │
    ├─ 數值比較 ──────────────────────────────┐
    │   需要精確比較?                          │
    │   ├─ 是 → toBeCloseTo                   │
    │   └─ 否 → 比較類型?                      │
    │       ├─ 大於 → toBeGreaterThan         │
    │       ├─ 大於等於 → toBeGreaterThanOrEqual │
    │       ├─ 小於 → toBeLessThan            │
    │       └─ 小於等於 → toBeLessThanOrEqual │
    │                                          │
    ├─ 布林值 ────────────────────────────────┤
    │   需要嚴格比對?                          │
    │   ├─ 是 → toBe true/false               │
    │   └─ 否 → 語意?                          │
    │       ├─ 有效/有值 → toBeTruthy          │
    │       └─ 無效/空值 → toBeFalsy           │
    │                                          │
    ├─ Null/Undefined ────────────────────────┤
    │   具體類型?                              │
    │   ├─ Null → toBeNull                    │
    │   ├─ Undefined → toBeUndefined          │
    │   └─ 兩者皆可 → toBeNull                 │
    │                                          │
    ├─ 字串 ──────────────────────────────────┤
    │   匹配方式?                              │
    │   ├─ 精確 → toBe                        │
    │   ├─ 正則 → toMatch                     │
    │   └─ 包含 → toMatch / toContain         │
    │                                          │
    ├─ 陣列 ──────────────────────────────────┤
    │   檢查類型?                              │
    │   ├─ 包含元素 → toContain               │
    │   ├─ 包含匹配 → toContainEqual          │
    │   └─ 長度 → toHaveLength                │
    │                                          │
    ├─ 物件 ──────────────────────────────────┤
    │   屬性數量?                              │
    │   ├─ 單一 → toHaveProperty              │
    │   └─ 多個 → toMatchObject               │
    │                                          │
    ├─ 物件引用 Identity ─────────────────────┤
    │   需要測試引用?                          │
    │   ├─ 是 → toBe / not.toBe               │
    │   └─ 否 → 值相等?                        │
    │       ├─ 是 → toEqual                   │
    │       └─ 否 → toMatchObject             │
    │                                          │
    ├─ Promise ───────────────────────────────┤
    │   結果類型?                              │
    │   ├─ 解決 → resolves                    │
    │   └─ 拒絕 → rejects                     │
    │                                          │
    └─ Mock/Spy ──────────────────────────────┘
        檢查目標?
        ├─ 調用次數 → toHaveBeenCalledTimes
        ├─ 調用參數 → toHaveBeenCalledWith
        └─ 是否調用 → toHaveBeenCalled
```

---

## 相關資源

- [Jest Expect API](https://jestjs.io/docs/expect)
- [Bun Test API](https://bun.sh/docs/runtime/test)
- [Asymmetric matchers - Expect · Jest](https://jestjs.io/docs/expect#asymmetric-matchers)
- [test-file-best-practices.md](test-file-best-practices.md)
