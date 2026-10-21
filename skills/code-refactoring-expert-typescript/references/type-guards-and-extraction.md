---
title: 進階型別守衛與萃取：as const satisfies 定義表實作 (Advanced Type-Level Guards & Extraction)
description: >-
  收錄定義表驅動的編譯期型別技法——
  as const satisfies、
  I_Extract* 條件型別抽取器、
  internal/external 雙層介面收斂、
  IPromptOptionValueDefaultKey 鍵名白名單，
  與其 SSoT 意涵、❌/✅ 對照與注意事項
tags:
  - documentation/references
  - refactoring
  - TypeScript
  - type-level
  - as-const-satisfies
---

# 進階型別守衛與萃取：as const satisfies 定義表實作 (Advanced Type-Level Guards & Extraction)

> **用途**：本文件收錄「**定義表（definition table）**」型資料結構所展示的一系列**編譯期型別技法**——從 `as const satisfies` 寫入端檢查、`I_Extract*` 條件型別抽取器、`interface I_PromptOptionDefinition` 內外雙層介面收斂，到 `type IPromptOptionValueDefaultKey` 鍵名白名單——這些技法合起來構成一條完整的**型別鏈**：資料只定義一次，所有下游型別（鍵名、索引鍵、值型別、記錄表）全部由它推導，零手寫、零漂移。

---

## 0. 術語界定：編譯期收斂 vs 執行期 type guard

「type guard」在 TypeScript 有兩個層面的含義，本文件討論的是**前者**：

| 層面 | 名稱 | 形式 | 發生時機 |
|------|------|------|----------|
| **編譯期**（本文件） | Type-Level Guard / Narrowing / Extraction | `satisfies`、條件型別、`Pick` 守衛、索引存取、`Extract` | 編譯期型別檢查與推導，**執行期零成本**（全部擦除） |
| 執行期 | Runtime Type Guard | `function isX(v: unknown): v is X`、`typeof`、`in` | 執行期對未知值做收斂 |

兩者常搭配使用：**執行期守衛負責把 `unknown` 收斂成可信型別；編譯期萃取負責讓「可信型別」本身從單一事實來源自動派生**。本文件聚焦後者。

---

## 1. 型別鏈總覽：一條從定義表出發的推導鏈

定義表本體（唯一的手寫資料來源）：

```typescript
const _promptOptions = [
    {
        key: 'autoRemoveSpace',
        dataDefault: false,
        propDefault: false,
        afterSave: EnumPromptOptionAfterSave.updatePrompt,
        emittedBy: [EnumPromptOptionComponent.phystonPrompt, EnumPromptOptionComponent.promptFormat],
        checkUi: {labelLangKey: 'is_remove_space'},
        note: '…',
    },
    // …其餘選項，順序即 UI 呈現順序
    {
        key: 'autoSplitByPeriodSemicolon',
        // …
        legacyStorageKeys: ['autoSplitByPeriodRemoveWrapComma'],
        checkUi: {labelLangKey: 'is_split_by_period_semicolon', parentKey: 'autoSplitByPeriod'},
    },
] as const satisfies I_PromptOptionDefinition[]
```

由它派生的整條鏈：

| # | 技法 | 型別運算 | 產出（案例符號） |
|---|------|----------|------------------|
| 1 | `as const satisfies T` | 寫入端檢查＋字面值保留 | 定義表本體（鍵值保留為字面聯合） |
| 2 | `typeof arr[number]` | 元素型別推導 | `I_PromptOptionEntry`（單筆選項的精確型別） |
| 3 | 條件型別抽取器 `I_Extract*` | `T extends Pick<…> ? T['f'][number] : never` | `IPromptOptionKeyLegacyStorage`、`IPromptOptionCheckUiLabelLangKey` |
| 4 | 索引存取 | `Entry['key']` | `IPromptOptionKey` |
| 5 | `Extract<keyof T, 白名單>` | 鍵名交集 | `IPromptOptionValueDefaultKey`（`'dataDefault' \| 'propDefault'`） |
| 6 | 放寬／組合 | `\| boolean`、`Record<union, V>`、`A \| B` | `IPromptOptionValue`、`IPromptOptionValueRecord`、`IPromptOptionKeyAndLegacyStorage` |
| 7 | assertion 收斂公開 | `as readonly PublicType[]` | `export const promptOptions` |

