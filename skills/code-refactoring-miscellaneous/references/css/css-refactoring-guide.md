---
title: CSS 重構指南 - 抽離共用樣式值 (Extract Shared Style Values)
description: 將跨選擇器共用的樣式值抽離為 CSS 自訂屬性 (CSS Custom Property)，建立樣式層級的單一事實來源 (SSoT)，避免修改樣式或追加新特效時缺漏同步更新
tags:
  - documentation/references
  - CSS
  - refactoring
  - single-source-of-truth
---

# CSS 重構指南 (CSS Refactoring Guide)

本文記錄 CSS/SCSS 重構的實用模式，依據實際專案經驗整理。各模式獨立成節，可單獨查閱與套用。

**目前收錄：**

1. 抽離共用樣式值 (Extract Shared Style Values)

---

## 1. 抽離共用樣式值 (Extract Shared Style Values)

### 概念 (Concept)

當多個選擇器需要**完全相同**的樣式值（濾鏡、陰影、顏色、圓角...）時，把該值的字面值 (literal) 複製到每一處，等於建立了多個「各自獨立的事實」。只要其中一處被修改、或追加新特效時漏掉其他處，剩餘的副本就會**靜默地 (silently) 落後**——這正是樣式漂移 (style drift) 的來源。

將共用值抽離為**單一 CSS 自訂屬性 (CSS Custom Property)**（SCSS 專案則可用 SCSS 變數 `$`，見「SCSS 版本」），所有使用處改為 `var(--token)` 引用，即在樣式層級建立 **單一事實來源 (Single Source of Truth, SSoT)**：

- **改一次，全域生效**：修改只需編輯變數定義處
- **追加特效不漏同步**：編輯點只有一個，其餘引用處自動同步
- **註解與值同處**：「為什麼是這個值」只需維護一份，不會散落在各使用處

### 問題情境 (Problem)

#### 重構前：字面值複製到多個選擇器

```css
/* ❌ 同一份投影值存在兩份副本，且已經不同步 */
.character-sprite
{
	filter: drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 1px rgba(189, 200, 215, 0.15));
}


.battle-sprite
{
	position: absolute;
	background-repeat: no-repeat;
	filter: drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.3));
}
```

**漂移已經發生**：`.character-sprite` 有兩層陰影（深色下落陰影 + 亮色光暈），`.battle-sprite` 只有一層——當初替 `.character-sprite` 追加「亮色光暈」時，`.battle-sprite` 被遺漏了。這類缺漏**不會產生任何錯誤訊息**，只會在視覺上慢慢偏離預期，往往等到上線後才被發現。

具體風險：

1. **修改時依賴人工記憶同步點** — `drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.3))` 到底出現在幾處？漏改一處就產生不一致
2. **追加特效時容易漏同步** — 新特效通常只加在當下正在調整的選擇器上，其他共用相同基礎值的選擇器被遺忘（本例即為實證）
3. **格式變體加劇比對困難** — 同一個值可能以 `#bdccd7` / `rgba(189, 200, 215, ...)`、空格數量不同、`0.3` 與 `.3` 等格式出現，全文搜尋也難以確認是否一致
4. **無編譯期檢查** — CSS 沒有型別系統或編譯器會警告「這裡少了同步」

### 解決方案 (Solution)

#### 抽離為 CSS 自訂屬性：集中定義 + `var()` 引用

```css
:root
{
	/*
	 * 精靈（Sprite）通用投影（BattleFieldSpriteLayers / MagicCircle / CharacterSprite 共用）
	 * 兩層：深色下落陰影 + 亮色光暈（提高在深色背景上的辨識度）
	 */
	--sprite-drop-shadow: drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 1px rgba(189, 200, 215, 0.15));
}


.character-sprite
{
	filter: var(--sprite-drop-shadow);
}


.battle-sprite
{
	position: absolute;
	background-repeat: no-repeat;
	filter: var(--sprite-drop-shadow);
}
```

> **定義位置**：範例定義在 `:root`（全域作用域）。實際應放在**所有使用處的共同祖先作用域**——若共用範圍只限某個元件群，就定義在該元件群的容器上，避免污染全域。

帶來的效果：

- **漂移被修復**：`.battle-sprite` 自動補回被遺漏的光暈層
- **漂移被預防**：日後調整陰影參數或追加第三層特效，只需編輯 `--sprite-drop-shadow` 一行
- **註解只維護一份**：「兩層分別是什麼、為什麼這樣設定」寫在定義處，使用處不再重複說明
- **可搜尋性**：全文搜尋 `--sprite-drop-shadow` 即可列出所有使用點，取代對長字面值的模糊搜尋

