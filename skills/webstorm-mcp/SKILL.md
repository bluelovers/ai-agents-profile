---
name: webstorm-mcp
description: 啟動並呼叫 WebStorm MCP (Model Context Protocol) 服務，提供與 WebStorm IDE 的整合能力。當 MCP 連接失敗時，會自動回退至使用 CLI 指令。Use when users request (1) WebStorm MCP integration, (2) Open file in WebStorm, (3) Format file in WebStorm, (4) Search in WebStorm, (5) Code analysis in WebStorm, (6) "啟動 WebStorm", (7) "開啟 WebStorm 檔案", (8) "WebStorm MCP", (9) "webstorm_open_file_in_editor", (10) "webstorm_reformat_file".
---

# WebStorm MCP Skill

## 概述

本 skill 用於啟動並呼叫 WebStorm MCP (Model Context Protocol) 服務，提供與 WebStorm IDE 的整合能力。當 MCP 連接失敗時，會自動回退至使用 CLI 指令。

This skill is used to start and call WebStorm MCP (Model Context Protocol) service, providing integration with WebStorm IDE. When MCP connection fails, it automatically falls back to CLI commands.

---

## 前置條件

### 1. WebStorm IDE 必須執行

**MCP 需要 WebStorm IDE 處於執行狀態且開啟專案。**

| 狀態 | MCP 指令結果 |
|------|-------------|
| IDE 關閉 | ❌ Unable to connect |
| IDE 開啟中 | ❌ 視專案狀態而定 |
| IDE 開啟 + 開啟專案 | ✅ 正常運作 |

