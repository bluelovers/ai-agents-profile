---
title: TypeScript Semantic Types Patterns
description: >-
  常用語意化型別模式完整範例集，包含時間戳、日期、UUID、貨幣、百分比等常見業務型別的定義範例。
  提供可直接採用的型別別名模板。
tags:
  - typescript
  - type-system
  - semantic-types
  - type-aliases
  - patterns
  - agents/skills
  - documentation/references
---

# 常用語意化型別模式 | Common Semantic Type Patterns

本文件提供常見業務場景的語意化型別別名範例，開發者可根據專案需求直接採用或修改。

---

## 時間相關型別

### Unix 時間戳

```typescript
/**
 * Unix 時間戳（10 位數，秒）
 * Unix timestamp (10 digits, seconds)
 *
 * @example
 * dayjs().unix() 返回的時間戳
 * Math.floor(Date.now() / 1000)
 */
export type ITimestampUnix = number;

/**
 * 毫秒時間戳（13 位數）
 * Millisecond timestamp (13 digits)
 *
 * @example
 * Date.now() 返回的時間戳
 * dayjs().valueOf() 返回的時間戳
 * new Date().getTime()
 */
export type ITimestampMilliseconds = number;

/**
 * 毫秒時間戳字串（13 位數字串）
 * Millisecond timestamp string (13 digit string)
 *
 * @example
 * Date.now().toString()
 */
export type ITimestampMillisecondsString = `${number}`;

/**
 * 時間戳型別（聯合：秒或毫秒）
 * Timestamp type (union: seconds or milliseconds)
 *
 * @deprecated 僅限尚未得知目標格式時使用 / Only use when target format is unknown
 */
export type ITimestampUnknown = ITimestampUnix | ITimestampMilliseconds;
```

### ISO 8601 日期時間

```typescript
/**
 * ISO 8601 完整日期時間（含時區）
 * ISO 8601 full datetime with timezone
 *
 * @example 2024-01-15T10:30:00+08:00
 * @example 2024-01-15T10:30:00Z
 */
export type IDateISO8601WithTz = `${IDateISO8601Date}T${IDateISO8601Time}${string}`;

/**
 * ISO 8601 僅日期部分
 * ISO 8601 date only
 *
 * @example 2024-01-15
 */
export type IDateISO8601Date = `${number}-${number}-${number}`;

/**
 * ISO 8601 僅時間部分
 * ISO 8601 time only
 *
 * @example 10:30:00
 * @example 10:30:00.123
 */
export type IDateISO8601Time = `${number}:${number}:${number}`;

/**
 * 包含任意日期的字串，需透過提取函式處理
 * String containing any date, needs extraction function
 */
export type IStringIncludeAnyDate = string;
```

---

## 識別碼型別

### UUID

```typescript
/**
 * UUID v4 識別碼
 * UUID v4 identifier
 *
 * @example 550e8400-e29b-41d4-a716-446655440000
 */
export type IUuid = string;
```

### 使用者識別碼

```typescript
/**
 * 使用者唯一識別碼
 * User unique identifier
 */
export type IUserId = string;

/**
 * 基底64編碼的UUID
 * Base64 encoded UUID
 */
export type IUuidBase64 = string;

/**
 * 數字型使用者識別碼
 * Numeric user identifier
 */
export type IUserIdNumber = number;
```

---

## 數值型別

### 貨幣

```typescript
/**
 * 貨幣金額（最小單位，如分、cents）
 * Currency amount in smallest unit (cents)
 *
 * @example 100 表示 1.00 元
 */
export type ICurrencyAmount = number;

/**
 * 貨幣金額字串
 * Currency amount as string
 *
 * @example "10.50"
 */
export type ICurrencyAmountString = string;
```

### 百分比

```typescript
/**
 * 百分比數值（0-100）
 * Percentage value (0-100)
 *
 * @example 50 表示 50%
 */
export type IPercentage = number;

/**
 * 百分比字串（不含符號）
 * Percentage string without symbol
 *
 * @example "50" 表示 50%
 */
export type IPercentageString = string;
```

---

## Base64 與 JSON 型別 或 加密相關

```typescript
/**
 * Base64 字串
 * Base64 string
 */
export type IBase64String = string;

/**
 * JSON 字串
 * JSON string
 */
export type IJSONString = string;
```

---

## 外部 API 型別

```typescript
/**
 * 外部 API 定義的未知類型資料，目前僅接收到回傳 null
 * External API unknown type, currently only receiving null
 */
export type ISegExternalUnknownNull = unknown | null;

/**
 * 外部 API 定義的未知類型資料，目前沒有接收過資料
 * External API unknown type, never received any data (not even null)
 */
export type ISegExternalUnknownNever = unknown;

/**
 * 外部 API 定義的未知類型資料，但可能為數字類型
 * External API unknown type, possibly numeric
 */
export type ISegExternalUnknownNumber = number | null;

/**
 * 外部 API 定義的未知類型資料，但可能為字串類型
 * External API unknown type, possibly string
 */
export type ISegExternalUnknownString = string | null;

/**
 * 外部 API 定義的未知類型資料，但可能為 UUID 類型
 * External API unknown type, possibly UUID
 */
export type ISegExternalUnknownUuid = string | null;

/**
 * 外部 API 定義的未知類型資料，但可能為陣列類型
 * External API unknown type, possibly array
 */
export type ISegExternalUnknownArray<T extends unknown = unknown> = T[] | null;
```

---

## 命名約束

- **一律使用 `I` 開頭**（參考 `typescript-naming-convention`）
- **語意優先於精確**：寧可 `IPercentage = number` 也不要過度約束導致不符實際
- **避免型別爆炸**：只在有價值的場景建立語意化型別
- **文件即型別**：型別名稱本身應能自我解釋，註解補充細節
