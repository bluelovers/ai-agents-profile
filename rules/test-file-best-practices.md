---
name: test-file-best-practices
description: 測試檔案最佳實踐規範。Use when users request (1) Testing best practices, (2) Test file organization, (3) "測試檔案規範", (4) "測試最佳實踐", (5) "測試檔案組織", (6) "測試資料管理", (7) "臨時檔案管理", (8) "重構測試", (9) "優化測試", (10) "整合測試". Defines guidelines for writing and organizing test files, including test location patterns, naming conventions, snapshot testing, fixtures management, and temporary file handling.
---

# 測試檔案最佳實踐規範
# Test File Best Practices

## 概述

本規則定義了撰寫或重構測試檔案時的最佳實踐，確保測試程式碼的可維護性和可讀性。

## 核心原則

### 0. 測試檔案位置規範

**測試檔案的擺放位置應根據專案規模與測試特性選擇適當的模式。**

#### 模式說明

| 模式 | 說明 | 適用場景 |
|------|------|---------|
| **Centralized / Decoupled（集中/分離）** | 測試檔案統一放置於獨立的測試目錄（如 `test/`、`__tests__/`），與原始碼分離 | 大型專案、跨模組測試、多人協作 |
| **Co-located（同目錄）** | 測試檔案放置於原始碼相同目錄（如 `src/module.spec.ts`） | 小型專案、單一模組、簡易測試 |

#### 選擇原則

1. **優先採用 Centralized / Decoupled（集中/分離）**
   - 測試檔案與原始碼分離，結構更清晰
   - 便於設定不同的建置與發布流程
   - 適合大型專案與團隊協作

2. **若原始測試已採用 Co-located（同目錄），則沿用該模式**
   - 避免破壞既有的專案結構
   - 降低重構成本與風險
   - 保持一致性

3. **複雜或橫跨多模組的測試，應採用 Centralized / Decoupled**
   - 跨模組測試不應依賴特定模組的目錄位置
   - 集中管理有利於維護與共享測試資源
   - 避免測試邏輯散落各處

#### 範例

```
# Centralized / Decoupled（集中/分離）- 優先採用
project/
├── src/
│   └── modules/
│       ├── user/
│       │   └── user.service.ts
│       └── order/
│           └── order.service.ts
└── test/                          # 獨立測試目錄
    ├── fixtures/
    ├── helpers/
    ├── user/
    │   └── user.service.spec.ts
    └── order/
        └── order.service.spec.ts
```

```
# Co-located（同目錄）- 僅當原始測試已採用時沿用
project/
└── src/
    └── modules/
        ├── user/
        │   ├── user.service.ts
        │   └── user.service.spec.ts    # 測試檔案與原始碼同目錄
        └── order/
            ├── order.service.ts
            └── order.service.spec.ts
```

#### 強制要求

**無論選擇何種模式，皆須遵守以下章節的規則：**

