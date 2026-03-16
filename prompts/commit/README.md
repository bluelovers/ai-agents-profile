# Git Commit Message 生成提示詞 (Prompts)

本目錄提供用於分析 Git Diff 並自動生成符合 [Conventional Commits](https://www.conventionalcommits.org/) 規範的提交訊息提示詞模板。

## 提示詞模板

| 模板檔案 | 說明 | 輸出語言 |
| :--- | :--- | :--- |
| [Conventional_Commits-kilo.md](./Conventional_Commits-kilo.md) | 標準版本，遵循官方規範 | 英文 |
| [Conventional_Commits-kilo-with-zh.md](./Conventional_Commits-kilo-with-zh.md) | 支援繁體/簡體中文輸出的版本 | 中文 |

## 推薦模型

### Z.ai: GLM5

> 試用連結: [kilo.ai](https://kilo.ai/)

**GLM5** 模型在理解程式碼邏輯與變更意圖方面表現優異，非常適合搭配此類提示詞使用，能生成精確且具描述性的提交訊息。

#### 輸出範例

搭配 `Conventional_Commits-kilo-with-zh.md` 時的生成結果：

```text
feat(prompts): 添加 conventional commit 消息生成器提示模板

新增两个 commit 消息生成器提示文件：
- Conventional_Commits-kilo.md：英文版本
- Conventional_Commits-kilo-with-zh.md：支持中文输出版本
```

```text
docs(skills): 添加技能庫 README 與 skill-creator 中文文檔

新增 skills/README.md 作為 AI Agent 技能庫的主要說明文件，包含技能列表、詳情介紹及使用指南。

新增 skills/skill-creator/SKILL.zh.md 為 skill-creator 技能的中文版本，提供建立有效 Skill 的完整指導方針，涵蓋核心原則、結構規範與開發流程。
```

### MoonshotAI: Kimi K2.5

> 試用連結: [kilo.ai](https://kilo.ai/)

- https://github.com/MoonshotAI/Kimi-K2.5
- https://platform.moonshot.ai/docs/guide/kimi-k2-5-quickstart
- https://ollama.com/library/kimi-k2.5
- https://huggingface.co/moonshotai/Kimi-K2.5

**Kimi K2.5** 模型在理解程式碼邏輯與變更意圖方面表現優異，非常適合搭配此類提示詞使用，能生成精確且具描述性的提交訊息。

```
feat(pkg-entry-util): 將預設腳本執行從 yarn run 遷移至 node --run 並新增 pnpm 支援

- 更新 pkg-scripts、root-scripts、shared-root-scripts 與 ws-root-scripts 中的腳本執行方式
- 統一使用 node --run 替代 yarn run 以減少對 Yarn 的依賴
- 在 shared-root-scripts 中將 pnpm 加入預設安裝清單
- 在 root-scripts 中新增 pnpm:dedupe 與 ncu:pnpm 腳本
- 同步更新 sort-package-json-scripts 以支援 pnpm 腳本分類
```

```
docs(ncu-ws,ncu): 新增完整雙語文件與 JSDoc 註解

為 yarn-tool ncu 相關套件新增完整的雙語技術文件：

- 擴充 README.md 內容，新增雙語功能描述、安裝方式與 API 參考表格
- 為 index.ts、cli.ts、update.ts、ncu-main.ts 等核心模組新增詳細 JSDoc 註解
- 改善函數文件，說明參數、回傳值與執行流程
- 更新 package.json 描述以反映完整功能
- 升級 ncu-ws 的 upath2 依賴至 ^3.1.23
```

```
chore(deps): 更新依賴項目並升級版本至 2.2.0

升級所有 @yarn-tool/* 相關套件至最新版本，新增
@yarn-tool/yargs-util、@yarn-tool/yarnlock-fs、@yarn-tool/yarnlock-parse
等工具套件，移除 v8-compile-cache 依賴，並將版本號從 2.1.6 提升至 2.2.0。
```

### OpenCode: Big Pickle

> 試用連結: [OpenCode](https://opencode.ai/)

**Big Pickle** 是 OpenCode 最新的旗艦模型，以 **GLM 4.6** 為基底，專為複雜程式碼分析與生成任務優化。在 Git Commit Message 生成任務中表現優異，能精準理解程式碼變更意圖，生成符合 Conventional Commits 規範且具描述性的提交訊息。

#### 輸出範例

```
feat(core): 新增 AI Agent 設定檔解析模組

- 新增 config/agent-config.ts 作為 AI Agent 設定檔解析器
- 支援 JSON 與 YAML 格式的設定檔讀取
- 新增 validateAgentConfig() 函數進行設定驗證
- 整合现有錯誤處理機制，回傳詳細驗證錯誤資訊
```

## 其他模型

### Arcee AI: Trinity Large Preview

```
docs(skills): 擴充代碼註解技能文檔的說明內容

詳細說明代碼註解的實用價值，強調未來修改或除錯時可快速理解代碼意圖，提升文檔的實用性與指導效果。
```

### Giga Potato

```
docs(skills): 优化代码注释技能文档的指导建议

在代码注释技能文档中补充了对注释长期价值的说明，明确指出优质注释在后续代码迭代或问题排查过程中能够显著降低理解成本，进一步完善了文档的指导属性和实用价值。
```

### MiniMax: MiniMax M2.5

> 即使指定了中文，但還是經常性回應英文

```
docs(skills): improve code comment skill documentation with debugging context

Added practical benefits to the "explain why not what" section in the code commenting skill document, helping developers understand how clarifying code intent accelerates future maintenance and troubleshooting efforts
```

```
docs(skills): 增强代码注释技能文档中"解释原因"部分

在代码注释技能文档中明确说明解释"为什么"的注释能够帮助未来开发者或自己在代码维护和调试时快速理解代码意图，提升文档对实际开发的指导作用
```

## 使用指南

1. 將選定的模板內容複製並貼入 AI 助手的 **System Prompt**。
2. 將 `git diff --cached` 的結果提供給 AI。
3. AI 將會根據變更內容自動生成符合規範的 Commit Message。

