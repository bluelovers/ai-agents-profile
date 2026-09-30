---
description: >-
  無意義註解的判定與處理：
  判斷基準為
  「只回答看 code 不知道的事」，
  不重述 code 已表達的內容，
  也不寫 type system 使用說明書；僅重複宣告關鍵字（interface、enum、type 等）或宣告語意
  （型別守衛）的註解、羅列應由代碼管理的宣告並描述檔案「長什麼樣」的檔頭註解，
  均不得新增，遇到既有者直接刪除；
  型別組合（extends / generic / Required / consumer）的說明應移到組合發生處；
  確需說明時改寫為用途、約束或業務意圖（why 而非 what）。
tags:
  - comments/format
  - documentation/references
  - comments
---

# 無意義註解 (Meaningless Comments)

僅重複宣告關鍵字本身、不含任何語義資訊的註解屬**無意義註解**：不得新增，遇到既有者直接刪除。

## 判斷基準 (Rule of Thumb)

> 註解應該回答「**如果我只看這段 code，我會不知道什麼？**」；
> 而不是把「這段 code 已經明確告訴我的事情」重新念一遍，也不是替整個 type system 寫使用說明書。

> 📚 重構時把「SSOT 標籤、移動/抽離紀錄」等操作日誌寫進註解，同屬無意義註解，
> 判定與正確做法見 [Case D — 重構時於註解內標示非必要內容](../../code-refactoring-expert-typescript/references/ssot-refactoring-anti-patterns.md)（位於 `code-refactoring-expert-typescript`）。

## 錯誤案例 (Bad Examples)

### 一、僅重複宣告關鍵字

```typescript
// ❌ 錯誤：僅標示宣告形式，資訊與宣告關鍵字完全重複
/**
 * 介面 / interface
 */
interface ISkillDef

/**
 * 枚舉
 */
enum EnumStatusPrefix

/**
 * type
 */
type ITypeA
```

宣告形式已是自明資訊：`interface`、`enum`、`type`、`class` 等關鍵字本身已表達宣告形式，再以註解標示一次不提供任何新資訊。

### 二、僅重複宣告語意（型別守衛）

```typescript
// ❌ 錯誤：`value is EnumGender` 已宣告守衛語意，註解只是換個說法複述
/** 型別守衛 / type guard */
function isEnumGender(value: unknown): value is EnumGender {
	return genderValues.has(value);
}
```

與「僅重複宣告關鍵字」同屬一類：`x is Y` 的回傳型別本身已表達「這是型別守衛」，
`型別守衛 / type guard` 未提供任何新資訊。

### 三、羅列代碼管理的宣告、描述檔案「長什麼樣」

```typescript
/**
 * YAML → 現有型別轉換器 / YAML → existing-type converters
 * 將 Resource/{Char,Mon,Item,Job,Skill} 的原始 YAML 轉為現有實作使用的
 * ICharDef / IMonDef / IItemDef / IJobDef / ISkillDef。
 * Converts raw Char / Mon / Item / Job / Skill YAML into the ICharDef / IMonDef /
 * IItemDef / IJobDef / ISkillDef consumed by the existing implementation.
 *
 * 本檔只保留「五個資源主入口」；逐欄位區塊的轉換見 yaml-convert-blocks、
 * 數值收斂工具見 yaml-numeric、enum 對照表見 yaml-lookup。
 *
 * 數值字串／null／guard 筆誤／空物件等正規化於讀取時完成（yaml-coerce），本層直接承接：
 * this layer consumes the clean values directly:
 * - `special`（小寫）／`SPECIAL` 合併，Undead: true → 1
 */

import {
	EnumGender,
} from '#/lib/types/char-enum';
```

此類註解的問題不在長度，而在**內容來源**：

| 缺點 | 說明 |
|------|------|
| **羅列應由代碼管理的宣告** | `ICharDef` / `IMonDef` / `IItemDef` / `IJobDef` / `ISkillDef` 等型別清單已由 import 與型別註解表達，註解再抄錄一份 |
| **製造無意義雜訊** | 宣告改名、增刪時註解不會同步，逐漸變成過時甚至錯誤的資訊 |
| **增加無意義修改行為** | 為維持「註解與代碼一致」而被迫頻繁改註解，產生與行為無關的 diff |
| **描述 what 而非 why** | 註解在描述檔案「現在長什麼樣」，而非「它為什麼存在」 |

**正確的註解範本 (Corrected Template)：**

```typescript
// ✅ 正確：只回答「為什麼存在」與「依賴什麼前提」，宣告清單與結構交給代碼
/**
 * YAML → 現有型別轉換器 / YAML → existing-type converters
 * 舊實作直接讀取 YAML，本層是原始 YAML 進入現有型別系統的唯一入口
 * 數值字串／null／空物件等正規化已於讀取時完成（yaml-coerce），本層只承接乾淨值
 */

import {
	EnumGender,
} from '#/lib/types/char-enum';
```

對照原註解：

