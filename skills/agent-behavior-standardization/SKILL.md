---
name: Agent Behavior Standardization Guide
description: >-
  Provides guidelines to standardize agent behaviors,
	avoid common mistakes, and prevent unnecessary actions during task execution.
tags:
  - agent-behavior
  - standardization
  - guidelines
  - file-operations
  - encoding
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

## 推薦使用的相關技能 / Recommended Skills

為確保行為的準確性與安全性，可使用以下技能來協助任務執行：

- **`skills/agent-detect-shell`**: 可使用此技能來了解該如何取得環境資訊。
- **`skills/agent-script-execution`**: 可使用此技能來了解該如何防止指令構建錯誤。
- **`skills/factual-accuracy-guard`**: 可使用此技能來了解如何確保事實準確性，避免過度依賴假設。
