---
tags:
  - documentation/references
  - enum
  - refactoring
  - TypeScript
  - complete-refactoring
---

# 狀態鍵 Enum 遷移案例 (Status Key Enum Migration Case Study)

本案例展示將字串字面值常數遷移為 Enum 時，如何**一併更新所有執行期使用位置**（比對值、樣板字串 fallback、物件值），避免「半吊子重構」。來源為實際遊戲專案 `status-key.ts` 的重構 patch。

This case demonstrates, when migrating string-literal constants to an Enum, how to **update every runtime usage site** (comparison values, template-literal fallbacks, object values) together — avoiding "half-refactoring". Sourced from a real refactor patch of `status-key.ts` in a game project.

---

## 問題背景

原始程式碼使用 `as const` 字串字面值常數作為「前綴」來組合狀態鍵名：

```typescript
// ❌ 舊：字串字面值常數（名為常數，實則非 Enum，無 IDE 重構/反查支援）
/** 增益前綴 / Up prefix */
export const STATUS_UP_PREFIX = 'Up' as const;
/** 減益前綴 / Down prefix */
export const STATUS_DOWN_PREFIX = 'Down' as const;
/** 永久加成前綴 / Plus prefix */
export const STATUS_PLUS_PREFIX = 'Plus' as const;
/** 補正欄位前綴 / Compensation field prefix */
export const COMP_PREFIX = 'P_' as const;

// 這些常數在執行期被拼接進鍵名（含 ?? fallback 分支）
export function getUpKey(key: EnumStatusAttr): string {
    return STATUS_UP_KEY_NAME[key as keyof typeof STATUS_UP_KEY_NAME] ?? `${STATUS_UP_PREFIX}${key}`;
}

export function getCompFieldName(key: string): string {
    return BASE_STAT_COMP_NAMES[key as keyof typeof BASE_STAT_COMP_NAMES]?.comp ?? `${COMP_PREFIX}${key.toUpperCase()}`;
}
```

### 為什麼這是壞味道 (Why this is a smell)

| 問題 | 說明 |
|------|------|
| 非真正 Enum | `as const` 常數只是字串別名，無法被 IDE 反查引用、重新命名不會自動傳播 |
| 執行期比對值散落 | 前綴被拼進 `??` fallback 與樣板字串，遷移時極易遺漏 |
| 參數型別過寬 | `getCompFieldName(key: string)` 接受任意字串，失去編譯期保護 |

#### 對照表 value 型別為 `string`：顯式型別標註讓 `as const` 失效

原始對照表以 `Record<EnumStatusAttr, string>` / `Record<string, string>` 宣告，value（甚至 key）為 `string`：

```typescript
// ❌ 舊：value 為 string，且末尾的 as const 被顯式 Record<..., string> 標註覆寫，完全失效
export const STATUS_UP_KEY_NAME: Record<EnumStatusAttr, string> = {
    [EnumStatusAttr.STR]: 'UpSTR',
    // ...
} as const;

// ❌ 舊：連 key 都退為 string，失去對屬性名稱的約束
export const BASE_STAT_COMP_NAMES: Record<string, { battle: string; comp: string }> = {
    // ...
} as const;
```

| 問題 | 說明 |
|------|------|
| `as const` 被顯式型別標註覆寫 | `Record<EnumStatusAttr, string>` 已把 value 宣告為 `string`，末尾的 `as const` 無法再把 `'UpSTR'` 收窄為字面量——等於無效裝飾，型別安全形同虛設 |
| 抹除字面量型別（破壞型別安全） | 讀取 `STATUS_UP_KEY_NAME[EnumStatusAttr.STR]` 得到 `string`，呼叫端無法區分 `'UpSTR'` / `'DownSTR'`，拼錯也不報錯 |
| 破壞 SSoT | 合法鍵名集合（字面量聯集）被擦除成 `string`，事實來源脫鉤 |
| `Record<string, string>` 更甚 | 連 key 都退化為 `string`，連「屬性名稱」這一層約束都失去 |

