---
name: factual-accuracy-guard
description: 防止 AI Agent 在回答或查詢時加入與事實無關的內容，避免在未查核的情況下基於虛假、虛構、錯誤的先入為主觀念而執行後續的錯誤任務。禁止虛構不存在的事實，即使在角色扮演模式下也需融合事實來進行角色扮演，除非架空世界規則不同。Prevents AI agents from adding unfactual content in responses or queries, avoiding execution of erroneous tasks based on unverified false, fictional, or incorrect preconceptions. Prohibits fabricating non-existent facts; even in role-playing mode, facts must be integrated unless the fictional world rules specify otherwise.
tags:
  - accuracy
  - fact-checking
  - safety
  - agents/skills
---

# 事實準確性防護技能
# Factual Accuracy Guard Skill

## 核心目的 / Core Purpose

本技能旨在防止 AI Agent 在執行任務時出現以下問題：
- 在回答或查詢中加入與事實無關的內容
- 在未查核的情況下基於虛假、虛構、錯誤的先入為主觀念執行後續任務
- 虛構不存在的事實、資料或概念

This skill prevents AI Agents from：
- Adding unfactual content in responses or queries
- Executing tasks based on unverified false, fictional, or incorrect preconceptions
- Fabricating non-existent facts, data, or concepts

---

## 錯誤模式識別 / Error Pattern Recognition

### 常見錯誤類型 / Common Error Types

| 錯誤類型 / Type | 說明 / Description | 範例 / Example |
|----------------|-------------------|----------------|
| **名稱混淆** / Name Confusion | 將相同名稱但不同實體的專案/概念混為一談 | 將 `chroma.js`（顏色庫）誤認為 ChromaDB（向量資料庫） |
| **過度推斷** / Over-inference | 基於部分資訊過度推斷未提供的內容 | 使用者提供 URL 卻加入 URL 中不存在的概念 |
| **流行度偏見** / Popularity Bias | 因某技術較「知名」而優先採用，忽略使用者提供的上下文 | 因 ChromaDB 較熱門而忽略使用者提供的 chroma.js URL |
| **虛構細節** / Fabricated Details | 編造不存在的方法、屬性、參數或行為 | 編寫不存在的 API 方法或配置選項 |
| **未經驗證的假設** / Unverified Assumptions | 將猜測當作事實進行後續任務 | 未確認 URL 內容就假設專案類型 |

---

## 核心原則 / Core Principles

### P1. 輸入源權威原則 / Input Source Authority

```
以使用者提供的輸入源（URL、文件、代碼）為唯一權威依據。
Use user-provided input sources (URLs, documents, code) as the sole authoritative reference.
```

**規則：**
- 當任務包含 URL 時，必須先使用 `webfetch()` 取得內容
- 提示詞中不得加入 URL 內容中「不存在」的概念或術語
- 使用者提供的上下文優先於任何先入為主觀念

**決策流程：**
```
收到任務（包含名稱 + URL）
    │
    ▼
URL 是否存在？
    │
    ├─ 是 → 使用 webfetch 讀取 URL 内容 → 根據內容執行任務
    │
    └─ 否 → 名稱是否有多義？
              │
              ├─ 是 → 使用「字面意義」或請求澄清
              │
              └─ 否 → 正常執行任務
```

### P2. 最小假設原則 / Minimum Assumption

```
如果名稱存在多個不同用途的專案，預設採用「第一個 URL 指向的專案」或「字面意義最直接相關的專案」。
If a name has multiple uses, default to "the project pointed to by the first URL" or "the most directly relevant meaning."
```

**允許考慮其他專案的條件（必須同時滿足）：**
1. 使用者明確說明了「不是指 XXX」
2. 或 URL 內容與預期嚴重不符，且已確認該 URL 已經無效/過時

### P3. 事實查核強制原則 / Fact Verification Mandatory

```
在執行任何任務之前，必須先驗證關鍵事實。
Before executing any task, key facts must be verified.
```

