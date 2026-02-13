---
name: skill-creator
description: 建立有效 Skill 的指南。當使用者想要建立新的 Skill（或更新現有 Skill）來擴充 Claude 的能力，提供專業知識、工作流程或工具整合時，應使用此 Skill。
license: Complete terms in LICENSE.txt
---

# Skill Creator

此 Skill 提供建立有效 Skill 的指導方針。

## 關於 Skills

Skills 是模組化、自包含的套件，透過提供專業知識、工作流程和工具來擴充 Claude 的能力。可以將它們視為特定領域或任務的「入門指南」（onboarding guides）——它們將 Claude 從通用代理（general-purpose agent）轉變為配備程序性知識（procedural knowledge）的專業代理，而這些知識是任何模型都無法完全掌握的。

### Skills 提供的內容

1. **專業工作流程（Specialized workflows）** - 特定領域的多步驟程序
2. **工具整合（Tool integrations）** - 處理特定檔案格式或 API 的指示
3. **領域專業知識（Domain expertise）** - 公司特定知識、schemas、商業邏輯
4. **打包資源（Bundled resources）** - 用於複雜且重複任務的腳本、參考資料和素材

## 核心原則

### 簡潔至上

Context window（上下文視窗）是公共資源。Skills 與 Claude 需要的其他內容共享 context window：系統提示詞（system prompt）、對話歷史（conversation history）、其他 Skills 的 metadata，以及實際的使用者請求。

**預設假設：Claude 已經非常聰明。** 只添加 Claude 尚未擁有的上下文。挑戰每一條資訊：「Claude 真的需要這個解釋嗎？」以及「這段文字是否值得它的 token 成本？」

偏好簡潔的範例而非冗長的解釋。

### 設定適當的自由度

將具體程度與任務的脆弱性和變異性相匹配：

**高自由度（文字型指示）**：當多種方法都有效、決策取決於上下文，或啟發式方法（heuristics）引導流程時使用。

**中自由度（偽代碼或帶參數的腳本）**：當存在偏好的模式、某些變化可接受，或配置影響行為時使用。

**低自由度（特定腳本、少量參數）**：當操作脆弱且容易出錯、一致性至關重要，或必須遵循特定順序時使用。

將 Claude 想像為在探索一條路徑：懸崖間的窄橋需要特定的護欄（低自由度），而開闊的田野允許多條路線（高自由度）。

### Skill 的結構

每個 Skill 由一個必要的 SKILL.md 檔案和可選的打包資源組成：

```
skill-name/
├── SKILL.md (必要)
│   ├── YAML frontmatter metadata (必要)
│   │   ├── name: (必要)
│   │   ├── description: (必要)
│   │   └── compatibility: (可選，很少需要)
│   └── Markdown 指示 (必要)
└── Bundled Resources (可選)
    ├── scripts/          - 可執行程式碼 (Python/Bash 等)
    ├── references/       - 預期按需載入 context 的文件
    └── assets/           - 用於輸出的檔案 (模板、圖示、字型等)
```

#### SKILL.md (必要)

每個 SKILL.md 由以下組成：

- **Frontmatter** (YAML)：包含 `name` 和 `description` 欄位（必要），加上可選欄位如 `license`、`metadata` 和 `compatibility`。只有 `name` 和 `description` 會被 Claude 讀取以決定何時觸發 Skill，因此要清楚且完整地說明 Skill 是什麼以及何時應該使用。`compatibility` 欄位用於註記環境需求（目標產品、系統套件等），但大多數 Skills 不需要它。
- **Body** (Markdown)：使用 Skill 的指示和指導。只有在 Skill 觸發後才會載入（如果有的話）。

#### Bundled Resources (可選)

##### Scripts (`scripts/`)

用於需要確定性可靠性（deterministic reliability）或被重複撰寫的任務的可執行程式碼（Python/Bash 等）。

- **何時包含**：當相同的程式碼被重複撰寫，或需要確定性可靠性時
- **範例**：用於 PDF 旋轉任務的 `scripts/rotate_pdf.py`
- **好處**：節省 tokens、具確定性、可在不載入 context 的情況下執行
- **注意**：腳本可能仍需要被 Claude 讀取以進行修補或環境特定的調整

##### References (`references/`)

預期按需載入 context 以告知 Claude 流程和思考的文件和參考資料。

