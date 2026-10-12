---
description: >-
  範例索引檔：
  彙整 skills/vision-promptor/references/prompts/ 下的提示詞範例檔
  與上層 references/ 的合併提示詞檔
tags:
  - prompts/examples
  - prompts
  - documentation/references
---

# 範例索引 (Prompt Examples Index)

> 本目錄收錄各形式的提示詞範例；三型提示詞（圖層／敘事／標籤）**非互斥**，可互相參照混用。
> 每個檔案皆含「**分類索引**」與「**逐則內容標註**」——標題以【類型】開頭，標題下以引言簡述提示詞內容。

## 編號系列檔 (Numbered Series)

| 範例檔 | 形式 | 簡介 |
| --- | --- | --- |
| [np-prompting.md](np-prompting.md) | 通用指南＋範例（自然語言最佳實務） | 畫面類型（人像／角色／風景／生態 × 攝影／動畫／科幻） |
| [np-spatial-layer-structured-example.md](np-spatial-layer-structured-example.md) | 圖層式（分層構圖） | 主要分層軸：景深軸／垂直樓層軸／水平・功能分區軸／混合軸 |
| [np-fluent-narrative-paragraph-example.md](np-fluent-narrative-paragraph-example.md) | 敘事式（流暢段落） | 題材（奇幻・地下／科幻・宇宙／未來都市／生活・寫實）＋排版型態 |
| [tp-booru-style-tags-example.md](tp-booru-style-tags-example.md) | 標籤式（booru tags） | 畫面內容／類型 |
| [np-char-demi-human.md](np-char-demi-human.md) | 泛人族角色外型模組 | - |
| [dy-window-view-example-001.md](dy-window-view-example-001.md) | 動態提示詞（窗景透視） | 六段式骨架：距離／前景遮蔽／人物／陳設／玻璃／風格 |
| [mp-element-extraction-example.md](mp-element-extraction-example.md) | 要素分割與抽離 | 三階段：原始 → 分段整理 → 抽離 |
| [bp-fix-001.md](bp-fix-001.md) | 提示詞修正前後對照（fix case） | 解決空間邏輯／動作不自然 |

## 專題檔 (Thematic Collections)

| 範例檔 | 主題 | 簡介 |
| --- | --- | --- |
| [np-style-mix.md](np-style-mix.md) | 風格混合（虛實混合） | 多風格並置／背景 × 角色 |
| [np-photo-001.md](np-photo-001.md) | 寫實照片風 | - |
| [np-style-001.md](np-style-001.md) | 風格提示詞 | 風格家族（動畫／寫實／漫畫／插畫線稿／水墨水彩...）× 適用場景 |
| [bg-elem-old-001.md](bg-elem-old-001.md) | 背景與環境要素 | - |
| [np-char-base.md](np-char-base.md) | 角色基底（人類外型） | - |
| [np-char-expressions-001.md](np-char-expressions-001.md) | 角色眼神與表情模組 | 眼妝與瞳色／嘴部 |
| [np-char-action-001.md](np-char-action-001.md) | 角色姿勢與動作模組 | - |
| [np-char-costume-001.md](np-char-costume-001.md) | 角色服裝模組 | 款式／貼身關係 |
| [np-style-composition-001.md](np-style-composition-001.md) | 構圖與取景模組 | 主體數量／媒介／視角／景別 |
| [np-asian.md](np-asian.md) | 東方場景 | - |
| [np-art-001.md](np-art-001.md) | 藝術風格 | 史詩遠景・一點透視・水墨水彩 |
| [np-text-001.md](np-text-001.md) | 畫面文字渲染 | 看板／店招／文字層 |
| [np-pay-homage-001.md](np-pay-homage-001.md) | 致敬／再現既有作品 | 依作品 |
| [np-book-game-001.md](np-book-game-001.md) | 版面設計（遊戲攻略書頁） | 版面／排版類 |
| [np-style-miniature-001.md](np-style-miniature-001.md) | 微縮 3D 城市 | 等角微縮＋資訊圖表文字層 |
| [np-game-001.md](np-game-001.md) | 遊戲畫面與場景 | `場景`／`角色`／`立繪` |

## 上層 references/ 檔 (Parent Directory)

| 檔案 | 說明 |
| --- | --- |
| [mp-prompts-merge-001.md](../mp-prompts-merge-001.md) | 合併提示詞：基底＋`[PROMPT]` 插槽的模組化技法 |
| [mp-element-extraction.md](../mp-element-extraction.md) | 要素分割與抽離指南：三階段流程、要素分類 |
| [dy-dynamic-prompts.md](../dy-dynamic-prompts.md) | 動態提示詞概念：`{a\|b\|c}` 基本語法 |

**共通規則：**

- 檔案編號前綴說明：
  - `L` = Layered（圖層式）
  - `P` = Paragraph（敘事式）
  - `T` = Tag（標籤式）
  - `D` = Demi-human（泛人族模組）

  - `mp-` = Merge Prompt（合併提示詞，檔名前綴）
  - `dy-` = Dynamic Prompts（動態提示詞，檔名前綴）
  - `bp-` = Before/after Prompt fix（修正前後對照，檔名前綴）

- 不一定要分配新編號（**指標性強或需引用的才賦予編號**）
- 編號為固定識別碼，**空號不補**；新增範例請依各檔方案接續編號
- 變體可附於原範例後以「-變體」標註
- 各範例檔的分類索引、計數與排版規則見其檔內說明
- 範例分類時請多級分層，避免過於混雜缺乏連續性
- 每則附簡短中文描述
- 各檔案底部放置 `未整理分類` 提供給未來追加新範例時臨時放置使用

**相關連結：**

- 主技能：[SKILL.md](../../SKILL.md)
- 指南：
  - [np-spatial-layer-structured.md](../np-spatial-layer-structured.md)（圖層式）
  - [np-fluent-narrative-paragraph.md](../np-fluent-narrative-paragraph.md)（敘事式）
  - [tp-booru-style-tags.md](../tp-booru-style-tags.md)（標籤式）
- 合併／插槽技法：[mp-prompts-merge-001.md](../mp-prompts-merge-001.md)
- 要素分割與抽離：[mp-element-extraction.md](../mp-element-extraction.md)（分析分割反哺合併判斷）
- 動態提示詞概念：[dy-dynamic-prompts.md](../dy-dynamic-prompts.md)
