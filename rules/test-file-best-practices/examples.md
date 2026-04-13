# 測試框架 API 重構範例
# Test Framework API Refactoring Examples

本文件提供 Jest 與 Bun 測試相容的 API 重構範例，補充 `test-file-best-practices.md` 中未涵蓋的模式，同時收錄主文件中已提及的重構概念以便完整參照。

---

## API 可讀性原則

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

## Snapshot 測試優先原則

### 基本 Snapshot 使用

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

### Property Matchers - 驗證特定欄位

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

### 動態資料處理

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

## 單一屬性驗證

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

## 陣列長度驗證

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

## 物件屬性重構（進階）

### toMatchObject 與 toEqual 比較

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

### expect.objectContaining 巢狀使用

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

### toHaveProperty 鏈式使用

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

## 數值比較重構

### 大於 / 小於比較

```typescript
// ❌ 不良範例：使用 toBe true/false
expect(score >= 60).toBe(true);
expect(discount < 50).toBe(true);

// ✅ 良好範例：使用專用比較 matcher
expect(score).toBeGreaterThanOrEqual(60);
expect(discount).toBeLessThan(50);
```

### 浮點數精度比較

```typescript
// ❌ 不良範例：直接使用 toBe 比較浮點數
expect(price * quantity).toBe(99.99);

// ✅ 良好範例：使用 toBeCloseTo 避免浮點誤差
expect(price * quantity).toBeCloseTo(99.99);
expect(price * quantity).toBeCloseTo(99.99, 2); // 精確到小數點後 2 位
```

---

## 布林值與真假值重構

### 否定断言重構

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

### Null / Undefined 檢查

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

### 明確的真假值檢查

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

## 字串匹配重構

### 子字串包含檢查

```typescript
// ❌ 不良範例
expect(message.includes('error')).toBe(true);
expect(url.indexOf('https') === 0).toBe(true);

// ✅ 良好範例：使用 toMatch (正則)
expect(message).toMatch(/error/);       // 正則匹配
expect(url).toMatch(/^https/);          // 開頭匹配
```

### 正則表達式匹配

```typescript
// ❌ 不良範例
expect(/^\d{3}-\d{4}$/.test(phone)).toBe(true);

// ✅ 良好範例
expect(phone).toMatch(/^\d{3}-\d{4}$/);
expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
```

---

## 陣列操作重構

### 陣列包含元素

```typescript
// ❌ 不良範例
expect(roles.includes('admin')).toBe(true);
expect(items.indexOf('featured') !== -1).toBe(true);

// ✅ 良好範例：使用 toContain (Jest)
expect(roles).toContain('admin');

// Bun: 使用 toEqual 搭配 expect.arrayContaining
expect(roles).toEqual(expect.arrayContaining(['admin']));
```

### 陣列包含匹配元素

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

## 類型與實例重構

### 類別實例檢查

```typescript
// ❌ 不良範例
expect(error instanceof TypeError).toBe(true);
expect(obj.constructor.name).toBe('CustomError');

// ✅ 良好範例：使用 toBeInstanceOf
expect(error).toBeInstanceOf(TypeError);
expect(error).toBeInstanceOf(Error);
```

---

## Promise / Async 重構

### Promise 解決值檢查

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

### Promise 拒絕錯誤檢查

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

## Mock / Spy 重構

### 函式調用次數

```typescript
// ❌ 不良範例
expect(mockFn.mock.calls.length).toBe(2);
expect(spy.calls.length).toBeGreaterThan(0);

// ✅ 良好範例
expect(mockFn).toHaveBeenCalledTimes(2);
expect(spy).toHaveBeenCalled();
```

### 函式調用參數

```typescript
// ❌ 不良範例
expect(mockFn.mock.calls[0][0]).toBe('arg1');
expect(mockFn.mock.calls[0][1]).toBe(42);

// ✅ 良好範例
expect(mockFn).toHaveBeenCalledWith('arg1', 42);
expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
```

---

## 其他常見重構

### 定義性檢查

```typescript
// ❌ 不良範例
expect(value !== undefined && value !== null).toBe(true);
expect(typeof value !== 'undefined').toBe(true);

// ✅ 良好範例
expect(value).toBeDefined();
```

### 完全相等

```typescript
// ❌ 不良範例
expect(actual === expected).toBe(true);

// ✅ 良好範例
expect(actual).toBe(expected);        // 嚴格相等 (===)
expect(actual).toEqual(expected);     // 深度相等
```

---

## 重要例外：物件引用 Identity 測試

當測試 **物件引用 identity**（兩個變數是否指向記憶體中同一個物件）時，**必須使用 `toBe()`**。這在測試物件克隆行為時特別重要。

