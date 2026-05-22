---
name: skill-creator-fine-tuned
description: |-
  建立與更新符合專案最新規範（如 description 換行與觸發詞語法、title 欄位使用時機、標籤正規化及 references 目錄規劃）的高品質技能之微調版指南。

  當使用者提及以下關鍵字或情境時觸發：
  - "建立新技能" 或 "建立技能"
  - "微調技能" 或 "微調技能指南"
  - "新增技能 / create skill"
  - "技能 Frontmatter 規範 / skill frontmatter"
  - "技能觸發詞 / skill triggers"
tags:
  - agents/skills/skill-creation
  - opencode
  - agents/core
  - agents/workflow
  - agents/skills
  - obsidian/frontmatter
---

# Skill Creator (Fine-Tuned) | 技能建立者微調版

此技能是基於 `skills/skill-creator` 的微調版本，旨在引導 AI Agent 建立與維護高品質、標準化且符合專案最新 Frontmatter 與標籤規範的 Skill。

---

## 💡 與原版 `skill-creator` 的差異

本微調版技能在原版基礎上，強化了以下關鍵規範與實踐：

1. 📂 **強制規劃 `references/` 目錄**：推動「漸進式揭露原則」，將複雜的語法細節、規範、範例與 schemas 抽離至 `references/` 中，保持 `SKILL.md` 精簡。
2. ✍️ **Frontmatter `description` 格式優化**：規定在需要分行（如列表）時使用 `|-`，在不需要分行但原始碼需換行排版時使用 `>-`。
3. 🏷️ **所有 Markdown 檔案標籤化**：參考 `obsidian-fm-tags`，要求所有 `.md` 檔案（包含 main 檔案與 reference 檔案）都必須加上標準化 tags。
4. 📌 **精確定義 Frontmatter `title` 欄位的使用時機**：只有在檔名、第一個 Heading 與實際上表達的標題不一致時才加上 `title` 欄位。

---

## 📐 核心原則

### 1. 簡潔至上 (Concise is Key)
- **上下文視窗是公共資源**。技能的描述與內容會與系統提示詞、對話歷史與使用者請求共享 context window。
- **預設假設：Agent 已經非常聰明**。只添加 Agent 尚未擁有的上下文，避免贅述通用常識，多使用簡潔的範例代替冗長的解釋。

### 2. 設定適當的自由度 (Degrees of Freedom)
- **高自由度 (文字型指示)**：當多種方法都有效、決策取決於上下文時使用。
- **中自由度 (偽代碼或帶參數的腳本)**：當存在偏好的模式、某些變化可接受時使用。
- **低自由度 (特定腳本、少量參數)**：當操作脆弱且容易出錯、一致性至關重要時使用。

### 3. 漸進式揭露設計原則 (Progressive Disclosure)
- **三層載入系統**：
  1. **Metadata (name + description)** - 永遠在 context 中（約 100 字）。
  2. **SKILL.md body** - 當 Skill 觸發時載入（小於 500 行）。
  3. **References 資源** - 按 Agent 需求動態載入，避免一次性塞入過多 token。
- **目錄結構**：
  ```
  skill-name/
  ├── SKILL.md (必要，核心工作流程與導覽)
  └── references/ (必要，存放詳細規範、範例與 schemas)
      ├── frontmatter-specification.md
      └── other-references.md
  ```

---

## 📑 關鍵 frontmatter 規格與標籤化規則

本微調版的核心規範，詳細實作細節請查閱 [frontmatter-specification.md](./references/frontmatter-specification.md)。

### 1. Description 區塊語法與觸發詞規範 (`|-` 與 `>-`)

在 `SKILL.md` 的 YAML Frontmatter 中，`description` 是最關鍵的觸發欄位，必須清楚且完整地包含**觸發詞（Triggers）列表**。為了使 Agent 精確識別觸發條件，應善用 YAML 的區塊文字折疊與保留語法：

- 📝 **當需要分行時（如包含觸發詞列表、多步驟清單）**：必須使用 `|-`（保留換行符，並刪除區塊末尾的換行符）。這是添加觸發詞列表時的**標準格式**。
- 🎨 **當不需要分行時（純段落說明，無列表）**：必須使用 `>-`（將折疊的換行符換成空格，原始碼可自由換行，美化排版）。

> [!IMPORTANT]
> 每個技能的主 `SKILL.md` 的 `description` **必須包含觸發詞列表**（Triggers when user mentions...），以便引導 Agent 在對話中精確觸發該技能。因此，主技能的 description 應統一使用 `|-` 語法。

### 2. Frontmatter `title` 欄位

#### 使用時機
當以下三者不一致時，在 frontmatter 中使用 `title` 欄位記錄實際標題：
1. **檔案名稱**（如 `hook-experimental-compaction-autocontinue.md`）
2. **內文第一個 Heading**（如 `# Hook: experimental.compaction.autocontinue`）
3. **實際上想要表達的紀錄標題**