**SSoT 意涵（對應主技能六大支柱之六「型別依賴與派生應保留可追溯性」）**：鏈上任一環都不是手寫字面值——新增一筆選項、更名一個舊鍵、補一個 `checkUi`，整條鏈**自動同步**，無需在任何地方維護第二份清單。

---

## 2. 概念逐項拆解

### 2.1 `as const satisfies T`：檢查但不放寬（寫入端守衛）

`satisfies` 回答一個常見兩難：「**既要檢查表達式符合某型別，又要保留它最精確的推導型別**」。

#### ❌ 反模式：型別標註把字面值「放寬」掉

```typescript
// 用型別標註檢查 → 字面值推導被丟棄：
// key 變成 string、emittedBy 變成 EnumPromptOptionComponent[]
// 下游再也無法萃取出精確的字面聯合
const _promptOptions: I_PromptOptionDefinition[] = [ { key: 'autoRemoveSpace', … } ];
//        ^^^ 型別是 I_PromptOptionDefinition[]，'autoRemoveSpace' 已被擦成 string
```

#### ❌ 反模式：`as` 斷開檢查

```typescript
// as 是「告訴編譯器閉嘴」，不是檢查——欄位拼錯、型別不符都不會被發現
const _promptOptions = [ { key: 'autoRemvoeSpace', … } ] as I_PromptOptionDefinition[];
```

#### ✅ 正確：`as const satisfies` —— 檢查與精確推導同時成立

```typescript
const _promptOptions = [ … ] as const satisfies I_PromptOptionDefinition[];
//                       ^^^^^^^^ 字面值保留（key → 'autoRemoveSpace' | … ）
//                                ^^^^^^^^^^^^ 寫入端檢查（漏欄位、型別不符即編譯錯誤）
```

**雙重任務分工：**

- `satisfies I_PromptOptionDefinition[]` → **守衛**：每一筆都必須符合定義介面，選填欄位（`legacyStorageKeys`、`checkUi`）缺漏可選、型別錯誤即擋。
- `as const` → **保留**：陣列變 readonly tuple、屬性變 readonly、字面值不被 widen，下游才能萃取 `'autoRemoveSpace' | 'autoRemoveLastComma' | …`。

> 📌 **注意**：`as const` 產生的是 **readonly** 陣列。若目標介面宣告為可變陣列 `T[]`，依編譯器版本可能需寫成 `satisfies readonly I_…[]`；以專案實際編譯回饋為準。`satisfies` 需 **TypeScript 4.9+**。

---

### 2.2 雙層介面：`I_PromptOptionDefinition`（寫入端）vs `IPromptOptionDefinition`（公開端）

同一份定義表在「**撰寫時**」與「**對外揭露時**」需要兩種寬嚴不同的契約：

| 介面 | 角色 | `key` 型別 | 使用者 |
|------|------|-----------|--------|
| `I_PromptOptionDefinition`（內部） | **撰寫契約**：定義表本體需要的最小欄位結構 | `string`（寬） | `satisfies` 檢查 `_promptOptions` |
| `IPromptOptionDefinition`（`export`） | **公開契約**：收斂後的對外型別 | `IPromptOptionKey`（字面聯合，嚴） | 其他模組引用 |

```typescript
// 內部撰寫契約：結構檢查用，key 為一般 string
interface I_PromptOptionDefinition extends IPromptOptionDefinitionCore {
    key: string
    legacyStorageKeys?: readonly string[]
    checkUi?: I_PromptOptionCheckUi<string, string>
}

// 公開契約：鍵名已收斂為字面聯合
export interface IPromptOptionDefinition extends IPromptOptionDefinitionCore {
    key: IPromptOptionKey                          // ← 從定義表萃取回寫
    legacyStorageKeys?: readonly IPromptOptionKeyLegacyStorage[]
    checkUi?: IPromptOptionCheckUi
}
```

**關鍵手法——匯出處以 assertion 收斂**：

```typescript
// 私有常數保有「精確字面型別」；匯出時以 as 收斂成公開的嚴格型別
export const promptOptions = _promptOptions as readonly IPromptOptionDefinition[]
```

**為什麼要分兩層**：

- 撰寫端寬（`key: string`）→ `satisfies` 只驗結構，不與尚未派生的聯合型別形成**循環依賴**（`IPromptOptionKey` 本身由 `_promptOptions` 推導而來）。
- 公開端嚴（`key: IPromptOptionKey`）→ 消費端拿到的每個鍵名都是字面聯合，`Record<IPromptOptionKey, …>`、`switch`、自動補全全部生效。
- 兩層共用 `extends IPromptOptionDefinitionCore`——**同域共用成員只定義一次**，不因分層而重複。

