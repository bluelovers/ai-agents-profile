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
tags:
  - documentation
  - refactoring
  - organization
  - technical-writing
  - agents/skills
---

# Documentation Refactoring and Optimization

本技能提供文件結構重組與優化的原則與模式，確保文件具備清晰的內容結構、集中的主題論述，以及流暢的讀者體驗。

> **核心目標**
> - **主題連貫性 (Topic Coherence)**：相關內容連續呈現，不受無關內容中斷
> - **階層一致性 (Hierarchy Consistency)**：正確的標題層級與父子關係
> - **閱讀流程優先 (Reading Flow Priority)**：以讀者理解為優先的內容組織
> - **雙語標題格式 (Bilingual Title Format)**：中英文合併單行，避免空章節
> - **術語保留原則 (Preserve Technical Terms)**：維護技術術語的可搜尋性與精確性

---

## 核心原則: 主題集中與閱讀流程優先原則 (Topic Coherence & Reading Flow Priority)

### 主題集中原則 (Topic Coherence)

**規則：** 與同一主題直接相關的所有內容必須連續呈現，不得被無關內容中斷。

**範例：**

```markdown
<!-- ✅ 正確：主題集中 -->
├── 伺服器啟動腳本
│   ├── 伺服器啟動參數
│   ├── 伺服器啟動限制
│   ├── 瀏覽器互動測試
│   └── 伺服器管理工具  ← 輔助工具置於相關內容之後
└── 開發工具
    ├── php.bat
    └── php-test.bat

<!-- ❌ 錯誤：主題被中斷 -->
├── 伺服器啟動腳本
├── 開發工具           ← 錯誤：打斷了伺服器主題
│   ├── 伺服器啟動參數   ← 錯誤：應緊接伺服器主題
```

---

### 階層一致性原則 (Hierarchy Consistency)

**規則：** 子章節必須正確反映與父章節的從屬關係，並列關係使用同級標題。

| 關係類型 | 標題層級 | 範例 |
|---------|---------|------|
| 主章節 | `##` 或 `###` | `## 7. 開發腳本` |
| 子章節 | `###` 或 `####` | `### 伺服器啟動腳本` |
| 細節說明 | `####` 或 `#####` | `#### 伺服器啟動參數` |
| 並列主題 | 同級標題 | `### 伺服器啟動腳本` + `### 開發工具` |

---

### 閱讀流程優先原則 (Reading Flow Priority)

**規則：** 組織內容時優先考慮讀者的理解順序，而非作者的撰寫順序。

**正確順序：**
1. **核心概念** → 讀者需要先了解「如何啟動伺服器」
2. **限制與細節** → 然後才需要了解「伺服器的限制與注意事項」
3. **輔助工具** → 最後才需要「輔助管理工具」

**錯誤順序：**
1. **先介紹工具** → 讀者不知為何需要
2. **再介紹主題** → 邏輯跳躍，閱讀體驗差

---

### 綜合反模式範例 (Anti-pattern Examples)

以下範例展示了「情境插入中斷閱讀流程」與「章節階層錯誤阻礙擴充」的反模式，以及如何透過原則進行改善：

**錯誤示範：**
```markdown
<!-- ❌ 錯誤：情境插入中斷閱讀流程、章節階層錯誤阻礙擴充 -->
### 情境一：相對路徑問題
(問題描述...)

### 獨立情境：mkdir 目錄已存在  ← 錯誤 1：在「問題 → 解決方案」間插入無關情境，中斷閱讀流程

## 解決辦法與執行規範         ← 錯誤 2：將本應為子章節的內容設為同級 `##`，而非 `####`
(相對路徑問題的解決方案...)

### 情境二：權限不足問題        ← 錯誤 3：因前述階層錯誤，此處新增情境時結構已混亂
```

**正確示範：**
```markdown
<!-- ✅ 正確：主題集中、階層一致、閱讀流程順暢 -->
### 情境一：相對路徑問題
(問題描述...)

#### 解決辦法與執行規範         ← 正確：設為情境一的子章節 `####`，緊接問題描述
(相對路徑問題的解決方案...)

### 情境二：mkdir 目錄已存在    ← 正確：將無關情境移至獨立的同級章節 `###`
(問題描述與解決方案...)

