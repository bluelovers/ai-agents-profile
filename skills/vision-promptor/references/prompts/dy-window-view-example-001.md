---
description: >-
  「動態提示詞 (Dynamic Prompts)」範例 001：窗景透視
  （檔名前綴 dy- = dynamic prompts）。以「窗外窺視構圖」為題，
  示範如何把一則提示詞拆成距離、前景遮蔽、建築結構、人物、姿勢、
  室內陳設、玻璃細節、風格等可替換槽位，批量生成構圖相近、細節各異的變體。
  依 civitai「krea2 window view」LoRA（hamstornado）的構圖說明改寫，
  原始來源：https://civitai.red/models/2984989/krea2-window-view?modelVersionId=3384165
  人物段落採著衣版本。語法僅用 `{a|b|c}` 與 `{a|b|c|}` 兩種。
tags:
  - prompts/examples
  - prompts/rules
  - sd-webui
  - comfyui
  - documentation/references
---

# 動態提示詞範例 001：窗景透視 (Window View)

| 名稱欄位 | 內容 |
| --- | --- |
| 檔名前綴 | `dy-` = dynamic prompts（動態提示詞） |
| 系列編號 | `001` — 本系列第 1 則 |
| 核心技法 | 一份骨架提示詞，切成多個 `{...}` 取代欄位 → 批量產生變體 |
| 適用時機 | 想要**構圖固定、細節隨機**的量產；或想一次探索多種可能再回頭挑選 |
| 語法範圍 | 只用 `{a\|b\|c}`（選一）與 `{a\|b\|c\|}`（選一或空白）——見 [dy-dynamic-prompts.md](../dy-dynamic-prompts.md) |
| 來源 | civitai「krea2 window view」LoRA（作者 [hamstornado](https://civitai.red/user/hamstornado)）的構圖說明，改寫為著衣版本 — [原始頁面](https://civitai.red/models/2984989/krea2-window-view?modelVersionId=3384165) |
| 觸發詞 | `w1nd0w-v13w`（另見頁面 "see notes"） |
| 基礎模型 | Krea 2 ｜ 類型 LoRA ｜ SafeTensor 218 MB |

---

## 1. 核心觀念：構圖決定一切 (Composition First)

> 原作者的要點：**這類畫面的關鍵在構圖，不在 LoRA**——
> 提示詞沒寫對，模型給的只是一張平淡、沒有張力的圖。

四個決定構圖的要素：

| 要素 | 作用 |
| --- | --- |
| **距離** | 近／中／遠——決定主體在畫面中的比例與鏡頭語彙 |
| **前景遮蔽** | 用枝葉、灌木擋住部分視線——製造窺視感與縱深 |
| **建築結構** | 距離越遠，越要補充建築細節把模型拉回整體構圖 |
| **可見範圍** | 明確指定「看得到多少」——決定是「房間裡的一扇窗」還是「窗框住的風景」 |

---

## 2. 六段式骨架 (Six-slot Skeleton)

一份完整提示詞由六段組成，**每段都是一個可替換槽位**：

```text
[1 距離與前景] + [2 窗內人物] + [3 動作] + [4 可見範圍] + [5 室內陳設] + [6 玻璃細節] + [7 風格]
```

### 段 1：距離與前景遮蔽

**近景**——低角度，灌木佔滿前景，只露出窗：

```text
low-angle view with extremely heavy foliage and shrubbery dominate the foreground completely obstructing the view of a {window glass and reflections |window and immediate exterior |window plus surrounding wall and garden}, {,slightly off-axis|}
```

**中景**——高角度或低角度二選一，補上樓層與建築外觀：

```text
{{extremely|} high-angle view with tree branches and extensive foliage|low-angle view with extremely heavy foliage and shrubbery} dominate the foreground completely obstructing the view of a {{upper|lower} floor|} {window within the complete building façade |window in building within its immediate surroundings}, exterior uneven-tone {red|yellow|grey|brown|} brick walls with steel structural elements, modern architecture, clean aesthetic, wood paneling, frosted glass panels, textured wall surface, stone work elements.
```

**遠景**——加入街道、車流、鄰棟，把窗縮成都市景觀的一小部分：

```text
{{extremely|} high-angle view with tree branches and extensive foliage|low-angle view with extremely heavy foliage and shrubbery} dominate the foreground completely obstructing the view of a {window in multi-story building surrounded by streets, trees and neighbouring structures, grownd floor foyer entrance and parked cars in street below at the bottom of the frame |small distant window within a broad urban or suburban landscape, streets and roads in front of building with fast moving traffic} exterior uneven-tone {red|yellow|grey|brown|} brick walls with steel structural elements, modern architecture, clean aesthetic, wood paneling, frosted glass panels, textured wall surface, stone work elements.
```

> **注意建築結構的遞增**——距離越遠，越需要「建築元素」把模型拉回整體構圖，
> 否則遠景容易失去尺度感。

### 段 2–4：窗內人物、姿勢與可見範圍

> 以下為**著衣版本**。原範例以 `{naked|}` 與各式內衣為選項，
> 此處改為居家服飾，構圖原理完全相同。

**人物與姿勢**（站／坐／跪／倚／走動，再加重心與轉向細節）：

```text
showing a woman wearing {a loose knit sweater and shorts|a casual home outfit|a summer dress|a robe over sleepwear|an apron}, {standing|sitting|kneeling|leaning|moving across the room} {,with her weight shifted to one side|,slightly bent forward|,turned partly away|,leaning against the frame|,caught mid-movement},
```

**讓她有事可做**（否則會「擺姿勢」而顯得假）：

```text
{adjusting her hair|reaching for something|changing clothes|using her phone|looking through a cupboard|straightening the room|drying her hair|adjusting the curtains|walking across the room|performing an ordinary household task},
```

**限定可見範圍**（這步決定是「房間裡的窗」而非「窗框住的風景」）：

```text
with {her face and shoulders visible|her upper body visible|her side profile visible|her back partly visible|only part of her figure visible}, {,lower body hidden below the window sill},
```

### 段 5：室內陳設

> **保持抽象、避免細節**——否則畫面會開始失焦（decoherence）。

```text
{bed immediately behind her|sink directly beside her|sofa immediately behind her|counter directly in front of her|wardrobe immediately behind her|bathroom fixtures directly around her}, {,small everyday objects within arm's reach}, {,slightly untidy surroundings}, {,warm interior lighting|,soft daylight|,dim interior light|,mixed natural and artificial light},
```

### 段 6：玻璃細節

> 少量額外細節把模型「留在窗前」——這是製造「隔著玻璃看」的關鍵。

```text
{,subtle reflections|,slight glare|,minor glass distortion|,water droplets|,slightly dirty glass},
```

### 段 7：風格

> 一律走**非完美、隨手拍**路線——太乾淨會失去臨場感。

```text
{,candid amateur photograph|,casual snapshot|,slightly grainy digital photograph|,soft imperfect focus|,unpolished documentary style}.
```

---

## 3. 組裝結果 (Assembled Skeleton)

把七段接起來即為可直接送入 Dynamic Prompts 的完整骨架：

```text
[段1 三擇一]

showing a woman wearing {a loose knit sweater and shorts|a casual home outfit|a summer dress|a robe over sleepwear|an apron}, {standing|sitting|kneeling|leaning|moving across the room} {,with her weight shifted to one side|,slightly bent forward|,turned partly away|,leaning against the frame|,caught mid-movement},
{adjusting her hair|reaching for something|using her phone|looking through a cupboard|straightening the room|drying her hair|adjusting the curtains|walking across the room|performing an ordinary household task},
with {her face and shoulders visible|her upper body visible|her side profile visible|her back partly visible|only part of her figure visible}, {,lower body hidden below the window sill},
{bed immediately behind her|sink directly beside her|sofa immediately behind her|counter directly in front of her|wardrobe immediately behind her|bathroom fixtures directly around her}, {,small everyday objects within arm's reach}, {,slightly untidy surroundings}, {,warm interior lighting|,soft daylight|,dim interior light|,mixed natural and artificial light},
{,subtle reflections|,slight glare|,minor glass distortion|,water droplets|,slightly dirty glass},
{,candid amateur photograph|,casual snapshot|,slightly grainy digital photograph|,soft imperfect focus|,unpolished documentary style}.
```

> 若使用 LoRA，於提示詞開頭加上觸發詞（本例為 `w1nd0w-v13w`）。

---

## 4. 語法對照 (Syntax Applied)

本範例實際用到的兩種寫法：

| 寫法 | 範例 | 意義 |
| --- | --- | --- |
| `{a\|b\|c}` | `{standing\|sitting\|kneeling}` | 必選其一 |
| `{a\|b\|c\|}` | `{red\|yellow\|grey\|brown\|}` | 可選一，也可空白 |
| 開頭空白 | `{,slightly off-axis\|}` | 該片段整段可省略 |
| 巢狀 | `{{upper\|lower} floor\|}` | 外層含空白 → 整組可省，內層二擇一 |

> 巢狀寫法在此僅**照原例呈現**；日常使用掌握 `{a|b|c}` 與 `{a|b|c|}` 兩種即可。

---

## 5. 可移植的原則 (Transferable Principles)

不論是否使用 Dynamic Prompts，以下原則都適用：

- **構圖先於風格** — 距離、遮蔽、可見範圍三者定了，畫面才立得住
- **給人物一個動作** — 沒有事做的角色會退化成僵硬的擺拍
- **明確指定可見範圍** — 「看得見多少」直接決定敘事視角
- **越遠越要補結構** — 遠景缺少建築／地標錨點容易失去尺度
- **室內陳設保持抽象** — 細節過量會讓整體失焦
- **風格走非完美路線** — 隨手拍、輕微噪點、柔焦比精修更有臨場感
- **結尾用可選片段** — `{,xxx|}` 讓細節成為加菜，不影響骨架成立

---

**相關連結：**

- 主技能：[SKILL.md](../../SKILL.md)
- 範例索引：[README.md](README.md)
- 動態提示詞概念：[dy-dynamic-prompts.md](../dy-dynamic-prompts.md)
- 合併／插槽技法（同為模組化思路）：[mp-prompts-merge-001.md](../mp-prompts-merge-001.md)

**原始來源 (Original Source)：**

- 模型頁面：[krea2 window view - V1 | Krea 2 LoRA | Civitai](https://civitai.red/models/2984989/krea2-window-view?modelVersionId=3384165)
- 作者：[hamstornado](https://civitai.red/user/hamstornado)（觸發詞 `w1nd0w-v13w`、基礎模型 Krea 2、SafeTensor 218 MB、訓練 Steps 2,000 / Epochs 10）
- 本檔為其構圖說明的**改寫整理**：保留六段式骨架與動態提示詞語法，人物段落依 *Respect the Human Form* 原則改為著衣版本
