# Obsidian Local REST API 工具文件

> 依據 OpenAPI spec 整理（commit: 4aac5c2b）
> 來源：https://raw.githubusercontent.com/MarkusPfundstein/mcp-obsidian/4aac5c2b874a219652e783b13fde2fb89e9fb640/openapi.yaml

---

## 認證方式

```yaml
type: http
scheme: bearer
```

API Key 可在 Obsidian 設定 > 「Local REST API」外掛區塊中找到。

---

## 工具列表

---

### 1. GET `/` — 伺服器狀態查詢

**不需要認證**的唯一 API。

| 項目 | 說明 |
|------|------|
| 用途 | 回傳伺服器基本資訊與認證狀態 |
| MCP 對應 | 無（健康檢查） |
| Response | `{ authenticated: boolean, ok: string, service: string, versions: { obsidian, self } }` |

---

### 2. GET `/active/` — 取得目前開啟的檔案

| 項目 | 說明 |
|------|------|
| 用途 | 回傳 Obsidian 中當前開啟的檔案內容 |
| MCP 對應 | `obsidian_get_file_contents`（部分功能） |
| Accept header | `text/markdown` → 回傳純文字內容 |
| | `application/vnd.olrapi.note+json` → 回傳 NoteJson（含 tags、frontmatter、stat） |

---

### 3. DELETE `/active/` — 刪除目前開啟的檔案

| 項目 | 說明 |
|------|------|
| 用途 | 刪除 Obsidian 中當前開啟的檔案 |
| MCP 對應 | 無（無 active 專用刪除） |
| Response 204 | 成功 |
| Response 404 | 檔案不存在 |
| Response 405 | 路徑指向目錄而非檔案 |

---

### 4. PATCH `/active/` — 編輯目前開啟的檔案

| 項目 | 說明 |
|------|------|
| 用途 | 對當前開啟檔案的 heading、block reference 或 frontmatter 欄位進行編輯 |
| MCP 對應 | `obsidian_patch_content` |

#### Header 參數

| Header | 必要 | 型別 | 說明 |
|--------|:---:|------|------|
| `Operation` | ✅ | `append` / `prepend` / `replace` | 編輯操作類型 |
| `Target-Type` | ✅ | `heading` / `block` / `frontmatter` | 目標類型 |
| `Target` | ✅ | string | 目標識別（含非 ASCII 時須 URL-Encode） |
| `Target-Delimiter` | ❌ | string (default: `::`) | 巢狀目標（如 heading）的分隔符 |
| `Trim-Target-Whitespace` | ❌ | `true` / `false` (default: `false`) | 是否修剪 target 前後空白 |
| `Create-Target-If-Missing` | ❌ | boolean | 若 target 不存在是否自動建立 |

#### Content-Type 支援

| Content-Type | 用途 | 範例 |
|-------------|------|------|
| `text/markdown` | 一般文字/標記內容 | `Hello` |
| `application/json` | JSON 資料（table row 操作） | `[["Chicago, IL", "16"]]` |

#### Heading 編輯範例

```markdown
目標內容：
# Heading 1
## Subheading 1:1:1
原有內容
```

Headers:
- `Operation`: `append`
- `Target-Type`: `heading`
- `Target`: `Heading 1::Subheading 1:1:1`
- Body: `Hello`

結果：
```markdown
# Heading 1
## Subheading 1:1:1
原有內容
Hello
```

#### Block reference 編輯範例

目標段落含有 `^2d9b4a` block reference。

Headers:
- `Operation`: `append`
- `Target-Type`: `block`
- `Target`: `2d9b4a`
- Body: `Hello`

**注意：** Target 使用 block ID 名稱時，**不含 `^` 前綴**。

#### Table 操作範例

Headers:
- `Operation`: `append`
- `Target-Type`: `block`
- `Target`: `2c7cfa`
- `Content-Type`: `application/json`
- Body: `[["Chicago, IL", "16"]]`

#### Frontmatter 編輯範例

Headers:
- `Operation`: `replace`
- `Target-Type`: `frontmatter`
- `Target`: `alpha`
- Body: `2`

---

### 5. GET `/vault/{filename}` — 取得指定檔案內容