### 基礎範例

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

### 完整克隆測試模式

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

### 使用範例

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

## 系統依賴謹慎處理原則

### 檔案系統 (fs) 操作

**測試中涉及檔案系統操作時，應極度謹慎，優先使用測試框架提供的 Mock API。**

```typescript
// ❌ 不良範例：直接操作真實檔案系統，可能污染開發環境
it('should write config file', () => {
    fs.writeFileSync('/etc/myapp/config.json', JSON.stringify(config));
    const result = fs.readFileSync('/etc/myapp/config.json', 'utf-8');
    expect(result).toBe(JSON.stringify(config));
});

// ❌ 不良範例：在非臨時目錄中建立測試檔案
it('should process data file', () => {
    const testPath = './test-data.txt';
    fs.writeFileSync(testPath, 'test data');
    const result = processFile(testPath);
    fs.unlinkSync(testPath); // 若測試中斷，檔案殘留
    expect(result).toBe('TEST DATA');
});

// ✅ 良好範例：使用 memfs-extra Mock fs（推薦）
// 參考: skills/test-js-mock
import { getVolumeFromFs } from 'memfs-extra';

jest.mock('fs', () => require('memfs-extra/fs-extra'));

it('should write config file', () => {
    const fs = require('fs');
    
    // 驗證 mock 是否成功
    const vol = getVolumeFromFs(fs);
    expect(vol).toBeDefined();
    
    // 設定測試資料
    vol.fromJSON({
        '/config.json': JSON.stringify(config),
    });
    
    saveConfig(config);
    
    // 驗證檔案被寫入虛擬檔案系統
    expect(fs.existsSync('/config.json')).toBe(true);
});

// ⚠️ 重要：即使有 mock 檔案系統，仍須遵守路徑安全原則
// 詳細說明請參考: skills/test-js-mock#安全性考量

// ✅ 良好範例：使用臨時目錄（若必須使用真實檔案系統）
import { tmpdir } from 'os';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';

it('should process data file', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'test-'));
    const testPath = join(tempDir, 'data.txt');
    
    try {
        writeFileSync(testPath, 'test data');
        const result = processFile(testPath);
        expect(result).toBe('TEST DATA');
    } finally {
        // 確保清理臨時目錄
        rmSync(tempDir, { recursive: true, force: true });
    }
});
```

### 依賴模組的檔案系統操作

**當依賴的第三方模組內部使用檔案系統，且測試無法直接控制其行為時，必須使用 Mock。**

```typescript
// ❌ 不良範例：直接使用內部操作檔案系統的模組
import { saveConfig } from 'some-config-lib'; // 內部使用 fs.writeFileSync

it('should save config', () => {
    // 無法控制 saveConfig 內部的檔案寫入行為
    saveConfig('/etc/app/config.json', { key: 'value' });
    // 可能寫入真實系統目錄，且難以驗證
});

// ✅ 良好範例：Mock 整個模組以隔離檔案系統操作
jest.mock('some-config-lib', () => ({
    saveConfig: jest.fn(),
    loadConfig: jest.fn(),
}));

it('should save config', () => {
    const { saveConfig } = require('some-config-lib');
    const config = { key: 'value' };
    
    saveConfig('/app/config.json', config);
    
    // 驗證函式被正確呼叫，而非實際檔案操作
    expect(saveConfig).toHaveBeenCalledWith('/app/config.json', config);
});

// ✅ 良好範例：使用 spyOn 部分 Mock 模組方法
import * as configLib from 'some-config-lib';

it('should read config without file system', () => {
    const mockLoad = jest.spyOn(configLib, 'loadConfig').mockReturnValue({
        key: 'mocked-value',
    });
    
    const result = app.readConfiguration();
    
    expect(mockLoad).toHaveBeenCalled();
    expect(result.key).toBe('mocked-value');
    
    mockLoad.mockRestore();
});
```

**決策準則**：
- 若模組 API 允許傳入 `fs` 實例或路徑參數 → 可考慮注入 mock fs 或臨時路徑
- 若模組內部直接使用 `fs` 且無法注入 → **必須 Mock 整個模組或其方法**
- 若模組為專案內部模組 → 優先在模組設計階段考慮測試性（依賴注入）

### 日期與時間 (Date/Time) 操作

**測試中涉及日期時間時，應 Mock `Date` 物件以確保測試結果穩定可重現。**

