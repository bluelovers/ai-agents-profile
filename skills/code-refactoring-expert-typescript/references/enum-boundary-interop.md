---
title: 邊界字串與 Enum 互操作與未知值設計（§3 特殊意圖豁免完整內容）
description: 外部值集合的特殊意圖豁免完整內容：Enum 派生字串聯合（ITSTypeAndStringLiteral）、邊界 as Enum 轉型與執行期守衛、未公開（逆向建立）API 的未知值設計，以及 ❌/✅ 對照範例與約束
tags:
  - documentation/references
  - refactoring
  - TypeScript
  - enum
  - type-safety
---

# 邊界字串與 Enum 互操作與未知值設計（§3 特殊意圖豁免完整內容）

> 本文自 SKILL **§3 嚴格類型控制**抽離，收納「特殊意圖豁免」的**完整內容**：兩種邊界互操作技法（Enum 派生字串聯合、邊界 `as Enum` 轉型）、外部持有／未公開值集合的未知值設計，以及 ❌/✅ 對照範例與約束。

---

## 適用情境與前提

主技能 §3 的硬性規則為：**除非有特殊意圖，否則不得使用魔術字串與字串聯合**。本文是該豁免的完整展開，適用於特殊意圖確實成立的情境：

- 元件 prop 必須接受呼叫端傳入的裸字串（如 `<PromptOption component="phystonPrompt" />`）
- 解析設定檔、查詢參數等外部輸入
- 對應第三方、未公開（逆向建立）API 的回應資料

**共同前提：Enum 是值集合的唯一單一事實來源。** 外部字串只能在**邊界**協調，絕不手寫一份平行的 `'a' | 'b'` 清單。

**技法與宣告形式彼此獨立**——不論採用哪一種技法，都不限定 `const enum` 或 `enum`。

---

## 技法 1：Enum 派生字串聯合（`ITSTypeAndStringLiteral`）

公開型別宣告為**由 Enum 派生**的聯合——字面值清單只存在於 Enum 內部：

```typescript
import type { ITSTypeAndStringLiteral } from 'ts-type'

export const enum EnumPromptOptionComponent {
    phystonPrompt = 'phystonPrompt',
    promptFormat = 'promptFormat',
}

/**
 * 對外 prop 型別 - 由 Enum 派生，同時接受 Enum 成員與對應的裸字串
 */
export type IPromptOptionComponent = ITSTypeAndStringLiteral<EnumPromptOptionComponent>
// = EnumPromptOptionComponent | `${EnumPromptOptionComponent}`
// = EnumPromptOptionComponent | 'phystonPrompt' | 'promptFormat'
// 無依賴的原生寫法：EnumPromptOptionComponent | `${EnumPromptOptionComponent}`
```

**`ITSTypeAndStringLiteral` 的實際展開**（`ts-type` 原始定義）：

```typescript
export type ITSTypeAndStringLiteral<T extends ITSToStringLiteralAllowedType> = T | ITSToStringLiteral<T>;
// 對字串 Enum 即：T | `${T}`
```

**收益：**

- 外部呼叫端可傳 `'phystonPrompt'`；內部實作一律使用 `EnumPromptOptionComponent.phystonPrompt`——互操作與型別安全同時成立。
- Enum 成員新增或更名時自動傳播至聯合；不存在第二份手寫維護、可能漂移的 `'a' | 'b'` 清單。

---

## 技法 2：邊界 `as Enum` 轉型

技法 1 與技法 2 只是「語法與可接受的值範圍」不同——**本質上都是同一個 Enum**，沒有互斥關係，兩者可共存一起使用（例如：對外 prop 型別採技法 1 的派生聯合，邊界解析採技法 2 的守衛＋cast）。

在信任邊界將外部 `string` 收斂為 Enum。輸入非完全可信時，`as` 轉型必須搭配執行期型別守衛：

```typescript
// 以專案既有的驗證來源判斷是否為合法成員
declare function isPromptOptionComponent(value: unknown): value is EnumPromptOptionComponent;

// 可信邊界（自家模組產生的字串）：單次 cast 可接受
const component = rawString as EnumPromptOptionComponent;

// 不可信邊界（使用者輸入、API 資料）：先驗證——守衛會收窄型別，
// 下游取得的即是真正的 EnumPromptOptionComponent
const resolved = isPromptOptionComponent(rawInput)
    ? rawInput
    : EnumPromptOptionComponent.phystonPrompt;
```

---

## `Object.values` 的可用性只取決於宣告形式

`Object.values` 是**執行期操作**：能不能用，只看該 Enum 在執行期有沒有真實物件。限制完全來自 `const enum` 與 `enum` 的宣告形式差異：

| 場景 | `Object.values` | 說明 |
|------|-----------------|------|
| 一般 `enum`（專案內部或依賴皆可） | ✅ 可用 | 編譯後即為真實的執行期物件 |
| `const enum`：專案內部自行宣告 ＋ 自身編譯啟用 `preserveConstEnums` | ✅ 可用 | **只限定內部才能做到**——`preserveConstEnums` 是「宣告它的專案自己的編譯選項」，由自己的編譯產出保留執行期物件 |
| `const enum`：從依賴引用（不論依賴端或你這端有無 `preserveConstEnums`） | ❌ 不可用 | 依賴端的產出不受你的編譯選項控制；依賴 d.ts 中的 ambient `const enum` 沒有可枚舉的執行期實體。不論有沒有 `preserveConstEnums`，都無法對其使用 `Object.values` |