### 情境三：權限不足問題        ← 正確：結構清晰，可無障礙擴充其他情境
```

---

## 核心原則: 雙語標題格式與術語保留原則 (Bilingual Title Format & Preservation)

### 雙語標題格式原則 (Bilingual Title Format)

> 此規則不適用於純英文文件

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
<!-- ❌ 錯誤：拆分成兩個獨立標題，產生空章節 -->
## 技術術語保留原則
## Preserve Technical Terms (DO Not Delete)
```

---

### 技術術語保留原則 (Preserve Technical Terms)

**核心原則：技術術語不得刪除。**

當更新或優化內容時，必須保留以下類型的原始術語（包含但不限於）。允許新增翻譯或詳細解釋，但**嚴禁**以「更好描述」或「在地化」為由刪除原始術語。

#### 多元領域術語分類與範例（包含但不限於）

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

#### 雙語術語標註原則 (Bilingual Terminology Annotation Principle)

**規則：技術術語首次出現時應確保中英文資訊並存，確保對譯的完整性。**

| 做法 | 說明 | 範例 |
|------|------|------|
| ✅ **一般術語標註** | 中文在前，英文術語在後加括號 | 聯合類型 (Union Type)、梯度下降法 (Gradient Descent) |
| ✅ **縮寫標註格式** | 縮寫在前，完整名稱在後加括號 | `E2EE (End-to-End Encryption)` |
| ✅ **複合資訊標註** | 中文 (英文全稱, 縮寫) | `大型語言模型 (Large Language Model, LLM)` |
| ✅ **情境嵌入保留** | 在句子中保留術語並輔以解釋 | `TypeScript 的聯合類型 (Union Type) 允許變數擁有...` |
| ❌ **錯誤做法：刪除** | 僅使用中文描述而省略原文 | `此函式接受多種可能的類型`（應保留 Union Type） |

#### 領域專業術語保留規則 (Domain-Specific Preservation Rule)

**規則：各領域的標準英文專業術語應保留術語原文，不得以中文描述替代或進行語意泛化。**

**核心邏輯 (Core Logic)：**

- **首次完整標註**：術語初次出現時，必須提供完整的雙語對照資訊。
- **識別領域術語**：需判斷該詞彙是否為特定領域（如資安、AI、架構）的標準通用詞彙。
- **保留術語原文**：術語原文必須在文中出現，格式應為 `中文術語 (Term)` 或 `縮寫術語 (Full Term)`。
- **可選中文說明**：允許提供中文輔助說明，但該說明絕對不能取代英文術語本身。
- **禁止翻譯替代**：嚴禁以「更好描述」為由刪除術語（例如：不得將 `SQL Injection` 改寫為「資料庫攻擊」）。
- **可搜索性保留**：英文原文必須至少出現一次，以確保技術人員能精準檢索。
- **領域一致性**：同一領域的文件應保持統一的標註慣例，不應隨意更動。
- **可引用性 (Referencability)**：標準術語是技術界的共同語言，確保跨文件的連結性。
- **精確性 (Precision)**：防止中文描述（如「零信任」）無法完整傳達技術標準（如 `Zero Trust Architecture`）的嚴謹內涵。

#### 決策流程 (Decision Flow)

```text
遇到專業術語
    │
    ▼
是否為領域標準術語？（具備可搜索性、領域通用性）
    │
    ├─ 是 → 保留英文原文
    │       │
    │       ├─ 首次出現？ → 標註格式：中文 (Term)
    │       │
    │       └─ 非首次出現？ → 直接使用英文原文或縮寫
    │
    └─ 否 → 依照一般翻譯與修辭原則處理

```

#### 正確與錯誤範例

##### 範例 1：保留 Markdown 語法術語

```markdown
<!-- ✅ 正確：保留標準術語 Heading Level -->
請使用正確的標題層級 (Heading Level) 來組織文件結構，確保 H2 (`##`) 作為主要章節，H3 (`###`) 作為子章節。

<!-- ❌ 錯誤：刪除標準術語 -->
請使用正確的大標題和小標題來組織文件，用兩個井字號表示主要部分，三個井字號表示次要部分。
```

##### 範例 2：保留工具與腳本名稱

```markdown
<!-- ✅ 正確：保留原始檔案名稱 -->
使用 `start_and_kill.bat` 啟動 PHP 內建伺服器，此腳本位於 `hof/` 目錄下。