**查核清單：**
- [ ] 名稱對應的實體是否已確認？
- [ ] URL 內容是否已讀取並理解？
- [ ] 是否存在多義性？是否已解決？
- [ ] 提示詞中是否包含未經證實的資訊？
- [ ] 是否基於猜測而非證據做決策？

### P4. 禁止虛構原則 / No Fabrication

```
不得虛構任何不存在的事實、方法、屬性、參數或行為。
Do not fabricate any non-existent facts, methods, properties, parameters, or behaviors.
```

**包括但不限於：**
- 不存在的 API 方法或函數
- 未在文件中提到的配置選項
- 未經證實的技術參數
- 臆測的實作細節
- 虛構的錯誤訊息或代碼

### P5. 角色扮演事實融合原則 / Role-Playing Fact Integration

```
即使在角色扮演模式下，也必須融合事實來進行角色扮演。
Only when the role-playing or world setting explicitly specifies different rules can fictional elements be used.
```

**規則：**
- 預設情況下，角色扮演必須基於真實事實
- 僅當世界觀明確為架空設定時，才可使用虛構元素
- 需清楚區分「角色台詞」與「事實陳述」

---

## 執行檢查清單 / Execution Checklist

### 任務開始前 / Before Task Execution

**必須回答以下問題：**

1. **輸入源檢查 / Input Source Check**
   - [ ] 任務中是否有 URL 或其他參考資料？
   - [ ] 是否已讀取所有提供的 URL？
   - [ ] 是否已理解 URL 的實際內容？

2. **名稱歧義檢查 / Name Ambiguity Check**
   - [ ] 任務中的名稱是否存在多個可能的實體？
   - [ ] 是否已根據 URL 內容確認正確的實體？
   - [ ] 是否已排除其他可能的解讀？

3. **假設檢查 / Assumption Check**
   - [ ] 是否正在基於猜測做決策？
   - [ ] 是否將「可能性」當作「事實」？
   - [ ] 是否因個人知識而偏離使用者提供的上下文？

### 提示詞建構檢查 / Prompt Construction Check

**在召喚子代理或生成提示詞之前：**

```
□ 提示詞中是否包含 URL 內容中「不存在」的專有名詞？
□ 提示詞是否覆蓋了使用者提供的上下文（特別是 URL）？
□ 是否有未經查證的技術細節？
□ 是否使用了「可能」、「也許」、「應該」等不確定詞彙？
```

**若任一問題回答為「是」：**
1. 立即停止提示詞建構
2. 使用 `webfetch()` 讀取 URL 內容
3. 根據實際內容重新建構提示詞
4. 或使用 `question` 工具向使用者請求澄清

### 任務執行中 / During Task Execution

**持續監控：**
- 是否正在添加未經證實的資訊？
- 是否正在臆測技術細節？
- 是否偏離了輸入源的內容？

**若發現問題：**
1. 立即暫停任務
2. 回溯到最後一個已知正確狀態
3. 重新查證事實
4. 繼續執行

---

## 處理流程 / Handling Procedures

### 情境 1：名稱有多義性 / Ambiguous Name

**狀況：** 任務中提到 `chroma.js`，且提供了多個 URL

```
處理步驟：
1. 使用 webfetch 讀取所有 URL
2. 比較 URL 內容，確認每個 URL 指向的實際專案
3. 根據 URL 內容確定正確的專案
4. 在提示詞中僅使用 URL 內容中出現的術語
5. 若無法確認，使用 question 請求澄清
```

**錯誤示範：**
```
❌ 錯誤：因「ChromaDB 較知名」而加入 Collection、向量等概念
✅ 正確：根據 URL 內容，僅介紹顏色轉換功能
```

### 情境 2：URL 內容與預期不符 / URL Content Mismatch

**狀況：** 讀取 URL 後發現內容與名稱不符

```
處理步驟：
1. 再次確認 URL 是否正確
2. 檢查 URL 是否過時或無效
3. 若 URL 確實無效，向使用者報告並請求更新
4. 若 URL 有效但內容不同，以 URL 內容為準
5. 不使用個人知識取代 URL 內容
```

### 情境 3：需要補充資訊 / Need Additional Information

