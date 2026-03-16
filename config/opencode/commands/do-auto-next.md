---
description: Autonomous task execution with auto-continue and parallel sub-agent processing until completion
agent: monarch
---
## 任務執行策略

### 1. 主動執行原則（持續模式）

- 在明確表示任務完成或收到「完成/停止」指令前，自動執行後續步驟
- 不需等待用戶確認即可繼續

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

- 子任務完成後自動收集結果，繼續主流程

