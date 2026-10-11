---
title: 語法優化案例集 (Syntax Optimization Cases)
description: 以「語法優化」為主題的重構案例集。案例一：除非有特定意圖/用法設計，reduce 前不應進行 map、filter 等中間邏輯，應將條件與轉換併入累積器，以單次遍歷取代「中間陣列 + 兩次遍歷」；並列舉保留前置步驟的正當理由（中間結果複用、階段化管線、條件命名）。
tags:
  - documentation/references
  - refactoring
  - TypeScript
  - syntax-optimization
  - reduce
  - array-methods
---

# 語法優化案例集 (Syntax Optimization Cases)

本檔以**語法優化 (Syntax Optimization)** 為主題收錄重構案例：在**不改變行為**的前提下，僅透過調整運算次序、消除中間資料、合併回呼，換取更少的中間陣列、更少的遍歷次數，以及「一處讀完」的意圖表達。案例以編號持續累加，目前收錄：

- **Case 1** — `reduce` 前不應疊加 `map` / `filter` 等前置邏輯（除非有特定意圖/用法設計）

Cases here optimize **syntax only**: behavior stays identical; the gain comes from fewer intermediate arrays, fewer passes, and one place to read the rule.

---

## Case 1 — `reduce` 前不應疊加 `map` / `filter` 等前置邏輯

### 規則 (Rule)

`reduce` 是「單次遍歷、就地累積」的終端操作。**除非有特定意圖/用法設計，否則不應在 `reduce` 之前進行包含但不限於 `map`、`filter` 等邏輯**——這類中間步驟應併入 `reduce` 的累積器：挑選條件以 `if` 守衛表達、轉換直接套用在累積計算上。

Unless there is a specific intent/design, do **not** run `map`, `filter`, or similar logic before a `reduce`. Fold the intermediate step into the accumulator instead.

### ❌ 前置 `filter` 與 `reduce` 分離成兩個回呼

```typescript
__keys
	.filter((key) => __GETTER_KEYS.includes(key as any))
	.reduce((acc, key) => {
		acc[key] = expected[key];
		return acc;
	}, {} as Partial<T>)
```

**問題點：**

1. **兩次遍歷 + 一組中間陣列**：`filter` 先走訪一次並產出臨時陣列，`reduce` 再走訪一次；合併後只需一次遍歷、零中間陣列（GC 壓力同步下降）。
2. **意圖割裂**：「哪些 key 被納入」寫在 `filter` 回呼、「納入後寫入什麼」寫在 `reduce` 回呼，完整規則被切成兩個閉包，讀者必須跨回呼拼湊。
3. **鏈式膨脹**：每多一個中間步驟，管線就多一節；日後再加 `map`/排序，鏈愈長愈難閱讀與除錯。
4. **條件重複風險（脫離 SSoT）**：若 `reduce` 內日後也需要同一條件（例如避免重複寫入），條件便會在 `filter` 與 `reduce` 各存一份，形成雙重維護。

### ✅ 併入 `reduce`：挑選條件成為守衛

```typescript
__keys
	.reduce((acc, key) => {
		if (__GETTER_KEYS.includes(key as any))
		{
			acc[key] = expected[key];
		}
		return acc;
	}, {} as Partial<T>)
```

**收益：**

- **單次遍歷、零中間陣列**：過濾與累積在同一趟完成。
- **規則同處可見**：挑選條件（`if`）與寫入邏輯（`acc[key] = ...`）位於同一個回呼，一處即完整規則。
- **條件只有一份**：不存在「filter 一份、reduce 一份」的雙重維護。

### 同規則的其他形態 (Same rule, other shapes)

| 前置形態 | 併入方式 |
|---------|---------|
| `.filter(p).reduce(f)` | reduce 回呼內以 `if (!p(x)) return acc;` 守衛 |
| `.map(g).reduce(f)` | 轉換直接套用在累積計算，例如 `.map((x) => x * 2).reduce((s, x) => s + x, 0)` → `(s, x) => s + x * 2` |
| `.map(g).filter(p).reduce(f)` | 轉換與守衛同置於一個 reduce 回呼，仍維持單次遍歷 |
| `.filter(p)` 的結果**另有用途** | 不屬本規則的合併對象 → 見下方「例外 1」，抽成具名中間變數 |

### 何時可以前置（特定意圖/用法設計）(When pre-steps ARE justified)

本規則並非禁令，而是預設值。若中間步驟具備**意圖上的理由**，前置是正當的：

1. **中間結果本身即需求（被複用）**：`filter`/`map` 的結果要回傳、要記錄（例如「被排除的 key」需寫入 log）、或供第二條流程使用。此時應抽成**具名變數**，讓中間值有名字、有意圖，而非匿名鏈裡的隱性資料：
   ```typescript
   const getterKeys = __keys.filter((key) => __GETTER_KEYS.includes(key as any));
   recordSkipped(__keys, getterKeys);          // 中間結果有第二個消費者
   const picked = getterKeys.reduce(/* ... */, {} as Partial<T>);
   ```
2. **階段化管線（各階段型別/職責不同）**：階段本身是不同型別、不同領域步驟（如 parse → normalize → aggregate），需獨立命名、獨立測試或可替換。此時保留階段，但以**具名函式**取代匿名鏈：
   ```typescript
   const picked = pickGetterKeys(__keys).reduce(accumulateExpected, {} as Partial<T>);
   ```
3. **條件複雜且需在多處共用**：過濾條件含多個分支、或有多個呼叫點 → 抽成具名述項 `const isGetterKey = (key) => ...`（SSoT），再用它守衛；此時「條件」是可複用的具名單元，而不是散落在鏈中的匿名閉包。

> **判斷口訣**：中間結果**只被下一個終端操作消費** → 併入 `reduce`；中間結果**有第二個消費者**、或**階段本身是需求** → 保留，但務必具名。

### 重構指導 (Refactoring Guidance)

| 檢查點 | 操作 |
|--------|------|
| `reduce` 前是否有 `filter` / `map` / 其他中間步驟？ | 併入 reduce 回呼：條件 → `if` 守衛；轉換 → 直接套用於累積計算 |
| 中間陣列的結果是否被複用（回傳 / 記錄 / 第二流程）？ | 保留，但抽為**具名變數**並註明用途；不要留在匿名鏈中 |
| 各階段是否為不同型別、需獨立測試的領域步驟？ | 保留階段，但抽為**具名函式**組成管線 |
| 過濾條件是否在多處重複出現？ | 抽為具名述項（SSoT），守衛與過濾共用同一份條件 |
| 併入後 reducer 是否過長、含多個職責？ | 先抽出具名的守衛/轉換函式再於回呼內呼叫；**仍維持單次遍歷**，不要退回前置鏈 |

---

## 參考連結

- [MDN — Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)
- 本技能「Golden Rules — Code is written for humans」：合併的前提是意圖更集中，而非寫得更炫