#### 範例
```yaml
---
title: 深入分析 experimental.compaction.autocontinue 機制
tags:
  - opencode/plugin-system
  - opencode/hooks/autocontinue
---
```

#### 原則
- 當檔名與第一個 heading 已能清晰表達內容時，**不需要**加 `title`。
- `title` 僅用於需要**不同於檔名與 heading 的自然語言表述**時。

### 3. 所有 Markdown 檔案標籤化

參考 `obsidian-fm-tags`，Skill 目錄下的**所有 `.md` 檔案**都必須在 frontmatter 中包含標準化的 `tags` 欄位。

#### 標籤正規化規則：
- 一律使用小寫字母（如 `nodejs` 而非 `Node.js`）。
- 使用連字號 (`-`) 分隔多詞（如 `skill-creation`）。
- 使用斜線 (`/`) 建立層級關係的巢狀標籤（如 `agents/skills`）。
- 避免特殊字元（如用 `cpp` 代替 `C++`）。

---

## 🚀 技能建立與維護流程

### 步驟 1：透過具體範例理解技能
- **理解場景**：清楚理解技能的實際應用場景，了解使用者會說什麼來觸發此技能。
- **核心問答**：與使用者溝通以釐清核心範疇（例如：支援哪些檔案格式、預期的輸入與輸出為何），但避免一次問太多問題，從最關鍵的問題開始。

### 步驟 2：規劃與建立 `references/` 資料夾
- **強制建立**：此微調版本強制要求建立 `references/` 目錄。
- **知識拆分**：分析技能的知識結構，將細節（如複雜 API 規格、大量範例或分支工作流程）移至 `references/` 中，保持 `SKILL.md` 簡潔。

### 步驟 3：編輯與優化 `SKILL.md`
當編輯技能檔案時，請記住這是寫給「另一個 Agent」看的。撰寫時應遵循以下細部規則：

#### 1. 撰寫 YAML Frontmatter
Frontmatter 決定了技能的觸發與標籤化，必須嚴格配置：
- **`name`**：技能名稱。**極為重要：YAML 中的技能名稱（`name`）必須與該技能的資料夾名稱完全一致**（例如：資料夾名稱為 `skill-creator-fine-tuned`，則 Frontmatter 中 `name` 欄位的值必須完全為 `skill-creator-fine-tuned`，不可有大小寫、底線或連字號的任何差異，否則驗證與打包會失敗）。
- **`description`**：這是主要的觸發機制。
  - **核心要求**：**必須包含明確的觸發詞列表**（Triggers when user mentions...）。
  - **語法要求**：因為包含列表與換行，**主 `SKILL.md` 的 description 欄位一律必須使用 `|-` 語法**以保留排版。
  - **內容準則**：包含技能所做的事，以及何時使用此技能的關鍵字。**不要**將何時使用技能的資訊寫在正文（Body）中，因為 Body 只有在技能被觸發後才會載入，在 Body 中寫「何時使用」對觸發毫無幫助。
- **`tags`**：依據標籤正規化規則，為技能添加適當的標準化標籤。

#### 2. 撰寫正文 (Body)
- **寫作風格**：一律使用**祈使句 / 不定詞形式**（imperative/infinitive form）。
- **流程導覽**：以精簡的步驟描述核心工作流程，並使用 Markdown 相對連結（如 `[frontmatter-specification.md](./references/frontmatter-specification.md)`）明確指向 `references/` 中的參照檔案，指引 Agent 按需加載。

### 步驟 4：為所有附屬 Reference Markdown 檔案加上 Frontmatter
- **全面標籤化**：確保 `references/` 中的每個 `.md` 檔案皆包含正確的 `tags`。
- **Title 欄位**：若附屬文件的檔名、第一個 Heading 與實際上表達的標題不一致，必須使用 YAML `title` 欄位加以記錄。
- **Description 欄位**：附屬文件若不需要分行，`description` 應使用 `>-` 語法進行美化排版。

### 步驟 5：測試、驗證與打包技能 (選用, 無法執行時可忽略)
- **測試腳本**：任何技能內置的 scripts 必須實際執行測試以確保無誤。
- **驗證與打包**：使用打包工具（如原版 `package_skill.py`）驗證 YAML 格式、目錄結構與 description 的完整性，並打包為 `.skill` 檔分發。

### 步驟 6：根據實際使用進行迭代
- 在實際任務中使用該技能，注意任何執行阻礙、上下文遺漏或效率問題。
- 優化 `SKILL.md` 中的觸發詞列表、工作流程指引或 `references/` 中的範例，以持續提升 Agent 執行的確定性。

---

## 🔗 相關參照資源

- 📋 **Frontmatter 詳細規範與範例**：[frontmatter-specification.md](./references/frontmatter-specification.md)
- 🎨 **高品質輸出設計模式**：[output-patterns.md](./references/output-patterns.md)
- ⚙️ **複雜工作流程與分支引導**：[workflows.md](./references/workflows.md)
- 🏷️ **Obsidian 標籤標準化指南**：[tag-normalization.md](../obsidian-fm-tags/references/tag-normalization.md)
