---
name: opencode-tool-guides
description: 清楚解釋 OpenCode 平台工具的使用方法，幫助開發者了解如何在不同情境下選擇並使用正確的工具。Use when users request (1) 如何使用 OpenCode 工具, (2) OpenCode 工具教學, (3) 工具功能比較, (4) read/glob/grep 使用指南, (5) OpenCode tool usage guide.
---

# OpenCode 工具使用指南

## 概述

本 skill 以清楚易懂的方式，說明 OpenCode 平台中常用的檔案操作工具如何使用，幫助開發者在不同情境下選擇正確的工具並有效執行任務。

**核心要點**:
- 了解每個工具的專長與限制
- 根據任務需求選擇最適合的工具
- 掌握工具的參數與使用技巧

This skill explains how to use OpenCode platform tools in a clear and understandable way, helping developers choose the right tools for different scenarios.

**Core Points**:
- Understand each tool's strengths and limitations
- Choose the most suitable tool based on task requirements
- Master tool parameters and usage tips

---

## 工具總覽

### 三大核心檔案操作工具

| 工具 | 主要用途 | 核心能力 |
|------|---------|---------|
| **read** | 讀取檔案或目錄 | 讀取內容、列出目錄、分頁讀取 |
| **glob** | 搜尋檔案路徑 | Glob 模式匹配、多副檔名搜尋、排除檔案 |
| **grep** | 搜尋檔案內容 | 正規表達式搜尋、取得行號、內容過濾 |

### 快速選擇流程

```
需要什麼操作？
    │
    ├── 讀取檔案內容？
    │   └── ✅ 使用 read
    │
    ├── 列出目錄內容？
    │   └── ✅ 使用 read
    │
    ├── 搜尋檔案路徑？
    │   └── ✅ 使用 glob
    │
    ├── 搜尋檔案內容？
    │   └── ✅ 使用 grep
    │
    └── 分頁讀取長檔案？
        └── ✅ 使用 read (帶 offset/limit)
```

---

## read 工具

### 基本功能

**read** 是用於讀取檔案內容或列出目錄的工具。

| 能力 | 說明 |
|------|------|
| 讀取檔案內容 | 讀取文字檔案的完整或部分內容 |
| 列出目錄 | 顯示目錄中的所有項目（檔案與子目錄）|
| 分頁讀取 | 使用 offset 與 limit 讀取特定範圍 |
| 讀取圖片/PDF | 支援視覺檔案顯示 |

### 參數說明

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `filePath` | string | ✅ | 檔案或目錄的**絕對路徑** |
| `offset` | number | - | 開始讀取的行號（從 1 開始）|
| `limit` | number | - | 最多讀取的行數（預設 2000）|

### 使用範例

#### 範例 1：讀取檔案內容

```typescript
// 讀取 package.json 的前 10 行
read({ filePath: "D:/project/package.json", limit: 10 })
```

#### 範例 2：讀取特定範圍

```typescript
// 從第 100 行開始，讀取 50 行
read({ filePath: "D:/project/src/index.ts", offset: 100, limit: 50 })
```

#### 範例 3：列出目錄內容

```typescript
// 列出 src 目錄下的所有項目
read({ filePath: "D:/project/src" })
```

### 結果呈現

**讀取檔案時**:
```
<path>D:\project\package.json</path>
<type>file</type>
<content>
1: {
2:   "name": "my-project",
3:   "version": "1.0.0",
...
</content>
```

**讀取目錄時**:
```
<path>D:\project\src</path>
<type>directory</type>
<entries>
components/
utils/
index.ts
app.ts
</entries>
```

### 限制

- 單次最多回傳 **2000 行**
- 超過 2000 字元的單行會被**截斷**

---

## glob 工具

### 基本功能

**glob** 是用於搜尋符合特定模式的檔案路徑的工具，使用標準的 Glob 模式語法。

| 能力 | 說明 |
|------|------|
| Glob 模式匹配 | 使用 `*`、`**` 等通配符搜尋檔案 |
| 多目錄搜尋 | 同時搜尋多個目錄（如 `{src,test}`）|
| 多副檔名 | 同時匹配多種副檔名（如 `*.{ts,tsx}`）|
| 排除檔案 | 使用 `!` 語法排除特定檔案 |

### 參數說明

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `pattern` | string | ✅ | **Glob 模式**（如 `*.ts`、`src/**/*.js`）|
| `path` | string | - | 搜尋的**起始目錄**（預設為目前目錄）|

### Glob 模式語法

| 模式 | 說明 | 範例 |
|------|------|------|
| `*` | 匹配任意字元（單層）| `*.ts` 匹配所有 .ts 檔案 |
| `**` | 匹配任意層級目錄 | `src/**/*.ts` 匹配 src 下所有 .ts |
| `{a,b}` | 多選模式 | `{src,test}/**/*.ts` 同時搜尋兩個目錄 |
| `!pattern` | 排除模式 | `!test.ts` 排除 test.ts |

### 使用範例

#### 範例 1：搜尋單一目錄下的檔案

```typescript
// 搜尋 src 目錄下的所有 TypeScript 檔案
glob({ path: "D:/project/src", pattern: "*.ts" })
```

#### 範例 2：遞迴搜尋

```typescript
// 搜尋 src 及其所有子目錄下的 .ts 檔案
glob({ path: "D:/project", pattern: "src/**/*.ts" })
```

#### 範例 3：多目錄多副檔名搜尋

