---
title: verify-md-links 使用與排查指南
description: >-
  Markdown 內部連結驗證工具 verify-md-links.mjs 的用法、選項、輸出格式，以及斷裂連結的排查指南。
  涵蓋「依來源檔位置解析路徑」的核心原則、向上偵測（upward detection）與錨點 slug 比對流程。
tags:
  - agents/skills/skill-creation
  - documentation/references
---

# verify-md-links 使用與排查指南 | Usage & Troubleshooting Guide

`verify-md-links.mjs` 會掃描指定根目錄下的所有 Markdown 檔案，驗證內部連結（檔案路徑與標題錨點）是否指向真實存在的目標；外部連結（`http(s)`、`mailto` 等）一律略過，不發起任何網路請求。腳本風格對齊本倉的 `skills/comment-format-rules-js/references/convert-inline-to-block.cjs`：**腳本名稱於執行時自動取得（自我偵測檔名）**、**執行期日誌為英文**、**掃描根目錄一律於執行時傳入，不寫死於程式碼內**。

> 本檔案中的路徑僅為說明用的範例，腳本本身不內含任何硬編碼路徑。

---

## 1. 執行方式

```bash
# 掃描當前目錄
node verify-md-links.mjs .

# 掃描指定根目錄（路徑於執行時傳入）
node verify-md-links.mjs /path/to/repo

# 一併掃描隱藏目錄
node verify-md-links.mjs . --include-hidden

# 顯示說明
node verify-md-links.mjs --help
```

Windows 也可使用同目錄的包裝腳本（會把參數原樣轉交給 `.mjs`）：

```bat
verify-md-links.bat .
verify-md-links.bat /path/to/repo --include-hidden
```

---

## 2. 參數與選項 | Arguments & options

| 參數 / Argument | 說明 / Description |
| --- | --- |
| `root-dir` | 要掃描的根目錄（預設為目前工作目錄）。 |
| `-h`, `--help` | 顯示使用說明。 |
| `--include-hidden` | 一併掃描以 `.` 開頭的隱藏目錄（預設略過）。 |

### 回傳碼 | Exit codes

- `0` 全部內部連結有效 / all internal links valid
- `1` 發現斷裂連結 / broken links found
- `2` 參數或路徑錯誤 / invalid usage or bad path

---

## 3. 驗證規則

- **略過文件範例**：frontmatter、程式碼圍欄（fenced code）、行內程式碼、HTML 註解內的連結視為文件範例，不會被驗證。
- **錨點 slug 規則（依 GitHub）**：小寫、移除非字母數字（含中文標點，如 `、` 會被移除且不產生連字號）、每個空白逐一轉為 `-`、重複標題依序附加 `-1`/`-2`。
- **路徑區分大小寫**：大小寫不符在 Windows 上可讀取，但在 Linux / GitHub 會 404，故會回報 `case mismatch`。

---

## 4. 輸出格式

每一筆斷裂連結輸出一行：

```
✖ <source-file>:<line> → <target> | <message>
```

結尾會印出彙總：

```
scan root: ...
Markdown files: <n>
internal links: <n>
external links (skipped): <n>
broken links: <n>
✖ found <n> broken link(s)
```

常見 `message`：

- `anchor not found: #<slug>` — 檔案存在但錨點不存在。
- `link escapes the scanned root; candidate -> <path>` — 相對路徑超出根目錄，腳本收斂後找到的候選。
- `case mismatch: should be -> <actual>` — 大小寫與實際檔名不符。
- `file not found; candidate -> <a> | <b> | <c>` — 檔案不存在，腳本自動向上偵測到的候選（見 §5）。
- `file not found` — 檔案不存在，且向上偵測無候選（通常代表目標真的遺失或改名）。

---

## 5. 排查指南 | Troubleshooting

### 核心原則

> 發生疑似斷裂時，**先從路徑與檔案所處位置判斷**，而不是查詢 git / GitHub。
> When a link looks broken, first reason about the path **from the source file's location**, never by querying git or GitHub.

