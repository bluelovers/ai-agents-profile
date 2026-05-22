---
tags:
  - opencode
  - tools
  - write
  - bash
  - comparison
---

# write、bash 工具建立資料夾/檔案功能比較

本文比較 OpenCode 平臺上兩個可用於建立資料夾和檔案的工具，幫助開發者根據不同情境選擇適合的工具。

## 工具基本功能

| 功能 | write | bash |
|------|-------|------|
| 建立檔案 | ✅ | ❌ |
| 建立資料夾 | ✅ (自動建立父目錄) | ✅ |
| 寫入內容 | ✅ | ❌ |
| 刪除檔案/資料夾 | ❌ | ✅ |

## 建立方式比較

### write 工具（推薦）

| 特性 | 說明 |
|------|------|
| 建立檔案 | ✅ 直接寫入檔案 |
| 建立資料夾 | ✅ **會自動建立所需的父目錄**，不需要先使用 bash 建立資料夾 |
| 範例 | `write({ content: "...", filePath: "dir/subdir/file.md" })` |

```typescript
// 直接建立多層目錄和檔案，無需先建立目錄
write({
  content: "# 測試檔案\n\n這是內容",
  filePath: "test-temp/create-test/subdir/test-file.md"
})
```

### bash 工具

| 特性 | 說明 |
|------|------|
| 建立資料夾 | ✅ 使用 `mkdir -p` |
| 建立檔案 | ⚠️ 需搭配其他工具（如 `touch`，但只能建立空檔案）|
| 範例 | `mkdir -p "path/to/dir"` |

```bash
# 建立多層目錄
mkdir -p "path/to/directory"

# 建立空檔案（需搭配其他工具寫入內容）
touch "path/to/file.txt"
```

## 使用情境選擇指南

| 情境 | 推薦工具 | 說明 |
|------|---------|------|
| 建立資料夾 + 檔案內容 | **write** | 最簡便，自動建立父目錄 |
| 只建立空資料夾 | **bash** | `mkdir -p` 語法簡潔 |
| 建立多層目錄結構 | **write** | 一鍵完成 |

## 驗證測試

### 測試 1：write 建立多層目錄 + 檔案

```typescript
write({
  content: "# 測試檔案\n\n這是用於測試工具的文件。",
  filePath: "test-temp/create-test/test-file.md"
})
```

**結果：✅ 成功**

- `test-temp/create-test/` 目錄自動建立
- `test-file.md` 檔案成功寫入

### 測試 2：bash 建立目錄

```bash
mkdir -p "test-temp/create-test"
```

**結果：✅ 成功**

## 關鍵發現

### write 工具會自動建立所需的父目錄

這是 write 工具最重要的特性之一：

- **不需要先使用 `mkdir` 建立目錄**
- **不需要使用 `mkdir -p` 確保目錄存在**
- **可以直接指定多層路徑，write 會自動建立所有不存在的父目錄**

```typescript
// ❌ 不需要這樣：
bash({ command: "mkdir -p test-temp/create-test" })
write({ content: "...", filePath: "test-temp/create-test/test.md" })

// ✅ 直接這樣就好：
write({ content: "...", filePath: "test-temp/create-test/test.md" })
```

## 實用範例

### 範例 1：建立多層目錄結構

```typescript
// ✅ write 一鍵完成
write({
  content: "# Module Documentation\n\nThis module does X.",
  filePath: "docs/modules/user-service.md"
})
```

### 範例 2：批量建立檔案

```typescript
// 每個 write 都會自動建立所需的父目錄
write({ content: "...", filePath: "src/agents/shadows.ts" })
write({ content: "...", filePath: "src/tools/arise-summon.ts" })
write({ content: "...", filePath: "test/fixtures/model-resolver.ts" })
```

## 限制

### write

- 無法直接讀取後修改（需先讀取再寫入）

### bash

- 無法直接寫入檔案內容（只能建立空檔案）
- 在 Windows 環境下路徑需使用反斜槓或正斜槓

## 總結

| 工具 | 優點 | 缺點 |
|------|------|------|
| **write** | 自動建立父目錄、可寫入內容 | 無法刪除 |

**結論**：大多數情況下，**write 工具是最推薦的方式**，因為它會自動處理父目錄的建立。只需要在需要刪除檔案或執行系統命令時才需要使用 bash。這個規則適用於所有使用 OpenCode 的專案。
