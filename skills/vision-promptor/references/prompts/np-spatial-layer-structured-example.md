---
description: >-
  「空間圖層結構式提示詞 (Spatial-Layer-Structured Prompting)」的範例提示詞集，
  中文簡稱「圖層式提示詞」。收錄 15 則以分層區塊控制構圖的完整提示詞，
  依主要分層軸分為景深軸、垂直樓層軸、水平／功能分區軸、混合軸與未分類共五類，
  含「光輝浴場」的緊湊單段與外望內視角兩個變體；題材涵蓋奇幻旅館、熱帶海灘、
  學校保健室、改車工廠、避難所、星艦剖面、賽博朋克巷道、巨樹商店、居酒屋、
  浴場與機甲機庫；每則範例上方附簡短中文描述。
tags:
  - prompts/examples
  - prompts/natural-language
  - documentation/references
---

# 圖層式提示詞範例 (Spatial-Layer-Structured Examples)

> 推薦對內容進行排版，使閱讀更清晰

每則範例上方附有一句中文描述，括號內標註其使用的分層方式。

---

## 分類索引

分類依每則範例的**主要分層宣告句/或提示詞的畫面描述**判斷；內文中的次要方位詞（如背景的「far left」艙門）不影響歸類。
**編號為固定識別碼**，依分類分節排列，不隨分類順序變動。
變體版可收入於原範例後方，並以「-變體」標註，不需要為其分配新編號（但具有指標性意義的可賦予編號作為方便定位使用）。

> **計數與下一編號：** 新增範例的**下一則編號由 L0016 開始**——一律接續全局最大編號，**空號不補**。

- **景深軸（前／中／後）**
  - 奇幻：L0001 龍骨圓形旅館
  - 古典建築：L0010、L0014、L0015 光輝浴場系列（原版／緊湊單段變體／外望內視角變體）
- **垂直樓層軸（上／中／下）**
  - 寫實：L0004 改車工廠
  - 後啟示科幻：L0005、L0013 輻射避難所
  - 賽博龐克：L0007 賽博朋克巷道
  - 奇幻：L0008 巨樹旅館與藥水店
  - 機甲科幻：L0011 科幻機甲機庫
- **水平／功能分區軸（前中後／左中右）**
  - 寫實：L0003 學校保健室
  - 科幻剖面：L0006、L0012 星艦艦橋剖面（初版／含人員版）
- **混合軸（複合軸別／自然語言位置句）**
  - 自然景觀：L0002 熱帶海灘
  - 寫實：L0009 雨夜居酒屋
- **未分類**
  - 暫無

---

## 一、景深軸（前／中／後：Foreground／Midground／Background）

### L0001. 龍骨圓形旅館（前中後景標準型）

> 寬景微俯視鏡頭下的圓形奇幻旅館：前景弧形排桌留空中央地面，中景為環形石地，背景龍肋骨彎成拱頂，暖橘燭光對比頂部冷色天光。

```
A vast, high-ceilinged fantasy tavern interior built inside a massive circular chamber beneath sweeping dragon bones. The view angle is a wide, cinematic establishing shot from a slightly elevated eye level, capturing a grand spatial depth and a central open area surrounded by layered architecture.

The tavern layout spans three distinct compositional layers:

Foreground: Empty round tables with polished wood surfaces are arranged in a sweeping semi-circular arc along the lower left and right edges, leaving the center floor completely open. Drifting smoke rises gently through the central lower frame, with warm candlelight casting soft reflections on the tabletop surfaces.
Midground: A spacious, empty circular stone floor forms the room's central hub under soft daylight. Surrounding the perimeter are carved wooden pillars, hanging iron lanterns glowing with amber light, and cozy alcoves adorned with pale ivory dragon bone accents and rich wood textures.
Background: Massive dragon rib bones curve overhead like natural vaulted arches, anchoring the upper architecture. Gothic wooden balconies layer around the circular walls, while dusty shafts of cool daylight filter down from high ceiling openings, illuminating airborne dust and smoke.

Atmosphere: Dramatic, warm yet solemn, legendary fantasy mood; soft orange candlelight and warm lantern glow balance cooler daylight shafts from above, creating a rich contrast of amber, gold, natural wood browns, and creamy bone tones.
```

---

### L0010. 光輝浴場・原版（前中後景＋Atmosphere 分行標籤）

> 由白大理石浴場內望外：前景金色池與馬賽克地磚、中景凹槽柱、背景雲海，象牙白與暖青色調。

