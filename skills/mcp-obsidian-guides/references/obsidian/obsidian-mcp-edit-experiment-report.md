---
tags:
  - obsidian
  - mcp
  - experiment
  - report
  - editing
  - documentation/references
---

# Obsidian MCP 編輯操作實驗報告

> 實驗日期：2026-05-12
> 測試工具：mcp-obsidian（Obsidian Local REST API MCP wrapper）

---

## 實驗目的

系統性測試 Obsidian MCP 的編輯操作 API，找出正確的參數格式與使用限制。

---

## 實驗結果總覽

| target_type | target 格式 | replace | append | prepend | 備註 |
|-------------|-----------|:-------:|:------:|:-------:|------|
| **heading（頂層 H1）** | 僅用名稱（如 `編輯測試檔案`） | ✅ | ✅ | ✅ | 頂層 heading 無需路徑 |
| **heading（子層 H2+）** | 完整路徑 `父::子`（如 `檔案::第一章`） | ✅ | ✅ | ✅ | 子層必須用 `::` 路徑 |
| **heading（巢狀 H3+）** | 完整路徑 `父::子::孫` | ✅ | ✅ | ✅ | 層層遞進都支援 |
| **block** | Block ID（如 `test-block`，不含 `^` 前綴） | ✅ | ✅ | ✅ | 最精準的定位方式 |
| **frontmatter（純量欄位）** | 欄位名稱（如 `title`） | ✅ | ✅ | ✅ | 需 frontmatter 在檔案開頭 |
| **frontmatter（陣列欄位）** | 欄位名稱（如 `tags`） | — | ❌ | — | type mismatch 錯誤 |

---

## 關鍵發現

### 1. Heading target 路徑規則

- **頂層 heading（H1）** → 直接用名稱即可
  - 例如：`編輯測試檔案` ✅
- **子層 heading（H2+）** → 必須使用完整父層路徑
  - 正確：`編輯測試檔案::第一章` ✅
  - 正確：`編輯測試檔案::第一章::第一節` ✅
  - 錯誤：`第一章` ❌
  - 錯誤：`編輯測試檔案 > 第一章` ❌
- 路徑分隔符號是 `::`（雙冒號），不是 `>` 也不是 `/`

### 2. MCP-only heading rename 可行（透過取代父層內容）

#### 2a. 直接 rename（不可行）

直接對目標 heading 操作無法 rename：
- `replace` / `append` / `prepend` 都只影響 heading 下方的內容
- heading 行文字本身保持不變

#### 2b. 間接 rename（可行 ✅ — 透過父層）

**重新命名 sub-heading，不需要 PUT API！** 關鍵技巧：

```
目標：將 `### Sub A1` 改名為 `### Sub A1 (Renamed)`
做法：replace 父層 heading `## Section A` 的內容
      content 第一行寫入新的 heading 名稱
```

| 層級 | 父層 target | 舊 heading | 新 heading | 結果 |
|------|------------|-----------|-----------|:----:|
| H2 子層 | `Root` | `## Section A` | `## Section A (Renamed)` | ✅ |
| H3 巢狀 | `Root::Section A` | `### Sub A1` | `### Sub A1 (Renamed)` | ✅ |

**原理**：`replace` 在父層 heading 上，會取代該 heading 下方的**所有內容**（不含 heading 行本身）。如果新內容的第一行是一個 heading 行，它就成為該位置的新 sub-heading，舊的 sub-heading 自然消失。

**限制**：
- 必須在 content 中包含**該父層下的所有內容**，不僅僅是 heading 行
- 父層內容越複雜，改寫越困難
- 不影響父層 heading 本身（如 `# Root` 無法透過此方式更名）

**適用場景**：
- 小範圍的 sub-heading rename
- 父層內容結構已知且可控
- 不想依賴 PUT API（適合純 MCP 操作）



### 3. Frontmatter 必要條件

- Frontmatter **必須在檔案最開頭**（標準 YAML 格式 `---\nkey: value\n---`）
- 若 frontmatter 位於檔案中間或其他位置，操作會回傳 `invalid-target`
- 陣列欄位（如 `tags`）無法用 `append`/`prepend` 直接操作

### 4. Block reference 最精準

- Block reference 的三種操作（replace/append/prepend）全部完美支援
- target 只需 block ID 名稱，不含 `^` 前綴

### 5. 透過 `simple_search` 檢查 heading 是否存在

