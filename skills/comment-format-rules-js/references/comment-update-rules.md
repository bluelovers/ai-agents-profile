---
description: >-
  更新既有註解時的規則：保留原始錯誤資訊與技術細節、驗證 Issue 連結相關性、
  保留其他語言的原始註解，以及更新前的檢查清單。
tags:
  - comments/format
  - documentation/jsdoc
  - documentation/references
---

# 註解更新規則 (Comment Update Rules)

更新既有註解時，遵循以下規則以保留有價值的技術資訊。

## 保留原始錯誤資訊

當代碼包含錯誤碼、錯誤訊息時，**只能添加翻譯，不得刪除**：

```typescript
// ✅ 正確：保留原始錯誤碼和訊息
/**
 * 工具建立函式（避免 TypeScript 推導錯誤）
 * Tool creation function (avoids TypeScript inference errors)
 *
 * > error TS2742: 原始錯誤訊息 (保留不刪)
 */

// ❌ 錯誤：刪除原始錯誤資訊
/**
 * 工具建立函式
 * Tool creation function
 */
```

## Issue 連結需驗證相關性

新增 Issue/文件連結前，必須確認內容確實相關。新增條件：

1. 已閱讀 Issue 內容
2. 確認與代碼/問題/邏輯/意圖有直接關聯
3. 無法確認時 → 不新增，或標註「可能相關，未驗證」

Have read the Issue content; confirm direct relevance to code/problem/logic/intent; if unable to verify → do not add, or mark as "possibly related, unverified".

## 錯誤訊息的價值 (Value of Error Messages)

| 資訊類型 / Information Type | 價值 / Value |
|---------------------------|-------------|
| 錯誤碼 (`TS2742`) | 可搜尋、可引用 / Searchable, can be referenced |
| 完整路徑 (`.pnpm/zod@4.1.8/...`) | 有助於定位問題 / Helps locate the problem |
| 錯誤描述 | 社群已知問題的驗證 / Verification of known community issues |

**這些都不應被視為「冗餘」而刪除。These should NOT be deleted as "redundant".**

## 保留其他語言的原始註解 (Preserve Other Languages)

**核心原則：若原始註解包含中文與英文以外的語言，請保留該語言的註解。**

當遇到包含其他語言（包含但不限於日語、韓語、德語、法語等）的原始註解時，應保留該語言內容，並在其後添加繁體中文與英文的雙語註解。

| 情境 / Scenario | 處理方式 / Handling |
|-----------------|---------------------|
| 原始註解為純其他語言（如日語） | 保留日語，新增繁體中文與英文翻譯 |
| 任意多語言註解（例如：中、英、日） | 保留所有語言，維持原有結構；檢查是否缺少中英註解，若缺少則補充 |
| 原始註解僅為中英雙語 | 遵循標準雙語註解格式 |

**範例 1：日語註解保留**

```typescript
// 原始：
/**
 * パスワードを暗号化する
 */
function encryptPassword(password: string) { ... }

// ❌ 錯誤結果（日語遺失，僅保留中英雙語）：
/**
 * 密碼加密函式
 * Password encryption function
 */
function encryptPassword(password: string) { ... }

// ✅ 正確結果（保留原始日語並添加中英雙語）：
/**
 * パスワードを暗号化する
 * 密碼加密函式
 * Password encryption function
 */
function encryptPassword(password: string) { ... }
```

**範例 2：韓語註解保留**

```typescript
// 原始：
/**
 * 데이터베이스 연결 설정
 */
const dbConfig = { ... };

// ✅ 正確結果（保留原始韓語並添加中英雙語）：
/**
 * 데이터베이스 연결 설정
 * 資料庫連線設定
 * Database connection configuration
 */
const dbConfig = { ... };
```

**範例 3：多語言註解補充中英**

```typescript
// 原始（已有日語 + 英語，缺少中文）：
/**
 * ユーザーデータを処理する
 * Process user data
 */
function processUserData(user: User) { ... }

// ✅ 正確結果（保留所有語言，補充缺少的中文）：
/**
 * ユーザーデータを処理する
 * 處理使用者資料
 * Process user data
 */
function processUserData(user: User) { ... }
```

## 更新前檢查清單

- [ ] 原始註解的技術資訊是否保留？（錯誤碼、版本號、檔案路徑等）
- [ ] 新增的連結是否已驗證相關性？
- [ ] 是否與代碼/問題/邏輯/意圖相關？
