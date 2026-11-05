---
name: code-refactoring-expert-css
description: |-
  泛 CSS（Pure CSS / Less / SCSS / TailwindCSS / PostCSS ...）設計概念與重構/優化指南，
  聚焦單一事實來源 (Single Source of Truth, SSoT)、樣式可追溯性 (Traceability)
  與設計權杖 (Design Token) 階層化架構，並規範 var() Fallback 的允許範圍
  （僅允許變數對變數備援；不可控外部來源變數例外允許常數備援）。

  當執行相關行為或使用者提及時觸發（包含但不限於以下關鍵字或情境）：
  - "重構 CSS / SCSS / Less / TailwindCSS / PostCSS"
  - "CSS 設計概念 / 樣式優化 / 樣式重構"
  - "Design Token / 設計權杖 / Token 階層化"
  - "var() fallback / 備援值 / 硬編碼顏色與數值"
  - "單一事實來源 / SSoT / 可追溯性"（樣式與 Token 脈絡）
  - 執行樣式重構、抽取 Token、清理硬編碼值、建立設計系統權杖時
tags:
  - css
  - scss
  - less
  - tailwindcss
  - refactoring
  - design-tokens
  - single-source-of-truth
  - traceability
  - agents/skills
---

# CSS 設計與重構專家 (Design & Refactoring Expert for CSS)

適用於 泛 CSS、Pure CSS、Less、SCSS、TailwindCSS 與 PostCSS 的設計概念、重構與優化。

> **雙重用途**：**重構現有樣式**（識別硬編碼值、重複定義、中斷的引用鏈）；**新功能設計參考**（建立 Token 階層、維持可追溯性）。

## 黃金原則

1. **單一事實來源 (Single Source of Truth, SSoT)** — 色彩、字體、間距、層級 (z-index) 等視覺常數必須有唯一定義處；同一值散落多處各自維護即屬違規。
2. **可追溯性 (Traceability)** — 從使用點出發，沿引用鏈（使用點 → 語意 Token → 基礎 Token → 定義檔）可回溯至唯一來源；使用點直接寫死值即中斷追溯。
3. **Token 為強制依賴** — 全域設計權杖 (Design Token) 必須存在且正確，缺失屬配置錯誤，不得以 Fallback 掩蓋（外部不可控來源之例外見第 4 節）。

> 📚 SSoT 與可追溯性的落地手法、違規樣態與重構檢查表：[CSS SSoT 與可追溯性落地指引](./references/css-ssot-traceability.md)

---

## 設計系統權杖階層化架構的規定

「全域設計權杖 (Design Token) 必須是強制依賴，絕對不允許用 Fallback 來掩蓋設定缺失或環境配置錯誤」

但「**僅允許變數對變數的備援 (Variable-to-Variable Fallback)**」，不僅消除了用常數遮掩配置錯誤的弊端，還能建立健康的 Token 繼承鏈。

### 1. 核心原則 (Core Principle)

* **嚴格禁止硬編碼備援**：絕對禁止使用任何靜態數值、字串、顏色碼或編譯期常數（如 `#{$font-primary}`）作為 `var()` 的備援值。缺少全域變數應視為配置錯誤，不得用硬編碼掩蓋。（本節約束**本專案可控**的全域／局部 Token；不可控外部來源見第 4 節例外。）
* **允許變數串聯備援**：**唯一允許的 fallback 形式，是另一個 CSS 變數 (Variable-to-Variable Fallback)**。這用於建立 Token 的階層、語意化覆寫或降級繼承。

### 2. 違規寫法（嚴格禁止）

任何使用靜態常數作為備援的寫法，均屬違規：

```scss
/* ❌ 違規：使用硬編碼字串或 Sass 變數作為備援 */
font-family: var(--font-primary, 'メイリオ', Meiryo, sans-serif);
font-family: var(--font-primary, #{$font-primary});
color: var(--main-color, #ff0000);
```

### 3. 合規寫法（唯一允許的 Fallback）

當需要提供備援時，該備援必須指向另一個更具廣泛性或預設值的 CSS 變數：

```scss
/* ✅ 合規：信任全域環境，不使用防禦性 Fallback */
font-family: var(--font-primary);
color: var(--main-color);
```

```scss
/* ✅ 合規：以變數作為備援，建立 Token 階層 */
/* 當元件層級的 --local-font 未定義時，安全降級至全域的 --font-primary */
font-family: var(--local-font, var(--font-primary));

/* ✅ 合規：語意化 Token 降級至基礎 Token */
color: var(--color-brand-primary, var(--color-gray-900));
```

### 4. 例外：不可控外部來源變數的 Fallback (Uncontrollable External Source)

**成立條件**：目標變數來自**不可控因素** — 外部依賴、第三方框架、宿主環境注入等不由本專案決定其是否存在的情境。此類變數的缺失**不是**本專案的配置錯誤，因此**對該外部變數的引用允許使用 Fallback 值**（含常數與編譯期常數）。第 1 節的禁令不適用於此例外。

**約束**：

* **可共用（首選）**：於 Token 橋接層定義一次 — 將外部來源接入本專案 Token，後續使用點只引用本專案 Token，維持 SSoT 與可追溯性。
* **一次性**：僅當具有明確原因與理由時（如無法橋接的單次性需求），才在使用點直接引用外部變數＋Fallback。

```scss
// 可共用：於 Token 橋接層接入外部來源（兩種備援形式擇一）
--color-text-primary: var(--outside-source-color-text-primary, #{$color-text-primary});
--color-text-primary: var(--outside-source-color-text-primary, #bdc8d7);

// 使用點只引用本專案 Token，追溯鏈不中斷
color: var(--color-text-primary);

// 一次性：當具有明確原因與理由時，於使用點直接引用外部變數
color: var(--outside-source-color-text-primary, #{$color-text-primary});
```

### 5. 本規則的架構意義 (Rationale)

* **維持 Token 系統的純粹性**：所有的視覺樣式皆由變數 (Token) 驅動，不讓硬編碼的「魔法字串」散落各處。
* **支援多層級覆寫 (Cascading Layers)**：允許元件在區域範圍 (Local Scope) 定義自己的變數去覆寫全域變數，同時在該區域變數失效時，能平滑降級回全域變數，實現健康的 Design Token 繼承機制。

---

## 相關技能 (Related Skills)

- [comment-format-rules-css](../comment-format-rules-css/SKILL.md) — CSS/SCSS 註解格式規範
- [code-refactoring-expert](../code-refactoring-expert/SKILL.md) — 通用重構原則（設計模式、回溯相容、增量變更）
- [code-refactoring-expert-typescript](../code-refactoring-expert-typescript/SKILL.md) — TypeScript/Node.js 重構與 SSoT 實務
- [agent-behavior-standardization](../agent-behavior-standardization/SKILL.md) — SSoT 通用原則與任務範圍紀律
