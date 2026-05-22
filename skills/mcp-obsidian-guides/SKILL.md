---
name: mcp-obsidian-guides
description: >-
  說明 mcp-obsidian 的工具能做到什麼、不能做到什麼，以及如何使用，減少錯誤嘗試。
  Use when users request
  (1) mcp-obsidian usage guide,
  (2) Obsidian MCP integration,
  (3) "mcp-obsidian 指南",
  (4) "Obsidian MCP 工具",
   (5) "如何使用 Obsidian MCP".
tags:
  - obsidian
  - mcp
  - note-taking
  - knowledge-management
  - integration
---

# MCP Obsidian Guides

## 概述

本 skill 用於說明 mcp-obsidian 的工具能做到什麼、不能做到什麼，以及如何使用，減少錯誤嘗試。

This skill explains what mcp-obsidian tools can do, what they cannot do, and how to use them, reducing erroneous attempts.

---

## 前置條件

### 1. 安裝 Local REST API 插件

**mcp-obsidian 需要 Obsidian Local REST API 插件才能運作。**

1. 在 Obsidian 中開啟 **Settings** → **Community plugins**
2. 搜尋並安裝 **Local REST API**
3. 啟用插件並取得 API Key

### 2. 系統環境變數

設定以下環境變數：

```bash
OBSIDIAN_API_KEY=<your_api_key_here>
OBSIDIAN_HOST=<your_obsidian_host>  # 預設: localhost
OBSIDIAN_PORT=<your_obsidian_port>  # 預設: 27777
```

### 3. Obsidian 必須執行

**MCP 需要 Obsidian 處於執行狀態且開啟資料庫。**

| 狀態 | MCP 指令結果 |
|------|-------------|
| Obsidian 關閉 | ❌ Unable to connect |
| Obsidian 開啟中 | ❌ 視資料庫狀態而定 |
| Obsidian 開啟 + 開啟資料庫 | ✅ 正常運作 |

---

## 工具能力與限制

### 能做到的事 (Can Do)

| 功能 | MCP 工具 | 說明 |
|------|---------|------|
| 讀取檔案 | `obsidian_get_file_contents` | 讀取 Obsidian 資料庫中的檔案內容 |
| 讀取目錄 | `obsidian_list_files_in_vault` / `obsidian_list_files_in_dir` | 獲取資料夾結構與檔案列表 |
| 搜尋內容 | `obsidian_simple_search` / `obsidian_complex_search` | 在資料庫中搜尋文字內容 |
| 讀取資源 | `obsidian_get_periodic_note` | 讀取週期性筆記（日誌、週誌等） |
| 刪除檔案 | `obsidian_delete_file` | 刪除指定路徑的檔案 |
| 附加內容 | `obsidian_append_content` | 附加內容到檔案結尾（檔案不存在時自動建立） |
| 編輯內容 | `obsidian_patch_content` | 編輯 heading、block reference 或 frontmatter |
| 批次讀取 | `obsidian_batch_get_file_contents` | 一次讀取多個檔案 |

### 不能做到的事 (Cannot Do)

| 功能 | 限制原因 | 替代方法 |
|------|----------|--------|
| 建立檔案 | MCP 無 `create_file` 指令 | 使用 `append_content` 到新檔路徑（會自動建立） |
| 編輯 heading 文字 | `patch_content` 只能編輯 heading 下的內容，不能修改 heading 行本身 | 間接法：replace 父層 heading 內容；或使用 PUT API |
| 變更 heading 層級 | 同上 | 使用 PUT API 覆寫整個檔案 |
| 重新命名檔案 | MCP 無 `rename_file` 指令 | 無 MCP 替代方法 |
| 建立目錄 | MCP 無 `create_dir` 指令 | 無 MCP 替代方法 |
| 移動檔案 | MCP 無 `move_file` 指令 | 無 MCP 替代方法 |
| 清空 heading 內容 | `replace` 空白內容會回傳 `content-already-preexists-in-target` | 提供至少一個非空白字元 |
| frontmatter 陣列 append/prepend | API 底層限制 | 使用 `replace` 整個陣列 |
| PUT（建立/覆寫檔案） | MCP 無 `PUT` wrapper | 直接呼叫 REST API `PUT /vault/{filename}` |

