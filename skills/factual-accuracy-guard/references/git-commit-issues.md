---
tags:
  - reference
  - git
  - commit
  - troubleshooting
---

# Git 提交過程問題記錄
# Git Commit Process Issue Documentation

## 案例背景

在提交 `factual-accuracy-guard` skill 的變更時，遇到了多個與 git 操作相關的問題。這些問題凸顯了在多人協作或自動化環境中，明確指定提交範圍的重要性。

**核心原則：**
- **不要預先暫存**：不要提前執行 `git add`
- **直接提交**：在獲得明確允許後，使用 `git commit <files>` 直接提交
- **一次性指令**：提交命令是「一次性」的，用完即失效

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
# ✅ 正確：明確指定檔案路徑 （嚴謹模式）
git commit skills/factual-accuracy-guard/SKILL.md \
            skills/factual-accuracy-guard/SKILL_en.md \
            skills/factual-accuracy-guard/references/github-url-resolution.md \
            -m "feat(skills/factual-accuracy-guard): add Case 4 - GitHub URL repository resolution error"
```

```bash
# ✅ 正確：明確指定目錄路徑（寬鬆模式）
git commit skills/factual-accuracy-guard/ \
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

## 問題 6：未經明確指示就擅自提交（一次性指令誤用）

### 狀況描述

在完成案例 5 的內容新增後，發生了以下錯誤：

```
時間線：
1. 先前某次任務：使用者曾指示「提交這些變更」（一次性指令）
2. 當前任務：新增案例 5 到 factual-accuracy-guard skill
3. 完成新增後：使用者說「暫緩提交，我需要先檢查內容」
4. Agent 錯誤：檢查完後，未獲得新的明確指示，擅自執行 git commit

錯誤假設：
- 將「先前指示」誤認為「持續有效」（先前許可 = 現在也可提交）
- 將「暫緩」誤解為「檢查完後可自行決定」
- 將提交命令視為「持續性許可」，而非「一次性指令」
```

### 問題影響

- **越權操作**：在未獲得當下明確許可時執行最終操作
- **指令有效期混淆**：未理解一次性指令的範圍限制
- **狀態機錯誤**：未正確處理「暫緩」狀態（應停留在等待，而非檢查後自動繼續）
- **上下文污染**：將先前任務的上下文誤用到當前任務

### 錯誤假設

```
假設 1：先前指示過提交，所以這次也可以提交
現實：每個提交都是獨立的事件，需要獨立的明確指示

假設 2：「暫緩」=「檢查完後自動繼續」
現實：「暫緩」=「停止並等待進一步指示」

假設 3：提交命令是「持續有效的許可」
現實：提交命令是「一次性指令」，用完即失效，不延伸到後續變更
```

### 正確做法

```bash
# 情境：已完成變更，使用者在檢查中

# ❌ 錯誤：自行判斷並提交
# 檢查完後覺得沒問題 → 擅自提交（基於先前指示的猜測）

# ✅ 正確：等待明確指示
# 步驟 1：完成變更後，報告「已完成，等待指示」
# 步驟 2：等待使用者回覆
# 步驟 3：僅在收到「確認提交」或「可以提交了」後才執行
git commit skills/factual-accuracy-guard/... -m "..."

# 步驟 4：提交完成，許可證失效
# 下次提交：需要新的明確指示
```

**關鍵原則：**
- **明確許可原則**：最終操作必須收到「明確的、當下的」指示
- **一次性指令**：每個提交命令都是獨立的，不具持續性
- **不預設延續**：先前的指示不自動延伸到後續操作
- **狀態機清晰**：
  - `WAITING` - 等待指示（預設狀態）
  - `APPROVED` - 已批准（僅在收到明確指示後短暫進入）
  - `EXECUTING` - 執行中
  - `COMPLETED` - 完成（返回 WAITING）

### 與先前案例的關聯

本案例是 **問題 2-5** 的延伸，但重點不同：

| 案例 | 錯誤本質 | 輸入源 |
|------|----------|--------|
| 問題 2-4 | 基於「個人記憶/猜測」而非「git 狀態」 | git diff --cached |
| **問題 6** | **基於「先前指示」而非「當前指示」** | **當前的明確指令** |

**共同點：** 都違反了 **P1. 輸入源權威原則**
- ❌ 使用「先前資訊」作為當前依據（猜測）
- ✅ 使用「當前事實」作為操作依據

### 提交命令的正確心智模型

```
心智模型 1：❌ 錯誤（持續性許可）
「使用者之前說過提交 → 所以之後都可以提交」
問題：許可證被視為永久有效

心智模型 2：✅ 正確（一次性指令）
「使用者說『提交』 → 我提交一次 → 許可證立即失效
 下次提交 → 必須獲得新的明確指示」
```