| 項目 | 說明 |
|------|------|
| 用途 | 回傳 vault 中指定路徑的檔案內容 |
| MCP 對應 | `obsidian_get_file_contents` |
| 參數 | `filename`（path，相對於 vault 根目錄） |
| Accept header | 同 `/active/` GET，可選 text/markdown 或 NoteJson |

---

### 6. PUT `/vault/{filename}` — 建立或更新檔案

| 項目 | 說明 |
|------|------|
| 用途 | 建立新檔案或覆寫現有檔案的內容 |
| MCP 對應 | 無直接對應（MCP 使用 append_content + delete） |
| 參數 | `filename`（path，相對於 vault 根目錄） |
| Body | 檔案內容（建議 `Content-Type: text/markdown`） |
| Response 204 | 成功 |
| Response 400 | 無法處理檔案 |
| Response 405 | 路徑指向目錄 |

---

### 7. DELETE `/vault/{filename}` — 刪除指定檔案

| 項目 | 說明 |
|------|------|
| 用途 | 刪除 vault 中指定路徑的檔案 |
| MCP 對應 | `obsidian_delete_file` |
| 參數 | `filename`（path，相對於 vault 根目錄） |
| Response 204 | 成功 |
| Response 404 | 檔案不存在 |
| Response 405 | 路徑指向目錄 |

---

### 8. PATCH `/vault/{filename}` — 編輯指定檔案

| 項目 | 說明 |
|------|------|
| 用途 | 對指定檔案的 heading、block reference 或 frontmatter 進行編輯 |
| MCP 對應 | `obsidian_patch_content` |
| 參數 | `filename`（path，相對於 vault 根目錄） |
| Header 參數 | 同 PATCH `/active/`（Operation、Target-Type、Target 等） |
| Body | 欲插入的內容 |

---

### 9. POST `/vault/{filename}` — 附加內容到檔案

| 項目 | 說明 |
|------|------|
| 用途 | 附加內容到現有檔案的結尾；若檔案不存在則自動建立 |
| MCP 對應 | `obsidian_append_content` |
| 參數 | `filename`（path，相對於 vault 根目錄） |
| Body | 欲附加的內容（`Content-Type: text/markdown`） |
| Response 204 | 成功 |
| Response 400 | 錯誤請求 |
| Response 405 | 路徑指向目錄 |

---

### 10. GET `/vault/` — 列出 vault 根目錄

| 項目 | 說明 |
|------|------|
| 用途 | 列出 vault 根目錄下的所有檔案與目錄 |
| MCP 對應 | `obsidian_list_files_in_vault` |
| Response | `{ files: ["mydocument.md", "somedirectory/"] }` |

---

### 11. GET `/vault/{pathToDirectory}/` — 列出指定目錄

| 項目 | 說明 |
|------|------|
| 用途 | 列出 vault 中指定目錄下的所有檔案與子目錄 |
| MCP 對應 | `obsidian_list_files_in_dir` |
| 參數 | `pathToDirectory`（path，相對於 vault 根目錄） |
| 注意 | 空目錄不會出現在回傳結果中 |

---

### 12. POST `/search/` — 進階搜尋

| 項目 | 說明 |
|------|------|
| 用途 | 對 vault 中的所有檔案執行查詢 |
| MCP 對應 | `obsidian_complex_search` |

#### Content-Type 支援

**Dataview DQL**（`application/vnd.olrapi.dataview.dql+txt`）

```dataview
TABLE time-played AS "Time Played", length AS "Length", rating AS "Rating"
FROM #game
SORT rating DESC
```

**JsonLogic**（`application/vnd.olrapi.jsonlogic+json`）

支援標準 JsonLogic 運算子，外加：

| 運算子 | 說明 | 範例 |
|--------|------|------|
| `glob` | Glob 模式匹配 | `{"glob": ["*.foo", "bar.foo"]}` → `true` |
| `regexp` | 正則表達式匹配 | `{"regexp": [".*\\.foo", "bar.foo"]}` → `true` |

範例：依 frontmatter 欄位搜尋

```json
{
  "==": [
    { "var": "frontmatter.myField" },
    "myValue"
  ]
}
```

範例：依標籤搜尋

```json
{
  "in": [
    "myTag",
    { "var": "tags" }
  ]
}
```

