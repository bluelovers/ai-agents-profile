---
description: >-
  「空間圖層結構式提示詞 (Spatial-Layer-Structured Prompting)」撰寫規範，
  中文簡稱「圖層式提示詞」，英文別名 Structured Composition Prompting。
  說明總綱前導＋景深分層＋氣氛收尾的核心理念、標準四段式語法模板、
  撰寫必備三要素（前導鎖定鏡頭、圖層內構圖動線與留白、區塊標籤標準化
  且至少兩項錨點）、圖層三維要素 (Where/What/How)、
  「只有物件清單、缺少構圖引導」的常見盲區與正誤對比，以及適用場景與撰寫檢查清單。
tags:
  - prompts/rules
  - prompts/natural-language
  - prompt-engineering
  - documentation/references
---

# 空間圖層結構式提示詞（Spatial-Layer-Structured Prompting）

| 名稱欄位 | 內容 |
| --- | --- |
| 中文全名 | 空間圖層結構式提示詞 |
| 中文簡稱 | **圖層式提示詞** |
| 英文名稱 | Spatial-Layer-Structured Prompting |
| 英文別名 | Structured Composition Prompting |
| 檔名前綴 | `np-` = natural-language prompt（自然語言提示詞） |
| 範例提示詞 | [prompts/np-spatial-layer-structured-example.md](prompts/np-spatial-layer-structured-example.md) |

---

## 1. 核心設計理念

提示詞採用「**總綱前導 + 景深分層 + 氣氛收尾**」的模組化結構：

```text
[Global Context & View Angle]（總綱：主題 + 鏡頭）
        ↓
[分層區塊]（Foreground / Midground / Background 或其他分區）
        ↓
[Atmosphere]（氣氛：情緒 + 光影對比 + 色票）
```

核心目的：透過**強烈的構圖約束與顯式區域約束**，避免模型將物件隨機堆疊或遺漏。它不是「描述畫面」，而是「下規格」——適合繪製精準的**概念美術設計圖（Concept Art）**與**遊戲場景設定圖**。

與敘事式提示詞的差異：

| | 圖層式提示詞 | 敘事式提示詞 |
| --- | --- | --- |
| 主要目標 | **精確控制**（確保特定物件出現在特定圖層/位置） | 連貫、自然的畫面描述 |
| 構圖複雜度 | 空間結構複雜、多層次 | 單一主體或簡單場景 |
| 語法傾向 | 模組化、結構化、可重複替換組件（Prefix + Blocks） | 流暢段落、語意流動 |
| 成果傾向 | 概念美術規格書、場景資產清單圖 | 插畫、攝影感、敘事畫面 |

---

## 2. 標準語法結構（Template）

```text
[Global Context & View Angle]: A wide, cinematic establishing shot of [Overall Scene Topic]. [Lens & Camera height specs].

The [Scene Name] layout spans three distinct compositional layers:

Foreground: [Objects/Elements] arranged [Specific Placement/Arc/Movement], leaving [Negative Space/Open Area]. [Surface detail & Lighting reflections].
Midground: [Main Activity/Core Objects/Floor] forming [Center Point/Hub]. Surrounding [Secondary Architecture/Props] with [Materials/Details].
Background: [Upper Architecture/Distant Elements] defining [Boundary/Vaults]. [Light filtering/Atmospheric depth].

Atmosphere: [Mood Keywords]; [Lighting Contrast Strategy] producing [Specific Color Palette].
```

四段式職責：

1. **總綱前導**：一句話鎖定主題、鏡頭、視角與空間深度。
2. **分層宣告**：用一句過場句說明本場景分幾層（`spans three distinct compositional layers` 這類句型可直接替換層數與名稱）。
3. **分層區塊**：每層各一段，承載物件 + 佈局 + 留白 + 細節。
4. **氣氛收尾**：情緒關鍵字；光影對比策略；由此產生的具體色票。

---

## 3. 撰寫必備三要素（Mandatory Rules）

### 規則一：前導必須鎖定鏡頭（Lens Locking in Prefix）

