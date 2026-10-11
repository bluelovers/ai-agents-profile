---
description: >-
  遊戲畫面提示詞範例集 (Game Screen Prompts)：像素街機、
  2.5D 背景模板與合作平台遊戲的畫面／場景提示詞、角色、sprite。
tags:
  - prompts/examples
  - prompts
  - documentation/references
---

# 遊戲畫面提示詞 (Game Screen Prompts)

> **語法約定：本檔的 `#` 視為「空行」**（段落分隔），不是註解、也不是字面內容。

---

## 分類

### 場景 / 橫向

> **分類軸：階層路徑** —— `場景 / 橫向` 與 `場景 / 橫向 / 上下關卡型`。
> 兩者的差別在可移動遊玩區域的**關卡是否有垂直分層**；而這根源於**地面的角度**——
> `上下關卡型`＝**Side-View Platformer**，地面**水平**、上下層**就是遊玩區域**（水平＋上下階層移動）。
> 完整視角分類（含橫向格鬥、Oblique、Isometric、Vertical-Scrolling）見下方「場景視角與地面角度」。

#### 【場景・橫向】像素橫向射擊：火車頂 run-and-gun

**介紹：** 像素風側視 run-and-gun——紅褐長髮男子持槍，在夕陽下兩節高速貨車廂間躍進；車尾立著橘色鑽臂機器人首領，沙漠台地、電線桿與巨大橘陽以視差橫掠，左上 HUD、右上小地圖。
**分類：** `場景 / 橫向` —— run-and-gun 兼具**橫向卷軸**與**上下階層**概念。
**結構：** 開場＋人物 → 首領＋背景視差 → UI（HUD／小地圖）→ 像素質感。

```text
runandgunplatformmale,
A wide pixel art side view run-and-gun game screen shows

an adult white man aged 24 with shoulder-length brown hair, fair skin and a solid build,
the player hero leaping between two speeding freight train cars at sunset, his rifle raised.
He wears a black sleeveless shirt, navy cargo trousers and tan boots.

A hulking orange robot boss with a drill arm stands on the last car, sparks flying from its wheels.
Desert mesas, telegraph poles and a huge orange sun streak past in layered parallax behind the train.

The upper left HUD shows "1P", a male portrait, small face icons, a green life bar and a gun icon,
and the upper right minimap diagrams cyan platforms and ladders with a yellow dot and a red enemy mark on a dark grid.

Crisp square pixels texture the entire scene.
```

> https://civitai.red/models/2992824/run-and-gun-platform-classic-arcade-pixel-style?modelVersionId=3393908

---

#### 【場景・橫向】像素格鬥勝利畫面 (NSFW)

**介紹：** 像素風側視街機格鬥的「YOU WIN」勝利畫面——地下鐵籠擂台中央，一名剃頭、深膚色的壯碩格鬥家舉拳慶功（⚠含裸露）；左上金色人頭像與綠色血條，四周環繞鐵網牆、群眾剪影與從上方打下的探照燈。
**分類：** `場景 / 橫向` —— 單屏格鬥擂台、單一地面但帶透視深度。
**視角：** 屬**橫向格鬥（Belt-Scrolling／arcade fighting）**。
**結構：** 場景（鐵籠）→ 人物（外觀／姿勢）→ UI（YOU WIN／血條）→ 環境光線。

```text
sideviewarcadefight,
A pixel-art screenshot of a side-view arcade fighting game victory screen

inside a chain-link underground fight cage, wide frame, with dithered metal mesh, crisp outlines and red and steel-gray tones.

An adult Latino man aged 24 with a shaved head, deep tan skin and a broad wrestler build stands at the center, facing the viewer,
completely nude with bare feet,
in a triumphant pose with his right fist raised high.

Large gold pixel letters "YOU WIN" glow across the top, and a gold face portrait and a full green health bar sit in the upper left corner.

Chain-link walls, a cheering silhouetted crowd, hanging spotlights and a scuffed padded floor surround him, and a spotlight from above lights his sweaty muscles.
```

> https://civitai.red/models/2990884/side-view-arcade-fighters

---

#### GB0001【場景・橫向】2.5D 背景模板（保留原始排版）

