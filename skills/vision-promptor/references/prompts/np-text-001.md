---
description: >-
  「畫面文字渲染 (Text Rendering)」提示詞範例
  （檔名前綴 np- = natural-language prompt，001 = 本系列第 1 則）。
  收錄 2 則要求在畫面中渲染可讀文字的提示詞——舊金山屋頂大型看板、
  蒸汽龐克店家招牌；示範「欲渲染的文字以引號或 Text: 標示」的寫法，
  並區分主標語與場景內文字。
tags:
  - prompts/examples
  - prompts/natural-language
  - image-generation
  - documentation/references
---

# 畫面文字渲染範例 (Text Rendering)

## 分類索引

- **【文字渲染・看板】舊金山屋頂大型廣告牌** — 主標語＋建築塗鴉文字，多語彙並存
- **【文字渲染・店招】蒸汽龐克摩托車店** — 橫幅主標＋店面招牌副標，指定文字位置

---

### 【文字渲染・看板】舊金山屋頂大型廣告牌

> 藍紫大型屋頂看板渲染主標語 `ComfyUI is built with love`，各形各色建築上另有塗鴉文字 `We`／`Here`／`Today`——
> 示範「主文字寫進句子、次要文字以引號列出」的層級安排。

```
Giant blue and purple big billboard on rooftop in san francisco city billboard says "ComfyUI is built with love" All kinds of buoildings in different shapes and colors. Some buildings have grafitti "We" "Here" "Today"
```

### 【文字渲染・店招】蒸汽龐克摩托車店

> 先給風格句，再給主體與兩處文字：頂部弧形橫幅 `STEAMPUNK`、店面招牌 `GEARS & SPROCKETS`——
> 以 `Text:` 與 `A sign on the shop:` 明確指定文字與其所在位置。

```
Steampunk style.
A steampunk motorcycle parked outside a motorcycle shop.
Display a curved ribbon banner at the top.
Text: STEAMPUNK,
A sign on the shop: GEARS & SPROCKETS,
```

> ⚠ 文字渲染對模型要求較高：文字**務必加引號或以 `Text:` 標示**，並指定所在物件／位置；
> 過長或含標點、特殊字元的語句容易渲染錯誤。

---

**相關連結：**

- 主技能：[SKILL.md](../../SKILL.md)
- 範例索引：[README.md](README.md)
- 版面設計類：[np-book-game-001.md](np-book-game-001.md)