```
the Baths of Radiance, interior vantage point looking outward from within the vaulted white marble bath hall. Foreground: steaming golden pools with shell-shaped niches and bronze swan-neck faucets, intricate abstract mosaic floor glistening under filtered daylight.
Midground: restrained fluted columns framing broad openings.
Background: the cloud sea beyond, drifting mist illuminated by warm daylight, laurel planters silhouetted against the horizon.
Atmosphere: serene timeless proportions, ivory pale aqua and warm bronze tones, filmic color grading, deep focus.
```

---

### L0014. 光輝浴場・以水池作為主體的變體（前中後景內嵌單段）

> 範例 L0010 的緊湊寫法：前中後景與 Atmosphere 全部壓進單一段落，語句連貫，細節較原版精簡。

```
the Baths of Radiance, interior vantage point looking outward from within the vaulted white marble bath hall. Foreground: steaming golden pools shimmering with ivory pale aqua reflections, shell-shaped niches and bronze swan-neck faucets releasing streams into the water. Midground: restrained fluted columns framing broad openings, mist drifting upward from the pools. Background: the cloud sea beyond, glowing under warm daylight, laurel planters silhouetted against the horizon. Atmosphere: serene timeless proportions, filmic color grading, deep focus.
```

---

### L0015. 光輝浴場・外望內視角變體（前中後景・視角反轉）

> 範例 L0010 的鏡像構圖：改由雲海露台由外望內，前景石階與月桂盆栽、中景柱廊拱門框景、背景為室內金色浴池。

```
the Baths of Radiance, exterior vantage point looking inward from the cloud sea terrace. Foreground: broad marble steps and laurel planters leading toward the openings. Midground: restrained fluted columns and vaulted arches framing the interior view. Background: steaming golden pools shimmering beneath drifting mist, shell-shaped niches and bronze swan-neck faucets, intricate abstract mosaic floor glowing under warm daylight. Atmosphere: serene timeless proportions, ivory pale aqua and warm bronze tones, filmic color grading, deep focus.
```

---

## 二、垂直樓層軸（上／中／下：Top／Middle／Bottom floors）

### L0004. 改車工廠（樓層分層：上／中／下）

> 深夜多層改車工廠：上層夾層辦公室、中層液壓舉升的改裝跑車、下層維修坑，艙門外是工業港區。

```
a multi-story custom auto tuning garage late at night. The background through open bay doors reveals a dark industrial harbor skyline illuminated by glowing yellow streetlights and reflection ripples on wet pavement.

The workshop layout spans three distinct functional levels:

1. Top level: A mezzanine office with glass railings, featuring engine diagnostic graphs on a neon green monitor.
2. Middle level: The main bay area featuring a modified Japanese sports car raised high on a blue hydraulic lift. An exposed twin-turbo engine block rests on a stand to the left, surrounded by shiny chrome tools hanging from a red metal pegboard.
3. Bottom level: A subterranean pit beneath the lift equipped with bright LED work lamps, illuminating the underside of the vehicle's custom exhaust system.
```

---

### L0005. 輻射避難所（樓層分層：上／中／下＋左側遠景）

> 三層地下避難所：上層大廳、中層居住區、下層水耕溫室，左側艙門外是黃色輻射天空的廢土。

```
a three-level subterranean Vault shelter set in the Fallout universe. The background outside the massive, circular steel Vault door on the far left shows a scorched, dusty wasteland under a sickly yellow radioactive sky.

The Vault interior is split into three functional floors:
1. Top floor: A bright Vault-Tec atrium with yellow and blue wall accents. A Vault dweller in a blue jumpsuit with yellow trim stands at a terminal desk while another dweller drinks from a water fountain.
2. Middle floor: A cozy living quarter featuring two metal bunk beds, a retro-futuristic radio playing on a wooden nightstand, and a Vault Boy poster pinned to the steel wall.
3. Bottom floor: An underground hydroponic greenhouse lit by soft purple grow lights, where green mutated carrots and berries grow in long stainless steel planters.
```

---

### L0007. 賽博朋克巷道（垂直分層：上／中／下）

> 雨夜多層賽博朋克巷道：上層黑客工作站、中層拉麵攤、下層未來摩托車與機器狗，背景是霓虹摩天樓。

