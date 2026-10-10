---
description: >-
  動態提示詞 (Dynamic Prompts) 概念檔。說明 sd-forge／ComfyUI 的
  Dynamic Prompts 擴充功能——在生成時展開 `{a|b|c}` 取代欄位；
  只需理解兩種語法：`{a|b|c}` = 從 a/b/c 選一、`{a|b|c|}` = 選 a/b/c 或空白；
  複雜語法不需深入分析。附與本技能自然語言提示詞的關係。
tags:
  - prompts/rules
  - prompts
  - sd-webui
  - comfyui
  - documentation/references
---

# 動態提示詞 (Dynamic Prompts)

> 一支在**生成時**把 `{...}` 取代欄位展開成多組變化的工具。
> 常見於 sd-forge 的 [Stable Diffusion Dynamic Prompts extension](https://github.com/bluelovers/sd-dynamic-prompts/tree/dev-neo-202608)；
> ComfyUI 也有同類插件。
>
> **本檔只記錄會用到的兩種語法**——其餘複雜語法（巢狀、條件、權重等）不需分析理解。

## 基本語法

| 語法 | 意義 |
| --- | --- |
| `{a\|b\|c}` | 從 `a`、`b`、`c` 中**選一個** |
| `{a\|b\|c\|}` | 從 `a`、`b`、`c`、**空白**中選一個 |

差別在**結尾多一個 `\|`**——代表「也可以什麼都不放」，讓該片段成為**可選**。

```text
{red|yellow|grey|brown|}     → 紅 / 黃 / 灰 / 棕 / 什麼都沒有
{standing|sitting|kneeling}  → 站 / 坐 / 跪（必選其一，沒有空白選項）
```

## 與本技能的關係

- **動態提示詞負責「變化量」**——同一份骨架批量產生多組變體
- **自然語言原則負責「每組變體的品質」**——展開後的每一則仍是本技能描述的提示詞，同樣受
  分段分行、正面狀態描述、Faithfulness First 等規則約束
- 兩者互補：**骨架寫得好，展開的變體才有意義**；骨架寫得鬆，只會批量產出同樣鬆散的結果

## 實際應用

完整案例見 [prompts/dy-window-view-example-001.md](prompts/dy-window-view-example-001.md)——
以「窗景透視」為題，示範如何把一則提示詞拆成**距離／前景遮蔽／人物姿勢／室內陳設／玻璃細節／風格**
六個可替換槽位，批量生成構圖相近但細節各異的變體。

---

**相關連結：**

- 主技能：[SKILL.md](../SKILL.md)
- 範例索引：[prompts/README.md](prompts/README.md)
- 擴充來源：[sd-dynamic-prompts (dev-neo-202608)](https://github.com/bluelovers/sd-dynamic-prompts/tree/dev-neo-202608)
