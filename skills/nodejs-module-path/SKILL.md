---
name: nodejs-module-path
description: 取得 node_modules 中已安裝的 Node.js 模組路徑。當需要 (1) 查找已安裝模組的位置，(2) 取得 package.json 路徑，(3) 解析模組入口點，(4) 在 pnpm Yarn 環境下搜尋套件時使用此技能。此技能支援 PowerShell、cmd、Node.js 和 bash 等多種方法來搜尋 node_modules 中的套件路徑。/ Get installed Node.js module paths in node_modules. Use when (1) Finding installed module locations, (2) Getting package.json path, (3) Resolving module entry point, (4) Searching packages in pnpm Yarn environments. Supports PowerShell, cmd, Node.js and bash methods.
tags:
  - nodejs
  - module-resolution
  - npm
  - pnpm
  - yarn
  - path
---

# Node.js Module Path

取得 node_modules 中已安裝模組的路徑 / Get installed module paths in node_modules

## 概述 / Overview

本技能提供多種方法來取得 Node.js 專案中已安裝模組的路徑，適用於不同環境（npm、pnpm、Yarn）和不同工具需求。

## 使用時機

- 查找已安裝套件的位置
- 取得 package.json 路徑
- 解析模組入口點
- 在 pnpm 符號連結環境下搜尋套件

## 環境差異

### pnpm 目錄結構

pnpm 使用獨特的目錄結構：
- **真實檔案**位於 `.pnpm/` 目錄下
- `node_modules/` 中的套件是**符號連結**（symbolic link）

```
node_modules/
├── env-bool → .pnpm/env-bool@2.0.2/node_modules/env-bool
└── .pnpm/
    └── env-bool@2.0.2/
        └── node_modules/
            └── env-bool/
```

### 解決方案

當 OpenCode Glob 工具無法找到 pnpm 的符號連結時：
1. 使用 PowerShell 指令
2. 使用 Node.js `require.resolve()`
3. 或直接搜尋 `.pnpm/` 目錄

## 使用方法

### 方法一：PowerShell（推薦）

**執行環境**：PowerShell

#### 1. 精確搜尋套件目錄

```powershell
powershell -Command '$p="node_modules"; $f="<pkg>"; Get-ChildItem -Path $p -Filter $f -ErrorAction SilentlyContinue | ForEach-Object { Write-Output ("`n" + $_.FullName); Get-ChildItem -Path $_.FullName -ErrorAction SilentlyContinue | ForEach-Object { $s = ""; if($_.PSIsContainer){$s="/"}; "├─ " + $_.Name + $s } }'
```

**範例**（查詢 env-bool）：
```powershell
powershell -Command '$p="node_modules"; $f="env-bool"; Get-ChildItem -Path $p -Filter $f -ErrorAction SilentlyContinue | ForEach-Object { Write-Output ("`n" + $_.FullName); Get-ChildItem -Path $_.FullName -ErrorAction SilentlyContinue | ForEach-Object { $s = ""; if($_.PSIsContainer){$s="/"}; "├─ " + $_.Name + $s } }'
```

**輸出**：
```
D:\project\node_modules\env-bool
├─ dist/
├─ package.json
├─ src/
```

#### 2. 模糊搜尋（關鍵字）

```powershell
powershell -Command '$p="node_modules"; $f="*<關鍵字>*"; Get-ChildItem -Path $p -Filter $f -ErrorAction SilentlyContinue | ForEach-Object { Write-Output ("`n" + $_.FullName); Get-ChildItem -Path $_.FullName -ErrorAction SilentlyContinue | ForEach-Object { $s = ""; if($_.PSIsContainer){$s="/"}; "├─ " + $_.Name + $s } }'
```

**範例**（搜尋包含 env 的套件）：
```powershell
powershell -Command '$p="node_modules"; $f="*env*"; Get-ChildItem -Path $p -Filter $f -ErrorAction SilentlyContinue | ForEach-Object { Write-Output ("`n" + $_.FullName); Get-ChildItem -Path $_.FullName -ErrorAction SilentlyContinue | ForEach-Object { $s = ""; if($_.PSIsContainer){$s="/"}; "├─ " + $_.Name + $s } }'
```

### 方法二：cmd

**執行環境**：cmd.exe

#### 1. 搜尋套件並顯示檔案

```cmd
cmd /c "echo %cd%\node_modules\<pkg> & for /f "delims=" %i in ('dir node_modules\<pkg> /b') do @for %j in ("node_modules\<pkg>\%i") do @echo ├─ [%~aj] %i"
```

**範例**：
```cmd
cmd /c "echo %cd%\node_modules\env-bool & for /f "delims=" %i in ('dir node_modules\env-bool /b') do @for %j in ("node_modules\env-bool\%i") do @echo ├─ [%~aj] %i"
```

**輸出**：
```
D:\Users\WebstormProjects\nodejs-yarn\jest-plugin-fixme-suite\node_modules\env-bool 
├─ [--a--------] CHANGELOG.md
├─ [d----------] dist
├─ [--a--------] package.json
├─ [--a--------] README.md
├─ [d----------] src
```

#### 2. 簡單搜尋

```cmd
cmd /c "dir node_modules\<pkg>"
```

**範例**：
```cmd
cmd /c "dir node_modules\env-bool"
```

**輸出**：
```
D:\Users\WebstormProjects\nodejs-yarn\jest-plugin-fixme-suite\node_modules\env-bool 的目錄

