---
name: comment-format-rules-css
description: CSS/SCSS 註解規範。適用於撰寫或修改 CSS/SCSS 檔案時的註解格式指引。核心原則：註解應解釋「為什麼這樣做」而非只有「做了什麼」。Use when users request (1) "CSS 註解", (2) "SCSS 註解", (3) "為 CSS 添加註解", (4) "為 SCSS 添加註解", (5) "CSS 註解格式", (6) "SCSS 註解格式", (7) "CSS comment", (8) "SCSS comment", (9) "CSS documentation", (10) "SCSS documentation", (11) "為 CSS 更新註解", (12) "為 SCSS 更新註解", (13) "CSS 註解修正", (14) "SCSS 註解修正". All CSS/SCSS commenting guidelines. Core principle: comments should explain WHY, not just WHAT.
---

# CSS/SCSS 註解規範

本技能用於 CSS/SCSS 檔案的註解格式指引，確保程式碼的可維護性與可讀性。

## 核心原則

撰寫 CSS/SCSS 時，註解應該解釋 **「為什麼這樣做」**（Why），而非只有 **「做了什麼」**（What）。

---

## 絕對禁止

在新增或修改註解時，**絕對禁止**以下行為：

### 禁止更改現有程式碼格式

**絕對禁止** 更改任何現有的程式碼 formatting（縮排、換行、空格等），僅在空白處或行間插入註解。

### 禁止刪除舊有註解代碼

**絕對禁止** 刪除舊有已被註解不使用的代碼（如 `/* ... */` 包裹的廢棄代碼）。這些代碼可能包含重要的歷史資訊或除錯線索。

### 禁止轉換原始碼漢字

**絕對禁止** 將原始代碼中已經存在的 CJK 漢字轉換為繁體漢字（如簡體字「代码」不轉為「代碼」）。僅在新增註解時使用繁體中文，原始代碼內容應保持原樣。

---

## 1. 註解格式

### 使用 `/* */` 區塊註解

所有註解一律使用 `/* */` 或 `/** */` 格式的區塊註解，不使用 `//` 行內註解。
超過一行的註解，應使用**多行區塊註解** (`/* ... */`)，而非多個單行註解。

### 正確格式

```scss
/* 使用 flex 而非 grid (Use flex instead of grid)，因為項目數量不固定且需要單行滾動 */
display: flex;
overflow-x: auto;
```

### 錯誤格式

```scss
// 使用 flex 而非 grid，因為項目數量不固定
// Use flex instead of grid for variable item count
display: flex;
```

### 避免連續多個單行註解

雙語註解應盡量在同一行內完成，避免使用多個連續的單行區塊註解。
超過一行的註解，應使用**多行區塊註解** (`/* ... */`)，而非多個單行註解。

### 正確格式

```scss
/* 使用 flex 而非 grid (Use flex instead of grid)，因為項目數量不固定且需要單行滾動 */
display: flex;
overflow-x: auto;

/**
 * 預期排版：水平置中容器 + 內部文字左對齊
 * Expected layout: centered container with left-aligned text
 */
margin: 4px auto 0;
```

### 錯誤格式

```scss
/* 使用 flex 而非 grid，因為項目數量不固定且需要單行滾動 */
/* Use flex instead of grid for variable item count with single-line scroll */
display: flex;
overflow-x: auto;
```

### 區塊分隔註解使用區塊註解

區塊分隔註解:
- 章節標題（變數定義、Mixins、全域重置...等）
- 所有子區塊分隔線（`--- 間距變數 ---`、`--- 圓角變數 ---` 等）

超過一行的註解，應使用**多行區塊註解** (`/* ... */`)，而非多個單行註解。

### 正確格式

```scss
/*
 ============================================
  1. 變數定義 (Variables)
 ============================================
 */

/* --- 間距變數 (Spacing Variables) --- */
$spacing-xs: 4px;
```

### 錯誤格式