```typescript
// 同時搜尋 src、lib、test 三個目錄下的測試檔案
glob({ pattern: "{src,lib,test}/**/*.{test,spec}.ts" })
```

#### 範例 4：排除特定檔案

```typescript
// 排除 enums.ts 檔案
glob({ path: "D:/project/src/types", pattern: "!enums.ts" })

// 排除多個檔案
glob({ path: "D:/project/src/types", pattern: "!{enums.ts,regexp.ts}" })

// 遞迴排除所有 enum-*.ts
glob({ path: "D:/project/src/types", pattern: "!**/enum-*.ts" })
```

### 結果呈現

```
D:\project\src\index.ts
D:\project\src\utils.ts
D:\project\src\components\Button.ts
...
```

- 回傳**完整檔案路徑**
- 依照**修改時間排序**（最新的在前）

### 限制

- **會遞迴搜尋**所有子目錄，難以限制只在第一層
- 設計用於搜尋檔案路徑，**無法讀取目錄列表**

---

## grep 工具

### 基本功能

**grep** 是用於搜尋檔案內容的工具，支援正規表達式匹配。

| 能力 | 說明 |
|------|------|
| 正規表達式搜尋 | 使用正規表達式匹配檔案內容 |
| 回傳行號 | 顯示匹配內容所在的行號 |
| 檔案過濾 | 使用 include 參數只搜尋特定類型檔案 |
| 遞迴搜尋 | 自動搜尋所有子目錄中的檔案 |

### 參數說明

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `pattern` | string | ✅ | **正規表達式**模式 |
| `path` | string | - | 搜尋的**起始目錄**（預設為目前目錄）|
| `include` | string | - | **檔案過濾模式**（如 `*.ts`、`*.{js,ts}`）|

### 使用範例

#### 範例 1：基本內容搜尋

```typescript
// 搜尋 src 目錄中包含 "TODO" 的所有檔案
grep({ path: "D:/project/src", pattern: "TODO" })
```

#### 範例 2：使用正規表達式

```typescript
// 搜尋 TODO 或 FIXME
grep({ path: "D:/project/src", pattern: "TODO|FIXME" })

// 搜尋以 function 開頭的行
grep({ path: "D:/project/src", pattern: "^function" })
```

#### 範例 3：搭配檔案過濾

```typescript
// 只在 TypeScript 檔案中搜尋
grep({ path: "D:/project/src", pattern: "TODO", include: "*.ts" })

// 搜尋多種副檔名
grep({ path: "D:/project/src", pattern: "TODO", include: "*.{ts,tsx}" })
```

### 結果呈現

```
Found 73 matches
D:\project\src\utils.ts:
  Line 15: // TODO: Refactor this function
  Line 42: // TODO: Add error handling

D:\project\src\components\Button.ts:
  Line 8: // FIXME: Style issue on mobile
```

- 首先顯示**匹配總數**
- 顯示**檔名和行號**
- 顯示該行**內容**

### 限制

- 用於搜尋檔案內容，**無法單獨列出目錄**
- 需要搭配其他工具（如 bash）才能**統計數量**

---

## 情境對照表

### 根據任務選擇工具

| 任務情境 | 推薦工具 | 原因 |
|---------|---------|------|
| 列出目錄內容 | **read** | 專門設計用於讀取目錄結構 |
| 讀取檔案內容 | **read** | 直接讀取檔案內容 |
| 搜尋特定檔案 | **glob** | Glob 模式最適合檔案路徑匹配 |
| 搜尋檔案內容關鍵字 | **grep** | 專為內容搜尋設計 |
| 讀取大檔案的一部分 | **read** | offset + limit 可精確控制範圍 |
| 找出所有測試檔案 | **glob** | `*.{test,spec}.ts` 模式最方便 |
| 尋找程式碼中的 TODO | **grep** | 可搜尋內容並顯示行號 |

---

## 進階參考

### 詳細比較文件

如需更詳細的工具功能比較，請參閱：

📄 **[tools-compare-read-glob-grep.md](./references/tools-compare-read-glob-grep.md)**

該文件包含：
- 完整的功能對照表
- 各種情境下的工具選擇建議
- 參數詳細說明
- 實際驗證結果
- 更多使用範例

---

## 常見錯誤

### ❌ 錯誤：使用 glob 列出目錄

```typescript
// 錯誤：glob 會遞迴搜尋所有檔案
glob({ path: "src", pattern: "*" })

// 正確：使用 read 列出目錄
read({ filePath: "D:/project/src" })
```

### ❌ 錯誤：使用 read 搜尋檔案

```typescript
// 錯誤：read 無法搜尋
glob({ filePath: "D:/project/src/*.ts" })

// 正確：使用 glob 搜尋檔案路徑
glob({ path: "D:/project", pattern: "src/**/*.ts" })
```

### ❌ 錯誤：使用 glob 搜尋內容

```typescript
// 錯誤：glob 無法搜尋內容
glob({ pattern: "src/**/*TODO*" })

// 正確：使用 grep 搜尋內容
grep({ path: "D:/project/src", pattern: "TODO" })
```

---

## 總結

| 工具 | 一句話說明 |
|------|-----------|
| **read** | 「我要看這個檔案/目錄的內容」 |
| **glob** | 「我要找符合這個模式的所有檔案」 |
| **grep** | 「我要找包含這個關鍵字的所有內容」 |

選擇工具時，先問自己：**我要找的是「檔案路徑」還是「檔案內容」？**
- 找路徑 → 用 **glob**
- 找內容 → 用 **grep**
- 直接讀取 → 用 **read**
