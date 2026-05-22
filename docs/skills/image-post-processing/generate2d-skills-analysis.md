---
tags:
  - documentation
  - image-post-processing
  - analysis
  - generate2d
  - documentation/references
---

# Generate2D Skills 分析報告

## 概述

分析對象：`generate2dmap` 與 `generate2dsprite` 兩個 skill 的功能定位與圖片來源限制。

---

## 核心結論

### 兩個 Skill 皆為「後處理工具」，非圖片生成器

| Skill | 呼叫 GPT-image API | 後處理功能 |
|-------|-------------------|-----------|
| `generate2dmap` | ❌ 否（由外部 `image_gen` 處理） | ✅ 色度鍵、道具提取、圖層合成 |
| `generate2dsprite` | ❌ 否（由外部 `image_gen` 處理） | ✅ 色度鍵清理、幀分割、對齊、GIF 匯出 |

**兩個 skill 都是「後處理器」**，負責清理和加工已經由 Codex 內建 `image_gen` 生成的圖片，而不是自己發起圖片生成請求。

---

## 詳細分析

### @[skills/generate2dmap] - 2D 地圖生成

**定位：** 純後處理工具

#### 組件功能
| 檔案 | 功能說明 |
|------|---------|
| `SKILL.md` | 明確說明使用 `built-in image_gen` 作為視覺資源來源，**不是**由腳本呼叫 |
| `extract_prop_pack.py` | 從洋紅色背景道具包中提取透明道具（色度鍵處理） |
| `compose_layered_preview.py` | 合成圖層地圖預覽圖 |

#### 關鍵引用
> "This skill is image-generation-first for visual assets. Use built-in `image_gen` as the default creative art source... **The agent must write the creative image prompts itself**. Do not use scripts to generate creative prompts or to procedurally draw final visual art. **Scripts may assemble, slice, chroma-key, crop, validate, compose previews...**"
> — `SKILL.md:21-26`

---

### @[skills/generate2dsprite] - 2D 精靈生成

**定位：** 純後處理工具

#### 組件功能
| 檔案 | 功能說明 |
|------|---------|
| `SKILL.md` | 明確說明使用 `built-in image_gen` 生成原始圖片 |
| `generate2dsprite.py` | `build-prompt`：構建提示詞 / `process`：後處理生成後的圖片 |

#### 腳本內的處理功能
- 洋紅色背景清理（`remove_bg_magenta`）
- 幀分割與提取
- 對齊與縮放
- 透明 GIF 匯出
- QC 元數據生成

#### 關鍵引用
> "Use built-in `image_gen` for every raw image."
> "Use the script only as a deterministic processor: **magenta cleanup, frame splitting, component filtering, scaling, alignment, QC metadata, transparent sheet export, and GIF export.**"
> — `SKILL.md:37,40`

#### 腳本中無 API 呼叫
經 grep 搜尋 `image_gen|api|request|http|openai|codex`，`generate2dsprite.py` 中無相關 API 呼叫代碼。

---

## 公用 Skill 可行性

### ✅ 可以作為公用 Skill

這兩個 skill **完全可以作為公用後處理工具**，因為：
- 不內嵌特定 API 金鑰或端點
- 不依賴特定專案的結構
- 純粹處理輸入圖片並輸出加工後的結果

---

## 圖片來源的提供方式與限制

### 支援的來源類型

| 來源類型 | 支援度 | 限制說明 |
|---------|--------|---------|
| **本地檔案路徑** | ✅ 支援 | 透過 `--input` 參數直接傳遞給腳本 |
| **已生成的圖片** | ✅ 支援 | 從 `$CODEX_HOME/generated_images/...` 路徑讀取 |
| **現有資源** | ✅ 支援 | `generate2dmap` 支援 `existing_assets` 模式 |
| **Reference 圖片** | ⚠️ **有限制** | 必須先透過 `view_image` 使其在對話上下文中可見 |

### 關鍵限制

#### 1. Reference 圖片無法用路徑直接指定

`generate2dsprite` 的 `prompt-rules.md:38` 明確規定：
> "If the reference is a local file, **call `view_image` first**; do not assume a path string is a visual input."

`generate2dmap` 的 `layered-map-contract.md:46` 也說明：
> "If the base exists as a local file, **call `view_image` first**; do not expect a filesystem path in the prompt to work as the visual reference."

**原因：** Codex 的 `image_gen` 無法直接讀取檔案系統路徑作為視覺輸入，必須先將圖片載入對話上下文。

#### 2. 後處理腳本的輸入方式

`generate2dsprite.py process` 命令透過檔案系統讀取：
```bash
python generate2dsprite.py process --input /path/to/image.png --output-dir ./out
```

這**沒有限制**，任何本地路徑都可。

#### 3. 洋紅色背景要求

兩個 skill 都期望輸入圖片有 `#FF00FF` 洋紅色背景（作為色度鍵）：
- `generate2dsprite`: 嚴格要求 `solid #FF00FF background`
- `generate2dmap`: Prop pack 必須是 `solid-magenta` 背景

---

## 公用 Skill 的使用模式

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   圖片來源      │ --> │   後處理 Skill   │ --> │    輸出結果      │
│  (任何來源)    │     │                  │     │                │
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ • 外部 image_gen│     │ generate2dmap    │     │ • 透明 PNG      │
│ • 使用者上傳   │     │   - 道具提取     │     │ • GIF 動畫      │
│ • 現有資產     │     │   - 圖層合成     │     │ • 碰撞元數據    │
│ • 其他 AI 生成 │     │ generate2dsprite │     │ • JSON 配置     │
│                │     │   - 色度鍵清理   │     │                 │
│                │     │   - 幀分割       │     │                 │
│                │     │   - 對齊/縮放    │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

---

## 總結

這兩個 skill 確實適合作為**公用後處理工具**：

1. **不涉及 API 呼叫** - 純本地處理
2. **輸入彈性高** - 支援任何本地圖片路徑
3. **唯一限制** - Reference 圖片需透過 `view_image` 載入上下文，不能直接用路徑
4. **格式要求** - 輸入圖片需有 `#FF00FF` 洋紅色背景作為色度鍵

---

*報告生成時間：2026-05-02*