#### 回傳格式

```json
[
  {
    "filename": "path/to/note.md",
    "result": "查詢結果"
  }
]
```

非 falsy 的結果才會回傳。（falsy 值包含：`false`、`null`/`undefined`、`0`、`[]`、`{}`）

---

### 13. POST `/search/simple/` — 簡易全文搜尋

| 項目 | 說明 |
|------|------|
| 用途 | 對 vault 中的所有檔案執行簡單文字搜尋 |
| MCP 對應 | `obsidian_simple_search` |

#### Query 參數

| 參數 | 必要 | 預設值 | 說明 |
|------|:---:|:------:|------|
| `query` | ✅ | — | 搜尋文字 |
| `contextLength` | ❌ | 100 | 匹配字串前後回傳的上下文長度 |

#### 回傳格式

```json
[
  {
    "filename": "path/to/note.md",
    "score": -47.5,
    "matches": [
      {
        "context": "匹配前後的上下文文字...",
        "match": { "start": 212, "end": 219 }
      }
    ]
  }
]
```

---

### 14. GET `/periodic/{period}/{year}/{month}/{day}` — 取得週期性筆記

| 項目 | 說明 |
|------|------|
| 用途 | 取得指定日期的週期性筆記內容 |
| MCP 對應 | `obsidian_get_periodic_note` |
| 參數 | `period`: `daily` / `weekly` / `monthly` / `quarterly` / `yearly` |
| | `year`: 年份（數字） |
| | `month`: 月份 1-12（數字） |
| | `day`: 日期 1-31（數字） |
| Accept header | 支援 text/markdown 與 NoteJson |

---

### 15. DELETE `/periodic/{period}/{year}/{month}/{day}` — 刪除週期性筆記

| 項目 | 說明 |
|------|------|
| 用途 | 刪除指定日期的週期性筆記 |
| 參數 | 同 GET `/periodic/...` |

---

### 16. PATCH `/periodic/{period}/{year}/{month}/{day}` — 編輯週期性筆記

| 項目 | 說明 |
|------|------|
| 用途 | 對週期性筆記的 heading、block reference 或 frontmatter 進行編輯 |
| 參數 | 路徑參數 + 同 PATCH `/active/` 的 Header 參數 |

---

### 17. POST `/periodic/{period}/{year}/{month}/{day}` — 附加到週期性筆記

| 項目 | 說明 |
|------|------|
| 用途 | 附加內容到週期性筆記結尾；若不存在會自動建立 |
| 參數 | 路徑參數 + body（`Content-Type: text/markdown`） |

---

### 18. PUT `/periodic/{period}/{year}/{month}/{day}` — 更新週期性筆記

| 項目 | 說明 |
|------|------|
| 用途 | 建立或覆寫週期性筆記的完整內容 |
| 參數 | 路徑參數 + body |

---

## MCP 工具對應總表

| MCP 工具名稱 | REST API 路徑 | 方法 |
|-------------|--------------|:----:|
| `obsidian_list_files_in_vault` | `/vault/` | GET |
| `obsidian_list_files_in_dir` | `/vault/{pathToDirectory}/` | GET |
| `obsidian_get_file_contents` | `/vault/{filename}` | GET |
| `obsidian_simple_search` | `/search/simple/` | POST |
| `obsidian_complex_search` | `/search/` | POST |
| `obsidian_patch_content` | `/vault/{filename}` | PATCH |
| `obsidian_append_content` | `/vault/{filename}` | POST |
| `obsidian_delete_file` | `/vault/{filename}` | DELETE |
| `obsidian_get_periodic_note` | `/periodic/{period}/{year}/{month}/{day}` | GET |

---

## 錯誤回應格式

所有錯誤回應使用以下結構：

```json
{
  "errorCode": 40149,
  "message": "A brief description of the error."
}
```

- `errorCode`: 5 位數字的錯誤碼，唯一識別錯誤類型
- `message`: 錯誤描述

---

## 伺服器設定

| 模式 | URL | Port |
|------|-----|:----:|
| HTTPS（安全模式） | `https://{host}:{port}` | 27124 |
| HTTP（非安全模式） | `http://{host}:{port}` | 27123 |

預設綁定位址：`127.0.0.1`