```scss
// ============================================
// 1. 變數定義 (Variables)
// ============================================

// --- 間距變數 ---
$spacing-xs: 4px;
```

---

## 2. 註解位置

**註解應放置於代碼上方**，而非代碼後方。

### 正確範例

```scss
/* margin: auto 實現水平置中 (horizontal centering)，避免使用 text-align 影響子元素 */
margin: 4px auto 0;

/* fit-content 讓寬度依內容自適應 (fit-content for auto width)，配合 max-width 防止過長內容撐破布局 */
width: fit-content;
max-width: 90%;
```

### 錯誤範例

```scss
margin: 4px auto 0; /* 設定 margin */
width: fit-content; /* 寬度 fit-content */
```

---

## 3. 排版意圖註解

任何涉及版面布局的樣式，必須說明**預期呈現的排版效果**以及選擇該策略的原因。

### 良好範例

```scss
/**
 * 預期排版：水平置中容器 + 內部文字左對齊
 * Expected layout: centered container with left-aligned text
 *
 * 為什麼：錯誤訊息通常較長，置中區塊可突出顯示，
 *        但文字左對齊維持可讀性
 * Why: Error messages are often long; centered block draws attention,
 *      but left-aligned text maintains readability
 */
&.unavailable-reason {
  /* auto 實現水平置中 (auto for horizontal centering) */
  margin: 4px auto 0;

  /* 依內容調整寬度，避免過寬 (auto width based on content) */
  width: fit-content;

  /* 限制最大寬度為父容器 90%，保持適當留白 (max-width 90% of parent for proper spacing) */
  max-width: 90%;

  /* 文字左對齊，長訊息易於閱讀 (left align for readability) */
  text-align: left;
}
```

### Flex/Grid 布局註解

```scss
/**
 * 預期排版：單行水平排列，項目過多時可橫向滾動
 * Expected: Single-line horizontal layout with scroll on overflow
 *
 * 為什麼：使用 flex 而非 grid，因為項目數量不固定
 * Why: Use flex instead of grid for variable item count
 */
display: flex;
overflow-x: auto;

/**
 * 預期排版：兩欄布局，左側固定 200px，右側填滿剩餘空間
 * Expected: Two-column layout with 200px fixed left sidebar
 */
grid-template-columns: 200px 1fr;
```

---

## 4. 關鍵樣式屬性註解

對於非直觀的數值、特殊屬性組合、或繞過特定問題的解法，必須詳細說明。

### 良好範例

```scss
/* z-index: 9999 是為了覆蓋 VS Code 內建元件的 1000 層級 (to override VS Code's internal 1000-level components) */
z-index: 9999;

/* 使用 !important 覆蓋 VS Code 主題注入的預設樣式 (to override VS Code theme's injected default styles) */
font-size: 14px !important;

/**
 * 負 margin 用於抵消父容器的 padding，實現全寬背景色
 * Negative margin to offset parent's padding for full-width background
 */
margin: 0 -20px;
padding: 10px 20px;
background-color: var(--vscode-errorBackground);

/* line-height: 1.4 提升可讀性，避免緊密的錯誤訊息難以閱讀 (line-height 1.4 for readability) */
line-height: 1.4;
```

---

## 5. 外部變數使用註解

使用外部變數（如 SCSS 變數、CSS 變數、檢視器變數）時，**盡可能提供該變數的值**，幫助理解。

### 良好範例

```scss
/**
 * $spacing-md = 10px
 * 為什麼：使用統一的間距變數保持視覺一致性
 */
padding: $spacing-md;

/**
 * --vscode-errorBackground = #5a1d1d (暗色主題) / #f2dede (淺色主題)
 * 為什麼：使用主題變數而非硬編碼紅色，確保與用戶主題一致
 */
background-color: var(--vscode-errorBackground);

/**
 * $radius-md = 4px
 * 為什麼：統一的圓角變數，與 VS Code 原生元件風格一致
 */
border-radius: $radius-md;
```