---

## 使用方式

### 場景 1：讀取檔案

```
使用 MCP 指令：read_file
參數：
  - path: 檔案路徑（相對於資料庫根目錄）
```

### 場景 2：讀取目錄

```
使用 MCP 指令：list_files
參數：
  - path: 目錄路徑（相對於資料庫根目錄）
```

### 場景 3：搜尋內容

```
使用 MCP 指令：search
參數：
  - query: 搜尋關鍵字
```

---

## 替代方法指南

### 1. 建立新檔案

雖然 MCP 沒有 `create_file` 指令，但可以使用 `append_content` 自動建立檔案：

```typescript
obsidian_append_content({
  filepath: "新檔案名稱.md",
  content: "# 標題\n\n內容"
})
```

### 2. 重新命名 heading（MCP 間接法）

**原理**：`replace` 父層 heading 的內容，content 第一行放入新 heading 名稱。

```typescript
// 將 `### Sub A1` 改名為 `### Sub A1 (Renamed)`
obsidian_patch_content({
  filepath: "note.md",
  operation: "replace",
  target_type: "heading",
  target: "Root::Section A",  // 父層路徑
  content: `### Sub A1 (Renamed)
Content A1
...其他父層下所有內容...`
})
```

**限制**：
- 需攜帶父層下的所有內容
- 父層內容越大越難用
- H1 本身無法用此法 rename（無父層）

### 3. 變更 heading 層級

目前 MCP 無法直接變更 heading 層級，需使用 PUT API 覆寫整個檔案（不推薦大檔案）。

### 4. 清空 heading 內容

`replace` 空白內容會回傳 `content-already-preexists-in-target` 錯誤。

**解法**：提供至少一個非空白字元：

```typescript
// ❌ 會失敗
obsidian_patch_content({
  filepath: "note.md",
  operation: "replace",
  target_type: "heading",
  target: "Section A",
  content: ""  // 空字串會失敗
})

// ✅ 正確做法
obsidian_patch_content({
  filepath: "note.md",
  operation: "replace",
  target_type: "heading",
  target: "Section A",
  content: " "  // 單一空格可清空
})
```

### 5. frontmatter 陣列操作

`append`/`prepend` 對陣列欄位會回傳 `type mismatch` 錯誤。

**解法**：使用 `replace` 整個陣列：

```typescript
obsidian_patch_content({
  filepath: "note.md",
  operation: "replace",
  target_type: "frontmatter",
  target: "tags",
  content: ["tag1", "tag2", "tag3"]
})
```

---

## 新檔案建立規範

### Frontmatter tags 設定

**建立新的 `.md` 檔案時，除非使用者或專案有明確要求不要，否則應在 frontmatter 中自動加上 `tags` 欄位。**

`tags` 的值為**文字陣列**（string array），支援多級標籤格式（`level1/level2`）。

> **為什麼需要多級標籤？**
>
> 單一標籤在數量增多後容易失去辨識度（例如 `prompts` 無法區分是圖片生成還是文字生成的 prompts）。多級標籤透過 `/` 分層，提供以下優勢：
>
> - **明確分類**：`prompts/img-gen` 與 `prompts/stable-diffusion` 一眼即可辨識主題
> - **交集查詢**：可同時搜尋多個標籤，縮小結果範圍
> - **彈性組合**：支援單一標籤和多級標籤並存，無需強制使用多級格式
>
> 單一標籤仍然有效，多級標籤是進階選項，根據需要自由搭配。

#### 範例

```yaml
---
title: 觀察日誌
tags:
  - obsidian-mcp
  - mcp/comparison
  - periodic/observation