**狀況：** 從 URL 無法獲得足夠資訊

```
處理步驟：
1. 不要虛構或臆測
2. 使用 question 工具向使用者請求：
   - 更詳細的說明
   - 其他參考資料
   - 具體的需求範圍
```

### 情境 4：角色扮演模式 / Role-Playing Mode

**狀況：** 需要以特定角色回答問題

```
處理步驟：
1. 確認角色扮演的世界觀是否為架空設定
2. 若為架空設定，可適度使用虛構元素
3. 若為現實世界角色，必須基於真實事實
4. 清楚區分「角色台詞」與「事實陳述」
5. 在角色言論中，可包含角色的主觀看法
6. 在事實陳述中，必須保持準確性
```

---

## 錯誤處理與恢復 / Error Handling & Recovery

### 發現已執行錯誤任務 / Detected Erroneous Task

**若發現已經執行了基於錯誤假設的任務：**

1. **立即停止** - 暫停所有相關任務
2. **評估影響** - 確認錯誤假設影響了哪些輸出
3. **通知使用者** - 清楚說明錯誤原因和影響範圍
4. **重新開始** - 基於正確事實重新執行任務
5. **記錄學習** - 記錄錯誤案例以避免重複

### 虛構內容已輸出 / Fabricated Content Already Output

**若已經輸出了虛構內容：**

1. **承認錯誤** - 明確指出哪些內容是虛構的
2. **提供正確資訊** - 給出基於事實的正確內容
3. **道歉並更正** - 向使用者道歉並提供更正後的版本
4. **分析原因** - 說明為何會發生虛構（如：資訊不足、過度推斷等）

---

## 實例分析 / Case Studies

### 案例 1：chroma.js 混淆事件

**原始任務：**
```
使用者：詳細介紹 chroma.js
提供 URL：https://gka.github.io/chroma.js/
        https://github.com/gka/chroma.js
```

**錯誤處理：**
```
❌ 錯誤做法：
1. 想到 ChromaDB 更知名
2. 在提示詞中加入「Collection」、「向量」等概念
3. 子代理根據 ChromaDB 提示詞研究，而非根據 URL 內容

✅ 正確做法：
1. 立即 webfetch 兩個 URL
2. 確認內容為「顏色轉換庫」
3. 建構提示詞時僅使用 URL 內容中的術語
4. 若仍有疑慮，直接詢問：「您指的是顏色轉換庫 chroma.js，還是向量資料庫 ChromaDB？」
```

### 案例 2：虛構 API 方法

**錯誤示範：**
```
使用者：如何使用 axios 發送請求？
Agent：axios.post(url, data, { timeout: 5000, retry: 3 })
（問題：axios 預設沒有 retry 參數，這是虛構的）
```

**正確做法：**
```
1. 查閱 axios 官方文件或使用已知知識
2. 僅提及文檔中存在的選項
3. 若需要 retry 功能，說明需要第三方庫（如 axios-retry）
4. 不編造不存在的參數
```

### 案例 3：角色扮演中的事實扭曲

**錯誤示範：**
```
使用者：假設你是 1950 年的科學家，談談量子力學
Agent：作為 1950 年的科學家，我認為量子糾纏允許超光速通訊...
（問題：即使角色扮演，也不應傳播已被推翻的錯誤理論）
```

**正確做法：**
```
1. 基於 1950 年當時的科學共識進行角色扮演
2. 清楚標示「當時的觀點」與「現代觀點」
3. 不將錯誤理論當作事實呈現
4. 可加入：「根據現代科學，我們現在知道...」
```

### 案例 4：GitHub URL 倉庫解析錯誤

**原始任務：**
```
使用者：請查看 github.com/anomalyco/opencode/issues/24444
情境：Agent 當前位於 OpenCode/OpenCode 倉庫中
```

