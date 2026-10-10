---
description: >-
  範例索引檔：彙整 skills/vision-promptor/references/prompts/ 下的提示詞範例檔與
  上層 references/ 的合併提示詞檔——通用指南＋範例（np-prompting.md）、
  圖層式（np-spatial-layer-structured-example.md，L 前綴）、
  敘事式（np-fluent-narrative-paragraph-example.md，P 前綴）、
  標籤式（tp-booru-style-tags-example.md，T 前綴）、
  泛人族外型模組（np-char-demi-human.md，D 前綴）、
  風格混合（np-style-mix.md）與各專題檔（寫實照片風、背景要素、風格提示詞、
  角色基底、文字渲染、致敬作品、版面設計、微縮 3D），
  各檔的分類方式與編號方案；三型非互斥，可互相參照混用。
tags:
  - prompts/examples
  - prompts
  - documentation/references
---

# 範例索引 (Prompt Examples Index)

> 本目錄收錄各形式的提示詞範例；三型提示詞（圖層／敘事／標籤）**非互斥**，可互相參照混用。
> 每個檔案皆含「**分類索引**」與「**逐則內容標註**」——標題以【類型】開頭，標題下以引言簡述提示詞內容。

## 編號系列檔 (Numbered Series)

| 範例檔 | 形式 | 分類方式 | 編號方案 |
| --- | --- | --- | --- |
| [np-prompting.md](np-prompting.md) | 通用指南＋範例（自然語言最佳實務） | 畫面類型（人像／角色／風景／生態 × 攝影／動畫／科幻） | 無編號（示意圖檔名定位） |
| [np-spatial-layer-structured-example.md](np-spatial-layer-structured-example.md) | 圖層式（分層構圖） | 主要分層軸：景深軸／垂直樓層軸／水平・功能分區軸／混合軸 | `L0001` 起 |
| [np-fluent-narrative-paragraph-example.md](np-fluent-narrative-paragraph-example.md) | 敘事式（流暢段落） | 題材（奇幻・地下／科幻・宇宙／未來都市／生活・寫實）＋排版型態 | `P0001` 起 |
| [tp-booru-style-tags-example.md](tp-booru-style-tags-example.md) | 標籤式（booru tags） | 畫面內容／類型（`T####.【類型】內容`） | `T0001` 起 |
| [np-char-demi-human.md](np-char-demi-human.md) | 泛人族角色外型模組 | 種族：獸人／獸蟲混種／精靈族／半機人 | `D0001` 起 |
| [dy-window-view-example-001.md](dy-window-view-example-001.md) | 動態提示詞（窗景透視） | 六段式骨架：距離／前景遮蔽／人物／陳設／玻璃／風格 | `dy-` 系列編號 |

## 專題檔 (Thematic Collections)

| 範例檔 | 主題 | 分類方式 |
| --- | --- | --- |
| [np-style-mix.md](np-style-mix.md) | 風格混合（虛實混合） | 雙角色並置／背景 × 角色 |
| [np-photo-001.md](np-photo-001.md) | 寫實照片風 | 寫真與浮世繪／主體與場景拆解／電影感與時裝 |
| [np-style-001.md](np-style-001.md) | 風格提示詞 | 風格家族（動畫／寫實／漫畫／插畫線稿／水墨水彩）× 適用場景 |
| [bg-elem-old-001.md](bg-elem-old-001.md) | 背景與環境要素 | 室內／自然・水景／自然・林道／夜景／奇幻／片段 |
| [np-char-base.md](np-char-base.md) | 角色基底（人類外型） | 同一角色的自然語言版 ↔ 標籤版對照 |
| [np-asian.md](np-asian.md) | 東方寺院場景 | 多段落敘事（含觸發詞說明） |
| [np-art-001.md](np-art-001.md) | 水墨水彩風景 | 史詩遠景・一點透視 |
| [np-text-001.md](np-text-001.md) | 畫面文字渲染 | 看板／店招（`Text:` 與引號標示） |
| [np-pay-homage-001.md](np-pay-homage-001.md) | 致敬／再現既有作品 | 依作品：駭客任務／蝙蝠俠／回到未來 |
| [np-book-game-001.md](np-book-game-001.md) | 版面設計（遊戲攻略書頁） | 版面／排版類中文提示詞 |
| [np-style-miniature-001.md](np-style-miniature-001.md) | 微縮 3D 城市 | 等角微縮＋資訊圖表文字層 |

## 上層 references/ 檔 (Parent Directory)

| 檔案 | 說明 | 編號方案 |
| --- | --- | --- |
| [mp-prompts-merge-001.md](../mp-prompts-merge-001.md) | 合併提示詞：基底＋`[PROMPT]` 插槽的模組化技法 | `mp-` 系列編號 |
| [dy-dynamic-prompts.md](../dy-dynamic-prompts.md) | 動態提示詞概念：`{a\|b\|c}` 取代欄位的兩種基本語法 | 無編號（概念檔） |

**內容概要：**

- **通用指南＋範例** — 自然語言提示詞的最佳實務、解析度／模型考量與 20 則多風格範例（附示意圖）
- **圖層式** — 依主要分層軸分類：景深軸（前中後）、垂直樓層軸（上中下）、水平／功能分區軸、混合軸與未分類；含光輝浴場系列變體
- **敘事式** — 依題材與排版現況雙重標註：多段落長敘事、單段緊湊敘事、分行長敘事、標籤串列型等
- **標籤式** — 依畫面內容／類型區分（格式 `T####.【類型】內容`），依主題群組分行
- **泛人族模組** — 只收「種族＋外觀」的可插拔角色模組，**不含**該種族的建築／場景／事物
- **風格混合** — 虛實混合基礎版＋固定結構＋可替換槽位，可基於此產生各種變體
- **動態提示詞** — 六段式窗景骨架，`{a|b|c}` 取代欄位批量產生構圖相近、細節各異的變體
- **專題檔** — 各檔以【類型】標題逐則標註內容，檔首附分類索引

**共通規則：**

- 編號前綴：`L` = Layered（圖層式）、`P` = Paragraph（敘事式）、`T` = Tag（標籤式）、`D` = Demi-human（泛人族模組）、`mp` = Merge Prompt（合併提示詞，檔名前綴）、`dy` = Dynamic Prompts（動態提示詞，檔名前綴）
- 編號為固定識別碼，**空號不補**；新增範例請依各檔方案接續編號
- 變體可附於原範例後以「-變體」標註，不一定要分配新編號（指標性強或需引用的才賦予編號）
- 各範例檔的分類索引、計數與排版規則見其檔內說明

**相關連結：**

- 主技能：[SKILL.md](../../SKILL.md)
- 指南：[np-spatial-layer-structured.md](../np-spatial-layer-structured.md)（圖層式）、[np-fluent-narrative-paragraph.md](../np-fluent-narrative-paragraph.md)（敘事式）、[tp-booru-style-tags.md](../tp-booru-style-tags.md)（標籤式）
- 合併／插槽技法：[mp-prompts-merge-001.md](../mp-prompts-merge-001.md)
- 動態提示詞概念：[dy-dynamic-prompts.md](../dy-dynamic-prompts.md)
