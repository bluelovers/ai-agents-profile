---
tags:
  - agents/skills
  - documentation/README
  - documentation
  - documentation/index
---

# AI Agent 技能庫 (Skills)

本目錄收錄了一系列用於擴展 AI Agent 能力的「技能」(Skills)。每個技能都是一個模組化的、自包含的軟體包，包含特定領域的專業知識、工作流程、指令腳本或參考資源，旨在將 AI 從通用助手轉變為具備特定專業能力的專家。

## 技能列表

| 技能名稱 | 說明 | 核心用途 |
| :--- | :--- | :--- |
| [skill-creator](./skill-creator) | 技能開發指南 | 協助建立、驗證與打包新的 AI 技能。 |
| [bilingual-standardization-rule](./bilingual-standardization-rule) | 雙語標準化規範 | 雙語排版的 SSoT，含最高原則、語言順序、判定基準與術語保留；任何雙語產出前須實際閱讀本規範（「中文＋英文」只是語言組合）。 |
| [analyze-code-commenter](./analyze-code-commenter) | 註解意圖與內容品質分析 | 分析程式碼結構並決定註解意圖（解釋 WHY 而非 WHAT、約束與邊界條件）；審查並消除無意義註解與任務紀錄。 |
| [comment-format-rules-js](./comment-format-rules-js) | JS/TS 註解語法與格式規範 | 強制區塊註解 (/** ... */)、JSDoc 標籤排版、宣告與邏輯區塊格式分離、放置位置與更新規則。 |
| [readme-updater](./readme-updater) | README 文件更新維護 | 分析專案結構並自動檢查或更新說明文件。 |
| [factual-accuracy-guard](./factual-accuracy-guard) | 事實準確性防護 | 防止加入虛構內容，確保基於事實執行任務。 |
| [test-file-best-practices](./test-file-best-practices) | 測試檔案最佳實踐規範 | 測試檔案位置、分割、快照、臨時檔案管理與內容驗證最佳實踐。 |
| [test-convert-to-node-test](./test-convert-to-node-test) | 測試轉換為 Node.js 原生測試 | 將 Jest/Vitest/Bun/Mocha 測試遷移至 `node:test` + `t.assert`，包含回呼標註 `t: test.TestContext` 與 `t.assert` 優先規範。 |

---

## 技能詳情

### 🛠️ [Skill Creator](./skill-creator)
這是開發技能的「元技能」(Meta-skill)。當您想要擴展 AI 的能力、建立新的自動化工作流或封裝特定領域知識時，請使用此技能。
- **特點**：提供標準化目錄結構、漸進式揭露資訊、腳本集成指南。
- **來源**：參考自 [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/skill-creator)。

### 📝 [Analyze Code Commenter](./analyze-code-commenter)
專門用於分析程式碼註解意圖與內容品質的技能。深入分析程式碼結構，並決定何處需要註解與註解意圖。
- **特點**：雙語輸出（產出前須實際閱讀 [bilingual-standardization-rule](./bilingual-standardization-rule)，非逕以「中文＋英文」理解）、解釋「為什麼 (WHY)」而非僅是字面動作 (WHAT)、合約與邊界防禦意圖分析，並嚴格判定不良／無意義註解（錯置、層級錯置、重複宣告、任務／重構操作日誌）。

### 📐 [Comment Format Rules (JS/TS)](./comment-format-rules-js)
規範 JavaScript/TypeScript 程式碼註解的語法標記與排版格式。
- **特點**：強制區塊註解（`/** ... */`，禁用行內 `//`）、單行與多行排版對齊、JSDoc 標籤雙語格式、緊鄰代碼上方放置原則，以及行內轉區塊批次轉換工具。

### 📚 [README Updater](./readme-updater)
專案文件管理的利器，特別適合 Monorepo 大型專案。它能自動識別專案類型（Node.js, Python 等），並確保 README 文件包含所有必要章節。
- **特點**：支援多套件 (sub-packages) 檢查、整合 `docs/` 文件、自動生成分析報告與更新建議。

### 🛡️ [Factual Accuracy Guard](./factual-accuracy-guard)
防止 AI Agent 在執行任務時加入虛構內容或基於錯誤假設行動的安全防護技能。
- **特點**：提供輸入源權威原則、最小假設原則、事實查核強制原則，確保所有輸出基於可驗證的事實。
- **核心功能**：名稱歧義檢查、URL 內容驗證、虛構內容檢測、角色扮演事實融合。

---

## 如何使用技能

1. **觸發技能**：在與 AI 溝通時，直接提及技能名稱或描述相關任務（如：「幫我分析這段代碼並添加註解」），AI 將根據其 `SKILL.md` 中的描述自動載入對應技能。
2. **遵守規範**：每個技能都有詳細的 `SKILL.md` 作為 System Instruction，指導 AI 執行的具體步驟與格式要求。
3. **擴大應用**：您可以將這些技能手動複製到其他 AI Agent 的配置中，或參考 `skill-creator` 建立您自訂的專屬技能。

## references

- [anthropics/skills](https://github.com/anthropics/skills)
- [OpenAI Skills](https://github.com/openai/skills)
- [Google AI Skills](https://github.com/google-gemini/gemini-skills)
- [Microsoft AI Skills](https://github.com/microsoft/skills)
- [awesome-copilot](https://github.com/github/awesome-copilot)