> **⚠️ 重構前先確認「差異是否為刻意」**：本例中 `.battle-sprite` 少一層光暈屬於**意外漂移**，所以統一是修復；若差異是**刻意設計**（例如某選擇器刻意不要光暈），則不可直接同化，應改用下方「變體 A：拆分基礎層與特效層」。

#### SCSS 版本：以 SCSS 變數抽離 (SCSS Version)

專案若使用 SCSS，可改以 SCSS 變數 (`$`) 達成同樣的抽離——**單一定義處、多處引用**。

**重構前**（與上方 CSS 版本相同的漂移）：

```scss
/* ❌ 字面值複製兩份，且已經不同步 */
.character-sprite
{
	filter: drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 1px rgba(189, 200, 215, 0.15));
}


.battle-sprite
{
	position: absolute;
	background-repeat: no-repeat;
	filter: drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.3));
}
```

**重構後**：定義集中於共用 partial（如 `styles/_sprite.scss`），使用處以 `@use` 引入：

```scss
/* _sprite.scss —— 共用定義檔（單一事實來源 / Single Source of Truth） */

/*
 * 精靈（Sprite）通用投影（BattleFieldSpriteLayers / MagicCircle / CharacterSprite 共用）
 * 兩層：深色下落陰影 + 亮色光暈（提高在深色背景上的辨識度）
 */
$sprite-drop-shadow: drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 1px rgba(189, 200, 215, 0.15));


.character-sprite
{
	filter: $sprite-drop-shadow;
}


.battle-sprite
{
	position: absolute;
	background-repeat: no-repeat;
	filter: $sprite-drop-shadow;
}
```

```scss
/* 其他檔案的使用處：@use 引入後直接引用（'as *' 省去命名空間前綴） */
@use 'sprite' as *;

.magic-circle
{
	filter: $sprite-drop-shadow;
}
```

> **命名空間寫法**：不想用 `as *` 時可保留前綴——`@use 'sprite';` 後以 `sprite.$sprite-drop-shadow` 引用，好處是易於辨識值來自哪個來源檔。

**需要層疊拆分時**（對應「變體 A」）：

```scss
/* 拆為基礎層與光暈層，允許個別選擇器只取用其中一層 */
$sprite-shadow-base: drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.3));
$sprite-shadow-glow: drop-shadow(0 0 1px rgba(189, 200, 215, 0.15));

/* 空格分隔的清單 (space-separated list)，編譯輸出為兩個連續的 drop-shadow() */
$sprite-drop-shadow: $sprite-shadow-base $sprite-shadow-glow;

.battle-sprite
{
	/* 刻意只要基礎層，不加光暈 (base layer only, no glow by design) */
	filter: $sprite-shadow-base;
}
```

> **SCSS 版與 CSS 版的差異**：SCSS 變數在**預處理期展開**——編譯後的 CSS 輸出仍是多份字面值，SSoT 只存在於**原始碼層級**；且無法依作用域/主題動態覆寫（「變體 B」做不到）。完整比較見下方「SCSS `$` 變數 vs CSS `var()`」——**簡言之：純靜態值用 SCSS `$` 即可；需要運行期動態性（主題切換、作用域覆寫）才用 CSS `var()`；環境不支援編譯或專案為純 CSS 時，則只能依靠 CSS `var()`**。

### 判斷準則：什麼該抽離？ (When to Extract)

| 情境 | 建議 |
|------|------|
| 2 個以上選擇器使用**相同值**，且預期會一起變化 | ✅ 抽離為共用自訂屬性（或 SCSS `$` 變數，見「SCSS 版本」） |
| 值只有一個使用處 | ❌ 不必抽離（過度抽象反而降低可讀性） |
| 值「看起來很像」但語意不同（如 hover 色與 error 色恰好同色） | ❌ 各自獨立定義，避免日後被連動修改 |
| 跨元件的視覺規範（主色、間距、圓角） | ✅ 抽離為設計標記 (design token)，層級比元件共用值更高 |
| 需要共用的不只一個值，而是一整組宣告 | ✅ 改用共用 class 或 mixin（見「變體 C」） |

**共用值的兩個層次**：

| 層次 | 例子 | 定義位置 |
|------|------|----------|
| **設計標記 (Design Token)** | `--color-primary`、`--radius-md` | `:root` / 主題檔，全域共用 |
| **元件群共用值** | `--sprite-drop-shadow` | `:root` 或該元件群的共同祖先作用域 |

兩者遵循同一原則：**一個值、一個定義處、多處引用**。

### 命名慣例 (Naming)

