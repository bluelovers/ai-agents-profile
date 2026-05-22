---
name: agent-detect-shell
description: >-
  檢測 AI Agent 運行環境資訊，包括 Shell 類型、平台架構、可用工具等。
  防止 Agent 在未知環境下隨機嘗試指令，減少重複錯誤。
  Use when agents need to
  (1) 檢測運行環境,
  (2) 取得系統資訊,
  (3) 避免重複錯誤嘗試,
  (4) 環境適應性檢查.
tags:
  - environment-detection
  - shell
  - troubleshooting
---

# Agent 環境檢測技能

## 核心目標

當 Agent 發現指令錯誤時，提供冷靜思考與環境判斷的標準流程，避免在未知環境下隨機嘗試指令而導致重複錯誤。

When agents encounter command errors, this skill provides a standard process for calm thinking and environment assessment, avoiding random command attempts and repeated errors in unknown environments.

> **核心原則 / Core Principles**
> - **冷靜思考原則 / Calm Thinking Principle**：錯誤發生時先停止並思考環境狀況
> - **環境檢測優先 / Environment Detection First**：使用檢測工具判斷當前環境
> - **語法適應性 / Syntax Adaptability**：根據 Shell 類型選擇正確語法
> - **終端術語統一 / Terminal Terminology Unification**：理解不同終端術語可能指相同概念

---

## 問題情境：指令錯誤的處理流程

### 錯誤發生時的標準處理步驟

當 Agent 執行指令失敗時，應遵循以下思考流程：

```
指令執行失敗
    │
    ▼
1. 冷靜停止 - 不要立即重試
    │
    ▼
2. 思考環境判斷
    │   ├─ 我現在處於什麼終端環境？
    │   ├─ 這個環境支援什麼語法？
    │   └─ 我是不是用了錯誤的語法？
    │
    ▼
3. 使用環境檢測技能
    │
    ▼
4. 根據檢測結果調整指令
    │
    ▼
5. 重新執行修正後的指令
```

### 檢測後的執行準則

當成功檢測並確認當前環境後，請直接使用該環境原生支援的語法執行指令，避免不必要的 Shell 巢狀呼叫：

- **若是 PowerShell 環境**：不應該使用 `powershell -Command` 或 `pwsh -c` 等指令來包裝執行，請直接執行您的命令。
- **若是 CMD 環境**：不應該使用 `cmd /c` 或 `cmd /k` 等指令來包裝執行，請直接執行您的命令。

> **例外情況**：除非有明確的特殊意圖或必須如此做的技術理由，否則請遵守此準則以減少變數解析或引號轉義所導致的錯誤。


---

## 快速使用

### 自動檢測指令

**重要提醒：試圖分析 agent-detect-shell 腳本內容來偵測所在終端的內容是沒有意義的，因為一旦在腳本內執行就必定是錯誤的結果。此偵測指令只適用於直接輸入於終端執行。**

#### 選項 1：最簡易版（無需 Node.js/Bun）

```bash
( (echo %COMSPEC% | findstr /I "cmd.exe" >nul 2>&1 && echo CMD=%COMSPEC%) || (echo $PSHOME | findstr /I "PowerShell" >nul 2>&1 && echo PowerShell=$PSHOME) || echo Bash=$0 )
```

#### 選項 2：使用 Node.js 時

```bash
( (echo %COMSPEC% | findstr /I "cmd.exe" >nul 2>&1 && node agent-detect-shell CMD=%COMSPEC%) || (echo $PSHOME | findstr /I "PowerShell" >nul 2>&1 && node agent-detect-shell PowerShell=$PSHOME) || node agent-detect-shell Bash=$0 )
```

如果不支援自動偵測 skill 下的 [agent-detect-shell](./agent-detect-shell.js) 腳本路徑，請使用絕對路徑來呼叫：

> **重要說明**：每個人對於此技能的安裝位置都有可能不同。

```bash
# 完整路徑範例（請根據實際安裝路徑調整）
( (echo %COMSPEC% | findstr /I "cmd.exe" >nul 2>&1 && node "<偵測腳本的目錄路徑>/agent-detect-shell.js" CMD=%COMSPEC%) || (echo $PSHOME | findstr /I "PowerShell" >nul 2>&1 && node "<偵測腳本的目錄路徑>/agent-detect-shell.js" PowerShell=$PSHOME) || node "<偵測腳本的目錄路徑>/agent-detect-shell.js" Bash=$0 )
```

> **如何使用完整路徑範例**：
> 1. 將 `<偵測腳本的目錄路徑>/agent-detect-shell.js` 替換為您的實際安裝路徑 （例如：`D:/Users/WebstormProjects/ai-agent/ai-agents-profile/skills/agent-detect-shell/agent-detect-shell.js`）
> 2. 確保路徑指向正確的 `agent-detect-shell.js` 檔案
> 3. 在終端中直接執行完整指令

