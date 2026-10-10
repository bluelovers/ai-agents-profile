---
description: >-
  錯誤／不正確／不恰當的註解案例索引：
  「錯置類」——註解未緊鄰目標代碼（把宣告註解誤寫成檔頭註解、
  與目標宣告之間隔著其他陳述式、放進宣告內部描述整個函式、重構後殘留原地），
  「層級錯置」——函式 JSDoc 夾帶描述內部陳述式的實作段落（案例六），
  以及重構時寫進註解的操作日誌（SSOT 標籤、移動／抽離紀錄）收錄於本檔；
  其餘類型（行內註解、假雙語、無意義註解、@property 等）依主題分流至對應參考文件。
tags:
  - comments/format
  - documentation/references
  - comments
---

# 錯誤註解案例 (Bad Comment Examples)

彙整「錯誤／不正確／不恰當的註解」案例：**錯置類**（註解與目標代碼的綁定錯誤，案例一～四）、
**層級錯置**（描述內部陳述式的實作段落寫進宣告 JSDoc，案例六）
與**內容類**（重構操作日誌，案例五）收錄於本檔；
其餘類型已各有專屬參考文件，於文末索引分流，避免重複維護（SSOT）。

## 核心判斷：這段註解綁定了誰？

IDE 與 AI 透過「**註解緊接的下一個宣告**」判斷關聯對象。一旦註解與目標之間插入 `import`、常數或其他宣告，
關聯就會斷掉或指向錯誤對象——症狀是 IntelliSense 沒有提示、AI 改錯地方。

**先分清兩種註解**（錯置多半源自混淆兩者）：

| 類型 | 位置 | 描述對象 |
|------|------|----------|
| **檔頭註解** (file header) | 檔案最上方、`import` 之上 | 整個檔案（檔案級資訊） |
| **宣告註解** (JSDoc) | 緊鄰單一宣告上方 | 某個 class／function／interface |

### 案例一：把「宣告註解」誤寫成檔頭註解

**判斷方式（依上表）：** 內容在描述某個宣告（如「單一 ignore 檔案的封裝類別」）→ 這是**宣告註解**，
必須放在該宣告正上方；**不得寫在檔頭位置**——即使檔案只有一個 class、看起來很像檔頭。
這是**位置錯了，不是格式錯了**。

```typescript
// ❌ 錯誤：宣告註解寫在檔頭位置，被綁定到 import 而非 class
/**
 * 單一 ignore 檔案的封裝類別
 * Wrapper class for a single ignore file
 */
import { outputFileSync, pathExistsSync } from 'fs-extra';

export class IgnoreFile
```

```typescript
// ✅ 正確：宣告註解歸位——import 之後緊鄰 class 宣告
import { outputFileSync, pathExistsSync } from 'fs-extra';

/**
 * 單一 ignore 檔案的封裝類別
 * Wrapper class for a single ignore file
 */
export class IgnoreFile
```

**原因：** 檔頭位置的關聯對象是 `import` 語句——`IgnoreFile` 反而失去文件提示，
工具與 AI 也會誤判這段描述的所屬目標。錯誤本質是「**用檔頭的位置承載宣告的描述**」，
而非僅僅「位置差一點」。

**反向澄清（避免誤解）：**

- ✅ **檔頭註解本身不禁止**——但它只能描述**檔案**（為什麼有這個檔案），不能承載 class／函式的描述：

  ```typescript
  // ✅ 正確：真正的檔頭註解——描述檔案本身，而非其內的宣告
  /**
   * ignore 檔案的讀寫工具 / Read/write utilities for ignore files
   *
   * 提供單一 ignore 檔案的載入與寫回
   */
  import { outputFileSync } from 'fs-extra';

  /**
   * 單一 ignore 檔案的封裝類別
   * Wrapper class for a single ignore file
   */
  export class IgnoreFile
  ```

