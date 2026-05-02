# 提取的共用模式與規範

## 概述

從 `generate2dmap` 與 `generate2dsprite` 兩個 skill 中提取的**可共用模式**，供未來新技能參考使用。

**提取原則：**
- ✅ 不更動原有 skill 的任何文件
- ✅ 僅作為設計新技能時的參考依據
- ✅ 標註來源與適用情境

---

## 1. 色度鍵處理規範 (Chroma Key Specification)

### 標準色值
| 參數 | 標準值 | 來源 |
|------|--------|------|
| 背景色 | `#FF00FF` (洋紅色) | `prop-pack-contract.md`, `prompt-rules.md` |
| 色值格式 | HEX RGB | 通用 |
| 背景類型 | 100% 純平，無漸層 | `prompt-rules.md` |

### 清理流程
```
原始圖片 (洋紅背景)
    ↓
色度鍵清理 (remove_chroma_key.py)
    - --key-color '#ff00ff'
    - --soft-matte (抗鋸齒邊緣)
    - --despill (去色溢)
    - --edge-contract 1px (邊緣收縮)
    ↓
透明通道圖片
```

### 閾值參數建議
| 參數 | 建議值 | 說明 |
|------|--------|------|
| transparent-threshold | 35 | 透明度閾值 |
| opaque-threshold | 160 | 不透明度閾值 |
| edge-contract | 1px | 邊緣雜訊去除 |

---

## 2. QC (品質控制) 檢查規範

### 通用 QC 項目

| 檢查項目 | 檢查內容 | 來源 Skill |
|---------|---------|-----------|
| `edge_touch` | 物件是否接觸細胞/圖片邊緣 | `generate2dmap`, `generate2dsprite` |
| `alpha_check` | 透明道具是否包含 alpha 通道 | `generate2dmap` |
| `dimension_match` | base/dressed/preview 尺寸一致性 | `generate2dmap` |
| `scale_consistency` | 多幀圖片中物件比例一致性 | `generate2dsprite` |
| `alignment_check` | 對齊點（bottom/feet/center）| `generate2dsprite` |

### Edge Touch 檢查標準

**定義：** 道具/物件的任何部分（身體、效果、武器、尾巴、翼尖、光球、煙軌）接觸或跨越邊界。

**拒絕條件：**
```yaml
critical: 接受的道具不得有 edge_touch: true
action: 重新生成或調整提示詞（如 "fit inside central 50% of cell"）
```

### QC 檢查清單模板

```markdown
## QC Checklist

- [ ] 圖片檔案存在且可開啟
- [ ] 尺寸符合預期
- [ ] 透明道具包含 alpha 通道
- [ ] 無 edge_touch 問題（接受的道具）
- [ ] 無文字/UI/水印
- [ ] 背景色正確（#FF00FF 或指定值）
- [ ] 多幀圖片比例一致
- [ ] JSON 元數據可解析
- [ ] 引用的資產檔案存在
```

---

## 3. 處理流程模式 (Processing Pipeline Pattern)

### 通用三階段流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   生成階段   │ --> │   處理階段   │ --> │   QC 階段   │
│  (Generate)  │     │  (Process)   │     │   (Check)   │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
• 使用外部 image_gen   • 色度鍵清理          • 自動檢查
• 產生原始圖片         • 分割/提取           • 人工審核
• 洋紅色背景           • 對齊/縮放           • 拒絕/接受決策
                       • 格式轉換            • 迭代改進
```

### 各階段責任分離

| 階段 | Agent 責任 | Script 責任 | 輸出 |
|------|-----------|------------|------|
| 生成 | 撰寫提示詞、設定參數 | 無（外部 image_gen）| 原始圖片 |
| 處理 | 選擇處理參數 | 執行清理、提取、轉換 | 處理後資產 |
| QC | 審核結果、決策 | 執行自動檢查 | QC 報告/元數據 |

---

## 4. 輸出格式規範 (Output Format Specification)

### 標準輸出結構

```
output/
├── {asset-name}/
│   ├── raw.{ext}              # 原始生成圖片
│   ├── cleaned.{ext}          # 清理後圖片（可選）
│   ├── transparent.{ext}      # 透明最終圖片
│   ├── frames/                # 逐幀輸出（動畫）
│   │   ├── frame-001.png
│   │   └── ...
│   ├── animation.gif          # GIF 動畫（動畫）
│   ├── prompt-used.txt        # 使用的提示詞
│   └── pipeline-meta.json     # 處理元數據
```

### 元數據 JSON 結構

```json
{
  "source": "原始圖片路徑",
  "processing": {
    "rows": 3,
    "cols": 3,
    "cell_size": [w, h],
    "fit_scale": 0.85,
    "align": "center|bottom|feet",
    "shared_scale": true,
    "component_mode": "all|largest"
  },
  "qc": {
    "frames": [
      {
        "index": 0,
        "edge_touch": false,
        "size": [w, h]
      }
    ],
    "edge_touch_frames": []
  },
  "output": {
    "transparent_sheet": "path/to/sheet.png",
    "frames_dir": "path/to/frames/",
    "gif": "path/to/animation.gif"
  }
}
```

---

## 5. 提示詞撰寫模式 (Prompt Writing Patterns)

### 強制規則模板

```markdown
## 任何提示詞必須包含：