```
a vibrant, multi-level cyberpunk alleyway at night. The background features towering dark gray skyscrapers covered in glowing neon signs in magenta and cyan, with rain falling diagonally across the frame. The scene is split across three vertical structural levels connected by rusted metal ladders and exposed pipes.

On the top level, a high-tech hacker workstation is set up on a steel balcony. A character with glowing green visor glasses and a dark hoodie sits in front of three monitors displaying neon code and radar grids.
On the middle level, a narrow noodle bar lit by a bright red neon sign operates under a corrugated metal roof. A customer wearing a long brown leather duster sits on a stool, eating noodles while a robot chef with a polished silver metallic finish cooks behind the counter.
On the bottom street level, a sleek black futuristic motorcycle with glowing blue wheel rims is parked beside a overflowing trash container. A small robotic dog with a yellow antenna sits on the damp pavement, reflecting the ambient neon lights in the puddle beneath it.
```

---

### L0008. 巨樹旅館與藥水店（樓層分層：上／中／下）

> 中空巨樹內的三層奇幻旅館兼藥水店：頂層臥房、中層藥水商店、底層酒館，樹外是新月暮色。

```
a cozy, three-story fantasy tavern and potion shop nestled inside a massive hollowed-out oak tree. The background shows a twilight sky with a crescent moon and soft blue ambient light filtering through dense forest leaves.

The top floor contains a warm bedroom featuring a circular glass window, a small wooden bed with a green quilt, and a hanging birdcage with a small glowing fairy inside.
The middle floor serves as an alchemical shop, filled with wooden shelves stacked with colorful glass bottles in shades of red, blue, and purple. a brass cauldron emitting green smoke.
The ground floor features a lively tavern area with a stone fireplace on the far left where a warm flame crackles. a round wooden table, a tall mug of ale next to a sleeping ginger cat.
```

---

### L0011. 科幻機甲機庫（雙層工作區：上走道／下地面）

> 多層科幻機庫檢修藍灰色機甲：上層走道女技師監工、下層機甲主體、焊接技師與工具區分佈左右。

```
a multi-tier sci-fi hangar bay where a large, blue and grey mech suit is undergoing maintenance. The overall background consists of dark industrial steel walls decorated with yellow and black caution stripes and bright halogen floodlights overhead.

The hangar floor is split into two working levels connected by a yellow steel catwalk:

On the upper catwalk level, a female mechanic in blue overalls and a yellow hardhat holds a tablet computer, overseeing the repairs. A small overhead crane arm dangles above the mech's exposed shoulder joint, holding a replacement gear.
On the lower floor level, the central focus is the eight-foot-tall mech standing in a hydraulic dock frame. Its chest panel is open, exposing red and blue wiring. To the left, a mechanic welding a foot joint sends tiny bright orange spark pixels onto the floor. To the right, a heavy toolbox and a red oil drum rest beside a mobile laptop station.
```

---

## 三、水平／功能分區軸（Front-Middle-Rear／Left-Center-Right）

### L0003. 學校保健室（功能分區：前／中／後）

> 深夜的日本學校保健室，分前三區：前區導師桌、中區兩張床位、後區醫療儲物，窗外是靛藍色校園。

```
a Japanese school infirmary at night. The background through tall windows reveals a quiet campus courtyard under a deep indigo sky, with faint silhouettes of trees and the glow of distant lampposts reflecting on the glass. The polished wooden floor catches soft highlights from the interior lighting.

The room is divided into three functional zones:

1. Front area: A teacher’s desk lit by a small desk lamp, casting warm yellow light over scattered medical forms and a locked medicine cabinet. A wall clock shows late evening hours.

2. Middle area: Two hospital-style beds aligned side by side, each separated by pale blue privacy curtains suspended from ceiling rails. Crisp white sheets and folded blankets rest neatly, with a rolling bedside table holding a glass of water and a thermometer. The curtains cast long shadows in the dim light.

3. Rear area: A storage section with shelves of labeled medical supplies, bandage boxes, and a compact refrigerator for cold packs. A tall standing lamp provides localized illumination, leaving the corners of the room in soft darkness.
```

---

### L0006. 星艦艦橋剖面・初版（功能分區：左／中／右）

> 星艦艦橋與相鄰艙室剖面：左側主艦橋、中側醫療艙、右側傳送室，主艙外為紫色星雲深空。（未含人員的初版）

```
a cross-section of a Starfleet Constitution-class starship bridge and adjacent rooms, set in the Star Trek universe.
The background outside the large viewscreen shows deep space with a colorful purple stellar nursery and warp speed star-streaks.

The interior layout spans three distinct operational areas:,

1. Left section: The main bridge with a circular platform featuring a black leather captain's chair in the center. a glowing sensor console.
2. Middle section: A medical bay equipped with two bio-beds featuring glowing overhead medical displays emitting soft green light grids.
3. Right section: A transporter room showing a circular pad with four glowing blue emitter rings on the ceiling and floor, prepared for beam-in.
```

