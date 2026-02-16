# AI Agent 技能庫 (Skills)

本目錄收錄了一系列用於擴展 AI Agent 能力的「技能」(Skills)。每個技能都是一個模組化的、自包含的軟體包，包含特定領域的專業知識、工作流程、指令腳本或參考資源，旨在將 AI 從通用助手轉變為具備特定專業能力的專家。

## 技能列表

| 技能名稱 | 說明 | 核心用途 |
| :--- | :--- | :--- |
| [skill-creator](./skill-creator) | 技能開發指南 | 協助建立、驗證與打包新的 AI 技能。 |
| [analyze-code-commenter](./analyze-code-commenter) | 雙語代碼註解分析 | 分析程式碼邏輯並添加繁中/英文雙語註解。 |
| [readme-updater](./readme-updater) | README 文件更新維護 | 分析專案結構並自動檢查或更新說明文件。 |

---

## 技能詳情

### 🛠️ [Skill Creator](./skill-creator)
這是開發技能的「元技能」(Meta-skill)。當您想要擴展 AI 的能力、建立新的自動化工作流或封裝特定領域知識時，請使用此技能。
- **特點**：提供標準化目錄結構、漸進式揭露資訊、腳本集成指南。
- **來源**：參考自 [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/skill-creator)。

### 📝 [Analyze Code Commenter](./analyze-code-commenter)
專門用於提升程式碼可讀性的工具。它會深入分析程式碼的核心邏輯、內部方法以及封閉成員，並在不破壞原始排版的前提下添加註解。
- **特點**：雙語輸出（繁體中文與英文）、支援 JSDoc 格式、解釋「為什麼」而非僅是「做了什麼」。

### 📚 [README Updater](./readme-updater)
專案文件管理的利器，特別適合 Monorepo 大型專案。它能自動識別專案類型（Node.js, Python 等），並確保 README 文件包含所有必要章節。
- **特點**：支援多套件 (sub-packages) 檢查、整合 `docs/` 文件、自動生成分析報告與更新建議。

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

