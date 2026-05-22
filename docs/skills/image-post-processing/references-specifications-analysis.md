---
tags:
  - documentation
  - image-post-processing
  - analysis
  - specifications
  - documentation/references
---

# 規範類 (Specifications) 文件分析

## 分析對象

| 文件 | Skill | 主要用途 |
|------|-------|---------|
| `layered-map-contract.md` | generate2dmap | 圖層地圖架構定義 |
| `prop-pack-contract.md` | generate2dmap | 道具包處理規範 |

---

## 1. Layered Map Contract 分析

### 核心概念

**圖層地圖架構** - 適用於手繪或生成的 2D RPG 場景，包含角色與道具互動的需求。

### 圖層類型定義（7層）

| 圖層 | 用途 | 內容類型 |
|------|------|---------|
| `base` | 地形和地面細節 | 單一光柵圖像 |
| `props` | 透明道具 | 以地圖座標錨定的精靈 |
| `actors` | 動態角色 | 玩家、NPC、怪物、可拾取物 |
| `foreground` | 前景遮擋 | 必須覆蓋在角色上的透明道具 |
| `collision` | 碰撞資料 | 結構化元數據（非像素） |
| `zones` | 區域觸發 | 遭遇、休息、觸發、出口、對話 |
| `preview` | QA 預覽 | 扁平化的品質檢查產物 |

### 關鍵技術約束

#### Base Map Prompt Pattern
```
- BASE GROUND MAP ONLY（僅限地面層）
- Style: clean HD game asset style
- Do not make pixel art
- Do not include tall collidable objects（不包含高大可碰撞物件）
- Leave clear empty spaces where props will be placed later
```

#### Dressed Reference Pass（著裝參考流程）
1. 生成僅地面的 base 地圖
2. 使用 `view_image` 使 base 可見
3. 生成 dressed-reference 版本（添加道具）
4. 從 dressed reference 提取道具身份和放置座標
5. 最終運行時預覽 = 原始 base + 透明提取道具

### 處理命令範例

```bash
# 處理單一道具
python generate2dsprite.py process \
  --input prop.png \
  --target prop \
  --mode single \
  --output-dir ./out
```

---

## 2. Prop Pack Contract 分析

### 核心概念

**道具包批次處理** - 將多個小道具打包到單一生成圖片中，再提取為獨立透明 PNG。

### 使用時機矩陣

| 適合使用 ✅ | 避免使用 ❌ |
|-----------|------------|
| 石頭、灌木、花朵、蘑菇、原木 | 建築物、大門、寬冠樹木 |
| 木箱、桶子、麻袋、陶罐 | 英雄物件、關鍵故事物品 |
| 小招牌、燈籠、柵欄、柱子 | 動態道具、多狀態道具 |
| 地板裝飾、小雕像、廢墟碎片 | 需要精確輪廓或比例的道具 |

### 技術規格

#### 支援的網格尺寸
| 尺寸 | 道具數量 | 使用建議 |
|------|---------|---------|
| `2x2` | 4 | 最安全的批次大小 |
| `3x3` | 9 | 小/中型環境道具的最佳預設 |
| `4x4` | 16 | 僅適用於非常簡單的小道具 |

#### 提示詞強制規則
```
- 每個道具必須完全適合在細胞中央 50%-60% 區域
- 細胞四邊必須有寬闊的洋紅色邊距
- 不得接觸或跨越細胞邊緣
- 背景必須是 100% 純平 #FF00FF 洋紅色
- 無文字、標籤、UI、水印、數字、箭頭、邊框、網格線
```

### 處理流程

#### 步驟 1：色度鍵清理（可選）
```bash
python remove_chroma_key.py \
  --input raw-sheet.png \
  --out cleaned-sheet.png \
  --key-color '#ff00ff' \
  --soft-matte \
  --transparent-threshold 35 \
  --despill
```

#### 步驟 2：提取道具
```bash
python extract_prop_pack.py \
  --input cleaned-sheet.png \
  --rows 3 --cols 3 \
  --labels rock,shrub,log,lantern,sign,flower,stump,crate,grass \
  --output-dir assets/props \
  --manifest prop-pack.json \
  --component-mode largest \
  --reject-edge-touch
```

#### 步驟 3：建立放置 JSON
```json
{
  "props": [
    {
      "id": "mossy-rock-1",
      "image": "assets/props/mossy-rock/prop.png",
      "x": 420,
      "y": 512,
      "w": 96,
      "h": 72,
      "sortY": 512,
      "layer": "props"
    }
  ]
}
```

### QC 拒絕條件

當出現以下情況時必須拒絕或重新生成：
- ✅ 任何接受的道具 `edge_touch: true`
- ✅ 標籤與請求的細胞不匹配
- ✅ 道具包含文字、UI、陰影或地板
- ✅ 道具風格偏移到角色/NPC 藝術
- ✅ 道具對於預定放置比例過大

---

## 技術參數彙整

### 色度鍵標準
| 參數 | 值 | 用途 |
|------|-----|------|
| 背景色 | `#FF00FF` (洋紅色) | 透明化目標 |
| 透明閾值 | 35 | remove_chroma_key.py |
| 不透明閾值 | 160 | remove_chroma_key.py |
| 邊緣收縮 | 1px | 去除邊緣雜訊 |

### 細胞佔用規範
| 規格 | 要求 |
|------|------|
| 中心佔用 | 50%-60% |
| 邊距 | 寬闊的洋紅色邊溝 |
| 邊緣接觸 | 嚴格禁止 |

---

*報告生成時間：2026-05-02*
