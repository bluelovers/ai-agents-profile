---
name: agent-script-execution
description: >-
  Script execution path and working directory rules for AI agents.
  Covers absolute vs relative path usage, working directory management, and error handling for script execution.
  Suitable for:
  (1) Executing scripts with correct path resolution,
  (2) Handling relative path and working directory mismatches,
  (3) Diagnosing "command not found" errors in script execution,
  (4) Using absolute paths to avoid environment PATH assumptions,
  (5) Error diagnosis and stopping rules for failed script execution.
  Use this Skill when users ask about "script execution", "path resolution", "working directory", "relative path errors", or "command not found".
tags:
  - script-execution
  - path-resolution
  - working-directory
  - troubleshooting
---

# Agent Script Execution Path Rules

本技能定義了 Agent 在終端機執行腳本時，應遵循的路徑與工作目錄規範，以避免因相對路徑解析錯誤而導致的執行失敗。

> **核心目標**
> - **路徑正確性 (Path Correctness)**：使用絕對路徑或正確的相對路徑標記
> - **工作目錄一致性 (Working Directory Consistency)**：確保腳本執行時的工作目錄正確
> - **錯誤診斷 (Error Diagnosis)**：正確識別路徑不匹配導致的錯誤
> - **停止嘗試原則 (Stop Attempting Principle)**：連續失敗時停止並請求指示

---

## 問題情境

### 相對路徑與工作目錄不匹配

當 Agent 執行如下指令時：

```batch
hof/trust_path/bin/php-test.bat phpunit/PatternTest.php
```

可能會遇到以下錯誤（Big5 編碼亂碼）：
```
'hof'    O     Υ~   R O B i   檺 {   Χ妸 ɡC
```

這段亂碼實際代表：「**'hof' 不是內部或外部命令、可執行的程式或批次檔。**」

#### 錯誤原因

這是一個典型的**相對路徑 (Relative Path)** 與**工作目錄 (Working Directory)** 不匹配的問題。

- 在終端機（CMD, PowerShell, Git Bash）能執行成功，是因為當時所在的資料夾（CWD）剛好就在可以看見 `hof` 資料夾的位置。
- 而執行出錯，是因為它啟動腳本時的「起點」不同（可能是在專案根目錄的上一層，或是完全不同的目錄啟動），導致系統把路徑的第一部分 `hof` 當成了一個獨立的指令來執行。

#### 解決辦法與執行規範

Agent 在執行任何腳本時，**必須**採用以下三種方法之一，以確保腳本能被正確解析與執行：

##### 方法 1：使用絕對路徑 (推薦的第一個嘗試方法)

**建議 Agent 執行的完整指令寫法：**

假設執行檔路徑位於 `D:/Users/WebstormProjects/game/Hall-of-Fame/.codenomad/worktrees/develop5/hof/trust_path/bin`

```batch
# 範例
"<完整目錄路徑>/php-test.bat" phpunit/PatternTest.php
# ✅ 正確範例
"D:/Users/WebstormProjects/game/Hall-of-Fame/.codenomad/worktrees/develop5/hof/trust_path/bin/php-test.bat" phpunit/PatternTest.php
```

##### 方法 2：使用相對路徑的正確標記

在執行指令前加上 `./`，明確告訴系統這是一個當前目錄下的路徑。

**注意：** 使用此方法之前，要先確認所在路徑與目標執行檔的路徑

```bash
# ✅ 正確範例
./hof/trust_path/bin/php-test.bat phpunit/PatternTest.php
```

##### 方法 3：先切換目錄

如果 Agent 支援多行指令，先進入目錄再執行：
*(註：這裡使用反斜線 `/` 是為了確保在所有 Windows 命令提示字元環境下都有最高的相容性)*

```batch
# ✅ 正確範例
cd /d "D:/Users/WebstormProjects/game/Hall-of-Fame/.codenomad/worktrees/develop5"
hof/trust_path/bin/php-test.bat phpunit/PatternTest.php
```

---

### 目錄已存在導致 mkdir 失敗（Big5 亂碼）

> 此情境為亂碼診斷的補充範例，與路徑問題無直接關聯，故獨立為情境二。

當 Agent 執行如下指令時：

```batch
mkdir -p .kilocode/rules-code .kilocode/rules-debug .kilocode/rules-ask .kilocode/rules-architect
mkdir .kilocode
```

可能會遇到以下錯誤（Big5 編碼亂碼）：
```
�R�O�y�k�����T�C

�l�ؿ����ɮ� .kilocode �w�g�s�b�C

 l ؿ    ɮ  .kilocode  w g s b C

 R O y k     T C
```

這段亂碼實際代表：「**無法在已存在的 .kilocode 目錄下建立目錄**」（Windows CMD 回報目標目錄已存在）。

#### 錯誤原因

這不是路徑問題，而是**目標目錄已經存在**，`mkdir` 指令因目錄重複建立而失敗。