- [測試檔案分割原則](#1-測試檔案分割原則) - 避免單一檔案過大
- [通用測試檔案 Header](#4-測試組織結構) - 正確引入類型定義
- [Fixtures 與測試資料管理](#6-fixtures-與測試資料管理) - 集中管理測試資料
- [共用邏輯提取原則](#5-共用邏輯提取原則) - 提取共用測試邏輯（包括函式參數設計）

---

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

#### API 可讀性原則

**編寫測試時，應盡量使用具有可讀性/識別性的 API，使錯誤訊息更容易理解。**

```typescript
// ❌ 不良範例：使用不易識別的 API，錯誤訊息模糊
expect(result.enableGlobalCache).toBe(false);
expect(items.length).toBe(0);

// ✅ 良好範例：使用具有可讀性的 API，錯誤訊息清晰
expect(result).toHaveProperty('enableGlobalCache', false);
expect(items).toHaveLength(0);
```

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

#### 陣列長度驗證

**測試陣列長度時，應使用 `toHaveLength()` 而非 `expect(array.length).toBe()`。**

```typescript
// ❌ 不良範例：使用 .length.toBe()
expect(ALL_ARISE_TOOLS.length).toBe(enumValues.length);

// ✅ 良好範例：使用 toHaveLength
expect(ALL_ARISE_TOOLS).toHaveLength(enumValues.length);
```

`toHaveLength()` 提供更清晰的錯誤訊息，當測試失敗時可以更容易識別問題。

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
- 更多 API 重構範例請參閱 [測試框架 API 重構範例](./test-file-best-practices/examples.md)

### 4. 測試組織結構

#### 通用測試檔案 Header

**應在檔案開頭加入 TypeScript 三斜線參考指令，以確保正確引入類型定義。**

```typescript
// @allowUnusedLabels:true
// @noImplicitAny:false
// @noPropertyAccessFromIndexSignature:false
// @noUnusedLocals:false
//@noUnusedParameters:false
/// <reference types="node" />
```

- https://github.com/microsoft/TypeScript-Website/tree/v2/packages/tsconfig-reference/copy/en/options

#### Jest 測試檔案 Header

**若為 Jest 測試檔案，應在檔案開頭加入 TypeScript 三斜線參考指令，以確保正確引入 Jest 與 Node.js 的類型定義。**

```typescript
//@noUnusedParameters:false
/// <reference types="node" />
/// <reference types="jest" />
```

##### Jest v30+ 注意事項

> 自 Jest v30 起，`toThrowError` 已被移除，請改用 `toThrow`。

- 錯誤拋出測試請使用 `toThrow()` 而非 `toThrowError()`
- Snapshot 錯誤比對請使用 `toThrowErrorMatchingSnapshot()`（仍支援）

#### Bun 測試檔案 Header

**若為 Bun 測試檔案，應在檔案開頭加入 TypeScript 三斜線參考指令，並從 `bun:test` 匯入所需的測試函數，以確保正確引入 Bun 的類型定義。**

```typescript
/// <reference types="bun" />
/// <reference types="bun-types" />
import { describe, expect, it, test, beforeEach, afterEach, mock } from "bun:test";
```

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

#### 測試標題與註解避免使用計數

**測試檔案的註解或測試標題不應出現非必要的計數/序列。**

測試隨時都有可能會增減或移動位置，這些計數會增加額外的非必要修改工作。

```typescript
// ❌ 不良範例：包含計數的測試標題
/**
 * 測試 12：deep 巢狀物件
 * Test 12: Deep nested object
 */
it('should correctly validate deeply nested structures', () => {
    // ...
});

// ✅ 良好範例：移除計數的測試標題
/**
 * 測試：deep 巢狀物件
 * Test: Deep nested object
 */
it('should correctly validate deeply nested structures', () => {
    // ...
});
```

**原則：**

- 測試標題應描述測試內容的用途或行為，而非依賴計數來識別
- 當測試需要分組時，使用 `describe` 區塊進行邏輯組織
- 如有需要區分多個相似測試，可使用描述性標題而非數字序列

```typescript
// ✅ 良好範例：使用描述性標題區分測試
describe('validation', () => {
    it('should handle valid input', () => { /* ... */ });
    it('should handle invalid input', () => { /* ... */ });
    it('should handle empty input', () => { /* ... */ });
});

// ✅ 良好範例：使用 describe 區塊分組
describe('UserService', () => {
    describe('create', () => {
        it('should create user with valid data', () => { /* ... */ });
        it('should reject duplicate email', () => { /* ... */ });
    });

    describe('update', () => {
        it('should update user info', () => { /* ... */ });
        it('should handle not found error', () => { /* ... */ });
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

---

#### 函式參數設計原則

**對於可能會後續擴充的參數，應使用物件參數（Object Parameters）而非多個獨立參數。**

##### 設計理念

當函式接收多個參數時，若這些參數未來可能有增減的需求，使用物件參數可以：

1. **擴充彈性** - 新增參數時無需修改函式簽章，避免破壞相容性
2. **命名清晰** - 物件屬性自帶語義，呼叫時可清楚看出每個參數的用途
3. **可選性** - 可輕鬆地將部分參數標記為可選（`?`）
4. **TypeScript 支援** - 物件參數可定義完整型別，增強類型安全

##### 不良範例

```typescript
// ❌ 使用多個獨立參數，未來擴充困難
function _createAndValidateSnapshot(
  capturedData: any,
  validData: any,
  result: any
): void {
  // ...實作
}

// 呼叫時語意不清，且未來新增參數需修改函式簽章
_createAndValidateSnapshot(data, expected, actual);
```

##### 良好範例

```typescript
// ✅ 使用物件參數，弹性擴充
/**
 * 建立並驗證 Snapshot
 * Create and validate snapshot
 *
 * @param data - 測試資料物件 / Test data object
 * @param data.capturedData - 擷取的資料 / Captured data
 * @param data.validData - 驗證用的資料 / Data for validation
 * @param data.result - 測試結果 / Test result
 */
export function _createAndValidateSnapshot(
  data: {
    capturedData: any;
    validData: any;
    result: any;
  }
): void {
  const { capturedData, validData, result } = data;
  // ...實作
}

// 呼叫時語意清晰
_createAndValidateSnapshot({
  capturedData: data,
  validData: expected,
  result: actual
});
```

##### 未來擴充範例

```typescript
// 未來需要新增參數時，只需擴充物件型別
interface ICreateAndValidateSnapshotData {
  /** 擷取的資料 / Captured data */
  capturedData: any;
  /** 驗證用的資料 / Data for validation */
  validData: any;
  /** 測試結果 / Test result */
  result: any;
  /** 是否需要更新 snapshot / Whether to update snapshot */
  updateSnapshot?: boolean;
  /** 自定義驗證選項 / Custom validation options */
  validationOptions?: {
    strict?: boolean;
    ignoreKeys?: string[];
  };
}

export function _createAndValidateSnapshot(
  data: ICreateAndValidateSnapshotData
): void {
  // ...實作
}
```

##### 決策流程

```
函式參數數量是否 >= 3？
    │
    ├─ 是 → 參數是否可能未來擴充？
    │         │
    │         ├─ 是 → 使用物件參數
    │         │
    │         └─ 否 → 可考慮使用物件參數或獨立參數
    │
    └─ 否 → 使用獨立參數
```

##### 注意事項

- 此原則特別適用於測試輔助函數（helper functions）和工具函數
- 物件參數應包含清晰的 JSDoc 註解，說明每個屬性的用途
- 對於確定不會擴充且參數數量少的函式，可保持獨立參數風格
- 物件參數的屬性應有明確的型別定義，避免使用 `any`（除非必要）

---

### 6. Fixtures 與測試資料管理

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

---

### 8. 臨時檔案管理原則

**當測試需要創建臨時檔案或臨時目錄時，應在專案內建立專用的臨時目錄來操作，而非直接在根目錄或 src 目錄下創建。**

#### 安全原則

**禁止對臨時目錄以外的路徑進行讀取以外的行為（包含但不限於 刪除/新增/編輯）。**

如果需要測試，則必須建立安全的 mock/sandbox 環境以模擬的方式執行，確保測試隔離性，避免意外修改或刪除重要的專案檔案。

```typescript
// ✅ 正確：在臨時目錄下進行操作
const tempDir = path.join(process.cwd(), 'test', 'temp', 'test-output');
const tempFile = path.join(tempDir, 'output.json');
fs.writeFileSync(tempFile, data);    // ✅ 允許
fs.readFileSync(tempFile);           // ✅ 允許
fs.unlinkSync(tempFile);              // ✅ 允許（在臨時目錄內）

// ❌ 錯誤：對臨時目錄外的路徑進行寫入/刪除
const srcFile = path.join(process.cwd(), 'src', 'config.json');
fs.writeFileSync(srcFile, data);      // ❌ 禁止：寫入
fs.unlinkSync(srcFile);               // ❌ 禁止：刪除
fs.mkdirSync(path.join(process.cwd(), 'new-dir'));  // ❌ 禁止：新增

// ✅ 正確：對臨時目錄外的路徑僅進行讀取
const configData = fs.readFileSync(
    path.join(process.cwd(), 'src', 'config.json'),
    'utf-8'
);  // ✅ 允許：僅讀取
```

#### 為什麼需要專用臨時目錄

- 保持專案結構整潔，避免臨時檔案與正式代碼混淆
- 便於集中管理與清理臨時資料
- 避免意外提交臨時檔案至版本控制系統
- 降低誤刪重要檔案的風險

#### 目錄結構建議

```
project/
├── src/                         # 原始碼
├── test/                        # 測試目錄
│   ├── fixtures/                # 靜態測試資料
│   └── temp/                   # 臨時檔案專用目錄 ⭐
│       ├── test-output-1708152000000/  # 測試輸出檔案（具有唯一性 ID）
│       ├── mock-cache/         # 模擬快取資料（可覆寫）
│       └── uploads/            # 上傳測試檔案
└── temp/                        # 專案層級臨時目錄 ⭐
    ├── test-output-1708152000000/  # 測試輸出檔案
    ├── build-cache/            # 建置快取（可覆寫）
    └── uploads/                # 上傳測試檔案
```

#### 重要原則

**原則一：禁止直接建立在臨時主目錄下，必須建立在子目錄中。**

```typescript
// ✅ 正確：建立於 temp 子目錄下
const tempDir = path.join(process.cwd(), 'temp', 'test-output');

// ❌ 錯誤：直接建立在 temp 主目錄
const tempDir = path.join(process.cwd(), 'temp');
```

**原則二：臨時子目錄名稱應具有唯一性的 ID（例如 timestamp），除非是多個測試共用的臨時子目錄或者可以被多次覆寫的臨時子目錄。**

```typescript
// ✅ 正確：具有唯一性 ID 的臨時目錄
const timestamp = Date.now();
const tempDir = path.join(process.cwd(), 'temp', `test-output-${timestamp}`);

// ✅ 正確：可覆寫的共用臨時目錄（不需要唯一性 ID）
const tempDir = path.join(process.cwd(), 'temp', 'mock-cache');

// ❌ 錯誤：直接建立在 temp 主目錄
const tempDir = path.join(process.cwd(), 'temp');
```

#### 使用範例

```typescript
// ✅ 正確：在專用臨時目錄下操作
import * as path from 'path';
import * as fs from 'fs';

// 取得臨時目錄路徑（具有唯一性 ID）
const getTempDir = (subDir: string) => {
    const timestamp = Date.now();
    const tempDir = path.join(process.cwd(), 'test', 'temp', `${subDir}-${timestamp}`);

    // 確保目錄存在
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    return tempDir;
};

// 取得共用臨時目錄路徑（可覆寫，無需唯一性 ID）
const getSharedTempDir = (subDir: string) => {
    const tempDir = path.join(process.cwd(), 'test', 'temp', subDir);

    // 確保目錄存在
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    return tempDir;
};

// 在具有唯一性 ID 的臨時目錄下創建檔案
it('should generate output file', async () => {
    const outputDir = getTempDir('test-output');  // ✅ 使用具有唯一性 ID 的子目錄
    const outputFile = path.join(outputDir, 'result.json');

    const result = await processData(inputData);
    fs.writeFileSync(outputFile, JSON.stringify(result));  // ✅ 在臨時目錄內操作

    expect(fs.existsSync(outputFile)).toBe(true);
});

// 使用共用臨時目錄（可覆寫）
it('should use shared temp cache', async () => {
    const cacheDir = getSharedTempDir('mock-cache');  // ✅ 共用目錄，無需唯一性 ID
    // ... 測試邏輯
});

// ❌ 錯誤：直接在根目錄或 src 目錄下創建臨時檔案
it('should NOT create temp file in root', async () => {
    const tempFile = path.join(process.cwd(), 'temp-result.json');  // ❌ 禁止
    fs.writeFileSync(tempFile, 'data');
});

// ❌ 錯誤：禁止直接建立在臨時主目錄下
it('should NOT create in temp root', async () => {
    const tempDir = path.join(process.cwd(), 'temp');  // ❌ 禁止：應使用 temp/xxx/
});

// ❌ 錯誤：未使用唯一性 ID 的臨時目錄可能導致並行測試衝突
it('should NOT use non-unique temp dir', async () => {
    // 當多個測試並行執行時，這種方式可能導致衝突
    const tempDir = path.join(process.cwd(), 'test', 'temp', 'test-output');
});

// ❌ 錯誤：禁止對臨時目錄外的路徑進行寫入/刪除
it('should NOT modify files outside temp', async () => {
    const configPath = path.join(process.cwd(), 'config', 'settings.json');
    fs.writeFileSync(configPath, '{}');  // ❌ 禁止：寫入
    fs.unlinkSync(configPath);            // ❌ 禁止：刪除
    fs.mkdirSync(path.join(process.cwd(), 'some-new-dir'));  // ❌ 禁止：新增
});

// ✅ 正確：需要測試時使用 mock/sandbox 環境
it('should handle file operations safely', async () => {
    // 使用 mock 模擬檔案系統操作
    const mockFs = {
        readFileSync: jest.fn(),
        writeFileSync: jest.fn(),
    };

    // 測試邏輯使用 mock 的檔案系統
    const result = await processWithMockFs(inputData, mockFs);
    expect(result).toBeDefined();
});
```

#### 清理策略

##### 自動清理（推薦）

```typescript
import * as fs from 'fs';
import * as path from 'path';

// 使用 afterEach 自動清理
// ⚠️ 重要：除非必要否則不應主動廣域性清除
// 而是只限定於本次操作的臨時子目錄，防止同時有其他測試正在操作臨時目錄
describe('File Processing', () => {
    const tempDirs: string[] = [];

    // 取得具有唯一性 ID 的臨時目錄
    const getTempDir = (subDir: string) => {
        const timestamp = Date.now();
        const tempDir = path.join(process.cwd(), 'test', 'temp', `${subDir}-${timestamp}`);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        tempDirs.push(tempDir);
        return tempDir;
    };

    afterEach(() => {
        // ✅ 正確：只清理本次測試创建的臨時目錄
        // 防止同時有其他測試正在操作臨時目錄
        tempDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true });
            }
        });
        tempDirs.length = 0;
    });

    it('should process files', () => {
        const tempDir = getTempDir('test-output');
        // ... 測試邏輯
    });
});
```

```typescript
// ❌ 錯誤：廣域性清除會影響其他正在運行的測試
afterEach(() => {
    // 這種方式會刪除整個臨時目錄，可能影響並行測試
    fs.rmSync(path.join(process.cwd(), 'test', 'temp'), { recursive: true });
});
```

##### 需要審閱時的保留策略

**如果臨時檔案有需要被審閱，可以暫時不刪除。** 這種情況適用於：

- 需要檢查測試輸出的格式是否正確
- 需要分析錯誤發生時的資料狀態
- 需要人工確認測試結果
- **實作失敗但有參考價值的邏輯意圖** - 例如演算法嘗試、參數組合探索等過程記錄
- **錯誤訊息與堆疊追蹤** - 有助於後續開發者理解問題根源
- **效能分析或診斷報告** - 可幫助優化方向的判斷
- **模擬資料的多種變體** - 記錄不同輸入條件下的輸出結果

```typescript
// ✅ 需要審閱時：不執行自動清理
describe('File Processing (Manual Review)', () => {
    // 取得具有唯一性 ID 的臨時目錄，方便追蹤
    const getTempDir = (subDir: string) => {
        const timestamp = Date.now();
        const tempDir = path.join(process.cwd(), 'test', 'temp', `${subDir}-${timestamp}`);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        return tempDir;
    };

    // 不使用 afterEach 清理，讓臨時檔案保留供人工審閱
    it('should generate output file for review', async () => {
        const outputDir = getTempDir('test-output');
        const outputFile = path.join(outputDir, 'result.json');

        const result = await processData(inputData);
        fs.writeFileSync(outputFile, JSON.stringify(result));

        // 測試通過，但保留檔案供人工審閱
        expect(result).toBeDefined();
    });
});
```

##### 審閱時保留的輔助資訊類型

當決定保留臨時檔案供審閱時，建議一併保留以下輔助資訊：

```typescript
// ✅ 建議的審閱檔案結構
test/temp/review/
├── review-session-2024-01-15-10-30-00/     # 以日期時間命名審閱回合
│   ├── algorithm-attempts.md               # 演算法嘗試記錄
│   └── notes.md                            # 開發者備註（記錄問題與解決思路）
```

**備註檔案範例（`notes.md`）：**

```markdown
# 審閱筆記