**分類：** `場景 / 橫向` —— `2D side-scrolling video game background`，主軸為水平捲軸背景、**無固定上下關卡層**。
**視角：** 用意是**擴張角度、讓地面範圍更大**，好**排列前後＋上下的多列角色**；角度介於**橫向格鬥（Belt-Scrolling）**與 **Oblique View（明日方舟一代）**之間、**較接近 Isometric**——提示詞自身即帶 `three-quarter perspective`／`elevated viewpoint`。

> **⚠ 本則不整理排版。**
> 它**有效但難看雜亂**——是為了讓畫面逼近預期結果而**不得已的妥協寫法**（堆疊 trigger、`BREAK`、插槽與否定詞）。
> 保留原始狀態才有參考價值（記錄真實工作狀態）；重排反而會誤導它「應該長這樣」。
> 下方**逐字保留**，含 `(…:2)` 加權、`BREAK`、`[PROMPT]`、`#` 與尾部否定詞。

**為何保留雜亂：** `#`、`BREAK`、`[PROMPT]` 在此為**功能性語法**（分段／斷句／插槽），非排版瑕疵——本檔「`#` = 空行」的約定只適用於**純排版用途**（如第 2 則），不套用到這種功能用法。

```text
(pixel art, pixel game, pixel game background, pixelart-sideview, runandgunplatformmale:2),
2D video game background,
A 2D side-scrolling video game background, empty scene with no characters.
three-quarter perspective,
elevated viewpoint,
2.5D tactical RPG and side-view battle stage composition,
A spacious playable area occupies approximately the lower 2/3 of the canvas,
providing sufficient continuous visible space for character placement, standing, movement, and combat.
The playable area spans broadly across the lower composition and remains visually readable,
while its surface, material, and structure are determined by the depicted environment.
Keep the central lower area relatively unobstructed for character placement.
Clear foreground, midground, and background depth,
strong environmental depth,
coherent spatial composition.
Hand-drawn digital pixel painting,
clean pixel-art shading,
rich ambient lighting,
highly detailed game environment background.
BREAK
#,
[PROMPT]
#,
from above, no humans, no gore, no readable text, no logo, no watermark
```

---

#### 【場景・上下關卡】沉沒叢林神廟

**介紹：** 側視卡通雙人合作平台——一座沉沒的叢林神廟，青苔石砌、交錯平台、垂藤與淹水石室；中央豎井裡齒輪轉動，平台上散落紅藍鑽石，右上有一扇火焰門與雪花門。
**分類：** `場景 / 橫向 / 上下關卡型` —— 側視、`staggered ledges`（交錯平台）＋ `central shaft`（中央豎井）＋右上門，具垂直分層。

```text
A wide side-view cartoon cooperative platform game screen shows a sunken jungle temple of mossy grey-green masonry, staggered ledges, hanging vines and flooded chambers.

A gear turns inside the central shaft, red and blue diamonds glow on the ledges, a wooden crate sits on the right, and two doors with flame and snowflake symbols wait at the upper right.

Jungle leaves frame the edges, and bold outlines and soft shading keep the puzzle clear.
```

---

#### 【場景・上下關卡】火山神廟

**介紹：** 側視卡通雙人合作平台——多層火山神廟，玄武岩平台、短梯與鐵格圍繞掛著鐵鏈的中央豎井，底部有橘紅熔岩池；中左注滿亮藍水的水池、右下熔岩瀑流入渠，右上紅焰門與藍雪門，暖熔岩光對比冷藍水。
**分類：** `場景 / 橫向 / 上下關卡型` —— **最明確**：`multilevel`、`central vertical shaft`、`upper floor`／`middle`／`bottom`／`top right`，多層垂直關卡。

- `a glowing orange lava pool.` → 併入前句（`… hung with chains, and a glowing orange lava pool.`），不另造位置
- `On the middle right ledge, iron gate on the upper floor.` → `an iron gate marks the upper floor.`（補冠詞與動詞）

**結構：** 場景（多層岩架＋豎井＋熔岩）→ 要素（各層機關／門／道具）→ 風格（冷暖光對比）。

