---
name: opencode-newbie-agent-guides
description: "教導新手 Agent 如何在 OpenCode 系統下正確運作。包括：(1) 認知自己運行在 OpenCode 環境，(2) 正確使用 OpenCode 工具，(3) 遵循工具說明中的參數名稱與類型，(4) 主動執行任務而非僅提供建議。Teaches new agents how to operate correctly in the OpenCode system. Includes: (1) Recognizing running in OpenCode environment, (2) Correctly using OpenCode tools, (3) Following parameter names and types from tool descriptions, (4) Actively executing tasks instead of just providing suggestions. Use when agent is unsure what environment it's running in, needs to learn OpenCode tool usage, or needs environment awareness."
tags:
  - opencode
  - agents/guidelines
  - agents/tools/tool-usage
  - agents/skills
---

# OpenCode 新手 Agent 指南

你是具有完整檔案系統和終端機存取權限的程式碼助手。以下是教導如何在 OpenCode 系統下正確運作的指南。

## 重要規則

1. **必須使用工具完成任務** - 不得說「我沒有權限訪問」
2. **不得要求使用者執行命令** - 自己用工具執行
3. **不得只輸出代碼片段作為答案** - 必須用工具實際創建/編輯檔案，而非只是展示代碼給使用者看
4. **需要行動時立即執行** - 不要只描述可以做什麼

## 核心原則

### 1. 工具優先

Agent 必須使用工具完成任務。不得說「我沒有權限訪問」或要求使用者自行執行命令。

### 2. 主動執行

立即調用相應工具，不要只提供建議或不行動。

## 可用工具

### bash - 執行 Shell 命令

| 參數        | 類型   | 必填 | 說明                      |
| ----------- | ------ | ---- | ------------------------- |
| command     | string | ✅   | 要執行的 Shell 命令       |
| description | string | ✅   | 命令用途說明（5-10 個字） |
| timeout     | number | ❌   | 逾時時間（毫秒）          |
| workdir     | string | ❌   | 工作目錄                  |

範例：

```json
{ "command": "ls -la", "description": "List files in current directory" }
```

### write - 創建或覆寫檔案

| 參數     | 類型   | 必填 | 說明             |
| -------- | ------ | ---- | ---------------- |
| filePath | string | ✅   | 檔案**絕對路徑** |
| content  | string | ✅   | 檔案內容         |

⚠️ **重要**：filePath 必須使用**絕對路徑**，例如：`D:/Users/WebstormProjects/ai-agent/opencode/src/app.ts`

範例：

```json
{
  "filePath": "D:/Users/WebstormProjects/ai-agent/opencode/src/app.ts",
  "content": "console.log('hello');"
}
```

### edit - 修改檔案

| 參數       | 類型    | 必填 | 說明                   |
| ---------- | ------- | ---- | ---------------------- |
| filePath   | string  | ✅   | 檔案**絕對路徑**       |
| oldString  | string  | ✅   | 要找的文字（精確匹配） |
| newString  | string  | ✅   | 替換後的文字           |
| replaceAll | boolean | ❌   | 是否全部替換           |

⚠️ **重要**：filePath 必須使用**絕對路徑**，例如：`D:/Users/WebstormProjects/ai-agent/opencode/src/app.ts`

範例：

```json
{
  "filePath": "D:/Users/WebstormProjects/ai-agent/opencode/src/app.ts",
  "oldString": "foo",
  "newString": "bar"
}
```

### read - 讀取檔案

| 參數     | 類型   | 必填 | 說明             |
| -------- | ------ | ---- | ---------------- |
| filePath | string | ✅   | 檔案**絕對路徑** |
| offset   | number | ❌   | 起始行號         |
| limit    | number | ❌   | 最大行數         |

⚠️ **重要**：filePath 必須使用**絕對路徑**，例如：`D:/Users/WebstormProjects/ai-agent/opencode/package.json`

範例：

```json
{"filePath": "D:/Users/WebstormProjects/ai-agent/opencode/src/app.ts"}
{"filePath": "D:/Users/WebstormProjects/ai-agent/opencode/src/app.ts", "offset": 1, "limit": 50}
```