- ❌ **反向錯誤**：把宣告註解當檔頭，又為了「像檔頭」而改寫成描述檔案結構／羅列宣告——
  兩頭落空：既沒描述宣告，也變成無意義檔頭（見 [無意義註解 — 案例三](./meaningless-comments.md)）。

### 案例二：註解與目標之間隔著其他陳述式

與案例一（位置選錯成檔頭）不同：位置已在 `import` 之後，但**中間夾了其他宣告**，關聯同樣被切斷。

```typescript
// ❌ 錯誤：註解描述 IgnoreFile，下一個陳述式卻是常數宣告
import { outputFileSync } from 'fs-extra';

/**
 * 單一 ignore 檔案的封裝類別
 * Wrapper class for a single ignore file
 */
const DEFAULT_ENCODING = 'utf8';

export class IgnoreFile {}
```

```typescript
// ✅ 正確：註解與其描述的宣告之間不留任何其他陳述式
import { outputFileSync } from 'fs-extra';

const DEFAULT_ENCODING = 'utf8';

/**
 * 單一 ignore 檔案的封裝類別
 * Wrapper class for a single ignore file
 */
export class IgnoreFile {}
```

### 案例三：想描述整個函式，註解卻放進函式體內

```typescript
// ❌ 錯誤：描述函式的註解貼在內部條件判斷之前
function saveIgnoreFile(content: string) {
	/**
	 * 寫入 ignore 檔案 / Write the ignore file
	 */
	if (!content) return;
	outputFileSync('.gitignore', content, DEFAULT_ENCODING);
}
```

```typescript
// ✅ 正確：描述函式的註解放在函式宣告上方，內部邏輯另寫自己的註解
/**
 * 寫入 ignore 檔案 / Write the ignore file
 */
function saveIgnoreFile(content: string) {
	/** 空內容不覆寫既有檔案 / Do not overwrite existing file on empty content */
	if (!content) return;
	outputFileSync('.gitignore', content, DEFAULT_ENCODING);
}
```

**原因：** 函式簽名（`function saveIgnoreFile(...)`）才是被描述的宣告；註解放在函式體內，
關聯對象會變成內部的 `if` 語句，函式本身沒有文件提示。

### 案例四：重構／搬移後註解殘留原地

```typescript
// ❌ 錯誤：`寫入 ignore 檔案` 的描述對象已被搬走，殘留成孤兒註解
/**
 * 寫入 ignore 檔案 / Write the ignore file
 */

const DEFAULT_ENCODING = 'utf8';

/**
 * 單一 ignore 檔案的封裝類別
 * Wrapper class for a single ignore file
 */
export class IgnoreFile {
	/** ... */
}
```

```typescript
// ✅ 正確：搬移宣告時，其上方的註解一併搬移
const DEFAULT_ENCODING = 'utf8';

/**
 * 寫入 ignore 檔案 / Write the ignore file
 */
function saveIgnoreFile(content: string) { /* ... */ }

/**
 * 單一 ignore 檔案的封裝類別
 * Wrapper class for a single ignore file
 */
export class IgnoreFile { /* ... */ }
```

**原因：** 重構時只搬代碼、不搬註解，會留下「孤兒註解」——描述對象已不存在，
既無效又誤導後續維護者與 AI。

### 案例五：重構時把操作日誌／SSOT 標籤寫進註解

使用者強調「重構／單一事實／消除重複」時，把要求本身寫進每一個註解：

```typescript
// ❌ 錯誤：註解內標示 SSOT 標籤與移動／抽離紀錄
/**
 * SSOT：單一事實來源 / single source of truth
 *
 * 移動紀錄：F1 → F2
 * 抽離紀錄：從 X 抽離至 Y
 */
export const SKILL_EXTRA_NUMERIC_KEYS = [...];
```

```typescript
// ❌ 錯誤：遷移鏈註解——F1 註解寫「移動至 F2」，F2 又寫「移動至 F3」，最終沒有任何一處是當前事實
/** 原位於 F1，已移動至 F2 / moved from F1 to F2 */
```

**問題點：**

