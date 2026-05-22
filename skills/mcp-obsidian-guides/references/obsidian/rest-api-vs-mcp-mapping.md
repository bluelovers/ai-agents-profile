---
tags:
  - obsidian
  - obsidian/rest
  - mcp
  - comparison
  - documentation/references
---

# REST API 與 MCP Tool 對應表

> 建立日期：2026-05-12
> 來源：OpenAPI spec（commit 4aac5c2b）與 mcp-obsidian 實際測試

---

## 對應總表

| REST API | 方法 | MCP Tool 名稱 | 備註 |
|----------|:----:|---------------|------|
| `/` | GET | — | 無對應（健康檢查用） |
| `/active/` | GET | — | 部分對應 `obsidian_get_file_contents`（無參數版本） |
| `/active/` | DELETE | — | 無對應 |
| `/active/` | PATCH | — | 無對應（MCP 層使用 `/vault/{filename}` 路徑） |
| `/active/` | POST | — | 無對應 |
| `/active/` | PUT | — | 無對應 |
| `/commands/` | GET | — | 無對應 |
| `/commands/{commandId}/` | POST | — | 無對應 |
| `/open/{filename}` | POST | — | 無對應 |
| `/periodic/{period}/` | GET | `obsidian_get_periodic_note` | 僅取當期 |
| `/periodic/{period}/` | DELETE | — | 無對應 |
| `/periodic/{period}/` | PATCH | `obsidian_patch_content` | 透過 periodic note 路徑 |
| `/periodic/{period}/` | POST | — | 無對應 |
| `/periodic/{period}/` | PUT | — | 無對應 |
| `/periodic/{year}/{month}/{day}/{period}/` | GET | `obsidian_get_periodic_note` | 指定日期 |
| `/periodic/{year}/{month}/{day}/{period}/` | DELETE | — | 無對應 |
| `/periodic/{year}/{month}/{day}/{period}/` | PATCH | `obsidian_patch_content` | 透過 periodic note 路徑 |
| `/periodic/{year}/{month}/{day}/{period}/` | POST | — | 無對應 |
| `/periodic/{year}/{month}/{day}/{period}/` | PUT | — | 無對應 |
| `/search/simple/` | POST | `obsidian_simple_search` | ✅ 但僅索引 `.md` 檔案 |
| `/search/` | POST | `obsidian_complex_search` | ✅ 支援 JsonLogic / Dataview DQL，**僅 `.md`** |
| `/vault/` | GET | `obsidian_list_files_in_vault` | ✅ 列出所有檔案（含 `.json` 等非 `.md`） |
| `/vault/{pathToDirectory}/` | GET | `obsidian_list_files_in_dir` | ✅ 同上 |
| `/vault/{filename}` | GET | `obsidian_get_file_contents` | ✅ 支援任何檔案類型 |
| `/vault/{filename}` | PUT | — | 無對應（MCP 無 PUT wrapper）；適合 JSON 檔案建立 |
| `/vault/{filename}` | DELETE | `obsidian_delete_file` | ✅ |
| `/vault/{filename}` | PATCH | `obsidian_patch_content` | ✅ |
| `/vault/{filename}` | POST | `obsidian_append_content` | ✅ |

---

## 無對應 REST API 的 MCP Tools

| MCP Tool 名稱 | 對應 REST API | 說明 |
|---------------|---------------|------|
| `obsidian_batch_get_file_contents` | 多個 `GET /vault/{filename}` | **MCP-only**：無 `/vault/batch/` 端點（測試回傳 40510）。MCP 內部發送多個 GET 後合併 |
| `obsidian_get_recent_changes` | 無單一對應 | 可能透過 vault 目錄列表 + stat 過濾實現 |
| `obsidian_get_recent_periodic_notes` | 多個 `GET /periodic/{period}/` | 批次取得近期多期筆記（MCP 層封裝） |

---

## 無對應 MCP Tool 的 REST API

| REST API | 方法 | 功能 | 無對應原因 |
|----------|:----:|------|-----------|
| `/` | GET | 伺服器健康檢查 | 非筆記操作，MCP 不需要 |
| `/active/` | GET | 取得當前開啟檔案內容 | MCP 偏好用 vault path 指定；REST 下可用此端點無需知道路徑 |
| `/active/` | DELETE | 刪除當前檔案 | 同上 |
| `/active/` | PATCH | 編輯當前檔案 | 同上（可用 `/vault/{filename}` PATCH 代替） |
| `/active/` | POST | 附加到當前檔案 | 同上（可用 `/vault/{filename}` POST 代替） |
| `/active/` | PUT | 覆寫當前檔案 | MCP 未封裝 PUT 操作 |
| `/commands/` | GET | 列出所有可用 Obsidian 指令（231+ 條） | MCP 未封裝 |
| `/commands/{commandId}/` | POST | 執行指令 | MCP 未封裝；HTTP 204 不保證可程式化 |
| `/open/{filename}` | POST | 在 Obsidian 中開啟檔案 | MCP 未封裝 |
| `/periodic/{period}/` | DELETE | 刪除週期筆記 | MCP 未封裝 |
| `/periodic/{period}/` | POST | 附加到週期筆記 | MCP 未封裝 |
| `/periodic/{period}/` | PUT | 覆寫週期筆記 | MCP 未封裝 |
| 所有含日期的 periodic DELETE/POST/PUT | — | — | 同上 |
| `/vault/{filename}` | PUT | 建立/覆寫檔案 | MCP 無 PUT wrapper；適合 JSON 檔案或小檔案全量覆寫 |

