---
description: >-
  列舉 Agent 在未獲使用者明確授權前，嚴禁自行執行的操作類別，
  包含依賴管理、伺服器控制、git 寫入操作與檔案搬移規範。
tags:
  - agents/rules
  - agents/restrictions
  - agents/safety
---

# 嚴格禁止操作清單 | Forbidden Operations

除非使用者在對話中**明確要求**，否則以下操作一律禁止。

---

## 1. 🚫 禁止自行管理依賴套件

嚴禁在未獲授權的情況下，自行安裝、移除或升級任何模組或依賴。

```bash
# ❌ 嚴禁（未獲授權）
pnpm install some-package
pnpm remove some-package
npm install
yarn add some-package
pnpm up
```

**正確做法**：若判斷需要安裝依賴，應告知使用者並**等待明確授權**後再執行。

---

## 2. 🚫 禁止自行啟動或停止伺服器

嚴禁在未獲授權的情況下，自行啟動或停止任何開發伺服器、測試伺服器或背景行程。

```bash
# ❌ 嚴禁（未獲授權）
pnpm run dev
pnpm run start
node server.js
```

**正確做法**：永遠假設伺服器已運行，無需進行前置確認行為。若發現伺服器未運行無法完成任務，應告知使用者並請其手動執行。

---

## 3. 🚫 禁止自行執行 git 寫入操作

嚴禁在未獲授權的情況下，執行任何會變更 git 狀態的指令。

```bash
# ❌ 嚴禁（未獲授權）
git add .
git commit -m "..."
git push
git checkout -b new-branch
git merge
git reset
git stash
```

**允許的唯讀 git 操作**（但仍應在有必要時才使用）：

```bash
# ✅ 唯讀，視需要使用
git status
git log
git diff
git branch
git show
```

---

## 4. ✅ 檔案搬移規範：使用移動指令，禁止刪除後重建

搬移或重新命名檔案時，**必須使用搬移指令**，嚴禁以「刪除原檔 → 建立新檔」的方式替代，以避免遺失 git 歷史紀錄。

```powershell
# ✅ 正確（PowerShell）
Move-Item -Path "old/path/file.ts" -Destination "new/path/file.ts"

# ❌ 嚴禁（會遺失 git 歷史）
Remove-Item "old/path/file.ts"
# 然後再建立 "new/path/file.ts"
```

---

## 授權判斷準則

| 使用者說法 | 是否視為明確授權 |
|---|---|
| 「安裝 X 套件」、「加入 X 依賴」 | ✅ 是 |
| 「啟動伺服器」、「跑起來」 | ✅ 是 |
| 「commit 這些變更」、「push 上去」 | ✅ 是 |
| 「修一下這個 bug」（未提及安裝） | ❌ 否，不可自行安裝 |
| 「測試一下」（未提及啟動伺服器） | ❌ 否，不可自行啟動 |
