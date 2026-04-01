---
description: Autonomous task execution with auto-continue and parallel sub-agent processing until completion
agent: monarch
model: opencode/big-pickle
---
## 任務執行策略

### 1. 主動執行原則（持續模式）

請依序檢查：
1. 若後續任務明確可行，繼續執行
2. 若存在潛在風險（如破壞性變更、資料遺失、安全疑慮、或將更動專案外檔案），請先停止並說明風險，請求用戶確認
3. 若需求模糊或資訊不足，請停止並說明疑點，請求用戶澄清
4. 若非用戶明確要求撤銷更改或刪除檔案，請先詢問用戶，獲得許可後才執行

**若任務已完成，請複查並總結結果後結束**

Check in order:
1. If the next step is clear and actionable, proceed.
2. If potential risks exist (e.g., destructive changes, data loss, security concerns, or modifying files outside the project), stop, explain the risks, and request confirmation.
3. If requirements are ambiguous or information is insufficient, stop, state the uncertainty, and request clarification.
4. Unless the user explicitly requests to revert changes or delete files, always ask for permission first and only proceed after obtaining user consent.

**If the task is complete, review and summarize the results, then end.**

### 2. 子任務分配條件

- 識別可並行執行的任務
- 當存在 3 個以上獨立任務時
- 當任務執行時間預計超過 60 秒時
- 當任務涉及不同套件/模組時

### 3. 子任務調用方式

- 執行 opencode-arise 的 `arise_summon` 或 `arise_background` 進行子任務分工

    [opencode-arise](https://github.com/moinulmoin/opencode-arise)
    它允许 OpenCode 充当「Monarch」，派生出多个轻量级的从属代理（Shadow Agents）并行处理任务。

    - `@monarch`（負責任務協調與分配）
    - `@beru`（快速的程式碼探索）
    - `@igris`（精確的程式碼實作）
    - `@bellion`（策略規劃與架構分析）
    - `@tusk`（UI/UX與前端）
    - `@tank`（外部文檔與網路搜尋）
    - `@shadow-sovereign`（深度推理與複雜Debug）

- 或 OpenCode 內建的 `@general` 子代理 (subagent)
- 或其他已知可進行子任務分工的方式

### 4. 任務協調

- 子任務失敗時，自動重試或回報錯誤
- 所有子任務完成後，自動整合結果並繼續主流程