2026/04/09  下午 01:49    <DIR>          .
2026/04/09  下午 01:49    <DIR>          ..
2026/04/09  下午 01:49             1,406 CHANGELOG.md
2026/04/09  下午 01:49             3,804 package.json
2026/04/09  下午 01:49             4,580 README.md
2026/04/09  下午 01:49             1 <DIR>          dist
2026/04/09  下午 01:49             1 <DIR>          src
               3 個檔案           9,790 位元組
               4 個目錄  1,539,959,083,008 位元組可用
```

#### 3. 遞迴搜尋

```cmd
cmd /c "dir node_modules\<pkg> /s /b"
```

### 方法三：Node.js require.resolve()

**執行環境**：Node.js

#### 1. 取得入口點

```bash
node -e "console.log(require.resolve('<pkg>'))"
```

**範例**：
```bash
node -e "console.log(require.resolve('env-bool'))"
```

**輸出**：
```
D:\project\node_modules\.pnpm\env-bool@2.0.2\node_modules\env-bool\dist\index.cjs
```

#### 2. 取得 package.json 路徑

```bash
node -e "console.log(require.resolve('<pkg>/package.json'))"
```

### 方法四：bash

**執行環境**：bash（WSL、Git Bash）

#### 1. find 搜尋

```bash
bash -c "find node_modules -name '<pkg>' -type d"
```

**範例**：
```bash
bash -c "find node_modules -name 'env-bool' -type d"
```

**輸出**：
```
node_modules/env-bool
```

#### 2. ls 搜尋

```bash
bash -c "ls -d node_modules/*/<pkg>"
```

**範例**：
```bash
bash -c "ls -d node_modules/*/env-bool"
```

## 快速查詢表

| 需求 | 方法 | 命令 |
|------|------|------|
| 搜尋套件目錄 | PowerShell | `powershell -Command '$p="node_modules"; $f="<pkg>"; Get-ChildItem -Path $p -Filter $f'` |
| 模糊搜尋 | PowerShell | `powershell -Command '$p="node_modules"; $f="*env*"; Get-ChildItem -Path $p -Filter $f'` |
| 搜尋套件並顯示檔案 | cmd | `cmd /c "dir node_modules\<pkg>"` |
| 遞迴搜尋 | cmd | `cmd /c "dir node_modules\<pkg> /s /b"` |
| 取得入口點 | Node.js | `node -e "console.log(require.resolve('<pkg>'))"` |
| 取得 package.json | Node.js | `node -e "console.log(require.resolve('<pkg>/package.json'))"` |
| 搜尋目錄 | bash | `bash -c "find node_modules -name '<pkg>' -type d"` |

## 搜尋流程決策樹

```
需要搜尋 node_modules 中的套件？
    │
    ├─ 是 → 使用 PowerShell？（推薦）
    │         │
    │         ├─ 是 → powershell 指令
    │         │
    │         └─ 否 → 使用 cmd？
    │                   │
    │                   ├─ 是 → cmd 指令
    │                   │
    │                   └─ 否 → 使用 bash？
    │                             │
    │                             ├─ 是 → bash 指令
    │                             │
    │                             └─ 否 → node 指令
    │
    └─ 否 �� 結束
```

## 常見錯誤排除

### OpenCode Glob 找不到 pnpm 套件

**原因**：OpenCode Glob 工具無法處理 pnpm 的符號連結結構

**解決方案**：
1. 使用 PowerShell 指令
2. 使用 Node.js `require.resolve()`
3. 或直接搜尋 `.pnpm/` 目錄

### require() 找不到模組

**原因**：套件未正確安裝或路徑錯誤

**解決方案**：
```bash
# 檢查是否已安裝
pnpm list <套件名稱>

# 重新安裝
pnpm add <套件名稱>
```

## 詳細參考

完整的搜尋方法與流程請參考：
- [搜尋 node_modules 工作流程](references/search-node-modules-workflow.md)