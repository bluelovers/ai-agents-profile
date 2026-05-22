---
tags:
  - obsidian
  - mcp
  - configuration
  - setup
  - documentation/references
---

# Obsidian MCP 配置

## 前置準備

### 1. 安裝 Obsidian Local REST API 插件

1. 在 Obsidian 中開啟 **Settings** → **Community plugins**
2. 搜尋並安裝 **Local REST API**
3. 啟用插件並取得 API Key

### 2. 系統環境變數設定

在系統中設定以下環境變數：

```bash
# Windows (PowerShell)
$env:OBSIDIAN_API_KEY="<your_api_key_here>"
$env:OBSIDIAN_HOST="<your_obsidian_host>"  # 預設: localhost
$env:OBSIDIAN_PORT="<your_obsidian_port>"    # 預設: 27777
```

```bash
# Linux/macOS
export OBSIDIAN_API_KEY="<your_api_key_here>"
export OBSIDIAN_HOST="<your_obsidian_host>"
export OBSIDIAN_PORT="<your_obsidian_port>"
```

---

## 各工具配置

### Claude App

```json
{
  "mcpServers": {
    "mcp-obsidian": {
      "command": "uvx",
      "args": [
        "mcp-obsidian"
      ],
      "env": {
        "OBSIDIAN_API_KEY": "<your_api_key_here>",
        "OBSIDIAN_HOST": "<your_obsidian_host>",
        "OBSIDIAN_PORT": "<your_obsidian_port>"
      }
    }
  }
}
```

### OpenCode

```json
{
  "mcp": {
    "mcp-obsidian": {
      "type": "local",
      "command": [
        "uvx",
        "mcp-obsidian"
      ]
    }
  }
}
```

### Windsurf

```json
{
  "mcpServers": {
    "mcp-obsidian": {
      "command": "uvx",
      "args": ["mcp-obsidian"],
      "env": {
        "OBSIDIAN_API_KEY": "<your_api_key_here>",
        "OBSIDIAN_HOST": "<your_obsidian_host>",
        "OBSIDIAN_PORT": "<your_obsidian_port>"
      }
    }
  }
}
```

---

## 環境變數說明

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `OBSIDIAN_API_KEY` | Local REST API 的金鑰 | 無 |
| `OBSIDIAN_HOST` | Obsidian 伺服器主機 | `localhost` |
| `OBSIDIAN_PORT` | Local REST API 埠號 | `27777` |

---

## 驗證連線

配置完成後，可透過以下方式驗證 MCP 是否正常運作：

1. 確保 Obsidian 正在執行
2. 確保 Local REST API 插件已啟用
3. 嘗試執行 MCP 指令讀取檔案