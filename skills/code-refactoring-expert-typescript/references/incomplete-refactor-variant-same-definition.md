---
tags:
  - documentation/references
  - refactoring
  - TypeScript
  - single-source-of-truth
  - type-drift
  - anti-pattern
---

# 重構不完整與變體：辨識「同源」定義 (Incomplete Refactoring & Variants: Recognizing Same-Source Definitions)

當重構不完整或存在變體時，兩個其實**同源**的定義容易被誤判為**不同定義**。本案例彙整三類常見情形：原始 `string` 與 `Enum` 被當作不同、optional 與 required 被當作不同、以及命名/拼寫變體（如 `maxsp` vs `maxSp`）被當作不同。它們的共同代價：同一個概念在型別系統裡分裂成多份，滋生 Type Drift 與重複維護。

When refactoring is incomplete or variants exist, two definitions that are actually **same-source** are easily mistaken for **different definitions**. This case collects three common situations: raw `string` vs `Enum` treated as different, optional vs required treated as different, and naming/spelling variants (e.g., `maxsp` vs `maxSp`) treated as different. The shared cost: one concept splits into multiple type-system copies, breeding Type Drift and duplicate maintenance.

---

## Case A — 原始 `string` 與 `Enum` 不是不同定義（target spec）

### 程式碼

```typescript
export type ITargetSpec = [
    type: EnumTargetType,
    method: EnumTargetMethod,
    count: number,
];

export interface IRawSkillYaml
{
    target?: [type: string, method: string, count: number];
}

export interface ISkillDef
{
    target?: ITargetSpec;
}
```

### 檢查實務邏輯

不能因為**檔案讀取邏輯的限制**（為了相容性）而把 API 規範為 `string`，就認為「值」與 `Enum` 是**不同定義**。原始 YAML 解析只能給出 `string`，但 `string` 與 `EnumTargetType` 在**領域上相等**——`"phys"` 與 `EnumTargetType.PHYSICAL` 是同一件事。

You must not conclude that the *value* and the `Enum` are **different definitions** merely because the **file-parsing layer** (for compatibility) types the raw API as `string`. A raw YAML parse can only yield `string`, but `string` and `EnumTargetType` are **equal in domain** — `"phys"` and `EnumTargetType.PHYSICAL` are the same thing.

### 正確做法

實務邏輯內，應以 `type as EnumTargetType` 將原始 `string` **收納（正規化）**到 enum 單一來源，並**吸收未知或缺漏的值**；若使用 `switch/case`，應**保留 `default`** 判斷以涵蓋未預期的字串。

```typescript
// ✅ 解析/正規化層：把 raw string 收斂到 enum 單一來源，而非把 IRawSkillYaml 與 ISkillDef 視為兩個獨立領域
function toTargetSpec(raw: [string, string, number] | undefined): ITargetSpec | undefined
{
    if (!raw) return undefined;
    const [type, method, count] = raw;
    return [
        type as EnumTargetType,     // 收納未知/缺漏
        method as EnumTargetMethod,
        count,
    ];
}

// switch/case 保留 default 以涵蓋未預期字串
switch (target.type) {
    case EnumTargetType.Enemy: /* ... */ break;
    // ...
    default: /* 未知/缺漏值的處理 */ break;
}
```

> 關鍵：不應為了「raw 是 string、def 是 enum」就在消費端把兩者當作兩個領域各自處理；那正是把同源概念拆成兩份，正是 Type Drift 的來源。

#### Case A 變體：不同欄位名 `who` 搭配 raw `string` 元組

```typescript
// 另一處原始定義：欄位名是 `who` 而非 `target`，元素仍是 raw string
export interface IRawCastYaml
{
    who?: [string, string, number];
}

// 領域上仍等於 ITargetSpec（type, method, count），只是命名與型別寬鬆
export type ITargetSpec = [
    type: EnumTargetType,
    method: EnumTargetMethod,
    count: number,
];
```

**檢查重點**: 即使欄位名從 `target` 變成 `who`、元素仍是 `string`，只要**領域語意相等**（同樣是「對象類型 / 方法 / 數量」三元組），就**不是不同定義**。`who` 與 `target` 只是同一個概念的命名變體，不應因此被當作兩個獨立領域各自處理。

