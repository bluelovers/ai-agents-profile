---
tags:
  - documentation/references
  - GitHub
  - URL
  - resolution
---

# GitHub URL 解析規則

## 規則

當使用者提供 GitHub 連結（包含 PR、Issue、Commit 等）時，應自動解析該網址所屬的倉庫，而不是假設它存在於本倉庫（current repository）。

### 解析邏輯

| 網址類型 | 範例 | 解析方式 |
|---------|------|----------|
| Issue | `github.com/org/repo/issues/123` | 解析 `org/repo` |
| PR | `github.com/org/repo/pulls/456` | 解析 `org/repo` |
| Commit | `github.com/org/repo/commit/abc123` | 解析 `org/repo` |
| 文件 | `github.com/org/repo/blob/main/README.md` | 解析 `org/repo` |

### 錯誤假設

❌ **錯誤**：假設 GitHub URL 存在於本倉庫

```
使用者在 OpenCode/OpenCode 倉庫中提到：
「請查看 github.com/anomalyco/opencode/issues/24444」

錯誤假設：嘗試在 current repository 中尋找這個 issue
```

✅ **正確**：解析網址中的實際倉庫

```
使用者在 OpenCode/OpenCode 倉庫中提到：
「請查看 github.com/anomalyco/opencode/issues/24444」

正確做法：
1. 解析網址：github.com/anomalyco/opencode
2. 在 anomalyco/opencode 倉庫中執行操作
```

### 使用 GitHub CLI 的正確方式

```bash
# ❌ 錯誤：假設 issue 存在於本倉庫
gh issue view 24444

# ✅ 正確：指定目標倉庫
gh issue view 24444 -R anomalyco/opencode
gh issue view 24444 -R owner/repo

# 其他 GitHub CLI 指令同理
gh pr view 123 -R anomalyco/opencode
gh commit view abc123 -R anomalyco/opencode
gh issue comment 123 -R anomalyco/opencode --body "..."
```

### 實作檢查清單

當收到 GitHub URL 時：

- [ ] 解析網址中的組織/倉庫名稱（org/repo）
- [ ] 不要使用 `-R current`，而是要使用 `-R owner/repo`
- [ ] 如果網址包含 `/blob/`、`/tree/` 等路徑，同樣需要解析完整的倉庫名稱
- [ ] 對於 pull request、issue、commit 等各種 GitHub 資源都適用此規則

### 常見模式

```bash
# 解析 issue
github.com/anomalyco/opencode/issues/24444
→ owner: anomalyco, repo: opencode

# 解析 pull request
github.com/microsoft/typescript/pull/123
→ owner: microsoft, repo: typescript

# 解析 commit
github.com/facebook/react/commit/abc123
→ owner: facebook, repo: react
```

### 與其他工具整合

此規則也適用於其他需要操作非本倉庫資源的場景：

- `gh` - GitHub CLI
- `webfetch` - 網頁擷取工具
- 其他涉及外部倉庫的 GitHub 操作