### 步驟 1：計算最終路徑

以「連結所在檔案的目錄」為基準，依相對路徑解析出最終路徑。

例如 `path/to/a/references/file.md` 內出現 `../b/SKILL.md`：

```
來源檔目錄 = path/to/a/references
../b/SKILL.md  →  path/to/a/b/SKILL.md
```

### 步驟 2：檢查路徑組成

- `path/to/a/references` ✓ 存在
- `path/to/a` ✓ 存在
- `path/to/a/b` ✗ **不存在**（中間目錄 `b` 在 `a` 下不存在）

### 步驟 3：向上偵測 | upward detection

既然 `b` 不存在於 `a` 之下，改從上一層目錄尋找同名 `b`：

```
path/to/b/SKILL.md   ✓ 存在  → 修正連結為 ../../b/SKILL.md
```

這就是「向上偵測」：當解析後的中間目錄不存在時，沿著祖先目錄往上找同層級的同名項目。

### 腳本自動候選

腳本已內建簡單的向上偵測機制：當檔案確實不存在時，會把解析路徑由結尾逐段縮短，在已掃描檔案集合中搜尋「以此尾綴結尾」的檔案，並依「與來源檔目錄的接近度」＋「與原解析路徑的接近度」排序，輸出前 3 筆候選。

```
✖ skills/agent-script-execution/SKILL.md:187 → ../docs/VS_Code_Copilot.md | file not found; candidate -> docs/VS_Code_Copilot.md
```

此處候選 `docs/VS_Code_Copilot.md` 指出正確連結應為 `../../docs/VS_Code_Copilot.md`。**候選僅為提示，仍需人工確認是否為預期目標**。

### 常見斷裂類型 | Common breakage types

| 症狀 / Symptom | 判斷方式 / How to judge | 修正方向 / Fix |
| --- | --- | --- |
| `file not found; candidate -> ...` | 解析路徑中間目錄不存在，向上偵測找到同名檔 | 依候選調整相對層數（`../` 多/少一層） |
| `link escapes the scanned root; candidate -> ...` | `../` 數量過多，超出根目錄 | 減少 `../`，或候選即為正確縮減後路徑 |
| `case mismatch: should be -> X` | 大小寫與實際檔名不符 | 改成候選中的正確大小寫 |
| `file not found`（無候選） | 目標檔案真的遺失或已改名/搬移 | 搜尋倉庫確認檔案現況，再決定更新連結或還原檔案 |
| `anchor not found: #slug` | 檔案存在但錨點 slug 不符（見下） | 依 §6 修正 fragment 或標題 |

### 6. 錨點斷裂處理 | Fixing anchor breaks

錨點只依「標題文字」產生，與連結 fragment 比對：

1. 開啟目標檔，找到對應標題（frontmatter、程式碼圍欄內的標題**不會**產生錨點）。
2. 把標題文字套用 GitHub slug 規則，與 fragment 比對：
   - 小寫；
   - 移除標點（含中文標點，`、` `：` 等均移除，且**不**產生連字號）；
   - 每個空白逐一轉為 `-`；
   - 重複標題依序附加 `-1`、`-2`。
3. 例如標題 `### 2. 測試檔案分割原則 / Test File Splitting` 的錨點為 `2-測試檔案分割原則`（句點移除、空白轉 `-`），若連結寫成 `#2--測試...` 或 `#2-測試檔案分割原則` 之外的形式即會斷裂。

### 7. 優先順序 | Priority order

1. 先看 `candidate ->` 候選（腳本已幫你向上偵測）。
2. 候選不合理時，依 §5 步驟手動由來源檔位置解析路徑判斷。
3. 錨點問題依 §6 比對標題與 slug。
4. 確認是「連結寫錯」還是「檔案被搬移/改名」：前者改連結，後者評估是否需移動檔案（遵循檔案搬移的正確方式，勿用刪除重建）。
