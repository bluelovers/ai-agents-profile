---
tags:
  - docs
  - image-post-processing
  - analysis
  - classification
  - reference
---

# References 文件分類總覽

## 概述

分析對象：`generate2dmap` 與 `generate2dsprite` 兩個 skill 的 `references/` 資料夾內文件。

**檔案總數：** 5 個文件
- `generate2dmap/references/`: 3 個文件
- `generate2dsprite/references/`: 2 個文件

---

## 分類架構

```
references/
├── 📋 規範類 (Specifications)
│   ├── layered-map-contract.md      # 圖層地圖架構合約
│   └── prop-pack-contract.md        # 道具包處理規範
│
├── 🧭 指南類 (Guides)
│   ├── map-strategies.md            # 地圖策略決策指南
│   └── prompt-rules.md              # 提示詞撰寫指南
│
└── 📚 參考類 (References)
    └── modes.md                     # 資產模式與動作類型定義
```

---

## 分類維度說明

### 📋 規範類 (Specifications)
**定義：** 定義系統合約、技術規格、處理流程的約束條件

**識別特徵：**
- 包含 "Contract" 字眼
- 定義輸入/輸出格式
- 明確規定技術參數（如洋紅色色值 `#FF00FF`）
- 描述處理步驟和 QC 規則

**涵蓋文件：**
- `layered-map-contract.md`
- `prop-pack-contract.md`

---

### 🧭 指南類 (Guides)
**定義：** 提供決策邏輯、使用建議、操作指引

**識別特徵：**
- 包含 "Strategies"、"Rules"、"Selection" 字眼
- 說明 "何時使用"、"如何選擇"
- 提供對應範例（如 `"make a boss idle" -> creature + idle`）
- 給予預設值建議

**涵蓋文件：**
- `map-strategies.md`
- `prompt-rules.md`

---

### 📚 參考類 (References)
**定義：** 列舉可用的選項、模式、類型定義

**識別特徵：**
- 純列舉性質的內容
- 定義選項名稱和簡短說明
- 表格或清單形式呈現
- 作為其他文件的引用來源

**涵蓋文件：**
- `modes.md`

---

## 文件重要性分級

| 優先級 | 文件 | 用途 |
|--------|------|------|
| 🔴 核心 | `prop-pack-contract.md` | 道具包提取的核心技術規範 |
| 🔴 核心 | `layered-map-contract.md` | 圖層地圖架構定義 |
| 🟡 重要 | `map-strategies.md` | 地圖類型選擇決策 |
| 🟡 重要 | `prompt-rules.md` | 提示詞撰寫規範 |
| 🟢 輔助 | `modes.md` | 資產類型參考 |

---

## 跨 Skill 的共用模式

### 技術規範一致性
兩個 skill 都使用 **洋紅色背景 (`#FF00FF`)** 作為色度鍵標準：
- `prop-pack-contract.md`: "Background must be 100% solid flat #FF00FF magenta"
- `prompt-rules.md`: "background is 100% solid flat magenta #FF00FF"

### 處理流程相似性
都遵循 **生成 → 後處理 → QC** 的流程：
1. 生成原始圖片（洋紅色背景）
2. 色度鍵清理 / 提取
3. 品質檢查（邊緣接觸、對齊等）

---

## 建議改進

### 可合併的內容
- 兩個 skill 的洋紅色色度鍵規範可以提取為共用規範
- QC 規則（如 `edge_touch` 檢查）可以標準化

### 缺失文件
- 缺少「色度鍵處理技術規範」獨立文件（目前分散在各合約中）
- 缺少「QC 檢查清單」統一文件

---

*報告生成時間：2026-05-02*
