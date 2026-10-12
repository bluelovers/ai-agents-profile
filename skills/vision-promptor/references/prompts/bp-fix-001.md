---
description: >-
  提示詞修正案例：綠髮角色圓桌倒茶場景的修正前後對照。
  修正核心是把倒茶動作的起終點鎖進同一平面——
  從「茶壺在桌上、杯子在地面」的開放關係，改為「茶壺 → 細流 → 桌上茶杯」的封閉關係，
  避免茶水被生成到錯誤位置、杯子落在不該在的地方。
  兩段提示詞皆套用要素分割原則的無損排版（只動斷行、不動措辭），
  使差異逐行對齊可稽核。規則見 references/mp-element-extraction.md。
tags:
  - prompts/examples
  - prompts/rules
  - documentation/references
---

# 提示詞修正案例 (Prompt Fix Case)

## 案例: 綠髮角色圓桌倒茶場景

> 本檔收錄一組**修正前後對照**提示詞：同一場景（綠髮角色在圓桌旁倒茶），
> 修正解決的是**空間邏輯不穩定**——避免生成「從錯誤位置倒茶」的畫面。
>
> 排版依據：[mp-element-extraction.md](../mp-element-extraction.md) 的**階段二「分段整理」**：
> 只動排版（分行、分段、空行），**不動任何措辭**（無損排版）。

| 欄位 | 內容 |
| --- | --- |
| 檔案性質 | 修正前後對照（fix 前後版本同檔收錄） |
| 題材 | 綠髮雙馬尾角色・深色圓桌・透明茶壺倒茶・格窗背景・甜點前景 |
| 修正目標 | 倒茶動作的空間關係（起點茶壺 → 終點桌上茶杯） |
| 排版原則 | 一行一要素、依要素類別分段、順序保留（最小修改） |
| 差異幅度 | 兩版各 10 句，7 句逐字相同，差異 3 處 |

### 場景概述 (Scene)

綠色系角色向前傾身在深色圓桌旁，左手持透明小茶壺倒茶；背景是三葉草形格窗與濃密綠色植栽，
前景桌面擺滿甜點（抹茶芭菲、麻糬、兔子裝飾小蛋糕、綠色糖果），白花與綠藤纏繞桌腳，
窗光逆光照明，直式構圖、平視視角。

### 修正前 (Before)

```text
A female character with long, teal-green hair in large ponytails leans across a dark, circular table.
She wears a green garment with wide sleeves and white floral motifs, a white ruffled apron, and a white headdress featuring a yellow flower and a red rose.
Her eyes are light green, and she maintains a neutral facial expression while tilting her head.
With her left hand, she pours liquid from a small, transparent teapot toward a glass on the ground.

Behind her is a tall window with a green clover-shaped lattice pattern overlooking dense green foliage.
The foreground contains a variety of food items: a tall green parfait with a strawberry, a plate of mochi, a small cake topped with a rabbit figure, and a container of green sweets.
White flowers and green vines are scattered throughout the scene and wind around the table legs.

The lighting is bright and emanates from the background window, resulting in a backlit scene.
The composition is vertical, employing a straight-on camera angle with a clear focus on the character and foreground objects.
No censorship is present in the image.
```

### 修正後差異對照 (After Differences)

```diff
# 增加 `forward`：身體從「橫靠桌面」改為「向前傾身」，倒茶方向變得可讀
- leans across a dark, circular table
+ leans forward over a dark, circular table

# 核心修正：杯子從「地面」移到「茶壺嘴正下方的桌面」；動作從「朝某處倒」強化為「傾壺、細流直入杯中」
- pours liquid from a small, transparent teapot toward a glass on the ground
+ tilts a small, transparent teapot, pouring a thin stream of liquid directly into a glass placed on the tabletop beneath the teapot spout

# 補上食物的空間錨點（桌上），與茶壺、杯子共用同一平面
- a variety of food items:
+ a variety of food items arranged on the table:
```

---

### 修正說明 (Why This Fix)

**修正前的風險：倒茶的起點與終點不在同一平面。**

- 茶壺在角色手中（桌面高度），杯子卻被寫成 `on the ground`（地面）
- 高度差與斜向距離讓畫面出現多種不安定解讀：
  - 茶水從桌面**倒向地面**——看起來像從這張桌子倒往另一個平面／另一張桌子旁的地面
  - 生成時杯子容易**漂移到錯誤位置**（懸空、貼地、位置隨機）
  - `leans across`（橫靠桌子）看不出前後方向，倒茶關係更加模糊

**修正後：把倒茶鎖進「茶壺 → 桌上茶杯」的封閉空間鏈。**

- `leans forward over`：身體前傾、重心朝向桌面——**動作方向可讀**
- `tilts ... pouring a thin stream of liquid directly into`：明確的傾壺與細流，**終點是「進入杯中」**
- `a glass placed on the tabletop beneath the teapot spout`：杯子釘在**茶壺嘴正下方的桌面**——起點、路徑、終點三點共線且同平面
- `arranged on the table`：食物與杯子共用桌面，整個前景收斂到同一空間層

> **修正核心：** 不是換一套描述，而是**把倒茶動作的起點與終點鎖進同一平面**——
> 從「茶壺在桌上、杯子在地面」的開放關係，改成「茶壺 → 細流 → 桌上茶杯」的封閉關係，
> 讓茶水不會被生成到錯誤位置、杯子不會落在不該在的地方，
> 也避免「從一張桌子倒往另一張桌子」的誤讀。

### 排版決策 (Layout Decisions)

兩段提示詞套用同一套**無損排版**（依 [mp-element-extraction.md](../mp-element-extraction.md) 階段二「分段整理」）：

| 決策 | 做法 | 理由 |
| --- | --- | --- |
| 一行一要素 | 每個語意句（外觀／服裝／表情／動作…）各自成行 | 提示詞以「行」為替換單位；一行一要素，要改哪句就定位哪一行 |
| 依要素類別分三段 | ① 人物（外觀・服裝・表情・動作）② 場景（背景窗・前景食物・花藤）③ 風格（光線・構圖・聲明） | 段落邊界＝要素類別邊界；任一段可整段抽離或替換而不影響其他段 |
| 順序保留 | 未重排任何句子 | 原文本就依「人物 → 場景 → 風格」有序；重排只會破壞與原文的對照 |
| 兩版同一版型 | 修正前後用完全相同的分段方式 | 差異行**逐行對齊**，比對時只會高亮真正改動的 3 行，一眼可稽核 |
| 空行分段 | 段落之間留空行 | 對應「分段整理」允許的空行排版，提升人類閱讀性 |

**無損驗證方式：** 將排版前後的文本各自「移除全部空白字元」後逐字元比對 → 完全一致，
確認排版只改斷行、未改任何措辭。

### 送出前檢查清單 (Checklist)

- [ ] 差異是否只落在目標範圍（倒茶的空間關係）內？
- [ ] 倒茶的起點與終點是否在同一平面？指代是否清楚、有無懸空物件？
- [ ] 排版是否只動斷行、未改措辭？
- [ ] 兩版是否使用同一版型，使差異可逐行對照？

---

**相關連結：**

- 主技能：[SKILL.md](../../SKILL.md)
- 範例索引：[README.md](README.md)
- 要素分割與抽離：[mp-element-extraction.md](../mp-element-extraction.md)
- 完整範例：[mp-element-extraction-example.md](mp-element-extraction-example.md)

## 未整理分類 (Uncategorized)

> 新增範例先放此區，日後再併入上方分類。