1. **背景規範**
   - Background is 100% solid flat #FF00FF magenta
   - No gradients, no texture, no shadows, no floor plane

2. **內容限制**
   - No text, no labels, no UI, no watermark
   - No borders, no grid lines between cells

3. **一致性要求**（多幀圖片）
   - Same asset identity across all frames
   - Same bounding box and pixel scale
   - No part may cross cell edges
   - Leave magenta margin on all four sides
```

### 風格選擇指南

| 風格關鍵詞 | 使用情境 | 明確禁止 |
|-----------|---------|---------|
| `clean_hd` | 手繪 HD 遊戲資產 | 像素藝術 |
| `pixel_art` | 經典 2D 精靈 | - |
| `pixel_inspired` | 現代像素風格 | 16-bit 用語 |
| `retro_pixel` | 復古 JRPG | 僅當使用者要求 |

**風格選擇原則：** 預設使用 `clean_hd`，僅當使用者或專案明確要求時使用像素風格。

---

## 6. Reference 圖片處理模式

### 參考圖片使用流程

```
使用者提供參考
      ↓
本地檔案？ -> 使用 view_image 載入上下文
URL/已生成？ -> 確保在對話中可見
      ↓
提示詞中聲明：
"Use the image just shown as the visual reference"
      ↓
定義不變元素：
- Silhouette family
- Palette
- Face/eye features
- Costume/marking
- Material language
      ↓
定義可變元素：
- Pose
- Animation phase
- Action energy
- Evolution traits
```

### 關鍵限制

> **重要：** Reference 圖片無法用路徑直接指定給 image_gen。
> 必須先透過 `view_image` 使其在對話上下文中可見。
> 不要期望檔案系統路徑在提示詞中作為視覺輸入生效。

---

## 7. 處理器參數設計模式

### 常見處理參數

| 參數 | 類型 | 說明 | 典型值 |
|------|------|------|--------|
| `rows` | int | 網格行數 | 1-4 |
| `cols` | int | 網格列數 | 1-4 |
| `cell_size` | int | 細胞尺寸（正方形）| 根據資產 |
| `fit_scale` | float | 佔用比例 | 0.85 (85%) |
| `align` | enum | 對齊方式 | center, bottom, feet |
| `shared_scale` | bool | 統一縮放 | true (多幀) |
| `component_mode` | enum | 組件模式 | all, largest |
| `threshold` | int | 色度鍵閾值 | 100 |
| `edge_threshold` | int | 邊緣閾值 | 150 |

### 對齊方式選擇邏輯

| 資產類型 | 建議對齊 | 原因 |
|---------|---------|------|
| 地面角色 | `bottom` 或 `feet` | 接觸地面 |
| 漂浮效果 | `center` | 空中定位 |
| 飛行道具 | `center` | 運動軌跡 |
| 分離 FX | `center` | 效果中心 |

---

## 8. 技能設計原則

### 責任分離原則

| 責任 | Agent | Script | 外部服務 |
|------|-------|--------|---------|
| 創意決策 | ✅ | ❌ | ❌ |
| 提示詞撰寫 | ✅ | ❌ | ❌ |
| 圖片生成 | ❌ | ❌ | ✅ (image_gen) |
| 技術處理 | ❌ | ✅ | ❌ |
| QC 審核 | ✅ (決策) | ✅ (自動檢查) | ❌ |

### 指令原則

```
✅ Agent 必須自己撰寫提示詞
❌ 不要用 script 生成創意提示詞
✅ Script 僅用於確定性處理：清理、提取、對齊、QC
❌ Script 不應取代 image_gen 作為最終視覺來源
```

---

## 適用情境建議

### 建議採用這些模式的技能類型

- ✅ 需要圖片後處理的 2D 資產生成技能
- ✅ 使用洋紅色色度鍵的透明提取流程
- ✅ 多幀動畫表的處理與 QC
- ✅ 需要與外部 image_gen 整合的技能

### 需要調整的情境

- ⚠️ 非洋紅色背景的色度鍵需求 → 調整色值參數
- ⚠️ 3D 資產 → 不適用，需重新設計
- ⚠️ 純生成無需後處理 → 可省略處理階段

---

*提取來源：generate2dmap, generate2dsprite*
*提取時間：2026-05-02*
*用途：供未來新技能設計參考*