> ⚠️ **結論**：需要 `Object.values` 等執行期枚舉時，優先使用一般 `enum` 宣告；`const enum` 的執行期枚舉能力**僅存在於「專案內部自行宣告 ＋ 自身啟用 `preserveConstEnums`」**，此能力無法延伸到從依賴引用的情況。

---

## 未知值屬於契約的一部分：外部持有／未公開的值集合

當值集合由第三方持有且無法完整得知——未公開（逆向建立）API 的回應、webhook、使用者提供的設定——**設計上必須假設未知值存在**。無論採用上方哪一種 enum 技法皆同：

1. **設計層級：未知值仍被視為 Enum。** 邊界解析函式將任意字串收進 Enum 型別，而非讓 `string` 洩漏進業務邏輯——即使不是已知成員，Enum 尚未認識的值在型別層級仍*被視為* enum 成員。
2. **實作層級：每個消費點都必須保留未知值的相容分支**——`switch` 保留 `default:`、查表使用 `?.` + `??` fallback、`if/else` 鏈保留最終 `else`。
3. **絕不假設集合是封閉的。** 新出現的未公開值必須優雅降級（原樣傳遞、顯示「未知」標籤、記錄日誌）——絕不 crash，也絕不靜默落入錯誤的已知分支。

### ❌ 反模式：假設集合封閉

```typescript
/**
 * 未公開（逆向建立）API 的欄位格式 - 隨時可能出現新值
 */
export enum EnumFieldFormat {
    Text = 'text',
    Number = 'number',
    RichText = 'richText',
}

// 假設集合封閉——未公開的新值成為未定義行為
function labelOfClosed(format: EnumFieldFormat): string {
    switch (format) {
        case EnumFieldFormat.Text: return '文字';
        case EnumFieldFormat.Number: return '數字';
        case EnumFieldFormat.RichText: return '富文字';
        // 無 `default`：'markdown' 落入無回傳值的未定義行為
    }
}
```

### ✅ 正確：設計視為 Enum + 實作保留未知值分支

```typescript
/**
 * 解析欄位格式 - 未知值一律收斂進 EnumFieldFormat
 * （設計上視為 enum）；每個消費點必須保留未知值分支
 */
export function parseFieldFormat(raw: unknown): EnumFieldFormat {
    return typeof raw === 'string'
        ? (raw as EnumFieldFormat) // ✅ 未曾見過的 'markdown' 在此進入 enum 型別空間
        : EnumFieldFormat.Text;
}

// 每個 switch 保留未知值的 default
function labelOf(format: EnumFieldFormat): string {
    switch (format) {
        case EnumFieldFormat.Text: return '文字';
        case EnumFieldFormat.Number: return '數字';
        case EnumFieldFormat.RichText: return '富文字';
        default: return String(format); // 未知格式：原樣傳遞／「未知」標籤／記錄日誌
    }
}

// 查表同理：Partial + fallback，未曾見過的 key 不得 crash
export const FIELD_FORMAT_LABELS: Partial<Record<EnumFieldFormat, string>> = {
    [EnumFieldFormat.Text]: '文字',
    [EnumFieldFormat.Number]: '數字',
    [EnumFieldFormat.RichText]: '富文字',
};
const label = FIELD_FORMAT_LABELS[format] ?? String(format);
```

> 📌 **窮舉 `switch` + `never` 斷言是「封閉集合」技法**——僅適用於成員完全由自己掌控的業務自有有限集合。用於外部持有的值集合，會讓上游每一次新增值都變成執行期 crash；此處必須保留 `default` fallback。

---

## 約束速查

| 約束 | 說明 |
|------|------|
| **絕不手寫字面值聯合清單** | 值集合只存在於 Enum；聯合一律經派生（`` `${Enum}` `` / `ITSTypeAndStringLiteral`）或 cast 取得，不得逐一拼寫 |
| **`as Enum` 只能留在邊界** | parse/adapter/props 預設值等邊界處；絕不進入業務邏輯中段——彼時值早已應是 Enum |
| **不可信輸入先經執行期守衛** | 使用者輸入、API 資料必須先以 type guard 驗證再收窄，不得盲目 cast |
| **技法不限定宣告形式** | 不論技法 1 或技法 2，皆不限定 `const enum` 或 `enum`，兩種宣告形式的結果相同 |
| **`Object.values` 只關宣告形式** | 一般 `enum` 皆可枚舉；`const enum` 僅「專案內部自行宣告 ＋ 自身啟用 `preserveConstEnums`」可行，從依賴引用的不論有無 `preserveConstEnums` 皆不可用（見〈`Object.values` 的可用性只取決於宣告形式〉） |
| **外部值集合必須保留未知值分支** | `switch` 的 `default:`、查表 `??` fallback、最終 `else`；窮舉 `switch` + `never` 斷言僅限封閉集合 |

---

## 相關章節

- 主技能 §3「硬性規則：除非有特殊意圖，否則不得使用魔術字串與字串聯合」
- [狀態鍵 Enum 遷移案例](./status-key-enum-migration.md) —— 遷移後比對值必須一併更新至 Enum 成員
