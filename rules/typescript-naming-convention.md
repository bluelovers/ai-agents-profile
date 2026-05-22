---
tags:
  - rules
  - TypeScript
  - naming
  - convention
  - interface
  - enum
---

# TypeScript 命名規則
# TypeScript Naming Convention

## 概述

本規則定義了 TypeScript 型別與介面的命名標準，確保程式碼的一致性與可讀性。

---

## 1. 型別命名規範

### 1.1 Enum 命名

**規則：** Enum 必須以 `Enum` 開頭，採用 PascalCase 格式。

- **格式：** `Enum{Name}`
- **範例：**

```typescript
// ✅ 正確：Enum 以 Enum 開頭
/**
 * 結果類型列舉
 * Result type enumeration
 */
enum EnumResultType
{
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
}

// ✅ 正確：具有語義的 Enum 名稱
/**
 * HTTP 狀態碼列舉
 * HTTP status code enumeration
 */
enum EnumHttpStatus
{
    OK = 200,
    NotFound = 404,
    ServerError = 500,
}
```

### 1.2 Interface 命名

**規則：** Interface 必須以 `I` 開頭，採用 PascalCase 格式。

- **格式：** `I{Name}`
- **範例：**

```typescript
// ✅ 正確：Interface 以 I 開頭
/**
 * 結果型別介面
 * Result type interface
 */
interface IResultType
{
    code: number;
    message: string;
    data?: unknown;
}

// ✅ 正確：具有語義的 Interface 名稱
/**
 * 使用者資訊介面
 * User information interface
 */
interface IUserInfo
{
    id: string;
    name: string;
    email: string;
}
```

### 1.3 Type Alias 命名

**規則：** Type Alias（型別別名）必須以 `I` 開頭，採用 PascalCase 格式。

- **格式：** `I{Name}`
- **範例：**

```typescript
// ✅ 正確：Type Alias 以 I 開頭
/**
 * API 回應型別
 * API response type
 */
type IApiResponse<T> =
{
    success: boolean;
    data: T;
    error?: string;
};

// ✅ 正確：聯合型別
/**
 * 狀態型別
 * Status type
 */
type IStatus = 'pending' | 'processing' | 'completed' | 'failed';
```

---

## 2. 區塊註解規範

### 2.1 型別定義註解

**規則：** 所有型別定義（Enum、Interface、Type Alias）必須使用區塊註解（Block Comment）進行說明。

- **格式：** `/** ... */`
- **內容要求：**
  - 包含中文說明
  - 包含英文說明（可選但建議）
  - 說明該型別的用途與語義

```typescript
// ✅ 正確：完整的區塊註解
/**
 * 任務配置介面
 * Task configuration interface
 */
interface ITaskConfig
{
    id: string;
    priority: number;
    timeout: number;
}

// ✅ 正確：包含詳細說明的註解
/**
 * 資料分頁參數
 * Data pagination parameters
 *
 * @property page - 當前頁碼（從 1 開始）/ Current page number (starting from 1)
 * @property pageSize - 每頁筆數 / Items per page
 * @property total - 總筆數（可選）/ Total count (optional)
 */
interface IPaginationParams
{
    /** 當前頁碼（從 1 開始）/ Current page number (starting from 1) */
    page: number;
    /** 每頁筆數 / Items per page */
    pageSize: number;
    /** 總筆數（可選）/ Total count (optional) */
    total?: number;
}
```

### 2.2 Enum 成員註解

**規則：** Enum 成員建議添加註解說明其用途。

```typescript
// ✅ 正確：為 Enum 成員添加註解
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

### 2.3 Interface 成員註解

**規則：** Interface 的成員（屬性與方法）建議添加註解說明其用途。

- 屬性使用**單行區塊註解**（`/** ... */`）格式
- 方法使用**結構化文檔註解**，包含參數與回傳值說明

詳見 [註解格式規範 - 單行區塊註解](./comment-format-rules.md#2-單行區塊註解-single-line-block)。

```typescript
// ✅ 正確：為 Interface 成員添加註解
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

### 2.4 Type Alias 成員註解

**規則：** Type Alias 的成員（若為物件型別）建議添加註解說明其用途。

- 屬性使用**單行區塊註解**（`/** ... */`）格式
- 函式型別的參數與回傳值使用 JSDoc 標註

詳見 [註解格式規範 - 單行區塊註解](./comment-format-rules.md#2-單行區塊註解-single-line-block)。

```typescript
// ✅ 正確：為 Type 成員添加註解
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

// ✅ 正確：函式型別的參數與回傳值說明
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

## 3. 完整範例

### 3.1 綜合範例

```typescript
// ==================== Enum 定義 ====================

/**
 * 處理結果狀態列舉
 * Processing result status enumeration
 */
enum EnumProcessStatus {
    /** 閒置 / Idle */
    Idle = 'idle',
    /** 執行中 / Running */
    Running = 'running',
    /** 已完成 / Completed */
    Completed = 'completed',
    /** 已取消 / Cancelled */
    Cancelled = 'cancelled',
}

// ==================== Interface 定義 ====================

/**
 * 處理結果介面
 * Processing result interface
 */
interface IProcessResult {
    status: EnumProcessStatus;
    output: string;
    duration: number;
    error?: IProcessError;
}

/**
 * 處理錯誤介面
 * Processing error interface
 */
interface IProcessError {
    code: string;
    message: string;
    stack?: string;
}

// ==================== Type Alias 定義 ====================

/**
 * 處理器函式型別
 * Processor function type
 */
type IProcessor<TInput, TOutput> = (
    input: TInput,
    options?: IProcessorOptions
) => Promise<TOutput>;

/**
 * 處理器選項型別
 * Processor options type
 */
type IProcessorOptions = {
    timeout?: number;
    retries?: number;
    onProgress?: (progress: number) => void;
};
```

---

## 4. 禁止事項

### ❌ 不正確的命名範例

```typescript
// ❌ 錯誤：Enum 未以 Enum 開頭
enum ResultType {
    Success = 'success',
}

// ❌ 錯誤：Interface 未以 I 開頭
interface UserInfo {
    name: string;
}

// ❌ 錯誤：Type Alias 未以 I 開頭
type ApiResponse<T> = {
    data: T;
};

// ❌ 錯誤：缺少區塊註解
interface Config {
    value: string;
}

// ❌ 錯誤：使用單行註解而非區塊註解
// 這是錯誤的註解方式
interface WrongComment {
    data: unknown;
}
```

---

## 5. 決策流程

```
定義新的型別
    │
    ▼
該型別是 Enum 嗎？
    │
    ├─ 是 → 命名為 Enum{Name}
    │        │
    │        ▼
    │   添加區塊註解
    │
    └─ 否 → 該型別是 Interface 或 Type Alias 嗎？
             │
             ├─ 是 → 命名為 I{Name}
             │        │
             │        ▼
             │   添加區塊註解
             │
             └─ 否 → 參考其他命名規範
```

---

## 相關規範

- [註解格式規範](./comment-format-rules.md)
- [TypeScript 官方風格指南](https://www.typescriptlang.org/docs/handbook/declaration-files/by-example.html)
