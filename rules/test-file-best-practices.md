# 測試檔案最佳實踐規範
# Test File Best Practices

## 概述

本規則定義了撰寫或重構測試檔案時的最佳實踐，確保測試程式碼的可維護性和可讀性。

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

### 2. 測試檔案命名規範

**根據測試框架使用不同的檔案副檔名，以便未來同時使用多個測試工具時能夠區分。**

#### 命名規則

| 測試框架 | 推薦檔名格式 | 範例 |
|---------|------------|------|
| **Jest** | `*.spec.ts` | `user-service.spec.ts` |
| **Mocha** | `*.test.ts` | `user-service.test.ts` |
| **Node.js 內建測試** | `*.test.ts` | `user-service.test.ts` |
| **Vitest** | `*.spec.ts` | `user-service.spec.ts` |

#### 命名範例

```
test/
├── module/
│   ├── feature-a.spec.ts      # Jest 或 Vitest 測試檔案
│   ├── feature-b.spec.ts      # Jest 或 Vitest 測試檔案
│   └── integration.test.ts    # Mocha 或 Node.js 測試檔案
```

#### 設計理念

採用不同的檔案命名慣例有以下優點：

1. **框架識別** - 一眼即可辨識該測試檔案所使用的測試框架
2. **並行使用** - 當專案需要同時使用多個測試工具（如 Jest 單元測試 + Mocha 整合測試）時，可透過檔名模式輕鬆區分
3. **設定隔離** - 便於在測試設定檔中針對不同框架設定不同的匹配模式：
   - Jest: `testMatch: ["**/*.spec.ts"]`
   - Mocha: `"test/**/*.test.ts"`

#### 注意事項

- 在同一專案中應保持命名慣例的一致性
- 若專案僅使用單一測試框架，仍建議遵循此規範以便未來擴展
- TypeScript 專案亦可使用 `.spec.tsx` 或 `.test.tsx` 測試 React 組件

### 3. Snapshot 測試優先原則

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

對於動態資料（如時間戳、隨機 ID），可使用 Asymmetric matchers 例如:
- `expect.any(constructor)`
- `expect.arrayContaining(array)`

