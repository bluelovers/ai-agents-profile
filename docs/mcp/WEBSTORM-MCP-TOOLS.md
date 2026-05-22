---
tags:
  - documentation
  - jetbrains/webstorm
  - mcp
  - agents/tools
  - documentation/references
---

# WebStorm MCP 工具說明

## 概述

WebStorm 從版本 2025.2 開始支援 MCP (Model Context Protocol)，允許外部客戶端（如 Claude Desktop、Cursor、Codex、OpenCode 等）透過 MCP 伺服器存取 IDE 提供的工具。

## 連線方式

```json
{
  "mcp": {
    "webstorm": {
      "type": "remote",
      "url": "http://127.0.0.1:64342/sse",
      "enabled": true
    }
  }
}
```

## 支援的工具

| 工具名稱 | 功能 | 範例 |
|---------|------|------|
| `open_file_in_editor` | 在編輯器中開啟檔案 | 開啟 `__root_ws.ts` |
| `get_file_text_by_path` | 讀取檔案內容 | 讀取檔案內容 |
| `replace_text_in_file` | 取代檔案中的文字 | 文字替換 |
| `create_new_file` | 建立新檔案 | 建立新檔案 |
| `find_files_by_glob` | 用 glob 模式搜尋檔案 | `**/*.ts` |
| `find_files_by_name_keyword` | 用關鍵字搜尋檔案 | 搜尋檔名 |
| `search_in_files_by_text` | 用文字搜尋 | 搜尋程式碼 |
| `search_in_files_by_regex` | 用正則搜尋 | 正則搜尋 |
| `get_symbol_info` | 取得符號資訊 | 取得函式/變數資訊 |
| `rename_refactoring` | 重新命名重構 | 變數重新命名 |
| `reformat_file` | 格式化檔案 | 格式化程式碼 |
| `get_file_problems` | 分析檔案錯誤和警告 | 檢查錯誤 |
| `get_run_configurations` | 取得運行配置列表 | 取得可執行的配置 |
| `execute_run_configuration` | 執行運行配置 | 執行測試/建置 |
| `execute_terminal_command` | 執行終端機命令 | 執行命令 |
| `get_project_dependencies` | 取得專案依賴 | 取得依賴列表 |
| `get_project_modules` | 取得專案模組 | 取得模組列表 |
| `get_all_open_file_paths` | 取得所有開啟的檔案 | 取得開啟的檔案 |
| `list_directory_tree` | 列出目錄樹結構 | 取得目錄結構 |
| `get_repositories` | 取得 VCS 倉庫列表 | 取得 Git 倉庫 |

## OpenCode 呼叫範例

### 1. 開啟檔案 (`open_file_in_editor`)

```typescript
webstorm_open_file_in_editor({
  filePath: "__root_ws.ts",
  projectPath: "D:\\Users\\WebstormProjects\\nodejs-yarn\\ws-jest"
})
```

**回傳結果**：
```json
{
  "success": true
}
```

### 2. 讀取檔案 (`get_file_text_by_path`)

```typescript
webstorm_get_file_text_by_path({
  pathInProject: "__root_ws.ts",
  projectPath: "D:\\Users\\WebstormProjects\\nodejs-yarn\\ws-jest"
})
```

### 3. 搜尋程式碼 (`search_in_files_by_text`)

```typescript
webstorm_search_in_files_by_text({
  searchText: "functionName",
  projectPath: "D:\\Users\\WebstormProjects\\nodejs-yarn\\ws-jest"
})
```

### 4. 執行運行配置 (`execute_run_configuration`)

```typescript
webstorm_execute_run_configuration({
  configurationName: "jest",
  projectPath: "D:\\Users\\WebstormProjects\\nodejs-yarn\\ws-jest",
  timeout: 60000
})
```

### 5. 取得專案依賴 (`get_project_dependencies`)

```typescript
webstorm_get_project_dependencies({
  projectPath: "D:\\Users\\WebstormProjects\\nodejs-yarn\\ws-jest"
})
```

### 6. 重新命名重構 (`rename_refactoring`)

```typescript
webstorm_rename_refactoring({
  pathInProject: "src/index.ts",
  symbolName: "oldFunctionName",
  newName: "newFunctionName",
  projectPath: "D:\\Users\\WebstormProjects\\nodejs-yarn\\ws-jest"
})
```

## 參考連結

- [WebStorm MCP Server 文件](https://www.jetbrains.com/help/webstorm/mcp-server.html)
- [JetBrains MCP 官方文檔](https://www.jetbrains.com/help/ai-assistant/configure-an-mcp-server.html)
