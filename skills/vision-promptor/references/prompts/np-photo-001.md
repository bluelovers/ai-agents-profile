---
description: >-
  「寫實照片風提示詞」範例集（檔名前綴 np- = natural-language prompt）。
  收錄 8 則寫真／電影感提示詞，依內容分三類：寫真與浮世繪、
  主體與場景拆解示範（同一題材的完整版／場景版／角色版）、
  電影感與時裝寫真；無編號（依分類分節排列），
  含 1 則中文提示詞與 1 組拆解對照。
tags:
  - prompts/examples
  - prompts/natural-language
  - image-generation
  - documentation/references
---

# 寫實照片風範例 (Photo-realistic Examples)

## 分類索引

- **一、寫真與浮世繪** — 【寫真人像】地鐵站長椅上的旅人、【浮世繪變體】昭和雪夜車站的鐵道員
- **二、主體與場景拆解示範** — 同一題材的【完整版】／【場景版】／【角色版】三種交付版本
- **三、電影感與時裝寫真** — 【電影致敬】王家衛式香港街景、【中文提示詞】地鐵車廂日系少女、【時裝寫真】黑西裝抽煙女性

---

## 一、寫真與浮世繪 (Photography & Ukiyo-e)

### 【寫真人像】地鐵站長椅上的旅人（35mm 膠片感）

> 隨拍感全身人像：長椅上閉眼小憩的旅人、寬鬆旅行服與探險背包、透視的月台背景——自然姿勢、柔和暖光與膠片顆粒。

```
A candid, atmospheric full-body photograph of a gorgeous 22-year-old woman resting peacefully on a weathered wooden bench inside a quiet subway station.

She is lying back in a completely natural, relaxed pose, with her eyes softly closed and a gentle, serene smile on her face, as if listening to music or dreaming of her next destination.
She is dressed in comfortable, stylish travel clothing, including an oversized knit sweater, relaxed-fit cargo pants, and worn-in sneakers.
Resting on the bench right next to her is a large, rugged adventure travel backpack covered with a few subtle country flag patches.

The background shows the perspective of the subway platform, with tiled walls, distant station signs, and soft, warm overhead lighting that casts a gentle glow on her face.
The atmosphere is calm and cinematic, capturing a quiet moment of a journey.
Shot on 35mm film with a shallow depth of field, natural colors, and a soft, realistic grain.
```

### 【浮世繪變體】昭和雪夜車站的鐵道員

> 以 `flowing blush stroke turning into ukiyo-e` 開頭的風格混血：暴雪中向離站蒸汽火車敬禮的鐵道員，靛藍／赭／紅色料與大正昭和懷舊氛圍。

```

flowing blush stroke turning into ukiyo-e, very aesthetic, night,
an elderly railway worker in an early Showa-era winter uniform standing alone on a snowbound remote mountain station platform,
a dark, muted visual tone with heavy snowfall obscuring the view, the air thick with swirling snow,
the worker giving a formal salute as a steam locomotive slowly departs, its warm headlight cutting through the blizzard and barely illuminating the scene,
the station buried in deep snowdrifts, harsh wind sweeping across the empty platform,
weathered wooden station signs, frosted rails, vintage early-Showa atmosphere,
high detail, cinematic realism, cold, desolate, and somber mood,
rich indigo, ochre and red pigments, a distant cityscape in the background
```

---

## 二、主體與場景拆解示範 (Subject / Scene Decomposition)

> 同一題材的三種交付版本：**完整版 → 只留場景版 → 只留角色版**，
> 示範如何把「角色外型」與「場景環境」拆成可獨立替換的模組
> （角色版即 [np-char-demi-human.md](np-char-demi-human.md) D0006 的原始出處）。

### 【完整版】廢墟生化機械女性（角色＋場景）

```
Hyper-realistic cinematic shot of,
a bio-mechanical Asian woman m3tsumi1, her silicon skin is completely revealed.
The woman's exposed silicon parts show signs of wounds, and battle damage, with subtle LED lights flickering weakly in her circuitry.
Dirt and grime coat her form, emphasizing the passage of time.
She sits leaning, against a crumbling stucco wall, its texture rough and weathered.
The wall is overtaken by nature, with creeping vines, vibrant wildflowers, and dense foliage bursting through cracks.
The scene is set centuries after a devastating post-apocalyptic battle.
Shafts of golden sunlight filter through the overgrown canopy above, casting dappled shadows across the scene.
The atmosphere is one of eerie beauty and abandoned technology reclaimed by nature.
Ultra-detailed textures, dramatic lighting, and a muted color palette dominated by earth tones and metallic hues. 8K resolution, photorealistic rendering, cinematic composition.
```

### 【場景版】廢墟藤蔓與金色天光（移除主體）

> 只保留牆面、藤蔓、天光與氛圍，移除角色——對應主技能「無人物版本」以正面狀態描述維持畫面可讀性的做法。

