---
name: doc-refactor-doc-optimization
description: >-
  Miscellaneous cases and concepts for documentation refactoring and optimization.
  Covers documentation section organization, chapter reorganization, and technical writing best practices.
  Suitable for:
  (1) Reorganizing documentation chapters and sections,
  (2) Improving document readability and structure,
  (3) Applying topic coherence principles to technical documents,
  (4) Optimizing hierarchy consistency in markdown files,
  (5) Managing tool placement and reading flow in documentation.
  Use this Skill when users ask about "documentation organization", "file structure", "chapter reorganization", or when refactoring technical documents.
---

# Documentation Refactoring and Optimization

You are an expert in organizing and optimizing technical documentation structure.
This guide provides principles and patterns for maintaining clear, coherent, and well-structured technical documents.

> **Purpose of this guide**:
> - **Topic coherence**: Ensure related content appears continuously without interruption
> - **Hierarchy consistency**: Maintain proper heading levels and parent-child relationships
> - **Reading flow**: Organize content prioritizing reader comprehension over author convenience
> - **Bilingual title format**: Combine bilingual titles into single lines to avoid empty sections

---

## 概述

本規則定義技術文件（如 AGENTS.md）中章節與段落的組織邏輯，確保內容結構清晰、主題集中，便於讀者理解與維護。

---

## 核心原則

### 1. 主題集中原則 (Topic Coherence)

**規則：** 與同一主題直接相關的所有內容必須連續呈現，不得被無關內容中斷。

**範例：**

```markdown
<!-- ✅ 正確：主題集中 -->
### 伺服器啟動腳本
├── #### 伺服器啟動參數
├── #### 伺服器啟動限制
├── #### 瀏覽器互動測試
└── #### 伺服器管理工具  ← 輔助工具放這裡

### 開發工具
├── #### php.bat
└── #### php-test.bat

<!-- ❌ 錯誤：主題被中斷 -->
### 伺服器啟動腳本
### 開發工具           ← 錯誤：打斷了伺服器主題
#### 伺服器啟動參數   ← 錯誤：應緊接主題
```

---

### 2. 階層一致性原則 (Hierarchy Consistency)

**規則：** 子章節必須正確反映與父章節的從屬關係，並列關係使用同級標題。

| 關係類型 | 標題層級 | 範例 |
|---------|---------|------|
| 主章節 | `##` 或 `###` | `## 7. 開發腳本` |
| 子章節 | `###` 或 `####` | `### 伺服器啟動腳本` |
| 細節說明 | `####` 或 `#####` | `#### 伺服器啟動參數` |
| 並列主題 | 同級 | `### 伺服器啟動腳本` + `### 開發工具` |

---

### 3. 閱讀流程優先原則 (Reading Flow Priority)

**規則：** 組織內容時優先考慮讀者的閱讀流程，而非作者的撰寫順序。

**正確順序：**
1. 讀者需要先了解「如何啟動伺服器」
2. 然後才需要了解「伺服器的限制與注意事項」
3. 最後才需要「輔助管理工具」

**錯誤順序：**
1. 先介紹工具 → 讀者不知為何需要
2. 再介紹主題 → 邏輯跳躍

---

### 4. 雙語標題格式原則 (Bilingual Title Format)

**規則：** 雙語標題應合併為單一行，不得拆分成獨立標題導致空章節。

**正確格式：**
```markdown
<!-- ✅ 正確：單行雙語標題 -->
## 技術術語保留原則 / Preserve Technical Terms (DO Not Delete)

<!-- ✅ 正確：較長說明放置於內文 -->
## 技術術語保留原則

> **Preserve Technical Terms (DO Not Delete)**
>
> 核心原則說明...
```

**錯誤格式：**
```markdown
<!-- ❌ 錯誤：拆分成兩個獨立標題 -->
## 技術術語保留原則
## Preserve Technical Terms (DO Not Delete)

<!-- 這會導致產生空章節，且第二個標題無內容 -->
```

---

## 補充規則

### 工具歸位原則 (Tool Placement)

**規則：** 輔助工具應放置於與其功能最直接相關的主題章節內。

**決策流程：**

```
判斷工具功能
    │
    ├─ 是 X 主題的核心輔助？ → 放在 X 主題章節內（通常於相關內容之後）
    │
    ├─ 是獨立通用工具？ → 獨立成章節
    │
    └─ 是多主題共用？ → 放置於最相關的主題，或獨立成章
```

