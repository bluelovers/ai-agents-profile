# VS Code Copilot 指令配置規範指南

本文件定義了專案中 GitHub Copilot 指令（Custom Instructions）的層次結構與定位，旨在統一 AI 生成程式碼的風格、架構與品質控管。

---

## ⚖️ 定位說明：Rules (規則) vs. Agents (代理)

在 VS Code 生態系中，`.github` 下的指令文件定位為 **「規則 (Rules)」**：

* **非 Agents**：它們不具備獨立決策或主動執行任務的權力（非自主運行單元）。
* **純 Rules**：它們是 Copilot 的**操作指南**。當開發者進行對話（Chat）或行內編輯（Inline Edit）時，AI 會將這些指令作為背景約束（Constraint），確保輸出符合專案規範。

---

## 🏗️ 指令層次結構 (Hierarchical Structure)

建議採用「全域基礎 + 局部精確」的雙層配置架構，以平衡規範的統一性與技術的專業度。



### 1. 全域指令：`.github/copilot-instructions.md`
**定位：專案憲法 (Global Rules)**
* **生效範圍**：整個專案的所有檔案。
* **核心內容**：
    * **專案簡述**：核心業務邏輯與目標。
    * **技術棧清單**：例如 `PNPM`, `TypeScript`, `Tailwind CSS`, `Next.js`。
    * **通用語法偏好**：例如「優先使用 Functional Programming」、「註釋一律使用繁體中文」。
    * **嚴格禁忌**：例如「禁止使用 `any`」、「禁止使用 `var`」、「禁止直接操作 DOM」。

### 2. 精確指令：`.github/instructions/*.instructions.md`
**定位：領域專業手冊 (Specialized Rules)**
* **生效範圍**：情境感知（Context-aware），Copilot 會根據當前編輯的檔案路徑或類型自動匹配。
* **核心內容**：
    * **UI 組件規範**：如 `ui.instructions.md`，定義 Tailwind 類名排序與 Accessibility (ARIA) 要求。
    * **API 邏輯**：如 `api.instructions.md`，定義 Axios 攔截器、錯誤處理流程與 DTO 驗證。
    * **測試模板**：如 `test.instructions.md`，指定 Vitest 語法、Mock 庫使用與測試覆蓋率基準。

---

## 📊 快速對比表

| 特性 | 全域指令 (`copilot-instructions.md`) | 精確指令 (`*.instructions.md`) |
| :--- | :--- | :--- |
| **角色** | **核心架構與風格指南** | **特定技術細節與模板** |
| **加載機制** | 始終開啟，作為基礎背景 | 根據目前 Context 自動篩選載入 |
| **管理難度** | 單一文件，適合維護大原則 | 多文件，適合解決複雜技術債 |
| **最佳用途** | 命名規範、語言偏好、專案架構 | 複雜設計模式、Library 深度應用 |

---

## 💡 實作最佳實踐

1.  **範例導向 (Example-Driven)**：在指令中加入一小段「Best Practice」程式碼範例。AI 對程式碼範例的模仿能力遠強於抽象的文字敘述。
2.  **避免過度擁腫**：不要把所有細節都塞進全域指令。若全域文件超過 100 行，建議將特定模組（如 Database 或 CSS）拆分至 `.github/instructions/`。
3.  **定期同步**：隨著專案架構演進（如從 Webpack 遷徙至 Vite），應同步更新指令文件，避免 AI 生成過時或衝突的建議。