> 詳細啟動流程與驗證方式，請參閱 [WebStorm MCP 配置說明 - 啟動 WebStorm MCP 伺服器](./references/webstorm-mcp-config.md#啟動-webstorm-mcp-伺服器)

### 2. MCP 配置

確保已正確配置 WebStorm MCP。各工具（Claude App、Windsurf、Codex、OpenCode）的詳細配置範例，請參閱 [WebStorm MCP 配置說明 - 各工具配置範例](./references/webstorm-mcp-config.md#各工具配置範例)

---

## 使用方式

### 場景 1：開啟檔案

#### 優先使用 MCP

```
使用 MCP 指令：webstorm_open_file_in_editor
參數：
  - filePath: 檔案路徑（相對於專案根目錄）
  - projectPath: 專案路徑（可選）
```

#### 回退至 CLI

```
若 MCP 連接失敗，使用 CLI：
webstorm <file>
webstorm --line <N> --column <M> <file>  # 開啟並跳至指定行/欄
```

> CLI 與 MCP 指令的詳細對應關係，請參閱 [WebStorm CLI 與 MCP 指令比較 - 檔案操作對應](./references/webstorm-cli-mcp-compare.md#21-檔案操作對應)

---

### 場景 2：開啟專案

#### 使用 CLI

```
webstorm <directory>
```

**範例**：
```bash
webstorm "D:\Users\WebstormProjects\nodejs-yarn\ws-ts-type"
```

> 更多 CLI 指令與參數說明，請參閱 [WebStorm CLI 指令文檔 - 檔案開啟與導航](./references/webstorm-cli.md#11-檔案開啟與導航)

---

### 場景 3：格式化檔案

#### 優先使用 MCP

```
使用 MCP 指令：webstorm_reformat_file
參數：
  - path: 檔案路徑（相對於專案根目錄）
  - projectPath: 專案路徑（可選）
```

#### 回退至 CLI

```
若 MCP 連接失敗，使用 CLI：
webstorm format <file>
```

> CLI 與 MCP 格式化功能的比較，請參閱 [WebStorm CLI 與 MCP 指令比較 - 格式化檔案](./references/webstorm-cli-mcp-compare.md#44-格式化檔案)

---

### 場景 4：差異查看（CLI 專有）

**MCP 無法直接開啟差異查看器，必須使用 CLI。**

```
webstorm diff <file1> <file2>
```

**範例**：
```bash
webstorm diff "D:\old\file.ts" "D:\new\file.ts"
```

> 更多差異查看器說明，請參閱 [WebStorm CLI 指令文檔 - 差異查看器](./references/webstorm-cli.md#12-差異查看器-diff)

---

### 場景 5：合併工具（CLI 專有）

**MCP 無法直接開啟合併工具，必須使用 CLI。**

#### 雙方合併（2-way merge）

```
webstorm merge <local> <remote> <output>
```

#### 三方合併（3-way merge）

```
webstorm merge <local> <remote> <base> <output>
```

**範例**：
```bash
webstorm merge "helper.ts" "helper.d.ts" "helper.ts"
```

> 更多合併工具說明，請參閱 [WebStorm CLI 指令文檔 - 合併工具](./references/webstorm-cli.md#13-合併工具-merge)

---

### 場景 6：檔案搜尋（MCP 專有）

#### 使用 MCP 指令

```
webstorm_search_file          # glob 搜尋
webstorm_find_files_by_glob   # glob 查找
webstorm_find_files_by_name_keyword  # 檔名關鍵字查找
webstorm_search_in_files_by_text     # 文字搜尋
webstorm_search_in_files_by_regex    # 正規表達式搜尋
webstorm_search_text          # 搜尋並返回片段
webstorm_search_symbol        # 符號搜尋
```

> 完整 MCP 指令列表與參數說明，請參閱 [WebStorm MCP 文檔 - 檔案搜尋](./references/webstorm-mcp.md#檔案搜尋-7-個)

---

### 場景 7：程式碼分析

#### 單檔檢查（優先使用 MCP）

```
使用 MCP 指令：webstorm_get_file_problems
參數：
  - filePath: 檔案路徑（相對於專案根目錄）
  - errorsOnly: 是否只顯示錯誤（可選）
  - projectPath: 專案路徑（可選）
```

#### 專案全面檢查（使用 CLI）

```
webstorm inspect <project> <profile>
```

> CLI 與 MCP 程式碼檢查的比較，請參閱 [WebStorm CLI 與 MCP 指令比較 - 專案程式碼檢查](./references/webstorm-cli-mcp-compare.md#45-專案程式碼檢查)

---

### 場景 8：執行配置（MCP 專有）

#### 使用 MCP 指令

```
webstorm_execute_run_configuration   # 執行運行配置
webstorm_get_run_configurations      # 取得運行配置清單
```

> 完整 MCP 指令列表，請參閱 [WebStorm MCP 文檔 - 執行與終端](./references/webstorm-mcp.md#執行與終端-3-個)

---

## 決策矩陣

### 選擇使用 CLI 或 MCP

| 需求 | 推薦使用 | 原因 |
|------|----------|------|
| 開啟檔案（無需定位） | MCP | 可直接整合至工作流程 |
| 開啟檔案並跳至行號 | CLI | 內建支援 |
| 格式化檔案 | 兩者皆可 | 功能相同 |
| 程式碼檢查（單檔） | MCP | 可整合至自動化 |
| 程式碼檢查（專案） | CLI | 全面檢查 |
| 差異查看 | CLI | MCP 無對應 |
| 合併工具 | CLI | MCP 無對應 |
| 檔案搜尋 | MCP | 可整合至自動化 |
| 重新命名重構 | MCP | 可整合至自動化 |
| 安裝插件 | CLI | MCP 無對應 |

> 完整對應表與差異分析，請參閱 [WebStorm CLI 與 MCP 指令比較 - 決策矩陣](./references/webstorm-cli-mcp-compare.md#5-決策矩陣)

---

## CLI 使用注意事項

### ⚠️ 不要使用輸出重定向

**❌ 錯誤的用法**（會導致無回應）：
```bash
webstorm "D:\Users\WebstormProjects\project" 2>&1
```

使用 `2>&1` 將 stderr 重定向到 stdout 時，即使 IDE 成功開啟，命令也不會返回任何回應，導致調用方無限期等待。

**✅ 正確的用法**（直接執行）：
```bash
webstorm "D:\Users\WebstormProjects\project"
```

### CLI 執行特性

| 特性 | 說明 |
|------|------|
| 執行方式 | WebStorm CLI 會啟動/喚醒 IDE 後立即返回 |
| 無需等待 | 不需要等待命令完成，IDE 開啟即視為成功 |
| 無回應設計 | CLI 設計上不輸出成功訊息，失敗時才會有錯誤輸出 |

---

### MCP 故障排除流程

當 MCP 連線失敗時，請依以下順序嘗試解決：

```
┌─────────────────────────────────────────┐
│  1. 嘗試執行 MCP 指令（stream 版本）       │
│     例如：webstorm_stream_open_file_in_editor │
└─────────────────────────────────────────┘
                    ↓
        ┌───────────────────┐
        │   是否成功？        │
        └───────────────────┘
           ↓ 是          ↓ 否
      ┌──────────┐  ┌─────────────────────────┐
      │  完成    │  │ 2. 改用非 stream 版本     │
      └──────────┘  │    例如：webstorm_open_file_in_editor │
                    └─────────────────────────┘
                                ↓
                    ┌───────────────────┐
                    │   是否成功？        │
                    └───────────────────┘
                       ↓ 是          ↓ 否
                  ┌──────────┐  ┌─────────────────────────┐
                  │  完成    │  │ 3. 使用 CLI 啟動 WebStorm │
                  └──────────┘  │    webstorm "專案路徑"    │
                                └─────────────────────────┘
                                            ↓
                                ┌───────────────────┐
                                │   是否成功？        │
                                └───────────────────┘
                                   ↓ 是          ↓ 否
                              ┌──────────┐  ┌──────────────┐
                              │ 等待 10~30 │  │ 檢查 IDE 狀態  │
                              │ 秒後重試   │  │ 或手動開啟    │
                              └──────────┘  └──────────────┘
```

**重點原則**：
- 優先嘗試 `webstorm_stream_*` 指令（效能較好）
- Stream 版本失敗時，改用 `webstorm_*` 非 stream 版本
- 非 stream 版本也失敗時，才使用 CLI 啟動 WebStorm
- CLI 啟動後需等待 10~30 秒再嘗試 MCP 指令

**啟動後確認狀態（推薦）**：

使用 CLI 啟動 WebStorm 後，建議透過 MCP 狀態檢查確認 IDE 已就緒：

```
1. 執行 CLI 開啟專案
2. 等待 10~30 秒（讓 WebStorm 完全啟動）
3. 使用 MCP 指令確認狀態
```

**等待時間建議**：
| 情境 | 建議等待時間 |
|------|-------------|
| WebStorm 已開啟 | 10 秒 |
| WebStorm 冷啟動 | 20~30 秒 |
| 大型專案 | 30 秒以上 |

**MCP 狀態確認方式**：
- 嘗試執行任意 MCP 指令（如 `webstorm_get_file_problems`）
- 若返回正常結果，表示 MCP 連線已就緒
- 若出現 `Unable to connect`，表示仍需等待或 WebStorm 未完全啟動

---

### 錯誤訊息與解決方式

| 錯誤訊息 | 解決方式 |
|----------|----------|
| `Unable to connect` | 確認 WebStorm IDE 正在執行 |
| `Streamable HTTP session not found` | 使用 CLI 重新開啟專案 |
| `session-id` 失效 | 手動關閉並重新開啟 MCP 連線 |

> 完整故障排除指南，請參閱 [WebStorm MCP 配置說明 - 故障排除](./references/webstorm-mcp-config.md#故障排除)

### 啟動 WebStorm 的正確方式

**❌ 錯誤的啟動方式**：
```bash
# 只啟動 WebStorm（不開啟專案）
webstorm
```

**✅ 正確的啟動方式**：
```bash
# 使用 CLI 開啟專案目錄
webstorm "D:\Users\WebstormProjects\nodejs-yarn\ws-ts-type"

# 或開啟特定檔案
webstorm "D:\Users\WebstormProjects\nodejs-yarn\ws-ts-type\packages\ts-type\package.json"
```

> 更多 CLI 指令說明，請參閱 [WebStorm CLI 指令文檔 - 使用範例](./references/webstorm-cli.md#3-使用範例)

---

## 參考文檔

詳細的 MCP 指令列表、CLI 指令列表、協議說明等，請參閱以下參考文檔：

| 文檔 | 說明 |
|------|------|
| [WebStorm CLI 指令文檔](./references/webstorm-cli.md) | CLI 指令總覽、參數行為、使用範例 |
| [WebStorm CLI 與 MCP 指令比較](./references/webstorm-cli-mcp-compare.md) | CLI 與 MCP 指令對應關係、差異分析 |
| [WebStorm MCP 文檔](./references/webstorm-mcp.md) | MCP 協議配置、完整指令列表、使用須知 |
| [WebStorm MCP 配置說明](./references/webstorm-mcp-config.md) | 各工具（Claude App、Windsurf、Codex、OpenCode）的 MCP 配置範例 |

---

## 相關資源

### 官方文檔

| 標題 | 網址 |
|------|------|
| 命令列介面 (Command Line Interface) | https://www.jetbrains.com/zh-cn/help/webstorm/working-with-the-ide-features-from-command-line.html |
| 從命令行打開文件 | https://www.jetbrains.com/zh-cn/help/webstorm/opening-files-from-command-line.html |
| 命令行比較文件 | https://www.jetbrains.com/zh-cn/help/webstorm/command-line-differences-viewer.html |
| 命令行合併工具 | https://www.jetbrains.com/zh-cn/help/webstorm/command-line-merge-tool.html |
| 命令行格式化文件 | https://www.jetbrains.com/zh-cn/help/webstorm/command-line-formatter.html |
| 命令行代碼檢查 | https://www.jetbrains.com/zh-cn/help/webstorm/command-line-code-inspector.html |
| 命令行安裝插件 | https://www.jetbrains.com/zh-cn/help/webstorm/install-plugins-from-the-command-line.html |

### MCP 相關

| 標題 | 網址 |
|------|------|
| JetBrains MCP 伺服器 | https://github.com/modelcontextprotocol/server-jetbrains |
| MCP 官方文檔 | https://modelcontextprotocol.io/ |
| OpenCode 官方網站 | https://opencode.ai/ |