---

### L0012. 星艦艦橋剖面・含人員版（功能分區：左／中／右）

> 範例 L0006 的修訂版：相同的左中右三艙剖面，加入指揮椅上的軍官與感應器操作員等角色細節。

```
a cross-section of a Starfleet Constitution-class starship bridge and adjacent rooms, set in the Star Trek universe. The background outside the large viewscreen shows deep space with a colorful purple stellar nursery and warp speed star-streaks.

The interior layout spans three distinct operational areas:

1. Left section: The main bridge with a circular platform featuring a black leather captain's chair in the center. An officer in a gold uniform sits in the chair while another officer in a blue science uniform operates a glowing sensor console.
2. Middle section: A medical bay equipped with two bio-beds featuring glowing overhead medical displays emitting soft green light grids.
3. Right section: A transporter room showing a circular pad with four glowing blue emitter rings on the ceiling and floor, prepared for beam-in.
```

---

## 四、混合軸（複合軸別與自然語言位置句）

### L0002. 熱帶海灘（自然語言位置句：前／左／中／右）

> 正午熱帶海灘：背景綠松石海面與太陽，前景像素感沙岸，左側飲料、中央沙灘球、右側紅陽傘。

```
a vibrant, sunny tropical beach scene during mid-day.
The background features a clear turquoise ocean with gentle blue wave crests and a bright yellow sun in a light blue sky.

In the foreground, a sandy shore with light tan pixel texture stretches across the scene.
On the left side, on a yellow striped beach towel, a tropical drink with a small straw.
In the center, a blue beach ball.
On the right, a large red beach umbrella casts a shadow over a small cooler and a pair of pink sandals resting on the sand.
```

---

### L0009. 雨夜居酒屋（單層主區＋左右定位＋背景街道）

> 雨夜日式居酒屋：底層廚房與吧台，左側師傅烤串、長桌顧客，紅燈籠暖光籠罩，背景是雨中街道。

```
a warm, bustling  Japanese izakaya on a rainy evening.
The background shows a dark street scene with blue rain streaks and hanging red paper lanterns glowing with white Japanese kanji characters.

The bottom floor houses the main kitchen and bar area. A chef in a white headband cooks yakitori skewers over a smoking grill on the left side.
Along the counter, three patrons are seated on wooden stools, chatting with glasses of beer in front of them.
Red hanging lanterns line the ceiling, casting a warm orange and yellow glow throughout the interior space.
```

---

## 未分類（Uncategorized）

> 新增範例若無法符合上述任一軸別，請置於本節。

---

```
sheltercutawaymale, aged up
Caption: The cutaway contains exactly 6 visible rooms: an upper-left greenhouse, an upper-right map room, a middle-left kitchen, a middle-right clinic, a lower-left bunk room, and a lower-right heater plant.

A narrow stair along the far left is circulation and is excluded from the room count.
This is a semi-realistic illustrated cross-section of an ice-station bunker under blue pack ice, with a red parka hung by the outer door and a pale arctic sky.

In the greenhouse, an adult Inuit man aged 24 with a broad face and black hair in a low tie mists lettuce under white lamps. Grow trays, a blue tank and coiled hose fill the warm room.
In the map room, an adult white man aged 23 with a red beard and a square jaw pins a paper coastal chart to a cork wall. A drafting table, rolled maps, a brass ruler and a mug sit under a lamp.
In the kitchen, an adult East Asian man aged 24 with a flat-top haircut and a scar on his chin ladles soup into three enamel bowls. A stove, a bread box and drying mittens hang nearby.
In the clinic, an adult Black man aged 23 with a short afro and glasses sorts glass vials in a cabinet. A cot, a wool blanket and a steel sink occupy the room.
In the bunk room, an adult South Asian man aged 22 with a side part and a narrow mustache pulls a wool blanket up on the lower bunk. Parkas hang on hooks beside a boot rack.
In the heater plant, an adult Southeast Asian man aged 24 with a wide jaw and a crew cut shovels coal into a black stove. A heat duct, a coal bin and a thermometer fill the corner.

Every person has a different face.
Riveted gray steel frames the rooms, with crisp ink outlines and painterly shading.
```

---