```text
A wide side-view cartoon cooperative platform game screen.
shows a multilevel volcanic temple of dark basalt ledges, short stairs and iron grates around a central vertical shaft hung with chains, and a glowing orange lava pool.

On the middle right ledge, an iron gate marks the upper floor.
Bright blue water fills a basin on the middle left, and lava falls pour into a channel at the bottom right.
A wooden crate rests on the upper left, and a red flame door and a blue snowflake door glow at the top right.

Warm lava light contrasts with cool blue water, and bold outlines and soft shading keep the mechanisms readable.
```

---

#### 【場景・上下關卡】夜港倉庫

**介紹：** 側視卡通雙人合作平台——夜間港邊倉庫，木鷹架、石牆與木門高懸於深藍水面之上；頂部鐵籠掛在吊車吊鉤、左上絞盤曲柄、右下鐵門，繩索自絞盤連往吊車，木船漂浮水面；暖燈籠與錨旗照亮斑駁砌體。
**分類：** `場景 / 橫向 / 上下關卡型` —— `top center`／`upper left walkway`／`lower right dock`／`water below`，明確上中下分層。

**殘句修正：**

- `a crank on the crane winch.` → `A crank sits on the crane winch…`
- `a barred door.` → `A barred door blocks…`

**結構：** 場景（夜港倉庫）→ 上中下要素（鐵籠／絞盤／門＋索具船隻）→ 風格（暖燈厚線）。

```text
A wide side-view cartoon cooperative platform game screen,
shows a night harbor warehouse of timber scaffolding, stone walls and wooden gates above dark blue water.

An iron cage hangs from a crane hook at the top center.
A crank sits on the crane winch along the upper left walkway.
A barred door blocks the lower right dock.
Ropes run from the winch up to the crane, crates and barrels crowd the docks, and a wooden boat bobs in the water below.

Warm lanterns and anchor banners light the worn masonry, and thick outlines keep every route readable.
```

---

### 角色 (遊戲場景用 / sprite)

#### 【角色・橫向】角鬥士待機 sprite

**介紹：** 單人全身像素格鬥 sprite——戴青銅頭盔、持圓盾的角鬥士，嚴格朝右側身站立待機、雙腳踩在地平線上；以動態提示詞隨機切換六種戰鬥姿勢（出拳／格檔／突刺／跳躍／蹲伏／蓄力）。
**分類：** `角色 / 橫向` —— 側面角色，**嚴格向左／向右、不面向讀者**。
**如何描述橫向角色：** 對照下方「橫向角色三分法」的三條軸，**同時寫上且一致**——
① **朝向**（Side-Facing）`strictly facing right/left`，二選一、嚴格、絕不看鏡頭
② **渲染**（Profile View）`in profile`，單眼側面
③ **視角**（Side View）`side-view`
④ `full-body view`＋地平線；**姿勢須側面可讀**（靠剪影）。
**結構：** 主體視角 → 風格（像素／線條／上色）→ 角色設定 → 朝向姿勢 → 隨機姿勢槽。

```text
A single game character centered in full-body view,
2D pixel-art fighting game sprite style,
clean dark pixel outlines,
minimalist facial features with simplified face detail,
flat color shading with crisp high-contrast highlights,

a gladiator with bronze helmet and shield,

positioned on a flat ground level,
strictly facing right in a side-view 2D fighting game ready stance,
{dynamic random fighting game pose|random defensive block stance with guard up|random forward lunging attack pose|random mid-air jumping battle pose|random low crouching combat stance|random wind-up power charging stance}
```

---

### 角色 (立繪)

> 暫無

---

## 遊戲專用：場景視角與地面角度 (Scene View & Ground Angle)

> **⚠ 遊戲專用概念，僅記於本檔。** 場景視角的**核心判準是「地面的角度」**——
> 地面是水平、還是有透視深度，決定了**遊玩區域怎麼動、角色能怎麼排**，
> 也決定了畫面裡的「上下層」究竟是**遊玩區域**還是**只是背景**。

| 視角類型 | 地面角度 | 「上下層」的身分 | 常見於 |
| --- | --- | --- | --- |
| **Side-View Platformer**（上下關卡） | 基本**水平**，或僅一小部分透視 | **遊玩區域**——水平＋上下階層移動 | 平台跳躍 |
| **Belt-Scrolling**（橫向格鬥） | **擴張透視角度**、有深度 | **只是背景**、非遊玩區域 | 街機格鬥 |
| **Oblique / Elevated Oblique View** | 斜視（傾斜投影） | — | 明日方舟一代 |
| **Isometric-style View** | 等角 | 可排列**前後＋上下多列**角色 | 等角策略 |
| **Vertical-Scrolling Level** | 垂直捲動 | — | 射擊類（本檔暫無範例） |