---

## 6. 響應式與適配註解

說明斷點選擇的理由、或特定尺寸下的布局調整意圖。

### 良好範例

```scss
/**
 * 預期排版：768px 以下切換為垂直堆疊布局
 * 為什麼：側邊欄寬度限制，水平排列會導致內容擁擠
 */
@media (max-width: 768px) {
  flex-direction: column;
}

/**
 * min-width: 200px
 * 為什麼：確保搜尋框在窄螢幕仍有足夠輸入空間
 */
min-width: 200px;
```

---

## 7. 除錯友善註解

對於容易誤解或常見錯誤的樣式，提供除錯指引。

### 良好範例

```scss
/**
 * ⚠️ 注意：修改此處 padding 需同步調整子元素的負 margin
 * ⚠️ Note: Changing this padding requires updating child negative margin
 */
padding: 20px;

/**
 * FIXME: 暫時使用固定高度 300px，未來應改為動態計算
 * FIXME: Temporary fixed height; should be dynamic in future
 */
height: 300px;

/**
 * HACK: 使用 pseudo-element 繞過 VS Code webview 的滾動條樣式限制
 * HACK: Using pseudo-element to bypass VS Code webview scrollbar restrictions
 */
&::before {
  content: '';
  position: absolute;
}
```

---

## 8. 完整範例

```scss
/**
 * unavailable-reason 區塊
 *
 * 預期排版：水平置中於父容器，寬度依內容自適應但不大於 90%，
 *          內部文字左對齊以維持長訊息可讀性
 * Expected: Horizontally centered, width fits content but max 90%,
 *           text left-aligned for readability
 *
 * 為什麼：錯誤訊息通常較長，置中區塊可突出顯示，
 *        但文字左對齊讓長訊息易於閱讀
 * Why: Error messages are often long; centered block draws attention,
 *      but left-aligned text maintains readability
 */
&.unavailable-reason {
  /* $spacing-xs = 4px, auto 實現水平置中 (auto for horizontal centering) */
  margin: 4px auto 0;

  /* 內部間距：垂直 4px, 水平 6px (Padding: vertical 4px, horizontal 6px) */
  padding: 4px 6px;

  /**
   * --vscode-inputValidation-errorBackground = #5a1d1d (dark) / #f2dede (light)
   * 為什麼：使用主題變數確保與用戶主題一致
   */
  background: var(--vscode-inputValidation-errorBackground);

  /* $radius-sm = 3px */
  border-radius: 3px;

  /* 行高 1.4 提升可讀性，避免緊密文字難以閱讀 (line-height 1.4 for readability) */
  line-height: 1.4;

  /* 寬度依內容調整，避免過寬撐破布局 (Width based on content to prevent overflow) */
  width: fit-content;

  /* 最大寬度限制為父容器 90%，保持適當留白 (Max 90% of parent for proper spacing) */
  max-width: 90%;

  /* 文字左對齊，長訊息易於閱讀 (Left align for readable long messages) */
  text-align: left;
}
```

---

## 決策檢查清單

撰寫或修改 CSS/SCSS 時，問自己：

- [ ] 這個布局預期呈現什麼效果？（置中？兩欄？單行滾動？）
- [ ] 為什麼選擇這個布局方式？（flex vs grid vs absolute）
- [ ] 這個數值有特殊考量嗎？（magic number 的來源）
- [ ] 外部變數的值是什麼？有註明嗎？
- [ ] 使用 `!important` 或特殊優先級的原因是什麼？
- [ ] 這個樣式與 VS Code 主題如何互動？
- [ ] 三個月後回來看，我能理解當初的意圖嗎？

---

## 相關資源

- [CSS-Tricks: Comments in CSS](https://css-tricks.com/comments-in-css/)
- [Google CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html#CSS_Style_Rules)
- [CSS 注释 - CSS：层叠样式表 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Guides/Syntax/Comments)
