---
tags:
  - obsidian
  - mcp
  - guidelines
  - operations
  - documentation/references
---

# Obsidian MCP 操作指南

> 基於實驗報告 `obsidian-mcp-edit-experiment-report.md` 整理
> 實驗日期：2026-05-12

---

## 目錄

1. [Heading 操作](#1-heading-操作)
2. [Frontmatter 操作](#2-frontmatter-操作)
3. [Block Reference 操作](#3-block-reference-操作)
4. [檔案操作](#4-檔案操作)
5. [搜尋操作](#5-搜尋操作)
6. [直接 REST API（MCP 不足時）](#6-直接-rest-apimcp-不足時)
7. [常見陷阱](#7-常見陷阱)

---

## 1. Heading 操作

### 1.1 檢查 heading 是否存在

**方法 A：`simple_search`（推薦，快速）**

```typescript
obsidian_simple_search({
  query: "## Section Name"
})
// 有結果 → heading 存在
// [] → heading 不存在
```

> 不區分大小寫：`section a` 也能找到 `Section A`

**方法 B：`complex_search` + regexp（精準，可跨檔案）**

```json
// 找所有 H2
{"regexp":["## [A-Z]", {"var":"content"}]}

// 找特定 heading（區分大小寫）
{"regexp":["## Section B", {"var":"content"}]}

// 大小寫不限
{"regexp":["[Ss]ection [Bb]", {"var":"content"}]}
```

### 1.2 編輯 heading 下的內容

```typescript
// 目標：頂層 H1
obsidian_patch_content({
  filepath: "note.md",
  operation: "replace" | "append" | "prepend",
  target_type: "heading",
  target: "標題名稱",          // H1 直接用名稱
  content: "新內容"
})

// 目標：子層 H2/H3+（必用 :: 路徑）
obsidian_patch_content({
  filepath: "note.md",
  operation: "replace" | "append" | "prepend",
  target_type: "heading",
  target: "父標題::子標題",    // 完整路徑
  content: "新內容"
})
```

**路徑規則：**
| 層級 | target 格式 | 範例 |
|------|------------|------|
| H1 | 直接名稱 | `我的筆記` |
| H2（H1 下） | `H1::H2` | `我的筆記::第一章` |
| H3（H2 下） | `H1::H2::H3` | `我的筆記::第一章::第一節` |
| H4（H3 下） | `H1::H2::H3::H4` | `我的筆記::第一章::第一節::細項` |

### 1.3 重新命名 heading（MCP-only 間接法）

**原理**：`replace` 父層 heading 的內容，在 content 第一行放入新 heading 名稱。

```typescript
// 將 `### Sub A1` 改名為 `### Sub A1 (Renamed)`
// 方法：replace 父層 `Root::Section A` 的內容
obsidian_patch_content({
  filepath: "note.md",
  operation: "replace",
  target_type: "heading",
  target: "Root::Section A",           // ← 父層
  content: `### Sub A1 (Renamed)       // ← 第一行放新 heading
Content A1
...其他內容...`                         // ← 必須包含父層下所有內容
})
```

**限制：**
- 需攜帶父層下的**所有內容**，不僅 heading 行
- 父層內容越大越複雜越難用
- H1 本身無法用此法 rename（無父層）

### 1.4 重新命名 heading（PUT API — 限小檔案）

```bash
# 1. 讀取檔案
curl -sk "https://127.0.0.1:27124/vault/note.md" \
  -H "Authorization: Bearer $OBSIDIAN_API_KEY"

# 2. 修改 heading 文字
sed -i 's/^# 舊標題$/# 新標題/' note.md

# 3. 覆寫檔案
curl -sk -X PUT "https://127.0.0.1:27124/vault/note.md" \
  -H "Authorization: Bearer $OBSIDIAN_API_KEY" \
  -H "Content-Type: text/markdown" \
  --data-binary @note.md
```

> ⚠️ 不推薦用於大檔案：PUT 覆寫整個檔案，檔案越大風險越高（race condition、網路中斷）

### 1.5 動態注入新 subheading

```typescript
// replace 內容中包含新 heading 行，即可動態建立
obsidian_patch_content({
  filepath: "note.md",
  operation: "replace",
  target_type: "heading",
  target: "Root::Section B",
  content: `### New Sub B1          // ← 這行會被建立為新 heading
Content for B1

### New Sub B2
Content for B2`
})

// 建立後可用完整路徑編輯：
// "Root::Section B::New Sub B1" ✅
```

### 1.6 變更 heading 層級

僅能透過 **PUT API**（全檔案覆寫）：

```bash
# 將 `## Section A` 改為 `# Section A`（H2→H1）
curl -sk "https://127.0.0.1:27124/vault/note.md" \
  -H "Authorization: Bearer $OBSIDIAN_API_KEY" > note.md
sed -i 's/^## Section A$/# Section A/' note.md
curl -sk -X PUT "..." --data-binary @note.md
```

> 層級變更後，所有依賴 `::` 路徑的 MCP 操作都需要更新路徑。

### 1.7 特殊字元 heading

| 字元 | 可作為 heading 名稱 | 可透過 `::` 路徑編輯 |
|:----:|:-------------------:|:-------------------:|
| `&` | ✅ | ✅（需完整路徑） |
| `()` | ✅ | ✅（需完整路徑） |
| `[]` | ✅ | ✅（需完整路徑） |
| 數字 | ✅ | ✅（需完整路徑） |

---

## 2. Frontmatter 操作

### 2.1 讀取 frontmatter

```typescript
// 用 GET 取得 Note JSON 格式
// Accept: application/vnd.olrapi.note+json
```

```bash
curl -sk "https://127.0.0.1:27124/vault/note.md" \
  -H "Authorization: Bearer $OBSIDIAN_API_KEY" \
  -H "Accept: application/vnd.olrapi.note+json"
```

回傳包含 `frontmatter`、`tags`、`content` 等欄位。

### 2.2 更新 frontmatter

**優先使用 `application/json`**（避免 YAML 重整問題）：

```bash
# replace 純量欄位
curl -sk -X PATCH "https://127.0.0.1:27124/vault/note.md" \
  -H "Authorization: Bearer $OBSIDIAN_API_KEY" \
  -H "Operation: replace" \
  -H "Target-Type: frontmatter" \
  -H "Target: title" \
  -H "Content-Type: application/json" \
  -d '"新標題"'

# replace 陣列欄位
curl -sk -X PATCH "..." \
  -H "Operation: replace" \
  -H "Target-Type: frontmatter" \
  -H "Target: tags" \
  -H "Content-Type: application/json" \
  -d '["tag1", "tag2", "tag3"]'

# replace 數值欄位
curl -sk -X PATCH "..." \
  -H "Operation: replace" \
  -H "Target-Type: frontmatter" \
  -H "Target: count" \
  -H "Content-Type: application/json" \
  -d '42'
```

### 2.3 Content-Type 選擇

| 需求 | 推薦 content-type | 原因 |
|------|------------------|------|
| 純量字串更新 | `application/json` | 避免 YAML `|-` 格式 |
| 陣列更新 | `application/json` | 正確序列化，避免 YAML 重整 |
| 數值更新 | `application/json` | 保留 Number 型態 |
| 簡單純量 | `text/markdown` | 也可用，但可能重整格式 |

### 2.4 Frontmatter 必要條件

- Frontmatter **必須在檔案最開頭**（`---\nkey: value\n---`）
- 若在檔案中間或其他位置 → `invalid-target`
- 陣列欄位的 `append`/`prepend` → **不論 content-type 皆失敗**（API 底層限制）

---

## 3. Block Reference 操作

### 3.1 編輯 block 內容

```typescript
obsidian_patch_content({
  filepath: "note.md",
  operation: "replace" | "append" | "prepend",
  target_type: "block",
  target: "block-id",       // 不含 ^ 前綴
  content: "新內容"
})
```

### 3.2 注意事項

- **Block ID 不帶 `^` 前綴**：target 寫 `test-block` 而非 `^test-block`
- **Block ref 在 heading 行上無效**：`## Heading ^ref` 無法用 block target 編輯
- 三種操作（replace/append/prepend）皆完美支援
- 最精準的定位方式

---

## 4. 檔案操作

| 操作 | MCP 工具 | REST API |
|------|----------|----------|
| 列出 vault 根目錄 | `obsidian_list_files_in_vault()` | `GET /vault/` |
| 列出子目錄 | `obsidian_list_files_in_dir({dirpath})` | `GET /vault/{path}/` |
| 讀取檔案 | `obsidian_get_file_contents({filepath})` | `GET /vault/{file}` |
| 建立/覆寫檔案 | — | `PUT /vault/{file}` |
| 附加內容到檔尾 | `obsidian_append_content({filepath, content})` | `POST /vault/{file}` |
| 編輯 heading/block/frontmatter | `obsidian_patch_content(...)` | `PATCH /vault/{file}` |
| 刪除檔案 | `obsidian_delete_file({filepath})` | `DELETE /vault/{file}` |
| 批次讀取多檔案 | `obsidian_batch_get_file_contents({filepaths})` | —⚠️ |

⚠️ = MCP-only，無對應 REST 端點

> MCP 沒有 `PUT`（建立/覆寫）的 wrapper，需要使用 `curl` 直接呼叫 REST API。

### 4.1 JSON 檔案操作

Obsidian REST API 支援 JSON 檔案的讀寫，但有以下限制：

| 操作 | 方法 | Content-Type | 結果 | 說明 |
|------|------|-------------|:----:|------|
| 建立/覆寫 | `PUT /vault/{file}` | `application/json` | ✅ | 正確寫入 JSON |
| 建立/覆寫 | `PUT /vault/{file}` | `text/markdown` | ✅ | 也可用（存為純文字） |
| 讀取 | `GET /vault/{file}` | 預設 | ✅ | 回傳原始 JSON 字串 |
| 讀取（結構化） | `GET /vault/{file}` | Note JSON | ✅ | 含 `content`、`stat`、`frontmatter` |
| 編輯 heading | `PATCH` + heading target | `text/markdown` | ⚠️ | 附加純文字到檔尾，**會破壞 JSON 格式** |
| 編輯 heading | `PATCH` + heading target | `application/json` | ❌ | JSON 僅支援 frontmatter target |
| 附加到檔尾 | `POST /vault/{file}` | `application/json` | ❌ | 需使用 `text/*` content-type |
| 搜尋索引 | `POST /search/` | — | ❌ | **JSON 檔案不納入搜尋索引** |

```bash
# 建立 JSON 檔案
curl -sk -X PUT "https://127.0.0.1:27124/vault/data.json" \
  -H "Authorization: Bearer $OBSIDIAN_API_KEY" \
  -H "Content-Type: application/json" \
  --data-binary '{"key":"value","count":42}'

# 以 Note JSON 讀取
curl -sk "https://127.0.0.1:27124/vault/data.json" \
  -H "Authorization: Bearer $OBSIDIAN_API_KEY" \
  -H "Accept: application/vnd.olrapi.note+json"
# → 回傳結構化物件（含 path, content, stat, frontmatter, tags）
```

**結論**：JSON 檔案適合存放純資料檔案（設定、快取等），但不可透過搜尋找到，且無法用 PATCH 精準編輯。

### 4.2 列出 vault 內容

```bash
# 列出 vault 根目錄所有檔案（含非 .md 檔案）
curl -sk "https://127.0.0.1:27124/vault/" -H "Authorization: Bearer $OBSIDIAN_API_KEY"

# 列出子目錄
curl -sk "https://127.0.0.1:27124/vault/subdir/" -H "Authorization: Bearer $OBSIDIAN_API_KEY"
```

> `GET /vault/` 會列出所有檔案（`.md`、`.json` 等），不限 markdown。

### 4.3 `/active/` 端點（取得當前編輯中的檔案）

```bash
curl -sk "https://127.0.0.1:27124/active/" -H "Authorization: Bearer $OBSIDIAN_API_KEY"
```

- 回傳**目前 Obsidian 編輯器中正在編輯的檔案內容**
- 無需知道檔案路徑即可讀取
- 支援全部 HTTP 方法（GET/PUT/POST/PATCH/DELETE）

---

## 5. 搜尋操作

### 5.1 簡單搜尋（檢查 heading 是否存在）

```typescript
obsidian_simple_search({
  query: "搜尋文字",
  context_length: 50    // 可選，回傳前後文長度
})
```

- **不區分大小寫**
- 有結果 = 存在，`[]` = 不存在
- 適合快速判斷 heading 是否存在

### 5.2 複雜搜尋（JsonLogic）

```typescript
obsidian_complex_search({
  query: { /* JsonLogic */ }
})
```

**常用查詢範例：**

| 目的 | JsonLogic |
|------|-----------|
| 路徑含關鍵字 | `{"regexp":["keyword", {"var":"path"}]}` |
| 內容含關鍵字 | `{"regexp":["keyword", {"var":"content"}]}` |
| 精確路徑比對 | `{"===":[{"var":"path"}, "note.md"]}` |
| 檔案大小 > N | `{">":[{"var":"stat.size"}, 100]}` |
| AND 複合條件 | `{"and": [..., ...]}` |
| NOT 排除 | `{"!": [...]}` |
| 標籤包含 | `{"in": ["tag", {"var":"tags"}]}` |
| 找所有 H2 | `{"regexp":["## [A-Z]", {"var":"content"}]}` |

**可查詢的屬性**（NoteJson schema）：
- `path` — 檔案路徑
- `content` — 完整檔案內容
- `stat.size` — 檔案大小（bytes）
- `stat.ctime` — 建立時間戳
- `stat.mtime` — 修改時間戳
- `frontmatter.*` — frontmatter 欄位
- `tags` — 標籤陣列

### 5.3 ⚠️ 搜尋範圍限制：僅 `.md` 檔案

**搜尋 API 僅索引 `.md` 檔案**，非 markdown 檔案（`.json`、`.txt`、圖片等）完全無法透過搜尋找到：

| 資料類型 | 可讀取 (`GET /vault/`) | 可搜尋 (`POST /search/`) |
|---------|:---------------------:|:-----------------------:|
| `.md` 檔案 | ✅ | ✅ |
| `.json` 檔案 | ✅ | ❌ |
| 子目錄內 `.md` | ✅ | ✅ |
| 子目錄內 `.json` | ✅ | ❌ |

```bash
# 搜尋所有 .md 檔案 → 等同於搜尋整個 vault
curl -sk -X POST "https://127.0.0.1:27124/search/" \
  -H "Authorization: Bearer $OBSIDIAN_API_KEY" \
  -H "Content-Type: application/vnd.olrapi.jsonlogic+json" \
  -d '{"regexp":[".",{"var":"path"}]}'

# 非 .md 檔案無法用此方式搜尋，需直接用 GET /vault/{file} 讀取
```

### 5.4 JsonLogic 運算子注意事項

| 運算子 | 說明 | 範例 |
|--------|------|------|
| `===` | 嚴格相等（非 `eq`） | `{"===":[a, b]}` |
| `==` | 寬鬆相等 | `{"==":[a, b]}` |
| `>` `<` `>=` `<=` | 比較 | `{">":[a, b]}` |
| `and` `or` `!` | 邏輯 | `{"and":[a, b]}` |
| `in` | 陣列包含 | `{"in":[val, arr]}` |
| `regexp` | 正則匹配 | `{"regexp":[pattern, str]}` |
| `glob` | Glob 匹配 | `{"glob":[pattern, str]}` |
| `var` | 存取變數 | `{"var":"path"}` |

---

## 6. 直接 REST API（MCP 不足時）

### 6.1 環境變數

```
OBSIDIAN_API_KEY=xxx
OBSIDIAN_PORT=27124
OBSIDIAN_HOST=127.0.0.1
API_BASE="https://127.0.0.1:27124"
AUTH_HEADER="Authorization: Bearer $OBSIDIAN_API_KEY"
```

### 6.2 PUT（MCP 無 wrapper）

```bash
curl -sk -X PUT "$API_BASE/vault/note.md" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: text/markdown" \
  --data-binary @note.md
```

> ⚠️ 整份檔案覆寫，僅適用小檔案

### 6.3 PATCH 直接呼叫（回傳完整內容）

MCP 的 `patch_content` 只回傳 `Success`，但直接 REST PATCH 會回傳修改後的完整檔案內容：

```bash
curl -sk -X PATCH "$API_BASE/vault/note.md" \
  -H "$AUTH_HEADER" \
  -H "Operation: append" \
  -H "Target-Type: heading" \
  -H "Target: Root::Section A" \
  -H "Content-Type: text/markdown" \
  -d "新內容"
```

### 6.4 PUT JSON 檔案

```bash
curl -sk -X PUT "$API_BASE/vault/data.json" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  --data-binary '{"name":"test","count":42}'
```

> JSON 檔案可正常讀寫，但搜尋 API 不索引非 `.md` 檔案。

### 6.5 取得 Note JSON 格式

```bash
curl -sk "$API_BASE/vault/note.md" \
  -H "$AUTH_HEADER" \
  -H "Accept: application/vnd.olrapi.note+json"
```

回傳包含 `path`、`content`、`stat`、`frontmatter`、`tags` 等結構化欄位，適用於程式處理。

### 6.6 `/active/` 端點

```bash
# 讀取當前正在 Obsidian 編輯器中開啟的檔案
curl -sk "$API_BASE/active/" -H "$AUTH_HEADER"
```

自動指向目前開啟的檔案內容，無需指定路徑。

---

## 7. 常見陷阱

| # | 陷阱 | 說明 | 解決方案 |
|---|------|------|---------|
| 1 | **heading 路徑忘記 `::`** | `第一章` 而非 `檔案::第一章` | 子層 heading 必須用完整 `::` 路徑 |
| 2 | **replace 空白內容失敗** | `content-already-preexists-in-target` | 必須提供至少一個非空白字元 |
| 3 | **Frontmatter 不在開頭** | `invalid-target` | Frontmatter 必須在檔案第一行 |
| 4 | **陣列欄位 append 失敗** | `type mismatch` | 無解（API 限制）；改用 `replace` 整個陣列 |
| 5 | **Block ref 放 heading 行** | `invalid-target` | Block ref 在 heading 行上無效 |
| 6 | **PUT 後 `::` 路徑失效** | `invalid-target` | heading 文字一改，所有路徑需更新 |
| 7 | **大小寫搞混** | `regexp` 區分大小寫但 `simple_search` 不區分 | 用 `[Ss]ection` 繞過 regexp 限制 |
| 8 | **Commands 回傳 204 誤以為成功** | 對話框仍在等人處理 | 需人工干預的指令不可用於自動化 |
| 9 | **未安裝 Dataview 外掛就查 DQL** | Error 40070 | 改用 JsonLogic 查詢 |
| 10 | **`application/json` 對 heading target** | `content-type-invalid-for-target` | JSON 僅支援 frontmatter target |
| 11 | **搜尋不到 `.json` 檔案** | 搜尋 API 回傳 `[]` | 搜尋僅索引 `.md` 檔案；非 `.md` 需用 `GET /vault/{file}` 直接讀取 |
| 12 | **PATCH JSON 檔案破壞格式** | JSON 變成無效格式（如 `{...}{...}`） | JSON 檔案只能 `PUT` 覆寫或讀取，不可用 PATCH 編輯 |

---

## 8. 安全性：目錄遍歷防護

Obsidian REST API 正確阻擋所有嘗試逸出 vault 根目錄的路徑操縱：

| 嘗試的方法 | 路徑 | 結果 |
|-----------|------|:----:|
| 相對路徑逸出 | `../file.md` | ✅ 404 阻擋 |
| URL 編碼逸出 | `%2e%2e/file.md` | ✅ 404 阻擋 |
| 絕對路徑 | `C:/Windows/system.ini` | ✅ 404 阻擋 |
| 子目錄正常存取 | `subdir/file.md` | ✅ 200 正常 |

**安全模型**：所有 `/vault/` 路徑都解析為 vault 根目錄下的相對路徑，無法逸出 vault 範圍。

---

## 附錄：檔案清理記錄

測試過程中建立的檔案：
- `_heading-research.md` — 主要研究檔案，保留中
- `_blockref-heading.md` — block ref 測試
- `_verify-rename.md` — rename 驗證
- `_json-frontmatter-test.md` — JSON frontmatter 測試
- `_test-data.json` — JSON 檔案讀寫測試

> 這些是研究過程中建立的測試檔案，可視需求決定是否保留或清理。
