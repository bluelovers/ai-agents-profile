---
description: >-
  合併提示詞 (Merge Prompt) 範例 001：模組化插槽設計——基底提示詞
  （姿勢＋制服／背景／風格）切出 [PROMPT] 插槽，插入角色／種族模組
  （蝴蝶貓獸人、螳螂貓、蜘蛛貓三則）後仍能直接順利生成，不需客製化微調。
  含基底與插槽原文、插入模組範例（三則獸人種族模組＋替換種族／追加要素／
  風格模組三種插入類型示範）、插槽放置原則、不需微調的原因、
  會破壞合併的反模式對照與合併操作流程。
tags:
  - prompts/examples
  - prompts/rules
  - documentation/references
---

# 合併提示詞範例 001：模組化插槽 (Merge Prompt #001)

| 名稱欄位 | 內容 |
| --- | --- |
| 檔名前綴 | `mp-` = merge prompt（合併提示詞） |
| 系列編號 | `001` — 本系列第 1 則 |
| 核心技法 | 基底提示詞 ＋ `[PROMPT]` 插槽：**可模組化、可替換、可插入／組合** |
| 設計目標 | 插入其他提示詞後**直接生成**，不必為了正常顯示畫面而微調基底 |
| 適用時機 | 不打算改變畫面結構、只是想**替換種族／人物**或**追加新要素**時 |

---

## 1. 基底提示詞與插槽 (Base Prompt & Slot)

`[PROMPT]` 的位置**只是案例之一**——任何符合第 2 節「插槽放置原則」的句子／語意邊界都可以開槽（句首前、句尾後、段落之間皆可）。

```text
a young woman in a provocative, military-style pose.

[PROMPT]

She is dressed in a black, long-sleeved, military-style uniform with red and gold accents, including a tall, black, peaked cap adorned with a red plume. Her short, white-blonde hair is visible beneath the cap. She is wearing black, knee-high, lace-up boots, but her uniform is otherwise open at the bottom, revealing her pale, bare buttocks and white underwear. Her right leg is raised and bent at the knee, emphasizing the exposure of her buttocks and underwear. She has a fair, pale skin tone and a confident, almost defiant expression on her face.
In the background, several male soldiers in similar black, red, and gold military uniforms are standing in a semi-circle, looking towards the viewer. They are all wearing black, peaked caps with red plumes and are standing in front of an ornate, classical-style building with tall, arched windows and a dome-like roof. The building's exterior is made of light-colored stone, and the sky is clear with a few clouds visible. The overall style of the image is hyper-realistic digital art, with a strong emphasis on the contrast between the military uniform and the provocative, exposed pose of the female subject.
```

**基底掌握的結構（固定不動）：** 姿勢、制服、背景士兵與建築、整體風格。
**插槽承載的內容（可替換）：** 角色／種族外觀模組——見第 3 節。

> ⚠ 結尾風格句混入了主體描述，造成替換困難與隱藏殘段——案例分析與拆分改善見第 5 節。

---

## 2. 插槽放置原則 (Slot Placement Rules)

| # | 原則 | 說明 |
| --- | --- | --- |
| 1 | **開在句子／語意邊界** | 插槽前後各自是完整語意單元；**不在詞組中間開槽** |
| 2 | **前後段落自足 (self-contained)** | 前後段的語法不依賴插槽內容補完（避免 `dressed in the [SLOT]` 這類鉤掛） |
| 3 | **無跨槽指代** | 前後段不得使用依賴插入內容的代詞／指涉（`it`、`they`、`holding the ...`） |
| 4 | **插入模組也要自足** | 送進插槽的提示詞本身寫成完整獨立的句子 |
| 5 | **結構指令只由基底宣告一次** | 攝影機、構圖、畫幅、場景歸屬由基底掌握；插入模組**不重複宣告**，避免互相打架 |

```text
✅ 安全開槽點（本檔採用）：句號後的段落空行處
   pose.
   [PROMPT]        ← 前後都是完整句子
   She is dressed...

✗ 危險開槽點：詞組中間
   dressed in a [PROMPT]   ← 插入內容會撞破 冠詞＋名詞 結構
```

### 詞組中間開槽的第二個缺點：替換不方便

除了撞破語法，`dressed in a [PROMPT]` 這種槽**替換也不方便**：

- **不能簡單地整句插入／替換**——插進去的內容被迫只能是殘缺詞組，想換成完整句子就破壞結構
- **必須特別搜尋插入位置**——插槽埋在詞組中間，每次替換都要先定位那個精确位置，容易改錯地方

