---
name: agent-behavior-standardization
description: |-
  Provides guidelines to standardize agent behaviors,
  avoid common mistakes, and prevent unnecessary actions during task execution.
  Use when agents need to:
  (1) Read or write files/directories with built-in tools instead of hand-built CLI commands,
  (2) Edit files without pre-reading the whole file or overwriting others' changes,
  (3) Handle CJK/non-English encoding conflicts (terminal mojibake, UTF-8 vs Big5),
  (4) Apply Single Source of Truth (SSoT) to deduplicate shared logic, types, or docs,
  (5) Batch grep/glob searches in a single call for efficiency,
  (6) Diagnose failed tool calls and validate workspace-relative vs absolute paths,
  (7) Keep refactoring/annotation/analysis tasks from scope drift (skip unnecessary git/test exploration),
  (8) Detect overthinking and break reasoning loops: stop exploring and report the blocker to the user instead of looping indefinitely,
  (9) Prevent unnecessary noise: never pre-explore the directory of a user-provided path; exploration must be driven by explicit need.
  當執行相關行為或 when user mentions 時觸發（包含但不限於以下關鍵字或情境）：
  "行為標準化", "agent behavior standardization", "檔案讀寫/編輯", "避免非必要操作",
  "覆蓋檔案/檔案被更動", "亂碼/編碼問題", "單一事實來源/SSoT",
  "重複邏輯", "批次搜尋", "工具呼叫/工具呼叫失敗", "路徑查詢/解析/錯誤", "Permission denied",
  "查詢依賴", "查詢執行檔路徑", "查詢任何路徑或環境偵測", "查詢實作細節", "查詢API",
  "環境設定", "執行指令", "git查詢", "scope drift", "避免多餘探索",
  "過度思考", "overthinking", "思考過多輪", "探索迴圈", "陷入迴圈", "反覆嘗試",
  "無法決定", "卡住", "卡關", "無決定性結果",
  "非必要雜訊", "雜訊預防", "路徑探索", "目錄探索", "預先探索", "探索根據".
tags:
  - agents/behavior
  - agents/guidelines
  - file-operations
  - encoding
  - agents/skills
  - single-source-of-truth
---

# Agent 行為標準化指南 / Agent Behavior Standardization Guide

## 目的

本技能旨在建立 Agent 在執行任務時的標準化行為準則，避免各 Agent 犯下常見錯誤或進行不必要的行為，提升任務執行效率與成功率。

## 檔案操作準則

### 1. 優先使用技能與內建工具
Agent 在讀寫檔案或目錄時，**應優先使用具備的技能或內建環境工具**，而不是自行構建 CLI 指令。（註：不同 Agent 環境下的工具名稱可能有所不同，請依據當下環境實際提供的對應工具進行操作）。

**原因 / Reason:**
自行構建指令容易出現各種狀況，例如：
- 環境錯誤 (Environment errors)
- 編碼錯誤 (Encoding errors)
- 路徑錯誤 (Path errors)

### 2. 依賴工具的自動化設計
大多數的寫入檔案工具都具有自動建立路徑的設計，**不需要**手動提前建立路徑（例如避免預先執行建立資料夾的指令）。

### 3. 被動性確認檔案狀態
編輯檔案時，不應為了確認狀態而預先讀取整個檔案，以減少非必要的讀取行為。**絕對不應該假設檔案沒有被更改過而直接覆蓋。** 應先依既有上下文執行最小範圍編輯；只有工具因檔案內容與預期不符而失敗時，才重新讀取檔案並確認實際內容。

如果確認後發現檔案內容與先前記憶不符，**不要立即強制覆蓋或復原**，應分析以下情況：
- 是否有其他人正在同時操作此檔案。
- 該變動是否屬於正常操作（非亂碼、非錯誤編輯）。
- 該變動是否阻礙預定要進行的修改（例如變動區域與目標修改無關）。
- 若變動不影響目標修改，應保留既有變更，只針對預定區域進行最小範圍編輯。
- 若無法判斷變動來源或是否可安全保留，應詢問使用者，確認該檔案是否在操作期間被其他操作更動，以及應如何處理。

