---
description: >-
  JavaScript / TypeScript 雙語（繁體中文＋英文）註解格式規範：單行與多行區塊註解排版、
  JSDoc 標籤雙語格式，以及 JS/TS 程式碼情境下的雙語註解實作範例。
  通用雙語標準請參閱 bilingual-standardization-rule。
tags:
  - comments/format
  - documentation/jsdoc
  - documentation/references
---

# 雙語註解格式規範 (Bilingual Comment Format)

> **通用規範 SSoT**：語言順序、彈性捨棄／保留雙語、判定基準、最小必要範圍、譯名不唯一、無意義與特殊意圖雙語、技術術語與多語言保留等**通用規則與兩大最高原則**，一律遵循 [bilingual-standardization-rule](../../bilingual-standardization-rule/SKILL.md)，本文件不重述。
>
> 本文件僅保留適用於 **JavaScript / TypeScript 註解與 JSDoc 格式排版** 的領域專屬雙語規範與範例。

---

## 格式選擇 (Format Options)

在 JS/TS 中撰寫雙語註解時，依註解長度與適用場景選擇單行或多行區塊註解格式：

| 格式 | 適用場景 | 範例 |
|------|----------|------|
| **單行格式** | 簡短說明 | `/** 說明 / Description */` |
| **多行格式** | 詳細說明或翻譯較長時 | `/** 說明\n * Description */` |

## 語言順序與區塊排版 (Language Order & Layout)

雙語順序、假雙語禁止等通用原則見 [bilingual-standardization-rule](../../bilingual-standardization-rule/SKILL.md)。於 JS/TS 註解中的排版形式：

- 單行格式使用 `/` 分隔（前後留空格）
- 多行格式分行書寫，中文段落在前，英文段落在後

```typescript
// ✅ 正確：單行區塊雙語格式
/** 是否成功 / Whether successful */
const isActive = true;

// ✅ 正確：多行區塊雙語格式
/**
 * 取得分組鍵的函式
 * Function to get grouping key
 *
 * @param item - 要分組的元素 / Element to group
 */
getKey?(item: T, index: number, arr: T[]): any

// ❌ 錯誤：假雙語（兩行皆為英文）
/**
 * Process data
 * Process data
 */

// ❌ 錯誤：順序顛倒（英文在前、中文在後）
/**
 * English description / 繁體中文說明
 */
```

---

## JS/TS 註解中的彈性雙語實作 (Flexible Bilingual Application in JS/TS)

彈性捨棄／保留的判定回歸 [bilingual-standardization-rule](../../bilingual-standardization-rule/SKILL.md) 的通用原則。以下為 JS/TS 代碼情境的套用範例：

```typescript
// ✅ 短句已自明，可只保留一種語言
/** 是否啟用 */
const isEnabled = true;

// ✅ 邏輯區塊雙語過長時，選最清晰的語言，避免鏡像直譯使程式碼臃腫
/**
 * 當使用者處於非活躍狀態且訂閱已到期，系統將自動封存帳號並寄送通知信
 */

// ✅ 技術術語仍須保留雙語標註
/**
 * 使用快取 (Cache) 避免重複查詢，並透過聯合型別 (Union Type) 表達多種回傳格式
 */
```

---

## JSDoc 標籤雙語格式 (JSDoc Tags Bilingual Format)

JSDoc 標籤（如 `@param`、`@returns`、`@throws`、`@see` 等）中的描述使用以下標準雙語格式：

- 在 `-` 後面使用 `描述 / Description` 格式
- 中文在前，英文在後，以 `/` 分隔
- 適用於所有 JSDoc 標籤：`@param`、`@returns`、`@throws`、`@see` 等

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