- 「`ICharDef` / `IMonDef` / …」宣告清單 → 刪除（import 與型別註解已表達）
- 「本檔只保留五個資源主入口；…見 yaml-convert-blocks / yaml-numeric / yaml-lookup」→ 刪除（描述檔案結構，屬 what）
- `this layer consumes the clean values directly` → 刪除（複述前一句，資訊量極低）
- **保留**「動機」（為什麼有這一層）與「前提」（輸入已正規化的不變量）——兩者都是看 `import` 無法得知的資訊

## 案例解析：刪／改與保留 (Case Analysis)

以 `IJobNamedIcon` 的檔頭註解為例，逐段判斷哪些該刪、該改，哪些值得保留：

```typescript
/**
 * 職業的名稱與圖示 / A job's name & icon
 * 介面 / interface
 *
 * 「`job_name` + `img`」這一對欄位的**單一事實來源**，兩處共用、欄位只在此宣告一次：
 * Single source of truth for the `job_name` + `img` pair; both sites share it and the fields
 * are declared here exactly once:
 * - `IJobDefCore`（職業本體）經 `ITSRequiredWith<…, 'job_name'>` 繼承，`job_name` 收窄為必填
 *   (`IJobDefCore`, the job itself, inherits it through `ITSRequiredWith<…, 'job_name'>`,
 *   which narrows `job_name` to required)
 * - `IJobDefCore.gender`（同形的性別專屬覆寫）
 *   (`IJobDefCore.gender`, the same-shaped per-gender replacement)
 *
 * 命名取「職業的名稱＋圖示」而非「覆寫」：本型別同時承載「職業本體」與「性別覆寫」兩種角色，
 * 只描述欄位內容，不描述它在某處的用途。
 * The name says "a job's name & icon" rather than "an override", because the type plays both
 * the job-itself role and the gender-override role — it describes the fields, not the role
 * they happen to play at one call site.
 *
 * 欄位 / Fields:
 * - `img`：職業圖示路徑；性別覆寫時取代職業預設值 / job icon; a gender override replaces the default
 * - `job_name`：職業名稱；性別覆寫時取代職業預設值 / job name; a gender override replaces the default
 */
export interface IJobNamedIcon
```

**明顯應該刪／改：**

| # | 註解內容 | 問題 |
|---|---------|------|
| 1 | `介面 / interface` | 僅重複宣告關鍵字（見案例一） |
| 2 | 「單一事實來源，兩處共用、欄位只在此宣告一次」 | 與末尾「欄位 / Fields」區塊**重複描述同一件事** |
| 3 | `IJobDefCore` 如何繼承本型別（consumer 的角色） | `IJobDefCore` 的**使用方式**寫在被組合的 `IJobNamedIcon` 上 |
| 4 | `ITSRequiredWith<…, 'job_name'>` 收窄必填 | `ITSRequiredWith` 的 **implementation 細節**寫在基礎型別上 |
| 5 | `img` / `job_name` 欄位說明 | **重複描述非常直觀的欄位**，宣告本身已表達 |
| 6 | `this layer consumes the clean values directly`（見案例三） | **資訊量極低**，只是把前一句中文再複述一次 |

> **原則**：TypeScript 型別註解很容易陷入「解釋 extends / generic / Required / consumer」的問題。
> 若註解需要大量描述某個 type 在其他 type 裡怎麼被組合，通常應該把註解**移到「組合發生的地方」**，
> 而不是繼續堆在被組合的基礎型別上（對應上表第 3、4 點）。

**值得保留（可選，僅代表「可以保留」）：**

> 「值得保留」**不等於必須保留**：它只代表這段資訊可以留下——屬於「看 code 不會知道的事」。
> 是否保留取決於專案需要多少脈絡；選擇極簡時可連它也刪除、檔頭只留標題（見下方「實戰改寫對照」）。

```typescript
 * 命名取「職業的名稱＋圖示」而非「覆寫」：本型別同時承載「職業本體」與「性別覆寫」兩種角色，
```

理由：這是在解釋**命名背後的設計意圖**（為什麼叫 `IJobNamedIcon` 而非 `IJobOverride`），
而非單純重述程式碼——只看型別名稱與宣告無法得知這件事，正是「看 code 不會知道的事」。

**正確的註解範本 (Corrected Template)：**

```typescript
// ✅ 正確：檔頭只留標題與命名意圖，其餘內容刪除或下移到欄位
/**
 * 職業的名稱與圖示
 *
 * 命名取「職業的名稱＋圖示」而非「覆寫」：本型別同時承載「職業本體」與「性別覆寫」兩種角色，
 */
export interface IJobNamedIcon {
  /** 圖示路徑 / icon path */
	img: string;
  /** 職業名稱 */
	job_name: string;
}
```

改寫對照：

- `介面 / interface` → 刪除（重複宣告關鍵字）
- 「單一事實來源」與「欄位 / Fields」**重複描述同一件事** → 刪除
- `IJobDefCore` 的使用方式 → **移到組合發生處**（`IJobDefCore` 宣告處），不堆在被組合的基礎型別上
- `ITSRequiredWith` implementation 細節 → 無關內容刪除