---
```

#### 標籤命名建議

| 層級 | 說明 | 範例 |
|------|------|------|
| 第一層 | 技能/工具類型 | `obsidian-mcp`, `kapture-mcp`, `chrome-devtools-mcp` |
| 第二層 | 功能/主題分類 | `mcp/comparison`, `mcp/browser-automation` |
| 第三層 | 具體細項 | `periodic/observation`, `periodic/weekly` |

#### Obsidian 搜尋語法

多級標籤搭配 Obsidian 的搜尋語法可實現精準查詢。tag 後面需加上 `#` 前綴：

| 搜尋語法 | 說明 | 範例 |
|----------|------|------|
| `tag:#標籤名` | 搜尋包含指定標籤的檔案 | `tag:#obsidian-mcp` |
| `tag:#父標籤/子標籤` | 搜尋多級標籤 | `tag:#mcp/comparison` |
| `AND` | 交集（同時滿足） | `tag:#stable-diffusion AND tag:#img-gen` |
| `OR` | 聯集（任一滿足） | `tag:#img-gen OR tag:#prompts/stable-diffusion` |
| `-tag:#標籤名` | 排除（NOT） | `-tag:#draft` |
| 組合查詢 | 混合使用 | `tag:#stable-diffusion AND (tag:#img-gen OR tag:#prompts/stable-diffusion)` |

> **搜尋範例**：找出所有關於 Stable Diffusion 圖片生成的 prompts
> ```
> tag:#stable-diffusion AND ( tag:#img-gen OR tag:#prompts/stable-diffusion )
> ```
>
> **排除範例**：找出 prompts 但排除 AI 模型訓練相關
> ```
> tag:#prompts/rules -tag:#ai-model-training
> ```

---

## 常見錯誤與解決方式

| 錯誤 | 原因 | 解決方式 |
|------|------|----------|
| `Unable to connect` | Obsidian 未執行或 Local REST API 未啟用 | 啟動 Obsidian 並開啟資料庫，確認 Local REST API 插件已啟用 |
| `File not found` | 路徑錯誤 | 檢查檔案路徑是否正確 |
| `Permission denied` | API Key 錯誤或權限不足 | 檢查 `OBSIDIAN_API_KEY` 環境變數設定 |
| `Connection refused` | 埠號錯誤 | 檢查 `OBSIDIAN_PORT` 環境變數設定 |
| `content-already-preexists-in-target` | replace 空白內容 | 提供至少一個非空白字元 |
| `invalid-target` | Frontmatter 不在檔案開頭 | 確保 frontmatter 在檔案第一行 |
| `type mismatch` | frontmatter 陣列欄位 append/prepend | 使用 `replace` 整個陣列 |

---

## 參考資料

| 文檔 | 說明 |
|------|------|
| [Obsidian MCP 配置](./references/obsidian-mcp-config.md) | MCP 配置說明 |
| [Obsidian CLI 指令](./references/obsidian-cli.md) | CLI 指令參考 |
| [Obsidian MCP 操作指南](./references/obsidian/obsidian-mcp-operation-cookbook.md) | 詳細操作指南 |
| [Obsidian MCP 編輯實驗報告](./references/obsidian/obsidian-mcp-edit-experiment-report.md) | 編輯操作實驗結果 |
| [Obsidian 標籤系統](./references/obsidian/tags.md) | 多級標籤說明與使用方式 |

---

## 相關資源

### 官方文檔

| 標題 | 網址 |
|------|------|
| Obsidian 官方網站 | https://obsidian.md/ |
| Local REST API 插件 | https://github.com/coddingtonbear/obsidian-local-rest-api |
| MCP Obsidian 插件 | https://github.com/MarkusPfundstein/mcp-obsidian |
| MCP 官方文檔 | https://modelcontextprotocol.io/ |
