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

## 巢狀標籤建議

### 巢狀標籤範例

```yaml
tags:
  - status/closed
  - documentation/references
```

---

## 參考資源