- **何時包含**：用於 Claude 在工作時應參考的文件
- **範例例**：用於財務 schemas 的 `references/finance.md`、用於公司 NDA 模板的 `references/mnda.md`、用於公司政策的 `references/policies.md`、用於 API 規格的 `references/api_docs.md`
- **使用案例**：資料庫 schemas、API 文件、領域知識、公司政策、詳細工作流程指南
- **好處**：保持 SKILL.md 精簡，只在 Claude 判定需要時載入
- **最佳實踐**：如果檔案很大（>10k 字），在 SKILL.md 中包含 grep 搜尋模式
- **避免重複**：資訊應該存在 SKILL.md 或 references 檔案中，而非兩者都有。除非真正是 Skill 的核心，否則偏好將詳細資訊放在 references 檔案中——這能保持 SKILL.md 精簡，同時讓資訊可被發現而不會佔用 context window。在 SKILL.md 中只保留必要的程序性指示和工作流程指導；將詳細的參考資料、schemas 和範例移至 references 檔案。

##### Assets (`assets/`)

不預期載入 context，而是用於 Claude 產出內容中的檔案。

- **何時包含**：當 Skill 需要用於最終輸出的檔案時
- **範例**：用於品牌素材的 `assets/logo.png`、用於 PowerPoint 模板的 `assets/slides.pptx`、用於 HTML/React 樣板的 `assets/frontend-template/`、用於字型的 `assets/font.ttf`
- **使用案例**：模板、圖片、圖示、樣板程式碼（boilerplate code）、字型、被複製或修改的範例文件
- **好處**：將輸出資源與文件分開，讓 Claude 能在不載入 context 的情況下使用檔案

#### 不應包含在 Skill 中的內容

Skill 應該只包含直接支援其功能的必要檔案。**不要**建立額外的文件或輔助檔案，包括：

- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md
- 等等

Skill 應該只包含 AI agent 完成當前任務所需的資訊。它不應包含關於建立過程、設定和測試程序、使用者導向文件等的輔助上下文。建立額外的文件檔案只會增加混亂和困惑。

### 漸進式揭露設計原則（Progressive Disclosure Design Principle）

Skills 使用三層載入系統來有效管理 context：

1. **Metadata (name + description)** - 永遠在 context 中（約 100 字）
2. **SKILL.md body** - 當 Skill 觸發時（<5k 字）
3. **Bundled resources** - 按 Claude 需求（無限制，因為腳本可以在不讀入 context window 的情況下執行）

#### 漸進式揭露模式

將 SKILL.md body 保持在必要內容且 500 行以下，以最小化 context 膨脹。當接近此限制時，將內容拆分到單獨的檔案。將內容拆分到其他檔案時，非常重要的一點是從 SKILL.md 中引用它們並清楚描述何時讀取它們，以確保 Skill 的讀者知道它們的存在以及何時使用。

**關鍵原則：** 當 Skill 支援多種變體、框架或選項時，只在 SKILL.md 中保留核心工作流程和選擇指導。將變體特定的細節（模式、範例、配置）移至單獨的 reference 檔案。

**模式 1：帶 references 的高層級指南**

```markdown
# PDF Processing

## Quick start

使用 pdfplumber 提取文字：
[程式碼範例]

## Advanced features

- **Form filling**: 參見 [FORMS.md](FORMS.md) 完整指南
- **API reference**: 參見 [REFERENCE.md](REFERENCE.md) 所有方法
- **Examples**: 參見 [EXAMPLES.md](EXAMPLES.md) 常見模式
```

Claude 只在需要時載入 FORMS.md、REFERENCE.md 或 EXAMPLES.md。

**模式 2：按領域組織**

對於支援多個領域的 Skills，按領域組織內容以避免載入不相關的 context：

```
bigquery-skill/
├── SKILL.md (概覽和導覽)
└── reference/
    ├── finance.md (營收、帳單指標)
    ├── sales.md (商機、銷售管線)
    ├── product.md (API 使用量、功能)
    └── marketing.md (行銷活動、歸因)
```

當使用者詢問銷售指標時，Claude 只讀取 sales.md。

同樣地，對於支援多個框架或變體的 Skills，按變體組織：

