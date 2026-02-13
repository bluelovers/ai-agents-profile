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

## 使用指南

1. 將選定的模板內容複製並貼入 AI 助手的 **System Prompt**。
2. 將 `git diff --cached` 的結果提供給 AI。
3. AI 將會根據變更內容自動生成符合規範的 Commit Message。