<!-- ❌ 錯誤：替換或泛化工具名稱 -->
使用啟動腳本來開啟伺服器，這個批次檔放在特定資料夾裡。
```

##### 範例 3：保留文件結構術語

```markdown
<!-- ✅ 正確：保留 TOC 與 Section 術語 -->
文件的目錄 (Table of Contents, TOC) 應該清楚列出所有章節 (Section) 與子章節 (Subsection)。

<!-- ❌ 錯誤：刪除標準術語 -->
文件的開頭應該有目錄，列出所有主要部分和次要部分的內容。
```

##### 範例 4：保留領域專業術語（軟體開發/AI）

```markdown
<!-- ✅ 正確：保留標準領域術語 -->
在實作大型語言模型 (Large Language Model, LLM) 的推論 (Inference) 階段時，需注意梯度下降法 (Gradient Descent) 的優化策略，並確保 API 端點 (API Endpoint) 支援非同步處理 (Asynchronous Processing)。

<!-- ❌ 錯誤：替換或泛化專業術語 -->
在實作大型語言模型的推論階段時，需注意梯度下降的優化策略，並確保應用程式介面支援非同步處理。（缺少術語標註）
```

##### 範例 5：保留資安專業術語

```markdown
<!-- ✅ 正確：保留資安標準術語 -->
為實現端對端加密 (End-to-End Encryption, E2EE)，系統應採用零信任架構 (Zero Trust Architecture)，並防範常見的 SQL 注入 (SQL Injection) 與跨站腳本攻擊 (XSS, Cross-Site Scripting) 等攻擊向量。

<!-- ❌ 錯誤：刪除或替換資安術語（術語被中文描述替代） -->
為實現全程加密，系統應採用不信任任何一方的架構，並防範常見的資料庫攻擊與跨站攻擊手法。
```

**This is a hard constraint - technical terms provide searchable, referenceable information and represent established vocabulary in the field.**


---

## 實踐指南

### 工具歸位原則 (Tool Placement)

**規則：** 輔助工具應放置於與其功能最直接相關的主題章節內，強化主題連貫性。

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

**放置範例：**

| 工具 | 功能 | 放置位置 |
|------|------|---------|
| `taskill-port.bat` | 關閉伺服器行程 | `### 伺服器啟動腳本` 相關內容之後 |
| `debug-cls.bat` | 清理暫存檔 | `### 伺服器啟動腳本` 相關內容之後 |
| `php.bat` | 執行 PHP | `### 開發工具` 獨立區塊 |
| `php-test.bat` | 執行測試 | `### 開發工具` 獨立區塊 |

### 範例多樣性原則 (Example Diversity)

**規則：撰寫或重構文件範例時，必須確保示例涵蓋多樣化領域，避免取樣偏差導致思考單一化與語意誤導。**

**核心邏輯：**

1. **避免取樣偏差**：範例不應過度集中在單一領域或單一類型（如僅用 Markdown 術語代表所有技術術語）
2. **跨領域分布**：示例應橫跨至少 2-3 個不同專業領域（如軟體開發、資安、AI、資料工程等）
3. **概念區分清晰**：不同類別的示例應明確區分，避免語意模糊（如區分「語法標記」與「專業領域術語」）
4. **非窮盡性聲明**：範例列表須註明「包含但不限於」，避免使用者誤解為完整清單

**反模式警示：**

| 問題 | 說明 | 範例 |
|------|------|------|
| ❌ **領域單一化** | 所有範例來自同一領域 | 僅用 Markdown 術語展示「技術術語」概念 |
| ❌ **語意模糊** | 示例與概念邊界不清 | 用「Heading Level」同時代表語法術語與排版概念 |
| ❌ **誤導性完整** | 未聲明示例非完整清單 | 使用者誤以為表格已涵蓋所有術語類型 |

---

## 檢查清單

重組文件章節時，確認以下項目：

- [ ] 主題相關的段落是否連續？
- [ ] 重組前是否已分析各章節的語意關係（問題 → 解決方案是否為連續主題）？
- [ ] 子章節標題層級是否正確？
- [ ] 輔助工具是否放置於與其功能最直接相關的主題內？
- [ ] 並列主題是否使用同級標題？
- [ ] 讀者是否能順暢地從概念 → 細節 → 工具理解內容？
- [ ] 標準技術術語與專有名詞是否正確保留（涵蓋各領域：工程、安全、AI、文件工程等）？

---

## 相關資源

