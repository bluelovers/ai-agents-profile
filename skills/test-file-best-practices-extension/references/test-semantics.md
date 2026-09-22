---
name: test-semantics
description: >-
  測試語意、已知缺陷、非阻塞失敗與 Jest/Node.js `todo` 差異的參考規範。
tags:
  - agents/rules
  - testing
  - testing/semantics
  - testing/jest
  - testing/nodejs
---

# 測試語意與已知缺陷 / Test Semantics and Known Defects

## 語意分類

| 測試意圖 | 測試本體是否執行 | 失敗是否應影響 exit code | 正確表示方式 |
|---|---:|---:|---|
| 正常行為契約 | 是 | 是 | 一般測試與明確斷言 |
| 尚未實作測試 | 否 | 否 | 框架明確支援的 `todo` |
| 已實作但有已知缺陷 | 是 | 依專案政策通常否 | 專案級 `maybe`，或符合語意的框架機制 |
| 已知一定會拋錯 | 是 | 是，若未依契約拋錯 | 精確拋錯斷言或預期失敗機制 |
| 暫時不執行 | 否 | 否 | `skip`，並記錄原因 |

## 不可妥協的原則

1. 不得修改預期值、刪除斷言或重寫測試敘述，讓現有 bug 看起來像正確行為。
2. 已知缺陷必須在測試報告中可見，不能以靜默通過或無訊息的 catch 隱藏。
3. `maybe` 只應降低指定行為失敗對 exit code 的影響，不應降低測試環境、設定、超時或程序崩潰等問題的嚴重性。
4. `maybe` 不應成為永久存放 bug 的位置；缺陷修正後，移除 `maybe` 並保留正常斷言。
5. 自訂 `test.maybe` 不是測試框架原生標準；使用前後都必須確認實際 API、報告格式與 exit code 行為。

## Jest 語意

### `test.todo`

Jest 的 `test.todo(name)` 表示「計畫撰寫但尚未實作」的測試。它不是「已實作、但現在可能失敗」的標記。Jest 在傳入測試回調函式時會拋出錯誤；已實作但暫時不想執行的測試應依情境使用 `test.skip`，預期失敗則應檢查 `test.failing` 是否適用於目前 runner。

```typescript
import { test } from "@jest/globals";

test.todo("implement associative addition behavior");
```

### `test.failing`

`test.failing` 用於已實作且預期目前會失敗的測試。它是預期失敗語意，不等於非阻塞的 `maybe`：測試通過時反而表示應移除 `failing` 標記。使用前確認目前 Jest runner 支援此 API。

```typescript
import { test } from "@jest/globals";

test.failing("rejects duplicate email", () => {
  expect(createUser(duplicateEmail)).resolves.toBeDefined();
});
```

### `test.maybe`

`test.maybe` 不是 Jest 原生 API。只有專案明確安裝、匯入或實作此 API 時才能使用。其名稱不能作為語意證明；必須以實作與文件確認它會執行測試、保留失敗報告、避免影響 exit code，並能區分行為失敗與基礎設施失敗。

## Node.js test runner 語意

### `todo`

Node.js 的 `test.todo`、`it.todo`、`{ todo: true }` 與 `context.todo()` 表示待處理的測試。測試會執行；待處理失敗不會被視為測試失敗，因此不會影響程序 exit code。此語意可承接到尚未實作的測試，也可承接到已實作但仍需修正的 bug。

```typescript
import assert from "node:assert/strict";
import test from "node:test";

test("normalizes legacy user name", { todo: "known bug in legacy normalization" }, () => {
  assert.equal(normalizeLegacyName(input), expectedName);
});
```

`todo` 與 `skip` 不同：`skip` 的測試本體不執行，`todo` 的測試本體仍會執行。

### 預期拋錯

「已知一定會拋錯」是明確契約，不是 `maybe`。使用精確的拋錯斷言，讓未拋錯、拋錯類型不符或訊息不符時測試失敗。Node.js 版本若提供 `expectFailure`，應依其文件使用，並注意它與 `todo` 的退出碼語意不同。

```typescript
import assert from "node:assert/strict";
import test from "node:test";

test("rejects invalid configuration", () => {
  assert.throws(() => parseConfig(invalidConfig), {
    name: "SyntaxError",
  });
});
```

## 自訂 `test.maybe` 的最低要求

若測試框架沒有符合需求的原生 API，建立單一專案級實作，不要在多個測試檔案複製相同的失敗處理邏輯。實作至少應滿足：

- 執行測試本體，而不是直接跳過。
- 將成功、可能失敗與未分類錯誤分開報告。
- 只把明確分類的行為失敗標記為非阻塞。
- 保留錯誤訊息、堆疊、測試名稱與已知問題連結。
- 不影響 exit code 的同時，讓報告與 CI 紀錄仍可發現該問題。
- 提供升級路徑：缺陷修正後，將 `maybe` 改為一般測試。
- 對設定錯誤、超時、程序崩潰和未分類異常維持失敗或明確告警，不靜默吞掉。

概念範例只描述 API 形狀，不代表任何框架內建支援：

```typescript
await test.maybe("legacy normalization may still fail", async () => {
  assert.equal(normalizeLegacyName(input), expectedName);
});
```

## 決策流程

```text
開始建立或修改測試
    │
    ├─ 測試是否尚未實作？
    │       ├─ 是 → 使用框架明確支援的 todo
    │       └─ 否
    │
    ├─ 拋錯是否是明確契約？
    │       ├─ 是 → 使用精確拋錯斷言或預期失敗機制
    │       └─ 否
    │
    ├─ 測試已實作但存在已知或可能缺陷？
    │       ├─ 是 → 使用專案明確支援的 maybe
    │       │        或符合該語意的框架機制
    │       └─ 否 → 使用一般測試
    │
    └─ 只是暫時不執行？
            └─ 是 → 使用 skip 並記錄原因
```

## 寫入 `rules/test-file-best-practices.md` 的建議位置

1. 在「核心原則」後新增「測試語意與已知缺陷」章節。
2. 在決策流程中加入「尚未實作 → todo」「已知缺陷 → maybe」「一定拋錯 → 預期失敗」分支。
3. 在注意事項中禁止把 bug 的實際輸出改成 expected。
4. 在範例旁標明 Jest、Node.js 或專案自訂 API，避免跨框架誤用。
5. 將本文件作為詳細參考連結，不在目標規則重複完整框架文件。

## 官方參考

- [Node.js test runner: TODO tests](https://nodejs.org/api/test.html#todo-tests)
- [Jest Globals: `test.todo`](https://jestjs.io/docs/api#testtodoname)
- [Jest Globals: `test.failing`](https://jestjs.io/docs/api#testfailingname-fn-timeout)
