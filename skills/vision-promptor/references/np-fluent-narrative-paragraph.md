---
description: >-
  「流暢敘事段落式提示詞 (Fluent Narrative Paragraph)」撰寫規範，
  中文簡稱「段落式提示詞／敘事式提示詞」，英文別名 Natural Language Paragraph。
  說明以流暢自然語言段落驅動 Cross-Attention（跨詞注意力機制）的核心理念、
  標準語法模板 (Template)、撰寫必備三要素（嚴禁否定語法、空間幾何名詞主導、
  冷暖雙光源平衡）、分行與空行的排版規則、與圖層式提示詞的互補關係
  （兩者非互斥，圖層式引導詞即簡化型敘事段落），以及適用與禁忌情境、撰寫檢查清單。
tags:
  - prompts/rules
  - prompts/natural-language
  - prompt-engineering
  - documentation/references
---

# 流暢敘事段落式提示詞（Fluent Narrative Paragraph）

| 名稱欄位 | 內容 |
| --- | --- |
| 中文全名 | 流暢敘事段落式提示詞 |
| 中文簡稱 | **段落式提示詞** ／ **敘事式提示詞** |
| 英文名稱 | Fluent Narrative Paragraph |
| 英文別名 | Natural Language Paragraph |
| 檔名前綴 | `np-` = natural-language prompt（自然語言提示詞） |
| 範例提示詞 | [prompts/np-fluent-narrative-paragraph-example.md](prompts/np-fluent-narrative-paragraph-example.md)（P0001 起始編號） |
| 對照方法 | [np-spatial-layer-structured.md](np-spatial-layer-structured.md)（圖層式提示詞） |

---

## 1. 核心設計理念

提示詞採用「**流暢自然語言段落（Natural Language Paragraph）**」，透過三條主線交織推進：

- **連貫的鏡頭推移** — 以敘事視角的移動（由遠而近、由外而內）取代硬性區塊標籤
- **空間幾何約束** — 以幾何名詞把構圖「藏進句子裡」：敘事式**仍然需要一定程度的構圖**，只是表達方式不同
- **冷暖光影交織** — 雙光源對比製造空氣感與全局光照

充分利用 **Cross-Attention（跨詞注意力機制）**，生成色彩融合自然、光影空氣感極佳的**電影劇照（Cinematic Frame）**。

**排版兩原則**：

1. **仍需構圖** — 敘事不等於沒有構圖：鏡頭、幾何、留白、光源都要明確寫進句子
2. **分行與空行** — 依鏡頭／空間推移切分「語意段落」，段與段之間空一行，避免整坨密集文字

（主要服務**人類閱讀性與替換便利性並且支援 diff 比對/替換**——有沒有分行對生成結果影響不大，但對閱讀與後續替換差很多）

---

## 2. 標準語法結構（Template）

```text
A [Camera View Angle & Shot Type] reveals a [Vast/Intimate] [Scene Topic] built [Core Architectural Feature]. [Architectural Framework & Upper Boundaries]. [Perimeter Objects & Layout Rule] leaving [Central Focal Area / Motion Drift]. [Lighting Source A] balances [Lighting Source B] filtering from [Angle/Opening], creating a rich contrast of [Color Palette]. The harmony of [Materials & Textures] creates a [Emotional Mood/Sense of Time] in the [Scene State].
```

**語法槽位拆解：**

| 位置 | 佔位內容 | 職責 |
| --- | --- | --- |
| 開場 | `[Camera View Angle & Shot Type] reveals` | 鎖定鏡頭，揭示式開場 |
| 主體 | `[Vast/Intimate] [Scene Topic] built [Core Architectural Feature]` | 場景規模＋主題＋核心建築特徵 |
| 框架 | `[Architectural Framework & Upper Boundaries]` | 建築框架與上部邊界 |
| 佈局 | `[Perimeter Objects & Layout Rule] leaving [Central Focal Area / Motion Drift]` | 外圍物件＋佈局規則＋留白／中央焦點 |
| 光影 | `[Lighting Source A] balances [Lighting Source B] filtering from [Angle/Opening]` → `rich contrast of [Color Palette]` | 雙光源平衡＋由此產生的色票 |
| 收尾 | `The harmony of [Materials & Textures] creates a [Emotional Mood/Sense of Time] in the [Scene State]` | 材質和諧 → 情緒／時間感＋場景狀態 |