**範例：**

| 工具 | 功能 | 放置位置 |
|------|------|---------|
| `taskill-port.bat` | 關閉伺服器行程 | `### 伺服器啟動腳本` 相關內容之後 |
| `debug-cls.bat` | 清理暫存檔 | `### 伺服器啟動腳本` 相關內容之後 |
| `php.bat` | 執行 PHP | `### 開發工具` 獨立區塊 |
| `php-test.bat` | 執行測試 | `### 開發工具` 獨立區塊 |

---

## 實作範例

### 範例：AGENTS.md 第 7 節組織

```markdown
## 7. 開發腳本

### 伺服器啟動腳本
<!-- 核心主題：如何啟動 PHP 內建伺服器 -->

| 腳本 | 用途 | 執行方式 |
|------|------|---------|
| `hof/start_and_kill.bat` | 啟動 PHP 伺服器 | `./hof/start_and_kill.bat` |

#### 伺服器啟動參數
<!-- 緊接核心主題：參數說明 -->

#### ⚠️ 伺服器啟動重要限制
<!-- 緊接核心主題：使用限制 -->

##### 常見錯誤 — 禁止事項

#### 瀏覽器互動測試流程
<!-- 延伸應用：如何使用啟動的伺服器 -->

##### 啟動與連線
##### 登入與帳號

#### 伺服器路由器功能
<!-- 技術細節：伺服器如何運作 -->

#### 工具腳本
<!-- 輔助工具：伺服器管理相關 -->

| 腳本 | 用途 |
|------|------|
| `hof/taskill-port.bat` | 終止 PHP 行程 |
| `debug-cls.bat` | 清除暫存檔 |

### 開發工具 (trust_path/bin)
<!-- 獨立主題：PHP CLI / 測試工具，與伺服器無直接關聯 -->

> ⚠️ **重要：`bin/` 目錄內的指令不在系統 PATH 中**

#### php.bat — PHP CLI 包裝

#### PHPUnit

#### php-test.bat — PHPUnit 測試執行器
```

---

## 技術術語保留原則 / Preserve Technical Terms (DO Not Delete)

**核心原則：技術術語不得刪除。**

當更新內容時，必須保留以下類型（但不限於）的原始術語。可新增翻譯或解釋，但「不得」以「更好描述」為由刪除原始術語。

### 術語分類與範例（包含但不限於）

| 術語類型 / Term Type | 範例 / Examples |
|---------------------|----------------|
| **程式語言術語** | Union Type、Type Guard、Generics、Decorator |
| **演算法與資料結構** | Dijkstra、Quick Sort、Binary Tree、Hash Map |
| **設計模式** | Singleton、Observer、Strategy、Factory |
| **軟體開發** | API Integration、Race Condition、Dependency Injection |
| **資訊安全** | E2EE (End-to-End Encryption)、Zero Trust、SQL Injection、XSS |
| **人工智慧** | LLM (Large Language Model)、Inference、Fine-tuning、Transformer |
| **資料工程** | ETL Pipeline、CRUD、Database Sharding |
| **文件工程** | TOC (Table of Contents)、Cross-reference、Semantic Markup |
| **標記語法** | Heading Level、Code Block、Frontmatter |
| **工具與路徑** | `start_and_kill.bat`、`docker-compose.yml`、`node_modules/` |

### 新增翻譯時的正確做法

| 做法 | 說明 | 範例 |
|------|------|------|
| ✅ **保留原始術語** | 中文後加括號術語 | `聯合類型 (Union Type)` |
| ✅ **縮寫格式** | 縮寫/別名在前，原名在括號內 | `E2EE (End-to-End Encryption)` |
| ✅ **添加說明** | 在句子中保留術語並解釋 | `TypeScript 的聯合類型 (Union Type) 允許...` |
| ❌ **刪除原始術語** | 僅用中文描述 | `此函式接受多種可能的類型`（不應刪除 Union Type） |

### 領域專業術語保留規則 / Domain-Specific Terminology Preservation Rule

**規則：各領域的標準英文專業術語應保留其英文原文，不得以中文描述替代或泛化。**

**核心邏輯：**

