---
description: >-
  詳細規範 TypeScript Enum、Interface 與 Type Alias 的命名格式、文件要求、成員註解與判定流程。
tags:
  - typescript
  - naming-convention
  - typescript/types
  - documentation/references
---

# TypeScript 命名規則詳細規範

本文件是 `typescript-naming-convention` 技能的規則來源，涵蓋型別名稱、文件與成員註解。

---

## 1. Enum 命名

將 Enum 命名為 `Enum{Name}`，並使用 PascalCase。

```typescript
/**
 * 結果類型列舉
 * Result type enumeration
 */
enum EnumResultType {
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
}
```

```typescript
/**
 * HTTP 狀態碼列舉
 * HTTP status code enumeration
 */
enum EnumHttpStatus {
    OK = 200,
    NotFound = 404,
    ServerError = 500,
}
```

### Enum 成員文件

建議為成員加入用途說明，讓列舉值的語意在閱讀與 IDE 提示中保持可見。

```typescript
/**
 * 日誌級別列舉
 * Log level enumeration
 */
enum EnumLogLevel {
    /** 除錯資訊 / Debug information */
    Debug = 'debug',
    /** 一般資訊 / General information */
    Info = 'info',
    /** 警告訊息 / Warning message */
    Warn = 'warn',
    /** 錯誤訊息 / Error message */
    Error = 'error',
}
```

---

## 2. Interface 命名

將 Interface 命名為 `I{Name}`，並使用 PascalCase。

```typescript
/**
 * 結果型別介面
 * Result type interface
 */
interface IResultType {
    code: number;
    message: string;
    data?: unknown;
}
```

```typescript
/**
 * 使用者資訊介面
 * User information interface
 */
interface IUserInfo {
    id: string;
    name: string;
    email: string;
}
```

### Interface 成員文件

建議為屬性使用單行區塊註解，為方法使用包含參數與回傳值的結構化 JSDoc。

```typescript
/**
 * 使用者資訊介面
 * User information interface
 */
interface IUserInfo {
    /** 使用者唯一識別碼 / User unique identifier */
    id: string;
    /** 使用者名稱 / User name */
    name: string;
    /** 電子郵件地址（可選）/ Email address (optional) */
    email?: string;
    /** 建立時間 / Creation timestamp */
    createdAt: Date;
    /**
     * 更新使用者資料
     * Update user information
     * @param data - 更新的資料 / Data to update
     * @returns 更新後的使用者資訊 / Updated user information
     */
    update(data: Partial<IUserInfo>): IUserInfo;
}
```

---

## 3. Type Alias 命名

將 Type Alias 命名為 `I{Name}`，並使用 PascalCase。保留泛型參數與型別運算式。

```typescript
/**
 * API 回應型別
 * API response type
 */
type IApiResponse<T> = {
    success: boolean;
    data: T;
    error?: string;
};
```

```typescript
/**
 * 狀態型別
 * Status type
 */
type IStatus = 'pending' | 'processing' | 'completed' | 'failed';
```

### Type Alias 成員文件

建議為物件型別成員使用單行區塊註解；為函式型別成員使用參數與回傳值 JSDoc。

```typescript
/**
 * API 回應型別
 * API response type
 */
type IApiResponse<T> = {
    /** 請求是否成功 / Whether the request was successful */
    success: boolean;
    /** 回應資料 / Response data */
    data: T;
    /** 錯誤訊息（若失敗時存在）/ Error message (if failed) */
    error?: string;
    /** 伺服器回應時間戳 / Server response timestamp */
    timestamp: number;
};
```

```typescript
/**
 * 資料驗證器型別
 * Data validator type
 */
type IValidator<T> = {
    /**
     * 驗證資料是否有效
     * Validate if data is valid
     * @param value - 待驗證的值 / Value to validate
     * @returns 驗證結果 / Validation result
     */
    validate: (value: unknown) => value is T;
    /** 驗證失敗時的錯誤訊息 / Error message when validation fails */
    errorMessage: string;
};
```

---

## 4. 型別文件最低要求

為每個型別宣告建立 `/** ... */` 文件，並說明：

1. 型別的中文用途。
2. 型別代表的業務或技術語意。
3. 建議加入英文對照說明。

英文說明可視文件語境省略，但不得以英文取代所有中文說明。

遵循 [註解格式規範](../../../rules/comment-format-rules.md) 處理雙語順序、JSDoc 標籤、註解位置與區塊格式。

---

## 5. 判定流程

```text
定義新的型別
    │
    ▼
是 Enum 嗎？
    │
    ├─ 是 → 命名為 Enum{Name}
    │        └─ 加入型別與成員文件
    │
    └─ 否 → 是 Interface 或 Type Alias 嗎？
             │
             ├─ 是 → 命名為 I{Name}
             │        └─ 加入型別與成員文件
             │
             └─ 否 → 沿用專案既有命名慣例
```

---

## 6. 禁止事項

- 不要將 Enum 命名為沒有 `Enum` 前綴的名稱。
- 不要將 Interface 命名為沒有 `I` 前綴的名稱。
- 不要將 Type Alias 命名為沒有 `I` 前綴的名稱。
- 不要省略型別宣告的區塊文件。
- 不要用單行 `//` 註解取代型別文件。
- 不要將未涵蓋的型別強行套用本規則的前綴。