| # | 問題 | 說明 |
|---|------|------|
| 1 | 操作日誌非必要 | 移動、抽離是 git 已記錄的事實，讀者要看的是意圖與不變數，不是遷移履歷 |
| 2 | SSOT 標籤無新資訊 | `// ssot` 只是重複宣示「我做了 SSOT」，對維護毫無幫助 |
| 3 | 遷移鏈註解迅速過期 | 「F1 → F2」在 F2 又寫「→ F3」，全部脫節，比沒有註解更糟 |
| 4 | 累積成噪音 | 每個重構動作留一句，真正有用的業務註解被淹沒 |

```typescript
// ✅ 正確：只寫意圖／不變數，遷移歷程交給 git
/**
 * 技能附加的數值欄位鍵名 / Extra numeric keys for skills
 *
 * 集中於此，避免各模組各存一份而漂移
 * Centralized here to prevent per-module drift
 */
export const SKILL_EXTRA_NUMERIC_KEYS = [...];
```

> **Reference**: [SSOT 重構的反模式 — Case D](../../code-refactoring-expert-typescript/references/ssot-refactoring-anti-patterns.md)（位於 `code-refactoring-expert-typescript`）— 完整問題點、正確做法與「註解不反向膨脹成重構履歷」的關聯。

### 案例六：函式 JSDoc 夾帶描述內部陳述式的實作段落

**判斷方式（承上核心判斷）：** 逐段問「這段話描述的對象是誰？」——

- 描述**呼叫者可觀察的行為／合約**（做了什麼、預設值與覆寫關係、`@param`）→ 屬宣告 JSDoc，留在原地；
- 描述**函式體內某一行為什麼這樣做**（內部快取為何清空、之後如何重建）→ 屬邏輯區塊，應下沉到該陳述式上方。

描述對象是內部陳述式、位置卻寫在宣告 JSDoc，就是**層級錯置**——
與案例三互為鏡像：案例三是「描述函式的註解放進函式體」，本例是「描述函式體內陳述式的段落寫進宣告 JSDoc」。

```typescript
// ❌ 錯誤：函式 JSDoc 夾帶描述 `this._ignore = void 0;` 的實作段落
/**
 * 輸出前優化
 *
 * 依序執行：移除重複規則（只保留最後一筆）、收合超過上限的連續空行、
 * 移除首尾空行；三項皆可個別關閉。
 *
 * 註解不參與去重，位置與數量都不會被更動。
 * 以 {@link this.options.optimizations} 為預設值，`options` 參數覆寫之。
 *
 * 整理可能移除規則行（去重、收合、裁掉首尾空行），
 * 而 `ignore` 套件的實例只能 `add`、不能刪除，
 * 因此同樣把 `this._ignore` 清成 `undefined`，讓 {@link toIgnore} 依新行陣列重建。
 *
 * @param options - 優化選項
 */
finalize(options?: IFinalizeIgnoreLinesOptions)
{
	this._lines = finalizeIgnoreLines(this._lines, {
		...this.options.optimizations,
		...options,
	});

	this._ignore = void 0;

	return this
}
```

```typescript
// ✅ 正確：JSDoc 只留合約，實作段落下沉到其描述的那一行上方
/**
 * 輸出前優化
 *
 * 依序執行：移除重複規則（只保留最後一筆）、收合超過上限的連續空行、
 * 移除首尾空行；三項皆可個別關閉。
 *
 * 註解不參與去重，位置與數量都不會被更動。
 * 以 {@link this.options.optimizations} 為預設值，`options` 參數覆寫之。
 *
 * @param options - 優化選項
 */
finalize(options?: IFinalizeIgnoreLinesOptions): this
{
	this._lines = finalizeIgnoreLines(this._lines, {
		...this.options.optimizations,
		...options,
	});

	/**
	 * 內部快取：整理可能移除規則行（去重、收合、裁掉首尾空行），
	 * 而 ignore 實例只能 add、不能刪除，
	 * 故清空後由 toIgnore() 依新的行陣列重建
	 */
	this._ignore = void 0;

	return this
}
```