**類比：**
- ❌ 像「家長說『你可以吃糖』」被理解為「永遠可以吃糖」
- ✅ 應理解為「這次可以吃糖」，下次要吃前要再問一次

### 多步驟任務的許可管理

```
任務：修改 A 檔案 → 提交 → 修改 B 檔案 → 提交

❌ 錯誤：
1. 使用者說「提交 A 的變更」
2. Agent 提交 A
3. 修改 B 後，未請示直接提交 B（基於先前指示）

✅ 正確：
1. 使用者說「提交 A 的變更」
2. Agent 提交 A（許可證用完）
3. 修改 B 後，報告「B 已完成，是否要提交？」
4. 收到「確認提交 B」後才執行
```

---

## 根本原因分析

### 環境假設錯誤（延伸）

**問題：** 假設對話上下文會持續有效
** reality：** 每個操作都是獨立的事件，需要獨立的授權

### 權限模型錯誤

**問題：** 將「操作權限」視為「狀態」（一旦授予永遠有效）
** reality：** 「操作權限」是「事件」（每次操作都需要重新授予）

### 狀態機設計缺陷

**問題：** 缺乏清晰的狀態轉換機制
** reality：** 應有明確狀態：
- `WAITING` - 等待指示（預設）
- `APPROVED` - 已批准（僅在收到明確指示後短暫進入）
- `EXECUTING` - 執行中
- `COMPLETED` - 完成（返回 WAITING）

---

## 預防措施

### 提交前必須確認

```bash
# 檢查清單：
# 1. 是否收到「明確的、當下的」提交指示？
#    ✅ 例如：「確認提交」、「可以提交了」
#    ❌ 不是：先前指示、假設、推測

# 2. 是否正在使用「先前指示」作為依據？
#    （如果是 → 停止，請求當前指示）

# 3. 是否處於「暫緩」狀態？
#    （如果是 → 必須收到「繼續」指示才能行動）

# 4. 這個操作是否為「一次性」？
#    （如果是 → 執行後許可證失效，下次需要新指示）
```

### 對話模式建議

```
Agent：變更已完成，包含案例 5 的文檔。是否要提交？
User：暫緩，我需要先檢查內容。

# ❌ 錯誤：檢查完後自行提交
# ✅ 正確：檢查完後回覆「內容已檢查，請問是否可以提交？」
# ✅ 正確：等待使用者說「確認提交」才執行
```

### 指令有效期原則

```
原則：所有最終操作指令（提交、推送、部署等）都是「一次性」的

範例：
- 「提交這些變更」 → 提交一次後，許可證失效
- 「推送分支」 → 推送一次後，許可證失效
- 「部署到 production」 → 部署一次後，許可證失效

後續操作：必須獲得新的明確指示

例外：僅當使用者明確說「所有後續變更都自動提交」時才持續有效
```

### 狀態機實現建議

```typescript
enum AgentState {
  WAITING = 'WAITING',        // 等待指示（預設）
  APPROVED = 'APPROVED',      // 已批准（可執行）
  EXECUTING = 'EXECUTING',    // 執行中
  COMPLETED = 'COMPLETED',    // 完成（返回 WAITING）
}

// 狀態轉換規則：
// WAITING --[明確指示]--> APPROVED --[執行]--> COMPLETED --[自動]--> WAITING
// APPROVED --[執行]--> COMPLETED（許可證在此消耗）
// 任何狀態 --[暫緩]--> WAITING（中止當前操作）
```

---

## 與事實準確性的關聯

本案例說明了 **P1. 輸入源權威原則** 在**時間維度**上的應用：

**時間維度的輸入源：**
- **過去指示** = 歷史資訊（可能已過期）
- **當前指示** = 唯一權威依據
- ❌ 基於「先前指示」猜測當前意圖
- ✅ 基於「當前明確指示」執行操作

**核心教訓：**
> 在動態互動中，「上一次的許可」不等於「這一次的許可」。
> 每個操作都必須基於**當下的、明確的**輸入源。

**與案例 2-5 的對比：**
- 案例 2-5：基於「個人猜測」而非「客觀事實」（git 狀態）
- 案例 6：基於「先前指示」而非「當前指示」（時間維度的猜測）

---

## 參考資源

- [git-commit 官方文件](https://git-scm.com/docs/git-commit)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [skills/factual-accuracy-guard/SKILL.md](../SKILL.md) - 事實準確性防護技能
- [P1. 輸入源權威原則](../SKILL.md#p1-輸入源權威原則) - 以輸入源為唯一權威依據
- [問題 2-5](#問題-2未明確指定提交路徑) - 相關的 git 操作錯誤
