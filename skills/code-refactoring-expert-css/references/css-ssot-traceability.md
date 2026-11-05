---
title: CSS SSoT 與可追溯性落地指引 (SSoT & Traceability)
description: >-
  補充 SKILL 黃金原則的落地細節：視覺常數的單一定義處（SCSS 變數、CSS 自訂屬性、Tailwind theme）、
  使用點→語意 Token→基礎 Token 的引用鏈追溯、常見違規樣態（硬編碼散落、同值重複定義、引用鏈中斷）
  與對應重構手法，附重構檢查表。
tags:
  - documentation/references
  - css
  - scss
  - less
  - tailwindcss
  - single-source-of-truth
  - traceability
  - design-tokens
---

# CSS SSoT 與可追溯性落地指引 (SSoT & Traceability)

> 本文補充 SKILL 黃金原則在 Pure CSS / Less / SCSS / TailwindCSS 的落地手法、常見違規與重構檢查表；`var()` Fallback 的完整規範（含不可控外部來源例外）見 SKILL 主文。

---

## 單一定義處：Token 放在哪 (Single Definition Point)

| 生態 | Token 載體 | 單一定義處 |
| :--- | :--- | :--- |
| Pure CSS | CSS 自訂屬性 (Custom Property) `--*` | 集中於 `:root`（或分層 `@layer`）的權杖檔 |
| SCSS | Sass 變數 `$*` ＋ CSS 自訂屬性 | Sass 變數檔（編譯期）；執行期權杖由其產生 |
| Less | Less 變數 `@*` ＋ CSS 自訂屬性 | Less 變數檔（編譯期） |
| TailwindCSS | theme 設定／`@theme` | 專案設定檔的 theme 區塊；任意值 `[...]` 屬硬編碼，須有明確理由 |

**同一值只定義一次**：`#bdc8d7` 若同時出現在變數檔、元件 SCSS 與行內樣式，即三處各自維護 — 抽取為單一 Token 後全部改為引用。

---

## 引用鏈與追溯 (Reference Chain)

```scss
/* ✅ 引用鏈完整：使用點 → 語意 Token → 基礎 Token → 定義檔 */
color: var(--color-text-primary);
```

```scss
:root {
  --color-text-primary: var(--color-gray-700); /* 語意層 */
  --color-gray-700: #bdc8d7;                   /* 基礎層：定義處 */
}
```

從任一使用點沿 `var()` 內的變數名回溯，即可抵達唯一定義處；改動定義處時所有引用端自動生效。

---

## 常見違規樣態 (Violation Patterns)

1. **硬編碼散落** — 行內樣式或元件內直接寫死值（`color: #bdc8d7`），無 Token 可追溯。
2. **同值重複定義** — 相同字面值在多處各自定義，改色需逐處尋找（Shotgun Surgery）。
3. **引用鏈中斷** — 使用點繞過語意 Token 直接寫死值，或引用了不存在的 Token 卻以常數 fallback 掩蓋（違反 SKILL 第 1 節）。
4. **外部來源未經橋接** — 使用點直接散落引用外部變數，應集中於 Token 橋接層（SKILL 第 4 節）。

---

## 重構手法 (Refactoring Moves)

1. **收斂定義**：搜尋重複字面值 → 抽取為基礎 Token → 各處改為引用。
2. **補鏈**：使用點的硬編碼值 → 改引用語意 Token；語意 Token 缺失則先建立。
3. **接入外部來源**：以外部變數為主、專案 Token 為 fallback，定義於橋接層；使用點只引用專案 Token（SKILL 第 4 節）。

---

## 重構檢查表 (Checklist)

- [ ] 同一視覺值是否只有一處定義？
- [ ] 使用點是否引用 Token 而非字面值？
- [ ] `var()` 備援是否為變數對變數？（外部不可控來源除外，見 SKILL 第 4 節）
- [ ] 外部來源是否集中於橋接層，使用點不直接引用外部變數？
- [ ] 從任一使用點能否回溯到定義檔？
