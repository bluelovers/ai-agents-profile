---
description: >-
  「風格混合 (Style Mix)」提示詞範例集。收錄 3 則——
  「虛實混合」基礎版（同一畫面中照片寫實與 2D 動畫兩種風格的角色並置，
  結構為左角色（風格 A）＋右角色（風格 B）＋互動姿勢＋背景＋對比句＋技術尾句）、
  寫實背景＋2D 吉祥物、寫實場景＋2D 騎士兩則「背景 × 角色」變體；
  可基於基礎版結構產生各種變體（替換風格、角色、場景、互動方式）。
tags:
  - prompts/examples
  - prompts/natural-language
  - image-generation
  - documentation/references
---

# 風格混合提示詞範例 (Style Mix Examples)

> 目前收錄 3 則：虛實混合（基礎版）、照片寫實背景＋2D 吉祥物、寫實辦公室＋2D 騎士。
> 本篇範例以「**可基於此產生各種變體**」為目的撰寫——結構固定、內容槽位化，
> 變體產生方式見說明。

## 分類索引

- **【虛實混合・雙角色】照片寫實 × 2D 動畫** — 基礎版，左右角色同服裝同互動、僅風格不同；含變體產生方式
- **【虛實混合・背景 × 角色】寫實背景＋2D 吉祥物** — 照片寫實雨夜賽博城景＋手繪 2D 膠筆風太空貓
- **【虛實混合・背景 × 角色】寫實場景＋2D 騎士** — 寫實辦公室＋平面 2D 線稿矮人騎士，編輯插畫式反差


#### 變體產生方式（基於虛實混合基礎版）

**固定結構（所有變體沿用）：**

```text
A high-resolution [shot type] of [subject] inside [scene].

Left character: [風格 A 的角色描述 + 該風格的質感/光線關鍵詞]
Right character: [風格 B 的角色描述 + 該風格的質感/光線關鍵詞]
（兩側服裝、特徵保持相同——只讓「風格」不同）

Pose & Interaction: [雙方共享的姿勢與互動]
Background: [場景細節]
High contrast visual dynamic between [風格 A] and [風格 B].
[技術尾句：解析度、構圖]
```

**可替換槽位（由此衍生各種變體）：**

| 槽位 | 範例替換 |
| --- | --- |
| 風格 A × 風格 B | 照片寫實 × 水彩、3D 渲染 × 像素風、油畫 × 黏土定格、線稿 × 完成稿 |
| 角色 | 同一角色雙風格、不同角色同風格、人物 × 動物 |
| 場景 | 展場、街頭、教室、自然風景、室內 |
| 互動 | 擊掌、握手、背靠背、共同注視同一物體 |
| 對比句 | 依風格替換 `between photorealism and 2D anime art` |


---

### 虛實混合：照片寫實 × 2D 動畫（基礎版）

> 同一畫面左右並置兩種媒介的角色：左為照片寫實（實），右為 2D 賽璐璐動畫（虛），
> 服裝與互動完全相同，只以風格差異製造對比。

```
A high-resolution medium shot of two characters standing side-by-side inside a bustling, realistic anime convention hall.

Left character: A photorealistic Malfoid cosplayer, a girl with long straight blonde hair, sharp eyeliner, green eyes, and large black hoop earrings. She wears a Slytherin hogwarts school uniform, dark open wizard robe with emerald green inner lining, grey v-neck knit sweater, collared white shirt with a green and silver striped tie, pleated black mini skirt, sheer black pantyhose. The Malfoid cosplayer is wearing an extremely detailed, hand-crafted cosplay outfit, featuring realistic clothing and fabric texture, natural skin texture, realistic hair physics, and soft studio camera lighting.

Right character: The original 2D anime Malfoid in authentic cel-shaded anime art style, with crisp line art, vibrant saturated colors, and expressive anime features. The 2D style Malfoid is wearing a Slytherin hogwarts school uniform, dark open wizard robe with emerald green inner lining, grey v-neck knit sweater, collared white shirt with a green and silver striped tie, pleated black mini skirt, sheer black pantyhose. She has long blonde hair, sharp eyeliner, green eyes with ringed pupils, and large black hoop earrings.

Pose & Interaction: Both characters are standing close together, smiling happily at the camera. Each brings one hand up to the center to touch their fingers together, jointly forming a completed hand-heart shape.

Background: They are standing in a sprawling,
realistic comic-con interior filled with blurred background crowds, colorful vendor booths, hanging anime banners, and bright overhead convention hall lighting.
High contrast visual dynamic between photorealism and 2D anime art.
8k resolution, cinematic composition.
```

---


### 【虛實混合・背景 × 角色】寫實背景＋2D 吉祥物

> 照片寫實的雨夜賽博城景（懸浮看板、積水霓虹倒影）＋手繪 2D 膠筆風的太空貓吉祥物——
> 「背景寫實、角色 2D」的單角色反差寫法，一句式緊湊排版。

```
Photorealistic rainy rooftop overlooking a dense cyberpunk city,
holographic billboards glowing through mist, puddles reflecting neon,
a chibi cat astronaut gazing over the edge, quiet futuristic melancholy,
cinematic sci'fi photography fused with hand-drawn 2D gel-pen character.
```

---

### 【虛實混合・背景 × 角色】寫實場景＋2D 騎士

> 寫實開放式辦公室（玻璃牆、筆電、 harsh 正午光）＋桌面站立的平面 2D 線稿矮人騎士——
> 以「幻想純真 × 公司現實」的反差營造社論插畫式諷刺感。

```
A photorealistic open-plan office filled with glass walls, laptops, coffee mugs, and harsh midday lighting.
Standing on a desk is a chibi medieval knight in full armor, holding a tiny flag instead of a sword.
The knight is rendered as a flat 2D sketch with bold outlines and playful proportions.
The scene should feel satirical and clever, like an editorial illustration for a modern business magazine, emphasizing contrast between fantasy innocence and corporate realism.
```