```
cloud-deploy/
├── SKILL.md (工作流程 + 供應商選擇)
└── references/
    ├── aws.md (AWS 部署模式)
    ├── gcp.md (GCP 部署模式)
    └── azure.md (Azure 部署模式)
```

當使用者選擇 AWS 時，Claude 只讀取 aws.md。

**模式 3：條件式細節**

顯示基本內容，連結到進階內容：

```markdown
# DOCX Processing

## Creating documents

使用 docx-js 建立新文件。參見 [DOCX-JS.md](DOCX-JS.md)。

## Editing documents

對於簡單編輯，直接修改 XML。

**對於追蹤修訂（tracked changes）**: 參見 [REDLINING.md](REDLINING.md)
**對於 OOXML 詳細資訊**: 參見 [OOXML.md](OOXML.md)
```

Claude 只在使用者需要這些功能時讀取 REDLINING.md 或 OOXML.md。

**重要準則：**

- **避免深層嵌套的 references** - 保持 references 在 SKILL.md 下一層。所有 reference 檔案應直接從 SKILL.md 連結。
- **結構化較長的 reference 檔案** - 對於超過 100 行的檔案，在頂部包含目錄，讓 Claude 在預覽時能看到完整範圍。

## Skill 建立流程

Skill 建立包含以下步驟：

1. 透過具體範例理解 Skill
2. 規劃可重用的 Skill 內容（scripts、references、assets）
3. 初始化 Skill（執行 init_skill.py）
4. 編輯 Skill（實作資源並撰寫 SKILL.md）
5. 打包 Skill（執行 package_skill.py）
6. 根據實際使用情況迭代

按順序執行這些步驟，只有在有明確理由不適用時才跳過。

### 步驟 1：透過具體範例理解 Skill

只有當 Skill 的使用模式已經清楚理解時才跳過此步驟。即使在使用現有 Skill 時，這仍然有價值。

要建立有效的 Skill，需要清楚理解 Skill 將如何被使用的具體範例。這種理解可以來自使用者的直接範例，或是經使用者回饋驗證的生成範例。

例如，在建構 image-editor Skill 時，相關問題包括：

- 「image-editor Skill 應該支援什麼功能？編輯、旋轉、還有其他嗎？」
- 「你能舉一些這個 Skill 會如何被使用的例子嗎？」
- 「我可以想像使用者會要求像『移除這張圖片的紅眼』或『旋轉這張圖片』這樣的事情。你還能想像這個 Skill 的其他使用方式嗎？」
- 「使用者會說什麼來觸發這個 Skill？」

為避免讓使用者不知所措，避免在單一訊息中問太多問題。從最重要的問題開始，視需要跟進以提高效果。

當清楚了解 Skill 應支援的功能時，結束此步驟。

### 步驟 2：規劃可重用的 Skill 內容

要將具體範例轉化為有效的 Skill，分析每個範例：

1. 考慮如何從頭執行該範例
2. 識別在重複執行這些工作流程時，哪些 scripts、references 和 assets 會有幫助

範例：在建構 `pdf-editor` Skill 來處理像「幫我旋轉這個 PDF」的查詢時，分析顯示：

1. 旋轉 PDF 每次都需要重寫相同的程式碼
2. 在 Skill 中儲存 `scripts/rotate_pdf.py` 腳本會有幫助

範例：在設計 `frontend-webapp-builder` Skill 來處理像「幫我建立一個 todo app」或「幫我建立一個追蹤步數的儀表板」的查詢時，分析顯示：

1. 撰寫前端 webapp 每次都需要相同的樣板 HTML/React
2. 在 Skill 中儲存包含樣板 HTML/React 專案檔案的 `assets/hello-world/` 模板會有幫助

範例：在建構 `big-query` Skill 來處理像「今天有多少使用者登入？」的查詢時，分析顯示：

1. 查詢 BigQuery 每次都需要重新發現表格 schemas 和關聯
2. 在 Skill 中儲存記錄表格 schemas 的 `references/schema.md` 檔案會有幫助

要確立 Skill 的內容，分析每個具體範例以建立要包含的可重用資源清單：scripts、references 和 assets。

### 步驟 3：初始化 Skill

此時，是時候實際建立 Skill 了。

只有當正在開發的 Skill 已經存在，且需要迭代或打包時才跳過此步驟。在這種情況下，繼續下一步。

