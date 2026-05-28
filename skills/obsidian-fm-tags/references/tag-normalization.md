---
name: tag-normalization
description: |
  標籤的標準化參照檔案，用於避免語意重複的標籤。
  定義標籤的正規化規則與常見語意重複的標籤對照表。
tags:
  - obsidian
  - tags
  - documentation/references
---

# 標籤標準化參照
# Tag Normalization Reference

本參照檔案定義 Obsidian 標籤的正規化規則，避免產生常見語意重複的標籤。

This reference file defines tag normalization rules for Obsidian to avoid semantic duplicate tags.

---

## 標準化原則

### 1. 使用小寫字母

**規則：** 標籤一律使用小寫字母，以確保一致性。

```
❌ 錯誤：Node.js, Python, JavaScript
✅ 正確：nodejs, python, javascript
```

### 2. 使用連字號分隔多詞

**規則：** 多詞標籤使用連字號 (`-`) 分隔，不使用空格或底線。

```
❌ 錯誤：code review, code_review, CodeReview
✅ 正確：code-review
```

### 3. 避免特殊字元

**規則：** 除斜線 (`/`) 用於巢狀標籤外，避免使用其他特殊字元。

```
❌ 錯誤：c++, c#, .net
✅ 正確：cpp, csharp, dotnet
```

---

## 常見語意重複標籤對照表

### 程式語言

| 語意 或 名稱 | 標準化後 | 備註 |
|---------|---------|------|
| NodeJS , Node.js | `nodejs` | 移除點號 |
| JavaScript , JS | `javascript` |  |
| TypeScript , TS | `typescript` |  |
| Python , Python3 | `python` |  |
| C++ | `cpp` | 使用通用縮寫 |
| C# | `csharp` | 使用通用縮寫 |
| .NET | `dotnet` | 移除前綴點 |
| Go | `golang` | 使用完整名稱 |
| SCSS | `css/scss` |  |

### 框架與函式庫

| 語意 或 名稱 | 標準化後 | 備註 |
|---------|---------|------|
| React , ReactJS | `react` | 統一小寫 |
| Vue.js, VueJS | `vue` | 統一小寫 |
| Next.js | `nextjs` | 移除點號 |
| Nuxt.js | `nuxtjs` | 移除點號 |

### 工具與平台

| 語意 或 名稱 | 標準化後 | 備註 |
|---------|---------|------|
| GitHub Actions, GitHubActions | `github-actions` | 使用連字號 |

### 測試相關

| 語意 或 名稱 | 標準化後 | 備註 |
|---------|---------|------|
| jest | `testing/jest` |  |
| vitest | `testing/vitest` |  |
| mocking | `testing/mock` |  |
| snapshot | `testing/snapshot` |  |

### Agents / Skills 相關

| 語意 或 名稱 | 標準化後 | 備註 |
|---------|---------|------|
| agent 的 skills | `agents/skills` |  |
| agent 的 guides | `agents/guidelines` |  |
| agent 的 behavior | `agents/behavior` |  |
| agent 的 tool | `agents/tools` |  |

### 其他

| 語意 或 名稱 | 標準化後 | 備註 |
|---------|---------|------|
| reference , references | `documentation/references` |  |
| 編碼風格 的 Allman | `coding-style/Allman` |  |
| commit | `git/commit` |  |
| VS-Code | `vscode` |  |
| docs | `documentation` |  |
| guide , cookbook | `guidelines` |  |
| tsconfig | `typescript/tsconfig` |  |


---

## 巢狀標籤適度使用原則

### 核心原則

**適度使用巢狀標籤 (nested tags)**，僅在有意義的層級關係時使用 `/` 分隔。不需要所有標籤都使用巢狀格式，也不需要同一份檔案中的所有標籤共享相同的上級標籤。每個標籤獨立表達自身的領域路徑。

### 巢狀使用決策表

| 情境 | 做法 | 範例 |
|------|------|------|
| 有明確層級關係 | 使用巢狀 `/` | `nodejs/vitest/cli` |
| 無上下層關係 | 使用獨立標籤 | `git` + `github` (非 `git/github`) |
| 跨領域標籤 | 獨立標籤，無需強制巢狀 | `powershell` 不應硬套為 `github/powershell` |
| 同一檔案多標籤 | 各標籤獨立表達自身領域路徑 | `git` + `github/cli` 共存 |

### 不良範例

```yaml
# ❌ 強制所有標籤共享上級（git 不應巢狀於 github 下）
tags:
  - git/github
  - git/github/cli
  - git/github/cli/workflow

# ❌ 跨領域標籤被硬套巢狀
tags:
  - github/cli/powershell   # powershell 不是 github 的子領域

# ❌ 無意義上級標籤 + 跨領域誤巢狀
tags:
  - domain/uber-drivers/heroui   # domain 為無意義前綴；heroui 不屬於 uber-drivers
```

### 良好範例

```yaml
# ✅ 各標籤獨立表達自身層級
tags:
  - git
  - github
  - github/cli
  - github/cli/workflow
  - powershell
```

### 巢狀標籤基礎語法

```yaml
# 有意義的層級關係
tags:
  - status/closed
  - documentation/references
  - projects/active/web
```

---

## 參考資源