```
Hyper-realistic cinematic shot of,
Dirt and grime, emphasizing the passage of time.
The wall is overtaken by nature, with creeping vines, vibrant wildflowers, and dense foliage bursting through cracks.
The scene is set centuries after a devastating post-apocalyptic battle.
Shafts of golden sunlight filter through the overgrown canopy above, casting dappled shadows across the scene.
The atmosphere is one of eerie beauty and abandoned technology reclaimed by nature.
Ultra-detailed textures, dramatic lighting, and a muted color palette dominated by earth tones and metallic hues. 8K resolution, photorealistic rendering, cinematic composition.
```

### 【角色版】生化機械女性（移除場景）

> 只保留角色外型，可直接作為其他基底提示詞的插槽內容。

```
a bio-mechanical Asian woman m3tsumi1, her silicon skin is completely revealed.
The woman's exposed silicon parts show signs of wounds, and battle damage, with subtle LED lights flickering weakly in her circuitry.
She sits leaning, against a crumbling stucco wall, its texture rough and weathered.
```

---

## 三、電影感與時裝寫真 (Cinematic & Fashion)

### 【電影致敬】王家衛式香港街景

> 致敬《重慶森林》美學：前景制服警員清晰靜止，背景以 step-printing 拉出群眾光跡，霓虹綠紅黃高對比與都市孤獨感。

```
A stylistic film still, Wong Kar-wai "Chungking Express" aesthetic. A melancholic policeman (Tony Leung style) in uniform leans against a cluttered snack bar counter, holding a coffee cup, looking lost in thought. He is relatively sharp and static. The background is dominated by a strong step-printing effect with heavy motion blur: crowds of people walking past are smeared into trails of light and color, creating a dizzying sense of time passing rapidly. High contrast lighting, saturated neon greens, reds, and yellows creating light streaks. Urban isolation atmosphere, chaotic Hong Kong street vibe visible through windows. Film grain, deep shadows.
```

### 【中文提示詞】地鐵車廂日系少女

> 全中文撰寫的寫真人像：絕對領域、冷調車廂燈光、淺景深與相機角度說明——示範自然語言提示詞不必限定英文。

```
这是一幅逼真写照, 描绘了一位身材苗条, 宛如模特的惊艳日本年轻女性.她拥有白皙如瓷的肌肤, 一头齐肩的铂银色或白色秀发, 修剪成利落的波波头, 柔软的刘海轻轻垂在脸庞两侧.她直视镜头, 目光深邃且充满吸引力, 仿佛在与观看者进行无声的交流.她优雅地坐在地铁长椅上, 双腿交叉于膝盖处.她的双手轻轻托着膝上的黑色智能手机, 却并没有看向屏幕, 而是完全专注于镜头前的观众.
她身着一套时尚的全黑单色套装, 包括一件紧身无袖黑色露脐上衣, 露出她的腹部, 搭配高腰黑色牛仔迷你短裤.她脚穿透明的黑色高筒丝袜, 大腿顶部有一条独特的不透明纯黑色带子, 营造出绝对领域的美学效果.她脚上还穿着一双闪亮的黑色细跟高跟鞋.
场景设定在一节现代地铁列车的车厢内.她坐在一条长而光滑的蓝色塑料长椅上.她右手边是一根垂直的银色金属扶手杆.她身后是巨大的长方形地铁窗户, 窗外是漆黑的夜色或隧道中的黑暗.列车墙壁干净整洁, 呈米白色/浅灰色.窗户玻璃上模糊地映照着其他乘客或列车内部的景象.
灯光为冷色调, 漫射式的人工室内地铁灯光, 在她皮肤和头发上营造出柔和逼真的光泽.她的长袜和金属杆上有微妙的镜面高光.这张照片是中景到全景的拍摄, 捕捉了她坐着时的全身形象.相机角度略低, 突出了她的腿部.背景的景深较浅（散景), 使主体焦点清晰, 同时柔化了她身后的列车细节.
高品质的逼真效果, 8K分辨率, 电影级的构图, 柔和的焦距, 细腻的纹理.风格类似于高端时尚摄影或K-pop偶像的抓拍.纳米香蕉风格（干净, 锐利, 略带理想化的写实风格）.通过她的眼神和姿态, 让观看者感受到一种强烈的视觉连接和情感共鸣.
```

### 【時裝寫真】黑西裝抽煙女性

> 上半身戲劇構圖：黑色西裝外套、白絲襯衫、指間香菸與濃煙團、高對比電影光。
> ⚠ 尾句混入標籤式詞彙（`masterpiece, 8k, sensual, cleavage, dramatic pose`）——
> 屬敘事式＋標籤式混用的歷史寫法，參考時可視需求刪減或改寫為正面敘述。

```
A striking, beautiful young East Asian woman, with long, silky black hair, wearing a tailored black blazer and a slightly unbuttoned white silk blouse.
She is posed dramatically in an upper body shot, holding a cigarette lit between her fingers, exhaling a thick, voluminous cloud of smoke that drifts around her.
Her expression is intense and mysterious.
Cinematic lighting, high contrast, soft shadows, depth of field (DoF),
masterpiece, 8k, photorealistic, Canon EOS R5, professional photoshoot, studio lighting, full body smoke plume, cleavage, sensual, dramatic pose.
```