> ⚠️ **原則**：問題**不在 `as const` 本身**，而在 `Record<X, string>` / `Record<string, ...>` 把 value（甚至 key）標註為 `string`，把字面量加寬為 `string`，**使 `as const` 被顯式型別標註覆寫而失效**。應保留 `as const` 的精確收窄能力，並以下列三種方式之一處理：

#### ✅ 三種正確處理方式

```typescript
// 處理方式 1：移除 Record<..., string> 標註，保留 as const
// value 保有字面量型別（如 'UpSTR'），不再被 string 加寬
export const STATUS_UP_KEY_NAME = {
    [EnumStatusAttr.STR]: 'UpSTR',
    // ...
} as const;

// 處理方式 2：保留 as const，並以 satisfies 在「不破壞字面量收窄」的前提下驗證型別
export const STATUS_UP_KEY_NAME = {
    [EnumStatusAttr.STR]: 'UpSTR',
    // ...
} as const satisfies ITSStringLiteralPrefixedRecord<EnumStatusAttr, EnumStatusPrefix.Up>;

// 處理方式 3：把 Record<EnumStatusAttr, string> 改為精確型別 ITSStringLiteralPrefixedRecord
// 顯式型別已提供字面量精度，as const 可省略（亦可保留）
export const STATUS_UP_KEY_NAME: ITSStringLiteralPrefixedRecord<EnumStatusAttr, EnumStatusPrefix.Up> = {
    [EnumStatusAttr.STR]: 'UpSTR',
    // ...
};
```

| 方式 | 做法 | 效果 |
|------|------|------|
| 1. 移除 `Record<string>` | 刪除 `Record<X, string>` 標註，保留 `as const` | 值保有字面量型別，`as const` 正常發揮收窄作用 |
| 2. `as const` + `satisfies` | 保留 `as const`，附加 `satisfies ITSStringLiteralPrefixedRecord<...>` | 既驗證型別，又不破壞字面量收窄 |
| 3. `Record<string>` → `ITSStringLiteralPrefixedRecord` | 把加寬的 `string` 改為精確樣板字串型別 | 顯式精確型別，`as const` 可省略 |

> 💡 本案例的 patch 採用方式 3 的變體：以 `_buildStatRecord` 泛型輔助函式**推導** `ITSStringLiteralPrefixedRecord<Name, Prefix>`，從根本消除手寫字面量（見第二層）。

---

## 解決方案：Enum + 全站點更新

### 第一層：以 Enum 取代字串常數

```typescript
// ✅ 正確：以 Enum 定義前綴，取得 IDE 重構/反查/編譯期保護
export enum EnumStatusPrefix {
    /** 增益前綴 / Up prefix */
    Up = 'Up',
    /** 減益前綴 / Down prefix */
    Down = 'Down',
    /** 永久加成前綴 / Plus prefix */
    Plus = 'Plus',
    /** 補正欄位前綴 / Compensation field prefix */
    Comp = 'P_',
}
```

### 第二層：以 `_buildStatRecord` 由 Enum 推導鍵名對照（SSoT + 精確型別）

原始程式碼以**三份手寫字面量物件**定義鍵名對照，每份含 10 個條目，再加上三個 `Object.values(...)` 陣列：

```typescript
// ❌ 舊：三份手寫字面量物件（共 30+ 條目），任一拼錯編譯期都不會發現
export const STATUS_UP_KEY_NAME: Record<EnumStatusAttr, string> = {
    [EnumStatusAttr.STR]: 'UpSTR',
    [EnumStatusAttr.INT]: 'UpINT',
    // ... 其餘 8 條
};
export const STATUS_DOWN_KEY_NAME: Record<EnumStatusAttr, string> = { /* 'DownSTR' ... */ };
export const STATUS_PLUS_KEY_NAME: Record<EnumStatusAttr, string> = { /* 'PlusSTR' ... */ };
export const STATUS_UP_KEYS = Object.values(STATUS_UP_KEY_NAME) as string[];
// ...
```

這些鍵名本質上都是「`前綴 + EnumStatusAttr`」的組合，卻被**重複寫死成字串**，違反 SSoT 且極易拼錯。重構以一個泛型輔助函式 `_buildStatRecord` 由 Enum 成員**推導**而來：

