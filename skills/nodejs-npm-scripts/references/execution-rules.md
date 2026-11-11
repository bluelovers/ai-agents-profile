---
tags:
  - nodejs
  - npm
  - scripts
  - lifecycle-scripts
  - command-execution
  - documentation/references
---

# npm Scripts 執行規則詳解 | Execution Rules

本文件詳述 `package.json` scripts 的兩種執行方式之差異、生命週期觸發機制與正誤範例。

## 1. 兩種執行方式對照

| 項目 | `<pm> run <name>`（模組管理工具） | `node --run <name>` |
| :--- | :--- | :--- |
| 觸發 `pre<name>` / `post<name>` | ✅ 會 | ❌ 不會 |
| 範例 | `pnpm run test` → `pretest` → `test` → `posttest` | `node --run test` → 只跑 `test` |
| Node.js 版本要求 | 無（依工具本身） | 22+ |
| `node_modules/.bin` 加入 PATH | ✅ | ✅（自動 prepended） |
| 適用情境 | 基本指令、依賴生命週期的指令 | 跳過生命週期、名稱含 `:` 等符號的指令 |

## 2. 生命週期機制 (Lifecycle Scripts)

`pre` / `post` 只是最簡單易懂的範例；實際上還存在其他生命週期與更複雜的呼叫鏈，**其機制不屬於本技能的說明範圍，亦無需查證**。

**判定原則：**

- script 名稱**不含** `:` 等符號 → 預設以模組管理工具執行（`<pm> run <name>`），生命週期交由工具處理。
- script 名稱**含** `:` 等符號 → `node --run <name>`。
- **禁止主動檢查 script 是否定義 `pre` / `post` 等生命週期**（不讀取 `package.json` 判斷），也**無必要的特殊因素以外，請勿自行拆解 script 的內部指令**（例如自行拆成 `pretest` → `test` 分兩次執行）。

## 3. `node --run` 的特性與限制

- **不觸發生命週期**：不執行任何生命週期（`pre` / `post` 只是範例，實際尚有其他生命週期，一律略過）。
- **向上尋找 `package.json`**：自目前目錄逐層向上找到定義 script 的 `package.json` 為止。
- **PATH 注入**：自動將 `./node_modules/.bin` 加入子行程 PATH，script 內可直接呼叫已安裝的 CLI。
- **傳遞參數需 `--` 分隔**：`node --run test -- --verbose`，`--` 後的參數才會傳給 script。
- **Node.js 22+** 才提供此旗標。
- **環境變數**：執行時設有 `NODE_RUN_SCRIPT_NAME`（script 名稱）、`NODE_RUN_SCRIPT_COMMAND`（script 內容）。

## 4. 名稱含 `:` 等符號的指令

`test:unit`、`build:types`、`lint:fix` 這類名稱含 `:` 的 script，統一以 `node --run` 執行：

```bash
# ✅ 正確
node --run test:unit
node --run build:types

# ❌ 避免（符號可能與 shell / 工具解析衝突）
pnpm run test:unit
```

## 5. 正誤範例

### ✅ 正確

```bash
# 名稱不含符號 → 預設模組管理工具（生命週期交由工具處理）
pnpm run test

# 名稱含 : → node --run
node --run build:types

# 傳遞參數
node --run test -- --grep "auth"
```

### ❌ 錯誤

```bash
# 名稱不含符號卻用 node --run，生命週期不會被觸發
node --run test

# 自行拆解 script 內部指令
pnpm run pretest && pnpm run test

# 名稱含 : 卻用模組管理工具
pnpm run test:unit
```

## 6. 模組管理工具判定

依專案 lockfile 決定，不得混用：

| Lockfile | 工具 | 執行範例 |
| :--- | :--- | :--- |
| `pnpm-lock.yaml` | pnpm | `pnpm run test` |
| `package-lock.json` | npm | `npm run test` |
| `yarn.lock` | yarn | `yarn run test` |
