---
name: nodejs-npm-scripts
description: |-
  規範 Node.js package.json scripts 的執行方式：script 名稱不含符號時預設以模組管理工具執行
  （如 pnpm run test）以觸發生命週期；名稱含 : 等符號時以 node --run 執行（不觸發生命週期）。

  當執行相關行為或使用者提及時觸發（包含但不限於以下關鍵字或情境）：
  - 執行 package.json scripts（test、build、lint、dev 等）
  - 選擇 "pnpm run" / "npm run" / "yarn run" 的執行方式
  - 使用 "node --run xxx" 或 "node --run xxx:yyy" 的時機
  - 執行方式的選擇：名稱不含符號預設用管理工具，含 ":" 用 node --run
  - script 名稱含 ":" 等符號時的執行方式
tags:
  - nodejs
  - npm
  - scripts
  - lifecycle-scripts
  - command-execution
  - agents/skills
---

# Node.js npm Scripts 執行規範

本技能規範執行 `package.json` 中 `scripts` 時的指令選擇，與 [agent-operation-restrictions](../agent-operation-restrictions/SKILL.md) 的「優先使用 `package.json` scripts」互補：該技能決定「用 script」，本技能決定「怎麼跑」。

## 核心規則

| 情境 | 執行方式 | 範例 |
| :--- | :--- | :--- |
| script 名稱**不含**符號（基本指令） | 模組管理工具 `run`（預設） | `pnpm run test` |
| script 名稱**含** `:` 等符號 | `node --run` | `node --run build:types` |

**原因：** 只有透過模組管理工具的 `run` 執行，才會觸發完整的生命週期（`pre` / `post` 只是最簡單易懂的範例，實際上還有更複雜的呼叫鏈存在，本技能不逐一說明其機制）。`node --run` 直接執行 script 本體，**不會觸發**任何生命週期。

## 判斷流程

script 名稱是否包含 `:` 等符號？

- **不包含** → 預設以模組管理工具執行：`<pm> run <name>`（範例：`pnpm run test`）
- **包含** → `node --run <name>`（範例：`node --run build:types`）

**禁止主動檢查 script 是否定義 `pre` / `post` 等生命週期** —— 是否觸發生命週期由執行方式決定，無需讀取 `package.json` 判斷；不含符號即走模組管理工具，生命週期交由工具自行處理。

## 模組管理工具的選擇

以專案既有工具為準（依 lockfile 判斷：`pnpm-lock.yaml` → `pnpm`、`package-lock.json` → `npm`、`yarn.lock` → `yarn`），不得混用。

## 注意事項

- **`node --run` 需 Node.js 22+**；其特性與限制詳見 [execution-rules.md](./references/execution-rules.md)。
- **傳遞參數給 `node --run` 需以 `--` 分隔**：`node --run test -- --verbose`。
- **禁止自行拆解內部指令**：執行 `<pm> run test` 時生命週期已自動帶出，**無必要的特殊因素以外，請勿自行拆解 script 的內部指令**（例如拆成 `pretest` → `test` 分兩次執行）；即使存在其他更複雜的生命週期呼叫鏈，也一律交由模組管理工具處理（參見 [agent-operation-restrictions](../agent-operation-restrictions/SKILL.md)「禁止濫用或頻繁執行測試」）。

## 相關資源

- [execution-rules.md](./references/execution-rules.md) — 生命週期機制、`node --run` 特性與限制、正誤範例
- [agent-operation-restrictions](../agent-operation-restrictions/SKILL.md) — 指令執行規則總綱
- [agent-script-execution](../agent-script-execution/SKILL.md) — 路徑與工作目錄規範