> 💡 **循環依賴的解法值得記住**：`表 → 萃取型別 → 回寫表的公開介面`看似循環，實際以「私有精確常數 + 匯出 assertion」切斷：推導方向單向（定義表 → 型別），assertion 是最後一道收斂閘門。

> 💡 **`I_` 前綴的命名約定**：`I_` 用來標示「**內部私有**的特殊型別」——撰寫契約（`I_PromptOptionDefinition`、`I_PromptOptionCheckUi`）、抽取器（`I_Extract*`）、元素推導型別（`I_PromptOptionEntry`）皆屬之。此命名標示的是**職位（內部實作契約），而非可見性**——**即使日後因跨檔案使用需求而被 export，也不改動此命名**，以維持「這是內部型別鏈的一環」的語意可辨識性（對照：真正對外的契約使用 `IPrompt*` 命名，如 `IPromptOptionKey`）。

---

### 2.3 `typeof arr[number]`：由常數陣列推導單筆元素型別

```typescript
/** 由常數陣列推導的單筆選項定義型別 */
type I_PromptOptionEntry = typeof _promptOptions[number]
```

- `typeof _promptOptions` → readonly tuple 型別
- `[number]` → 索引存取取「任一元素」的聯合适用型別 = 單筆的精確型別
- 之後所有派生都以 `I_PromptOptionEntry` 為**唯一起點**，不重複描述欄位結構

---

### 2.4 `I_Extract*` 條件型別抽取器：`Pick` 守衛 + `[number]` + `never`

這是本系列最核心的「**編譯期抽取守衛**」：

```typescript
/** 從選項定義抽出 legacyStorageKeys 的字面聯合型別；未定義舊鍵者回傳 never */
type I_ExtractLegacyStorageKeys<T> =
    T extends Pick<I_PromptOptionDefinition, 'legacyStorageKeys'> ? T['legacyStorageKeys'][number] : never

/** 從選項定義抽出 checkUi.labelLangKey 的字面聯合型別；未定義者回傳 never */
type I_ExtractCheckUiLabelLangKey<T> =
    T extends Pick<I_PromptOptionDefinition, 'checkUi'> ? T['checkUi']['labelLangKey'] : never
```

拆解成三個動作：

| 片段 | 作用 | 術語 |
|------|------|------|
| `T extends Pick<I, 'field'>` | **守衛**：該筆定義「有沒有定義這個選填欄位？」 | 條件型別（conditional type）的型別層判斷 |
| `T['field'][number]` | **萃取**：有 → 取欄位值的字面聯合（陣列元素 → `[number]`；物件 → 逐層索引存取） | Indexed Access Type |
| `: never` | **剔除**：沒有 → `never`；在 union 中被自然吸收，不污染結果 | `never` 的聯合吸收性 |

**為什麼要分配式（distributive）**：`T` 是裸型別參數，條件型別對聯合的每個成員逐一判斷——`I_ExtractLegacyStorageKeys<I_PromptOptionEntry>` 等於對「每一筆選項」各自跑一次守衛，再把結果並聯：

```typescript
// 計算過程（概念上）：
//   autoRemoveSpace          → 無 legacyStorageKeys → never
//   autoOptimizeSplitSymbol  → 有 → 'autoSplitByPeriodRemoveWrapComma'
//   其餘無舊鍵者             → never
// 聯合結果：never | 'autoSplitByPeriodRemoveWrapComma' | never …
// never 被吸收 → 'autoSplitByPeriodRemoveWrapComma'
export type IPromptOptionKeyLegacyStorage = I_ExtractLegacyStorageKeys<I_PromptOptionEntry>
```

**下游立即生效**：

```typescript
/** 主鍵與舊鍵的聯合：用於接住後端回傳的完整存檔資料 */
export type IPromptOptionKeyAndLegacyStorage = IPromptOptionKey | IPromptOptionKeyLegacyStorage

export type IPromptOptionValueRecordWithLegacy = Record<IPromptOptionKeyAndLegacyStorage, IPromptOptionValue>
```