從頭建立新 Skill 時，務必執行 `init_skill.py` 腳本。此腳本方便地生成新的模板 Skill 目錄，自動包含 Skill 所需的一切，使 Skill 建立流程更加高效和可靠。

使用方式：

```bash
scripts/init_skill.py <skill-name> --path <output-directory>
```

此腳本會：

- 在指定路徑建立 Skill 目錄
- 生成具有正確 frontmatter 和 TODO 佔位符的 SKILL.md 模板
- 建立範例資源目錄：`scripts/`、`references/` 和 `assets/`
- 在每個目錄中添加可以自訂或刪除的範例檔案

初始化後，根據需要自訂或刪除生成的 SKILL.md 和範例檔案。

### 步驟 4：編輯 Skill

在編輯（新生成或現有）Skill 時，請記住 Skill 是為另一個 Claude 實例使用而建立的。包含對 Claude 有益且不明顯的資訊。考慮哪些程序性知識、領域特定細節或可重用資源能幫助另一個 Claude 實例更有效地執行這些任務。

#### 學習經驗證的設計模式

根據 Skill 的需求查閱這些有用的指南：

- **多步驟流程**：參見 references/workflows.md 了解順序工作流程和條件邏輯
- **特定輸出格式或品質標準**：參見 references/output-patterns.md 了解模板和範例模式

這些檔案包含有效 Skill 設計的既定最佳實踐。

#### 從可重用的 Skill 內容開始

要開始實作，從上面識別的可重用資源開始：`scripts/`、`references/` 和 `assets/` 檔案。注意此步驟可能需要使用者輸入。例如，在實作 `brand-guidelines` Skill 時，使用者可能需要提供品牌素材或模板儲存在 `assets/`，或文件儲存在 `references/`。

添加的腳本必須透過實際執行來測試，確保沒有錯誤且輸出符合預期。如果有許多類似的腳本，只需要測試代表性樣本以確信它們都能運作，同時平衡完成時間。

任何不需要的範例檔案和目錄應該刪除。初始化腳本在 `scripts/`、`references/` 和 `assets/` 中建立範例檔案以展示結構，但大多數 Skills 不需要全部這些檔案。

#### 更新 SKILL.md

**撰寫準則：** 一律使用祈使句/不定詞形式。

##### Frontmatter

撰寫包含 `name` 和 `description` 的 YAML frontmatter：

- `name`：Skill 名稱
- `description`：這是 Skill 的主要觸發機制，幫助 Claude 了解何時使用該 Skill。
  - 包含 Skill 的功能以及使用時機的特定觸發條件/上下文。
  - 將所有「何時使用」的資訊放在這裡——而不是 body 中。Body 只有在觸發後才會載入，所以 body 中的「何時使用此 Skill」章節對 Claude 沒有幫助。
  - `docx` Skill 的 description 範例：「Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. Use when Claude needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks」

不要在 YAML frontmatter 中包含其他欄位。

##### Body

撰寫使用 Skill 及其打包資源的指示。

### 步驟 5：打包 Skill

Skill 開發完成後，必須打包成可分發的 .skill 檔案與使用者分享。打包過程會自動先驗證 Skill 以確保符合所有要求：

```bash
scripts/package_skill.py <path/to/skill-folder>
```

可選擇指定輸出目錄：

```bash
scripts/package_skill.py <path/to/skill-folder> ./dist
```

打包腳本會：

1. **驗證（Validate）** Skill 自動檢查：

   - YAML frontmatter 格式和必要欄位
   - Skill 命名慣例和目錄結構
   - Description 的完整性和品質
   - 檔案組織和資源引用

2. **打包（Package）** 如果驗證通過，建立以 Skill 命名的 .skill 檔案（例如 `my-skill.skill`），包含所有檔案並維護正確的目錄結構以便分發。.skill 檔案是副檔名為 .skill 的 zip 檔案。

如果驗證失敗，腳本會報告錯誤並退出而不建立套件。修正任何驗證錯誤後再次執行打包命令。

### 步驟 6：迭代

測試 Skill 後，使用者可能會要求改進。這通常發生在使用 Skill 後不久，此時對 Skill 的表現有新鮮的上下文。

**迭代工作流程：**

1. 在實際任務中使用 Skill
2. 注意困難或低效之處
3. 識別 SKILL.md 或打包資源應如何更新
4. 實作變更並再次測試