> **注意：更改任何內容都會失效，請確保路徑正確且檔案存在。**

#### 選項 3：使用 Bun 時

```bash
# 完整路徑範例（請根據實際安裝路徑調整）
( (echo %COMSPEC% | findstr /I "cmd.exe" >nul 2>&1 && bun "<偵測腳本的目錄路徑>/agent-detect-shell.js" CMD=%COMSPEC%) || (echo $PSHOME | findstr /I "PowerShell" >nul 2>&1 && bun "<偵測腳本的目錄路徑>/agent-detect-shell.js" PowerShell=$PSHOME) || bun "<偵測腳本的目錄路徑>/agent-detect-shell.js" Bash=$0 )
```

### 輸出範例

#### PowerShell 環境
```json
{
  "shell": "PowerShell=C:\\Program Files\\WindowsApps\\Microsoft.PowerShell_7.6.1.0_x64__8wekyb3d8bbwe",
  "cwd": "D:/Users/WebstormProjects/wifi-free-map/",
  "platform": "win32 (Windows_NT)",
  "arch": "x64",
  "node": "v24.3.0",
  "uv": "uv 0.10.7 (08ab1a344 2026-02-27)",
  "python": "Python 3.13.12"
}
```

#### Bash 環境（如 WSL 或 Git Bash 或 Unix-like 系統的 Shell）
```json
{
  "shell": "Bash=D:/msys64/usr/bin/bash",
  "cwd": "~/game/Hall-of-Fame",
  "platform": "win32 (Windows_NT)",
  "arch": "x64",
  "node": "v24.14.0",
  "uv": "uv 0.10.7 (08ab1a344 2026-02-27)",
  "python": "Python 3.13.12"
}
```

#### CMD 環境（Windows 命令提示字元）
```json
{
  "shell": "CMD=C:\\WINDOWS\\system32\\cmd.exe",
  "cwd": "D:\\Users\\WebstormProjects\\ai-agent\\ai-agents-profile\\skills\\agent-detect-shell",
  "platform": "win32 (Windows_NT)",
  "arch": "x64",
  "node": "v24.3.0",
  "uv": "uv 0.10.7 (08ab1a344 2026-02-27)",
  "python": "Python 3.13.12"
}
```

---

## 檢測輸出說明

### Shell 檢測邏檢測邏輯

腳本會根據環境變數自動檢測 Shell 類型：

| 檢測條件 | Shell 類型 |
|---------|-----------|
| `%COMSPEC%` 包含 "cmd.exe" | CMD |
| `$PSHOME` 存在且包含 "PowerShell" | PowerShell |
| 其他情況 | Bash |

### 輸出資訊

腳本輸出 JSON 格式，包含以下資訊：

| 欄位 | 說明 |
|------|------|
| `shell` | Shell 類型（CMD、PowerShell、Bash） |
| `cwd` | 目前工作目錄 |
| `platform` | 系統平台和類型 |
| `arch` | CPU 架構 |
| `node` | Node.js 版本 |
| `uv` | uv 套件管理器版本（如果存在） |
| `python` | Python 版本（如果存在） |

---

## 使用場景

### 1. 環境適應性檢查

當 Agent 需要在不同環境中執行指令時

### 3. 錯誤預防

避免在不支援的環境中執行指令

---

## 最佳實踐

### 1. 環境快取

檢測結果可以快取以避免重複檢測，提升效能。

### 2. 錯誤處理

在檢測失敗時應有謹慎的思考策略。

### 3. 條件執行

根據檢測結果選擇適當的指令和工具。

---

## 故障排除

### 終端術語對應關係

不同使用者可能使用不同的術語描述相同的環境：

| 使用者術語 / User Term | 可能對應 / Possible Mapping | 說明 / Description |
|---------------------|---------------------------|---------------------|
| 指令 / Command | 終端 / Terminal | 命令列介面的通稱 |
| 終端 / Terminal | 命令提示字元 / Command Prompt | Windows 的命令列環境 |
| bash / CLI | 命令列 / Command Line | Unix-like 系統的 Shell |
| 命令行 / Command Line | PowerShell / CMD | Windows 的具體 Shell 實作 |

> **補充說明**：這些術語全部可能是指 Windows 的命令列環境、Unix-like 系統的 Shell、或 Windows 的具體 Shell 實作。

### 常見問題

1. **檢測失敗**
   - 確認 Node.js/Bun 已正確安裝
   - 檢查執行權限

> **重要處理原則**：檢測失敗時就直接以最簡單的指令來執行，除非後續的任務需要 Node.js/Bun，否則不需要再考慮偵測 Node.js/Bun。

---

## 相關資源

- [Agent Script Execution Path Rules](../agent-script-execution/SKILL.md) - 腳本執行路徑與工作目錄規範

---
