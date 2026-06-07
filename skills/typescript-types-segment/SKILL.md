---
name: typescript-types-segment
description: |-
  建立語意化的 TypeScript 型別別名（Semantic Type Aliases）來替代未經約束的原始型別（如 string、number）。
  讓型別系統表達業務語意，提升可讀性與型別安全。
  當使用者提及以下關鍵字或情境時觸發：
  - "語意化型別"、"型別別名"、"type alias"
  - "將 string/number 拆分為有意義的型別"
  - "timestamp 型別"、"日期型別定義"
  - "typescript-types-segment"、"seg-types"
  - "型別重構"、"強化型別安全"
  - "semantic type"、"segmented type"、"primitive obsession"
tags:
  - typescript
  - type-system
  - semantic-types
  - type-aliases
  - code-quality
  - agents/skills
---

# TypeScript Semantic Types | TypeScript 語意化型別

本技能指導如何使用**語意化型別別名（Semantic Type Aliases）**取代籠統的原始型別（`string`、`number`），讓 TypeScript 型別系統表達業務語意、提升可讀性與型別安全。

---

## 核心原則

### 1. 原始型別的語意匱乏

TypeScript 的原始型別（`string`、`number`）僅描述「值的形狀」，無法表達「值的用途」。

```typescript
// ❌ 模糊：無法區分這四個參數的業務差異
function processData(
  userId: string,
  timestamp: number,
  amount: number,
  status: string
): void {}

// ✅ 清晰：型別名稱即文件
function processData(
  userId: IUserId,
  timestamp: ITimestampUnix,
  amount: ICurrencyAmount,
  status: IOrderStatus
): void {}
```

### 2. 型別別名不建立新型別

TypeScript 的 `type` 別名（Type Alias）在編譯後會被完全移除，不會產生runtime overhead，也不會有 nominal typing 的保護。

```typescript
// ITimestampUnix 在編譯後就是 number
// 的好處是語意清晰 + 開發體驗佳
export type ITimestampUnix = number;
```

---

## 命名規範

嚴格遵循專案既有的 TypeScript 命名慣例（參考 `typescript-naming-convention` 規則）：

| 型別種類 | 命名格式 | 範例 |
|---------|---------|------|
| Type Alias | `I{Prefix}{Name}` | `ITimestampUnix`、`IUserId` |
| 聯合型別 | `I{Prefix}{Name}` | `ITimestampUnknown` |
| Template Literal | `I{Prefix}{Name}` | `ITimestampMillisecondsString` |

---

## 何時建立語意化型別

### 建議建立的情況

- **數值有多種單位或格式**：時間戳（秒/毫秒）、貨幣、百分比
- **字串遵循固定格式**：UUID、ISO 8601 日期、Email、Phone
- **數值有語意範圍**：`IUserId`（positive integer）、`IPercentage`（0-100）
- **原始型別在多處重複出現**：消除「魔法數字」與 magic strings
- **外部 API 邊界**：清楚標示 API 輸入輸出

### 不建議建立的情況

- 僅出現一次且語意明確的單次使用
- 過度細分導致型別爆炸（過猶不及）
- 型別本身無法提供額外語意或約束
- 專案內型別與格式已統一，無曖昧空間，不存在多種 timestamp、日期格式等

---

## 建立流程

### 步驟 1：識別原始型別的語意匱乏

搜尋程式碼中模糊的 `string`、`number` 使用：

```typescript
// 待重構的目標
const createdAt: string = ...;
const updatedAt: number = ...;
```

### 步驟 2：確定語意分類

為每個原始型別定義清晰的語意：

| 原始型別 | 語意分類 | 建議型別名稱 |
|---------|---------|------------|
| `number` (Unix timestamp, 10 digits) | 秒級時間戳 | `ITimestampUnix` |
| `number` (milliseconds, 13 digits) | 毫秒時間戳 | `ITimestampMilliseconds` |
| `` `${number}` `` (13 digits string) | 毫秒時間戳字串 | `ITimestampMillisecondsString` |
| `string` (UUID format) | 使用者識別碼 | `IUserId` |
| `string` (ISO 8601 with timezone) | 含時區 ISO 日期 | `IDateISO8601WithTz` |

### 步驟 3：撰寫型別別名與文件

使用**雙語區塊註解**（繁體中文 + English）說明型別用途：

```typescript
/**
 * Unix 時間戳（10 位數，秒）
 * Unix timestamp (10 digits, seconds)
 *
 * @example
 * dayjs().unix() 返回的時間戳
 */
export type ITimestampUnix = number;

/**
 * 毫秒時間戳（13 位數）
 * Millisecond timestamp (13 digits)
 *
 * @example
 * Date.now() 返回的時間戳
 * dayjs().valueOf() 返回的時間戳
 */
export type ITimestampMilliseconds = number;

/**
 * 毫秒時間戳字串（13 位數）
 * Millisecond timestamp string (13 digits)
 */
export type ITimestampMillisecondsString = `${number}`;

/**
 * 時間戳型別（聯合：秒或毫秒）
 * Timestamp type (union: seconds or milliseconds)
 *
 * @deprecated 僅限尚未得知目標格式時使用
 */
export type ITimestampUnknown = ITimestampUnix | ITimestampMilliseconds;
```

---

## Template Literal Types 應用

對於具有**固定格式的字串**，使用 Template Literal Types 進行編譯期約束：

```typescript
/**
 * ISO 8601 完整日期時間（含時區）
 * ISO 8601 full datetime with timezone
 *
 * @example 2024-01-15T10:30:00+08:00
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
 */
export type IDateISO8601Time = `${number}:${number}:${number}`;

/**
 * 包含任意日期的字串，需透過提取函式處理
 * String containing any date, needs extraction function
 */
export type IStringIncludeAnyDate = string;
```

---

## 檔案組織

語意化型別應集中管理於專案的型別目錄中：

```
project/
├── lib/types/
│   ├── seg-types/                 # 語意化型別的主要目錄
│   │   ├── seg.ts                 # 一般語意型別
│   │   ├── seg-timestamp.ts       # 時間相關型別
│   │   └── seg-external.ts        # 外部 API 型別
```

---

## 外部 API 型別處理

對於來自外部 API 且類型不明的資料，建立**語意化外部未知型別**：

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

## 參考資源

詳見：
- [patterns.md](./references/patterns.md) - 常用語意化型別模式完整範例
- [migration.md](./references/migration.md) - 從原始型別遷移至語意化型別的步驟
