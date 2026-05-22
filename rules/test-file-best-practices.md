---
name: test-file-best-practices
description: 測試檔案最佳實踐規範。Use when users request (1) Testing best practices, (2) Test file organization, (3) "測試檔案規範", (4) "測試最佳實踐", (5) "測試檔案組織", (6) "測試資料管理", (7) "臨時檔案管理", (8) "重構測試", (9) "優化測試", (10) "整合測試". Defines guidelines for writing and organizing test files, including test location patterns, naming conventions, snapshot testing, fixtures management, and temporary file handling.
tags:
  - agents/rules
  - testing
  - agents/guidelines
  - testing/jest
  - testing/snapshot
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
- [測試資料集規範](#9-測試資料集規範) - 測試資料應包含輸入與預期輸出
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

以下為 Node.js 環境下的測試檔案 Header (請勿用於 PHP 或 Python 等環境)：

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

**禁止對臨時目錄以外的路徑進行讀取以外的行為（包含但不限於 寫入/更改/刪除/建立）。**

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

#### Mock 環境安全規則

**對於有可能涉及檔案寫入/刪除的模組或測試，應使用 mock 環境防止 fs 操作臨時目錄 (test/temp) 以外任何路徑。**

##### 核心原則

1. **白名單路徑** - 僅允許操作以下路徑：
   - `test/temp/` - 測試臨時目錄（可讀寫）
   - `test/fixtures/` - 測試資料目錄（唯讀）
   - 專案根目錄（可讀取）

2. **讀取權限** - 對臨時目錄以外的路徑，僅允許讀取操作，不得進行寫入、更改、刪除、建立等操作

3. **主動接管 fs 方法** - Mock 應採用能主動接管 fs 方法的方式（如 `jest.mock('fs')`），而非直接操作 mock fs 物件。因為 fs 操作可能存在於原始邏輯或第三方模組中，需要讓這些操作自動被 mock 攔截

4. **Mock 隔離** - 使用 memfs-extra 在記憶體中模擬檔案系統操作，避免影響真實檔案系統。詳細使用方式請參考 [skills/test-js-mock](../skills/test-js-mock/SKILL.md)

##### 安全檢查流程

```
1. 相對路徑檢查
   └── 如果是相對路徑且未允許 → ❌ REJECTED

2. 白名單檢查
   ├── test/temp/        → ✅ ALLOWED（可讀寫）
   ├── test/fixtures/    → ✅ ALLOWED（唯讀）
   └── 專案根目錄         → ✅ ALLOWED（可讀取）

3. 危險關鍵詞檢查
   ├── Windows: \Windows\, \System32\, \Program Files\  → ❌ REJECTED
   ├── Unix: /etc/, /usr/bin/, /sys/, /boot/           → ❌ REJECTED
   └── 其他系統目錄                                      → ❌ REJECTED

4. 範圍檢查
   └── 是否在專案根目錄內  → ❌ REJECTED（若在外）
```

##### 使用範例

```typescript
// ✅ 正確：使用 jest.mock() 主動接管 fs 模組
// 讓原始邏輯或第三方模組中的 fs 操作自動被 mock 攔截
jest.mock('fs', () => {
    const mockFs = {
        readFileSync: jest.fn(),
        writeFileSync: jest.fn(),
        unlinkSync: jest.fn(),
        mkdirSync: jest.fn(),
        existsSync: jest.fn(),
    };
    return mockFs;
});

describe('Config Tests', () => {
    const fs = require('fs');

    beforeEach(() => {
        // 重置所有 mock
        jest.clearAllMocks();
    });

    it('should mock config file', () => {
        // 設定 mock 行為
        fs.readFileSync.mockReturnValue(JSON.stringify({
            show_banner: true,
            agents: { monarch: { poll_interval: 5000 } }
        }));

        // 執行原始邏輯（會自動使用 mock 的 fs）
        const config = loadConfig();

        // 驗證
        expect(fs.readFileSync).toHaveBeenCalled();
        expect(config.show_banner).toBe(true);
    });
});

// ✅ 正確：使用 MockEnv 進行安全的檔案操作
import { MockEnv } from "./test/lib/mock-env";

describe('File Processing', () => {
    const env = new MockEnv();

    beforeEach(() => env.reset());
    afterEach(() => env.cleanup());

    it('should process files safely', () => {
        // 使用安全的 fs 包裝
        env.safeFs.writeFileSync(`${__TEST_TEMP}/output.txt`, 'result');

        // 驗證檔案存在
        expect(env.safeFs.existsSync(`${__TEST_TEMP}/output.txt`)).toBe(true);
    });
});

// ❌ 錯誤：直接操作臨時目錄外的路徑
it('should NOT modify files outside temp', () => {
    const configPath = path.join(process.cwd(), 'config', 'settings.json');
    fs.writeFileSync(configPath, '{}');  // ❌ 禁止：寫入
    fs.unlinkSync(configPath);            // ❌ 禁止：刪除
    fs.mkdirSync(path.join(process.cwd(), 'some-new-dir'));  // ❌ 禁止：新增
});

// ✅ 正確：僅讀取臨時目錄外的路徑
it('should read files outside temp', () => {
    const configPath = path.join(process.cwd(), 'src', 'config.json');
    const configData = fs.readFileSync(configPath, 'utf-8');  // ✅ 允許：僅讀取
});
```

##### 路徑控管模組

**可使用 upath2、path-is-same、path-in-dir、micromatch 或其他等模組搭配組合控管路徑。**

###### 推薦模組

| 模組 | 用途 | 範例 |
|------|------|------|
| `upath2` | 跨平台路徑處理（統一正斜線 `/`） | `normalize("D:\\path\\to\\file")` → `"D:/path/to/file"` |
| `path-in-dir` | 檢查路徑是否在指定目錄內 | `pathInsideDirectory(path, rootDir)` |
| `path-is-same` | 比較路徑是否相同（解析符號連結） | `pathIsSame(path1, path2)` |
| `micromatch` | Glob pattern 匹配（用於過濾路徑） | `isMatch("**/*.ts", pattern)` |

###### 使用範例

```typescript
import { normalize } from "upath2";
import { pathInsideDirectory } from "path-in-dir";
import { pathIsSame } from "path-is-same";
import { isMatch } from "micromatch";

// 跨平台路徑處理
const normalizedPath = normalize("D:\\Users\\project\\src\\config.json");
// → "D:/Users/project/src/config.json"

// 檢查路徑是否在白名單目錄內
const isInTemp = pathInsideDirectory(
    normalizedPath,
    normalize(path.join(process.cwd(), 'test', 'temp'))
);

// 比較路徑是否相同
const isSame = pathIsSame(
    normalize(path1),
    normalize(path2)
);

// 使用 Glob pattern 過濾路徑
const isTsFile = isMatch(normalizedPath, "**/*.ts");
const isTestFile = isMatch(normalizedPath, "**/*.test.ts");
```

###### 安全檢查實作

```typescript
import { normalize } from "upath2";
import { pathInsideDirectory } from "path-in-dir";

/**
 * 檢查路徑是否安全（在白名單目錄內）
 * Check if path is safe (inside whitelist directories)
 *
 * @param targetPath - 目標路徑 / Target path
 * @returns 是否安全 / Whether safe
 */
function isPathSafe(targetPath: string): boolean {
    const normalizedPath = normalize(targetPath);
    const projectRoot = normalize(process.cwd());

    // 白名單目錄
    const whitelistDirs = [
        normalize(path.join(projectRoot, 'test', 'temp')),
        normalize(path.join(projectRoot, 'test', 'fixtures')),
        projectRoot,
    ];

    // 檢查是否在白名單目錄內
    for (const dir of whitelistDirs) {
        if (pathInsideDirectory(normalizedPath, dir)) {
            return true;
        }
    }

    return false;
}
```

##### 共享路徑定義檔案

**可使用共享的路徑定義檔案來避免使用相對路徑造成的非預期狀況。**

###### 為什麼需要共享路徑定義

使用相對路徑（如 `../`、`../../`）可能導致以下問題：
- 路徑層級混亂，難以維護
- 檔案移動後路徑失效
- 不同環境下路徑不一致
- 難以統一管理專案路徑

###### 建議實作方式

建立中央化的路徑定義檔案（如 `__root.ts`），統一管理專案路徑：

```typescript
/**
 * 專案根路徑定義 / Project Root Path Definitions
 *
 * 使用中央化路徑管理，避免相對路徑 ../ 地獄
 * Centralized path management to avoid relative path ../../.. hell
 */
/// <reference types="node" />

import { join } from "path";

/** 專案根目錄 / Project root directory */
export const __ROOT = join(__dirname);

/** 作業系統判斷 / Operating system detection */
export const isWin = process.platform === "win32";

// 測試路徑架構 / Test Path Structure
// test/
// ├── fixtures/              ← 測試資料夾（唯讀）
// └── temp/                 ← 臨時檔案（可寫，永遠建立子資料夾）
//     ├── fake-bun/
//     └── temp-paths/

/** 測試根目錄 / Test root directory */
export const __TEST_ROOT = join(__ROOT, "test");

/** 測試資料目錄（唯讀）/ Test fixtures directory (read-only) */
export const __TEST_FIXTURES = join(__TEST_ROOT, "fixtures");

/** 測試臨時目錄（可寫）/ Test temp directory (writable) */
export const __TEST_TEMP = join(__TEST_ROOT, "temp");

/** 建置輸出目錄 / Build output directory */
export const __DIST = join(__ROOT, "dist");
```

###### 使用範例

```typescript
// ✅ 正確：使用共享路徑定義
import { __TEST_TEMP, __TEST_FIXTURES } from "../__root";

// 建立臨時檔案路徑
const tempFile = join(__TEST_TEMP, "temp-paths", "output.json");

// 建立 fixtures 檔案路徑
const fixtureFile = join(__TEST_FIXTURES, "mock-data.json");

// ❌ 錯誤：使用相對路徑
const tempFile = join("../../../test/temp/output.json");  // 容易出錯
```

###### 優點

1. **路徑一致性** - 所有路徑都從專案根目錄計算，確保一致性
2. **易於維護** - 路徑定義集中管理，修改時只需更改一處
3. **避免錯誤** - 不需要記憶相對路徑層級，減少錯誤
4. **跨環境相容** - 使用 `join()` 確保跨平台路徑格式正確

##### 注意事項

- **預設啟用安全檢查** - memfs-extra 配合 Jest mock 機制，應確保路徑限制在測試臨時目錄內
- **記憶體隔離** - memfs-extra 在記憶體中模擬檔案系統，不會影響真實檔案系統
- **跨平台路徑處理** - 使用 `upath2` 統一處理 Windows/Unix 路徑格式
- **並行測試安全** - 每個測試應確保獨立的路徑隔離，避免狀態洩漏
- **Audit Mode** - 如需保留測試輸出供審閱，可使用 memfs-extra 的 Volume 物件進行操作

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

    // 測試邏輯使用 mock 的檔案系統（使用 memfs-extra）
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

---

### 9. 測試資料集規範

**測試資料應獨立於測試邏輯，使用專門的 fixture 文件定義，每個測試用例應包含完整的測試資料，包括輸入、預期輸出和描述。**

#### 核心原則

##### 分離測試資料與測試邏輯

**規則：** 測試資料應獨立於測試邏輯，使用專門的 fixture 文件定義。

```
test/
├── fixtures/                    # 測試資料集中管理
│   └── <module>-test-cases.ts   # 各模組測試資料集
└── <module>/
    └── <feature>.test.ts        # 測試邏輯（引用 fixture）
```

#### 測試資料集結構

**規則：** 每個測試用例應包含完整的測試資料，包括輸入、預期輸出和描述。

```typescript
/**
 * 測試用例結構
 * Test case structure
 */
export interface ITestCase
{
	/** 測試用例名稱 / Test case name */
	name: string;
	/** 輸入資料（測試目標）/ Input data (test target) */
	input: any;
	/** 預期結果 / Expected result */
	expected: any;
	/** 備註（可選）/ Note (optional) */
	note?: string;
}

/**
 * 測試群組結構
 * Test group structure
 */
export interface ITestGroup
{
	/** 測試群組名稱 / Test group name */
	name: string;
	/** 測試用例陣列 / Test cases array */
	testCases: ITestCase[];
}
```

#### 測試資料集格式

**規則：** 使用單一陣列導出所有測試群組，便於自動產生測試。

```typescript
/**
 * 完整測試資料集
 * Complete test dataset
 *
 * 所有測試群組的集合
 */
export const testGroups: ITestGroup[] = [
	{
		name: "基本類型",
		testCases: [
			{
				name: "stringWithDefault",
				input: z.string().default("hello"),
				expected: "hello",
			},
			// ... 更多測試用例
		],
	},
	// ... 更多測試群組
];
```

#### 測試腳本自動產生

**規則：** 測試腳本應自動遍歷測試資料集，無需手動定義每個測試。

```typescript
import { testGroups } from "../fixtures/zod-defaults-test-cases";

/**
 * 自動產生所有測試群組
 * Automatically generate all test groups
 */
for (const group of testGroups)
{
	describe(group.name, () =>
	{
		for (const testCase of group.testCases)
		{
			it(testCase.name, () =>
			{
				// 執行測試邏輯
				runTestCase(testCase);
			});
		}
	});
}
```

#### 測試資料集命名規範

**規則：** 測試資料集文件應與被測模組對應。

| 模組 | 測試資料集 | 測試文件 |
|------|-----------|---------|
| `src/config/schema.ts` | `test/fixtures/config-test-cases.ts` | `test/issues/config-all.test.ts` |
| `src/utils/helper.ts` | `test/fixtures/helper-test-cases.ts` | `test/issues/helper-all.test.ts` |

#### 測試資料集組織

##### 按功能分組

```typescript
export const testGroups: ITestGroup[] = [
	{
		name: "基本類型",
		testCases: [
			// 基本類型測試用例
		],
	},
	{
		name: "巢狀結構",
		testCases: [
			// 巢狀結構測試用例
		],
	},
	{
		name: "邊界情況",
		testCases: [
			// 邊界情況測試用例
		],
	},
];
```

##### 按輸入類型分組

```typescript
export const testGroups: ITestGroup[] = [
	{
		name: "字串輸入",
		testCases: [
			// 字串輸入測試用例
		],
	},
	{
		name: "數字輸入",
		testCases: [
			// 數字輸入測試用例
		],
	},
	{
		name: "物件輸入",
		testCases: [
			// 物件輸入測試用例
		],
	},
];
```

#### 注意事項

1. **避免硬編碼** - 測試資料不應直接寫在測試邏輯中
2. **資料集獨立** - 測試資料集文件應可獨立維護
3. **自動產生** - 測試腳本應自動遍歷資料集，無需手動定義
4. **類型安全** - 使用 `ITestCase` 和 `ITestGroup` 接口確保類型安全
5. **雙語註解** - 測試資料集的註解應包含中英文
6. **完整資料** - 每個測試用例應同時包含輸入（測試目標）與預期輸出（expected）

---

## 系統依賴與 Mock 規範

### Mock 處理摘要

**測試中涉及系統資源（檔案系統、日期時間、環境變數、網路請求）時，應遵循以下處理原則：**

| 系統資源 | 處理方式 | 優先順序 |
|---------|---------|---------|
| **檔案系統 (fs)** | `jest.mock('fs')` 或臨時目錄 | Mock 優先 |
| **日期時間 (Date)** | `jest.useFakeTimers()` / `spyOn(Date, 'now')` | Mock 優先 |
| **環境變數** | `beforeEach` 複製 `process.env` | 備份與恢復 |
| **網路請求** | `fetchMock` / `nock` / `msw` | 一律 Mock |

**日期時間相關參考資源：**
- [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks)
- [Bun MockTimers](https://bun.com/reference/node/test/default/MockTimers)

### 系統依賴處理流程圖

```
需要使用系統資源?
    │
    ├─ 檔案系統 ───────────────────────────────────┐
    │   可以 Mock?                                  │
    │   ├─ 是 → 使用 jest.mock('fs') + memfs-extra │
    │   │         或 spyOn 模組方法                 │
    │   └─ 否 → 使用專案內臨時目錄 + try/finally 清理 │
    │                                               │
    ├─ 日期時間 ───────────────────────────────────┤
    │   使用 jest.useFakeTimers()                   │
    │   或 spyOn(Date, 'now')                       │
    │                                               │
    ├─ 環境變數 ───────────────────────────────────┤
    │   beforeEach: 複製 process.env                │
    │   afterAll:   恢復原值                         │
    │                                               │
    └─ 網路請求 ───────────────────────────────────┘
        一律使用 fetchMock / nock / msw
```

### 重要提醒

- **非臨時目錄禁止寫入**：絕對不要讓測試寫入 `/etc/`、`/usr/`、`C:\Windows\` 等系統目錄，或專案根目錄下的固定路徑
- **僅限專案內臨時目錄**：測試產生的臨時檔案**只能**寫入專案下的臨時目錄（如專案根目錄下的 `tmp/` 或 `.tmp/`），禁止寫入系統級臨時目錄（如 `/tmp`、`os.tmpdir()`）
- ⚠️ 即使有 mock 檔案系統，仍須確保路徑不超過臨時目錄範圍，詳細說明請參考 [skills/test-js-mock - 禁止使用的路徑模式](../skills/test-js-mock/SKILL.md#路徑安全原則)
- **優先使用框架 Mock**：當 Jest/Bun 提供的 `jest.mock()`、`spyOn()`、`useFakeTimers()`, `memfs-extra` 能滿足需求時，**不要**自行實作複雜的 mock 機制
- **自訂 Mock 作為最後手段**：僅當框架提供的 API 無法滿足特殊需求時，才考慮自行設計 mock 實作，且應妥善封裝並充分測試

### 詳細範例與實作

**完整的系統依賴處理範例請參閱：**

- [測試框架 API 重構範例 - 系統依賴謹慎處理原則](./test-file-best-practices/examples.md#12-系統依賴謹慎處理原則)

詳細範例包含：
- 檔案系統 Mock 與臨時目錄使用方式
- 依賴模組內部使用 fs 時的 Mock 策略
- 日期時間的 fake timers 與 spyOn 技巧
- 環境變數備份與恢復機制
- 網路請求 Mock 實作

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
- [Jest Timer Mocks](https://jestjs.io/docs/timer-mocks)
- [Bun MockTimers](https://bun.com/reference/node/test/default/MockTimers)
- [Asymmetric matchers - Expect · Jest](https://jestjs.io/docs/expect#asymmetric-matchers)
- [測試框架 API 重構範例](./test-file-best-practices/examples.md) - 補充 Jest 與 Bun 測試相容的 API 重構範例
- [test-snapshot-documentation skill](../skills/test-snapshot-documentation/SKILL.md) - 利用測試快照進行文件化的非常規使用方式
- [skills/test-js-mock - 使用 Jest + memfs-extra Mock 模組](../skills/test-js-mock/SKILL.md)

