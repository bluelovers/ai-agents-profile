---
name: agent-operation-restrictions
description: |-
  定義 Agent 在執行任務時必須遵守的嚴格操作限制，防止未授權的破壞性或副作用操作。
  涵蓋指令執行規範包含但不限於（禁止 npx、cd 前置、>nul）、禁止自行管理依賴、禁止啟停伺服器、
  禁止 git 寫入操作，以及檔案搬移的正確方式。

  當使用者提及包含但不限於以下關鍵字或情境時觸發：
  - "嚴格限制" 或 "操作限制"
  - "禁止 npx" 或 "不要用 npx"
  - "不要自行安裝" 或 依賴
  - 伺服器
  - 工具呼叫錯誤或失敗 或 無權限 或 deny
  - "operation restrictions" 或 "agent rules"
  - "forbidden operations"
tags:
  - agents/rules
  - agents/restrictions
  - agents/safety
  - agents/execution
  - nodejs
---

# Agent 操作嚴格限制 | Agent Operation Restrictions

本技能定義 Agent 在執行任務時必須遵守的操作邊界，確保不會在未獲使用者明確授權的情況下執行具破壞性或難以復原的操作。

---

## 🚫 四大禁止類別（需明確授權才可執行）

1. **安裝/移除/變更依賴套件** — 不自行執行 `pnpm install`、`npm install` 等
2. **啟動或停止伺服器** — 不自行執行 `pnpm run dev`、`node server.js` 等
3. **git 寫入操作** — 不自行執行 `git add`、`git commit`、`git push` 等（唯讀 git 指令視需要可用）
4. **錯誤的檔案搬移方式** — 搬移檔案必須用移動指令，禁止「刪除 → 重建」

> 詳細禁止操作與授權判斷準則 → [forbidden-operations.md](./references/forbidden-operations.md)

---

## ⚙️ 指令執行規則摘要

| 規則 | 說明 |
|---|---|
| ✅ 優先使用 `package.json` scripts | 有對應 script 時，一律先用它；不符合需求時才直接呼叫工具 |
| 🚫 禁止 `npx` | 改用 `package.json` scripts 或直接呼叫工具 |
| 🚫 禁止 `node_modules/.bin/` | 直接呼叫工具名稱即可 |
| 🚫 避免 `cd xxx &&` 前置 | 透過工具的 `cwd` 參數指定工作目錄 |
| 🚫 避免 `>nul` | Windows 環境可能產生無法刪除的 nul 裝置檔 |
| ⚠️ `ynpx` 是模組名稱 | 不是 yarn 專屬工具, 僅在直接呼叫失敗且必要時才使用 |
| ⚠️ `pnpm dlx` 謹慎使用 | 僅在直接呼叫失敗且必要時才使用 |

### TypeScript 執行優先順序
1. 直接呼叫 `tsx path/to/file.ts`
2. 失敗則改用 `ts-node path/to/file.ts`
3. 皆失敗則記錄至 `docs/ts-node-required.md` 並告知使用者

> 完整指令執行規則與範例 → [command-execution-rules.md](./references/command-execution-rules.md)

---

## 🔗 相關參照資源

- ⚙️ **指令執行規則與正確/錯誤範例**：[command-execution-rules.md](./references/command-execution-rules.md)
- 🚫 **禁止操作清單與授權判斷準則**：[forbidden-operations.md](./references/forbidden-operations.md)