**原因：**

| # | 問題 | 說明 |
|---|------|------|
| 1 | 綁定對象錯層 | 段落描述的是 `this._ignore = void 0;` 的重建理由，讀到那一行的人卻在函式體內找不到說明；函式 JSDoc 反而塞滿與呼叫者無關的內部細節 |
| 2 | 違反職責分離 | JSDoc 是給呼叫者的合約，「ignore 實例不能刪除、快取重建策略」是給維護實作的人看的細節，兩者受眾不同（見 [職責分離](../SKILL.md#jsdoc-與邏輯區塊職責分離-responsibility-separation)） |
| 3 | 合約隨實作漂移 | 日後改用其他快取策略時，宣告 JSDoc 被迫一起改；實作每次調整都污染一次 API 文件 |
| 4 | 內部行失去就近說明 | 實作細節留在頂端，函式體內的 `this._ignore = void 0;` 變成無註解的「神來一筆」，讀者須對照長 JSDoc 才能猜到對應關係 |

> **Reference**: [JSDoc 與邏輯區塊職責分離](../SKILL.md#jsdoc-與邏輯區塊職責分離-responsibility-separation)（位於 `comment-format-rules-js`）— 合約／意圖與實作細節的分界表、標準範例與檢查清單。

## 其他不恰當案例索引 (Index by Topic)

其餘常見的錯誤／不恰當註解類型，依主題分流至專屬參考文件：

| 案例類型 | 參考文件 |
|----------|----------|
| 使用行內註解 `//`、分隔線未用區塊註解、特殊指令（`@ts-ignore`）順序錯誤、更新時刪除技術術語、為命名慣例添加不存在的意義 | [重要約束](./critical-constraints.md) |
| 註解放在代碼後方、以 `@property` 描述 Interface 成員 | [註解位置規範](./comment-placement.md) |
| 英文＋英文的假雙語、雙語順序顛倒 | [雙語註解格式](./bilingual-comment-format.md) |
| 多個單行註解、只寫 WHAT 不寫 WHY、標題與描述語意重複 | [SKILL.md — 邏輯區塊註解規範／職責分離](../SKILL.md) |
| JSDoc 內塞實作細節、宣告 JSDoc 夾帶描述內部陳述式的段落（合約與實作未分離） | 本檔案例六；規範見 [SKILL.md — JSDoc 與邏輯區塊職責分離](../SKILL.md#jsdoc-與邏輯區塊職責分離-responsibility-separation) |
| 僅重複宣告關鍵字／語意、羅列代碼管理的宣告（what 而非 why） | [無意義註解](./meaningless-comments.md) |
| 重構時的操作日誌（SSOT 標籤、移動／抽離紀錄、遷移鏈註解）| 本檔案例五；完整判定見 [SSOT 重構的反模式 — Case D](../../code-refactoring-expert-typescript/references/ssot-refactoring-anti-patterns.md) |
| 更新時遺失原始錯誤資訊、未驗證的 Issue 連結 | [註解更新規則](./comment-update-rules.md) |

## 自我檢查清單 (Checklist)

- [ ] 這段註解描述的是「整個檔案」還是「某個宣告」？描述宣告的註解不得放在檔頭位置（`import` 之上）
- [ ] 註解的下一個陳述式，就是它所描述的宣告嗎？（中間沒有 `import`、常數或其他宣告）
- [ ] 描述函式／class 的註解，是否放在函式／class 宣告之上，而非函式體內部？
- [ ] 重構搬移代碼時，其上方的註解是否一併搬移，沒有殘留孤兒註解？
- [ ] 註解裡是否混入了操作日誌（SSOT 標籤、移動／抽離紀錄）而非意圖／不變數？
- [ ] 函式／方法的 JSDoc 是否夾帶只描述函式體內某一行的實作段落？（應下沉到該陳述式上方的邏輯區塊註解）