使用 `obsidian_simple_search` 可檢查指定 heading 是否存在於 vault 中：

| 搜尋內容 | 結果 | 意義 |
|---------|:----:|------|
| `## Section A` | 有 match | ✅ heading 存在 |
| `## Section Z` | `[]`（空陣列） | ❌ heading 不存在 |

**注意**：`simple_search` 的比對是 **不區分大小寫** 的（`section a` 也可找到 `Section A`）。

### 6. 透過 `complex_search` + `regexp` 尋找 heading 模式

使用 `obsidian_complex_search` 搭配 `regexp` 運算子可在整個 vault 中搜尋 heading 模式：

| JsonLogic 查詢 | 用途 | 結果 |
|---------------|------|:----:|
| `{"regexp":["## [A-Z]", {"var":"content"}]}` | 找所有 H2 heading | ✅ |
| `{"regexp":["### [A-Z]", {"var":"content"}]}` | 找所有 H3 heading | ✅ |
| `{"regexp":["## Section B", {"var":"content"}]}` | 找特定 H2 heading | ✅ |

**限制**：
- `regexp` 是 **區分大小寫** 的（`section b` 不會找到 `Section B`）
- 不支援 `(?i)` inline flag（Error 40070）
- 不支援 multi-line `^` anchor
- 可用字元類別繞過：`[Ss]ection [Bb]` ✅

### 7. `replace` 空白內容限制

當嘗試 `replace` 清空 heading 下的內容時，API 會回傳：
- **錯誤**：`content-already-preexists-in-target`
- **原因**：API 認為新內容（空白/僅換行）與目標中的既有內容無差異，拒絕執行
- **解法**：必須提供至少一個非空白字元的實際內容

### 8. `replace` 可動態注入新 subheading

`replace` 操作可將內容中包含的新 heading 行一併寫入檔案，實現動態建立下層 heading：

```
// replace `Root::Section B` 的 content 設為：
### Sub B1

Content B1

### Sub B2

Content B2
```

建立後，新 subheading 可透過完整路徑編輯：
- `Root::Section B::Sub B1` ✅
- `Root::Section B::Sub B2` ✅

### 9. 特殊字元在 heading 名稱中的支援

| 字元 | 可作為 heading 名稱 | 可透過 `::` 路徑編輯 |
|:----:|:-------------------:|:-------------------:|
| `&` | ✅ | ✅ |
| `()` | ✅ | ✅ |
| `[]` | ✅ | ✅ |
| 數字 `123` | ✅ | ✅ |

需使用完整路徑 `Root::heading-name` 才能定位。

### 10. 連續多次編輯同一 heading

同一 heading 可連續進行多次 `patch_content` 操作（如 `replace` 後緊接 `append`），每次操作都會基於上一次的結果累積生效。

### 11. Heading rename 所有方法彙整

| # | 方法 | 工具 | 結果 | 限制 |
|---|------|------|:----:|------|
| A | 直接 target 該 heading `replace` | MCP `patch_content` | ❌ | API 設計上只能編輯 heading 下方內容 |
| B | **間接法：replace 父層 heading 內容** | MCP `patch_content` | ✅ **可行** | 需攜帶父層下所有內容；父層越大越難用 |
| C | 整份檔案 PUT 覆寫 | REST `PUT /vault/` | ✅ 可行 | **不推薦大檔案**；整份檔案傳輸 |
| D | Block reference 放在 heading 行上再 edit | MCP `patch_content` + block | ❌ | heading 行上的 block ref 不被識別為有效 target |
| E | Obsidian 內建指令 `editor:rename-heading` | REST `POST /commands/` | ❌ | 需游標位置 + 彈對話框等待輸入。不操作則編輯器卡在更名對話窗 |
| F | Obsidian 內建指令 `editor:set-heading-N` | REST `POST /commands/` | ❌ | 需游標位置，無對話框但仍需人工指定焦點 |
| G | Frontmatter `title` 欄位 | MCP `patch_content` + frontmatter | ⚠️ | 僅改變顯示名稱，不改變檔案中的 heading 文字 |

**結論**：純 MCP 工具唯一可行的 heading rename 方法是 **間接法（B）**，本質上仍是一種「有範圍的檔案覆寫」。

### 12. `application/json` + frontmatter：完美組合