**上下關卡 vs 橫向格鬥＝地面角度之別：**

- **上下關卡（Side-View Platformer）**：地面**水平** → 上下層**就是遊玩區域**，角色在水平＋上下階層間移動
- **橫向格鬥（Belt-Scrolling）**：**擴張透視**、地面有深度 → 即使背景有上下層，那**只是背景**、不承載遊玩

**本檔「2.5D 背景模板」（`GB0001` 那則）的定位：**

用意是**擴張角度、讓地面範圍變更大**，好**排列前後與上下的多列角色**；
角度介於**橫向格鬥（Belt-Scrolling）** 與 **Oblique View（明日方舟一代）** 之間、**較接近 Isometric**。

---

## 遊戲專用：橫向角色三分法 (Three Horizontal Types)

> **⚠ 遊戲專用概念，僅記於本檔。** 三個名字都含「橫向」、看似相似，
> 但對遊戲而言**描述的是三條不同的軸、根本不同**——同一遊戲場景內**不可混雜**。

| 術語 | 屬於哪條軸 | 描述什麼 | 常用詞 |
| --- | --- | --- | --- |
| **Side View**（側視） | 相機視角 | 觀察者在角色**側面**——畫面從哪看 | `side-view`、`camera from the side` |
| **Profile View**（正側面） | 渲染／剪影 | 身體以**純側面**呈現——單眼、額鼻唇頷輪廓線 | `in profile`、`one eye visible` |
| **Side-Facing**（面向側邊） | 朝向 | 角色**面朝**左或右、絕不看鏡頭 | `strictly facing left/right` |

**三者問的是不同問題：**

- **Side View** →「**相機在哪**」：整個場景的視角
- **Profile View** →「**臉怎麼畫**」：純側面剪影（單眼＋額鼻唇頷輪廓線）
- **Side-Facing** →「**角色朝哪**」：鎖定畫面左／右，不面向讀者

**遊戲規則：同一款遊戲內，所有角色必須在這三條軸上一致，不可混雜。**

若同一畫面混用——部分角色 Side View、部分 Profile、部分 Side-Facing——就會產生
「**多面向的橫向角色**」互相衝突：視角、美術、朝向對不齊，畫面就散了。

**實務：** 先定案這款遊戲的橫向約定，再讓**所有角色**統一；
描述時三條軸**同時寫上且互相一致**：

```text
side-view scene, a character shown in strict profile, strictly facing right
```

（視角＝`side-view`、渲染＝`in profile`、朝向＝`facing right`——三者一致，缺一即可能對不齊）

---

**相關連結：**

- 主技能：[SKILL.md](../../SKILL.md)
- 範例索引：[README.md](README.md)
- 排版與殘句三層判斷：[mp-element-extraction.md](../mp-element-extraction.md)
- 動態提示詞 `{a|b|c}`：[dy-dynamic-prompts.md](../dy-dynamic-prompts.md)
- 合併插槽 `[PROMPT]`：[mp-prompts-merge-001.md](../mp-prompts-merge-001.md)

---

## 未整理分類 (Uncategorized)

> 新增範例先放此區，日後再併入上方分類。

```
A wide side-view cartoon cooperative platform game screen,
shows a forest stronghold of giant trees, rope bridges and timber walkways with waterfalls in the background.
On the upper left, a rope-linked lever on a grey winch, raising a wooden drawbridge.
On the middle right a walkway.
A rope runs from the winch to the drawbridge pulley, a plank at the middle left, a lower ledge,
A wooden spiked gate with a red skull banner stands at the lower center, ladders connect the walkways, and a distant tower rises through the trees.
Warm torches and lanterns cast amber light over the timber and moss.
``


```
A wide side-view cartoon cooperative platform game screen,
shows a snowy mountain stage with frozen waterfalls and icy platforms.
a slick ice bridge, raises a frozen lift.
Snow-covered pines, a wooden cabin, icicles on a high ledge fill the stage,
Bold outlines, soft shading and saturated colors give the stage a polished cartoon puzzle-platformer look, with stone ledges,
```

