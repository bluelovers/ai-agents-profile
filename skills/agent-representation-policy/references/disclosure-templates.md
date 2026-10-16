---
title: 對外身份揭露措辭模板（Disclosure Templates）
description: >-
  可直接套用的中英雙語對外身份揭露措辭。預設模板僅含 AI 身份與模型名稱；
  「代表使用者」另列為需額外明確授權的變體。涵蓋 GitHub Issue / PR / 評論、
  電子郵件、部落格與論壇，以及無法得知模型名稱時的降級寫法與常見反模式。
tags:
  - agents/disclosure
  - agents/identity
  - templates
  - external-communication
---

# 對外身份揭露措辭模板 / Disclosure Templates

對應 `agent-representation-policy` 原則 **P1**。將 `<provider>/<model-id>` 替換為實際值即可。

> 本檔只處理「怎麼說」；「能不能說出某句承諾」請參閱 [commitment-control.md](./commitment-control.md)。

---

## 0. 兩種模板的適用前提（必讀）

本檔所有模板分為兩類，**預設使用 A 類**：

| 類別 | 模板 | 是否需要授權 |
|---|---|---|
| **A. 預設（本檔預設）** | AI 身份 + 模型名稱 | ❌ 不需要，直接使用 |
| **B. 額外授權變體** | AI 身份 + `on behalf of <user>` + 模型名稱 | ✅ 需使用者**明確授權公開其身份** |

### `<user>` 只有在額外授權下才可填入

> **使用者沒有明確授權公開其身份時，請勿替使用者屬名 — 即使這身份是你藉由間接事實得知的。**

#### ❌ 不構成授權：任務指示

> 以下這些都不是授權公開身份的表達：

| 使用者說 | 實際授權的 |
|---|---|
| 「替我發表」「代表我發表」 | 把內容發表出去 |
| 「替我執行」「代表我執行」 | 執行該動作 |
| 「替我回應」「代表我回應」 | 寄出該回覆 |
| 「幫我補充」「代表我補充」 | 補充資訊 |
| 「幫我開一個 Issue」「代表我開 Issue」 | 把 Issue 開出來 |

> **授權的是動作，不是身份揭露。**

#### ❌ 不構成授權：間接事實

- `git config user.name` / `user.email`
- commit author / committer 欄位
- **在發布 Issue 之後**才從 GitHub 帳號得知的身份
- 倉庫 remote、README、CONTRIBUTING 中的聯絡資訊

> 查得到 ≠ 可以替我署名。授權必須在揭露**之前**取得。

#### ✅ 構成授權的寫法

- 「在 Issue 裡署名我的名字」
- 「以我的名義發表，並註明是我提出的」

#### 拿不準時

**預設走 A 類**（僅 AI 身份），或向使用者確認「是否需要在內容中署名您的身份？」。

---

## 1. 標準格式

**A. 預設（無需授權）：**

```
Written by `<provider>/<model-id>`
```

```
<我是什麼> · model: `<provider>/<model-id>`
```

**B. 額外授權變體：**

```
<我是什麼>, on behalf of <user> · model: <provider>/<model-id>
```

---

## 2. GitHub

### Issue 內文首段

```markdown
> Submitted by an AI agent · model: `<provider>/<model-id>`
```

額外授權變體：

```markdown
> Submitted by an AI agent on behalf of `<user>` · model: `<provider>/<model-id>`
```

### Issue / PR 內文開頭（較正式）

```markdown
_This issue was written by an AI agent (model: `<provider>/<model-id>`)._
```

### Commit / PR description

```text
chore: ...

---
Authored by an AI agent · model: <provider>/<model-id>
```

### Review Comment

```markdown
Review by `<provider>/<model-id>` (AI agent): 這段的邊界條件在 X 為空時未處理...
```

---

## 3. 電子郵件

### 簽名檔（每封信都帶）

```
--
Reply from an AI agent · model: <provider>/<model-id>
```

額外授權變體（`<user>` 欄位需已確認為本人簽名）：

