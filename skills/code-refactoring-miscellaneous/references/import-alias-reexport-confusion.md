---
title: 引用別名與重新匯出混淆 — 直接引用來源 (Import Alias & Re-export Confusion)
description: 避免 import alias 與轉發式 re-export 造成的同名混淆；依「完全相等 / 不相等變體 / 無引用 / 純轉發」四種情況分別處置，優先直接引用來源
tags:
  - documentation/references
  - refactoring
  - TypeScript
  - import-alias
  - re-export
  - single-source-of-truth
---

# 引用別名與重新匯出混淆 (Import Alias & Re-export Confusion)

## 核心原則

**不論是直接引用、或是重構抽離之後，都應盡量避免「引用時別名」(import alias)。**

需要別名，通常意味著以下兩者之一，而這兩者都應在**來源處**解決，而不是在每個引用處以別名湊合：

1. **名字衝突** — 在來源處根本改名，讓「不同函式有不同名字」成立
2. **為了保留舊名字而轉發** — 評估是否根本不需要保留（見下方四種情況）

同時，**優先直接引用來源 (direct source import)，而不是留下一層轉發式重新匯出 (forwarding re-export)**。轉發層會讓「符號實際來自哪裡」變得不透明，與 [Barrel Index 避免規則](../SKILL.md#barrel-index-avoidance-rule) 同源。

---

## 反模式：別名 + 轉發包裝的混合體

```typescript
import {
    bracketsEN as _bracketsEN,
    countLayers as _countLayers,
    getTagIncWeight as _getTagIncWeight,
} from "@/utils/promptTags/util/tag-weight";

// 合併物件：以 `_` 前綴別名遮蔽原名，再逐一轉發
{
    bracketsEN: _bracketsEN,

    countLayers(...args) {
        return _countLayers(...args);
    },

    getTagIncWeight(value, useNovelAiWeightSymbol = false) {
        return _getTagIncWeight(value, { useNovelAiWeightSymbol });
    },
}
```

這段程式碼把**四種性質完全不同的情況**混在同一個模式裡，全部以「別名 + 轉發」處理：

| 欄位 | 實際性質 |
| :--- | :--- |
| `bracketsEN` | 與來源 **100% 相等**，純轉發 |
| `countLayers` | 與來源 **100% 相等**，只是 `(...args)` 展開式轉發 |
| `getTagIncWeight` | 與來源**不相等的變體**（簽名不同、參數形狀不同） |

### 這段程式碼的問題

1. **別名遮蔽真實來源**：`_bracketsEN` 這類 `_` 前綴別名讓 IDE 的 Go to Definition、Find All References 指向別名綁定處而非真正的來源符號
2. **同名不同物、同物不同名**：讀者看到 `getTagIncWeight` 與 `_getTagIncWeight`，**無法只靠閱讀判斷兩者是否相同**——而這正是別名製造出來的混淆
3. **100% 相等的包裝是純噪音**：`countLayers(...args) { return _countLayers(...args) }` 不增加任何語意，只增加一層堆疊與一處必須同步的副本
4. **不相等的變體頂著相同名字**：`getTagIncWeight(value, bool)` 與底層的 `getTagIncWeight(value, options)` 行為不同，卻共用同一個語意名稱——別名只是把衝突**延後**到閱讀與除錯時爆發
5. **`(...args)` 只是包裝形式之一**：還有「明確參數轉發」（逐一轉發參數並重新宣告型別與預設值），它**額外違反 SSoT**——預設值在包裝處與來源處各有一份定義，來源一改就靜默分歧（見情況 1）

---

## 四種情況的分辨與處置

> **關鍵：先分辨情況，再處置。不要把四種情況混為一談，更不要用同一種「別名 + 轉發」處理全部。**

### 情況 1：100% 相等 — 不應以別名引用

**判定特徵**：別名後的符號與來源符號**簽名、行為、語意完全相同**。

**先認清「轉發包裝」不只一種形式**（`(...args)` 只是其中一種）：

| 形式 | 範例 | 是否改變行為 |
| :--- | :--- | :--- |
| 屬性直掛 | `bracketsEN: _bracketsEN` | 否 |
| 展開轉發 | `countLayers(...args) { return _countLayers(...args) }` | 否 |
| 明確參數轉發 | `setLayers(str, num = 0, ...) { _setLayers(str, num, ...) }` | 否（但另違反 SSoT，見下） |
| 參數形狀改寫 | `getTagIncWeight(value, bool) { _getTagIncWeight(value, {...}) }` | **是** → 屬情況 2 |

前兩種是純噪音；**明確參數轉發還額外違反單一事實來源 (SSoT)**：

```typescript
// ❌ 明確參數轉發：預設值在包裝處被重新宣告一份
setLayers(str: string, num = 0, start = '(', end = ')', joinStr = '') {
    _setLayers(str, num, start, end, joinStr);  // 來源處也各自定義了預設值
}
```

這裡的 `num = 0`、`start = '('`、`end = ')'`、`joinStr = ''` 是**第二份預設值定義**——包裝處一份、來源處一份。日後修改來源的預設值時，包裝處不會被編譯器提醒，兩處便靜默分歧：**原本「100% 相等」（情況 1）的轉發，在無人察覺下變成「不相等的變體」（情況 2）**。預設值只能有唯一定義處。

**為什麼不能用別名**：別名只為在本地重新使用一個相同的名字，沒有任何語意價值。它製造了「同物不同名」，讓閱讀者必須逐一比對才敢確定兩者相同。

```typescript
// ❌ 100% 相等卻以別名引用，再以相同名字掛回
import { bracketsEN as _bracketsEN } from "@/utils/promptTags/util/tag-weight";
const api = { bracketsEN: _bracketsEN };

// ❌ 簽名完全相同，`(...args)` 轉發不改變任何行為
import { countLayers as _countLayers } from "@/utils/promptTags/util/tag-weight";
const api = {
    countLayers(...args) {
        return _countLayers(...args);
    },
};
```

**明確參數轉發的正解**：若包裝處沒有任何額外邏輯，預設值留在來源一處，包裝整個刪除（屬情況 1 → 以屬性簡寫掛載，或屬情況 3/4 → 直接移除）；**若包裝處確實需要預設值，預設值的唯一定義處必須是來源**，包裝處不得再宣告一份。

**先檢查是否同時違反情況 3**：在決定「怎麼保留」之前，先確認該符號**有真實消費者或屬於公開 API**。若無外部引用且非公開 API，答案是**根本不保留**（見情況 3），而不是想方設法掛回來。

**合法寫法**：確認確實需要保留後，以 **ES6 屬性簡寫 (property shorthand)** 直接掛載原名匯入——同物同名、零別名、零包裝：

```typescript
// ✅ 直接引用原名 + 屬性簡寫：一望即知是同名轉發，而非另一個變體
import { bracketsEN, countLayers } from "@/utils/promptTags/util/tag-weight";

const api = { bracketsEN, countLayers };
```

簡寫與 `bracketsEN: _bracketsEN` 的差別看似只在一個底線，實則是「同一個符號」與「另一個被遮蔽的符號」的語意差別：簡寫宣告兩端**就是同一個綁定**，讀者不需要比對即可確定相等。

**若無法避免同名**（例如本地已有一個不同來源的 `bracketsEN`），這是**真正的別名衝突**，正解是在來源處改名或在使用點以路徑區分，而不是默認以 `_` 前綴靜默遮蔽。

### 情況 2：不相等的變體 — 應從根本改名，不要用別名製造「假同名」

**判定特徵**：別名兩端的符號**簽名或行為不同**。範例中 `getTagIncWeight(value, useNovelAiWeightSymbol = false)` 將布林參數轉為 options 形狀傳給底層——這是**兩個不同的函式**，只是頂著幾乎相同的名字。

**為什麼不能用別名**：`getTagIncWeight` / `_getTagIncWeight` 的差異只有一個底線前綴。這個差異對閱讀者、除錯者、以及日後的重構者都太過隱晦——看到呼叫 `getTagIncWeight(value, true)` 時，沒有人能立刻確定它對應底層的哪個簽名。

**正解：在來源檔案 `@/utils/promptTags/util/tag-weight` 內將底層函式根本上改名**，讓「不同函式有不同名字」在來源處就成立：

```typescript
// ✅ 來源檔案 tag-weight.ts：為兩種簽名取各自成立的名字
/** 接受 options 物件的底層實作 */
export function resolveTagIncWeight(value: string, options: { useNovelAiWeightSymbol?: boolean } = {}) { /* ... */ }

/** 布林參數的便利入口（若仍需保留） */
export function getTagIncWeight(value: string, useNovelAiWeightSymbol = false) {
    return resolveTagIncWeight(value, { useNovelAiWeightSymbol });
}
```

```typescript
// ✅ 引用端：各自引用自己的名字，零別名、零包裝
import { resolveTagIncWeight, getTagIncWeight } from "@/utils/promptTags/util/tag-weight";
```

> **原則**：名稱的衝突必須在**唯一的定義處**解決一次，而不是在每個引用處各別以別名彌補。後者會隨引用點增加而線性擴散。

### 情況 3：無外部引用且非公開 API — 根本不需要保留

**判定特徵**：該符號**沒有外部消費者**，也**不是公開 API**（可用 Find All References 確認僅有此處轉發、無實際呼叫）。

**處置**：直接移除，不要為了「看起來完整」而保留一個轉發欄位：

```typescript
// ❌ bracketsEN 無任何外部引用、非公開 API，卻保留為殭屍轉發欄位
import { bracketsEN as _bracketsEN } from "@/utils/promptTags/util/tag-weight";
const api = { bracketsEN: _bracketsEN };

// ✅ 直接不保留；若未來需要，消費者改為直接引用來源即可
```

保留一個沒有消費者的轉發欄位，等於擴大了此物件的表面對外面積，讓日後每次重構都必須顧慮一個實際上無人使用的欄位。

### 情況 4：純轉發 re-export — 消費端能簡單改用直接引用就移除

**判定特徵**：該 export 只是**一層轉發**（`export { setLayers } from "..."` 或物件上的同名轉發欄位），且消費端**能輕易改為直接引用來源路徑**。

```typescript
// ❌ 純轉發 re-export：符號的真實來源被遮蔽
export { setLayers } from "@/utils/promptTags/util/tag-weight";

// 消費端
import { setLayers } from "./merged-api";  // 真正的定義在哪？

// ✅ 消費端直接引用來源，轉發層刪除
import { setLayers } from "@/utils/promptTags/util/tag-weight";
```

**移除後的檢查步驟**：

1. 將所有消費端的 import 路徑改為來源路徑
2. 刪除轉發 export
3. 以編譯器確認無殘留引用（`tsc --noEmit` / IDE 錯誤面板）

> **與 Barrel Index 規則的關係**：情況 4 本質上是 Barrel Index 問題的局部版本——即使不是 `index.ts`，任何「只為轉發而存在」的中間層都有相同的遮蔽與維護成本。

---

## 判定速查表

| 情況 | 判定特徵 | 核心處置 | 關鍵動作 |
| :--- | :--- | :--- | :--- |
| **1. 完全相等** | 簽名、行為、語意皆相同；轉發形式含屬性直掛、`(...args)` 展開、明確參數轉發（後者預設值被重複定義，**額外違反 SSoT**） | 禁止別名；預設值只留來源一處；保留前先檢查情況 3 | 確需保留 → 屬性簡寫 `const api = { bracketsEN }`；無消費者 → 直接移除 |
| **2. 不相等變體** | 簽名或行為不同，卻頂著近似名字 | 從根本改名 | 在**來源檔案**為各變體取各自成立的名字 |
| **3. 無引用、非公開** | Find All References 無實際消費者 | 直接移除 | 不保留殭屍轉發欄位 |
| **4. 純轉發 re-export** | 一層轉發、無額外邏輯 | 改直接引用後刪除 | 消費端 import 改指來源路徑 |

### 分辨流程

```
發現 import alias / 轉發包裝
│
├─ 兩端符號完全相等？
│   ├─ 是 → 情況 1：禁止別名；預設值只留來源一處
│   │        └─ 先檢查情況 3：無真實消費者、非公開 API → 直接移除改為直接引用來源
│   │           確需保留 → 屬性簡寫 const api = { bracketsEN }，不做包裝
│   └─ 否 → 情況 2：在來源處根本改名
│
└─ 該符號是否有人消費？
    ├─ 無消費者、非公開 API → 情況 3：直接移除改為直接引用來源
    └─ 有消費者、但只是純轉發 → 情況 4：消費端改直接引用來源，刪除轉發層
```

---

## 重構工作流程

1. **列出所有別名與轉發**：搜尋 `as _`、`_` 前綴 import、`(...args)` 展開轉發、明確參數逐一轉發（留意包裝處是否重新宣告預設值）、同名轉發欄位
2. **逐一判定情況**：對每個符號回答「兩端是否完全相等？」「轉發是否重複宣告了預設值？」「是否有真實消費者？」
3. **先處理情況 2（根本改名）**：在來源檔案改名，編譯器會列出所有需同步的引用點
4. **再處理情況 3 / 4（移除）**：先改消費端 import 路徑，再刪除轉發
5. **最後清理情況 1**：改為直接引用原名並刪除別名與包裝；確需保留時以屬性簡寫 `const api = { bracketsEN }` 掛載（保留前先確認情況 3 不適用）
6. **編譯驗證**：`tsc --noEmit` 確認無殘留

## 收益

- **來源透明**：每個符號的名字即其定義處的名字，Go to Definition 直達真身
- **零同步成本**：移除 100% 相等的轉發副本後，來源變更不需要追蹤「包裝處是否漏改」
- **預設值單一事實來源**：刪除重複宣告預設值的明確參數轉發後，預設值只存在於來源一處，調整預設值不會再被包裝處靜默覆蓋
- **語意準確**：不相等的變體各自有名，呼叫端無需比對簽名才能確定行為
- **表面對外最小化**：無消費者的欄位與轉發層不佔用認知與維護成本

## 相關規則

- [Barrel Index 避免規則](../SKILL.md#barrel-index-avoidance-rule) — 模組層級的「直接引用來源」原則
- [code-refactoring-expert-typescript](../../code-refactoring-expert-typescript/SKILL.md) — 核心重構原則（SSoT）
