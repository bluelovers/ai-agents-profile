---
name: obsidian-fm-tags
description: |
  處理 Obsidian 筆記中 frontmatter 標籤（tags）的技能的技能，包括新增、驗證、格式化與提取。

  Triggers when user mentions:
  - "添加 Obsidian 標籤"
  - "管理 Obsidian tags"
  - "Obsidian 前頁標籤 / frontmatter tags"
  - "obsidian 標籤格式 / tag format"
  - "驗證 Obsidian 標籤 / validate Obsidian tags"
tags:
  - obsidian
  - markdown/frontmatter
  - tags
  - note-taking
  - markdown
  - agents/skills
---

# Obsidian Frontmatter Tags 技能

此技能協助在 Obsidian 筆記的 frontmatter 中正確管理 `tags` 欄位，確保標籤符合 Obsidian 的標籤格式規範。

---

## 標籤格式規則

Obsidian 的 `tags` 位於 frontmatter（YAML 區塊）中，格式為**文字陣列**。

### 有效字元

標籤可使用以下字元：

| 類別 | 字元 |
|------|------|
| 字母 | `A-Z`, `a-z` |
| 數字 | `0-9` |
| 底線 | `_` (Underscore) |
| 連字號 | `-` (Hyphen) |
| 斜線 | `/`（用於巢狀標籤 / Nested tags） |
| Unicode | 通用 Unicode 字元 |

### 限制

- ❌ 標籤**不能完全由數字組成**。例如 `#1984` 無效，但 `#y1984` 有效。
- ✅ 標籤必須包含至少一個非數值字元。

### 巢狀標籤

**適度使用巢狀標籤**，僅在有意義的層級關係時使用 `/` 分隔。不需要所有標籤都使用巢狀格式，也不需要同一份檔案中的所有標籤共享相同的上級標籤。每個標籤獨立表達自身的領域路徑。

```yaml
---
tags:
  - git                       # ✅ 無層級關係時，使用獨立標籤
  - github                    # ✅ 獨立標籤
  - github/cli                # ✅ 僅在有必要層級時才巢狀
  - github/cli/workflow       # ✅ 進一步細分
  - powershell                # ✅ 跨領域標籤，無需強制巢狀
---
```

#### 巢狀使用原則 / Nesting Principles

| 情境 | 做法 | 範例 |
|------|------|------|
| 有明確層級關係 | 使用巢狀 `/` | `nodejs/vitest/cli` |
| 無上下層關係 | 使用獨立標籤 | `git` + `github` (非 `git/github`) |
| 跨領域標籤 | 獨立標籤，無需強制巢狀 | `powershell` 不應硬套為 `github/powershell` |
| 同一檔案多標籤 | 各標籤獨立表達自身領域路徑 | `git` + `github/cli` 共存 |

#### 不良範例 / Bad Examples

```yaml
# ❌ 強制所有標籤共享上級（git 不應巢狀於 github 下）
tags:
  - git/github
  - git/github/cli
  - git/github/cli/workflow

# ❌ 跨領域標籤被硬套巢狀
tags:
  - github/cli/powershell   # powershell 不是 github 的子領域
```

#### 良好範例 / Good Examples

```yaml
# ✅ 各標籤獨立表達自身層級
tags:
  - git
  - github
  - github/cli
  - github/cli/workflow
  - powershell
```

---

## Frontmatter 格式

### 多行列表格式（推薦）

```yaml
---
tags:
  - tag1
  - tag2
  - project/active
  - area/health
---
```

### 行內陣列格式（單行）

> 僅限系統限制時使用

```yaml
---
tags: [tag1, tag2, project/active]
---
```

---

## 快速使用

### 新增標籤到筆記

透過 Obsidian REST API 的 `vault_patch` 工具操作：

```typescript
// 使用操作：在 frontmatter 的 tags 陣列中附加
await mcp-obsidian-local-rest-api-http_vault_patch({
  path: "note.md",
  targetType: "frontmatter",
  target: "tags",
  operation: "append",
  contentType: "application/json",
  content: ["new-tag", "project/active"],
  createTargetIfMissing: true,
});
```

### 驗證標籤

使用 `scripts/validate-tags.ts` 驗證一組標籤是否合法：

```bash
tsx ".opencode/skills/obsidian-fm-tags/scripts/validate-tags.ts" "tag1" "project/active" "1984"
```

### 從筆記提取標籤

使用 `scripts/extract-tags.ts` 從 markdown 檔案提取 tags：

```bash
tsx ".opencode/skills/obsidian-fm-tags/scripts/extract-tags.ts" "path/to/note.md"
```

---

## Scripts 說明

`scripts/` 目錄下的工具腳本：

| 腳本 | 用途 | 執行方式 |
|------|------|---------|
| `validate-tags.ts` | 驗證標籤字串是否符合 Obsidian 規則 | `tsx scripts/validate-tags.ts <tag1> <tag2> ...` |
| `extract-tags.ts` | 從 markdown 檔案提取 frontmatter tags | `tsx scripts/extract-tags.ts <file-path>` |

---

## 常見問題

### Q: 標籤可以包含空格嗎？

❌ **不行。** Obsidian 的 tags 不允許空格。若需要多詞標籤，請使用：
- 連字號：`code-review`
- 底線：`code_review`
- 駝峰：`codeReview`

### Q: 標籤可以包含大寫字母嗎？

✅ **可以。** 但 Obsidian 在顯示時會保留原始大小寫。建議統一使用小寫以維持一致性。

### Q: 如何移除一個標籤？

目前 Obsidian Local REST API 不支援直接從陣列中移除單一元素。需先讀取完整 tags 陣列，在用戶端過濾後，再使用 `replace` 操作覆寫：

```typescript
// 1. 讀取當前 tags
const note = await vault_read({ path: "note.md" });
const currentTags = note.frontmatter.tags; // ["tag1", "tag2", "tag3"]

// 2. 過濾掉要移除的標籤
const filteredTags = currentTags.filter(t => t !== "tag2");

// 3. 覆寫 tags
await vault_patch({
  path: "note.md",
  targetType: "frontmatter",
  target: "tags",
  operation: "replace",
  contentType: "application/json",
  content: filteredTags,
});
```

### Q: 標籤中可以使用哪些 Unicode 字元？

✅ 大部分通用 Unicode 字元皆可，包含：
- 中文：`專案/進行中`
- 日文：`プロジェクト/完了`

---

## 標籤標準化

為了避免語意重複的標籤，請參閱 [tag-normalization.md](references/tag-normalization.md) 參照檔案。

### 常見標準化規則

- **使用小寫字母**：`Node.js` → `nodejs`
- **使用連字號分隔多詞**：`code review` → `code-review`
- **移除特殊字元**：`C++` → `cpp`, `C#` → `csharp`

## 參考資源

- [Obsidian 官方標籤格式文件](https://help.obsidian.md/Editing+and+formatting/Tags)
