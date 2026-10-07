---
description: >-
  無意義測試的判定與改寫：
  僅重複原始碼常數定義（tautological tests，重言式/同義反覆）、或把同一個字面值逐行寫死的斷言，
  無法捕捉行為錯誤，且常數調整時必然失敗；
  預期值應引用常數（單一事實來源），改為驗證「依賴該常數的行為」，
  僅外部協定／API contract 的邊界值才寫契約測試。
tags:
  - documentation/references
  - testing
  - testing/assertions
  - testing/jest
---

# 避免無意義的測試 (Avoid Meaningless Tests)

**不應撰寫僅斷言常數字面值的測試（tautological tests，重言式/同義反覆）。** 此類測試只是重複原始碼中的常數定義，無法捕捉行為錯誤，且每次調整常數都需同步修改，徒增維護成本。

主文件僅保留原則摘要與判斷準則，完整錯誤／正確案例與改寫對照集中於此。

---

## 判斷準則 (Rule of Thumb)

- 若斷言只是 `expect(CONSTANT).toBe(<該常數的字面值>)` → 為無意義測試
- 預期值若是「本模組已宣告的常數」→ **引用常數**，不要重複寫死同一個字面值
- 常數的值是否正確，應由「使用該常數的函式／模組行為」間接驗證
- 若常數來自外部設定或協定（如 API contract）→ 針對該**邊界**寫一筆契約測試，而非逐個字面斷言

### 無意義斷言類型速查

| 類型 | 範例 | 為什麼無意義 | 正確做法 |
|------|------|------------|---------|
| **重複常數定義** | `expect(MAX_TIME).toBe(1000)` | 把 `MAX_TIME = 1000` 再寫一次，未驗證任何邏輯 | 測試依賴該常數的行為 |
| **枚舉值逐項斷言** | `expect(EnumTeamSide.Team0).toBe(0)` | 重複 enum 宣告的內容 | 測試使用該枚舉的分支邏輯 |
| **預期值寫死字面值** | `t.assert.strictEqual(getWorkspaceProtocol(), 'workspace:')` | 預期值與常數宣告重複，常數調整時需逐行同步 | 引用常數 `DEFAULT_WORKSPACE_PROTOCOL` |

---

## 案例一：逐項斷言常數字面值 (Case 1: Asserting Constant Literals)

### 不良範例

```typescript
// ❌ 無意義的測試：僅斷言常數等於其字面定義
describe('game constants', () => {
	test('exposes documented values', () => {
		expect(MAX_TIME).toBe(1000);
		expect(START_TIME).toBe(900);
		expect(MAX_LEVEL).toBe(50);
		expect(MAX_STATUS).toBe(250);
		// ... 其餘常數逐項斷言
	});

	test('EnumTeamSide has numeric values', () => {
		expect(EnumTeamSide.Team0).toBe(0);
		expect(EnumTeamSide.Team1).toBe(1);
	});
});
```

此類測試存在以下問題：

| 缺點 | 說明 |
|------|------|
| **無行為覆蓋** | `expect(MAX_TIME).toBe(1000)` 只是把 `MAX_TIME = 1000` 再寫一次，未驗證任何邏輯 |
| **脆弱且無回饋** | 當設計上需要調整常數（如平衡性改動），測試必然失敗，但失敗不代表程式有 bug |
| **維護雜訊** | 常數越多，無意義的斷言越多，稀釋了真正有意義的測試 |

### 良好範例

改為測試**依賴該常數的行為**，而非常數本身：

```typescript
// ✅ 有意義的測試：驗證常數在業務邏輯中的行為
describe('battle time limit', () => {
	test('should stop the battle when reaching MAX_TIME', () => {
		const battle = createBattle({ elapsed: MAX_TIME + 1 });
		expect(battle.isOver).toBe(true);
	});

	test('should allow one extra turn within TURN_EXTENDS window', () => {
		const battle = createBattle({ turns: BATTLE_MAX_TURNS });
		expect(battle.canExtend).toBe(true);
	});
});
```

---

## 案例二：預期值寫死字面值，而非引用常數 (Case 2: Duplicated Literal Instead of Constant)

**當預期值本身就是「已宣告的常數」時，測試應引用該常數，而非把同一個字面值再寫一遍。**

### 不良範例

