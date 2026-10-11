---
description: >-
  「角色姿勢與動作模組 (Pose & Action Modules)」提示詞範例集
  （檔名前綴 np- = natural-language prompt，001 = 本系列第 1 則）。
  只收「身體怎麼擺、朝哪邊」——朝向、頭部轉動、肢體延伸；
  不收相機視角／景別（屬 np-style-composition-001.md）、
  不收眼神／嘴部表情（屬 np-char-expressions-001.md）。
tags:
  - prompts/examples
  - prompts/character
  - prompts/natural-language
  - documentation/references
---

# 角色姿勢與動作模組範例 (Pose & Action Modules)

> 本檔收錄**可插入任何基底提示詞的姿勢／動作模組**——只描述「身體怎麼擺、朝哪邊」，
> **不收**相機視角與景別（屬 [np-style-composition-001.md](np-style-composition-001.md)），
> **不收**眼神與嘴部表情（屬 [np-char-expressions-001.md](np-char-expressions-001.md)）。

## 分類索引

- **【姿勢・背影回眸】** 背對鏡頭、臉微轉露出顴骨下顎線、双腿前伸坐姿
- **【朝向・橫向側面】** 嚴格 `facing right`／`facing left`、`side-view`、不面向讀者

---

### 【姿勢・背影回眸】背對鏡頭、臉微轉露側顏

> **朝向：** 背對鏡頭。**頭部：** 微轉到只露出顴骨與下頦的輪廓線。**下肢：** 双腿伸直前伸（坐姿）。
> 「背對＋臉微轉露側顏」是一組——頭部轉動的**幅度**（`just enough to reveal`）是关键，
> 轉太多會變成正側面、轉太少看不到臉；替換時保持「朝向 ＋ 頭部轉幅 ＋ 下肢」三段結構。

```
She faces away from the camera, her head turned just enough to reveal the clean line of her cheekbone and jaw. Her legs extend straight out in front of her.
```

---

### 【朝向・橫向側面】嚴格向左／向右、不面向讀者

> **朝向：** `strictly facing right` 或 `strictly facing left`——**二選一、嚴格限制**。
> **視角：** `side-view`／`in profile`（相機在側面，須與朝向一致）。
> **全身基準：** `full-body view`＋`positioned on a flat ground level`（sprite 需腳踩地平線、全身入畫）。
>
> 橫向角色的分水嶺是「**嚴格向左／向右，而不是看向閱讀者**」——
> 它與「立繪」（正面向讀者）的差別，就在**朝向是否鎖定在畫面左／右**。
>
> - ❌ `facing the viewer`／`looking at the camera`／`front view`／`facing forward` → 變成正面肖像（立繪）
> - ✅ `strictly facing right in a side-view ready stance` → 鎖定單向、側面可讀
>
> **姿勢須從側面可讀**（靠剪影）：`ready stance`、`lunging attack`、`defensive block`
> 這類側面輪廓清楚的動作才成立；避免只有正面才看得出的姿勢（例如張開雙臂正對鏡頭）。
>
> **術語分工：** `facing right/left` 屬**朝向**（本檔）；`side-view` 作為**相機視角**屬
> [np-style-composition-001.md](np-style-composition-001.md)。sprite 二者幾乎同義、須一致，
> 描述時同時寫上最穩。
>
> 完整實戰（含 `{a|b|c}` 動態姿勢槽）見 [np-game-001.md](np-game-001.md) 第 4 則。

```
A single game character in full-body view, strictly facing right in a side-view fighting stance, positioned on a flat ground level.
```

---

**相關連結：**

- 主技能：[SKILL.md](../../SKILL.md)
- 範例索引：[README.md](README.md)
- 構圖與取景：[np-style-composition-001.md](np-style-composition-001.md)
- 眼神與表情：[np-char-expressions-001.md](np-char-expressions-001.md)
- 服裝：[np-char-costume-001.md](np-char-costume-001.md)
- 遊戲畫面（橫向 sprite 實戰）：[np-game-001.md](np-game-001.md)

## 未整理
