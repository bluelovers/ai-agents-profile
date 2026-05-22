---
name: opencode-tool-guides
description: 清楚解釋 OpenCode 平台工具的使用方法，幫助開發者了解如何在不同情境下選擇並使用正確的工具。Use when users request (1) 如何使用 OpenCode 工具, (2) OpenCode 工具教學, (3) 工具功能比較, (4) read/glob/grep 使用指南, (5) OpenCode tool usage guide.
tags:
  - opencode
  - agents/tools
  - agents/guidelines
  - read
  - glob
  - grep
  - agents/skills
---

# OpenCode 工具使用指南

**核心要點**: 根據任務需求選擇最適合的工具

---

## 工具總覽

| 工具 | 一句話說明 | 核心參數 |
|------|-----------|---------|
| **read** | 「我要看這個檔案/目錄的內容」 | `filePath`, `offset`, `limit` |
| **glob** | 「我要找符合這個模式的所有檔案」 | `pattern`, `path` |
| **grep** | 「我要找包含這個關鍵字的所有內容」 | `pattern`, `path`, `include` |
| **write** | 「我要建立這個檔案並寫入內容」 | `filePath`, `content` |
| **bash** | 「我要執行系統命令」 | `command`, `cwd` |

### 快速選擇流程

```
需要什麼操作？
    │
    ├── 讀取檔案/目錄內容？  → read
    ├── 搜尋檔案路徑？       → glob
    ├── 搜尋檔案內容？       → grep
    ├── 建立檔案+寫入內容？   → write
    └── 刪除檔案/資料夾？     → bash
```

---

## read 工具

**用途**: 讀取檔案內容或列出目錄

```typescript
// 讀取檔案內容
read({ filePath: "D:/project/package.json", limit: 10 })

// 分頁讀取
read({ filePath: "D:/project/src/index.ts", offset: 100, limit: 50 })

// 列出目錄
read({ filePath: "D:/project/src" })
```

**限制**: 單次最多 2000 行，超長行會截斷

---

## glob 工具

**用途**: 搜尋符合 Glob 模式的檔案路徑

```typescript
// 搜尋單一目錄
glob({ path: "D:/project/src", pattern: "*.ts" })

// 遞迴搜尋
glob({ pattern: "src/**/*.ts" })

// 多目錄多副檔名
glob({ pattern: "{src,test,lib}/**/*.{ts,tsx}" })

// 排除檔案
glob({ pattern: "!test.ts" })
```

**Glob 模式**: `*` 單層匹配, `**` 任意層級, `{a,b}` 多選, `!` 排除

**限制**: 會遞迴搜尋，無法只列出第一層

---

## grep 工具

**用途**: 搜尋檔案內容（支援正規表達式）

```typescript
// 基本搜尋
grep({ path: "D:/project/src", pattern: "TODO" })

// 正規表達式
grep({ pattern: "TODO|FIXME" })

// 過濾檔案類型
grep({ pattern: "function", include: "*.ts" })
```

**限制**: 無法單獨列出目錄

---

## write 工具

**用途**: 建立檔案並寫入內容

**關鍵特性**: 會自動建立所有不存在的父目錄

```typescript
// 自動建立多層目錄並寫入檔案
write({
  filePath: "D:/project/docs/api/readme.md",
  content: "# API 文件"
})
```

**限制**: 無法刪除檔案

---

## bash 工具

**用途**: 執行系統命令

```typescript
// 建立空目錄
bash({ command: "mkdir -p docs/api" })
```

**使用建議**: 建立檔案請用 **write**

---

## 情境對照表

| 任務情境 | 推薦工具 | 原因 |
|---------|---------|------|
| 列出目錄內容 | **read** | 專門設計用於讀取目錄結構 |
| 讀取檔案內容 | **read** | 直接讀取檔案內容 |
| 搜尋特定檔案 | **glob** | Glob 模式最適合檔案路徑匹配 |
| 搜尋檔案內容關鍵字 | **grep** | 專為內容搜尋設計 |
| 讀取大檔案的一部分 | **read** | offset + limit 可精確控制範圍 |
| 找出所有測試檔案 | **glob** | `*.{test,spec}.ts` 模式最方便 |
| 尋找程式碼中的 TODO | **grep** | 可搜尋內容並顯示行號 |
| 建立檔案並寫入內容 | **write** | 自動建立父目錄，一鍵完成 |
| 只建立空資料夾 | **bash** | `mkdir -p` 語法簡潔 |

## 常見錯誤

| 錯誤 | 說明 | 正確做法 |
|------|------|---------|
| `glob({ pattern: "*" })` 列出目錄 | glob 會遞迴搜尋所有檔案 | 使用 `read({ filePath: "..." })` |
| `glob({ pattern: "**/*TODO*" })` 搜尋內容 | glob 無法搜尋檔案內容 | 使用 `grep({ pattern: "TODO" })` |
| 先 `mkdir` 再 `write` | write 會自動建立目錄 | 直接使用 `write` |

## 參考文件

📄 **[tools-compare-read-glob-grep.md](./references/tools-compare-read-glob-grep.md)** - read、glob、grep 詳細比較
📄 **[tools-compare-write-bash.md](./references/tools-compare-write-bash.md)** - write、bash 建立檔案/資料夾比較