參閱:
- [Asymmetric matchers - Expect · Jest](https://jestjs.io/docs/expect#asymmetric-matchers)

#### 單一屬性驗證

**單一屬性的測試，且沒有使用快照或物件比對的狀況下，應使用 `toHaveProperty()`。**

```typescript
// ❌ 不良範例：直接存取屬性，錯誤時不易識別是哪個屬性問題
expect(result.enableGlobalCache).toBe(false);

// ✅ 良好範例：使用 toHaveProperty，錯誤訊息更清晰
expect(result).toHaveProperty('enableGlobalCache', false);
```

#### 其他比對已知屬性的範例

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

#### 注意事項

- Snapshot 應定期審查，避免過時或錯誤的 snapshot 被接受
- 對於動態資料（如時間戳、隨機 ID），應先處理再比對
- 避免過度使用 snapshot，簡單的值比對仍使用傳統 matcher
- 重要欄位應使用 property matchers 明確驗證，而非完全依賴 snapshot
- 發生錯誤時應能輕鬆比對錯誤的值與鍵值，了解是哪一個鍵值不正確。

### 4. 測試組織結構

#### 通用測試檔案 Header

**應在檔案開頭加入 TypeScript 三斜線參考指令，以確保正確引入類型定義。**

```typescript
//@noUnusedParameters:false
/// <reference types="node" />
```

#### Jest 測試檔案 Header

**若為 Jest 測試檔案，應在檔案開頭加入 TypeScript 三斜線參考指令，以確保正確引入 Jest 與 Node.js 的類型定義。**

```typescript
//@noUnusedParameters:false
/// <reference types="node" />
/// <reference types="jest" />
```

#### Jest v30+ 注意事項

> 自 Jest v30 起，`toThrowError` 已被移除，請改用 `toThrow`。

- 錯誤拋出測試請使用 `toThrow()` 而非 `toThrowError()`
- Snapshot 錯誤比對請使用 `toThrowErrorMatchingSnapshot()`（仍支援）

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

### 5. 共用邏輯提取原則

**當多個測試有共通邏輯時，應建立共用的工具函數，方便日後更新擴充時能夠輕鬆維護。**

#### 適用場景

- 多個測試案例使用相同的初始化邏輯
- 測試資料的建構邏輯重複出現
- 驗證邏輯在多個測試中一致

#### 不良範例

```typescript
// ❌ 邏輯重複，維護困難
describe('UserService', () => {
  it('should create user', () => {
    const user = {
      id: generateId(),
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      status: 'active'
    };
    // ...測試邏輯
  });

  it('should update user', () => {
    const user = {
      id: generateId(),
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date(),
      status: 'active'
    };
    // ...測試邏輯
  });
});
```

#### 良好範例

```typescript
// ✅ 提取共用邏輯至工具函數
// test/lib/helpers/user-factory.ts
export function _createTestUser(overrides?: Partial<IUser>) {
  return {
    id: generateId(),
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    status: 'active',
    ...overrides
  };
}

// test/user-service.spec.ts
import { _createTestUser } from './lib/helpers/user-factory';

describe('UserService', () => {
  it('should create user', () => {
    const user = _createTestUser();
    // ...測試邏輯
  });

  it('should update user', () => {
    const user = _createTestUser({ name: 'Updated Name' });
    // ...測試邏輯
  });
});
```

#### 注意事項

- 工具函數應放在 `test/lib/helpers/` 或 `test/lib/utils/` 目錄下
- 函數名稱應清楚表達其用途（如 `_createTestUser`、`_mockApiResponse`）
- 使用參數允許測試案例覆寫特定欄位
- 當邏輯變更時，只需修改一處即可影響所有相關測試

### 6. Fixtures 與測試資料管理

**建議將測試用的靜態資料（fixtures）統一放置於 `test/fixtures` 資料夾下，以便集中管理與重用。**

#### 適用場景

- 多個測試檔案共用的測試資料
- 大型資料結構（如 JSON、CSV）
- 靜態配置檔案
- 模擬檔案或圖片等資源

#### 目錄結構建議

```
test/
├── fixtures/                    # 測試靜態資料集中管理
│   ├── users/                   # 按功能模組分類
│   │   ├── valid-user.json      # 有效的使用者資料
│   │   └── invalid-users.json   # 多種無效使用者資料
│   ├── configs/                 # 配置文件
│   │   └── app-config.json
│   └── api-responses/           # API 回應模擬
│       └── mock-api-response.json
├── module/
│   ├── feature-a.spec.ts
│   └── feature-b.spec.ts
└── scripts/                     # 測試輔助腳本（可選）
```

#### 使用範例

```typescript
// ✅ 從 fixtures 目錄載入測試資料
import validUser from '../fixtures/users/valid-user.json';
import mockApiResponse from '../fixtures/api-responses/mock-api-response.json';

describe('UserService', () => {
  it('should create user with valid data', () => {
    const result = createUser(validUser);
    expect(result).toBeDefined();
  });

  it('should handle API response correctly', () => {
    const result = processResponse(mockApiResponse);
    expect(result).toMatchSnapshot();
  });
});
```

#### 注意事項

- Fixtures 應按功能模組分類，避免全部放在同一層目錄
- 大型 fixture 檔案建議使用 `.json`、`.csv` 等標準格式
- 若 fixture 需要動態生成或更新，可考慮使用測試腳本（見下方說明）
- 避免在 fixtures 中放置敏感資訊，如需使用敏感資料應建立 mock 資料

### 7. 測試輔助腳本

**若有需要額外建立腳本用於抓取更新資料、整理歸納等，可放置於 `test/scripts` 資料夾。**

#### 適用場景

- 從遠端 API 抓取測試資料並儲存為 fixtures
- 自動化更新測試用的模擬資料
- 整理與歸納測試資料格式
- 生成測試用的隨機資料
- 清理或重置測試資料庫

#### 目錄結構建議

```
test/
├── fixtures/                    # 靜態測試資料
├── scripts/                     # 測試輔助腳本
│   ├── fetch-test-data.ts       # 從遠端抓取測試資料
│   ├── update-mock-data.ts      # 更新模擬資料
│   └── generate-fixtures.ts     # 生成測試 fixtures
└── module/
    └── feature-a.spec.ts
```

#### 執行方式

```bash
# 直接使用 tsx 執行測試腳本
tsx test/scripts/fetch-test-data.ts
tsx test/scripts/update-mock-data.ts

# 或使用 ts-node（若 tsx 無法正常運作）
ts-node test/scripts/generate-fixtures.ts
```

#### 注意事項

- 測試腳本通常只需要執行一次，用於準備測試環境
- 建議在腳本開頭加入說明文件註解，說明腳本用途與執行方式
- 抓取的遠端資料應驗證格式後再儲存為 fixtures
- 腳本產生的資料應加入 `.gitignore`（如大型資料庫或臨時檔案）

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

- [Jest Snapshot Testing](https://jestjs.io/docs/snapshot-testing)
- [Asymmetric matchers - Expect · Jest](https://jestjs.io/docs/expect#asymmetric-matchers)