必須在最開頭指定鏡頭語，例如 `wide establishing shot`、`elevated view`、`eye-level`，確保建立正確的透視與空間感。

```text
The view angle is a wide, cinematic establishing shot from a slightly elevated eye level,
capturing a grand spatial depth and a central open area surrounded by layered architecture.
```

> 沒有鏡頭，分層就沒有共同的透視基準，前中後景的關係會互相打架。

### 規則二：圖層內必須包含「構圖動線」和/或 留白/相對位置（Layout & Negative Space）

- ❌ **禁止只寫名詞清單**：`Foreground: empty tables`
- ✅ **必須寫出排列方式與空間引導**：`arranged in an arc along the edges, leaving the center floor open`

### 規則三：區塊標籤標準化（Standardized Block Tags）

- 推薦使用區塊引導詞，**包含但不限於**：
  - 景深軸：`Foreground:` / `Midground:` / `Background:`（前 / 中 / 後）
  - 垂直軸：`top` / `middle` / `bottom`（上 / 中 / 下）
  - 水平軸：`left` / `center` / `right`（左 / 中 / 右）
  - 對角與四角：`top-left` / `bottom-right` …（左上 / 右下 …）
  - 方位軸：東南西北等
  - 自訂區塊名稱：可赋予區塊語意化命名（包含但不限於 `主體`、`主視覺層`、`Functional zones`、`floors`、`sections` 等）
- **軸別可混合使用**，也可採用 [範例提示詞](prompts/np-spatial-layer-structured-example.md) 中海灘提示詞所用的概念——以自然語言直接宣告位置：

  ```text
  In the foreground, a sandy shore ...
  On the left side, ... a tropical drink ...
  In the center, a blue beach ball.
  On the right, a large red beach umbrella ...
  ```

- **最低要求：一則提示至少要存在兩項區塊要素**，例如：
  - `前 + 左`、`前 + 後`、`主體 + 右`、`上 + 下`、`背景 + 左側` …
  - 只有單一錨點（僅一個 `Foreground:`）等於沒有相對關係，模型仍會自行猜測其餘空間。

---

## 4. 圖層內部三維要素（Where / What / How）

每個圖層段落都應同時具備三個維度，缺一即退化為「物件清單」：

| 維度 | 問題 | 範例字眼 |
| --- | --- | --- |
| **空間位置（Where）** | 該圖層在場景中的區域與動線？ | 沿牆擺放、留出中央通道、環狀佈局、`along the lower left and right edges` |
| **視覺主體（What）** | 該圖層包含哪些物件與質感？ | `empty round tables with polished wood surfaces` |
| **構圖與鏡頭語言（How）** | 物件如何被裁切、排列、引導視線？ | 從下緣兩側延伸、弧形排列、`引導視覺穿透到背景` |

---

## 5. 最常見的盲區：只有「有什麼」，沒有「怎麼擺」

「圖層式提示詞」最容易踩到的坑：**誤以為標註了 `Foreground`、`Midground`、`Background` 就會自動安排出合理構圖**。實際上它只做了「物件清單的分組」，完全沒有給予該圖層「構圖引導（Compositional Guidance）」。

當圖層只有物件堆疊時，AI 的預設行為就是「**均勻填滿**」或「**隨機分佈**」——圓桌被亂數塞滿整個前景，連畫面正中央都被堵死。

### ❌ 錯誤寫法（被結構語法綁架）

```text
Foreground: empty round tables, polished wood surfaces, drifting smoke rising gently through the center.

Midground: carved details, hanging lanterns, warm candlelight glowing against natural wood browns and creamy bone tones.

Background: sweeping dragon bones curving overhead like natural vaults, gothic balconies layered around the circular layout, shafts of daylight filtering from above.

Atmosphere: cinematic, warm yet solemn, legendary tavern interior beneath dragon remains.
```

### ✅ 正確寫法（圖層 + 構圖兼具）

