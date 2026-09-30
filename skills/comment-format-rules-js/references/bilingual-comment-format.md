---
description: >-
  詳細規範雙語（繁體中文＋英文）註解的格式選擇、語言順序、彈性捨棄雙語原則
  （含無意義雙語與有特殊意圖的雙語兩個子項目）與 JSDoc 標籤雙語格式。
tags:
  - comments/format
  - documentation/jsdoc
  - documentation/references
---

# 雙語註解格式規範 (Bilingual Comment Format)

當註解需要使用**雙語**（繁體中文 + 英文）時，請遵循以下格式規範。

## 格式選擇

| 格式 | 適用場景 | 範例 |
|------|----------|------|
| **單行格式** | 簡短說明 | `/** 說明 / Description */` |
| **多行格式** | 詳細說明或翻譯較長時 | `/** 說明\n * Description */` |

## 語言順序

- **中文在前，英文在後**
- 使用 `/` 分隔，或分行書寫
- 禁止「英文 + 英文」的假雙語

```typescript
// ✅ 正確：單行格式
/** 是否成功 / Whether successful */
const isActive = true;

// ✅ 正確：多行格式
/**
 * 取得分組鍵的函式
 * Function to get grouping key
 *
 * @param item - 要分組的元素 / Element to group
 */
getKey?(item: T, index: number, arr: T[]): any

// ❌ 錯誤：假雙語（兩行都是英文）
/**
 * Process data
 * Process data
 */

// ❌ 錯誤：英文在前、中文在後（順序顛倒）
/**
 * English description / 繁體中文說明
 */
```

## 彈性捨棄雙語原則 (Flexible Bilingual Omission)

當雙語造成**閱讀障礙**或**內容過長**時，保留最清晰的一種語言即可，無需強制雙語。

**例外：技術術語的雙語標註仍應保留**（如 `聯合類型 (Union Type)`、`快取 (Cache)`）。

| 情境 | 建議做法 |
|------|---------|
| 短句、術語名稱已自明 | 可省略另一語言 |
| 雙語合併後超過一行或內容過長且可讀性下降 | 選擇最清晰的語言，捨棄另一語言 |
| 技術術語首次出現 | **必須保留雙語標註**，格式：`中文 (Term)` |
| 已有完整雙語 | 保留，不主動刪除 |

```typescript
// ✅ 短句已自明，可只保留一種語言
/** 是否啟用 */
const isEnabled = true;

// ✅ 雙語過長時，選最清晰的語言
/**
 * 當使用者處於非活躍狀態且訂閱已到期，系統將自動封存帳號並寄送通知信
 */

// ✅ 技術術語仍須保留雙語
/**
 * 使用快取 (Cache) 避免重複查詢，並透過聯合類型 (Union Type) 表達多種回傳格式
 */
```

### 無意義雙語（可捨棄）

同時滿足下列三個條件時，雙語**無意義**，只需保留一種語言：

| 條件 | 說明 |
|------|------|
| **無歧義** | 中英語意完全相同，不會因語言不同而產生不同解讀 |
| **無技術術語** | 不含需要保留原文比對的技術術語 |
| **無搜尋比對問題** | 保留一種語言即可滿足以關鍵字搜尋、比對程式碼的需求 |

常見的無意義雙語：

| 範例 | 處理方式 |
|------|---------|
| `程式碼 / Code` | 二擇一保留 |
| `問題點 / Problem` | 二擇一保留 |
| `正確做法 / Correct fix` | 二擇一保留 |

```typescript
// ❌ 錯誤：無意義雙語（無歧義、無技術術語、無搜尋比對問題）
/** 程式碼 / Code */

// ✅ 正確：二擇一保留
/** 問題點 */
/** 正確做法 */
```

### 子項目二：有特殊意圖的雙語（不可捨棄）

當中英詞彙**彼此不對應**——「中文」不會被翻譯為「英文」，「英文」也不會被翻譯為「中文」時，
雙語為**必要**：便於理解另一語言的讀者，也便於以任一語言搜尋比對。

```typescript
// ✅ 必須雙語：「增益」不會被翻譯為 up，up 也不會被翻譯為「增益」
/** 增益前綴 / Up prefix */

// ✅ 同理，保留雙語以利理解與雙向搜尋
/** 增益 / Gain */
/** 前綴 / Prefix */
```

## JSDoc 標籤雙語格式

JSDoc 標籤（如 `@param`、`@returns`、`@throws` 等）中的描述也可以使用雙語格式：

```typescript
/**
 * 取得使用者資料
 * Get user data
 *
 * @param userId - 使用者識別碼 / User identifier
 * @param options - 選項配置 / Options configuration
 * @returns 使用者資料 / User data
 * @throws 當使用者不存在時拋出錯誤 / Throws error when user not found
 */
function getUserData(userId: string, options?: GetUserOptions): UserData {
    // ...
}
```

**格式說明：**
- 在 `-` 後面使用 `描述 / Description` 格式
- 中文在前，英文在後，使用 `/` 分隔
- 適用於所有 JSDoc 標籤： `@param`、`@returns`、`@throws`、`@see` 等
