---
name: analyze-code-commenter
description: |-
  分析程式碼並決定註解意圖與內容品質（中英雙語）。
  專注於「註解意圖」（解釋 WHY 而非 WHAT、業務目的、約束與邊界條件、看 code 不知道的事；註解以行為事實與意圖為準）
  與「內容品質審查」（消除無意義註解、禁止設計原則口號與重構／遷移紀錄、修正錯置與層級錯置、控制註解粒度與檔頭越界）。
  註解語法與排版格式（區塊註解結構、JSDoc 格式、放置位置、更新規則）由 comment-format-rules-js 定義；通用雙語標準由 bilingual-standardization-rule 定義。

  Use when users request (1) Adding comments to code, (2) Code documentation, (3) Explaining code logic with comments, (4) Detecting, removing or rewriting bad / meaningless comments, or mention keywords such as:
  - "為代碼添加註解", "分析並註解程式碼", "為代碼更新註解", "為代碼修正註解"
  - "重構代碼更新註解", "雙語註釋/雙語註解", "添加註釋"
  - "程式碼註解", "文件註解", "JSDoc", "區塊註解", "註解意圖", "註解格式"
  - "無意義註解", "無意義註解刪除", "不良註解", "錯誤註解案例", "meaningless comment", "bad comment"
  - "程式碼說明", "註釋翻譯"
  - "code comments", "bilingual comments", "block comments"
tags:
  - comments
  - bilingual
  - documentation
  - JSDoc
  - agents/skills
---

# Analyze Code Commenter

分析程式碼結構並決定**註解意圖 (Comment Intent)** 與**內容品質 (Content Quality)**，為代碼添加高品質的雙語註解（繁體中文 zh-TW ＋ 英文）。

> **職責邊界與核心分工**：
> - **本技能負責【註解意圖與內容品質】**：決定 *何處需要註解*、*註解應表達什麼業務意圖與 WHY*、*註解是否應當存在*（審查並刪除無意義註解與任務紀錄）。
> - **格式排版由 [comment-format-rules-js](../comment-format-rules-js/SKILL.md) 規範**：強制區塊註解格式（`/** ... */`，禁用行內 `//`）、單多行排版、JSDoc 標籤語法、縮排對齊與轉換工具。
> - **雙語原則由 [bilingual-standardization-rule](../bilingual-standardization-rule/SKILL.md) 規範**：語言順序、判定基準、術語保留與彈性取捨等最高原則。

## Workflow

1. **Read code** - 完整讀取目標檔案，理解模組職責與整體上下文。
2. **Analyze structure** - 分析架構與核心元素：
   - 核心業務邏輯、演算法與控制流程
   - 類別宣告、介面、型別與成員屬性/方法
   - 複雜內部邏輯區塊、錯誤處理、狀態轉換與非直觀邊界判斷