**錯誤處理：**
```
❌ 錯誤做法：
1. 看到 GitHub URL 後，假設它存在於「當前倉庫」（current repository）
2. 執行：gh issue view 24444（不加 -R 參數）
3. 結果：在錯誤的倉庫中查找，找不到對應的 issue
4. 根本原因：將「當前工作目錄」當作預設倉庫，忽略了 URL 中明確包含的 org/repo 資訊

✅ 正確做法：
1. 解析 URL：github.com/anomalyco/opencode/issues/24444
2. 提取倉庫資訊：owner=anomalyco, repo=opencode
3. 執行：gh issue view 24444 -R anomalyco/opencode
4. 原則：URL 中的 org/repo 是唯一權威依據，而非當前工作目錄
```

**錯誤模式：**
- 忽略 URL 中明確提供的上下文（org/repo）
- 基於「當前位置」做假設，而非根據輸入源
- 將個人工作習慣投射到所有場景

**正確原則：**
- 以 URL 解析結果為準
- 不要假設資源存在於當前倉庫
- 所有 GitHub 操作都應明確指定 `-R owner/repo`

**參考文件：**
- 詳見 [references/github-url-resolution.md](./references/github-url-resolution.md) - GitHub URL 解析規則完整說明

### 案例 5：Git 提交過程中的假設錯誤

**情境：**
```
任務：提交 factual-accuracy-guard skill 的變更
已修改檔案：
- skills/factual-accuracy-guard/SKILL.md (+37 行)
- skills/factual-accuracy-guard/SKILL_en.md (+37 行)
- skills/factual-accuracy-guard/references/github-url-resolution.md (新增)
```

**問題 2：未明確指定提交路徑**

```
❌ 錯誤做法：
git commit -m "feat(skills/factual-accuracy-guard): add Case 4"

問題：
1. 未指定路徑，git 會提交「所有已暫存」的變更
2. 可能包含其他 Agent 或程序造成的變更
3. 提交範圍不明確，容易造成 git 狀態不一致

✅ 正確做法：
git commit skills/factual-accuracy-guard/SKILL.md \
            skills/factual-accuracy-guard/SKILL_en.md \
            skills/factual-accuracy-guard/references/github-url-resolution.md \
            -m "feat(skills/factual-accuracy-guard): add Case 4 - GitHub URL repository resolution error"
```

**問題 3：提交訊息基於猜測而非實際 diff**

```
❌ 錯誤做法：
直接撰寫 commit 訊息，未檢查 git diff --cached

問題：
1. 假設檔案狀態與記憶一致
2. commit 訊息可能不準確（如「新增 skill」但實際是「新增案例」）
3. 違反 Conventional Commits 的精確性要求

✅ 正確做法：
# 步驟 1：檢查實際變更統計
git diff --cached --stat

# 輸出：
#  skills/factual-accuracy-guard/SKILL.md             | 37 ++++++++++
#  skills/factual-accuracy-guard/SKILL_en.md          | 37 ++++++++++
#  .../references/github-url-resolution.md            | 85 ++++++++++++++++++++++
#  3 files changed, 159 insertions(+)

# 步驟 2：根據實際統計撰寫精確訊息
git commit ... -m "feat(skills/factual-accuracy-guard): add Case 4 - GitHub URL repository resolution error"
```

**問題 4：指令格式錯誤（未使用 pathspec）**

```
❌ 錯誤做法：
git commit -m "msg" skills/factual-accuracy-guard/

問題：pathspec 必須在 -m 之前，git 無法解析

✅ 正確做法：
git commit <file1> <file2> <file3> -m "msg"
# 或使用 -- 分隔
git commit -- skills/factual-accuracy-guard/ -m "msg"
```

**錯誤模式歸納：**
- 基於「記憶」或「猜測」而非「實際 git 狀態」
- 忽略 `git diff --cached` 的權威性
- 未理解 git commit 的 pathspec 位置要求
- 在多人/多 Agent 環境中未明確隔離提交範圍

**正確原則（應用 P1. 輸入源權威）：**
- **git status/diff 是輸入源**：實際的檔案狀態是唯一權威
- **不要基於猜測**：不要假設「我記得改了哪些檔案」
- **明確指定路徑**：永遠列出要提交的完整路徑
- **先檢查再提交**：`git diff --cached --stat` 是必經步驟