### 替代做法：以「模組錨點開頭」組織提示詞

比起在詞組中間開槽，**把 `dressed in a xxx` 作為服裝類提示詞的開頭（錨點）**，讓整段成為一個可識別、可整組替換的服裝模組：

```text
服裝模組（本基底的尾段）：
She is dressed in a black, long-sleeved, military-style uniform with red and gold accents, including a tall, black, peaked cap ...

✓ 替換整組服裝 → 整段取代（找到句首錨點 "She is dressed in a" 即得模組邊界）
✓ 只替換上衣 → 在該模組內定位對應衣飾詞組單獨替換
✓ 錨點固定在句首 → 搜尋一次就能定位，不必記住插槽位置
```

> 同理可為各類內容指定錨點開頭：`In the background, ...`＝背景模組、`Painted in ...`＝風格模組——
> 模組邊界由**固定開頭句**標示，而非埋在詞組裡的插槽記號。

---

## 3. 插入模組範例 (Insertion Modules)

以下三則為可直接放入 `[PROMPT]` 的**角色／種族模組**——各自完整自足，替換任一則都不需改動基底。
三則的分類收錄版本（含 D 編號與更多泛人族）見 [prompts/np-char-demi-human.md](prompts/np-char-demi-human.md)。

### 模組 A：蝴蝶貓獸人 (Butterfly-cat Beastfolk)

> 白色蓬松獸毛＋蛾觸角＋生物發光藍紫紋的巨大虹彩蝶翅——替換種族／外觀，姿勢與制服結構不變。

```text
A mystical butterfly-cat beastfolk with soft, fluffy white fur, cat ears, and a long furry tail. Between her ears grow delicate feathery moth antennas. From her back spread magnificent, iridescent giant butterfly wings with bioluminescent blue and violet patterns that cast a gentle light around her.
```

### 模組 B：螳螂貓 (Mantis-cat Hybrid)

> 淡綠貓毛＋玉綠幾丁質鐮刀前臂＋半透明蕾絲薄翅——優雅與昆蟲獵殺感的混合體。

```text
An elegant, tall mantis-cat hybrid featuring pale green feline fur and a slender waist. Her forearms fold into formidable, serrated mantis scythes made of jade-green chitin, while translucent lace-like wings rest against her back, giving her a blend of feline grace and lethal insectoid precision.
```

### 模組 C：蜘蛛貓 (Spider-cat Hybrid)

> 黑色絨毛＋額上八顆猩紅蜘蛛眼＋背後四條幾丁質蜘蛛腿——貓的敏捷結合蛛的威脅感。

```text
An anthropomorphic spider-cat hybrid with a graceful feline body covered in plush black fur. She possesses cat ears and whiskers, accompanied by eight glowing crimson spider eyes on her forehead. Four sharp, chitinous spider legs emerge from her back, and subtle velvet-textured exoskeleton plates reinforce her joints, blending feline agility with arachnid menace.
```

### 合併示範（模組 A 插入 `[PROMPT]`）

```text
a young woman in a provocative, military-style pose.

A mystical butterfly-cat beastfolk with soft, fluffy white fur, cat ears, and a long furry tail. Between her ears grow delicate feathery moth antennas. From her back spread magnificent, iridescent giant butterfly wings with bioluminescent blue and violet patterns that cast a gentle light around her.

She is dressed in a black, long-sleeved, military-style uniform with red and gold accents, ...（其後服裝、背景士兵、建築與風格段落與第 1 節基底逐字相同）
```

> 模組 B／C 同理——把 `[PROMPT]` 整段替換成對應模組即可，其餘零改動。

### 其他插入類型示範 (More Insertion Types)

角色／種族模組之外，插槽同樣能承接**場景要素**與**風格模組**——同一個基底，多種替換：

#### 範例 D：替換種族（精靈）

```text
插入模組：an elf with pointed ears and long silver hair.
```

```text
a young woman in a provocative, military-style pose.

an elf with pointed ears and long silver hair.

She is dressed in a black, long-sleeved, military-style uniform with red and gold accents, ...（其後與第 1 節基底逐字相同）
```

#### 範例 E：追加要素（背景＋光線）

```text
插入模組：A torch-lit stone corridor recedes into darkness behind her.
```

```text
a young woman in a provocative, military-style pose.

A torch-lit stone corridor recedes into darkness behind her.

She is dressed in a black, long-sleeved, military-style uniform with red and gold accents, ...（其後與第 1 節基底逐字相同）
```

> ⚠ 範例 E 會與基底既有的背景段（古典建築、士兵半圓隊形）**並存**——若只想換背景，請同時移除基底的背景句（那就屬於「有意改動畫面結構」，超出零改動合併的範圍）。