| 操作 | 內容類型 | 純量欄位（如 `title`） | 陣列欄位（如 `tags`） | 數值欄位（如 `count`） |
|------|---------|:---------------------:|:--------------------:|:---------------------:|
| replace | `text/markdown` | ✅（但 YAML 可能被重整） | ❌ type mismatch | ✅（但存成字串） |
| replace | `application/json` | ✅（保持原始格式） | ✅（完整 JSON 序列化） | ✅（保留數值類型） |
| append | `application/json` | ✅（字串串接） | ❌ type mismatch | ❌ |
| prepend | `application/json` | ✅（字串串接） | ❌ type mismatch | ❌ |

**重要發現**：`application/json` 可解決 `text/markdown` 的 YAML 重整問題，陣列和數值都能正確處理。但 append/prepend 對陣列的操作仍有限制（API 底層限制）。

**建議**：操作 frontmatter 時優先使用 `application/json`。

### 13. `complex_search` 完整查詢能力

`obsidian_complex_search` 支援 JsonLogic 查詢，可透過多種運算子過濾檔案：

| 查詢目的 | JsonLogic | 結果 |
|---------|-----------|:----:|
| 路徑包含關鍵字 | `{"regexp":["keyword",{"var":"path"}]}` | ✅ |
| 內容包含關鍵字 | `{"regexp":["keyword",{"var":"content"}]}` | ✅ |
| 精確路徑比對 | `{"===":[{"var":"path"},"file.md"]}` | ✅ |
| 檔案大小 > N | `{">":[{"var":"stat.size"},100]}` | ✅ |
| 複合條件（AND） | `{"and":[...,...]}` | ✅ |
| 複合條件（NOT） | `{"!":[...]}` | ✅ |
| 標籤包含 | `{"in":["tag",{"var":"tags"}]}` | ✅ |

**限制**：
- Dataview DQL 查詢需要安裝 Dataview 外掛（否則 Error 40070）
- JsonLogic 使用標準運算子名稱（`===` 而非 `eq`，`!` 而非 `not`）
- `var` 可存取 NoteJson 物件屬性：`path`、`content`、`stat`、`frontmatter`、`tags`

### 14. 透過 REST API PUT 更改 heading 文字與層級

`patch_content` 無法修改 heading 行本身，但可直接呼叫 Obsidian REST API 的 `PUT /vault/{filename}` 來覆寫整個檔案。

```
環境變數：
  OBSIDIAN_API_KEY=xxx
  OBSIDIAN_PORT=27124
  OBSIDIAN_HOST=127.0.0.1

範例：
  curl -sk -X PUT "https://127.0.0.1:27124/vault/file.md" \
    -H "Authorization: Bearer $OBSIDIAN_API_KEY" \
    -H "Content-Type: text/markdown" \
    --data-binary @modified-file.md
```

| 操作 | 結果 | 說明 |
|------|:----:|------|
| 更改 heading 文字（如 `# Root` → `# Root (Renamed)`） | ✅ | sed 修改整份檔案後 PUT 回去 |
| 更改 heading 層級（如 `## A` → `# A`） | ✅ | 層級升降都支援 |
| 還原 heading 文字或層級 | ✅ | 再次 PUT 即可 |

**限制與風險**：
- ⚠️ **不推薦用於大檔案** — PUT 需讀取、修改、上傳整個檔案，檔案越大越容易出錯（race condition、記憶體不足、網路中斷）
- 更改後所有 `::` 路徑失效 — 必須使用新的 heading 文字重新建構路徑
- 無法進行局部編輯 — 一定要操作整個檔案
- API key 需從環境變數取得（`OBSIDIAN_API_KEY`）

**適用場景**：僅適用小檔案（如筆記、設定檔）且確實需要更改 heading 文字時。

### 12. 直接 REST API PATCH 與 MCP PATCH 的差異

| 特性 | MCP `patch_content` | 直接 REST `PATCH` |
|------|:-------------------:|:------------------:|
| HTTP Header 操作 | 自動處理 | 需手動設定 |
| 回傳內容 | 僅 `Success` 或 Error | 回傳修改後的完整檔案內容 |
| Content-Type | `text/markdown` | 支援 `text/markdown` / `application/json`（但 JSON 對 heading 無效） |
| URL-Encoding | 自動處理 | 需自行處理非 ASCII 字元 |

---

## 完整測試記錄

### heading 操作

