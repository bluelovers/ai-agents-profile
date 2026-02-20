# 測試檔案最佳實踐規範
# Test File Best Practices

## 概述

本規則定義了撰寫測試檔案時的最佳實踐，確保測試程式碼的可維護性和可讀性。

## 核心原則

### 1. 測試檔案分割原則

**避免在單一測試檔案中放置過多測試案例。**

#### 分割準則

- 每個測試檔案應專注於單一功能模組或單一類別
- 當測試案例超過 100 行或包含多個 `describe` 區塊時，考慮分割
- 依功能面向分割，而非單純依測試數量

#### 分割策略

```
test/
├── module/
│   ├── feature-a.spec.ts      # 功能 A 相關測試
│   ├── feature-b.spec.ts      # 功能 B 相關測試
│   └── edge-cases.spec.ts     # 邊界案例測試
```

#### 不良範例

```typescript
// ❌ 單一檔案包含過多測試
describe('UserService', () => {
  describe('create', () => { /* 50+ 測試案例 */ });
  describe('update', () => { /* 50+ 測試案例 */ });
  describe('delete', () => { /* 50+ 測試案例 */ });
  describe('query', () => { /* 50+ 測試案例 */ });
});
```

#### 良好範例

```typescript
// ✅ 分割後的測試檔案
// test/user-service/create.spec.ts
describe('UserService.create', () => { /* 相關測試 */ });

// test/user-service/update.spec.ts
describe('UserService.update', () => { /* 相關測試 */ });
```

### 2. Snapshot 測試優先原則

**在結果可控的情況下，優先使用 snapshot 測試。**

#### 適用場景

- 輸出結構複雜但穩定的測試
- 錯誤訊息格式驗證
- 物件序列化結果驗證
- 大型資料結構比對

#### 優先使用的 Matcher

1. **`toMatchSnapshot()`** - 用於一般輸出比對
2. **`toThrowErrorMatchingSnapshot()`** - 用於錯誤訊息比對

#### 使用範例

```typescript
// ✅ 使用 toMatchSnapshot 驗證複雜輸出
it('should parse configuration correctly', () => {
  const result = parseConfig(rawConfig);
  expect(result).toMatchSnapshot();
});

// ✅ 使用 toThrowErrorMatchingSnapshot 驗證錯誤
it('should throw error for invalid input', () => {
  expect(() => validateInput(invalidInput)).toThrowErrorMatchingSnapshot();
});
```

#### Property Matchers - 驗證特定欄位

**如有驗證結果的必要，應適度加上指定值或類型。**

使用 `toMatchSnapshot()` 的 property matchers 參數，可以同時驗證特定欄位的值，並將其餘欄位交給 snapshot 處理。

```typescript
// ✅ 驗證特定欄位，其餘交給 snapshot
const result = npa('my-lodash@npm:lodash@4.17.21');

expect(result).toMatchSnapshot({
  "name": "my-lodash",
  "subSpec": {
    "name": "lodash",
    "rawSpec": "4.17.21",
  }
});
```

這樣 snapshot 會比對完整物件結構，同時確保 `name` 和 `subSpec.name`、`subSpec.rawSpec` 的值正確。

#### 注意事項

- Snapshot 應定期審查，避免過時或錯誤的 snapshot 被接受
- 對於動態資料（如時間戳、隨機 ID），應先處理再比對
- 避免過度使用 snapshot，簡單的值比對仍使用傳統 matcher
- 重要欄位應使用 property matchers 明確驗證，而非完全依賴 snapshot

### 3. 測試組織結構

#### 建議的測試檔案結構

```typescript
// 測試檔案頭部
import { functionToTest } from '../src/module';

// 常數與測試資料
const TEST_FIXTURES = {
  validInput: { /* ... */ },
  invalidInput: { /* ... */ },
};

// 測試套件
describe('functionToTest', () => {
  describe('正常案例', () => {
    it('should handle valid input', () => {
      // ...
    });
  });

  describe('邊界案例', () => {
    it('should handle edge case', () => {
      // ...
    });
  });

  describe('錯誤處理', () => {
    it('should throw error for invalid input', () => {
      expect(() => functionToTest(invalidInput)).toThrowErrorMatchingSnapshot();
    });
  });
});
```

## 決策流程

```
開始撰寫測試
    │
    ▼
測試案例是否超過 100 行？
    │
    ├─ 是 → 考慮依功能分割成多個檔案
    │
    └─ 否 → 繼續在同一檔案
              │
              ▼
         輸出是否複雜且穩定？
              │
              ├─ 是 → 使用 toMatchSnapshot()
              │
              └─ 否 → 使用傳統 matcher
                        │
                        ▼
                   是否測試錯誤拋出？
                        │
                        ├─ 是 → 使用 toThrowErrorMatchingSnapshot()
                        │
                        └─ 否 → 使用適當的 matcher
```

## 相關資源

- Jest Snapshot Testing: https://jestjs.io/docs/snapshot-testing
- 測試檔案組織最佳實踐
