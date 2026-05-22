---
title: AI 技能 Frontmatter 規格說明與範例
description: >-
  詳細定義 AI 技能 (Skills) 及所有相關 Markdown 檔案的 Frontmatter 規格。
  包括 description 欄位折疊與保留語法的使用時機、title 欄位使用時機、標籤的標準格式與正規化原則。
tags:
  - agents/skills/skill-creation
  - obsidian/frontmatter
  - documentation/references
---

# Frontmatter 規格與標籤化指南 | Frontmatter & Tagging Guide

本參照檔案詳細說明如何在 Skill 及其附屬的 Markdown 檔案中正確撰寫 YAML Frontmatter，確保 Agent 可以順利觸發與載入，並維持整個知識庫的結構一致性。

## 📂 技能名稱與資料夾名稱一致性規範

### 🚨 核心規則：技能名稱必須完全相符
在技能的主 `SKILL.md` 的 YAML Frontmatter 中，**`name` 欄位的值必須與該技能所在的資料夾名稱完全一致**。
- ❌ **錯誤**：資料夾名稱為 `skill-creator-fine-tuned`，但 `name` 填寫 `SkillCreatorFineTuned` 或 `skill_creator_fine_tuned`。
- ✅ **正確**：資料夾名稱為 `skill-creator-fine-tuned`，且 `name` 亦填寫 `skill-creator-fine-tuned`。

> [!CAUTION]
> 技能名稱與資料夾名稱不一致會導致 Agent 無法正確關聯與呼叫技能，並且在執行 `package_skill.py` 驗證與打包時會直接報錯攔截。

---

## ✍️ Description 區塊語法與觸發詞規範

在 YAML 中，當我們需要多行或特定排版的文字時，會使用區塊標示符。最常見的兩種標示符為 `|-` (保留換行，並移除末尾的多餘換行) 與 `>-` (折疊換行，將行與行之間的換行符轉換為空格)。

### 🚨 核心規範：必須包含觸發詞
每個技能的主 `SKILL.md` 的 `description` **必須包含明確的觸發詞（Triggers）列表**（即告知 Agent「當使用者提及以下情境或關鍵字時觸發」）。這能確保 Agent 在對話中精確比對並觸發合適的技能。

---

### 1. 使用 `|-` (當需要分行與列表時)

#### 📌 使用時機
當 `description` 欄位包含**觸發詞列表**、條列式說明、多步驟指南等需要保留分行與列表排版的內容時，**必須**使用 `|-`。

> [!IMPORTANT]
> 由於每個技能主檔案的 `description` 都必須宣告觸發詞列表，因此主 `SKILL.md` 的 description 欄位**一律應使用 `|-` 語法**。

#### 範例
```yaml
---
name: obsidian-fm-tags
description: |-
  處理 Obsidian 筆記中 frontmatter 標籤（tags）的技能，包括新增、驗證、格式化與提取。

  當使用者提及以下關鍵字時觸發：
  - "添加 Obsidian 標籤"
  - "管理 Obsidian tags"
  - "驗證 Obsidian 標籤"
tags:
  - obsidian
  - tags
---
```

---

### 2. 使用 `>-` (不需要分行但原始碼需換行排版)

#### 📌 使用時機
當 Markdown 附屬檔案（例如 `references/` 底下的參照文件）的 `description` 是一段純段落的文字，不需要實際的分行與列表，但為了讓原始碼美觀、易讀，不希望單行文字過長時，使用 `>-`。

`>-` 會將程式碼中的換行符轉換成空格，並剔除結尾的多餘換行，使最終解析出的 metadata 呈現為單一長字串。

#### 範例
```yaml
---
title: AI 技能 Frontmatter 規格說明與範例
description: >-
  詳細定義 AI 技能 (Skills) 及所有相關 Markdown 檔案的 Frontmatter 規格。
  包括 description 欄位折疊與保留語法的使用時機、title 欄位使用時機、標籤的標準格式與正規化原則。
tags:
  - agents/skills/skill-creation
  - obsidian/frontmatter
---
```

> [!NOTE]
> 在現代 IDE 或 Git 版本控制中，避免單行字元超過 80 或 100 個字元是良好的程式碼習慣。
> 使用 `>-` 既可達到原始碼在編輯器中有分行折返的效果，又可確保最終 API 解析時是一條流暢的單行字串。


---

## 📌 Frontmatter `title` 欄位使用時機

### 使用時機
當以下三者不一致時，在 frontmatter 中使用 `title` 欄位記錄實際標題：
1. **檔案名稱**（如 `hook-experimental-compaction-autocontinue.md`）
2. **內文第一個 Heading**（如 `# Hook: experimental.compaction.autocontinue`）
3. **實際上想要表達的紀錄標題**

### 範例
```yaml
---
title: 深入分析 experimental.compaction.autocontinue 機制
tags:
  - opencode/plugin-system
  - opencode/hooks/autocontinue
---

# Hook: experimental.compaction.autocontinue

本文件深入剖析此實驗性機制的運作細節...
```

### 原則
- 🚫 **不要濫用**：當檔名與第一個 heading 已能清晰表達內容時，**不需要**加 `title`。
- 💡 **精準使用**：`title` 僅用於需要**不同於檔名與 heading 的自然語言表述**時。

---

## 🏷️ Markdown 檔案標籤化原則

所有 Markdown 檔案（無論是 Main SKILL.md 或是 `references/` 底下的 `.md` 檔案）都必須加上 `tags` 欄位。

### 正規化規則 (依據 `obsidian-fm-tags` 規範)

1. **一律使用小寫字母**：
   - ❌ `TypeScript`, `Node.js`
   - ✅ `typescript`, `nodejs`
2. **使用連字號分隔多詞**：
   - ❌ `code review`, `code_review`
   - ✅ `code-review`
3. **移除特殊字元**：
   - ❌ `c#`, `c++`
   - ✅ `csharp`, `cpp`
4. **使用斜線建立巢狀標籤**：
   - 用於分類與標記階層結構，如 `agents/skills` 或 `documentation/references`。