---

## 常用操作對應速查表

| 你想做什麼 | REST API | MCP Tool |
|-----------|----------|----------|
| 列出 vault 根目錄 | `GET /vault/` | `obsidian_list_files_in_vault` |
| 列出 vault 子目錄 | `GET /vault/{path}/` | `obsidian_list_files_in_dir` |
| 讀取檔案內容 | `GET /vault/{filename}` | `obsidian_get_file_contents` |
| 建立/覆寫檔案 | `PUT /vault/{filename}` | —（MCP 無 PUT wrapper；可用 POST append 初始化） |
| 建立 JSON 檔案 | `PUT /vault/{file}` + `Content-Type: application/json` | —（MCP 無對應） |
| 附加內容到檔尾 | `POST /vault/{filename}` | `obsidian_append_content` |
| 刪除檔案 | `DELETE /vault/{filename}` | `obsidian_delete_file` |
| 編輯 heading 下方內容 | `PATCH /vault/{filename}` + heading target | `obsidian_patch_content` |
| 編輯 block reference 內容 | `PATCH /vault/{filename}` + block target | `obsidian_patch_content` |
| 編輯 frontmatter 欄位 | `PATCH /vault/{filename}` + frontmatter target | `obsidian_patch_content` |
| 簡單文字搜尋（僅 `.md`） | `POST /search/simple/?query=xxx` | `obsidian_simple_search` |
| 複雜搜尋（JsonLogic）（僅 `.md`） | `POST /search/` (Content-Type: jsonlogic) | `obsidian_complex_search` |
| 複雜搜尋（Dataview）（僅 `.md`） | `POST /search/` (Content-Type: dataview) | `obsidian_complex_search` |
| 取得週期性筆記 | `GET /periodic/{period}/` | `obsidian_get_periodic_note` |
| 取得當前開啟檔案 | `GET /active/` | —（需用 vault path 指定） |
| 批次讀取多檔案 | 多個 `GET /vault/{filename}` | `obsidian_batch_get_file_contents`（MCP-only） |
| 列出 vault 目錄（含 JSON 等） | `GET /vault/` | `obsidian_list_files_in_vault` |
| 以結構化 JSON 讀取檔案 | `GET /vault/{filename}` + `Accept: note+json` | —（MCP 無對應參數） |

---

## PATCH 操作參數對應

| REST Header | MCP 對應參數 | 說明 |
|-------------|-------------|------|
| `Operation` | `operation` | `append` / `prepend` / `replace` |
| `Target-Type` | `target_type` | `heading` / `block` / `frontmatter` |
| `Target` | `target` | 目標識別（非 ASCII 須 URL-Encode） |
| `Target-Delimiter` | 自動處理 | 預設 `::`，用於 heading 路徑分隔 |
| `Trim-Target-Whitespace` | — | MCP 層未暴露 |
| `Create-Target-If-Missing` | — | MCP 層未暴露 |
| Request Body | `content` | 欲插入的內容 |

---

## 注意事項

### 搜尋範圍限制
- 搜尋 API（`/search/`、`/search/simple/`）**僅索引 `.md` 檔案**
- `.json` 等非 markdown 檔案無法透過搜尋找到，需直接用 `GET /vault/{file}` 讀取
- `GET /vault/` 目錄列表則會列出所有檔案類型

### 批次操作
- `obsidian_batch_get_file_contents` 為 **MCP-only 封裝**，無對應 REST 端點
- 實測 `/vault/batch/` 回傳 40510（目錄錯誤）
- REST 層需發送多個 `GET /vault/{filename}` 自行合併

### PUT 操作
- MCP 無 PUT wrapper，適合非 markdown 檔案（如 JSON）的建立/覆寫
- PUT 會**完全覆寫**整個檔案，不適用大檔案

### 安全性：目錄遍歷防護
- 所有 `/vault/` 路徑皆解析為 vault 根目錄下的相對路徑
- `../`、URL 編碼 `%2e%2e`、絕對路徑皆回傳 404
- 無法逸出 vault 範圍
