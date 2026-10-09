---
description: >-
  「泛人族角色外型模組 (Demi-human Appearance Modules)」收錄集，
  中文簡稱「泛人族模組」（檔名前綴 np- = natural-language prompt）。
  分類收錄亞人／獸人／精靈／半機人等非人種族的**角色外型描述**，
  以 D#### 編號（D = demi-human），分獸人、獸蟲混種、精靈族、半機人四類，
  附待擴充清單。收錄原則：只收「種族＋外觀」模組，
  不收與該種族相關的建築、場景、事物；各模組自足，
  可直接插入 [PROMPT] 插槽（見 references/mp-prompts-merge-001.md）。
tags:
  - prompts/examples
  - prompts/character
  - prompts/natural-language
  - documentation/references
---

# 泛人族角色外型模組 (Demi-human Appearance Modules)

> 本檔收錄**可插入任何基底提示詞的角色外型模組**——只描述「是什麼種族、長什麼樣」，
> **不收**該種族的建築、城市、場景、專屬事物（那些屬場景範例，見文末「相關範例」）。

| 名稱欄位 | 內容 |
| --- | --- |
| 檔名前綴 | `np-` = natural-language prompt（自然語言提示詞） |
| 編號前綴 | `D` = demi-human（泛人族） |
| 收錄原則 | 只收**角色外型**（種族＋外觀＋特徵），適度排除建築／場景／事物 |
| 使用方式 | 整段替換基底提示詞的 `[PROMPT]` 插槽，其餘零改動（見 [mp-prompts-merge-001.md](../mp-prompts-merge-001.md)） |

> **計數與下一編號：** 新增模組的**下一則編號由 D0007 開始**——一律接續全局最大編號，**空號不補**。

## 分類索引

- **一、獸人 (Beastfolk)** — D0001 蝴蝶貓獸人
- **二、獸蟲混種 (Beast × Insect/Arachnid)** — D0002 螳螂貓、D0003 蜘蛛貓
- **三、精靈族 (Elven)** — D0004 銀髮精靈、D0005 暗精靈女性
- **四、半機人／生化族 (Cyborg)** — D0006 生化機械女性
- **待擴充** — 妖精、矮人、龍人、鳥人、蛇人、半魚人、獸耳娘（純獸耳）等

---

## 一、獸人 (Beastfolk)

### D0001. 蝴蝶貓獸人 (Butterfly-cat Beastfolk)

> 白色蓬鬆獸毛＋貓耳長尾＋蛾觸角＋生物發光藍紫紋的巨大虹彩蝶翅——替換種族／外觀時姿勢與服裝結構不變。
> 來源：[mp-prompts-merge-001.md](../mp-prompts-merge-001.md) §3 模組 A。

```text
A mystical butterfly-cat beastfolk with soft, fluffy white fur, cat ears, and a long furry tail. Between her ears grow delicate feathery moth antennas. From her back spread magnificent, iridescent giant butterfly wings with bioluminescent blue and violet patterns that cast a gentle light around her.
```

---

## 二、獸蟲混種 (Beast × Insect/Arachnid)

### D0002. 螳螂貓 (Mantis-cat Hybrid)

> 淡綠貓毛＋纖細腰身＋玉綠幾丁質鐮刀前臂＋半透明蕾絲薄翅——優雅與昆蟲獵殺感的混合體。
> 來源：[mp-prompts-merge-001.md](../mp-prompts-merge-001.md) §3 模組 B。

```text
An elegant, tall mantis-cat hybrid featuring pale green feline fur and a slender waist. Her forearms fold into formidable, serrated mantis scythes made of jade-green chitin, while translucent lace-like wings rest against her back, giving her a blend of feline grace and lethal insectoid precision.
```

### D0003. 蜘蛛貓 (Spider-cat Hybrid)

> 黑色絨毛＋貓耳鬍鬚＋額上八顆猩紅蜘蛛眼＋背後四條幾丁質蜘蛛腿＋關節絨面甲殼——貓的敏捷結合蛛的威脅感。
> 來源：[mp-prompts-merge-001.md](../mp-prompts-merge-001.md) §3 模組 C。

