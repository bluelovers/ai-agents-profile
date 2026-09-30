---
description: >-
  詳細說明 Agent 執行指令時的規則，包含 npx 禁令、TypeScript 執行優先順序、
  cd 指令限制、ynpx/pnpm dlx 使用規範，以及指令執行的正確與錯誤範例。
tags:
  - agents/rules
  - agents/execution
  - typescript/tsx
  - nodejs
---

# 指令執行規則參照 | Command Execution Rules

## 0. 優先使用 `package.json` 定義的指令

執行任何操作前，**應先檢查 `package.json` 中是否已有對應的 script**，有則優先使用，不直接呼叫底層工具。

```bash
# ✅ 優先（package.json 已定義時）
pnpm run build
pnpm run lint
pnpm run test
pnpm run type-check

# ✅ 直接呼叫（package.json 無對應 script，或定義的 script 不符合當前需求時）
tsx path/to/file.ts
tsc --noEmit
jest --testPathPattern=foo.spec.ts   # script 僅跑全部，需個別指定時可直接呼叫
```

> [!NOTE]
> 「不符合需求」的判斷標準：當 `package.json` 中的 script 與當前任務所需的參數、範圍或行為不一致時（例如 script 永遠跑全部測試，但此次只需針對單一檔案），才允許直接呼叫工具。

> [!WARNING]
> **注意 `pre*` / `post*` hooks（如 `pretest`）— 型別檢查與測試「二選一」。** 部分專案會在執行測試時同時進行型別檢查：
> ```json
> "scripts": {
>   "pretest": "node --run test:tsc",
>   "test": "node --run test:vitest:unit"
> }
> ```
> 只需要型別檢查時跑 `tsc` / `pretest`；需要測試時跑 `test`（`pretest` 自動帶出 tsc）。
> `test` 只在**工作收尾時**一次性執行；執行過 tsc/pretest 後不得緊接執行 `test`。
>
> ```bash
> # ✅ 正確：只需要型別檢查
> pnpm run test:tsc                  # 或 pnpm run pretest
>
> # ✅ 正確：工作收尾時一次性執行（pretest 自動帶出 tsc → vitest）
> pnpm run test
>
> # ❌ 錯誤：緊接鏈結執行（跑完型別檢查，宣告「tsc passes. Now run unit tests.」後隨即跑 test）
> pnpm run test:tsc
> pnpm run test
>
> # ❌ 錯誤：同質任務間反覆交替（（型別檢查 and/or 測試）→ 同質性後續任務 → 再檢查/測試），屬濫用測試
> pnpm run test:tsc
> pnpm run test
> # ... 同質性後續任務（同一工作的延續）...
> pnpm run test:tsc
> pnpm run test
> ```
>
> 模式：工作中執行過 tsc/pretest 後**繼續工作**，`test` 保留到工作收尾時再一次執行。
> **例外**：後續任務若為**不同階段的非同質性任務**（嶄新的工作階段），可再次執行型別檢查與測試。

> [!WARNING]
> **指令執行失敗時的處理順序 — 先直接執行、失敗先報告，勿自行安裝或查詢。**
>
> 1. **一律先直接執行指令** — 不事先確認安裝位置或查詢路徑；僅在該指令確實無法呼叫（command not found）時，才考慮進行路徑查詢行為。
> 2. **已定義於 scripts 內的指令無法執行時，先報告使用者** — 若失敗的指令已定義於 `package.json` scripts（如 `pnpm run test:tsc` 執行失敗），應先向使用者報告錯誤訊息與狀況，**而不是**嘗試自行安裝或進行一系列查詢：
>
> ```bash
> # ❌ script 執行失敗後不應自行為之
> pnpm add -D some-package          # 自行安裝缺失依賴（未授權的依賴管理）
> which tsx                         # 一系列路徑/安裝位置查詢
> where tsx
> glob node_modules ...
>
> # ✅ 正確：停止後續動作，向使用者報告錯誤訊息與原因
> ```

---

## 1. 嚴禁使用 `npx` 執行指令

**禁止透過 `npx` 執行任何指令**（如 `npx tsx ...`、`npx vitest ...`、`npx tsc ...` 等）。

### 正確替代方式（依優先順序）

1. **優先使用 `package.json` 中定義的 npm script**（有對應 script 時，一律先用）：
   ```bash
   pnpm run test:tsc
   pnpm run build
   pnpm run lint
   ```

2. **直接呼叫工具**（package.json 無對應 script，或 script 不符合需求時）：
   ```bash
   tsx path/to/file.ts
   tsc --noEmit
   jest
   vitest --run
   ```
   永遠假設常見工具指令已安裝，無需進行前置確認行為，執行失敗後從錯誤訊息中檢查原因。

### 錯誤範例

```bash
# ❌ 嚴禁
npx tsx path/to/file.ts
npx tsc --noEmit
npx vitest --run
npx jest
npm exec tsx path/to/file.ts
pnpm exec tsc --noEmit   # package.json 已有對應 script 時同樣禁止
```

> [!NOTE]
> `pnpm exec` 僅在以下兩個條件**同時成立**時才允許使用：
> 1. 環境限制導致無法直接呼叫工具（如工具未全域安裝）
> 2. `package.json` 中沒有對應的 script
>
> 只要 `package.json` 已定義對應 script，**無論環境為何，都應優先使用 `pnpm run <script>`**。

---

## 2. TypeScript 檔案執行優先順序

1. **首先使用 `tsx` 直接執行**
2. **若 tsx 失敗，改用 `ts-node`**
3. 皆失敗時，記錄至 `docs/ts-node-required.md` 並告知使用者

```bash
# ✅ 正確
tsx path/to/file.ts
ts-node path/to/file.ts

# ❌ 錯誤
npx tsx path/to/file.ts
node_modules/.bin/tsx path/to/file.ts
```

---

## 3. `ynpx` 與 `pnpm dlx` 使用規範

- `ynpx` 是一個**模組名稱**，不是 yarn 工具，不可誤用為套件執行器。
- `pnpm dlx` 可以使用，但**不可濫用**，僅在直接呼叫失敗且確實必要時才使用。

```bash
# ✅ 僅在必要時
pnpm dlx some-tool

# ❌ 濫用（應先嘗試直接呼叫）
pnpm dlx jest   # jest 通常可直接呼叫
```

---

## 4. 嚴禁在指令前追加 `cd`

除非**絕對必要**，否則不在執行指令時前置 `cd` 指令。
應透過工具的 `cwd` 參數指定工作目錄。

```bash
# ❌ 避免
cd path/to/project && tsc --noEmit

# ✅ 正確（透過 cwd 參數設定工作目錄）
tsc --noEmit   # 搭配 cwd: "path/to/project"
```

---

## 5. 嚴禁使用 `>nul` 重導向

Windows 環境下，`>nul` 可能產生無法刪除的 `nul` 裝置檔案。
除非絕對必要，否則**不在指令後追加 `>nul`**。

```bash
# ❌ 避免
tsc --noEmit >nul
some-command >nul 2>&1

# ✅ 正確（讓輸出正常顯示，或使用其他方式靜默）
tsc --noEmit
```

> 詳見：`D:\Users\WebstormProjects\my-data\Obsidian\MyObsidianNotes\raw\technical\windows\nodejs\nul-device-cleanup\troubleshooting.md`

---

## 6. 嚴禁直接呼叫 `node_modules/.bin/`

```bash
# ❌ 嚴禁
node_modules/.bin/tsx scripts/foo.ts
node_modules/.bin/jest
node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc --noEmit

# ✅ 正確
tsx scripts/foo.ts
jest
tsc --noEmit
```
