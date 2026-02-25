# ai-agents-profile README

    ai-agents-profile

## AI Agent 組件對照表

| 組件名稱 | 定義與定位 | 核心用途 |
| --- | --- | --- |
| **AGENTS.md** | **身分證 (Identity)** | 定義 Agent 的角色背景、性格、最終目標。 |
| **Rules** | **員工守則 (Constraints)** | 設定行為邊界、輸出格式、絕對禁止的事項。 |
| **Workflows** | **SOP (Process)** | 規劃任務的先後順序、決策邏輯與流程圖。 |
| **SKILL.md** | **工具箱 (Capability)** | 描述 Agent 擁有的外部能力（如聯網、讀檔、寫代碼）。 |

## AI Agent 組件

### 1\. AGENTS.md (身分與角色)

這是 Agent 的「靈魂」。它決定了 AI 在溝通時的語氣、立場以及它認為自己「是誰」。

- **適合情境：** 需要特定專業人設（如：資深後端工程師、毒舌評論家）時。

- **不適合情境：** 單純的數據處理任務，過度的人設反而會增加無謂的 Token 消耗。

- **例子：** 「你是一位擁有 20 年經驗的資安專家，說話簡潔有力，對安全性極度偏執。」

### 2\. Rules (規範與約束)

這是最硬性的限制。無論任務怎麼變，Rules 必須被遵守。

- **適合情境：** 規範輸出格式（如：只能回傳 JSON）、法律合規性、避免幻覺（如：不知道就說不知道）。

- **不適合情境：** 需要 AI 發揮高度創意或打破框架的情境。

- **例子：** 「嚴禁提及競爭對手的產品名稱」、「所有日期格式必須符合 ISO 8601」。

### 3\. Workflows (工作流與邏輯)

這是 Agent 的「大腦邏輯」。它將複雜任務拆解成 Step1→Step2。

- **適合情境：** 複雜且多階段的任務（如：先蒐集資料 → 撰寫草稿 → 審核修正）。

- **不適合情境：** 開放式、即興式的聊天，或是簡單的一問一答。

- **例子：** 「如果用戶輸入是報錯訊息，先查詢文檔，再給出修復建議；如果是功能請求，則導向產品經理。」

### 4\. SKILL.md (技能與工具)

這是 Agent 的「手腳」。定義了它如何與現實世界的工具（APIs, Python Interpreter, Search）互動。

- **適合情境：** 需要處理即時資訊、操作外部系統或進行複雜運算時。

- **不適合情境：** 純文字創作、不需要外部數據驗證的腦力激盪。

- **例子：** `get_weather(city)` 技能，或是 `run_python_script(code)` 技能。

---

### 綜合建議：如何配置你的 Agent？

1. **先寫 AGENTS.md**：定好基調，讓它知道目標是什麼。

2. **配置 SKILL.md**：給它達成目標所需的工具。

3. **串聯 Workflows**：如果任務太複雜，用工作流把步驟鎖定。

4. **補充 Rules**：在測試過程中，發現它容易犯錯的地方，用 Rules 加以限制。

> **小撇步：** 如果你的 Agent 表現不穩定，通常是因為 **Workflows 不夠明確**；如果它的回答跑題，通常是 **Rules 寫得太寬鬆**。

## references

### mixin

- https://github.com/cline/prompts (rules, workflows)
- https://cursor.directory/rules (rules, mcps)

### rule

- https://cursor.directory/rules
- [module-execution-rules.md](./rules/module-execution-rules.md) - 模組執行規則

### skill


- [anthropics/skills](https://github.com/anthropics/skills)
- [OpenAI Skills](https://github.com/openai/skills)
- [Google AI Skills](https://github.com/google-gemini/gemini-skills)
- [Microsoft AI Skills](https://github.com/microsoft/skills)
- [awesome-copilot](https://github.com/github/awesome-copilot)
- https://skillmd.ai/

