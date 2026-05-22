---
tags:
  - documentation
  - image-post-processing
  - analysis
  - guides
  - documentation/references
---

# 指南類 (Guides) 文件分析

## 分析對象

| 文件 | Skill | 主要用途 |
|------|-------|---------|
| `map-strategies.md` | generate2dmap | 地圖策略選擇決策樹 |
| `prompt-rules.md` | generate2dsprite | 提示詞撰寫規範 |

---

## 1. Map Strategies 分析

### 核心概念

**管道軸選擇模型** - 透過組合視覺模型、運行時物件模型、碰撞模型來選擇最適合的地圖製作策略。

### 管道軸定義

```
地圖 = VisualModel × RuntimeObjectModel × CollisionModel × EngineTarget
```

### Visual Model 決策矩陣

| 模型 | 使用時機 | 產出物 |
|------|---------|--------|
| `baked_raster` | 靜態場景、戰鬥背景、標題畫面、快速原型 | 單一圖片 + 可選碰撞/區域 |
| `layered_raster` | 需要碰撞/遮擋的 RPG 場景、互動道具 | base + props + 放置元數據 |
| `tilemap` | 使用 Tiled/LDtk/Godot/Unity 編輯器 | tileset + 引擎原生地圖數據 |
| `layered_tilemap` | 多 tile 層次、角色可穿過上層 | tileset + 分層 tile 數據 |
| `parallax_layers` | 橫向卷軸、射擊遊戲、捲動背景 | 背景/中景/前景 + 捲動速度 |

### Runtime Object Model 選項

| 模型 | 描述 | 適用場景 |
|------|------|---------|
| `none` | 純背景或 tile 層 | 靜態場景 |
| `separate_props` | 獨立精靈，無需 Y 排序 | 簡單道具 |
| `y_sorted_props` | 按 base Y 排序 | 俯視角 RPG 場景 |
| `interactive_entities` | 需要對話/拾取/門/可破壞 | 互動物件 |
| `foreground_occluders` | 特定覆蓋層永遠繪製在角色上 | 前景遮擋 |

### Collision Model 選項

| 模型 | 描述 | 適用場景 |
|------|------|---------|
| `none` | 純視覺地圖 | 背景 |
| `coarse_shapes` | 簡單矩形/橢圓 | 固定競技場 |
| `precise_shapes` | 明確阻擋器和行走邊界 | 圖層 RPG 地圖 |
| `tile_collision` | 每 tile 存儲碰撞 | tilemap 場景 |
| `polygon_walkmesh` | 不規則可行走區域 | 受限路徑地圖 |
| `trigger_zones` | 遭遇/休息/出口/對話區域 | 常與其他模型組合 |

### Engine Target 支援

- `raw_canvas` - PNG + JSON + 專案特定渲染
- `Phaser` - atlas/tilemap JSON
- `Tiled_JSON` - Tiled 相容格式
- `LDtk` - LDtk 實體/圖層概念
- `Godot_TileMap` - Godot 結構
- `Unity_Tilemap` - Unity 工作流程
- `project-native` - 保留現有結構

### 預設配置範例

#### 戰鬥背景
```yaml
visual_model: baked_raster
runtime_object_model: none
collision_model: none  # or coarse_shapes
產出: 單一 PNG + 可選區域
```

#### RPG 探索場景
```yaml
visual_model: layered_raster
runtime_object_model: y_sorted_props
collision_model: precise_shapes + trigger_zones
產出: base + props + 放置 JSON + 碰撞 JSON + 預覽
```

#### 怪物草原
```yaml
visual_model: layered_raster
runtime_object_model: y_sorted_props + interactive_entities
collision_model: precise_shapes + trigger_zones
適合道具包: 石頭、灌木、花朵、招牌、小原木
```

#### 橫向卷軸關卡
```yaml
visual_model: parallax_layers
runtime_object_model: separate_props
collision_model: precise_shapes
產出: 視差層 + 碰撞平台 + 危險物 + 出生點/檢查點
```

### 升級啟發式流程

```
1. baked_raster
2. baked_raster + coarse_shapes
3. layered_raster + a few props
4. layered_raster + y_sorted_props + precise_shapes
5. tilemap or layered_tilemap (僅當引擎/編輯器需求時)
```

---

## 2. Prompt Rules 分析

### 核心概念

**提示詞撰寫規範** - 定義撰寫 sprite 生成提示時必須遵守的全局規則、風格規則、參考規則和包含規則。

### 全局強制規則

| 規則 | 值 | 說明 |
|------|-----|------|
| 背景色 | `#FF00FF` | 100% 純平洋紅色 |
| 漸層 | 禁止 | 背景無漸層 |
| 文字 | 禁止 | 無文字、標籤、UI、對話框 |
| 網格 | 精確數量 | 無邊框或細胞間框架 |
| 資產一致性 | 嚴格要求 | 相同身份、相同邊界框、相同像素比例 |

### 風格選擇矩陣

| 風格 | 描述 | 使用時機 |
|------|------|---------|
| `pixel_art` | 經典 2D 遊戲角色和動畫表 | 預設經典精靈 |
| `clean_hd` | 乾淨手繪 HD 風格，清晰輪廓，平滑表面 | 地圖道具、HD 資產 |
| `pixel_inspired` | 乾淨現代像素風格，無 16-bit 用語 | 像素感但非復古 |
| `retro_pixel` | 16-bit 像素或復古 JRPG | 明確要求復古風格 |
| `map_style` | 匹配可見參考或專案風格 | 與現有地圖一致 |

**重要警告：** 除非使用者明確要求，否則不要寫 `16-bit`、`retro JRPG` 或 `chunky pixel-art`。

### 參考圖片使用規則

#### 強制步驟
1. **先使參考圖片可見** - 本地檔案使用 `view_image`
2. **在提示詞中聲明** - "use the image just shown as the visual reference"
3. **定義不變元素** - 輪廓家族、調色盤、臉部/眼睛、服裝標記
4. **定義可變元素** - 姿勢、動畫階段、動作能量、進化特徵

#### 動畫表一致性要求
- 每個細胞保持相同角色身份
- 僅改變動畫姿勢或效果狀態
- 保持洋紅色背景和包含規則

### 包含規則 (Containment Rules)

#### 嚴格要求
```
- 整個主體必須完全適合每個細胞內部
- 無身體部位、效果、武器、尾巴、翼尖、光球、火花或煙軌可以跨越細胞邊緣
- 四邊留有洋紅色邊距
- 每個幀使用相同的輪廓比例
```

#### 分離效果處理
| 情況 | 規則 |
|------|------|
| 不需要分離效果 | "no floating detached effects outside the main silhouette" |
| 需要分離效果 | 保留但確保不影響主體穩定性 |

### 快速提示詞模式

```
1. 說明資產類型和表形狀
2. 描述主體身份
3. 如適用，聲明參考角色和不變元素
4. 描述逐幀動作
5. 重申相同比例和包含規則
6. 重申洋紅色背景和無文字規則
```

---

## 決策流程比較

| 指南類型 | 決策焦點 | 輸出 |
|---------|---------|------|
| Map Strategies | 地圖管道選擇 | 技術架構配置 |
| Prompt Rules | 提示詞撰寫 | 符合規範的生成提示 |

---

*報告生成時間：2026-05-02*