## 問題描述
- 處理大型檔案時效能低落
- 記憶體使用量異常飆升

## 觀察分析
- 演算法嘗試 A：耗時 3.2s，記憶體峰值 512MB
- 演算法嘗試 B：耗時 1.8s，記憶體峰值 380MB
- 建議採用嘗試 B 的分頁策略

## 參考價值
- 為未來優化提供方向
- 記錄了參數調校的過程
```

#### 版本控制配置

確保臨時目錄不會被提交至版本控制系統：

```gitignore
# .gitignore

# 測試臨時檔案
test/temp/

# 專案層級臨時目錄
temp/
tmp/

# 特定臨時檔案
*.tmp
*.temp
```

#### 注意事項

- **禁止直接建立在臨時主目錄下** - 必須使用子目錄（如 `temp/test-output/` 而非 `temp/`）
- **臨時子目錄名稱應具有唯一性 ID** - 例如使用 timestamp，避免並行測試衝突
- **清理臨時目錄時不得直接清理 temp 目錄** - 應清理 `temp/xxxx/` 底下的檔案或目錄，而非刪除 temp 目錄本身
- 除非必要否則不應主動廣域性清除 - 應只清理本次測試創建的臨時目錄，防止影響其他並行測試
- 臨時目錄應具有明確的命名（如 `test/temp/`、`temp/`），讓團隊成員一目了然
- 臨時檔案應在測試完成後清理，避免殘留資料影響後續測試
- 若需要審閱臨時檔案，可暫時不刪除，測試完成後應手動清理
- 對於需要持久化的測試資料（如 fixtures），應放在 `test/fixtures/` 而非臨時目錄
- 若臨時檔案體積較大，應考慮使用 `.gitignore` 排除或使用虛擬檔案系統
- 避免在臨時目錄中存放敏感資訊，如需使用敏感資料應建立 mock 資料

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
- [測試框架 API 重構範例](./test-file-best-practices/examples.md) - 補充 Jest 與 Bun 測試相容的 API 重構範例
- [test-snapshot-documentation skill](../skills/test-snapshot-documentation/SKILL.md) - 利用測試快照進行文件化的非常規使用方式