| 測試方法 | 操作 | target | 結果 |
|---------|------|--------|:----:|
| patch_content | replace | `編輯測試檔案::第一章` | ✅ |
| patch_content | append | `編輯測試檔案::第一章` | ✅ |
| patch_content | prepend | `編輯測試檔案::第一章` | ✅ |
| patch_content | replace | `編輯測試檔案::第一章::第一節` | ✅（巢狀路徑）|
| patch_content | replace | `編輯測試檔案`（頂層） | ✅（僅用名稱）|
| patch_content | append | `編輯測試檔案`（頂層） | ✅（僅用名稱）|
| patch_content | prepend | `編輯測試檔案`（頂層） | ✅（僅用名稱）|
| patch_content | append | `第一章`（無路徑） | ❌ |
| patch_content | replace | `第一章`（無路徑） | ❌ |

### block 操作

| 測試方法 | 操作 | target | 結果 |
|---------|------|--------|:----:|
| patch_content | replace | `test-block` | ✅ |
| patch_content | append | `test-block` | ✅ |
| patch_content | prepend | `test-block` | ✅ |

### frontmatter 操作

| 測試方法 | 操作 | target | 結果 | 備註 |
|---------|------|--------|:----:|------|
| patch_content | replace | `title` | ✅ | 純量欄位 |
| patch_content | append | `title` | ✅ | 純量欄位，語意可能怪異 |
| patch_content | prepend | `title` | ✅ | 純量欄位 |
| patch_content | replace | `title`（不在開頭） | ❌ | Frontmatter 需在檔案開頭 |
| patch_content | append | `tags` | ❌ | 陣列欄位 type mismatch |

### append_content

| 方法 | 結果 | 備註 |
|------|:----:|------|
| append_content | ✅ | 最穩定；檔案不存在時自動建立；僅能附加到檔尾 |

### heading 存在性檢查

| 搜尋方式 | 查詢 | 結果 | 備註 |
|---------|------|:----:|------|
| simple_search | `## Section A`（存在） | ✅ 找到 | 用於檢查 heading 是否存在 |
| simple_search | `## Section Z`（不存在） | `[]` 空結果 | ✅ 正確判斷不存在 |
| simple_search | `section a`（全小寫） | ✅ 找到 | 不區分大小寫 |
| complex_search / regexp | `{"regexp":["## [A-Z]",{"var":"content"}]}` | ✅ 找到 | 找所有 H2 |
| complex_search / regexp | `{"regexp":["### [A-Z]",{"var":"content"}]}` | ✅ 找到 | 找所有 H3 |
| complex_search / regexp | `{"regexp":["## Section B",{"var":"content"}]}` | ✅ 找到 | 特定 H2 |
| complex_search / regexp | `{"regexp":["section b",{"var":"content"}]}` | `[]` | **區分大小寫** |
| complex_search / regexp | `{"regexp":["[Ss]ection [Bb]",{"var":"content"}]}` | ✅ 找到 | 字元類別繞過 |

### 巢狀 heading（多層級測試）

| 測試方法 | 操作 | target | 結果 | 備註 |
|---------|------|--------|:----:|------|
| patch_content | append | `Root::Section A::Sub A1`（3 層） | ✅ | 追加到 `#### Deep L4` |
| patch_content | append | `Root::Section A::Sub A1`（重複） | ✅ | 可連續追加 |

### 動態注入 subheading

| 測試方法 | 操作 | target / content | 結果 | 備註 |
|---------|------|-----------------|:----:|------|
| patch_content | replace | content 含 `### Sub B1` / `### Sub B2` | ✅ | replace 內容嵌入新 heading 行 |
| patch_content | append | `Root::Section B::Sub B1` | ✅ | 新建立者可正常編輯 |
| patch_content | replace | `Root::Section B::Sub B1` | ✅ | 同上 |

### 特殊字元 heading

| 測試方法 | 操作 | target | 結果 |
|---------|------|--------|:----:|
| append_content（建立） | — | `Special: test (parentheses) & [brackets] & numbers 123` | ✅ |
| patch_content | replace | `Root::Special: test (parentheses) & [brackets] & numbers 123` | ✅ |
| patch_content | append | `Root::Special: test (parentheses) & [brackets] & numbers 123` | ✅ |

### replace 空內容測試