#### 範例 F：風格模組

```text
插入模組：Painted in soft cel-shaded anime style with cool blue rim lighting.
```

```text
a young woman in a provocative, military-style pose.

Painted in soft cel-shaded anime style with cool blue rim lighting.

She is dressed in a black, long-sleeved, military-style uniform with red and gold accents, ...（其後與第 1 節基底逐字相同）
```

> ⚠ 風格模組會與基底結尾的 `hyper-realistic digital art` **衝突**——換風格時請同步移除基底的風格句，或直接選用與基底相容的風格。

---

## 4. 為什麼不需要微調 (Why No Re-tuning Is Needed)

- **詞元序列的獨立性** — 模型把提示詞視為連續詞元；在句子邊界插入＝新增一個**獨立分句**，既有的分句語意指向不被改寫
- **結構與可變模組解耦** — 姿勢／制服／背景／風格（結構）固定在基底，種族特徵（可變）走插槽 → 替換種族或追加要素時，結構自然不受影響
- **分段空行（主要服務人類）** — **有沒有分行，對生成圖片的影響不大**；真正的價值在**人類閱讀性**與**可替換性**：空行標示模組邊界，讓結構一眼可讀、整段選取即可替換（見第 2 節「模組錨點開頭」）

---

## 5. 反模式 (Anti-patterns：會破壞合併的寫法)

| ✗ 反模式 | 後果 | ✓ 修正 |
| --- | --- | --- |
| 在詞組中間開槽：`dressed in a [PROMPT]` | 撞破冠詞＋名詞結構；**替換不方便**——不能整句插入／替換，必須特別搜尋插入位置 | 開在句子／語意邊界，或改用「模組錨點開頭」（見第 2 節） |
| 跨槽指代：`she holds it up`（`it` 在另一段） | 指涉對象不明，畫面出現懸空物件 | 每段自足，不跨段指代 |
| 插入模組重宣告構圖／視角 | 與基底的姿勢、場景衝突，構圖漂移 | 構圖只由基底宣告一次 |
| 插入模組自帶第二場景 | 背景互相競爭（若非預期） | 場景歸基底，模組只描述角色 |
| 一次插入多個互相矛盾的角色模組 | 主體混亂、風格互相抵銷 | 一個插槽只放一個模組 |
| **風格句夾帶主體描述**（本基底結尾句） | 混合職責——風格不能輕鬆單獨替換；移除前面的主體段後，**結尾仍藏著主體殘段**，事後才發現 | 拆成「純風格句」＋「主體對比句」各自獨立成模組（見下方案例分析） |

### 案例分析：本基底的結尾句

**原句：**

```text
The overall style of the image is hyper-realistic digital art, with a strong emphasis on the contrast between the military uniform and the provocative, exposed pose of the female subject.
```

**三個問題：**

1. **不能輕鬆替換** — 風格與主體強調綁在同一句：換風格會連帶動到主體描述，只想動主體又怕弄壞風格句
2. **隱藏的主體殘段** — 即使把前面段落的人物主體全部移除，這句尾端仍藏著 `the female subject`——**把人物去掉後才發現後面又藏了一部分**
3. **職責混合** — 與畫面風格一起描述了主體對比，違反「一個模組只承載一種職責」；本質是 §2 規則 3「跨槽指代」的隱形變體——主體被宣告了兩次，分散在不同段落

**拆分改善（拆成兩個可獨立進退的模組）：**

```text
風格模組（錨點 "The overall style"，可整組替換）：
The overall style of the image is hyper-realistic digital art.

主體對比模組（緊接主體／服裝段落之後，隨主體一起增刪）：
Strong emphasis on the contrast between the military uniform and the provocative, exposed pose of the female subject.
```

**拆分後的效果：**

- **換風格** → 只替換風格句，主體描述不受影響
- **移除人物** → 「主體對比模組」與前面主體段**一起刪**，風格句完好留下——不再有殘段
- 各句錨點固定開頭、搜尋即可定位（第 2 節「模組錨點開頭」原則）
- **放置位置**：主體對比句應緊鄰主體段落，不要混進結尾的風格段

---

## 6. 合併操作流程 (Merge Procedure)

1. 複製基底提示詞（第 1 節，含插槽標記）
2. 用插入內容**整段替換** `[PROMPT]`（不留標記）
3. 直接生成——**不需其他微調**

> 需要更多基底／插槽組合時，依 `mp-` 前綴續建系列檔案（mp-prompts-merge-002 …）。