- 亂碼中的可辨識片段 `.kilocode` 和 `w g s b C`（已存在）是關鍵線索
- 常見錯誤模式：`�l�ؿ����ɮ� <路徑> �w�g�s�b�C` → 目標目錄已存在，無法建立
- 常見錯誤模式：`�R�O�y�k�����T�C` → 無法建立目錄（原因：已存在）

#### 處理方式

- **不要**嘗試變化 `mkdir` 指令的語法（如改用 `mkdirs`、`md` 等）來繞過錯誤
- **不要**嘗試撰寫代碼解碼亂碼
- **正確做法**：從亂碼中辨識出「目錄已存在」的含義，直接跳過已存在的目錄建立步驟，或改用 `mkdir` 不帶 `-p` 的寫法確認錯誤類型
- 若目錄確實已存在且內容正確，則無需再次建立

---

## 注意事項 / Precautions

### 1. 禁止假設環境變數 PATH / Do Not Assume PATH

**永遠不要假設 `php-test.bat` 存在於 PATH 內，可以被直接以 `php-test.bat` 訪問。**

所有腳本執行必須明確指定路徑（絕對路徑或帶有 `./` 的正確相對路徑）。

### 2. 錯誤診斷與處理原則 / Error Diagnosis and Handling Principles

當執行出錯時，請遵循以下原則：

- **優先檢查路徑與工作目錄**：確認當前工作目錄 (CWD) 是否正確，以及相對路徑是否指向存在的檔案。
- **解析錯誤訊息的真實意圖**：
  - Windows CMD 輸出 Big5 亂碼（如 `'hof'    O ...`）通常代表系統找不到該路徑開頭的檔案或目錄。
  - 錯誤訊息表達的是「路徑不匹配」或「找不到執行檔」，而非執行檔內部的邏輯錯誤。
  - **亂碼訊息判斷方法**：
    - 亂碼基本上是中文訊息的 Big5 編碼錯誤，應該從可辨識的字母或單字推測原文意義
    - 少數情況下，前一個中文訊息的亂碼會影響後面的字元，導致連串亂碼
    - 常見錯誤模式：`'<路徑>' 不是內部或外部命令` → 路徑不正確或檔案不存在
    - 常見錯誤模式：`系統找不到指定的路徑` → 工作目錄錯誤或路徑不存在
    - 常見錯誤模式：`�l�ؿ����ɮ� <路徑> �w�g�s�b�C` → 目標目錄已存在，無法建立（如 `mkdir` 時目錄已存在）
    - 若訊息包含檔案名稱或路徑片段，代表系統嘗試執行該路徑但失敗
- **禁止不必要的腳本讀取與指令重構**：
  - 若錯誤原因僅在於路徑找不到執行檔，**不應嘗試讀取執行檔內容來企圖自行構建指令**。
  - 應修正呼叫路徑、切換正確的工作目錄，或改用絕對路徑。只有在路徑完全正確但執行結果與預期不符時，才考慮分析腳本內容。
  - 若錯誤為目錄已存在（如 `mkdir` 亂碼），**不應嘗試變化指令語法來繞過錯誤**，應直接跳過已存在的目錄。

### 3. 停止嘗試與請求指示 / Stop Attempting and Request Instructions

**當連續兩次企圖修正指令但仍然執行失敗時，必須立即停止嘗試。**

- **紀錄行為與錯誤**：詳實紀錄所有已嘗試的行為與對應的錯誤訊息。
- **避免重複失敗**：嚴禁在之後的動作中再次嘗試相同的失敗行為。
- **尋求使用者指示**：此時應先停下來，主動回報問題並詢問使用者的指示，避免陷入無意義的錯誤循環。

### 4. 利用環境檢測增強語法正確性 / Use Environment Detection to Enhance Syntax Accuracy

在執行指令前或遇到語法不明確時，**可使用 `agent-detect-shell` 技能來檢測當前終端環境**（如 CMD, PowerShell, Bash 等）。精準辨識所在環境的 Shell 類型，能幫助您採用對應的正確語法及路徑格式，進而大幅增強指令執行的正確性，減少跨環境的語法衝突。

### 5. 注意非英文環境的編碼問題 / Note Encoding Issues in Non-English Environments

對於非英文的環境或專案，請特別留意編碼問題。特別是在 CJK（中日韓語系）環境下，不論是檔案讀寫或終端機的輸入、輸出，還是顯示的錯誤訊息，都非常容易遭遇編碼衝突（例如 UTF-8 與 Big5 之間的轉換錯誤）。當終端機顯示亂碼時，應優先考慮是否為編碼問題所致，而非盲目猜測指令邏輯錯誤或指令存在。在處理這類環境的檔案或指令時，請確保使用正確的編碼格式，以免造成資料損壞或無法正確解析。

---

## 相關資源

- [VS Code Copilot 指令載入規則](../docs/VS_Code_Copilot.md)
- [agent-detect-shell 技能](../agent-detect-shell/SKILL.md)