3. **Determine comment intent** - 決定註解意圖（解釋 WHY 而非僅僅 WHAT，詳見 [Logic Block Requirements](#logic-block-requirements-required-for-all-logic-blocks) 與 [What Needs Comments](#what-needs-comments-scope)）：
   - 宣告層級：說明外部合約、設計用途、不變量與約束
   - 邏輯區塊：說明局部邏輯的業務原因、非直觀運算目的、相容性處理或邊界防禦緣由
   - 審查現有註解：依 [Bad & Meaningless Comments](#bad--meaningless-comments-analyze-remove-rewrite) 刪除無意義註解、設計原則口號、過度瑣碎明細與重構/遷移日誌
4. **Generate bilingual comments** - 依 [bilingual-standardization-rule](../bilingual-standardization-rule/SKILL.md) 產生雙語內容，並依 [comment-format-rules-js](../comment-format-rules-js/SKILL.md) 套用區塊註解排版
5. **Apply changes** - 依當下環境實際提供的檔案編輯工具執行修改

## Logic Block Requirements (Required for ALL logic blocks)

> **格式與排版參照**：邏輯區塊註解之排版對齊、單行/多行合併格式，請參閱 [comment-format-rules-js — 邏輯區塊註解格式](../comment-format-rules-js/SKILL.md#邏輯區塊註解格式規範-logic-block-comment-formatting)。
>
> **實作細節分界**：函式內部陳述式的實作原因（例如內部快取為何清空、如何重建）應直接寫在該陳述式上方的邏輯區塊註解，不得寫進函式宣告的 JSDoc，詳見 [錯誤註解案例 — 案例六](references/bad-comment-examples.md)。

**All logic blocks MUST be commented, including private/non-public internal logic.** Comments help future developers understand complex control flow, business rules, and edge case handling.

### What are Logic Blocks?

Logic blocks are code sections that implement specific functionality, including but not limited to:

| Type | Examples |
|------|----------|
| Control flow | `if/else`, `switch/case`, `try/catch/finally`, loop blocks |
| Business logic | Data transformation, validation, calculation algorithms |
| Conditional branches | Complex conditions with multiple operators |
| Nested logic | Nested loops, nested conditionals, callback functions |
| Error handling | Exception catching, fallback logic, retry mechanisms |
| State management | State transitions, state machine logic |
| Data processing | Array operations, filtering, mapping, reducing |

### Comment Requirements for Logic Blocks

- **ALL logic blocks require comments** - No exception for private/internal logic
- **Explain WHY, not just WHAT** - Focus on business purpose and intent
- **Complex conditions need explanation** - Document the reasoning behind complex boolean expressions
- **Edge cases must be documented** - Explain why certain conditions are handled
- **Implementation details stay in the logic block** - Do not fold statement-level rationale into the declaration's JSDoc (see [錯誤註解案例 — 案例六](references/bad-comment-examples.md))

### Examples of Logic Blocks Requiring Comments

```typescript
// ❌ Avoid: Complex logic without comments
if (user.isActive && subscription.status === 'active' &&
	(payment.lastPaymentDate > thirtyDaysAgo || payment.isAutoRenew))
{
	// grant access
}

// ✅ Prefer: Complex conditions with explanation (using block comment)
/**
 * 檢查使用者是否有有效訂閱且最近有付款記錄
 * 或啟用自動續訂功能的使用者
 */
if (user.isActive && subscription.status === 'active' &&
	(payment.lastPaymentDate > thirtyDaysAgo || payment.isAutoRenew))
{
	// grant access
}
```

```typescript
// ❌ Avoid: Nested logic blocks without comments
async function processOrder(order)
{
	const validated = validateOrder(order);
	if (validated)
	{
		const inventory = await checkInventory(order.items);
		if (inventory.available)
		{
			await reserveInventory(order.items);
			if (order.payment.method === 'card')
			{
				// process payment
			}
		}
	}
}

// ✅ Prefer: Each logic block explained with block comments
async function processOrder(order)
{
	/**
	 * 驗證訂單資料格式與必填欄位
	 */
	const validated = validateOrder(order);
	if (validated)
	{
		/**
		 * 檢查庫存是否足夠
		 */
		const inventory = await checkInventory(order.items);
		if (inventory.available)
		{
			/**
			 * 預留庫存以防止超賣
			 */
			await reserveInventory(order.items);
			/**
			 * 信用卡支付需要額外驗證
			 */
			if (order.payment.method === 'card')
			{
				// process payment
			}
		}
	}
}
```

### Priority for Logic Block Comments

1. **High Priority** - Complex nested logic (3+ levels), business rules, critical paths
2. **Medium Priority** - Conditional branches, loop logic, error handling
3. **Low Priority** - Simple one-line conditions, straightforward logic

## What Needs Comments (Scope)

Each item below gets **its own block comment placed above the member**. The comment format (block vs inline, single-line vs multi-line, length, bilingual layout) is defined in [comment-format-rules-js](../comment-format-rules-js/SKILL.md).

| Category | Examples |
|----------|----------|
| Type definitions | `enum` members, `interface` members, `type` members |
| Class members | Properties, methods, constructors |
| Function members | Parameters, return values |
| Variable declarations | `const`, `let`, `var` with assignment |
| Object members | Object properties, return statement members |

**Applicable Scope (Full List)**

- `enum` members
- `interface` members
- `type` members
- `class` properties and methods
- Function parameters and return values
- Variable declarations (`const`/`let`/`var`)
- Object properties (including return statement members)
- Object shorthand properties

> **格式參照**：成員註解格式（強制區塊註解、Interface/Type 禁用 `@property`、放置位置）請參閱 [comment-placement](../comment-format-rules-js/references/comment-placement.md#interface-與-type-成員註解規則) 與 [critical-constraints](../comment-format-rules-js/references/critical-constraints.md#區塊註解強制使用)。

## Bilingual Comment Content

> **雙語規範參照**：通用雙語標準（語言順序、可讀性取捨、技術術語錨點等最高原則）請參閱 [bilingual-standardization-rule](../bilingual-standardization-rule/SKILL.md)；JS/TS 註解排版與 JSDoc 標籤雙語格式請參閱 [bilingual-comment-format](../comment-format-rules-js/references/bilingual-comment-format.md)。

When analyzing code and generating comments for logic blocks and members, apply [bilingual-standardization-rule](../bilingual-standardization-rule/SKILL.md) (zh-TW first, no fake bilingual, flexible omission, preserve foreign comments). Domain-specific application:

- **Technical Term Identification during Code Analysis**: When identifying algorithmic or domain concepts during code inspection, retain bilingual notation (`中文 (Term)`) on first occurrence:
  ```typescript
  /**
   * 初始化優先佇列 (Priority Queue) 並配置快取 (Cache) 空間
   */
  ```

## Critical Constraints (Behavioral)

These behavioral rules apply to every edit this skill makes; format constraints (block comment enforcement, separators, special directives, technical terms) are defined in [comment-format-rules-js](../comment-format-rules-js/references/critical-constraints.md).

- **NEVER** modify existing code formatting (indentation, line breaks, spaces)
- **NEVER** delete old commented-out code (e.g., `// old code...`, `/* old code... */`, or `/** @deprecated */`)
- **NEVER** convert existing CJK characters to Traditional Chinese - only use Traditional Chinese in NEW comments
- **Comments MUST describe behavioral facts and intent - NEVER design-principle slogans**: state what the code does and why it exists; do NOT write slogans such as "避免漂移 / prevent drift", "SSOT / single source of truth", movement records ("已移至...", "原位於..."), or task reports ("任務報告", "本次重構已完成"). History belongs to git, not comments (see [錯誤註解案例 — 案例五](references/bad-comment-examples.md)).
- **NEVER write task logs, refactoring records, or migration notes** into comments (e.g., "原本位於...", "已移至...", "基於 SSoT 集中於此", "抽離自..."). Comments must describe the current domain purpose, invariants, and responsibilities only (see [錯誤註解案例 — 案例五](references/bad-comment-examples.md)).
- **DELETE meaningless comments that merely restate the declaration keyword** (e.g., `/** 介面 / interface */` above `interface ISkillDef`, `/** 枚舉 */` above `enum`, `/** type */` above `type`) - they add no information and must be removed, not rewritten (see [無意義註解](references/meaningless-comments.md))

## Bad & Meaningless Comments (Analyze, Remove, Rewrite)

Beyond adding comments, this skill decides *whether an existing comment should exist at all* — a content-quality judgment; the corresponding format rules stay in [comment-format-rules-js](../comment-format-rules-js/SKILL.md).

- **無意義註解判斷**：[無意義註解](references/meaningless-comments.md) — 判斷基準（「只回答看 code 不知道的事」）、錯誤案例、刪／改與保留的案例解析、正確範本與實戰改寫對照。
- **錯誤案例對照**：[錯誤註解案例](references/bad-comment-examples.md) — 錯置類（案例一～四）、重構與任務操作日誌／設計原則口號（案例五）、層級錯置（案例六）、按字數斷行（案例七），及其餘錯誤類型的分流索引與自我檢查清單。

### 無意義註解（重複宣告、羅列結構）

屬**無意義註解**的三類情形（不得新增，遇到既有者直接刪除）：

1. 僅重複宣告關鍵字本身（如 `/** 介面 */` + `interface`）
2. 僅重複宣告語意（如 `/** 型別守衛 */` + `function isX(v): v is X`）
3. 羅列應由代碼管理的宣告、描述檔案「長什麼樣」而非「為什麼存在」的檔頭註解（what 而非 why）

### 不良註解 (Bad Comments)

| 類型 | 問題 | 修正方向 | 參考 |
|------|------|----------|------|
| 錯置 | 宣告註解寫成檔頭、與目標被陳述式分隔、放進宣告內部、重構搬移後殘留 | 歸位到緊鄰目標宣告的上方 | [案例一～四](references/bad-comment-examples.md) |
| 層級錯置 | 宣告 JSDoc 夾帶只描述函式體內某一行的實作段落 | 下沉到該陳述式上方的邏輯區塊註解 | [案例六](references/bad-comment-examples.md) |
| 操作日誌 | 註解內容是 SSOT 標籤、移動／抽離紀錄、遷移鏈、集中說明（如「集中於此」） | 只寫領域意圖／不變數，歷程交給 git，不留任務痕跡 | [案例五](references/bad-comment-examples.md) |
| 設計原則口號 | 註解寫「避免漂移」、「SSOT」等原則口號，或寫成本次任務報告（做了什麼重構） | 改寫為行為事實與意圖：這段代碼做什麼、為什麼這樣做 | [案例五](references/bad-comment-examples.md) |
| 過度瑣碎 | 逐項羅列易變的實作明細，任何修改都必須同步更新註解 | 粒度收到行為事實與意圖層級，易變明細交給代碼 | [粒度與檔頭邊界](#註解粒度不應過度瑣碎-comment-granularity) |
| 檔頭越界 | 用檔頭註解取代宣告 JSDoc／邏輯區塊，甚至因此縮減它們；檔頭本身羅列瑣碎明細 | 三層各司其職：檔頭寫整個檔案，宣告與邏輯層級的註解保持完整 | [檔頭不得取代其他層級](#檔頭註解不得取代宣告與邏輯註解-file-header-boundary) |
| 按字數斷行 | 長註解以固定行寬硬切，斷在句子中間（切開動詞與受詞、連接詞懸在行尾） | 分行按句子或語意斷點（句號、逗號、括號收合處），句子不跨行被切開 | [案例七](references/bad-comment-examples.md#案例七長註解按字數斷行句子被切斷) |

## 註解粒度與檔頭邊界 (Granularity & File Header)

### 註解粒度：不應過度瑣碎 (Comment Granularity)

註解粒度停在**行為事實與意圖**層級：這段代碼做什麼、為什麼這樣做。
**不逐項羅列易變的實作明細**（被呼叫的函式簽名、欄位／參數清單、中間步驟的內部狀態）。

**判斷方式：若任何修改都必須同步更新該註解，它就寫得太細**——這類註解會變成維護負擔，並在下次修改後過期：

```typescript
// ❌ 錯誤：羅列欄位清單與實作明細——增刪任一欄位都必須回來改註解
/**
 * checkbox 面板結構：靜態結構與執行期狀態分段生成。
 *
 * 1. getPromptOptionChecks          — 靜態結構：key / labelLangKey / parentKey / emitEvent
 * 2. withPromptOptionCheckValues    — 掛上目前值 value（傳入 this，computed 內讀取 props 以收集響應式依賴）
 * 3. filterPromptOptionCheckVisible — 子選項僅在父選項目前啟用時保留（等同原本的 v-if）
 */

// ✅ 正確：保留分段意圖與行為事實，欄位清單交給代碼
/**
 * checkbox 面板結構：靜態結構與執行期狀態分段生成。
 *
 * 1. getPromptOptionChecks          — 靜態結構
 * 2. withPromptOptionCheckValues    — 掛上目前 value（傳入 this，computed 內讀取 props 以收集響應式依賴）
 * 3. filterPromptOptionCheckVisible — 子選項僅在父選項目前啟用時保留（等同原本的 v-if）
 */
```

刪掉的是**易變明細**（`key / labelLangKey / parentKey / emitEvent` 欄位清單）；
保留的是**穩定意圖**（三段各自的職責、響應式依賴收集的原因）。

### 檔頭註解不得取代宣告與邏輯註解 (File Header Boundary)

三層各司其職，**任何一層都不能由另一層取代**：

| 層級 | 描述對象 | 不得做的事 |
|------|----------|------------|
| 檔頭註解 | 整個檔案（為什麼有這個檔案） | 取代其內宣告的 JSDoc 或邏輯區塊註解 |
| 宣告 JSDoc | 單一 class／function 的合約 | 被縮減為僅剩檔頭的一行摘要 |
| 邏輯區塊 | 局部陳述式的實作緣由 | 因「檔頭已說明」而省略 |

- **不得因檔案已有檔頭註解，就縮減、刪除或不再撰寫宣告與邏輯層級的註解**——檔頭讀者看不到、IntelliSense 也不提示成員。
- **檔頭本身也不應過度瑣碎**：不羅列宣告清單、不寫易變明細，只寫檔案動機與職責（見 [無意義註解 — 案例三](references/meaningless-comments.md)）。
- 宣告註解誤放檔頭位置的錯置修正，見 [錯誤註解案例 — 案例一](references/bad-comment-examples.md)。

## Comment Update Rules

When updating existing comments, preserve valuable technical information (error codes, file paths, issue links) and verify link relevance before adding any:
詳見 [comment-update-rules](../comment-format-rules-js/references/comment-update-rules.md)（保留原始錯誤資訊、Issue 驗證、多語言註解保留、更新前檢查清單）。

## Comment Format Rules Reference

所有 JS/TS 註解語法與排版規範請參閱 [comment-format-rules-js](../comment-format-rules-js/SKILL.md)：
- [雙語註解格式規範](../comment-format-rules-js/references/bilingual-comment-format.md) — 區塊註解排版與 JSDoc 標籤雙語格式
- [註解位置規範](../comment-format-rules-js/references/comment-placement.md) — 陣列元素、物件屬性、Interface/Type 成員位置規則
- [重要約束](../comment-format-rules-js/references/critical-constraints.md) — 強制區塊註解、特殊指令順序、保留技術術語
- [行內註解轉換工具](../comment-format-rules-js/references/convert-inline-to-block.md) — 行內註解 (`//`) 批次轉區塊註解 (`/** ... */`) 腳本

## Examples

See [references/examples.md](references/examples.md) for detailed before/after examples covering:
- Class and member comments (using block comments)
- Complex logic blocks (using block comments)
- Array element comments (using block comments)
- Preserving original block comment style
- Single-line vs multi-line block comments