| 測試方法 | 操作 | target | content | 結果 |
|---------|------|--------|---------|:----:|
| patch_content | replace | `Root::Section B` | `[空字串]` | ❌ `invalid-target`（target not found）|
| patch_content | replace | `Root::Section B` | `[僅換行]` | ❌ `content-already-preexists-in-target` |
| patch_content | replace | `Root::Section B` | `Content B Updated` | ✅ 正常內容可 replace |
| patch_content | replace | `Root::Section A::Sub A1` | `[單一空格]` | ❌ `content-already-preexists-in-target` |

### MCP rename heading（透過父層 replace）

| 測試方法 | 操作 | target | content 第一行 | 結果 |
|---------|------|--------|---------------|:----:|
| patch_content | replace | `Root`（H2 父層） | `## Section A (Renamed via MCP)` | ✅ H2 成功更名 |
| patch_content（更名後） | append | `Root::Section A (Renamed via MCP)` | — | ✅ 新 H2 可編輯 |
| patch_content | replace | `Root::Section A`（H3 父層） | `### Sub A1 (Renamed via MCP)` | ✅ H3 成功更名（巢狀） |
| patch_content（更名後） | append | `Root::Section A::Sub A1 (Renamed via MCP)` | — | ✅ 新 H3 可編輯 |

### PUT API 更改 heading 文字

| 方法 | 操作 | 結果 | 備註 |
|------|------|:----:|------|
| PUT /vault/_heading-research.md | 改 `# Root` → `# Root (via PUT API)` | ✅ | heading 文字成功變更 |
| PUT /vault/_heading-research.md | 改 `# Root (via PUT API)` → `# Root` | ✅ | 可還原 |
| PUT /vault/_heading-research.md | 改 `## Section A` → `# Section A`（H2→H1） | ✅ | 層級變更成功 |
| MCP patch_content（更名後） | append `Root::Section A` | ❌ | 原 `::` 路徑失效 |
| MCP patch_content（更名後） | append `Root (via PUT API)::Section A` | ✅ | 需使用新文字路徑 |
| MCP patch_content（層級變更後） | append `Root::Section A::Sub A1` | ❌ | Section A 不再是 Root 的子層 |
| MCP patch_content（層級變更後） | append `Section A::Sub A1` | ✅ | H2→H1 後需移除 Root 前綴 |

### 直接 REST API 操作（非 MCP）

| 方法 | 內容類型 | target | 結果 | 備註 |
|------|---------|--------|:----:|------|
| PATCH /vault/... | `text/markdown` | heading | ✅ 成功 | 回傳完整檔案內容 |
| PATCH /vault/... | `application/json` | heading | ❌ | `content-type-invalid-for-target` |

### REST JSON + frontmatter

| 方法 | 操作 | content | 結果 | 備註 |
|------|------|---------|:----:|------|
| PATCH /vault/... JSON | replace `title` | `"Updated via JSON"` | ✅ | 純量字串 |
| PATCH /vault/... JSON | replace `count` | `99` | ✅ | 數值保留類型 |
| PATCH /vault/... JSON | replace `tags` | `["json","updated"]` | ✅ | 陣列正確序列化 |
| PATCH /vault/... JSON | append `tags` | `"appended"` | ❌ | 陣列仍不支援 append |
| PATCH /vault/... JSON | prepend `tags` | `"prepended"` | ❌ | 陣列仍不支援 prepend |
| PATCH /vault/... JSON | append `title` | `" - appended"` | ✅ | 純量 append 可 |

### complex_search (JsonLogic) 查詢能力

| 查詢目的 | JsonLogic | 結果 |
|---------|-----------|:----:|
| path 包含 "heading" | `{"regexp":["heading",{"var":"path"}]}` | ✅ 找到 `_heading-research.md` 等 |
| content 包含 "PUT API" | `{"regexp":["PUT API",{"var":"content"}]}` | ✅ `[]`（正確無結果）|
| 精確 path 比對 | `{"===":[{"var":"path"},"_blockref-heading.md"]}` | ✅ 單一結果 |
| 檔案大小 > 100 | `{">":[{"var":"stat.size"},100]}` | ✅ 過濾小檔案 |
| AND 複合條件 | `{"and":[{"regexp":["heading",{"var":"path"}]},{">":[{"var":"stat.size"},200]}]}` | ✅ 交集正確 |
| NOT 排除 | `{"!":[{"regexp":["heading",{"var":"path"}]}]}` | ✅ 補集正確 |
| 標籤包含 | `{"in":["test",{"var":"tags"}]}` | ✅ |

