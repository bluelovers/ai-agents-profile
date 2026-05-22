---
tags:
  - opencode
  - agents/tools
  - read
  - glob
  - grep
  - comparison
  - documentation/references
---

# read、glob、grep 工具功能比較

本文比較 OpenCode 平臺上三個常用的檔案操作工具，幫助開發者根據不同情境選擇適合的工具。

## 工具基本功能

| 功能 | read | glob | grep |
|------|------|------|------|
| 讀取檔案內容 | ✅ | ❌ | ❌ |
| 讀取目錄列表 | ✅ | ❌ | ❌ |
| 搜尋檔案路徑 | ❌ | ✅ | ❌ |
| 搜尋檔案內容 | ❌ | ❌ | ✅ |
| 分頁讀取 | ✅ | ❌ | ❌ |
| 讀取圖片/PDF | ✅ | ❌ | ❌ |

## 進階功能

| 功能 | read | glob | grep |
|------|------|------|------|
| 遞迴搜尋 | - | ✅ | ✅ |
| 正規表達式 | ❌ | ⚠️ 部分 | ✅ 完整 |
| Glob 模式 (`*`, `**`) | ❌ | ✅ | ❌ |
| 過濾副檔名 | ❌ | ⚠️ 在 pattern 中 | ⚠️ 在 include 中 |
| 回傳行號 | ❌ | ❌ | ✅ |
| 排序檔案 | - | ✅ (依修改時間) | ❌ |
| 排除檔案 (`!`) | ❌ | ⚠️ 否定模式 | ❌ |

## 功能對照表：哪些能做到相同結果？

### 情境：列出目錄內容

| 工具 | 能否達成 | 說明 |
|------|---------|------|
| **read** | ✅ 可以 | 直接列出目錄內容 |
| **glob** | ❌ 不行 | 設計用於搜尋檔案，無法只列出目錄 |
| **grep** | ❌ 不行 | 用於搜尋內容，非目錄 |

### 情境：搜尋特定副檔名的檔案

| 工具 | 能否達成 | 說明 |
|------|---------|------|
| **read** | ❌ 不行 | 只能讀取，無法搜尋 |
| **glob** | ✅ 可以 | 使用 `{src,lib,test}/**/*.{test,spec}.ts` 同時搜尋 src、lib、test 三個目錄下的測試檔案 |
| **grep** | ⚠️ 可以但沒效率 | 需搜尋內容，較沒效率 |

### 情境：搜尋含有關鍵字的檔案

| 工具 | 能否達成 | 說明 |
|------|---------|------|
| **read** | ❌ 不行 | 只能讀取，無法搜尋 |
| **glob** | ❌ 不行 | 只能搜尋路徑，無法搜尋內容 |
| **grep** | ✅ 可以 | 直接搜尋檔案內容 |

### 情境：讀取特定行範圍

| 工具 | 能否達成 | 說明 |
|------|---------|------|
| **read** | ✅ 可以 | 使用 offset 和 limit 參數 |
| **glob** | ❌ 不行 | 無法讀取內容 |
| **grep** | ❌ 不行 | 無法讀取內容 |

### 情境：統計匹配數量

| 工具 | 能否達成 | 說明 |
|------|---------|------|
| **read** | ❌ 不行 | 無法搜尋 |
| **glob** | ❌ 不行 | 無法搜尋內容 |
| **grep** | ⚠️ 可以 | 需搭配 bash 命令 `rg` 計算 |

## 參數對照

### read

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| filePath | string | ✅ | 檔案或目錄的絕對路徑 |
| limit | number | - | 最多讀取的行數（預設 2000） |
| offset | number | - | 開始讀取的行號（從 1 開始） |

### glob

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| path | string | - | 搜尋目錄（預設目前目錄） |
| pattern | string | ✅ | Glob 模式 |

### grep

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| path | string | - | 搜尋目錄（預設目前目錄） |
| pattern | string | ✅ | 正規表達式 |
| include | string | - | 檔案過濾模式（例如 `*.ts`） |

## 使用情境選擇指南

| 情境 | 推薦工具 |
|------|---------|
| 列出目錄內容 | **read** |
| 讀取檔案內容 | **read** |
| 分頁讀取長檔案 | **read** |
| 搜尋符合 Glob 模式的檔案 | **glob** |
| 搜尋包含關鍵字的內容 | **grep** |
| 取得特定類型的所有檔案 | **glob** |
| 搜尋並取得行號 | **grep** |

## 限制

### read

- 單次最多回傳 2000 行
- 超過 2000 字元的單行會被截斷

### glob

- 會遞迴搜尋所有子目錄，難以限制只在第一層
- 設計用於搜尋檔案路徑，無法讀取目錄列表

### grep

- 用於搜尋檔案內容，無法單獨列出目錄
- 需要搭配其他工具（如 bash）才能統計數量

## 驗證結果

以下為實際測試驗證各項功能描述的結果：

### 驗證通過項目