### 排版規則（分行與空行）

**「分行」= 在句子邊界換行**：把過長的邏輯行拆成多行（同一段落內的軟換行），內容不改寫、不在句子中間切斷。

```text
（改寫前：句子全部擠在同一邏輯行）
Everywhere, the cavern breathes with a mixture of ancient magic and industrial might. Crystal light reflects off the water, bouncing onto the stone architecture in ghostly patterns. The air hums with quiet energy, a rhythm of machinery, magic, and life. The city feels both eternal and alive, a hidden world where darkness is not absence but power, where elegance and danger exist in the same breath.

（改寫後：在句子邊界分行）
Everywhere, the cavern breathes with a mixture of ancient magic and industrial might. Crystal light reflects off the water, bouncing onto the stone architecture in ghostly patterns. The air hums with quiet energy, a rhythm of machinery, magic, and life.
The city feels both eternal and alive, a hidden world where darkness is not absence but power, where elegance and danger exist in the same breath.
```

風格前綴可獨立成行，其後每個句子各佔一行：

```text
cinematic, rich colors,
deep beneath the crust of the world lies a cavern so vast it feels like another sky.
Its ceiling rises into darkness, lost beyond towering stalactites that glow faintly with veins of blue crystal.
The entire cavern is illuminated by an eerie, shimmering light that pulses from thousands of crystal clusters embedded in the walls, casting shifting reflections across a great underground lake of deep blue water.
The lake stretches across the cavern floor like a mirror of liquid sapphire, its surface rippling with soft waves that echo endlessly.
```

**判斷與節制：**

- **逗號不是「維持同行」的判斷標準** — 部分系統會無差別地使用 `,` 號來分隔內容，所以當行過長時，**還是需要分行一下維持可讀性**；不要因為句子間只有逗號就全擠在一行
- **依語句的主題性分行或分段** — 當句子轉向新的主題（換主體、換空間區域、換敘述對象）時，即使該行不長，也可在該句前分行；主題轉折較大時則進一步分段（空行）
- **避免單行過長** — 單一邏輯行過長 → 在句子邊界分行
- **不要無差別地把全部都分行** — 短行維持原狀即可；分行是為了可讀性，不是機械地拆解每一行
- **長提示依語意分段、段間空一行**（短提示可維持單一段落）
- **不使用**項目符號、編號列表或區塊標籤——那是圖層式的語法；段落本身即結構
- 每段以完整的敘事句承載構圖（鏡頭／幾何／留白／光源），而非名詞串列

**分隔線與空行的保留手法：**

- **`# ---` 作為分隔線** — 如果有必要，可以 `# ---` 作為分隔線
- **`#` 代表空行** — 某些提示詞編輯器會自動吞掉空行；若使用者有指示，或給予的範例內有使用 `#` 夾雜在段落之間，即代表需要以 `#` 來維持空行

> **良好排版習慣：** 避免單行過長（在句子邊界分行），但也不要無差別地把全部都分行——
> 範例檔中「多段落長敘事／單段緊湊敘事」等標註描述的是**現況**（尚未適當分行與空行的變體），**不是建議格式**。

---

## 3. 撰寫必備三要素（Mandatory Rules）

### 規則一：嚴禁使用負面／否定語法（No Negative Phrasing Paradox）

- ❌ 嚴禁寫出 `No people`、`without characters`、`despite the absence of humans`
- ✅ 必須改用**正向狀態描繪**無人感：

  ```text
  Empty round tables and drifting smoke emphasize calm after activity.
  （空桌與飄散的煙霧強調著活動過後的平靜。）
  ```

> 否定詞會讓模型「聽見」被否定的物件本身；正向狀態描寫只會引入你真正想要的元素。