### 19. JSON 檔案讀寫支援

Obsidian REST API 支援 JSON 檔案的建立、讀取與覆寫，但搜尋 API 不索引非 `.md` 檔案。

#### 19a. 建立 / 覆寫 JSON 檔案

使用 `PUT /vault/{file}` 搭配 `application/json` content-type：

```bash
curl -sk -X PUT "https://127.0.0.1:27124/vault/data.json" \
  -H "Authorization: Bearer $OBSIDIAN_API_KEY" \
  -H "Content-Type: application/json" \
  --data-binary '{"key":"value","count":42}'
```

| Content-Type | 結果 | 備註 |
|-------------|:----:|------|
| `application/json` | ✅ | 正確寫入 JSON 內容 |
| `text/markdown` | ✅ | 也可用（存為純文字） |

#### 19b. 讀取 JSON 檔案

```bash
# 純文字讀取（預設）
curl -sk "https://127.0.0.1:27124/vault/data.json" -H "Authorization: Bearer $OBSIDIAN_API_KEY"
# → {"key":"value","count":42}

# Note JSON 格式（結構化）
curl -sk "https://127.0.0.1:27124/vault/data.json" \
  -H "Authorization: Bearer $OBSIDIAN_API_KEY" \
  -H "Accept: application/vnd.olrapi.note+json"
# → { "path": "data.json", "content": "{\"key\":\"value\",\"count\":42}", "stat": {...}, "frontmatter": {}, "tags": [] }
```

#### 19c. JSON 檔案編輯限制

| 操作 | 結果 | 說明 |
|------|:----:|------|
| `PUT` (`application/json`) | ✅ | 建立/覆寫 |
| `PATCH` + heading target (`text/markdown`) | ⚠️ | 會附加純文字到檔尾，**可能破壞 JSON 格式** |
| `PATCH` + heading target (`application/json`) | ❌ | `content-type-invalid-for-target`（JSON 僅支援 frontmatter target） |
| `POST` (`application/json`) | ❌ | Error 40010：需使用 `text/*` content-type |
| `GET` | ✅ | 正常讀取 |
| `GET` (Note JSON) | ✅ | 正常讀取（含結構化資料） |
| Search 索引 | ❌ | `.json` 檔案不納入搜尋索引 |

**結論**：JSON 檔案在 Obsidian vault 中可讀寫，但無法透過搜尋 API 找到，且不能使用 PATCH 精準編輯欄位。適合存放純資料檔案。

### 20. 搜尋 API 僅索引 `.md` 檔案

**重要限制**：Obsidian Local REST API 的搜尋功能（包含 `simple_search` 和 `complex_search`）**只會索引 `.md` 檔案**，非 markdown 檔案（`.json`、`.txt`、圖片等）完全不可搜尋。

#### 實測結果

| 搜尋方式 | 查詢內容 | `.json` 檔案結果 | `.md` 檔案結果 |
|---------|---------|:----------------:|:--------------:|
| `complex_search` (regexp) | `{"regexp":["clean",{"var":"content"}]}` | ❌ 沒找到 | ✅ 找到 |
| `complex_search` (glob path) | `{"glob":["*.json",{"var":"path"}]}` | ❌ 空陣列 | 不適用 |
| `simple_search` | `query=overwritten` | ❌ 沒找到 | ✅ 找到 |
| `GET /vault/` | 列出 vault | ✅ **列出** `.json` | ✅ 列出 |

#### 搜尋範圍

| 資料類型 | 可讀取 (`GET`) | 可搜尋 (`POST /search/`) |
|---------|:-------------:|:-----------------------:|
| `.md` 檔案 | ✅ | ✅ |
| `.json` 檔案 | ✅ | ❌ |
| 子目錄內 `.md` | ✅ | ✅ |
| 子目錄內 `.json` | ✅ | ❌ |

**結論**：搜尋 `\.md$` 時相當於搜尋所有 vault 檔案；但非 markdown 檔案僅能透過 `GET /vault/{filepath}` 直接讀取，無法透過搜尋找到。

### 21. 目錄遍歷防護（Directory Traversal Protection）

Obsidian REST API 正確阻擋了所有嘗試逸出 vault 根目錄的路徑操縱：

