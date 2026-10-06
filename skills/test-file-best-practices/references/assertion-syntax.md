---
description: >-
  斷言語法優化：編寫測試時應使用具可讀性／識別性的 API，使錯誤訊息更容易理解——
  單一屬性用 toHaveProperty、陣列長度用 toHaveLength、部分比對用 toMatchObject /
  objectContaining，避免直接存取屬性、.length.toBe() 與 === 等低辨識度寫法；
  收錄 API 可讀性原則、物件比對的進階用法與常見斷言重構對照。
tags:
  - documentation/references
  - testing
  - testing/assertions
  - testing/jest
---

# 斷言語法優化 / Assertion Syntax Optimization

**編寫測試時，應盡量使用具有可讀性/識別性的 API，使錯誤訊息更容易理解。**

本文件收錄 `SKILL.md`「Snapshot 測試優先原則」中與 Snapshot 無關的**斷言寫法優化**，
並已合併原 `examples.md` 中對應的重複章節（API 可讀性、單一屬性、陣列長度、物件比對），
作為斷言寫法的單一事實來源。

---

## API 可讀性原則 (Readable API Principle)

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

## 單一屬性驗證 (Single Property Assertion)

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

## 陣列長度驗證 (Array Length Assertion)

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

## 物件比對 (Object Matching)

### 其他比對已知屬性的範例

```typescript
// ❌ 不良範例 發生錯誤時不易閱讀
it('should throw error for invalid input', () => {
	expect(result.versionOld).toBe('1.2.3');
	expect(result.versionNew).toBe('2.0.0');
});
```

```typescript
// ✅ 良好範例 包含 snapshot 和 指定值
it('should throw error for invalid input', () => {
  // actual = ...
	expect(actual).toMatchSnapshot({
    versionOld: '1.2.3',
    versionNew: '2.0.0',
  });
});

// ✅ 在不需要 snapshot 時，只要 actual 包含這些 Key 且 Value 相等即通過。
test('檢查版本號並允許其他屬性', () => {
  expect(actual).toMatchObject({
    versionOld: '1.2.3',
    versionNew: '2.0.0',
  });
});

// ✅ 在不需要 snapshot 時，使用 objectContaining 進行非嚴格匹配，可以巢狀嵌套在 toEqual 或 toHaveBeenCalledWith 中。
test('使用 objectContaining 進行非嚴格匹配', () => {
  expect(actual).toEqual(
    expect.objectContaining({
      versionOld: '1.2.3',
      versionNew: '2.0.0',
    })
  );
});
```

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

## 相關資源 (Related Resources)

- [SKILL.md](../SKILL.md)
- [測試框架 API 重構範例](./examples.md)（數值、布林、字串、陣列、型別、Promise、Mock 等重構）
- [避免無意義的測試：判定與改寫](./meaningless-tests.md)