These key names are all `"prefix + EnumStatusAttr"` combinations, yet were **duplicated as hard-coded strings**, violating SSoT and prone to typos. The refactor derives them via a generic helper `_buildStatRecord` from the Enum members:

```typescript
// ✅ 由 Enum 成員推導：前綴來自 EnumStatusPrefix，名稱來自 EnumStatusAttr
function _buildStatRecord<Name extends string, Prefix extends ITSTemplateLiteralAllowedType>(prefix: Prefix, names: Name[])
{
    const attrs: ITSStringLiteralPrefixed<K, Prefix>[] = [];
    const record: ITSStringLiteralPrefixedRecord<Name, Prefix> = {} as any; // 內部逃逸：建構期型別較複雜
    for (const name of names) {
        const attr = `${prefix}${name}` as const;
        attrs.push(attr);
        record[name] = attr;
    }
    return { record, attrs };
}

const STATUS_LIST = Object.values(EnumStatusAttr);

// 三個呼叫點取代 30+ 條手寫字面量
export const {
    record: STATUS_UP_KEY_NAME,
    attrs: STATUS_UP_KEYS,
} = _buildStatRecord(EnumStatusPrefix.Up, STATUS_LIST);

export const {
    record: STATUS_DOWN_KEY_NAME,
    attrs: STATUS_DOWN_KEYS,
} = _buildStatRecord(EnumStatusPrefix.Down, STATUS_LIST);

export const {
    record: STATUS_PLUS_KEY_NAME,
    attrs: STATUS_PLUS_KEYS,
} = _buildStatRecord(EnumStatusPrefix.Plus, STATUS_LIST);
```

#### 為什麼使用 `_buildStatRecord`（設計意圖）

| 理由 | 說明 |
|------|------|
| 維護單一事實來源 (SSoT) | 鍵名不再手寫，而是由 `EnumStatusPrefix` + `EnumStatusAttr` 兩個 Enum **推導**；日後新增 `EnumStatusAttr` 成員，三份對照表自動同步，無需手動補 30 行 |
| 消除重複 (DRY) | 一份泛型函式 + 三個呼叫點，取代 30+ 條重複字面量，降低拼寫錯誤溫床 |
| 精確樣板字串型別 | 回傳型別使用 `ts-type` 的 `ITSStringLiteralPrefixed<K, Prefix>` 與 `ITSStringLiteralPrefixedRecord<Name, Prefix>`，推導出**字面量聯集**（如 `'UpSTR' \| 'UpINT' \| ...`）而非 `string[]`，呼叫端獲得編譯期保護 |
| 連帶避免 `: string` 退化 | 推導出的 `attrs` 是精確字面量陣列，呼應第四層「回傳型別不可退化為 `string`」的原則，型別安全由 Enum 一路貫穿到使用端 |

> 💡 **內部 `as any` 逃逸說明**：`record` 在建構期因動態寫入鍵值，型別較難表達，故以 `{} as any` 在輔助函式**內部**暫時逃逸；但對外的回傳型別 `ITSStringLiteralPrefixedRecord<Name, Prefix>` 仍是精確型別，污染被限制在函式內部，不會外洩到呼叫端。

### 第三層：更新每一個執行期使用位置

關鍵：**不只是改宣告，連 `??` fallback 與樣板字串都改用 Enum 成員**。

```typescript
// ✅ getUpKey：fallback 拼接改用 EnumStatusPrefix.Up
export function getUpKey(key: EnumStatusAttr) {
    return STATUS_UP_KEY_NAME[key] ?? `${EnumStatusPrefix.Up}${key}`;
}

// ✅ getCompFieldName：
//   1) 參數型別由 string 收斂為 keyof typeof BASE_STAT_COMP_NAMES
//   2) fallback 拼接改用 EnumStatusPrefix.Comp
export function getCompFieldName(key: keyof typeof BASE_STAT_COMP_NAMES) {
    return BASE_STAT_COMP_NAMES[key]?.comp ?? `${EnumStatusPrefix.Comp}${key.toUpperCase()}`;
}
```

### 第四層：物件值也改用 Enum 成員

`BASE_STAT_COMP_NAMES` 中的值同步由原始字串改為 Enum 引用：

