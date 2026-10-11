---
description: >-
  「要素分割與抽離 (Split & Extract Elements)」完整範例
  （檔名前綴 mp- = modular prompt）。以一則雙人合作平台遊戲畫面提示詞為例，
  展示三階段：原始內容 → 分段整理（只動排版，最小修改）→ 抽離 UI 要素與
  人物要素，留下場景／關卡／風格骨架；抽出的要素另存為可複用模組。
  定位模糊的 red and blue diamonds 此例歸為 UI 道具並抽離，
  一般情形模糊要素可保留但須獨立成行。規則見
  references/mp-element-extraction.md。
tags:
  - prompts/examples
  - prompts/rules
  - documentation/references
---

# 要素分割與抽離完整範例 (Element Extraction Example)

> 指南：[mp-element-extraction.md](../mp-element-extraction.md)
> 本例**原始內容結構良好**（一句一要素、段落分明），所以整理抽離起來比較簡單。
> 但**實務上很多提示詞散亂混雜**，需一併調整結構與順序——分析時請依照**實際內容**處理，
> 不要假設原文有序、也不要套用本例的分段結果。

| 名稱欄位 | 內容 |
| --- | --- |
| 檔名前綴 | `mp-` = modular prompt（模組化提示詞） |
| 題材 | 雙人合作平台遊戲：發條塔內部 |
| 抽離目標 | UI 要素、人物要素 |
| 保留目標 | 場景／關卡／動線、風格 |
| 修改幅度 | **最小修改**——只動排版與移除，不改任何措辭 |

---

## 階段一：原始內容 (Original)

> 單一段落、無分段；開頭帶 `Caption:` 包裝標籤。

```text
Caption: A wide side-view cartoon cooperative platform game screen shows a tall clockwork tower interior of brass gears, wooden floors, spiral stairs and swinging pendulums. A black top bar shows a flame icon, a snowflake icon and the timer 00:58 On the lower floor, an adult man with short red hair and a red-orange shirt with a flame emblem hangs from a rope and swings across a gap. On the upper right floor, an adult man with short dark hair and a blue shirt with a snowflake emblem pushes a big brass lever, and a blue line runs from it to a giant gear that lowers a wooden bridge. A huge clock face fills the background with glowing hands, red and blue diamonds sit on the platforms, a small steam pipe hisses on the left, and red and blue exit doors wait on the top floor. Warm amber light and bold outlines give the tower a lively mechanical look.
```

---

## 階段二：分段整理 (Structured — minimal modification)

**只做兩件事：** 移除 `Caption:` 包裝標籤、按語意分行分段。
**一個字都沒改**——用字、詞組、句序完全保留。

```text
A wide side-view cartoon cooperative platform game screen 
shows a tall clockwork tower interior of brass gears, wooden floors, spiral stairs and swinging pendulums. 

A black top bar shows a flame icon, a snowflake icon and the timer 00:58 

On the lower floor, an adult man with short red hair and a red-orange shirt with a flame emblem hangs from a rope and swings across a gap. 
On the upper right floor, an adult man with short dark hair and a blue shirt with a snowflake emblem pushes a big brass lever, and a blue line runs from it to a giant gear that lowers a wooden bridge. 
A huge clock face fills the background with glowing hands, 
red and blue diamonds sit on the platforms, 
a small steam pipe hisses on the left, and red and blue exit doors wait on the top floor. 

Warm amber light and bold outlines give the tower a lively mechanical look. 
```

**分段後可見的結構（五段）：**

| 段落 | 承載要素 |
| --- | --- |
| 1 | 畫面總述＋場景（鏡頭、發條塔內部） |
| 2 | **UI 要素**（頂欄、圖示、計時器） |
| 3 | **人物要素**×2（外觀、動作、動線、機構連動） |
| 4 | 背景與環境道具（大鐘面、**UI 道具**、蒸汽管、出口門） |
| 5 | 風格收尾（光線、線條） |

> 這個階段的價值：**同類內容已各自成段**，下一階段要抽誰、有沒有漏，一眼可見。

---

## 階段三：要素抽離 (Extracted — UI 與人物已移除)

**抽離目標：** UI 要素、人物要素（含人物外觀與其專屬動作）。
**保留：** 場景、關卡／動線、背景道具、風格。其餘逐字保留，**未重新描述**。

```text
A wide side-view cartoon cooperative platform game screen, 
shows a tall clockwork tower interior of brass gears, wooden floors, spiral stairs and swinging pendulums. 

On the lower floor, swings across a gap. 
On the upper right floor, a big brass lever, a giant gear that lowers a wooden bridge. 
A huge clock face fills the background with glowing hands, a small steam pipe hisses on the left, and red and blue exit doors wait on the top floor. 

Warm amber light and bold outlines give the tower a lively mechanical look. 
```

### 抽離對照表