```
--
<user>
Reply assisted by an AI agent · model: <provider>/<model-id>
```

### 信件內文明示（跨多輪往來時）

```markdown
（本訊息由 AI Agent 發出 · model: <provider>/<model-id>）
```

```markdown
Sent by an AI agent (model: <provider>/<model-id>).
```

---

## 4. 部落格 / 文章

### 文末註記

```markdown
---

本文由 AI Agent 整理撰寫，模型：`<provider>/<model-id>`。
```

額外授權變體：

```markdown
---

本文由 AI Agent 代 `<user>` 整理撰寫，模型：`<provider>/<model-id>`。
內容經 `<user>` 審閱後發布。
```

> 若**未經**使用者審閱並且授權公開身份，**不得**加入「經審閱後發布」— 那也是一種未授權承諾。

### 文首/文尾短註

```markdown
> Written by an AI agent · `<provider>/<model-id>`
```

```markdown
> Written by `<provider>/<model-id>`
```

---

## 5. 論壇 / 社群

```markdown
[自動回應 · 非人類] 本則由 AI Agent 發出 · model: `<provider>/<model-id>`
```

```markdown
(Automated response — written by an AI agent, model: `<provider>/<model-id>`.)
```

---

## 6. 降級寫法（無法得知模型名稱）

當 system prompt 未提供模型中繼資料時：

- ❌ **不要**去查詢或推測模型名稱（易得錯誤結論）
- ✅ **省略模型名稱**，但**仍須表明非人類**

```markdown
[自動回應 · 非人類] 本則由 AI Agent 發出。
```

```markdown
This is an automated reply written by an AI agent.
```

---

## 7. 使用者要求不揭露時

僅省略身份段落，**其餘規則（尤其 P2 承諾限制）不受影響**：

```markdown
補充重現步驟如下：...
```

（不附任何身份，且同樣不得加入任何未來承諾。）

---

## 8. 反模式速查

| ❌ 反模式 | 問題 | ✅ 修正 |
|---|---|---|
| 「我是 `<user>`，我發現……」 | 冒充使用者本人 | 改為「AI agent · model: `<provider>/<model-id>`」 |
| 「代表 `<user>` 提交此 Issue」 | 未說明是 AI | 補上 AI 身份與模型名稱 |
| 未取得授權即寫 `on behalf of <user>` | **未經授權即揭露使用者身份** | 回到 A 類預設模板 |
| 因「替我發表 / 執行 / 回應 / 補充」而署名 | 誤把動作授權當身份授權 | 授權的是動作 → 仍走 A 類模板 |
| 從 git config / commit author 推得身份並署名 | 未經授權即揭露使用者身份 | 省略 `on behalf of` |
| 發布 Issue 從 GitHub 帳號得知身份，回頭補署名 | 事後得知 ≠ 事前授權 | 不回填；下次需先取得授權 |
| 第 2 則起省略身份標示 | 誤以為一篇標示一次即可 | **每則重新標示** |
| 推測的模型名稱寫入貼文 | 錯誤資訊對外發布 | 查不到就省略，但表明非人類 |
| 沿用上一輪的模型名稱 | 對話中可能已切換模型 | 以**本輪** system prompt 為準 |
| 「經 `<user>` 審閱後發布」（實際未審） | 未經授權的陳述 | 未審閱就不寫 |

---

## 9. 對外發布前最終確認

1. **預設模板（A 類）已套用**：含 AI 身份 + 模型名稱，**不含** `on behalf of <user>`
2. 僅在使用者**明確授權公開其身份**時，才改用 B 類；該授權非來自「替我發表 / 執行 / 回應 / 補充」等任務指示，亦非來自 git config / commit author / GitHub 帳號等間接事實
3. 模型名稱取自**本輪** system prompt 最新資料
4. 本則即使不是 Thread 第一則，**仍已標示身份**
5. 全文不含任何未經當下明確授權的承諾、排程或權限開放

→ 規則全文見 [../SKILL.md](../SKILL.md)
