# Git 提交過程問題記錄
# Git Commit Process Issue Documentation

## 案例背景

在提交 `factual-accuracy-guard` skill 的變更時，遇到了多個與 git 操作相關的問題。這些問題凸顯了在多人協作或自動化環境中，明確指定提交範圍的重要性。

---

## 問題 2：未明確指定提交路徑

### 狀況描述

第一次嘗試提交時，使用了無路徑限制的指令：

```bash
# ❌ 錯誤：無差別提交
git commit -m "feat(skills/factual-accuracy-guard): add Case 4"
```

### 問題影響

- **可能包含未準備好的檔案**：git 會自動選擇所有已暫存的變更，包括可能由其他程序或 Agent 造成的變更
- **git 狀態不一致風險**：在多人協作或同時有多個 Agent 操作時，容易混淆提交範圍
- **難以審核**：提交內容範圍不明確，增加 code review 難度

### 錯誤假設

```
假設：git commit 只會提交我「意圖」提交的檔案
現實：git commit 會提交「所有已暫存」的變更，不管是否為我「意圖」的
```

### 正確做法

```bash
# ✅ 正確：明確指定檔案路徑
git commit skills/factual-accuracy-guard/SKILL.md \
            skills/factual-accuracy-guard/SKILL_en.md \
            skills/factual-accuracy-guard/references/github-url-resolution.md \
            -m "feat(skills/factual-accuracy-guard): add Case 4 - GitHub URL repository resolution error"
```

**關鍵原則：**
- 永遠明確列出要提交的檔案路徑
- 使用 pathspec 限制提交範圍
- 提交前先確認 `git diff --cached --stat` 的內容

---

## 問題 3：提交訊息基於猜測而非實際 diff

### 狀況描述

第二次嘗試時，commit 訊息假設了檔案狀態：

```bash
# ❌ 錯誤：基於猜測的 commit 訊息
git commit -m "feat(skills/factual-accuracy-guard): add factual accuracy guard skill"
```

### 問題影響

- **訊息不準確**：訊息說「新增 skill」，但實際上 skill 已存在，只是新增案例
- **版本歷史混亂**：未來檢視 git log 時，無法從訊息準確得知實際變更內容
- **不符合 Conventional Commits**：未能正確反映變更類型（feat 雖正確，但描述不精確）

### 錯誤假設

```
假設：檔案狀態與我「記憶」中的一致
現實：可能已有其他變更被暫存，或部分檔案已提交
```

### 正確做法

```bash
# 步驟 1：檢查實際變更統計
git diff --cached --stat

# 輸出範例：
#  skills/factual-accuracy-guard/SKILL.md             | 37 ++++++++++
#  skills/factual-accuracy-guard/SKILL_en.md          | 37 ++++++++++
#  skills/factual-accuracy-guard/references/...md    | 85 ++++++++++++++++++++++
#  3 files changed, 159 insertions(+)

# 步驟 2：根據實際統計撰寫精確的 commit 訊息
git commit skills/... -m "feat(skills/factual-accuracy-guard): add Case 4 - GitHub URL repository resolution error

Add comprehensive case study about GitHub URL parsing to factual accuracy guard.

**Changes:**
- SKILL.md: +37 lines (add Case 4 with reference link)
- SKILL_en.md: +37 lines (add Case 4 with reference link)
- references/github-url-resolution.md: +85 lines (new file)"
```

**關鍵原則：**
- 永遠以 `git diff --cached` 的實際輸出為準
- 在 commit 訊息中標註關鍵變更（如 "+37 lines"）
- 區分「新增功能」與「更新內容」

---

## 問題 4：初始未使用 pathspec

### 狀況描述

第三次嘗試時，指令格式錯誤：

```bash
# ❌ 錯誤：未指定路徑
git commit -m "msg"

# ❌ 錯誤：路徑放在 -m 後面（無效）
git commit -m "msg" skills/factual-accuracy-guard/
```

### 問題影響

- **Git 拒絕執行**：指令格式錯誤，git 無法解析
- **效率低下**：多次嘗試浪費時間
- **混淆指令語法**：對 git 指令的參數順序理解不清

### 錯誤假設

```
假設：git commit 的 -m 參數可以放在任意位置
現實：git commit 的語法為：git commit [<pathspec>...] -m "msg"
      pathspec 必須在 -m 之前
```

### 正確做法

