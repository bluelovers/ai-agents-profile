---
name: Agent Behavior Standardization Guide
description: >-
  Provides guidelines to standardize agent behaviors,
	avoid common mistakes, and prevent unnecessary actions during task execution.
tags:
  - agents/behavior
  - agents/guidelines
  - file-operations
  - encoding
  - agents/skills
---

# Agent 行為標準化指南 / Agent Behavior Standardization Guide

## 目的 / Purpose

本技能旨在建立 Agent 在執行任務時的標準化行為準則，避免各 Agent 犯下常見錯誤或進行不必要的行為，提升任務執行效率與成功率。

## 檔案操作準則 / File Operation Guidelines

### 1. 優先使用技能與內建工具 / Prioritize Skills and Built-in Tools
Agent 在讀寫檔案或目錄時，**應優先使用具備的技能或內建環境工具**，而不是自行構建 CLI 指令。（註：不同 Agent 環境下的工具名稱可能有所不同，請依據當下環境實際提供的對應工具進行操作）。

**原因 / Reason:**
自行構建指令容易出現各種狀況，例如：
- 環境錯誤 (Environment errors)
- 編碼錯誤 (Encoding errors)
- 路徑錯誤 (Path errors)

### 2. 依賴工具的自動化設計 / Rely on Tool's Automation
大多數的寫入檔案工具都具有自動建立路徑的設計，**不需要**手動提前建立路徑（例如避免預先執行建立資料夾的指令）。

### 3. 編輯檔案前先讀取 / Read Before Editing
在編輯或更新檔案時，**絕對不應該假設檔案沒有被更改過而直接使用記憶中的內容作更改**。

### 4. 注意非英文環境的編碼問題 / Note Encoding Issues in Non-English Environments
對於非英文的環境或專案，請特別留意編碼問題。特別是在 CJK（中日韓語系）環境下，不論是檔案讀寫或終端機的輸入、輸出，還是顯示的錯誤訊息，都非常容易遭遇編碼衝突（例如 UTF-8 與 Big5 之間的轉換錯誤）。當終端機顯示亂碼時，應優先考慮是否為編碼問題所致，而非盲目猜測指令邏輯錯誤或指令存在。在處理這類環境的檔案或指令時，請確保使用正確的編碼格式，以免造成資料損壞或無法正確解析。

---

## 5. 單一事實來源原則 / Single Source of Truth

**所有邏輯設計與文件撰寫，都應基於「單一事實來源 (Single Source of Truth)」的概念，避免各自維護相同內容。**

**原因 / Reason:**
- 同一份邏輯或資訊分散在多處，容易導致不一致與維護困難
- 修改一處卻忘記更新另一處，將產生難以追蹤的錯誤
- 違反 DRY (Don't Repeat Yourself) 原則，增加不必要的維護成本

### 適用場景 / Applicable Scenarios

- **配置定義 (Configuration Definitions)**: 預設值、常量、枚舉定義應集中管理，各模組引用同一來源。
- **類型定義 (Type Definitions)**: 共用型別應提取至共用型別檔案，而非在各模組重複定義。
- **業務邏輯 (Business Logic)**: 核心邏輯應封裝在共用函式或服務中，避免各處複製貼上相同的實作。
- **文件與註解 (Documentation & Comments)**: 相同的技術決策或設計說明，應指向同一份文件而非各自撰寫。

### 實作範例 / Implementation Examples

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

## 6. 工具使用效率原則 / Tool Usage Efficiency

**使用 grep、glob 等搜尋工具時，應在每次指令內同時搜尋相關內容，而非多次執行指令分別搜尋。**

**原因 / Reason:**
- 多次獨立搜尋浪費執行時間與 Token 配額
- 批次搜尋能更快取得完整上下文，減少決策延遲
- 一次查看更多相關資訊，有助於發現模式與關聯

### grep 批次搜尋範例 / grep Batch Search Examples

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

### glob 批次搜尋範例 / glob Batch Search Examples

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

### 原則總結 / Principle Summary

| 情境 | 錯誤做法 | 正確做法 |
|------|---------|---------|
| 多個關鍵字搜尋 | 多次 grep 呼叫 | 使用 `|` 合併正則：`grep({ pattern: "A\|B\|C" })` |
| 多個目錄搜尋 | 多次 glob 呼叫 | 使用大括號擴展：`glob({ pattern: "{dir1,dir2}/**/*.ts" })` |
| 關聯檔案搜尋 | 分別搜尋各類型 | 批次縮小範圍：`glob({ pattern: "**/*.{ts,tsx,json}" })` |

---

## 推薦使用的相關技能 / Recommended Skills

為確保行為的準確性與安全性，可使用以下技能來協助任務執行：

- **`skills/agent-detect-shell`**: 可使用此技能來了解該如何取得環境資訊。
- **`skills/agent-script-execution`**: 可使用此技能來了解該如何防止指令構建錯誤。
- **`skills/factual-accuracy-guard`**: 可使用此技能來了解如何確保事實準確性，避免過度依賴假設。