| 嘗試的方法 | 路徑 | HTTP 狀態碼 | 結果 |
|-----------|------|:-----------:|:----:|
| 相對路徑逸出 | `../_test-data.json` | 404 | ✅ 阻擋 |
| URL 編碼逸出 | `%2e%2e/_test-data.json` | 404 | ✅ 阻擋 |
| 絕對路徑 | `C:/Users/.../obsidian.json` | 404 | ✅ 阻擋 |
| 子目錄正常存取 | `vscode/` | 200 | ✅ 正常運作 |

**安全模型**：所有 `vault/` 路徑都解析為 vault 根目錄下的相對路徑，無法透過 `../` 或編碼逸出離開 vault 範圍。

### 22. `/active/` 端點與 `batch_get_file_contents`

#### `/active/` 端點

`GET /active/` 會回傳**目前 Obsidian 編輯器中正在編輯的檔案內容**：

```bash
curl -sk "https://127.0.0.1:27124/active/" -H "Authorization: Bearer $OBSIDIAN_API_KEY"
# → 回傳與 `GET /vault/{current-file}` 相同的原始內容
```

**用途**：
- 無需知道當前檔案路徑即可取得內容
- 適用於輔助 agent 判斷使用者目前編輯的檔案
- 支援全部 HTTP 方法（GET/PUT/POST/PATCH/DELETE）

#### `batch_get_file_contents`（MCP-only）

`obsidian_batch_get_file_contents` 是 **MCP 層封裝的功能**，非單一 REST API 端點測試時 `/vault/batch/` 回傳 40510（目錄錯誤），證實無對應 REST 端點。其實作方式為 MCP wrapper 內部發送多個 `GET /vault/{filename}` 請求後合併結果。

---

## 注意事項

1. **路徑分隔符號**：heading 路徑使用 `::`（雙冒號），不是 `>` 也不是 `/`
2. **heading rename：間接法可行**：`patch_content` 無法直接修改 heading 行文字，但可透過 **replace 父層 heading 內容** 的方式間接 rename sub-heading。父層內容需包含所有子內容
3. **Frontmatter 位置**：必須在檔案最開頭才能被正確辨識
4. **陣列欄位限制**：frontmatter 陣列欄位無法用 append/prepend 操作
5. **Block ID**：使用不含 `^` 前綴的名稱
6. **heading 存在性檢查**：`simple_search` 可快速確認 heading 是否存在（有結果 = 存在，空陣列 = 不存在）。`complex_search` + `regexp` 可做模式匹配（如全 vault 找 H2）
7. **大小寫敏感性差異**：`simple_search` 不區分大小寫；`complex_search` 的 `regexp` 區分大小寫，可用字元類別 `[Ss]` 繞過
8. **replace 不可清空內容**：replace 操作**必須提供至少一個非空白字元**，否則 API 會回傳 `content-already-preexists-in-target`
9. **replace 可動態注入 subheading**：replace 的 content 中包含新 heading 行（如 `### New`），可直接建立子層 heading，且後續可用完整路徑編輯
10. **`regexp` 限制**：不支援 `(?i)` inline flag，不支援 multi-line `^` anchor
11. **PUT API 改 heading**：MCP 無 `PUT` 工具，需直接呼叫 REST API（`curl`），但 **PUT 覆寫整個檔案，不建議用於大檔案**
12. **PUT 後 `::` 路徑全失效**：heading 文字一改，所有依賴該文字的路徑都需要更新
13. **`application/json` 無效**：對 heading target 操作僅支援 `text/markdown`
14. **MCP rename 的取捨**：父層 replace 可 rename sub-heading，但必須攜帶父層下所有內容。父層越大越難用；純 MCP rename H1 本身不可行（H1 無父層可 replace）
15. **Frontmatter 操作優先使用 `application/json`**：可正確處理陣列序列化與數值類型，避免 YAML 重整問題。但陣列欄位的 append/prepend 仍受限（API 底層限制，無論 content-type）
16. **`complex_search` (JsonLogic) 支援豐富查詢**：可依 `path`、`content`、`stat.size`、`frontmatter`、`tags` 等屬性過濾，支援 `===`、`>`、`and`、`!`、`regexp`、`glob`、`in` 等運算子
17. **Dataview DQL 查詢需安裝 Dataview 外掛**：否則回傳 Error 40070
18. **Commands API 不可靠**：HTTP 204 不表示可程式化完成。`editor:rename-heading`、`workspace:export-pdf` 等雖回傳 204，但會開對話框等人處理。需人工干預的指令皆不可用於自動化