### 規則二：空間幾何名詞主導（Geometric Layout Anchoring）

必須使用幾何佈局名詞來**隱式控制**物件的聚集與排列方式，例如：

`circular layout`、`perimeter`、`central hub`、`radiating pattern`、`symmetrical balance`、`linear perspective`

> 這條是「敘事式仍需構圖」的具體落法：不靠標籤，靠幾何名詞把空間骨架寫進句子。

### 規則三：冷暖雙光源平衡（Dual-Light Balance）

句子中必須**同時包含兩種不同色溫或來源**的光影描述，例如：

```text
warm amber candlelight balances cool shafts of daylight
（溫暖的琥珀燭光平衡著從高處瀉下的冷色日光）
```

以引發模型生成頂級的**全局光照（Global Illumination）**與空氣感。

---

## 4. 與圖層式提示詞的關係（非互斥）

兩者位於同一光譜的兩端，**並非互斥，可以混用**：

| | 段落式提示詞（本篇） | 圖層式提示詞 |
| --- | --- | --- |
| 構圖表達 | 藏在句子裡（鏡頭推移、幾何名詞、留白） | 顯式標籤（`Foreground:` …） |
| 結構單位 | 語意段落＋空行 | 區塊標籤＋過場句 |
| 強項 | 光影空氣感、情緒流動、電影感 | 精確空間控制、物件定位 |

**關鍵洞察**：圖層式的引導詞（如 `Foreground: Empty round tables arranged in an arc, leaving the center open.`）本質上是**簡化型的敘事段落**——被裁剪成標籤句的敘事；反過來說，段落式只要寫出「前景→中景→背景」的鏡頭推移，就等於隱式的分層。

**混用方式：**

- 敘事總綱（鏡頭前導）＋ 標籤分層收尾
- 標籤區塊**內部**改用完整敘事句（而非名詞清單）——兩種方法的優點互補

**選擇指引：** 需要精確控制物件位置 → [圖層式](np-spatial-layer-structured.md)；重視光影渲染與空氣流動 → 段落式；兩者需求並存 → 混用。

---

## 5. 適用與禁忌情境（Do's & Don'ts）

✅ **最適合**：

- 電影視覺劇照（Cinematic Frame）
- 自然風景大景
- 重視光影渲染與空氣流動感（Atmosphere）的奇幻／寫實畫面

⚠️ **較不適合**：

- 需要嚴格分區、物件必須出現在特定位置的規格圖 → 改用 [圖層式提示詞](np-spatial-layer-structured.md)

❌ **禁止**：

- 任何否定語法（見規則一）
- 無分段的密集長文（違反排版兩原則之「分行與空行」）

---

## 6. 撰寫檢查清單（Checklist）

- [ ] 全文無否定語法（`No` / `without` / `無人` …）？若有，已改寫為正向狀態描寫？
- [ ] 是否使用至少一個幾何佈局名詞（`circular layout` / `perimeter` / `central hub` …）？
- [ ] 是否同時包含兩種色溫的光源，並寫出其「balance」關係？
- [ ] 開場是否鎖定了鏡頭與視角？
- [ ] 過長的邏輯行是否已在**句子邊界**分行（逗號不是維持同行的判斷標準）？短行是否未被無差別拆開？
- [ ] 主題轉換處（換主體／換空間區域）是否已分行，轉折較大處是否已分段？
- [ ] 長提示是否依語意分段、段間空一行？若編輯器會吞掉空行，是否以 `#` 保留空行、必要時以 `# ---` 作分隔線？
- [ ] 是否避開了區塊標籤與項目符號，保持敘事流？
- [ ] 收尾是否回扣材質、情緒與場景狀態？

---

## 7. 範例參考

完整的敘事式範例提示詞以 **P0001 起始編號**，請見：

- [prompts/np-fluent-narrative-paragraph-example.md](prompts/np-fluent-narrative-paragraph-example.md)

與圖層式提示詞的完整規範對照，請見 [np-spatial-layer-structured.md](np-spatial-layer-structured.md)。