| 規則 | 範例 | 說明 |
|------|------|------|
| kebab-case | `--sprite-drop-shadow` | 與 CSS 自訂屬性慣例一致 |
| 前綴標示領域/作用域 | `--sprite-*`、`--battle-*` | 搜尋前綴即可列出該領域所有共用值 |
| 以**用途**命名，而非**值** | ✅ `--sprite-drop-shadow` / ❌ `--shadow-1` | 值會改，用途不會；`--shadow-1` 在值變更後即失去意義 |
| 避免過於泛用 | ❌ `--shadow` | 易與全域 token 撞名，也難以判斷適用範圍 |

### 變體模式 (Variants)

#### 變體 A：拆分基礎層與特效層（支援局部差異）

當選擇器之間**部分共用、部分刻意不同**時，拆成「基礎層 + 特效層」，再組合成完整值：

```css
:root
{
	/*
	 * 精靈投影拆為基礎層與光暈層，允許個別選擇器只取用其中一層
	 * Split sprite shadow into base + glow layers so selectors can opt in partially
	 */
	--sprite-shadow-base: drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.3));
	--sprite-shadow-glow: drop-shadow(0 0 1px rgba(189, 200, 215, 0.15));

	/* 完整投影 = 基礎層 + 光暈層 (full shadow = base + glow) */
	--sprite-drop-shadow: var(--sprite-shadow-base) var(--sprite-shadow-glow);
}


.character-sprite
{
	/* 完整投影：下落陰影 + 光暈 (full shadow: drop shadow + glow) */
	filter: var(--sprite-drop-shadow);
}


.battle-sprite
{
	position: absolute;
	background-repeat: no-repeat;

	/* 刻意只要基礎層，不加光暈 (base layer only, no glow by design) */
	filter: var(--sprite-shadow-base);
}
```

自訂屬性的值在**計算值時間 (computed-value time)** 才做 `var()` 替換，因此 `var()` 可以出現在自訂屬性值中並展開成完整的 token 序列，再交由 `filter` 解析——組合寫法是合法的。

#### 變體 B：依作用域覆寫（主題 / 情境）

自訂屬性會**繼承 (inherit)** 到子樹，可在特定作用域覆寫，其餘不變：

```css
:root
{
	/*
	 * 精靈（Sprite）通用投影
	 * 兩層：深色下落陰影 + 亮色光暈
	 */
	--sprite-drop-shadow: drop-shadow(2px 5px 1px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 1px rgba(189, 200, 215, 0.15));
}


/* 深色舞台：加強陰影與光暈，提高在深色背景上的辨識度 (dark stage: stronger shadow & glow) */
.stage--dark
{
	--sprite-drop-shadow: drop-shadow(2px 5px 2px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 3px rgba(189, 200, 215, 0.4));
}
```

子樹內使用 `var(--sprite-drop-shadow)` 的選擇器會自動採用覆寫後的值——這是複製字面值做不到的能力：**同一段樣式碼，依作用域呈現不同結果**。

> **⚠️ 組合變數的繼承陷阱**：若在變體 A 中覆寫底層分層變數（如 `.stage--dark { --sprite-shadow-glow: ...; }`），**組合變數 `--sprite-drop-shadow` 不會重新解析**——繼承到的是 `:root` 上已完成變數替換的計算值。因此覆寫時必須**在該作用域重新宣告組合變數**（再寫一次 `--sprite-drop-shadow: var(--sprite-shadow-base) var(--sprite-shadow-glow);`），或直接覆寫組合變數本身（如上例）。

#### 變體 C：多屬性共用改用共用 class / mixin

當共用的不只一個值，而是一整組宣告時，自訂屬性就不適用（它只能替換屬性值中的 token），改用：

```css
/* ✅ 共用 class：由同一元素疊加多個 class 組合而成 (composed via multiple classes) */
.sprite-base
{
	position: absolute;
	background-repeat: no-repeat;
	filter: var(--sprite-drop-shadow);
}

/* 使用方式：class="sprite-base battle-sprite" */
```

```scss
/* ✅ SCSS mixin：預處理期展開，可帶參數 (preprocessor-time expansion, parameterizable) */
@mixin sprite-base {
	position: absolute;
	background-repeat: no-repeat;
	filter: var(--sprite-drop-shadow);
}

.battle-sprite {
	@include sprite-base;
}
```

### SCSS `$` 變數 vs CSS `var()` (Which One?)

> **💡 環境前提 (Environment Constraint)**：SCSS `$` 變數必須有**預處理器編譯**才能生效——環境不支援編譯、或專案為**純 CSS**（無預處理流程）時，**只能依靠 CSS `var()`** 完成抽離；在**支援編譯**的情況下，兩種做法都可行，依照需求或團隊喜好選擇合適做法即可（下方經驗法則僅供參考，沒有絕對優劣）。