```typescript
// ❌ 三處問題：重複常數定義、預期值與常數宣告重複
test('getWorkspaceProtocol: default and swappable', (t: test.TestContext) =>
	{
		t.assert.strictEqual(DEFAULT_WORKSPACE_PROTOCOL, 'workspace:');
		t.assert.strictEqual(getWorkspaceProtocol(), 'workspace:');
		t.assert.strictEqual(getWorkspaceProtocol({}), 'workspace:');
		t.assert.strictEqual(getWorkspaceProtocol({ protocol: 'custom:' }), 'custom:');
	});
```

**問題解析：**

1. `t.assert.strictEqual(DEFAULT_WORKSPACE_PROTOCOL, 'workspace:')` — 直接斷言常數等於其字面定義，屬 **tautology（重言式/同義反覆，案例一）**，未驗證任何行為
2. 兩處 `getWorkspaceProtocol()` / `getWorkspaceProtocol({})` 的預期值 `'workspace:'` — 與常數宣告**重複寫死同一個字面值**，預設值一旦調整需逐行同步，測試失敗只代表常數改了，不代表程式有 bug
3. 斷言彼此獨立寫死字面值 — 常數與函式回傳值沒有任何關聯，**沒有驗證到「函式回傳的就是那個預設常數」**

### 良好範例

```typescript
// ✅ 刪除常數定義斷言；預期值引用常數；保留驗證「可覆寫」的行為斷言
test('getWorkspaceProtocol: default and swappable', (t: test.TestContext) =>
	{
		t.assert.strictEqual(getWorkspaceProtocol(), DEFAULT_WORKSPACE_PROTOCOL);
		t.assert.strictEqual(getWorkspaceProtocol({}), DEFAULT_WORKSPACE_PROTOCOL);
		t.assert.strictEqual(getWorkspaceProtocol({ protocol: 'custom:' }), 'custom:');
	});
```

### 改寫對照

| 原斷言 | 處理 | 理由 |
|--------|------|------|
| `t.assert.strictEqual(DEFAULT_WORKSPACE_PROTOCOL, 'workspace:')` | **刪除** | 重複常數定義，屬 tautology（重言式/同義反覆） |
| `getWorkspaceProtocol()` 預期值 `'workspace:'` | → `DEFAULT_WORKSPACE_PROTOCOL` | 引用單一事實來源；驗證「函式回傳預設常數」的行為 |
| `getWorkspaceProtocol({})` 預期值 `'workspace:'` | → `DEFAULT_WORKSPACE_PROTOCOL` | 同上；同時驗證「傳入空選項不改變預設值」 |
| `getWorkspaceProtocol({ protocol: 'custom:' })` 預期值 `'custom:'` | **保留** | 驗證「protocol 可覆寫」的行為；`'custom:'` 是測試輸入的一部分，非重複宣告 |

**改寫後的測試真正涵蓋兩件事：**

- **預設行為**：無參數／空選項皆回傳 `DEFAULT_WORKSPACE_PROTOCOL`（預設值解析正確）
- **可覆寫行為**：傳入自訂 `protocol` 時回傳該值（選項生效）

常數本身的字面值 `'workspace:'` 是否正確，交由使用它的模組行為間接驗證；若該值來自外部協定，只需另寫一筆契約測試（見下一節），不必在每個案例重複斷言。

---

## 何時允許字面值斷言 (When Literal Assertions Are Allowed)

| 情境 | 是否允許 | 說明 |
|------|---------|------|
| 斷言**本模組已宣告的常數** | ❌ 禁止 | 引用常數，或改測依賴該常數的行為 |
| 預期值與**常數宣告重複** | ❌ 禁止 | 預期值改為引用常數 |
| 外部協定／API contract 定義的邊界值 | ✅ 允許 | 針對該**邊界**寫一筆契約測試，不逐項重複 |
| 測試輸入資料（fixture）中的字面值 | ✅ 允許 | 屬於輸入資料，而非重複宣告常數 |

```typescript
// ✅ 外部協定邊界：只需一筆契約測試，而非逐個常數字面斷言
test('workspace protocol matches the Yarn protocol contract', (t: test.TestContext) =>
	{
		t.assert.strictEqual(DEFAULT_WORKSPACE_PROTOCOL, 'workspace:');
	});
```

---

## 相關資源 (Related Resources)

- [SKILL.md](../SKILL.md)
- [斷言語法優化：可讀性 matcher 與物件比對](./assertion-syntax.md)
- [測試框架 API 重構範例](./examples.md)
- [臨時檔案管理：Mock 安全規則與清理策略](./temp-file-management.md)