- **新增一筆帶 `legacyStorageKeys` 的選項** → 聯合自動多一個成員，`RecordWithLegacy` 自動多一個索引鍵——**無任何手寫清單需要同步**。
- 反模式是手寫 `type LegacyKeys = 'autoSplitByPeriodRemoveWrapComma'`：定義表加了選項卻忘了改這裡，型別就靜默漂移（Type Drift）。

> 💡 **命名慣例**：抽取器以 `I_Extract*` 前綴辨識（`I_` 型別、`Extract` 萃取動詞），與專案的 `I*` / `Enum*` 命名慣例一致，讓「這是型別層工具」一眼可辨。

---

### 2.5 `Extract<keyof T, 白名單>`：鍵名交集守衛

```typescript
/** 可取用的預設值欄位名（'dataDefault' | 'propDefault'） */
export type IPromptOptionValueDefaultKey = Extract<keyof I_PromptOptionEntry, 'dataDefault' | 'propDefault'>
```

- `keyof I_PromptOptionEntry` → 定義表**所有**欄位名的聯合
- `Extract<A, B>` = `A extends B ? A : never` 的語法糖 → 與白名單 `'dataDefault' | 'propDefault'` **取交集**
- 結果：只會是兩個預設值欄位名；日後定義表若新增 `fallbackDefault` 欄位，**除非明確加進白名單，否則不會被誤納入**

**用意：把「魔術字串」升級為「可被錨定驗證的鍵名」。** 若直接寫 `type IPromptOptionValueDefaultKey = 'dataDefault' | 'propDefault'`，這兩個字串與任何魔術字串無異——編譯器無從得知它們是否真的存在於 `I_PromptOptionEntry`。寫進 `Extract<keyof …, …>` 的交集運算後，白名單被**錨定在 `keyof I_PromptOptionEntry` 之上**，明確表達意圖：「這兩個字串**確實是 `I_PromptOptionEntry` 內存在的 key**」。等價寫法還有 `keyof Pick<…>`：

```typescript
// 寫法 A：Extract 交集
export type IPromptOptionValueDefaultKey = Extract<keyof I_PromptOptionEntry, 'dataDefault' | 'propDefault'>

// 寫法 B：Pick 過濾後取鍵——最終編譯結果與寫法 A 相同
export type IPromptOptionValueDefaultKey = keyof Pick<I_PromptOptionEntry, 'dataDefault' | 'propDefault'>
```

**拼錯時的行為差異**（兩種寫法結果相同，但防錯強度不同）：

| 寫法 | 白名單拼錯（如 `'dataDefualt'`）時 | 防錯強度 |
|------|-----------------------------------|----------|
| `keyof Pick<…>` | **直接編譯錯誤**（`Property 'dataDefualt' does not exist …`） | 強——拼錯即擋 |
| `Extract<keyof …, …>` | 該鍵被**靜默過濾**：結果不會出現不存在的定義，但聯合會少一個成員（白名單全拼錯時為 `never`） | 弱——缺漏需人工發現 |

**兩種寫法都不是「完全嚴謹」**——白名單本身仍是手寫字面值，最嚴謹的來源是全取 `keyof` 本身。但相較裸寫 `'a' | 'b'` 聯合，這兩種寫法至少**表明了意圖並把字串錨定在真實鍵名之上**：不會因為打錯字或其他問題，讓 `IPromptOptionValueDefaultKey` 出現**不存在的定義**。

**與 2.4 的差異**：`I_Extract*` 是「**逐筆萃取欄位值**」（鍵存不存在 → 值是什麼），`Extract<keyof …, …>` 是「**欄位名的白名單過濾**」（鍵太多了 → 只要這幾個）。兩者都是編譯期守衛，選型別依語意而定。

---

### 2.6 下游派生：索引存取、放寬、`Record` 組合

```typescript
/** 選項鍵名：同時作為 data 鍵、後端存檔鍵與 v-model 名稱 */
export type IPromptOptionKey = I_PromptOptionEntry['key']          // 索引存取 → 精確字面聯合

/** 選項值型別：以定義的 dataDefault 推導並放寬至 boolean */
export type IPromptOptionValue = I_PromptOptionEntry['dataDefault'] | boolean   // 推導後有意放寬

/** 以 IPromptOptionKey 為索引的鍵值對 */
export type IPromptOptionValueRecord = Record<IPromptOptionKey, IPromptOptionValue>
```

要點：

