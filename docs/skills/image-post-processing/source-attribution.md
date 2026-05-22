---
tags:
  - docs
  - image-post-processing
  - attribution
  - reference
---

# 來源歸屬 (Source Attribution)

## 專案來源

本資料夾內的分析報告與提取模式，源自以下開源專案：

| 來源 | 網址 | 說明 |
|------|------|------|
| **Agent Sprite Forge** | https://github.com/0x0funky/agent-sprite-forge | 2D 精靈表與地圖生成 Agent Skill |

---

## 包含的 Skills

分析涵蓋以下兩個 skills：

| Skill | 來源路徑 | GitHub 連結 | 功能 |
|-------|---------|-------------|------|
| `generate2dmap` | `skills/generate2dmap/` | [瀏覽目錄](https://github.com/0x0funky/agent-sprite-forge/tree/main/skills/generate2dmap) | 2D 地圖生成與處理 |
| `generate2dsprite` | `skills/generate2dsprite/` | [瀏覽目錄](https://github.com/0x0funky/agent-sprite-forge/tree/main/skills/generate2dsprite) | 2D 精靈表生成與處理 |

### 主要檔案連結

#### generate2dmap
- [SKILL.md](https://github.com/0x0funky/agent-sprite-forge/blob/main/skills/generate2dmap/SKILL.md)
- [scripts/extract_prop_pack.py](https://github.com/0x0funky/agent-sprite-forge/blob/main/skills/generate2dmap/scripts/extract_prop_pack.py)
- [scripts/compose_layered_preview.py](https://github.com/0x0funky/agent-sprite-forge/blob/main/skills/generate2dmap/scripts/compose_layered_preview.py)
- [references/map-strategies.md](https://github.com/0x0funky/agent-sprite-forge/blob/main/skills/generate2dmap/references/map-strategies.md)
- [references/layered-map-contract.md](https://github.com/0x0funky/agent-sprite-forge/blob/main/skills/generate2dmap/references/layered-map-contract.md)
- [references/prop-pack-contract.md](https://github.com/0x0funky/agent-sprite-forge/blob/main/skills/generate2dmap/references/prop-pack-contract.md)

#### generate2dsprite
- [SKILL.md](https://github.com/0x0funky/agent-sprite-forge/blob/main/skills/generate2dsprite/SKILL.md)
- [scripts/generate2dsprite.py](https://github.com/0x0funky/agent-sprite-forge/blob/main/skills/generate2dsprite/scripts/generate2dsprite.py)
- [references/modes.md](https://github.com/0x0funky/agent-sprite-forge/blob/main/skills/generate2dsprite/references/modes.md)
- [references/prompt-rules.md](https://github.com/0x0funky/agent-sprite-forge/blob/main/skills/generate2dsprite/references/prompt-rules.md)

---

## 專案描述

**Agent Sprite Forge** 是一個 Agent Skill，用於從提示詞生成：

- 2D 精靈表 (sprite sheets)
- 2D 地圖 (maps)
- 透明 PNG 幀 (transparent PNG frames)
- 動畫 GIF (animated GIFs)

### 主要特點

- **精靈表生成** - 支援多種網格配置（1x4, 2x2, 2x3, 3x3, 4x4）
- **圖層 RPG 地圖流程** - 分層地圖生成與處理
- **Godot 可編輯 TileMap 匯出** - 引擎相容輸出

---

## 分析範圍

本文件夾內的分析專注於：

- ✅ Skill 的功能定位（後處理工具 vs 圖片生成器）
- ✅ References 文件的分類與結構
- ✅ 可提取的共用模式與規範
- ❌ 不涉及原始專案的安裝或使用說明

---

## 使用授權

原始專案的授權條款請參閱：
https://github.com/0x0funky/agent-sprite-forge/blob/main/LICENSE

本分析文件僅供內部參考使用。

---

*來源記錄時間：2026-05-02*
