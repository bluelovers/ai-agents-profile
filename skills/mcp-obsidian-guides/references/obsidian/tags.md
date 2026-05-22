---
tags:
  - obsidian
  - tags
  - markdown/frontmatter
  - note-taking
  - documentation/references
---

## 🏷️ 標籤說明（多級標籤系統）

本文件使用層級化標籤（`level1/level2` 格式），便於分類與交集查詢：

| 標籤路徑 | 說明 |
|---------|------|
| `mcp/comparison` | MCP 工具比較文章 |
| `mcp/browser-automation` | 瀏覽器自動化主題 |
| `kapture-mcp` | Kapture MCP 專用標籤 |
| `chrome-devtools-mcp` | Chrome DevTools MCP 專用標籤 |
| `obsidian-mcp` | Obsidian MCP 專用標籤 |
| `comparison/feature-matrix` | 功能矩陣比較類型 |
| `stable-diffusion` | Stable Diffusion 相關標籤 |

### 🌳 多級標籤的優勢

```
單一標籤問題：
  "prompts" → 不明確，無法分辨是什麼的 prompts

多級標籤解決：
  "prompts/img-gen" → 明確表示這是關於圖片生成的 prompts
  "prompts/stable-diffusion" → 明確表示這是關於 Stable Diffusion 的 prompts
  "mcp/browser-automation" → 屬於以 MCP 為基礎的瀏覽器自動化主題
  "browser-automation" → 屬於瀏覽器自動化主題

交集查詢範例：
  tag:#stable-diffusion AND ( tag:#img-gen OR tag:#prompts/stable-diffusion )
  → 找出所有關於 Stable Diffusion 圖片生成的 prompts
```
