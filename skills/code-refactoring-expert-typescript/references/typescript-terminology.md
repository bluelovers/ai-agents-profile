---
title: 少用與容易忘記的 TypeScript 術語 (Easily Forgotten TypeScript Terminology)
description: 收錄未收錄於官方 Handbook、僅見於版本紀錄的 TypeScript 術語與語法（Named Tuple / Labeled Tuple Elements 等），附官方出處、語法規則與跨語言名稱對照
tags:
  - documentation/references
  - refactoring
  - TypeScript
  - terminology
---

# 少用與容易忘記的 TypeScript 術語 (Easily Forgotten TypeScript Terminology)

> **用途**：部分 TypeScript 術語與語法**沒有收錄在官方 Handbook（正式文件）裡，只出現在版本紀錄 (Release Notes)**——日常查文件查不到，官方名稱自然容易想不起來。本文件收錄這類「容易忘記」的術語，提供**官方出處、語法寫法、規則細節與跨語言名稱對照**。
>
> 📌 **版本基準提醒**：本文件內容基於 **TypeScript 4.0 版本紀錄**撰寫，**並不代表最新版本的狀態**；但相關特性與用語**基本上與現存版本一致**。若需確認細節，請以當前版本的 [Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/) 與編譯器實測為準。

---

## 1. Named Tuple（Named Tuple Elements / Labeled Tuple Elements）

### 術語對照：同一個概念、多個名字

| 名稱 | 出處 / 使用場景 |
|------|----------------|
| **Labeled Tuple Elements** | **TypeScript 官方版本紀錄的正式名稱**——TypeScript 4.0 Release Notes 的章節標題即為此名 |
| **Named Tuple** / **Named Tuples** / **Named Tuple Elements** | 社群、技術文章與日常對話最常用的稱呼 |
| **具名元素 / 名稱元素 / 具名 Tuple** | 早期中文文件的譯法——**本技能已停用**：中文描述一律**直接寫 `Named Tuple`，不另譯中文** |
| **Named Tuple** | 其他語言的同名概念，例如 Python 的 `collections.namedtuple`、`typing.NamedTuple` |

**官方出處**：

- [TypeScript 4.0 Release Notes — Labeled Tuple Elements](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html)

> ⚠️ **為什麼容易忘記**：這個**用語與語法都沒有在官方 docs 內出現過（除了版本紀錄以外）**——用一般方式查 Handbook 查不到，自然記不住官方名稱。查資料時請以 **"Labeled Tuple Elements"** 為關鍵字，直接到 Release Notes 查閱。

### 語法（TypeScript 4.0+）

```typescript
// Named Tuple：為每個位置加上 label
type Range = [start: number, end: number];

// label 語法與參數列表對齊：選擇性元素、其餘（變長）元素皆可標記
type Foo = [first: number, second?: string, ...rest: any[]];
```

### 官方規則與易忘細節（出自 4.0 版本紀錄）

- **要標記就必須全部標記**：只要一個位置有 label，其餘位置也必須都有，否則編譯錯誤（`type Bar = [first: string, number]` ✗）
- **label 純供文件與工具使用（documentation and tooling），執行期擦除**：解構時變數名不必與 label 一致（`const [a, b] = x` 完全合法），label 也不會出現在編譯後的 JavaScript
- **label 不是欄位**：不能以 `range.start` 取值，存取仍靠索引；本技能進一步要求以 **Enum 錨定索引**（見 [規範 F：Tuple 順序語義以 Enum 錨定，禁止 inline](../SKILL.zh.md)）
- label 不參與型別相容性判斷（結構化比對照舊），只影響 IDE 顯示與錯誤訊息

### 跨語言名稱差異（易混淆）

| 語言 | 名稱 | 機制 |
|------|------|------|
| TypeScript | Labeled Tuple Elements / Named Tuple | **型別層標記，編譯後擦除**——執行期無欄位、不可屬性存取 |
| Python | Named Tuple（`collections.namedtuple`、`typing.NamedTuple`） | **執行期真的類別**——可用屬性存取 `p.start`、可迭代、具 `._fields` |

⚠️ 兩者同名但機制完全不同：搜尋資料時請加上 "TypeScript" 限定，避免搜到 Python 的執行期資料結構。

### 在本技能中的應用

- **規範 F**：以 Enum 作為槽位索引的單一事實來源、抽離 Named Tuple、以 Enum 索引（見 [SKILL.zh.md](../SKILL.zh.md)）
- **💡 進階技巧：Tuple 語義標註**——Named Tuple 搭配逐元素 JSDoc（`IGeoPointTupleLatLng`）
- 案例：[座標處理重構案例](./geo-transform.md)

---

## 2. Variadic Tuple Types（同出自 TypeScript 4.0 版本紀錄）

與 Named Tuple 同屬 [TypeScript 4.0 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types) 收錄的 Tuple 進階語法：

```typescript
// 泛型展開：串接兩個（未知長度的）Tuple
function concat<T extends any[], U extends any[]>(arr1: T, arr2: U): [...T, ...U] {
    return [...arr1, ...arr2];
}

// rest 元素可出現在任意位置，不限於結尾（4.0 起放寬）
type StrStrNumNumBool = [...Strings, ...Numbers, boolean];
```

**易忘細節**：

- 4.0 之前編譯器強制 `A rest element must be last in a tuple type`；**4.0 起 rest 元素可出現在 Tuple 任意位置**
- 本技能規範 F 的「rest 元素不得作為內聯定義的藉口」（`tags?: [string, ...number[]]`）即屬此語法家族

---

## 擴充

後續發現其他「官方 Handbook 未收錄、只在版本紀錄出現」的術語時，依本文件格式追加：術語對照表 → 官方出處 → 語法 → 易忘細節。

## 相關資源

- [主技能文件 code-refactoring-expert-typescript](../SKILL.zh.md)
- [座標處理重構案例（Tuple 語義標註實戰）](./geo-transform.md)
- [TypeScript 4.0 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html)