**實戰改寫對照 (Real-world Rewrite)：**

同一組宣告的實際改寫——比上方範本更極簡：**檔頭收斂為標題**，有資訊量的內容下移到欄位或刪除：

```diff
 /**
- * 職業的名稱與圖示 / A job's name & icon
- *
- * 「`job_name` + `img`」這一對欄位的**單一事實來源**，只在此宣告一次：
- * 職業本體與性別覆寫共用同一形狀，兩側都不再各自重寫。
- * Single source of truth for the `job_name` + `img` pair, declared here exactly once: the job
- * itself and its gender overrides share the shape, so neither side re-declares it.
- *
- * 命名取「職業的名稱＋圖示」而非「覆寫」：本型別同時承載「職業本體」與「性別覆寫」兩種角色，
- * 只描述欄位內容，不描述它在某處的用途。
- * The name says "a job's name & icon" rather than "an override", because the type plays both
- * roles — it describes the fields, not the role they happen to play at one call site.
+ * 職業的名稱與圖示
  */
 export interface IJobNamedIcon

 /**
- * 職業定義核心 / Job definition core
- *
- * 約束：職業本體的 `job_name` 必填（自 IJobNamedIcon 收窄），而 `img` 與 `gender` 內的
- * 性別覆寫欄位皆可省略——省略即沿用職業預設，不補空字串。
- * Constraint: a job's own `job_name` is required (narrowed from IJobNamedIcon), while `img`
- * and every per-gender field inside `gender` stay optional — omitted means "keep the job
- * default", not "empty string".
+ * 職業定義核心
  */
 export interface IJobDefCore extends ITSRequiredWith<IJobNamedIcon, 'job_name'>
 {
 	/**
-	 * 職業編號（yaml-load 的 `COERCE_SPECS` 於讀取時收斂為 number）
-	 * job number (yaml-load's `COERCE_SPECS` coerces it to number at read time)
+	 * 職業編號
 	 */
 	no: number;
 	/** 可裝備的武器／裝備型別 / equippable weapon/armor types */
 	equip?: EnumWeaponType[];
-	/** 成長係數（maxhp/maxsp 及其餘六維的成長率）/ growth coefficients (IGrowthCoefficients) */
+	/** 職業能力值的成長係數，例如 maxhp/maxsp 與其他能力值 */
 	coe?: IGrowthCoefficients;
-	/** 依性別（EnumGender）覆寫名稱與圖示 / per-gender (EnumGender) name & icon overrides */
+	/** 依性別（{@link EnumGender}）覆寫名稱與圖示；未指定的欄位沿用職業預設值。 */
 	gender?: Partial<Record<EnumGender, IJobNamedIcon>>;
-	/** 職業說明資訊 / job description info（IDescInfo） */
+	/** 職業說明資訊 */
 	info?: IDescInfo;
-	/** 擴充資料（共用 IDataEx；job 用 job_base＋job_conditions）/ extra data (shared IDataEx; job uses job_base + job_conditions) */
+	/** 職業專用的擴充資料，詳見 {@link IJobDataEx} */
 	data_ex?: IDataEx;
 }
```

觀察重點：

- **「值得保留」是可選項**：本例連命名意圖與 SSOT 段也一併刪除——「值得保留」僅代表**可以**保留，不代表必須
- **檔頭收斂為標題**：`IJobNamedIcon`、`IJobDefCore` 只留名稱；「`job_name` 必填」由 `extends ITSRequiredWith<…, 'job_name'>` 自身表達
- **有資訊量的內容下移到使用發生處**：「未指定的欄位沿用職業預設值」從 `IJobDefCore` 檔頭移到 `gender` 欄位註解
- **跨層實作細節刪除**：`COERCE_SPECS 於讀取時收斂為 number` 是 yaml-load 的行為——說明應寫在收斂發生處，不寫在消費端欄位（見上方「組合發生處」原則）
- **與宣告重複的型別名刪除**：`info` 的 `（IDescInfo）` 刪除；`data_ex` 改為「詳見 `{@link IJobDataEx}`」；`coe` 刪掉重複的型別名 `IGrowthCoefficients`
- **英譯收斂**：段落級英譯刪除、只留中文；一行式自明雙語保留（`equip`）→ 見 [彈性捨棄雙語原則](./bilingual-comment-format.md)

## 需要說明時 (When Explanation Is Needed)

若該宣告確實需要解釋，改寫為說明**用途、約束或業務意圖**的有意義註解，而非標示其宣告型別：

```typescript
/**
 * 技能定義：描述一個可被載入的技能之名稱、說明與觸發條件
 * Skill definition: name, description and trigger conditions of a loadable skill
 */
interface ISkillDef
```

檔頭註解同理：捨棄由代碼管理的宣告清單與結構描述，只保留**為什麼存在**（動機、不變量、邊界情況）——完整改寫範本見上方「案例三」的正確範本與「案例解析：刪／改與保留」的正確範本。
