---
tags:
  - webstorm
  - mcp
  - configuration
  - setup
  - jetbrains
---

# WebStorm MCP 配置說明

## 概述

本文件說明如何在不同 AI 工具中配置 WebStorm MCP (Model Context Protocol) 服務。

---

## 啟動 WebStorm MCP 伺服器

### 重要前提

**WebStorm MCP 伺服器需要 IDE 處於啟動狀態且開啟專案才能正常運作。**

| 狀態 | MCP 指令結果 |
|------|-------------|
| IDE 關閉 | ❌ Unable to connect |
| IDE 開啟中 | ❌ 視專案狀態而定 |
| IDE 開啟 + 開啟專案 | ✅ 正常運作 |

無論使用哪種 AI 工具（Claude App、Windsurf、Codex、OpenCode），都必須先啟動 WebStorm IDE 並開啟專案，MCP 伺服器才會可用。

### 啟動流程

1. **啟動 WebStorm IDE**
2. **開啟專案**（使用 CLI 或 IDE 介面）
3. **MCP 伺服器自動啟動**（當 IDE 載入專案後）
4. **AI 工具連接 MCP 伺服器**

### 使用 CLI 啟動專案

```bash
# 使用 CLI 開啟專案目錄（推薦）
webstorm "D:\Users\WebstormProjects\nodejs-yarn\ws-ts-type"
```

> ⚠️ **重要**：除非無法知道專案目錄，否則盡量不要使用直接開啟特定檔案的方法。有需要開啟檔案，請等專案目錄開啟後再執行。
>
> 原因：直接開啟特定檔案可能導致 WebStorm 無法正確載入專案結構，影響 MCP 伺服器的正常運作。
>
> ```bash
> # ❌ 不建議：直接開啟特定檔案
> webstorm "D:\Users\WebstormProjects\nodejs-yarn\ws-ts-type\packages\ts-type\package.json"
>
> # ✅ 建議：先開啟專案目錄，再開啟檔案
> webstorm "D:\Users\WebstormProjects\nodejs-yarn\ws-ts-type"
> # 然後在 WebStorm 中開啟需要的檔案
> webstorm "D:\Users\WebstormProjects\nodejs-yarn\ws-ts-type\packages\ts-type\package.json"
> ```

### 驗證 MCP 伺服器狀態

可以使用以下命令驗證 MCP 伺服器是否正常運行：

```bash
opencode mcp debug <mcp-name>
# opencode mcp debug webstorm
# opencode mcp debug webstorm-stream
```

---

## 各工具配置範例

### Claude App

Claude App 使用 stdio 模式啟動 MCP 伺服器，需要指定 Java 執行檔路徑和相關 JAR 檔案。

```json
{
  "webstorm": {
    "command": "C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\jbr\\bin\\java",
    "args": [
      "-classpath",
      "C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\plugins\\mcpserver\\lib\\mcpserver-frontend.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\util-8.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.kotlinx.coroutines.core.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.ktor.client.cio.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.ktor.client.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.ktor.network.tls.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.ktor.io.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.ktor.utils.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.kotlinx.io.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.kotlinx.serialization.core.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.kotlinx.serialization.json.jar",
      "com.intellij.mcpserver.stdio.McpStdioRunnerKt"
    ],
    "env": {
      "IJ_MCP_SERVER_PORT": "64342"
    }
  }
}
```

**配置說明**：
- `command`: Java 執行檔路徑（使用 WebStorm 內建的 JBR）
- `args`: 啟動參數，包含 classpath 和主類別
- `env`: 環境變數，指定 MCP 伺服器端口為 64342

---

### Windsurf

Windsurf 使用 SSE 協議連接 MCP 伺服器。

```json
{
  "webstorm": {
    "serverUrl": "http://127.0.0.1:64342/sse"
  }
}
```

**配置說明**：
- `serverUrl`: MCP 伺服器的 SSE 端點 URL
- 使用 SSE (Server-Sent Events) 協議
- 端口：64342

---

### Codex

Codex 使用 Streamable HTTP 協議連接 MCP 伺服器。

```json
{
  "webstorm": {
    "url": "http://127.0.0.1:64342/stream"
  }
}
```

**配置說明**：
- `url`: MCP 伺服器的 Streamable HTTP 端點 URL
- 使用 Streamable HTTP 協議（推薦）
- 端口：64342

---

### OpenCode

OpenCode 支援兩種協議類型，建議使用 Streamable HTTP。

```jsonc
{
  "mcp": {
    "webstorm": {
      "enabled": true,
      "type": "remote",
      "url": "http://127.0.0.1:64342/sse"
    },
    "webstorm-stream": {
      "enabled": true,
      "type": "remote",
      "url": "http://127.0.0.1:64342/stream"
    }
  }
}
```

**配置說明**：
- `webstorm`: SSE 協議（已廢棄，但仍可運作）
- `webstorm-stream`: Streamable HTTP 協議（推薦）
- `enabled`: 是否啟用該協議
- `type`: 連接類型，固定為 `remote`
- `url`: MCP 伺服器端點 URL

---

## 配置檔案位置

| 工具 | 配置檔案路徑 |
|------|-------------|
| Claude App | `~/.claude/claude_desktop_config.json` |
| Windsurf | `~/.windsurf/config.json` |
| Codex | `~/.codex/config.json` |
| OpenCode | `~/.config/opencode/opencode.jsonc` |

---

## 通用 MCP 配置格式

以下提供三種通用的 MCP 配置格式，適用於不同類型的 MCP 連接方式。