| # | 被移除的內容 | 所屬要素 | 說明 |
| --- | --- | --- | --- |
| 1 | `A black top bar shows a flame icon, a snowflake icon and the timer 00:58` | UI | 整段移除（第 2 段） |
| 2 | `an adult man with short red hair and a red-orange shirt with a flame emblem` | 人物 | 角色外觀，移除 |
| 3 | `hangs from a rope and` | 人物動作 | 角色專屬動作，移除 |
| 4 | `an adult man with short dark hair and a blue shirt with a snowflake emblem` | 人物 | 角色外觀，移除 |
| 5 | `pushes` | 人物動作 | 動詞失去主詞，隨人物一起移除 |
| 6 | `red and blue diamonds sit on the platforms,` | UI 道具（定位模糊） | 見下方專節 |
| 7 | `and a blue line runs from it to` | UI 連線 | 連接指示線，屬 UI；`it` 指向已改變的 lever 一併處理 |

**保留下來的關卡／動線：**

- `swings across a gap` — 跨越缺口的動線
- `a big brass lever, a giant gear that lowers a wooden bridge` — 操作與連動關係

> **殘句判定（三層判斷）：** `On the lower floor, swings across a gap.` 缺主詞，
> 但它作為**動線標籤**語意清楚——屬**層級 1（標籤概念）→ 無需更動**，
> 未為了通順而補寫。同理 `On the upper right floor, a big brass lever, a giant gear that lowers a wooden bridge.`
> 也屬機關連動標籤，維持原樣。
> 若下游需要語法完整版，見第 4 節「另附版本」（**層級 3**）。三層判斷見
> [mp-element-extraction.md](../mp-element-extraction.md) 第 5 節。

---

## 4. 另附版本：重新描述版 (Alternative — re-described)

> **層級 3 的做法：本版是額外提供，不取代上面的最小修改版。**
> 原始提示詞本身已屬良好，**此例不需要重新描述**——此處僅示範「當需要通順語法時該怎麼做」：
> 只補回被移除處的最小承接，不重寫既有內容。

```text
A wide side-view cartoon cooperative platform game screen, 
shows a tall clockwork tower interior of brass gears, wooden floors, spiral stairs and swinging pendulums. 

On the lower floor, a rope spans a gap to cross. 
On the upper right floor, a big brass lever connects to a giant gear that lowers a wooden bridge. 
A huge clock face fills the background with glowing hands, a small steam pipe hisses on the left, and red and blue exit doors wait on the top floor. 

Warm amber light and bold outlines give the tower a lively mechanical look. 
```

---

## 5. 模糊要素：red and blue diamonds

`red and blue diamonds sit on the platforms` 的定位**比較不明確**：

- 可能是**平台上的收集品道具**（偏向關卡要素）
- 也可能是**畫面上的 UI 標記**（偏向 UI 要素）

**此例的處理：歸為 UI 要素的道具 → 抽離。**

**一般規則（見指南規則 3）：無法判斷是否為需要移除的目標時，可以保留**——
但**必須讓它獨立成一行**，使結構可讀性明確，之後要刪或要留都定位得到：

```text
A huge clock face fills the background with glowing hands, 
red and blue diamonds sit on the platforms, 
a small steam pipe hisses on the left, and red and blue exit doors wait on the top floor. 
```

> 差別只在**有沒有把它跟其他要素混在一行**：混在一起 → 之後難以判斷與定位；
> 獨立成行 → 保留也無妨，結構依然可讀。

---

## 6. 抽出的要素可再利用 (Reusable Modules)

抽離不是丟棄——被移除的內容各自成模組，可送往
[mp-prompts-merge-001.md](../mp-prompts-merge-001.md) 的 `[PROMPT]` 插槽重組：

```text
[UI 模組]
A black top bar shows a flame icon, a snowflake icon and the timer 00:58
```

```text
[人物模組・下層]
an adult man with short red hair and a red-orange shirt with a flame emblem hangs from a rope and swings across a gap.
```

```text
[人物模組・上層]
an adult man with short dark hair and a blue shirt with a snowflake emblem pushes a big brass lever, and a blue line runs from it to a giant gear that lowers a wooden bridge.
```

> **分析能力反哺合併**：正因為拆得出「UI 不依賴場景句」「人物外觀與動作是兩層」，
> 才知道合併時**場景可整段替換**、**服裝只能由基底或模組其中一邊宣告**——
> 分割與合併是同一套判斷的正反兩面。詳見
> [mp-element-extraction.md](../mp-element-extraction.md) 第 1 節。

---

**相關連結：**

- 主技能：[SKILL.md](../../SKILL.md)
- 範例索引：[README.md](README.md)
- 指南：[mp-element-extraction.md](../mp-element-extraction.md)
- 逆向操作（合併）：[mp-prompts-merge-001.md](../mp-prompts-merge-001.md)
