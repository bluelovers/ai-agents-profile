---
description: >-
  詳細規範雙語（繁體中文＋英文）註解的格式選擇、語言順序與 JSDoc 標籤雙語格式。
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
