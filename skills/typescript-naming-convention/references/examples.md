---
description: >-
  提供 TypeScript Enum、Interface 與 Type Alias 的完整正確範例及常見錯誤模式。
tags:
  - typescript
  - naming-convention
  - examples
  - documentation/references
---

# TypeScript 命名範例

使用這些範例確認命名、型別文件與成員文件的組合符合規則。

---

## 正確：綜合範例

```typescript
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

## 正確：文件化成員

```typescript
/**
 * 資料分頁參數
 * Data pagination parameters
 */
interface IPaginationParams {
    /** 當前頁碼（從 1 開始）/ Current page number (starting from 1) */
    page: number;
    /** 每頁筆數 / Items per page */
    pageSize: number;
    /** 總筆數（可選）/ Total count (optional) */
    total?: number;
}
```

---

## 錯誤：缺少型別前綴

```typescript
enum ResultType {
    Success = 'success',
}
```

正確名稱應為 `EnumResultType`。

```typescript
interface UserInfo {
    name: string;
}
```

正確名稱應為 `IUserInfo`。

```typescript
type ApiResponse<T> = {
    data: T;
};
```

正確名稱應為 `IApiResponse<T>`。

---

## 錯誤：缺少型別文件

```typescript
interface Config {
    value: string;
}
```

在宣告前加入 `/** ... */`，說明 `Config` 的用途與語意。

---

## 錯誤：使用單行註解取代型別文件

```typescript
// 設定值介面
interface WrongComment {
    data: unknown;
}
```

改用區塊文件：

```typescript
/**
 * 設定值介面
 * Configuration value interface
 */
interface IConfigValue {
    data: unknown;
}
```

---

## 檢查重點

- 型別名稱是否符合對應前綴與 PascalCase。
- 泛型參數是否保留。
- 型別宣告前是否有 `/** ... */`。
- 文件是否說明用途與語意。
- 成員是否使用適當的單行或結構化文件。
