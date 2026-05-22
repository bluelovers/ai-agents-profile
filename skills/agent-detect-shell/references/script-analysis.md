---
tags:
  - reference
  - script-analysis
  - implementation
---

# agent-detect-shell.js 腳本分析報告

## 概述

本文檔詳細分析 `agent-detect-shell.js` 的實作細節，供開發者參考。Agent 使用者無需理解這些實作細節。

## 腳本結構

### 主要函式

#### `detectLazy(list, argv = '--version')`
- **用途**: 惰性檢測工具，按順序嘗試執行指令
- **參數**:
  - `list`: 指令列表或函數列表
  - `argv`: 指令參數（預設 '--version'）
- **返回**: 第一個成功執行的結果，或 undefined

#### 檢測邏輯
1. 嘗試執行列表中的每個指令
2. 如果執行成功（返回碼為 0），返回結果
3. 如果失敗，繼續下一個指令
4. 所有指令都失敗，返回 undefined

### 檢測項目

#### 基本環境資訊
- `shell`: 從命令列參數取得的 Shell 類型
- `cwd`: 目前工作目錄 (`process.cwd()`)
- `platform`: 平台資訊 (`os.platform()` + `os.type()`)
- `arch`: CPU 架構 (`os.arch()`)
- `node`: Node.js 版本 (`process.version`)

#### 工具檢測
- `uv`: Python 套件管理器
- `python`: Python 直譯器（支援多種檢測方式）

## 輸出格式

腳本輸出 JSON 格式，包含以下欄位：

```json
{
  "shell": "Shell 類型",
  "cwd": "目前工作目錄",
  "platform": "平台資訊",
  "arch": "CPU 架構",
  "node": "Node.js 版本",
  "uv": "uv 版本（如果存在）",
  "python": "Python 版本（如果存在）"
}
```

## 實作細節

### Python 檢測策略
1. 優先使用 `uv run python`（如果 uv 存在）
2. 嘗試 `python` 指令
3. 嘗試 `python3` 指令

### 錯誤處理
- 所有檢測都包裝在 try-catch 中
- 失敗的檢測會被忽略，不影響其他檢測
- 未檢測到的工具在輸出中為 undefined

### 依賴項目
- Node.js 內建模組：`os`, `child_process`
- 無外部依賴

## 使用場景

### 命令列使用
```bash
node agent-detect-shell.js PowerShell
```

### 自動檢測指令
```bash
( (echo %COMSPEC% | findstr /I "cmd.exe" >nul 2>&1 && node agent-detect-shell CMD=%COMSPEC%) || (echo $PSHOME | findstr /I "PowerShell" >nul 2>&1 && node agent-detect-shell PowerShell=$PSHOME) || node agent-detect-shell Bash=$0 )
```

## 擴展可能性

### 可新增的檢測項目
- 更多套件管理器（npm, pip, poetry 等）
- 開發工具（git, docker 等）
- 編譯器（gcc, clang 等）
- 系統資源（記憶體, CPU 等）

### 平台特定檢測
- Windows: WSL, Chocolatey, Scoop
- macOS: Homebrew, MacPorts
- Linux: apt, yum, dnf

## 效能考量

- 檢測是同步執行，可能會有短暫延遲
- 每個工具檢測都有 5 秒超時（在 Python 版本中）
- 建議快取檢測結果以避免重複執行

---

*此文檔僅供開發者參考，Agent 使用者應專注於 SKILL.md 中的使用說明。*