| 驗證項目 | 測試命令 | 結果 |
|---------|---------|------|
| read 可讀取檔案內容 | `read({ filePath: "package.json", limit: 10 })` | ✅ 通過 |
| read 可讀取目錄列表 | `read({ filePath: "src" })` | ✅ 通過 |
| glob 可搜尋多副檔名和多目錄 | `glob({ pattern: "{src,lib,test}/**/*.{test,spec}.ts" })` | ✅ 語法正確 |
| grep 支援多副檔名 | `grep({ include: "*.{test,spec}.ts", pattern: "TODO" })` | ✅ 通過 (找到 1 個匹配) |
| grep 可搜尋檔案內容 | `grep({ path: "src", pattern: "TODO" })` | ✅ 通過 |
| read 可分頁讀取 | `read({ filePath: "package.json", offset: 115, limit: 5 })` | ✅ 通過 |
| glob 支援 Glob 模式 | `glob({ path: "src/config", pattern: "*.ts" })` | ✅ 通過 |
| grep 支援 include 過濾 | `grep({ path: "src/config", pattern: "TODO", include: "*.ts" })` | ✅ 通過 |
| grep 支援正規表達式 | `grep({ path: "src/config", pattern: "TODO\|FIXME" })` | ✅ 通過 |
| read 限制最多行數 | `read({ filePath: "package.json", limit: 2500 })` | ✅ 通過 (顯示總行數) |
| glob 無法只列出第一層 | `glob({ path: "node_modules", pattern: "*" })` | ✅ 通過 (遞迴搜尋) |
| glob 排除單一檔案 | `glob({ path: "src/types", pattern: "!enums.ts" })` | ✅ 排除 1 個檔案 |
| glob 排除多個檔案 | `glob({ path: "src/types", pattern: "!{enums.ts,regexp.ts}" })` | ✅ 排除 2 個檔案 |
| glob 遞迴排除 | `glob({ path: "src/types", pattern: "!**/enum-*.ts" })` | ✅ 排除 3 個檔案 |
| 分號和逗號排除 | `*,enums.ts` 或 `!types-*.ts;types*.ts` | ❌ 不支援 |

## 結果呈現方式

### read 讀取檔案

```
<path>D:\Users\...\package.json</path>
<type>file</type>
<content>
1: {
2:   "name": "@bluelovers/opencode-arise",
3:   "version": "0.1.37",
...
</content>
```

- 每行前面加上行號 (1:, 2:, 3:)
- 使用 `offset` 和 `limit` 控制範圍

### read 讀取目錄

```
<path>D:\Users\...\src</path>
<type>directory</type>
<entries>
agents/
build.test.ts
cli/
config/
...
</entries>
```

- 每行一個項目
- 子目錄有 `/` 尾綴

### glob 搜尋結果

```
D:\Users\...\src\integration.test.ts
D:\Users\...\src\index.test.ts
D:\Users\...\src\build.test.ts
...
```

- 回傳完整檔案路徑
- 依照修改時間排序

### grep 搜尋結果

```
Found 73 matches
D:\Users\...\src\agents\lib\__snapshots__\prompts.test.ts.snap:
  Line 711: ## TODO List Management
  Line 713: ⚠️ IMPORTANT: ALWAYS create a TODO list...
```

- 首先顯示匹配總數
- 顯示檔名和行號
- 顯示該行內容

## 實用範例

### 範例 1：列出專案目錄結構

```typescript
// ✅ read 最適合
read({ filePath: "D:/project/src" })

// ❌ glob 無法達成相同結果
glob({ path: "src", pattern: "*" }) // 會遞迴搜尋所有檔案
```

### 範例 2：找出所有測試檔案

```typescript
// ✅ glob 最適合 - 同時搜尋多目錄和多副檔名
glob({ pattern: "{src,lib,test}/**/*.{test,spec}.ts" })

// ⚠️ grep 可做到但較沒效率
grep({ path: "src", pattern: ".", include: "*.{test,spec}.ts" })
```

### 範例 3：在程式碼中搜尋 TODO 標記

```typescript
// ✅ grep 最適合
grep({ path: "src", pattern: "TODO|FIXME" })
```

### 範例 4：讀取大檔案的特定範圍

```typescript
// ✅ read 可精確控制範圍
read({ filePath: "src/index.ts", offset: 100, limit: 50 })
```

### 範例 5：排除特定檔案

```typescript
// ✅ glob 排除根目錄中的單一檔案
glob({ path: "src/types", pattern: "!enums.ts" })

// ✅ glob 排除根目錄中的多個檔案
glob({ path: "src/types", pattern: "!{enums.ts,regexp.ts}" })

// ✅ glob 遞迴排除所有子目錄中匹配的檔案
glob({ path: "src/types", pattern: "!**/enum-*.ts" })

// ❌ 分號和逗號不支援排除語法
glob({ path: "src/types", pattern: "*,enums.ts" }) // 無效
glob({ path: "src/types", pattern: "!types-*.ts;types*.ts" }) // 無效
```

### 排除語法總結

| 語法 | 範例 | 說明 |
|------|------|------|
| `!filename` | `!enums.ts` | 否定模式 |
| `!{file1,file2}` | `!{enums.ts,regexp.ts}` | 多檔否定 |
| `!**/pattern` | `!**/enum-*.ts` | 遞迴否定 |
| `,` 或 `;` | `*,file` 或 `;` | ❌ 不支援 |