**與事實準確性的關聯：**
此案例說明了 **P1. 輸入源權威原則** 在版本控制中的應用：
- ❌ 基於個人記憶（猜測）提交
- ✅ 基於 `git diff --cached`（事實）提交
- ❌ 假設 git 會「知道」我要提交什麼
- ✅ 明確告訴 git 我要提交什麼（pathspec）

**參考文件：**
- 詳見 [references/git-commit-issues.md](./references/git-commit-issues.md) - 完整問題記錄與分析

### 案例 6：未經明確指示就擅自提交（一次性指令誤用）

**完整情境：**
```
時間線：
- 時刻 T1：先前任務中，使用者曾指示「提交這些變更」（一次性指令）
- 時刻 T2：當前任務 - 新增案例 5 到 factual-accuracy-guard skill
- 時刻 T3：完成新增後，使用者說「暫緩提交，我需要先檢查內容」
- 時刻 T4：Agent 檢查完內容，未獲得新的明確指示，擅自執行 git commit

錯誤假設：
- 將「T1 的指示」誤認為「T4 仍然持續有效」（先前許可 = 現在也可提交）
- 將「暫緩」誤解為「檢查完後可自行決定」
- 將提交命令視為「持續性許可」，而非「一次性指令」
```

**錯誤處理：**
```
❌ 錯誤做法：
1. 使用者說「暫緩提交，我需要先檢查內容」
2. Agent 檢查完內容後，自行判斷「內容沒問題」
3. 未獲得明確指示，擅自執行 git commit
4. 根本原因：
   - 將「暫緩」誤解為「檢查完後可自行決定提交」
   - 將「先前指示」延伸到當前操作（未獲當下授權）

✅ 正確做法：
1. 使用者說「暫緩」→ 停止所有提交操作，進入 WAITING 狀態
2. **不要預先執行 git add**（避免提前暫存）
3. 等待使用者的明確指示（如：「確認提交」、「可以提交了」）
4. 收到明確指示後，**直接使用 git commit <files>**（不需要先 git add）
5. 提交完成後，許可證失效，返回 WAITING 狀態
6. 原則：最終操作必須有明確的、當下的授權
```

**錯誤模式：**
- **指令有效期混淆**：將一次性指令誤認為持續有效
- **上下文污染**：將先前任務的上下文誤用到當前任務
- **狀態機錯誤**：未正確處理「暫緩」狀態（應停留在 WAITING，而非自動轉為 EXECUTING）
- **權限模型錯誤**：混淆「一次性授權」與「持續性權限」

**正確原則（應用 P1. 輸入源權威）：**
- **當前的明確指示是輸入源**：只有「當下的」提交指令才是授權
- **「暫緩」= 停止並等待**：不是「稍後自動繼續」
- **一次性指令原則**：每個提交命令都是獨立事件，用完即失效
- **不預設延續**：先前的指示不自動延伸到後續操作（除非明確說「所有後續變更都自動提交」）

**與事實準確性的關聯：**
此案例說明了 **P1. 輸入源權威原則** 在**時間維度**上的應用：

| 維度 | 錯誤做法 | 正確做法 |
|------|---------|---------|
| **時間** | 基於「先前指示」（歷史資訊） | 基於「當前明確指示」（事實） |
| **授權** | 將許可證視為「持續性」（狀態） | 將許可證視為「一次性事件」（用完即棄） |
| **狀態機** | WAITING →（自行判斷）→ EXECUTING | WAITING →（明確指示）→ APPROVED → EXECUTING |

**核心教訓：**
> 在動態互動中，「上一次的許可」不等於「這一次的許可」。
> 每個操作都必須基於**當下的、明確的**輸入源。

**參考文件：**
- 詳見 [references/git-commit-issues.md](./references/git-commit-issues.md) - 問題 6 完整分析（一次性指令誤用）

---

## 工具使用規範 / Tool Usage Guidelines

### webfetch() 的正確使用

**何時使用：**
- 任務包含 URL 時（必須使用）
- 需要驗證技術資訊時
- 名稱存在多義性需要確認時