```bash
# ✅ 正確：路徑在 -m 之前
git commit <file1> <file2> <file3> -m "commit message"

# 完整範例：
git commit skills/factual-accuracy-guard/SKILL.md \
            skills/factual-accuracy-guard/SKILL_en.md \
            skills/factual-accuracy-guard/references/github-url-resolution.md \
            -m "feat(skills/factual-accuracy-guard): add Case 4"
```

**Git 指令語法：**
```
git commit [options] [--] <pathspec>...
git commit [options] -m "msg" [--] <pathspec>...
```

**關鍵原則：**
- pathspec 必須在 `-m` 參數之前
- 使用 `--` 可以明確分隔選項與路徑（避免路徑與分支名稱混淆）
- 多個檔案時使用 `file1 file2 file3` 或 glob pattern

---

## 問題 5：README.md 狀態混淆

### 狀況描述

`git diff skills/README.md` 輸出空，但實際上該檔案已被修改。

### 可能原因

1. **檔案已提交**：在更早的步驟中已提交
2. **變更未暫存**：修改後未執行 `git add`
3. **HEAD 已更新**：當前 HEAD 指向的版本與工作目錄相同

### 診斷步驟

```bash
# 檢查檔案狀態
git status skills/README.md

# 可能輸出：
# On branch master
# Your branch is ahead of 'origin/master' by 2 commits.
#   (use "git push" to publish your local commits)
#
# nothing to commit, working tree clean
#
# 或：
# Changes not staged for commit:
#   (use "git add <file>..." to update what will be committed)
#   (use "git restore <file>..." to discard changes in working directory)
#         modified:   skills/README.md
```

### 正確做法

根據狀態選擇：

```bash
# 情境 1：變更未暫存
git add skills/README.md
git diff --cached skills/README.md  # 確認暫存內容

# 情境 2：已提交（無需處理）
# 檔案已在之前的 commit 中，當前無變更

# 情境 3：想要查看歷史變更
git log -p skills/README.md
```

**關鍵原則：**
- `git diff` = 工作目錄 vs 索引（未暫存）
- `git diff --cached` = 索引 vs HEAD（已暫存）
- 若 `git diff` 輸出空但檔案有修改，檢查是否已 `git add`

---

## 根本原因分析

### 1. 環境假設錯誤

**問題：** 假設 git 狀態與記憶一致
** reality：** 多個 Agent 或程序可能同時操作 git，導致狀態變更

### 2. 指令語法不熟悉

**問題：** 對 `git commit` 的 pathspec 位置理解不清
** reality：** pathspec 必須在 `-m` 之前，或使用 `--` 分隔

### 3. 缺乏狀態驗證步驟

**問題：** 直接執行 commit，未先確認 `git diff --cached`
** reality：** 應先檢查再提交，避免錯誤

---

## 預防措施

### 提交前檢查清單

```bash
# 步驟 1：查看所有變更（包含未暫存）
git status

# 步驟 2：查看已暫存的變更統計
git diff --cached --stat

# 步驟 3：確認變更內容
git diff --cached

# 步驟 4：確認提交路徑正確
# （使用明確的 pathspec，避免使用 . 或 *）

# 步驟 5：執行提交（指定路徑）
git commit <file1> <file2> -m "msg"
```

### 推薦工作流

```bash
# 1. 修改檔案後，先查看狀態
git status

# 2. 僅暫存要提交的檔案（明確指定）
git add skills/factual-accuracy-guard/SKILL.md

# 3. 再次確認暫存內容
git diff --cached --stat

# 4. 提交時明確列出路徑
git commit skills/factual-accuracy-guard/SKILL.md -m "msg"
```

---

## 與事實準確性原則的關聯

本案例說明了 **P1. 輸入源權威原則** 在 git 操作中的應用：

- **git status** 是「輸入源」—— 實際的檔案狀態
- **個人記憶** 是「假設」—— 可能與實際不符
- **正確做法**：以 `git status` 和 `git diff` 的輸出為準，而非記憶或猜測

**類比：**
- ❌ 「我記得只改了 SKILL.md」→ 基於猜測
- ✅ `git diff --cached` 顯示改了 3 個檔案 → 基於事實

---

## 參考資源

- [git-commit 官方文件](https://git-scm.com/docs/git-commit)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [skills/factual-accuracy-guard/SKILL.md](../SKILL.md) - 事實準確性防護技能