```text
A vast, high-ceilinged fantasy tavern interior built inside a massive circular chamber beneath sweeping dragon bones. The view angle is a wide, cinematic establishing shot from a slightly elevated eye level, capturing a grand spatial depth and a central open area surrounded by layered architecture.

The tavern layout spans three distinct compositional layers:

Foreground: Empty round tables with polished wood surfaces are arranged in a sweeping semi-circular arc along the lower left and right edges, leaving the center floor completely open. Drifting smoke rises gently through the central lower frame, with warm candlelight casting soft reflections on the tabletop surfaces.
Midground: A spacious, empty circular stone floor forms the room's central hub under soft daylight. Surrounding the perimeter are carved wooden pillars, hanging iron lanterns glowing with amber light, and cozy alcoves adorned with pale ivory dragon bone accents and rich wood textures.
Background: Massive dragon rib bones curve overhead like natural vaulted arches, anchoring the upper architecture. Gothic wooden balconies layer around the circular walls, while dusty shafts of cool daylight filter down from high ceiling openings, illuminating airborne dust and smoke.

Atmosphere: Dramatic, warm yet solemn, legendary fantasy mood; soft orange candlelight and warm lantern glow balance cooler daylight shafts from above, creating a rich contrast of amber, gold, natural wood browns, and creamy bone tones.
```

### 單行修正示例

> **Foreground**: empty round tables **arranged in a sweeping curve along the left and right edges, leaving the central floor wide open**, with polished wood surfaces and smoke drifting gently through the lower frame.
>
> *（前景：空圓桌**沿著左右兩側擺放呈弧形，將中央地面寬敞地留空**，搭配拋光木質表面與畫面下緣輕輕飄散的煙霧。）*

### 對比總表

| 圖層構圖要素 | 負面範例 | 優良範例 |
| --- | --- | --- |
| 前景構圖 | 只有物件標籤（`empty round tables`） | 明確指定排列與留白（`arranged in a curve... leaving the center open`） |
| 視線引導 | 無引導，中央被桌子堵死，視覺卡在前景 | 兩側導引線，將觀者視覺直接穿過中央空地拉向背景龍骨 |
| 空間控制 | 讓 AI 隨機分配桌面位置 | 強制約束物件分佈，避免畫面雜亂 |

**核心結論**：寫提示詞時，「**空間引導字（Layout/Arrangement）**」比「**名詞（Objects）**」更重要。沒有構圖指令的圖層，只是一張無序的採購清單。

---

## 6. 適用場景

✅ **最適合**：

- 多層次建築（大樓、地牢、Vault、中空巨樹）
- 空間室內設計（旅館、診所、酒吧、車庫、浴場）
- 遊戲場景概念圖、需要嚴格分區的複雜畫面
- 包含大量物件、必須確保「某物出現在某處」的規格圖
- 需要剖面圖（cross-section）、多層運作區域（operational areas）的插畫

⚠️ **較不適合**：單一主體肖像、無特定空間關係的氛圍圖——這類需求改用敘事式/單段式提示即可。

---

## 7. 速速檢查清單（Checklist）

- [ ] 第一段是否鎖定了鏡頭與視角？（`wide establishing shot` / `elevated` / `eye-level` …）
- [ ] 是否有分層宣告句？（`spans three distinct compositional layers` 或等義句）
- [ ] 每個圖層是否同時具備 **Where + What + How**？
- [ ] 每個圖層是否寫了排列方式與留白，而非名詞清單？
- [ ] 是否至少使用了**兩項區塊錨點**（如 前+左、前+後、主體+右）？
- [ ] 結尾是否有 `Atmosphere`（情緒 + 光影對比策略 + 色票）？
- [ ] 整體輸出是否為單一整合段落結構（過場句 + 分層區塊），無多餘的標記雜訊？

---

## 8. 範例參考

完整的範例提示詞共 15 則，依主要分層軸分類為五節（景深軸、垂直樓層軸、水平／功能分區軸、混合軸、未分類），
涵蓋前中後景、樓層上中下、左中右功能分區與自然語言位置句等分層變體，每則附簡短中文描述：

- [prompts/np-spatial-layer-structured-example.md](prompts/np-spatial-layer-structured-example.md)

正誤對比範例見本文件第 5 節。
