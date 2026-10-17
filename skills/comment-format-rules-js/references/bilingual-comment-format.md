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
| **單行格式** | 簡短術語標籤，英文即錨點 | `/** 快取命中率 / Cache Hit Rate */` |
| **多行區塊** | 較長說明，單一語言＋術語錨點 | `/**\n * 以雜湊對應 (Hash Map) 建立分組鍵索引\n */` |

## 語言順序與區塊排版 (Language Order & Layout)

雙語順序、假雙語禁止等通用原則見 [bilingual-standardization-rule](../../bilingual-standardization-rule/SKILL.md)。於 JS/TS 註解中的排版形式：

- 單行術語標籤使用 `/` 分隔（前後留空格），英文即為錨點
- 多行說明可採單一語言（中文）分多行並內嵌術語錨點；若中文行為純中文，亦可加「英文技術術語行」構成雙語多行（英文行須含 `binary search` 等技術術語錨點，而非常見詞直譯）

> 以下為排版語法示範，非主張該句應雙語；實作時仍依判定基準與彈性取捨，短句自明者單語即可。

```typescript
// ✅ 正確：單行術語標籤（英文即錨點）
/** 快取命中率 / Cache Hit Rate */
const cacheHitRate = 0.95;

// ✅ 正確：多行區塊（單語＋內嵌術語錨點）
/**
 * 以雜湊對應 (Hash Map) 建立分組鍵索引，
 * 對不存在的鍵回傳預設值，避免重複計算。
 *
 * @param items - 待分組的項目
 */
function groupBy(items: unknown[]): Map<string, unknown[]>

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

> 以下為排版語法示範，非主張該句應雙語；實作時仍依判定基準與彈性取捨，短句自明者單語即可。

```typescript
/**
 * 以二分搜尋取得排序快取中的目標索引
 * Get target index in sorted cache via binary search
 *
 * @param key - Cache Key
 * @param indexMap - Index Map
 * @returns Target Index, -1 if not found
 * @throws Throws CacheMissError when uninitialized
 */
function lookupIndex(key: string, indexMap: Map<string, number>): number {
    // ...
}
```
