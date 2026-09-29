---
name: agent-behavior-standardization
description: >-
  Provides guidelines to standardize agent behaviors,
  avoid common mistakes, and prevent unnecessary actions during task execution.
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

### 實作範例

```typescript
// ❌ 錯誤：各自維護相同邏輯
// File A: user-service.ts
function formatUserName(user: IUser): string {
    return `${user.lastName} ${user.firstName}`;
}
// File B: profile-service.ts
function formatUserName(user: IUser): string {
    return `${user.lastName} ${user.firstName}`; // 重複邏輯
}

// ✅ 正確：提取至共用工具函式
// utils/format.ts
/**
 * 格式化使用者全名
 * Format user full name
 */
export function formatUserName(user: IUser): string {
    return `${user.lastName} ${user.firstName}`;
}
```

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

- 重構、註解、結構分析類任務，其 **Source of Truth 就是 Agent 被給定的檔案內容**，而非 Git 狀態。
- `git diff` 只能說明 working tree 與 HEAD 的差異；`git log` 回答「這段 code 如何演變而來」。
- 兩者都**無法幫助判斷「哪些邏輯重複」「哪些是共同 domain fact」**，故不應作為前置調查。
- 即便執行 `git log`，也**無法從結果中得出任何有意義的訊息**：log 列出的提交紀錄**不能表示其內容與被指定的檔案有任何關聯**。因此 git log 既無助於判斷重複事實，也無法佐證「為什麼兩份 code 不同」。

### 8.2 區分「必要」與「可能有用」的動作

| 動作 | 判定 | 說明 |
|------|------|------|
| 閱讀 source code | 必要 | 直接分析被指定檔案 |
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

### 8.6 重構時應參考的相關技能

實作 SSoT 抽離與重構時，除了遵循本節的範圍紀律外，應進一步參考專門的重構技能，以確保重構的安全、可回溯與類型安全：

- **`skills/code-refactoring-expert`**：通用安全重構指引（設計模式、回溯相容、增量變更）。
- **`skills/code-refactoring-expert-typescript`**：TypeScript / Node.js 專屬重構與設計指引（型別安全、精確型別、Single Source of Truth、非同步流程優化）。

> 備註：上述兩個重構技能提供「如何正確重構」的具體方法；本節（第 8 節）則負責約束「重構時不該做的多餘探索」，兩者相輔相成。

---

## 推薦使用的相關技能

為確保行為的準確性與安全性，可使用以下技能來協助任務執行：

- **`skills/agent-detect-shell`**: 可使用此技能來了解該如何取得環境資訊。
- **`skills/agent-script-execution`**: 可使用此技能來了解如何防止指令構建錯誤。
- **`skills/agent-operation-restrictions`**: 可使用此技能來了解 Agent 在執行任務時必須遵守的嚴格操作限制。
- **`skills/factual-accuracy-guard`**: 可使用此技能來了解如何確保事實準確性，避免過度依賴假設。
- **`skills/code-refactoring-expert`**: 可使用此技能了解安全重構的通用原則（設計模式、回溯相容、增量變更）。
- **`skills/code-refactoring-expert-typescript`**: 可使用此技能了解 TypeScript / Node.js 專屬重構與設計指引（型別安全、精確型別、SSoT、非同步流程優化）。