**使用方式：**
```typescript
// ✅ 正確：先獲取內容再決策
const content = await webfetch('https://example.com/docs');
// 根據 content 內容建構提示詞

// ❌ 錯誤：未讀取 URL 就直接行動
const result = await subAgent(`介紹 ${url} 的內容`);
// 應先自己讀取 URL，理解內容後再決定如何介紹
```

### question() 的適當使用

**何時使用：**
- URL 無效或過期
- 名稱多義性無法解決
- 資訊不足無法繼續任務
- 需要確認使用者意圖

**使用方式：**
```typescript
// ✅ 正確：直接詢問澄清
await question({
    question: 'chroma.js 有兩個常見專案：\n1. 顏色轉換庫 (gka/chroma.js)\n2. 向量資料庫 (chroma-core/chromadb)\n您指的是哪一個？',
    follow_up: [
        { text: '顏色轉換庫', mode: null },
        { text: '向量資料庫', mode: null },
    ]
});
```

---

## 自我監控機制 / Self-Monitoring Mechanism

### 紅旗警告 / Red Flags

**當出現以下跡象時，立即停止並查核：**

1. **使用了「可能」、「也許」、「應該」等不確定詞彙**
   - 這表示不確定，需要查證

2. **提到了未在輸入源中出現的專有名詞**
   - 檢查是否來自個人知識而非當前任務

3. **感覺「這個我很熟」而跳過查證步驟**
   - 熟悉度不應取代查證

4. **試圖「補充」輸入源中沒有的資訊**
   - 補充 = 虛構

5. **基於「通常這樣」做假設**
   - 每個專案都可能不同

### 自我提問 / Self-Questioning

**在每個決策點問自己：**

```
1. 我現在正在做的判斷，有來自輸入源的證據嗎？
2. 如果沒有 URL，我會知道這個資訊嗎？
3. 我是否正在將「我的知識」投射到當前任務？
4. 使用者提供的資料是否支援我的結論？
5. 如果我是使用者，看到這個輸出會覺得準確嗎？
```

---

## 違反後果與改進 / Consequences & Improvement

### 違反原則的後果

- **任務失敗** - 執行無效或錯誤的任務
- **使用者信任喪失** - 提供不準確的資訊
- **時間浪費** - 在錯誤方向上花費精力
- **品質下降** - 輸出品質不可靠

### 持續改進

1. **記錄錯誤案例** - 建立個人錯誤日誌
2. **分析根本原因** - 為何會發生虛構？
3. **制定預防措施** - 針對性改進檢查流程
4. **定期複習原則** - 強化事實查核意識

---

## 快速參考 / Quick Reference

### 必須做的事 / Must Do

✅ **必須做：**
- 讀取所有提供的 URL
- 根據 URL 實際內容建構提示詞
- 不清楚時請使用者澄清
- 區分事實與推測
- 標註角色扮演內容

### 禁止做的事 / Must Not Do

❌ **禁止做：**
- 加入 URL 中不存在的概念
- 因「知名」而偏離使用者提供的上下文
- 編造方法、參數、選項
- 將猜測當作事實
- 在未確認前執行任務

---

## 總結 / Summary

> **AI 應該「根據輸入執行任務」，而非「根據猜測執行任務」。**
>
> AI should "execute tasks based on input," not "execute tasks based on guesses."

**核心信念：**
- 輸入源是唯一權威
- 不清楚時就問，不要猜
- 虛構是最大的錯誤
- 事實查核是每個步驟的必經之路

---

## 相關資源 / Related Resources

- [unimplemented-code-handling-rules.md](../../rules/unimplemented-code-handling-rules.md) - 無法實現代碼處理規則
- [comment-format-rules.md](../../rules/comment-format-rules.md) - 註解格式規範
- [references/github-url-resolution.md](./references/github-url-resolution.md) - GitHub URL 解析規則完整說明
- [references/git-commit-issues.md](./references/git-commit-issues.md) - Git 提交過程問題記錄（案例 5 & 6）