| | SCSS `$variable` | CSS `var()` |
|---|---|---|
| 展開時機 | 預處理期，各使用處**輸出展開後的副本** | 運行期，各使用處**引用同一個值** |
| 單一定義處（原始碼層級 SSoT） | ✅ | ✅ |
| 依主題/作用域/狀態動態覆寫 | ❌ | ✅ 可繼承、可覆寫 |
| 瀏覽者自訂主題（Stylus 等使用者樣式） | ❌ 編譯後已展開為字面值 | ✅ 覆寫單一變數即全域生效 |
| 跨檔案共用 | ❌ 需 `@use`/`@import` 且受載入順序影響 | ✅ 由 cascade 決定，定義即生效 |
| 給 `filter` 這類「整個值序列」複用 | 可以 | ✅ 且可與 `var()` 組合嵌套 |

**經驗法則**：

- 值**確定永不變化**，且預處理期就能決定 → SCSS `$` 足夠
- 可能依主題、作用域、狀態變化，或需跨檔共用、組合嵌套 → 用 CSS `var()`
- 需要讓**瀏覽者可自訂主題** → 用 CSS `var()`：共用值集中在自訂屬性上，瀏覽者可透過瀏覽器插件（如 Stylus）覆寫 `:root` 上的少數變數，**建立自己的主題甚至回饋給開發者**，而不需強制覆寫每一個 class；SCSS `$` 編譯後已展開為字面值，做不到這一點
- 兩者可混用：SCSS 管**結構**（mixin、函式），CSS `var()` 管**視覺值**

### 常見陷阱 (Pitfalls)

1. **變數未定義 → 靜默失效**：`var(--x)` 引用不存在的自訂屬性時「不會報錯」，該屬性會在計算值時間失效——非繼承屬性（如 `filter`）退回初始值（`filter: none`），投影會**無聲消失**。務必定義在所有使用處的祖先作用域，並做視覺驗證。
2. **`var(--x, fallback)` 的 fallback 是新的漂移源**：fallback 本質上是第二份字面值，日後修改主定義時容易被漏改。除非是跨環境相容性需求，否則應**保證定義存在**，而非依賴 fallback。
3. **組合變數不會因後代覆寫底層變數而重新解析**：見「變體 B」的繼承陷阱。
4. **過度碎片化**：把每個值都變成變數（`--text-1`、`--text-2`...）會讓樣式碼難以閱讀，且失去「就地看到實際值」的直覺。只抽離**真正被多處共用且會一起變化**的值。

### 重構步驟 (Refactoring Workflow)

1. **找出所有字面值副本**：全文搜尋該值，並留意格式變體（`#bdccd7` vs `rgba(189, 200, 215, ...)`、空格、`0.3` vs `.3`、SCSS 檔與行內 `style`）；必要時先統一格式
2. **判斷差異是否為刻意**：比對各副本——若本來就不一致，先確認是漂移還是設計意圖（漂移 → 統一；刻意 → 用「變體 A」拆層）
3. **定義自訂屬性**：放在所有使用處的共同祖先作用域，並以區塊註解寫上**為什麼**（共用範圍、每層用途）——註解格式依 [comment-format-rules-css](../../../comment-format-rules-css/SKILL.md)
4. **逐一替換為 `var()`**（SCSS 版為 `$` 變數）：確認所有副本都已替換，不留殘值
5. **視覺回歸驗證**：逐個選擇器對比重構前後的畫面（可截圖比對），特別注意第 2 步判定為「統一」的差異是否符合預期（本例中 `.battle-sprite` 會**新增光暈**，屬預期中的視覺修正）
6. **全域複查**：再次搜尋原始字面值，確認無殘留

### 檢查清單 (Checklist)

- [ ] 這個值有 2 個以上選擇器共用，且預期會一起變化嗎？
- [ ] 各副本目前是否完全一致？若不一致，是漂移還是刻意設計？
- [ ] 自訂屬性定義在所有使用處都能繼承到的作用域嗎？
- [ ] 命名是否表達**用途**（而非值本身），並帶有領域前綴？
- [ ] 定義處是否有「為什麼」註解（共用範圍、各層用途）？
- [ ] 所有字面值副本都已替換為 `var()`（SCSS 版為 `$` 變數），無殘留（含 SCSS、行內 style、主題檔）？
- [ ] 是否做了視覺回歸驗證？
- [ ] 是否避免過度抽離（單一使用處、語意不同的「同值」未被誤合併）？

### 相關資源 (Related)

- [Main Skill](../../SKILL.md) - 核心重構指引
- [comment-format-rules-css](../../../comment-format-rules-css/SKILL.md) - CSS/SCSS 註解格式規範（定義處的區塊註解依此撰寫）
- [Single Source of Truth 設計模式](https://en.wikipedia.org/wiki/Single_source_of_truth)
- [MDN: Using CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