```typescript
// ✅ 修正前：battle / comp 皆為原始字串
export const BASE_STAT_COMP_NAMES: Record<string, { battle: string; comp: string }> = {
    str: { battle: 'STR', comp: 'P_STR' },
    // ...
} as const;

// ✅ 修正後：battle 引用 EnumStatusAttr，comp 以 Enum 成員組合樣板字串
export const BASE_STAT_COMP_NAMES = {
    str: { battle: EnumStatusAttr.STR, comp: `${EnumStatusPrefix.Comp}${EnumStatusAttr.STR}` },
    int: { battle: EnumStatusAttr.INT, comp: `${EnumStatusPrefix.Comp}${EnumStatusAttr.INT}` },
    dex: { battle: EnumStatusAttr.DEX, comp: `${EnumStatusPrefix.Comp}${EnumStatusAttr.DEX}` },
    spd: { battle: EnumStatusAttr.SPD, comp: `${EnumStatusPrefix.Comp}${EnumStatusAttr.SPD}` },
    luk: { battle: EnumStatusAttr.LUK, comp: `${EnumStatusPrefix.Comp}${EnumStatusAttr.LUK}` },
} as const;
```

---

### 第五層：回傳型別不可退化為 `string`（維護 SSoT 與型別安全）

原始函式顯式標註 `: string` 回傳型別，把精確的鍵名型別「退化」回寬鬆的原始型別：

```typescript
// ❌ 舊：回傳型別標註為 string，抹除精確鍵名
export function getUpKey(key: EnumStatusAttr): string {
    return STATUS_UP_KEY_NAME[key as keyof typeof STATUS_UP_KEY_NAME] ?? `${STATUS_UP_PREFIX}${key}`;
}

export function getCompFieldName(key: string): string {
    return BASE_STAT_COMP_NAMES[key as keyof typeof BASE_STAT_COMP_NAMES]?.comp ?? `${COMP_PREFIX}${key.toUpperCase()}`;
}
```

#### 為什麼 `: string` 回傳型別破壞 SSoT 與型別安全

| 問題 | 說明 |
|------|------|
| 破壞單一事實來源 (SSoT) | 合法的鍵名集合本應由 `EnumStatusPrefix` + `EnumStatusAttr` 推導而來；標註 `: string` 後，「有效鍵名」的事實來源變成模糊的 `string`，與 Enum 脫鉤 |
| 喪失型別安全 | 呼叫端收到 `string`，可以接受任何字串（`getUpKey(...)` 的結果被當成任意 `string` 使用），編譯期無法區分 `UpSTR` 與 `DownSTR` |
| 隱性錯誤溫床 | 拼錯的鍵名（如 `'UpSTr'`）在編譯期不報錯，直到執行期才暴露 |

#### 修正：讓回傳型別由 Enum 推導（移除 `: string`）

The fix lets the return type be inferred from the Enum-derived values, instead of widening to `string`:

```typescript
// ✅ 正確：移除 : string，回傳型別由 STATUS_UP_KEY_NAME（Enum 推導的樣板字串型別）推導
export function getUpKey(key: EnumStatusAttr) {
    return STATUS_UP_KEY_NAME[key] ?? `${EnumStatusPrefix.Up}${key}`;
}

// ✅ getCompFieldName：參數收斂為 keyof，回傳型別同樣由 Enum 組合推導
export function getCompFieldName(key: keyof typeof BASE_STAT_COMP_NAMES) {
    return BASE_STAT_COMP_NAMES[key]?.comp ?? `${EnumStatusPrefix.Comp}${key.toUpperCase()}`;
}
```

移除顯式 `: string` 後，回傳型別會被推導為精確的樣板字串聯集（如 `` `${EnumStatusPrefix.Up}${EnumStatusAttr}` ``），呼叫端獲得與 Enum 一致的型別保護，SSoT 在型別層面貫穿到底。

After removing the explicit `: string`, the return type is inferred as a precise template-literal union (e.g. `` `${EnumStatusPrefix.Up}${EnumStatusAttr}` ``). Callers gain the same type protection tied to the Enum, and SSoT is preserved all the way down to the type level.