1. **識別領域術語**：判斷是否為特定領域（軟體開發、資安、AI、資料工程等）的標準專業詞彙
2. **保留術語原文**：術語必須在文中出現，格式為 `中文 (Term)` 或 `縮寫 (Full Term)`
3. **可選中文說明**：首次出現時可在括號內提供術語（如 `大型語言模型 (Large Language Model)`），但不得取代英文術語
4. **禁止翻譯替代**：可新增翻譯或解釋，但「不得」以「更好描述」為由刪除原始術語（如不得將 `SQL Injection` 寫為「資料庫攻擊」）

**決策流程：**

```
遇到專業術語
    │
    ▼
是否為領域標準術語？（具可搜索性、領域通用性）
    │
    ├─ 是 → 保留英文原文
    │        │
    │        ├─ 首次出現？→ 可加括號術語說明：中文 (Term)
    │        │
    │        └─ 非首次？→ 直接使用英文術語
    │
    └─ 否 → 依一般翻譯原則處理
```

**重要性說明：**

- **可搜索性 (Searchability)**：英文術語是領域內的通用關鍵字，便於搜尋與索引
- **可引用性 (Referencability)**：標準術語是領域內的共同語言，確保跨文件一致性
- **精確性 (Precision)**：中文描述往往無法完整傳達術語的技術內涵（如 `Zero Trust Architecture` 不等於「不信任任何一方的架構」）

### 正確與錯誤範例

#### 範例 1：保留 Markdown 語法術語

```markdown
<!-- ✅ 正確：保留標準術語 Heading Level -->
請使用正確的標題層級 (Heading Level) 來組織文件結構，確保 H2 (`##`) 作為主要章節，H3 (`###`) 作為子章節。

<!-- ❌ 錯誤：刪除標準術語 -->
請使用正確的大標題和小標題來組織文件，用兩個井字號表示主要部分，三個井字號表示次要部分。
```

#### 範例 2：保留工具與腳本名稱

```markdown
<!-- ✅ 正確：保留原始檔案名稱 -->
使用 `start_and_kill.bat` 啟動 PHP 內建伺服器，此腳本位於 `hof/` 目錄下。

<!-- ❌ 錯誤：替換或泛化工具名稱 -->
使用啟動腳本來開啟伺服器，這個批次檔放在特定資料夾裡。
```

#### 範例 3：保留文件結構術語

```markdown
<!-- ✅ 正確：保留 TOC 與 Section 術語 -->
文件的目錄 (Table of Contents, TOC) 應該清楚列出所有章節 (Section) 與子章節 (Subsection)。

<!-- ❌ 錯誤：刪除標準術語 -->
文件的開頭應該有目錄，列出所有主要部分和次要部分的內容。
```

#### 範例 4：保留領域專業術語（軟體開發/AI）

```markdown
<!-- ✅ 正確：保留標準領域術語 -->
在實作大型語言模型 (Large Language Model, LLM) 的推論 (Inference) 階段時，需注意梯度下降法 (Gradient Descent) 的優化策略，並確保 API 端點 (API Endpoint) 支援非同步處理 (Asynchronous Processing)。

<!-- ❌ 錯誤：替換或泛化專業術語 -->
在實作大型語言模型的推論階段時，需注意梯度下降的優化策略，並確保應用程式介面支援非同步處理。（缺少術語標註）
```

#### 範例 5：保留資安專業術語

```markdown
<!-- ✅ 正確：保留資安標準術語 -->
為實現端對端加密 (End-to-End Encryption, E2EE)，系統應採用零信任架構 (Zero Trust Architecture)，並防範常見的 SQL 注入 (SQL Injection) 與跨站腳本攻擊 (XSS, Cross-Site Scripting) 等攻擊向量。

<!-- ❌ 錯誤：刪除或替換資安術語（術語被中文描述替代） -->
為實現全程加密，系統應採用不信任任何一方的架構，並防範常見的資料庫攻擊與跨站攻擊手法。
```

**This is a hard constraint - technical terms provide searchable, referenceable information and represent established vocabulary in the field.**

---

## 檢查清單

重組文件章節時，確認以下項目：

- [ ] 主題相關的段落是否連續？
- [ ] 子章節標題層級是否正確？
- [ ] 輔助工具是否放置於與其功能最直接相關的主題內？
- [ ] 並列主題是否使用同級標題？
- [ ] 讀者是否能順暢地從概念 → 細節 → 工具理解內容？
- [ ] 標準技術術語與專有名詞是否正確保留（涵蓋各領域：工程、安全、AI、文件工程等）？

---

## 相關資源

- [註解格式規範](./comment-format-rules.md)
- [TypeScript 命名規範](./typescript-naming-convention.md)