- **`| boolean` 是刻意放寬，原因在「避免推導結果被當下的資料分布巧合限縮」**：`I_PromptOptionEntry['dataDefault']` 是由定義表的**實際值**推導——若當下所有選項的 `dataDefault` 恰好全是 `false`（或全是 `true`），推導結果會被**限縮為單一字面型別** `false`（或 `true`）。此後任何合法的不同預設值（例如新增一個預設 `true` 的選項）在消費端都**無法被接收**。加上 `| boolean` 確保消費端永遠能接收完整 boolean，不受當下資料分布影響。
- 放寬**發生在派生處、且以推導型別為基底**——不是直接宣告 `value: boolean` 而丟失 `dataDefault` 的推導脈絡；放寬需是有意为之並以註解說明。
- `Record<union, V>` 只要聯合來源是萃取的，索引鍵就永遠與定義表同步。

---

## 3. ❌ 反模式總覽：手寫第二份清單

```typescript
// ❌ 手寫字面聯合——定義表加了選項，這裡不會編譯錯誤，只會靜默過時
export type IPromptOptionKey =
    | 'autoRemoveSpace' | 'autoRemoveLastComma' | 'autoKeepWeightZero' /* …還有哪些？翻定義表才知道 */

// ❌ 手寫舊鍵清單——搬移欄位時最容易漏改
export type IPromptOptionKeyLegacyStorage = 'autoSplitByPeriodRemoveWrapComma';

// ❌ 重複宣告與定義表同結構的介面——欄位一改就 Type Drift
interface IManualEntry { key: string; dataDefault: boolean; /* …逐欄位抄一遍 */ }
```

**三者的共同病徵**：資料已經存在於定義表，卻在型別層再抄一遍。這正是六大支柱之四「**重複的定義必須抽離、不得分散維護**」在型別層的對應——**型別也是 SSoT 的管轄範圍**。

---

## 4. 重構檢查表

| 檢查點 | 操作 |
|--------|------|
| 有一張 `const` 資料表，且需要下游鍵名/索引鍵型別？ | `as const satisfies I_…[]` 寫入端守衛 + `typeof arr[number]` 推導元素型別 |
| 需要從選填欄位萃取字面聯合，且部分筆沒有該欄位？ | `I_Extract*` 條件型別抽取器（`Pick` 守衛 + `[number]` + `never`） |
| 需要「全部欄位名中的某幾個」？ | `Extract<keyof T, 'a' \| 'b'>` 白名單交集 |
| 精確型別 vs 對外契約寬嚴不同？ | 雙層介面（內部寬、公開嚴）＋ 匯出處 `as readonly PublicType` 收斂 |
| 想用型別標註檢查資料表？ | 改用 `satisfies`——標註會放寬字面值，`as` 會斷開檢查 |
| 手寫過任何鍵名/成員聯合？ | 與定義表比對，改為萃取派生，刪除手寫清單 |
| 定義表新增/刪除選項後 | **不需改任何型別**——若發現需要手改，代表鏈上有某處是手寫的，即為修正訊號 |

---

## 5. 注意事項

- `satisfies` 需 **TypeScript 4.9+**；`as const` 陣列為 **readonly**，與可變陣列目標並用時以編譯器回饋為準（必要時 `satisfies readonly I_…[]`）。
- 條件型別抽取器若寫成 `T extends …`（裸型別參數）即為**分配式**——這正是逐筆萃取需要的行為；若需整批判斷，包一層 `[T] extends […]`。
- `I_Extract*` 的守衛欄位**必須對應定義表實際使用的內部介面**（案例為 `I_PromptOptionDefinition`）；改了介面而未同步守衛，守衛會失效（永遠走 `never` 分支）——此處是型別鏈的隱形接點，改動時列入檢查。
- 本系列全屬**編譯期**技法，編譯後完全擦除，執行期零成本；需要對「未知來源資料」做收斂時，仍須另寫執行期 type guard（`value is T`）。

---

## 相關資源

- [主技能文件 code-refactoring-expert-typescript](../SKILL.zh.md) - SSoT 六大支柱與「型別依賴與派生應保留可追溯性」（1.5 類型可追溯性）
- [少用與容易忘記的 TypeScript 術語](./typescript-terminology.md) - `satisfies` 所屬的「官方 Handbook 收錄較晚／易忘語法」家族
- [邊界字串與 Enum 互操作與未知值設計](./enum-boundary-interop.md) - 編譯期萃取與**執行期**守衛（`value is T`）的搭配使用邊界