### Stdio 模式

使用 stdio 模式啟動 MCP 伺服器，透過標準輸入輸出進行通訊。

```json
{
  "type": "stdio",
  "env": {
    "IJ_MCP_SERVER_PORT": "64342"
  },
  "command": "C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\jbr\\bin\\java",
  "args": [
    "-classpath",
    "C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\plugins\\mcpserver\\lib\\mcpserver-frontend.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\util-8.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.kotlinx.coroutines.core.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.ktor.client.cio.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.ktor.client.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.ktor.network.tls.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.ktor.io.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.ktor.utils.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.kotlinx.io.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.kotlinx.serialization.core.jar;C:\\Users\\User\\AppData\\Local\\Programs\\WebStorm\\lib\\intellij.libraries.kotlinx.serialization.json.jar",
    "com.intellij.mcpserver.stdio.McpStdioRunnerKt"
  ]
}
```

**配置說明**：
- `type`: 固定為 `stdio`
- `env`: 環境變數，指定 MCP 伺服器端口為 64342
- `command`: Java 執行檔路徑（使用 WebStorm 內建的 JBR）
- `args`: 啟動參數，包含 classpath 和主類別

---

### SSE 模式

使用 SSE (Server-Sent Events) 協議連接 MCP 伺服器。

```json
{
  "type": "sse",
  "url": "http://127.0.0.1:64342/sse",
  "headers": {}
}
```

**配置說明**：
- `type`: 固定為 `sse`
- `url`: MCP 伺服器的 SSE 端點 URL
- `headers`: 自定義 HTTP 標頭（可選）
- 使用 SSE (Server-Sent Events) 協議（已廢棄）

---

### Streamable HTTP 模式

使用 Streamable HTTP 協議連接 MCP 伺服器（推薦）。

```json
{
  "type": "streamable-http",
  "url": "http://127.0.0.1:64342/stream",
  "headers": {}
}
```

**配置說明**：
- `type`: 固定為 `streamable-http`
- `url`: MCP 伺服器的 Streamable HTTP 端點 URL
- `headers`: 自定義 HTTP 標頭（可選）
- 使用 Streamable HTTP 協議（推薦）

### SSE vs Streamable HTTP 比較

| 特性                | SSE (Server-Sent Events)    | Streamable HTTP          |
| ------------------- | --------------------------- | ------------------------ |
| **完整名稱**        | Server-Sent Events          | Streamable HTTP          |
| **MCP 版本**        | 2024-11-05 (已廢棄)         | 2025-03-26 (現為標準)    |
| **客戶端 → 伺服器** | HTTP POST                   | HTTP POST                |
| **伺服器 → 客戶端** | SSE 單向串流                | SSE 雙向串流 / 單次回應  |
| **會話管理**        | 需額外處理                  | 內建會話 ID              |
| **連線穩定性**      | 連線中斷需重新開始          | 支援斷線恢復 (Resumable) |
| **多路復用**        | 不支援                      | 支援多客戶端連線         |
| **單一端點**        | 需要分開的 POST 和 GET 端點 | 單一 MCP 端點            |

> **注意**：MCP (Model Context Protocol) 是一個用於 AI 助手與 其他 AI 助手或 IDE 之間溝通的標準協議。根據 [MCP 官方規範](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)，SSE 傳輸已於 2025-03-26 被 Streamable HTTP 取代。

---

## 故障排除

### 常見問題

| 問題 | 原因 | 解決方式 |
|------|------|----------|
| `Unable to connect` | WebStorm IDE 未啟動 | 使用 CLI 啟動 WebStorm 並開啟專案 |
| `Streamable HTTP session not found` | WebStorm 未開啟專案 | 使用 CLI 重新開啟專案 |
| 連接超時 | 端口被佔用或防火牆阻擋 | 檢查端口 64342 是否可用 |
| Claude App 無法啟動 | Java 路徑錯誤 | 確認 WebStorm JBR 路徑正確 |
| `session-id` 失效 | Stream MCP 連線中斷 | 手動關閉並重新開啟 MCP 連線 |

### 檢查端口是否被佔用

```bash
# Windows
netstat -ano | findstr :64342

# Linux/macOS
lsof -i :64342
```

### 確認 WebStorm MCP 伺服器狀態

請參閱上方的 [驗證 MCP 伺服器狀態](#驗證-mcp-伺服器狀態) 章節。

### 處理 session-id 失效

**解決方式（需手動操作）：**

當 `session-id` 失效導致 Stream MCP 無法使用時，框架應該自動發起新的 initialize 請求，如果無法則**必須由使用者手動處理**：

1. **關閉 MCP 連線** - 請在 Agent 工具（如 OpenCode）中斷開 MCP 連線
2. **重新開啟 MCP 連線** - 手動再次連線 MCP

> ⚠️ 注意：Agent 本身可能無法自動執行此操作，必須由使用者親自關閉/開啟連線。完成後，系統將自動取得新的 `session-id` 並恢復正常運作。

**Fallback 處理：**

如果非 stream 版本的 `webstorm_*` 工具也無法使用，請告知使用者稍後再試，並等待使用者完成重新連線後再繼續執行任務。

---

## 相關資源

- [JetBrains MCP 伺服器](https://github.com/modelcontextprotocol/server-jetbrains)
- [MCP 官方文檔](https://modelcontextprotocol.io/)
- [MCP 傳輸協議規範](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports)
- [OpenCode 官方網站](https://opencode.ai/)