**正確做法**: 同 Case A——在正規化層以 `as Enum` 收納，並在 `switch/case` 保留 `default`：

```typescript
function toTargetSpecFromWho(raw: [string, string, number] | undefined): ITargetSpec | undefined
{
    if (!raw) return undefined;
    const [type, method, count] = raw;
    return [type as EnumTargetType, method as EnumTargetMethod, count];
}
```

> 重點：欄位名稱差異（`target` vs `who`）與元素型別寬鬆（`string` vs `Enum`）都是「表面」差異；判斷是否同源要看**領域語意**，而非名稱或宣告型別。

---

## Case B — optional 與 required 同源（`hp?` vs `hp`）

### 程式碼

```typescript
export interface IStatsHpSpA
{
    hp?: number;
    sp?: number;
}

export interface IStatsHpSpB
{
    hp: number;
    sp: number;
}
```

### 問題點

這兩個介面**本質上同源**——同一組欄位，只是選用性不同（`A` 全可選、`B` 全必填）。若各自獨立定義，當欄位增減時兩邊必須手動同步，正是 Data Clumps / Type Drift。

### 正確做法

在其中一方使用 `Required` / `Partial` / `Pick` **衍生**，而非各自定義：

```typescript
// ✅ 以其中一方為權威，另一方用工具型別衍生
export interface IStatsHpSpA
{
    hp?: number;
    sp?: number;
}

export type IStatsHpSpB = Required<IStatsHpSpA>;   // 必填版本
// 或反向：以 B 為權威，A = Partial<IStatsHpSpB>
```

---

## Case C — 命名/拼寫變體（`maxsp` vs `maxSp`）

### 程式碼 / Code

```typescript
export interface IStatsHpSpMaxA
{
    maxsp: number;
}

export interface IStatsHpSpMaxB
{
    maxSp: number;
}
```

### 檢查邏輯

這**可能是同源**（同一個「最大 SP」欄位，只是命名風格不同），也**可能是不同實作導致的變體**。必須先判斷：

- 是否為**刻意設計的差異**（兩者真的語意不同，例如一個是「當前最大 SP」、一個是「基礎最大 SP」）？
- 或屬於**錯字 / 變體**（只是 `maxsp` 與 `maxSp` 的拼寫/大小寫差異）？

並據此判斷：**是否可以安全更名，消除因命名/拼寫不同而導致的混亂**。

### 正確做法

- 若確認**同源**（只是拼寫變體）：**安全更名統一**為單一名稱（如統一 `maxSp`），消除歧義。
- 若確認是**刻意差異**：保留兩者，但加註解明確說明語意差異，避免日後被誤併。

> 此案例僅代表**簡單的大小寫拼寫差異**；實務上變體名稱有各種形式（前綴/後綴、`maxSp`/`max_sp`/`MaxSP`/`spMax`、縮寫 vs 全名……）。辨識原則不變：**先確認是否同源，再決定衍生/更名/或保留並註解**。

---

## 總結檢查清單

- [ ] 是否存在「raw `string` 與 `Enum`」被當作兩個領域各自處理？應在正規化層以 `as Enum` 收納，並在 switch 保留 `default`。（Case A）
- [ ] 是否存在 optional 與 required 的同組欄位被各自定義？應以 `Required` / `Partial` / `Pick` 衍生。（Case B）
- [ ] 是否存在命名/拼寫變體（如 `maxsp` vs `maxSp`）？先判斷同源或刻意差異，再決定更名統一或保留並註解。（Case C）
- [ ] 是否因為「讀取層限制」而誤判兩個定義為不同？領域相等即應統一為單一來源。
- [ ] 最終是否讓「同一個概念」在型別系統中只存在一份權威定義（或其衍生）？

> 這三類問題是本技能 **規範 A（同領域型別優先繼承/組合，勿各自定義）**、**規範 G（偵測跨型別共享成員，提早抽離）** 與 **Primitive Obsession / Type Drift** 防衛的實務體現：重構不完整或出現變體時，先確認「是否其實同源」，再決定衍生、更名或正規化，而非放任它們被當作不同定義各自維護。