```text
An anthropomorphic spider-cat hybrid with a graceful feline body covered in plush black fur. She possesses cat ears and whiskers, accompanied by eight glowing crimson spider eyes on her forehead. Four sharp, chitinous spider legs emerge from her back, and subtle velvet-textured exoskeleton plates reinforce her joints, blending feline agility with arachnid menace.
```

---

## 三、精靈族 (Elven)

### D0004. 銀髮精靈 (Silver-haired Elf)

> 尖耳＋長銀髮——最短可用的種族替換模組，示範「一句話也能成為合法插槽內容」。
> 來源：[mp-prompts-merge-001.md](../mp-prompts-merge-001.md) §3 範例 D。

```text
an elf with pointed ears and long silver hair.
```

### D0005. 暗精靈女性 (Dark Elf Woman)

> 月光膚色＋黑曜石長髮＋發光雙眼＋金屬線與蜘蛛絲織成的甲冑＋水晶碎片項鍊。
> 摘錄自 [np-fluent-narrative-paragraph-example.md](np-fluent-narrative-paragraph-example.md) P0003。

```text
a dark elf woman in quiet, commanding poise. Her skin glows with a cool moonlit sheen, contrasting with cascading obsidian hair that flows down her back like liquid night. Her eyes shine with an intense, focused light. She wears armor and silk woven from metallic threads and spider-silk, the material catching the light in shifting patterns like constellations. Silver filigree wraps around her shoulders, and a necklace of carved crystal shards rests against her chest.
```

---

## 四、半機人／生化族 (Cyborg)

### D0006. 生化機械女性 (Bio-mechanical Woman)

> 矽膠肌膚外露＋傷痕與戰損＋電路中微弱閃爍的 LED——半機人外型基底，種族詞 `bio-mechanical` 可直接替換為其他機械族。
> 摘錄自 [np-photo-001.md](np-photo-001.md) 的角色拆解版。
> ⚠ `m3tsumi1` 為原提示詞使用的模型／LoRA 觸發詞，非種族描述，替換模型時應移除。

```text
a bio-mechanical Asian woman m3tsumi1, her silicon skin is completely revealed. The woman's exposed silicon parts show signs of wounds, and battle damage, with subtle LED lights flickering weakly in her circuitry.
```

---

## 待擴充 (To Be Expanded)

尚未收錄、未來可依「只收外型」原則補齊的泛人族：

| 種族 | 備註 |
| --- | --- |
| 妖精 (Fairy) | [np-spatial-layer-structured-example.md](np-spatial-layer-structured-example.md) L0008 僅有鳥籠內的小仙女片段，非自足模組 |
| 貓太空人 (Chibi Cat Astronaut) | [np-style-mix.md](np-style-mix.md) 屬風格混合範例中的片段，非自足模組 |
| 矮人／龍人／鳥人／蛇人／半魚人 | 目前無範例 |
| 獸耳娘（純獸耳、無獸化軀體） | 目前無範例；與 D0001–D0003 的全身獸化的差異需標註 |

---

## 使用原則 (Usage Rules)

插槽使用規則詳見 [mp-prompts-merge-001.md](../mp-prompts-merge-001.md)（插槽放置原則、反模式），與本檔相關的重點：

- **模組自足** — 每則外型模組都是完整獨立的句子，可整段插入／整段替換
- **構圖只由基底宣告一次** — 外型模組不重複宣告視角、構圖、場景歸屬
- **服裝歸屬擇一** — 服裝寫在基底或寫在模組，不可兩邊同時宣告（避免互相打架）
- **一個插槽一個模組** — 不一次插入多個互相矛盾的種族模組

## 相關範例（場景類，不收於本檔）

與泛人族**相關但屬場景／建築**的完整範例，見：

- [np-fluent-narrative-paragraph-example.md](np-fluent-narrative-paragraph-example.md) — P0002 暗精靈地下城市、P0003 暗精靈王座與金門（敘事式場景範例）

---

**相關連結：**

- 主技能：[SKILL.md](../../SKILL.md)
- 範例索引：[README.md](README.md)
- 合併／插槽技法：[mp-prompts-merge-001.md](../mp-prompts-merge-001.md)
- 角色基底（人類外型對照）：[np-char-base.md](np-char-base.md)