```typescript
// ❌ 不良範例：依賴當前真實時間，測試結果不穩定
it('should return current timestamp', () => {
    const result = getCurrentTimestamp();
    expect(result).toBeGreaterThan(1700000000000); // 隨時間失效
});

// ❌ 不良範例：直接比較動態產生的時間字串
it('should format date', () => {
    const result = formatDate(new Date());
    expect(result).toBe('2024-01-15'); // 每天都在變
});

// ✅ 良好範例：使用 Jest fake timers
beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:00:00Z'));
});

afterAll(() => {
    jest.useRealTimers();
});

it('should return current timestamp', () => {
    const result = getCurrentTimestamp();
    expect(result).toBe(1705312800000); // 固定時間戳
});

it('should format date', () => {
    const result = formatDate(new Date());
    expect(result).toBe('2024-01-15');
});

// ✅ 良好範例：使用 Bun 的 mock 機制（若使用 Bun）
beforeEach(() => {
    // Bun 可使用 spyOn 配合 Date.now
    spyOn(Date, 'now').mockReturnValue(1705312800000);
});
```

#### 參考資源
- [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks)
- [Bun MockTimers](https://bun.com/reference/node/test/default/MockTimers)

### 環境變數與全域狀態

**修改環境變數或全域狀態時，必須在測試後恢復原狀。**

```typescript
// ❌ 不良範例：未恢復環境變數，影響後續測試
it('should read API URL from env', () => {
    process.env.API_URL = 'https://test.example.com';
    const result = getApiUrl();
    expect(result).toBe('https://test.example.com');
}); // process.env.API_URL 仍為修改後的值

// ✅ 良好範例：使用 jest.spyOn 或 beforeEach/afterEach 恢復
const originalEnv = process.env;

beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
});

afterAll(() => {
    process.env = originalEnv;
});

it('should read API URL from env', () => {
    process.env.API_URL = 'https://test.example.com';
    const result = getApiUrl();
    expect(result).toBe('https://test.example.com');
});
```

### 網路請求

**網路請求應一律 Mock，避免測試依賴外部服務。**

```typescript
// ❌ 不良範例：發送真實網路請求
it('should fetch user data', async () => {
    const result = await fetchUser(123);
    expect(result.name).toBe('John'); // 依賴外部 API
});

// ✅ 良好範例：使用 jest-fetch-mock 或 nock
import { enableFetchMocks } from 'jest-fetch-mock';

beforeAll(() => {
    enableFetchMocks();
});

it('should fetch user data', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ id: 123, name: 'John' }));
    
    const result = await fetchUser(123);
    
    expect(result).toEqual({ id: 123, name: 'John' });
    expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/users/123');
});
```

### 決策流程：系統依賴處理

```
需要使用系統資源?
    │
    ├─ 檔案系統 ────────────────────────────┐
    │   可以 Mock?                            │
    │   ├─ 是 → 使用 jest.mock('fs')        │
    │   └─ 否 → 使用臨時目錄 + finally 清理   │
    │                                          │
    ├─ 日期時間 ────────────────────────────┤
    │   使用 jest.useFakeTimers()             │
    │   或 spyOn(Date, 'now')                 │
    │                                          │
    ├─ 環境變數 ────────────────────────────┤
    │   在 beforeEach 複製 process.env        │
    │   在 afterAll 恢復原值                  │
    │                                          │
    └─ 網路請求 ────────────────────────────┘
        一律使用 fetchMock / nock / msw
```

**重要提醒**：
- ⚠️ **即使有 mock 檔案系統，仍須遵守路徑安全原則**：即使使用 memfs-extra 模擬了 fs 模組，仍應確保所有檔案操作都限制在測試臨時目錄內。詳細說明請參考 [skills/test-js-mock - 安全性考量](../skills/test-js-mock/SKILL.md#安全性考量)
- **非臨時目錄禁止寫入**：絕對不要讓測試寫入 `/etc/`、`/usr/`、`C:\Windows\` 等系統目錄，或專案根目錄下的固定路徑
  - ⚠️ 即使有 mock 檔案系統，仍須確保路徑不超過臨時目錄範圍，詳細說明請參考 [skills/test-js-mock - 禁止使用的路徑模式](../skills/test-js-mock/SKILL.md#路徑安全原則)
- **僅限專案內臨時目錄**：測試產生的臨時檔案**只能**寫入專案下的臨時目錄（如專案根目錄下的 `tmp/` 或 `.tmp/`），禁止寫入系統級臨時目錄（如 `/tmp`、`os.tmpdir()`）
- **優先使用框架 Mock**：當 Jest/Bun 提供的 `jest.mock()`、`spyOn()`、`useFakeTimers()` 能滿足需求時，**不要**自行實作複雜的 mock 機制
- **自訂 Mock 作為最後手段**：僅當框架提供的 API 無法滿足特殊需求時，才考慮自行設計 mock 實作，且應妥善封裝並充分測試

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
