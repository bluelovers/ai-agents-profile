---
tags:
  - nodejs
  - node_modules
  - pnpm
  - workflow
  - module-resolution
---

# 搜尋 node_modules 中的套件 - 工作流程指南

## 概述

當需要尋找已安裝套件的路徑時，不同的工具和環境會有不同的行為。本文記錄在 Windows 環境下（特别是使用 pnpm 時）搜尋 node_modules 中套件的最佳實踐。

---

## 問題背景

### pnpm 目錄結構特性

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

### 常見問題

使用 OpenCode Glob 工具搜尋時，可能無法找到符號連結指向的套件：
```
// ❌ OpenCode Glob 找不到 pnpm 的符號連結
glob('node_modules/env-bool/**/*')

// ✅ PowerShell Get-ChildItem 找得到
powershell -Command '$p="node_modules"; $f="env-bool"; Get-ChildItem -Path $p -Filter $f | ForEach-Object { Write-Output ("`n" + $_.FullName); Get-ChildItem -Path $_.FullName | ForEach-Object { $s = ""; if($_.PSIsContainer){$s="/"}; "├─ " + $_.Name + $s } }'
```

---

## 搜尋方法與流程

### PowerShell（推薦）

**執行環境**：PowerShell

```powershell
# 搜尋套件目錄
powershell -Command '$p="node_modules"; $f="<pkg>"; Get-ChildItem -Path $p -Filter $f | ForEach-Object { Write-Output ("`n" + $_.FullName); Get-ChildItem -Path $_.FullName | ForEach-Object { $s = ""; if($_.PSIsContainer){$s="/"}; "├─ " + $_.Name + $s } }'
```

**範例**：

指定套件名稱 例如: `env-bool`

```powershell
powershell -Command '$p="node_modules"; $f="env-bool"; Get-ChildItem -Path $p -Filter $f | ForEach-Object { Write-Output ("`n" + $_.FullName); Get-ChildItem -Path $_.FullName | ForEach-Object { $s = ""; if($_.PSIsContainer){$s="/"}; "├─ " + $_.Name + $s } }'
```

模糊搜尋名稱 例如: `*env*`

```powershell
powershell -Command '$p="node_modules"; $f="*env*"; Get-ChildItem -Path $p -Filter $f | ForEach-Object { Write-Output ("`n" + $_.FullName); Get-ChildItem -Path $_.FullName | ForEach-Object { $s = ""; if($_.PSIsContainer){$s="/"}; "├─ " + $_.Name + $s } }'
```

**輸出**：
```
D:\project\node_modules\env-bool
├─ dist/
├─ package.json
├─ src/
```

---

### cmd

**執行環境**：cmd

```cmd
cmd /c "echo %cd%\node_modules\<pkg> & for /f "delims=" %i in ('dir node_modules\<pkg> /b') do @for %j in ("node_modules\<pkg>\%i") do @echo ├─ [%~aj] %i"

cmd /c "dir node_modules\<pkg>"
```

**⚠️ 注意**：此語法需要在 cmd.exe 中執行，PowerShell 無法直接使用 `/s /b` 參數

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

---

### Node.js

**執行環境**：Node.js

```node
# 取得套件入口點路徑
node -e "console.log(require.resolve('<pkg>'))"

# 取得套件根目錄
node -e "console.log(require.resolve('<pkg>/package.json'))"
```

**範例**：
```node
node -e "console.log(require.resolve('env-bool'))"
```

**輸出**：
```
D:\project\node_modules\.pnpm\env-bool@2.0.2\node_modules\env-bool\dist\index.cjs
```

---

### OpenCode Glob 工具（有限制）

**執行環境**：OpenCode 工具

**限制**：當 pnpm 使用符號連結時，OpenCode Glob 工具可能無法正確解析符號連結

```typescript
import { glob } from 'glob';

// 嘗試搜尋（可能失敗）
const files = glob('node_modules/env-bool/**/*')

// 解決方案：搜尋 .pnpm 目錄
const files = glob('node_modules/.pnpm/**/env-bool/**/*')
```

**⚠️ 注意**：這裡的 `glob` 是指 OpenCode 平台提供的 Glob 工具指令，並非 Node.js 的 glob 套件

---

### bash（需要 WSL 或 Git Bash）

**執行環境**：bash（如 WSL、Git Bash、或 Windows 上的 bash 相容環境）

```bash
# 搜尋套件目錄
bash -c "find node_modules -name '<pkg>' -type d"

# 或使用 ls 遞迴
bash -c "ls -d node_modules/*/<pkg>"
```

**範例**：
```bash
bash -c "find node_modules -name 'env-bool' -type d"
bash -c "ls -d node_modules/*/env-bool"
```

**輸出**：
```
node_modules/env-bool
```

**⚠️ 注意**：在 Windows 原生環境下需要安裝 WSL 或 Git Bash 才能使用 bash 指令

---

## 快速查詢表

| 需求 | 命令 |
|------|------|
| 搜尋套件目錄（PowerShell） | `powershell -Command '$p="node_modules"; $f="<pkg>"; Get-ChildItem -Path $p -Filter $f | ForEach-Object { Write-Output ("`n" + $_.FullName); Get-ChildItem -Path $_.FullName | ForEach-Object { $s = ""; if($_.PSIsContainer){$s="/"}; "├─ " + $_.Name + $s } }'` |
| 模糊搜尋（PowerShell） | `powershell -Command '$p="node_modules"; $f="*<關鍵字>*"; Get-ChildItem -Path $p -Filter $f | ForEach-Object { Write-Output ("`n" + $_.FullName); Get-ChildItem -Path $_.FullName | ForEach-Object { $s = ""; if($_.PSIsContainer){$s="/"}; "├─ " + $_.Name + $s } }'` |
| 搜尋套件檔案（cmd） | `cmd /c "dir node_modules\<pkg> /s /b"` |
| 取得入口點（Node.js） | `node -e "console.log(require.resolve('<pkg>'))"` |
| 取得根目錄（Node.js） | `node -e "console.log(require.resolve('<pkg>/package.json'))"` |
| 搜尋套件目錄（bash） | `bash -c "find node_modules -name '<pkg>' -type d"` |

---

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
    └─ 否 → 結束
```

---

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
pnpm list <package>

# 重新安裝
pnpm add <package>
```
