---
name: test-file-best-practices-extension
description: |-
  擴充 `rules/test-file-best-practices.md` 的測試規則技能，處理測試語意、已知缺陷、非阻塞失敗與框架差異。

  當使用者提及以下關鍵字或情境時觸發：
  - test-file-best-practices
  - 測試語意
  - test.todo
  - test.maybe
  - 已知 bug 測試
  - 非阻塞測試失敗
  - Jest todo
  - Node.js todo
tags:
  - agents/rules
  - testing
  - testing/semantics
  - testing/jest
  - testing/nodejs
  - agents/skills
---

# Test File Best Practices Extension

## 目的

擴充 `rules/test-file-best-practices.md`，讓測試能正確表達「尚未實作」、「已知缺陷」、「可能失敗但不應阻擋流程」與「預期一定拋錯」等不同語意，避免把現有 bug 改寫成正常行為。

## 工作流程

1. 讀取目標規則與目前測試框架、版本及專案既有測試慣例。
2. 判斷測試意圖屬於正常契約、未實作、已知缺陷、非阻塞可能失敗或預期拋錯。
3. 查閱 [測試語意參考](./references/test-semantics.md)，選擇符合框架實際 API 的表示方式。
4. 在目標規則的「核心原則」後新增「測試語意與已知缺陷」章節，並補充決策流程與範例。
5. 確認新增規則不會把 `todo`、`skip`、`maybe` 與預期失敗混為一談，也不會隱藏基礎設施錯誤。
6. 以最小差異更新 `rules/test-file-best-practices.md`，並保留既有章節、連結與格式。

## 核心規則

- 不得為了讓測試通過而修改預期結果，使現有 bug 被描述成正確行為。
- 對已實作但已知可能錯誤的測試，使用專案明確支援的 `maybe` 語意，或選用框架真正符合該語意的 `todo`/預期失敗機制。
- 讓可能失敗的結果保持可見，並明確記錄原因、影響範圍與後續修正條件。
- 將「已知一定會拋錯」視為契約或預期失敗，使用精確的拋錯斷言或框架的預期失敗機制；不得使用 `maybe` 模糊化。
- 不得用無差別的 `try/catch` 吞掉所有錯誤來模擬 `maybe`，以免掩蓋設定錯誤、超時、程序崩潰或無關失敗。
- 對非原生 `test.maybe`，先確認專案確實安裝或實作了該 API，再使用它；不得假設所有測試框架都支援。

## 框架判定

### Jest

- 將 `test.todo(name)` 視為「尚未實作的測試」，不要用它表示「已實作但已知有 bug 的測試」。
- 對已實作且預期會失敗的測試，檢查目前 Jest runner 是否支援 `test.failing`，並確認其語意符合需求。
- 只有在專案明確提供 `test.maybe` 時，才將它用於已知缺陷或非阻塞可能失敗。

### Node.js test runner

- 將 `test.todo`、`it.todo` 或 `{ todo: true }` 視為會執行、但失敗不影響 exit code 的待處理測試；它可表示尚未實作或需要修正的 bug。
- 使用 `skip` 表示不執行測試，不使用 `skip` 代替已知缺陷的非阻塞標記。
- 在提供預期失敗 API 的 Node.js 版本中，將 `expectFailure` 用於「必須拋錯才算通過」的契約，不將它當作 `maybe`。

### 其他框架

- 查閱該框架目前版本的官方文件或專案封裝，不以 API 名稱推測語意。
- 若框架沒有符合需求的原生 API，建立單一、可測試且可追蹤的專案級 `maybe` 實作，並在規則中記錄其退出碼與報告行為。

## 擴充完成條件

- 目標規則包含測試語意分類表。
- 目標規則明確區分 Jest `todo`、Node.js `todo`、`maybe` 與預期拋錯。
- 目標規則包含「不可把 bug 寫成正常行為」的強制要求。
- 目標規則的決策流程包含已知缺陷與非阻塞失敗分支。
- 範例標明適用的測試框架，並說明自訂 `test.maybe` 不是原生 API。
- 若實作自訂 `test.maybe`，提供針對成功、已知失敗、設定錯誤與修復後升級為正常測試的驗證案例。

## 參考資源

- [測試語意、框架差異與 `maybe` 規範](./references/test-semantics.md)
- [`rules/test-file-best-practices.md`](../../rules/test-file-best-practices.md)