> ⚠️ **原則**：當函式回傳值是由 Enum 成員組合而來時，**不要標註 `: string`**。若需要明確型別，應標註由 Enum 推導的精確型別（如 `ITSStringLiteralPrefixed<EnumStatusAttr, EnumStatusPrefix.Up>`），而非退化的 `string`。

---

## 核心原則總結

### 1. 遷移 Enum 必須全站點一致 (Enum migration must be consistent across all sites)

```
遷移清單（本案例已示範）：
1. ✅ 宣告：字串 const → Enum 成員
2. ✅ 鍵名對照：三份手寫字面量物件 → _buildStatRecord 由 Enum 推導（SSoT + 精確樣板字串型別）
3. ✅ ?? fallback 拼接：STATUS_UP_PREFIX → EnumStatusPrefix.Up
4. ✅ 樣板字串：${COMP_PREFIX} → ${EnumStatusPrefix.Comp}
5. ✅ 物件值：'STR' → EnumStatusAttr.STR
6. ✅ 參數型別：string → keyof typeof BASE_STAT_COMP_NAMES（順帶收斂）
7. ✅ 回傳型別：移除退化的 : string，改由 Enum 推導精確樣板字串型別（維護 SSoT 與型別安全）
8. ✅ 對照表 value：Record<EnumStatusAttr, string> / Record<string, string> 的 string value 改以三種方式之一處理（移除 Record<string> 標註 / as const + satisfies / 改為 ITSStringLiteralPrefixedRecord），保留 as const 精確型別
```

### 2. 不要留下「半吊子」字串常數 (Do not leave "half-done" string constants)

若只把 `STATUS_UP_PREFIX` 改成 Enum 宣告，卻忘了把 `getUpKey` 裡的 `${STATUS_UP_PREFIX}${key}` 改成 `${EnumStatusPrefix.Up}${key}`，程式碼仍能編譯（因字串值相同），但：
- 重新命名 `EnumStatusPrefix.Up` 不會傳播到 fallback 分支 → 行為靜默分歧
- 拼寫錯誤（`EnumStatusPrefix.Upp`）在編譯期報錯，但 `'Upp'` 字串不會

### 3. 順帶收斂型別 (Tighten types along the way)

本案例同時將 `getCompFieldName(key: string)` 收斂為 `key: keyof typeof BASE_STAT_COMP_NAMES`，把執行期才可能出錯的呼叫提前到編譯期攔截。

---

## 重構指導 (Refactoring Guidance)

將字串常數/聯合型別遷移為 Enum 時：

| 檢查點 | 操作 |
|--------|------|
| 是否有 `as const` 字串常數用於拼接鍵名？ | 重構為 Enum 成員 |
| 是否有大量手寫的鍵名/值字面量物件（如 `UpSTR`、`DownSTR`…）？ | 以 `_buildStatRecord` 之類的泛型輔助函式由 Enum 推導，消除重複並取得精確樣板字串型別 |
| 對照表是否宣告為 `Record<X, string>` / `Record<string, ...>`（value 或 key 為 `string`）？ | 這類標註會把字面量加寬為 `string`、使 `as const` 失效；保留 `as const`，改採三種處理之一：移除 `Record<string>` 標註 / `as const satisfies` / 改為 `ITSStringLiteralPrefixedRecord` |
| 是否有 `??` fallback 使用舊常數？ | 一併改為 Enum 成員 |
| 是否有樣板字串 `${PREFIX}${x}`？ | 前綴改用 Enum 成員 |
| 是否有物件值為原始字串？ | 改為 Enum 引用或 Enum 組合 |
| 是否有參數型別過寬（如 `string`）？ | 順帶收斂為 Enum / keyof 索引存取 |
| 函式回傳型別是否標註為 `: string`？ | 移除退化標註，改由 Enum 推導精確樣板字串型別（避免破壞 SSoT 與型別安全） |

---

## 參考連結

- [TypeScript Enum 文件](https://www.typescriptlang.org/docs/handbook/enums.html)
- 本技能「嚴格類型控制 → ⚠️ 完整重構：比對值必須一併更新」章節（SKILL.md / SKILL.zh.md）
- 相關：SSoT 原則、型別可追溯性（見 geo-transform.md、url-impl.md）