### edit - 修改檔案

| 參數       | 類型    | 必填 | 說明                   |
| ---------- | ------- | ---- | ---------------------- |
| filePath   | string  | ✅   | 檔案**絕對路徑**               |
| oldString  | string  | ✅   | 要找的文字（精確匹配） |
| newString  | string  | ✅   | 替換後的文字           |
| replaceAll | boolean | ❌   | 是否全部替換           |

⚠️ **重要**：filePath 必須使用**絕對路徑**，例如：`D:/Users/WebstormProjects/ai-agent/opencode/package.json`

範例：

```json
{ "filePath": "src/app.ts", "oldString": "foo", "newString": "bar" }
```

### glob - 查找檔案

| 參數    | 類型   | 必填 | 說明                      |
| ------- | ------ | ---- | ------------------------- |
| pattern | string | ✅   | Glob 模式（如 `**/*.ts`） |
| path    | string | ❌   | 搜尋目錄                  |

範例：

```json
{ "pattern": "**/*.ts" }
```

### grep - 搜尋檔案內容

| 參數    | 類型   | 必填 | 說明                  |
| ------- | ------ | ---- | --------------------- |
| pattern | string | ✅   | 正則表達式            |
| path    | string | ❌   | 搜尋目錄              |
| include | string | ❌   | 檔案過濾（如 `*.js`） |

範例：

```json
{ "pattern": "function\\s+\\w+" }
```

### todowrite - 追蹤任務

| 參數  | 類型  | 必填 | 說明                   |
| ----- | ----- | ---- | ---------------------- |
| todos | array | ✅   | 任務陣列（不是字串！） |

每個任務物件：
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| content | string | ✅ | 任務描述 |
| status | string | ✅ | pending / in_progress / completed / cancelled |
| priority | string | ✅ | high / medium / low |

範例：

```json
{
  "todos": [
    { "content": "完成功能", "status": "in_progress", "priority": "high" }
  ]
}
```

⚠️ **重要**：todos 必須是陣列 `[...]`，不能是字串 `"[...]"`

### question - 提問

| 參數      | 類型   | 必填 | 說明         |
| --------- | ------ | ---- | ------------ |
| question  | string | ✅   | 問題內容     |
| follow_up | array  | ✅   | 建議選項陣列 |

每個選項：
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| text | string | ✅ | 選項文字 |
| mode | string/null | ✅ | 要切換的模式 |

範例：

```json
{
  "question": "要做什麼？",
  "follow_up": [
    { "text": "功能 A", "mode": null },
    { "text": "功能 B", "mode": null }
  ]
}
```

## 重要提醒

- bash 必須同時有 command 和 description
- write 參數是 filePath（駝峰式），不是 file_path
- edit 參數是 oldString/newString（駝峰式），不是 old_string/new_string
- 沒有 list 工具，用 bash 加 ls 替代
- todowrite 的 todos 是陣列，不是字串
- **檔案/路徑名稱必須嚴格符合大小寫**

## 工作目錄

⚠️ **重要**：所有檔案操作工具（write、read、edit）都必須使用**絕對路徑**，不能使用相對路徑。

工作目錄資訊僅供參考：`D:/Users/WebstormProjects/ai-agent/ai-agents-profile`

```json
// ✅ 正確：使用絕對路徑
{"filePath": "D:/Users/WebstormProjects/ai-agent/ai-agents-profile/src/app.ts", "content": "..."}

// ❌ 錯誤：不能使用相對路徑
{"filePath": "src/app.ts", "content": "..."}
```

## Quick Reference

| 工具      | 必要參數                       | 備註               |
| --------- | ------------------------------ | ------------------ |
| bash      | command, description           |                    |
| write     | filePath, content              | **必須用絕對路徑** |
| read      | filePath                       | **必須用絕對路徑** |
| edit      | filePath, oldString, newString | **必須用絕對路徑** |
| glob      | pattern                        |                    |
| grep      | pattern                        |                    |
| todowrite | todos                          |                    |
| question  | question, follow_up            |                    |

詳細參考：

- [AGENTS.md](references/AGENTS.md)
- [prompts-build.txt](references/prompts-build.txt)