**請勿無差別地強制覆蓋檔案內容來復原狀態**，以免刪除其他人的有效修改或造成資料遺失。

### 4. 注意非英文環境的編碼問題
對於非英文的環境或專案，請特別留意編碼問題。特別是在 CJK（中日韓語系）環境下，不論是檔案讀寫或終端機的輸入、輸出，還是顯示的錯誤訊息，都非常容易遭遇編碼衝突（例如 UTF-8 與 Big5 之間的轉換錯誤）。當終端機顯示亂碼時，應優先考慮是否為編碼問題所致，而非盲目猜測指令邏輯錯誤或指令存在。在處理這類環境的檔案或指令時，請確保使用正確的編碼格式，以免造成資料損壞或無法正確解析。

---

## 5. 單一事實來源原則 / Single Source of Truth

**所有邏輯設計與文件撰寫，都應基於「單一事實來源 (Single Source of Truth)」的概念，避免各自維護相同內容。**

**原因 / Reason:**
- 同一份邏輯或資訊分散在多處，容易導致不一致與維護困難
- 修改一處卻忘記更新另一處，將產生難以追蹤的錯誤
- 違反 DRY (Don't Repeat Yourself) 原則，增加不必要的維護成本

### 適用場景

- **配置定義**: 預設值、常量、枚舉定義應集中管理，各模組引用同一來源。
- **類型定義**: 共用型別應提取至共用型別檔案，而非在各模組重複定義。
- **業務邏輯**: 核心邏輯應封裝在共用函式或服務中，避免各處複製貼上相同的實作。
- **文件與註解**: 相同的技術決策或設計說明，應指向同一份文件而非各自撰寫。

### 判定標準

- 任何邏輯或變動，只要未來修改時會造成多處同步更改、妨礙測試，或阻礙複用，就應納入單一事實來源設計。
- 若某邏輯的內部實作需要在測試中被直接使用，或已被多個位置使用，不可複製該邏輯；應將其重構並抽離為可測試、可複用的共用單元。
- 建立資料夾分類目錄時，同樣應避免建立過度侷限、未來無法複用的目錄名稱，也不得過度寬鬆而導致內容混雜；應依穩定且可擴展的職責或領域進行分類。

### 架構與重構職責指向

涉及具體的代碼重構、設計模式、單元職責劃分與 TypeScript 專屬型別抽象時，請參閱對應的專屬重構技能：

- **通用重構指引**：[code-refactoring-expert](../code-refactoring-expert/SKILL.md)（設計模式、回溯相容、增量變更）
- **TypeScript / Node.js 專屬指引**：[code-refactoring-expert-typescript](../code-refactoring-expert-typescript/SKILL.zh.md)（型別安全、精確型別、Single Source of Truth 抽離實務）

---

## 6. 工具使用效率原則

**使用 grep、glob 等搜尋工具時，應在每次指令內同時搜尋相關內容，而非多次執行指令分別搜尋。**

**原因:**
- 多次獨立搜尋浪費執行時間與 Token 配額
- 批次搜尋能更快取得完整上下文，減少決策延遲
- 一次查看更多相關資訊，有助於發現模式與關聯

### grep 批次搜尋範例

```typescript
// ❌ 錯誤：多次獨立搜尋
grep({ pattern: "TODO" })
grep({ pattern: "FIXME" })      // 第二次搜尋
grep({ pattern: "HACK" })       // 第三次搜尋

// ✅ 正確：一次搜尋所有相關內容
/**
 * 一次搜尋所有待辦 / 問題標記
 * Search all TODO/FIXME/HACK markers in one call
 */
grep({ pattern: "TODO|FIXME|HACK" })

// ✅ 正確：結合搜尋主題與過濾條件
/**
 * 搜尋特定主題，同時過濾檔案類型
 * Search specific topic with file type filter
 */
grep({ pattern: "function|class|interface", include: "*.ts" })
```

### glob 批次搜尋範例

```typescript
// ❌ 錯誤：多次獨立搜尋
glob({ pattern: "src/**/*.ts" })
glob({ pattern: "test/**/*.ts" })   // 第二次搜尋
glob({ pattern: "lib/**/*.ts" })    // 第三次搜尋

// ✅ 正確：一次搜尋多個目錄與副檔名
/**
 * 一次搜尋多個目錄下的 TypeScript 檔案
 * Search TypeScript files across multiple directories in one call
 */
glob({ pattern: "{src,test,lib}/**/*.{ts,tsx}" })

// ✅ 正確：搭配排除模式
/**
 * 搜尋所有 TypeScript 檔案，排除測試檔案
 * Search all TypeScript files, excluding test files
 */
glob({ pattern: "src/**/*.ts", path: "D:/project/src" })
```

### 原則總結

| 情境 | 錯誤做法 | 正確做法 |
|------|---------|---------|
| 多個關鍵字搜尋 | 多次 grep 呼叫 | 使用 `|` 合併正則：`grep({ pattern: "A\|B\|C" })` |
| 多個目錄搜尋 | 多次 glob 呼叫 | 使用大括號擴展：`glob({ pattern: "{dir1,dir2}/**/*.ts" })` |
| 關聯檔案搜尋 | 分別搜尋各類型 | 批次縮小範圍：`glob({ pattern: "**/*.{ts,tsx,json}" })` |

---


## 7. 工具呼叫錯誤與路徑驗證原則

當工具呼叫失敗時，**必須嚴謹檢查工具參數、工作區根目錄（root/workspace root）與相對路徑的關係**，不可僅依據失敗結果直接推論檔案不存在、路徑不存在、操作無法完成，或宣稱任務已完成。

### 7.1 路徑應以工作區相對路徑為優先

在已知工作區根目錄的情況下，工具呼叫應**優先使用工作區相對路徑**，而不是自行將工作區根目錄與相對路徑組合成完整路徑。

例如目前工作區為：

```text
path/root
```

目標檔案為：

```text
src/index.ts
```

**優先做法：**

```typescript
edit({ path: "src/index.ts", ... })
```

而不是自行組合：

```text
path/root/src/index.ts
```

尤其不得在根目錄資訊已由工具或工作環境提供的情況下，再自行重複加入根目錄。

### 7.2 錯誤路徑的典型案例

假設實際工作區為：

```text
path/root
```

但 Agent 錯誤地將工具參數組合為：

```text
path/bad-root/src/index.ts
```

此時工具回報找不到檔案，**不能據此認定 `src/index.ts` 不存在**。

應先檢查：

1. 工具目前使用的工作區根目錄是否正確。
2. `path/bad-root` 是否為 Agent 自行錯誤組合出的路徑。
3. 工具是否預期接收工作區相對路徑。
4. 是否可以直接以 `src/index.ts` 再次呼叫工具。
5. 若工具確實要求完整路徑，才應根據已驗證的 root 組合完整路徑。

### 7.3 工具失敗後不得以錯誤結果建立錯誤事實

**禁止以下錯誤推理：**

```text
錯誤路徑 → 工具回報找不到 → 因此檔案不存在
```

正確流程應為：

```text
工具失敗
    ↓
檢查工具參數
    ↓
確認 root / workspace root
    ↓
確認相對路徑與完整路徑的語意
    ↓
修正錯誤參數
    ↓
重新執行工具
    ↓
根據修正後的實際結果判定狀態
```

工具呼叫本身失敗時，**不得把「工具參數錯誤」誤報為「目標不存在」**，也不得在未成功驗證的情況下宣稱「已完成」。

### 7.4 路徑修正優先順序

遇到路徑相關工具錯誤時，應依以下優先順序處理：

1. **優先使用工作區相對路徑**，例如 `src/index.ts`。
2. 若工具需要 root，確認並修正目前使用的 root/workspace root。
3. 只有在工具明確要求完整路徑時，才組合完整路徑。
4. 再次呼叫工具並驗證結果。
5. 只有取得成功且與預期一致的結果後，才能報告操作狀態。

### 7.5 不得重複使用已驗證為錯誤的路徑

如果某個完整路徑已被確認為工具參數錯誤，例如：

```text
path/bad-root/src/index.ts
```

不得在沒有新證據的情況下持續使用該路徑，也不得根據該路徑的失敗結果反覆做出相同結論。

應回到：

```text
workspace root
    +
relative path
```

重新驗證，並優先嘗試：

```text
src/index.ts
```

### 7.6 真實狀態與報告狀態必須一致

Agent 的最終報告必須建立在**成功驗證的工具結果**上。

| 情況 | 不正確做法 | 正確做法 |
|------|------------|----------|
| 錯誤 root 導致找不到檔案 | 直接判定檔案不存在 | 修正 root 或改用相對路徑後重新驗證 |
| 工具參數組合錯誤 | 持續使用錯誤完整路徑 | 回到工作區相對路徑 |
| 工具呼叫失敗 | 宣稱修改已完成 | 先修正參數並確認成功 |
| 尚未驗證檔案狀態 | 假設檔案不存在 | 明確區分「尚未驗證」與「不存在」 |
| 失敗結果來自錯誤路徑 | 將失敗結果視為檔案系統事實 | 僅視為該次工具呼叫的結果 |

**核心原則：工具錯誤不是檔案不存在的證據；錯誤參數造成的失敗，更不能被轉換成虛假的任務狀態。**


---

## 8. 任務範圍紀律：避免 Scope Drift 與非必要探索

目的：標準化 Agent 在「重構 / 結構分析 / 註解」等**以原始檔案為事實來源**的工作中的思考方式，避免將純程式任務擴張成「倉庫狀態與測試行為調查」。

### 8.1 以當前檔案內容為事實基準

- **指定範圍就是探索邊界** — 當使用者指定修改特定檔案或區塊時，嚴禁預先讀取、搜尋或檢查其他無關檔案、目錄或依賴項；預設指定的函式、變數、模組與路徑存在且正確，直接修改或輸出 Patch。
- **既有代碼就是使用指南** — 直接依指定範圍內的 import、呼叫方式、型別與測試案例理解 API 和行為合約；不得為了「確認用法」「了解實作」「確保可行」而查詢無關實作細節、API、路徑或環境。僅實際遇錯、明確調查需求或必要資訊不足時，才做最小範圍查詢。
- **黑盒思維與合約優先（Black-Box Abstraction）** — 外部模組與輔助函式視為黑盒，其型別簽章（Types / Signatures）與既有呼叫即為合約保證；思維與探索深度限制在當前檔案（Call-depth = 0），嚴禁為探究內部演算法或計算過程而循調用鏈跳轉追蹤。
- 重構、註解、結構分析類任務，其 **Source of Truth 就是 Agent 被給定的檔案內容**，而非 Git 狀態。
- `git diff` 只能說明 working tree 與 HEAD 的差異；`git log` 回答「這段 code 如何演變而來」。
- 兩者都**無法幫助判斷「哪些邏輯重複」「哪些是共同 domain fact」**，故不應作為前置調查。
- 即便執行 `git log`，也**無法從結果中得出任何有意義的訊息**：log 列出的提交紀錄**不能表示其內容與被指定的檔案有任何關聯**。因此 git log 既無助於判斷重複事實，也無法佐證「為什麼兩份 code 不同」。

### 8.2 區分「必要」與「可能有用」的動作

| 動作 | 判定 | 說明 |
|------|------|------|
| 閱讀指定 source code | 必要 | 只讀完成指定修改所需的內容 |
| 預先探索無關檔案、目錄、依賴或 API | 不應該 | 既有代碼就是使用指南；實際遇錯或必要資訊不足時才做最小查詢 |
| 跳轉追查外部函式或依賴內部實作 | 嚴禁 | 依賴黑盒原則（Call-depth = 0）；型別簽章即為最高合約 |
| 比較兩個 implementation | 必要 | 找出重複事實 |
| 設計 shared abstraction | 必要 | 抽離共同 domain fact |
| 保留 intentional divergence | 必要 | 在 caller / 配置層保留刻意差異 |
| `git diff` | 非必要 | 只描述 working tree 與 HEAD 差異 |
| `git log` | 非必要 | 回答「如何演變」，不改變當下 SSoT 重複的事實 |
| 為猜 user 意圖而查 Git | 不應該 | 自行擴張問題定義 |
| refactor **前**先查 tests | 通常非必要 | 除非使用者明確要求「確保測試通過」 |
| refactor **後**跑 test 驗證 | 合理 | 整體成果驗證 |

### 8.3 SSoT 重構不因「假設的例外」而停止

- **SSoT ≠ 強迫兩份檔案完全一樣。** 正確目標是抽出「共同 domain fact 成單一來源」，並在 caller / 配置層保留 intentional divergence（`Shared 80%` → 單一來源；`Different 20%` → 各自保留）。
- 即便懷疑某檔是 baseline 或歷史遺留，也應**先用 code structure 判斷是否為相同事實**，而非透過 Git history 猜使用者意圖。
- **範圍由「檔案內容」決定，不由「猜測」收縮**：使用者指出兩檔違反 SSoT，就應全面找 violation（含其他明確相同事實），不該自行把 scope 縮小。

### 8.4 理想 reasoning 流程（以 SSoT 重構為例）

```text
1. 閱讀指定檔案
2. 識別重複概念（型別 / 計算流程 / helper / 執行流）
3. 對每個重複部分，判斷是否代表相同 domain fact
4. 抽出共用事實為單一實作
5. 在 caller / 配置層保留刻意差異
6. 更新兩檔使用共用實作，且依賴方向不產生循環依賴
7. 僅在重構完成後、若有驗證需求，才執行相關 test / build
```

注意最後才是 `test`，而非「先查 test → 因為 test 可能告訴我能不能 refactor」。

### 8.5 與操作限制技能的關係

本節定義**思考與範圍紀律（WHY / HOW）**；具體禁止事項（WHAT）收錄於 `agent-operation-restrictions` 的「避免非必要行為」「禁止濫用或頻繁執行測試」等規則。兩者互補：行為準則解釋「為什麼」，操作限制列出「禁止什麼」。

> 參照：[agent-operation-restrictions](../agent-operation-restrictions/SKILL.md)
> 細化參照（非必要查詢行為的負面案例、執行路徑 / 依賴 / 框架 API / 測試設定與 snapshot 等，以及「行為時機」章節）：[avoid-unnecessary-queries.md](../agent-operation-restrictions/references/avoid-unnecessary-queries.md)

### 8.6 重構時應參考的相關技能

實作 SSoT 抽離與重構時，除了遵循本節的範圍紀律外，應進一步參考專門的重構技能，以確保重構的安全、可回溯與類型安全：

- **`skills/code-refactoring-expert`**：通用安全重構指引（設計模式、回溯相容、增量變更）。
- **`skills/code-refactoring-expert-typescript`**：TypeScript / Node.js 專屬重構與設計指引（型別安全、精確型別、Single Source of Truth、非同步流程優化）。

> 備註：上述兩個重構技能提供「如何正確重構」的具體方法；本節（第 8 節）則負責約束「重構時不該做的多餘探索」，兩者相輔相成。

---

## 9. 過度思考偵測與迴圈中斷

目的：為第 8 節的探索紀律補上**終止條件（stopping criterion）**。第 8 節回答「不該探索什麼」，本節回答「**探索到什麼程度必須停止**」，避免 Agent 在無決定性結果時持續消耗輪次與 Token。

### 9.1 過度思考的判定基準

當思考或探索滿足下列任一條件時，即應判定為**過度思考（overthinking）**：

- **輪次門檻** — 對同一問題思考、探索或嘗試達 **5～10 輪**後，依然沒有決定性結果或明確方向。
- **無進展特徵** — 每輪得到的資訊不改變任何決策，或只是重複驗證已知事實、反覆確認相同假設。
- **雜訊擴散** — 取得的資訊與任務目標無直接關聯，卻被拿來延伸推理（例如為猜測使用者意圖而查詢不相關的歷史、設定或實作細節）。

**核心原則：輪次數是訊號，不是目標。** 遠早於門檻得到決定性結論時應立即行動；接近門檻仍無結論時，必須停止而非提高嘗試頻率。

### 9.2 過度思考發生時的正確行為

1. **立即收斂** — 回到任務目標本身，以現有已驗證的事實做出最佳判斷並行動；不得為了「更確定」而繼續探索。
2. **隔離雜訊** — 將與目標無直接關聯的資訊排除出推理鏈；不因「順帶看到」的內容開啟新的調查分支。
3. **接受不完全確定** — 在可行的多個選項中選擇合理的一個並明確說明理由，遠優於為追求完美答案而停滯。

### 9.3 迴圈中斷與升級（報告使用者）

**當Agent 陷入無法下決定的迴圈時，應停止探索並向使用者報告目前遭遇的問題，而不是無限地繼續進行探索。**

- **觸發條件** — 已達輪次門檻仍無方向；或各選項反覆被自己推翻、形成「嘗試 → 失敗 → 換假設 → 再嘗試」的同質循環。
- **報告內容** — 應包含：目前已知的事實、已排除的選項與原因、卡住的具體點（缺少什麼資訊或決策依據）、以及建議的處理方向（若有）。
- **禁止行為** — 不得在無新證據的情況下重試相同方法；不得以「再查一下就好」為由延續已判定為過度思考的探索；不得因無法決策而自行收窄或擴張任務範圍。

### 9.4 理想流程

```text
探索 / 思考一輪
    ↓
得到新事實？
    ├─ 是 → 是否足以改變決策或達成結論？
    │        ├─ 是 → 行動，結束該問題
    │        └─ 否 → 記錄並繼續（輪次 +1）
    └─ 否 → 屬於雜訊，丟棄，不延伸推理（輪次 +1）
    ↓
已達 5～10 輪門檻仍無決定性結果？
    ├─ 否 → 回到流程開頭
    └─ 是 → 停止探索 → 報告使用者（附 9.3 所列內容）
```

### 9.5 與操作限制技能的關係

與第 8 節相同，本節定義**思考與停止紀律（WHY / HOW）**；`agent-operation-restrictions`「避免非必要行為」條目下的對應規則（WHAT）為其執行面。兩者互補：本節解釋「為什麼必須停」，操作限制列出「不該繼續做什麼」。

> 參照：[agent-operation-restrictions](../agent-operation-restrictions/SKILL.md)

---

## 10. 非必要雜訊預防：探索必須基於明確性需求

目的：約束「預先探索」行為的觸發條件。無根據的預先探索會取得不必要雜訊，甚至被既有錯誤所汙染，進而污染後續推理。

### 10.1 不預先探索指定路徑所屬目錄

**當使用者要求或提供某個路徑 / 檔案時，該路徑本身就是探索邊界；不得預先探索其所屬目錄下還有什麼檔案。**

- 使用者給了 `src/utils/format.ts`，任務就始於 `format.ts` 的內容；不先列舉 `src/utils/` 的其他檔案、不 glob 上層目錄。
- 即使目的看似無害（「先了解上下文」「看看有沒有相關檔案」），只要沒有明確需求支撑，即屬無根據的預先探索。
- 需要同目錄其他檔案作為依據時，應由**任務中實際顯現的需求**觸發（例如該檔案 import 了同目錄模組），而非前置掃描。

### 10.2 探索的觸發條件：明確性需求

探索行為必須基於**明確性的需求**——即「缺少這項資訊就無法完成目前任務」——而不是在沒有任何根據的情況下預先探索。

| 觸發來源 | 是否構成明確性需求 |
|---|---|
| 實際操作中出現錯誤，需定位原因 | ✅ 是 |
| 指定內容缺少完成任務的必要資訊 | ✅ 是 |
| 使用者明確要求調查某範圍 | ✅ 是 |
| 「先了解專案結構」「看看還有什麼」 | ❌ 否（無根據） |
| 「習慣上動手前先掃一遍目錄」 | ❌ 否（無根據） |

### 10.3 無根據探索的兩種污染

1. **雜訊污染** — 探索取得的資訊與任務目標無關，卻進入上下文並被用來延伸推理，稀釋真正的決策依據。
2. **既有錯誤污染** — 目錄 / 檔案中既存的錯誤寫法、過時慣例或缺陷，可能被 Agent 誤讀為「正確範例」或「既有事實」並加以遵循，使錯誤擴散。

**核心原則：探索是手段，不是前置儀式。** 只有明確需求才能觸發探索；無根據的預先探索，成本（雜訊、錯誤污染、輪次浪費）必然高於其收益。

### 10.4 非必要行為與雜訊的正反饋迴路

**非必要行為與雜訊息息相關：每一個非必要行為都會產生雜訊，而雜訊又會模糊思考範圍，進而誘發更多非必要行為，形成正反饋迴路。**

典型例子——查詢 git：

```text
任務與 git 無關
    ↓
執行 git status / git log「順便看一下」（非必要行為）
    ↓
產生雜訊：提交紀錄、分支狀態、diff 進入上下文
    ↓
思考範圍被模糊：開始推測「這些變更是不是與任務相關」
    ↓
誘發更多非必要行為：git diff、讀更多提交、檢查工作區…
    ↓
雜訊進一步累積 → 迴路加劇（最終逼近過度思考，見第 9 節）
```

**破除迴路的要點：**

1. **源頭攔截** — 在每個行為執行前先回答「缺少這項資訊，為什麼就無法完成任務？」答不出來即屬非必要行為，直接省略（與 10.2 明確性需求同一判定）。
2. **拒絕讓雜訊成為推理前提** — 已經意外取得的非必要資訊，不得被用來「延伸出新問題」再行探索；應主動丟棄，回到任務目標。
3. **認知到雜訊的複利效應** — 單一非必要行為看似無害，但其產出的雜訊是後續所有非必要行為的燃料；預防一個源頭，等於中斷整條迴路。

**核心原則：非必要行為不是「多做一點」，而是思考污染的起點。** 保持上下文乾淨（只有完成任務確實需要的資訊），是避免連鎖非必要行為最有效的方式。

> 參照：[agent-operation-restrictions](../agent-operation-restrictions/SKILL.md) — 具體禁止行為見其「避免非必要行為」章節及 [avoid-unnecessary-queries.md](../agent-operation-restrictions/references/avoid-unnecessary-queries.md)

---

## 推薦使用的相關技能

為確保行為的準確性與安全性，可使用以下技能來協助任務執行：

- **`skills/agent-detect-shell`**: 可使用此技能來了解該如何取得環境資訊。
- **`skills/agent-script-execution`**: 可使用此技能來了解如何防止指令構建錯誤。
- **`skills/agent-operation-restrictions`**: 可使用此技能來了解 Agent 在執行任務時必須遵守的嚴格操作限制。
- **`skills/factual-accuracy-guard`**: 可使用此技能來了解如何確保事實準確性，避免過度依賴假設。
- **`skills/code-refactoring-expert`**: 可使用此技能了解安全重構的通用原則（設計模式、回溯相容、增量變更）。
- **`skills/code-refactoring-expert-typescript`**: 可使用此技能了解 TypeScript / Node.js 專屬重構與設計指引（型別安全、精確型別、SSoT、非同步流程優化）。
