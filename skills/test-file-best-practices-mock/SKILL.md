---
name: test-file-best-practices-mock
description: >-
  測試模擬 (Mock & Spy) 與系統依賴隔離最佳實踐規範。
  涵蓋 Node.js 內建模組 (如 fs、path)、第三方套件模組、
  時間 (Fake Timers)、環境變數 (process.env)、網路請求攔截，
  以及基於 memfs-extra 的記憶體虛擬檔案系統、
  主動接管原則、路徑安全約束與跨測試框架 (Jest / Vitest / Bun / Node.js) 的 Mock API 對照。

  啟動條件：
  (1) Mock fs / 檔案系統模擬
  (2) memfs-extra / 記憶體虛擬檔案系統
  (3) jest.mock / vi.mock / spyOn
  (4) 依賴模組攔截 / 模擬第三方模組
  (5) Fake Timers / 日期時間模擬
  (6) process.env 測試環境隔離
  (7) 網路請求 Mock (fetchMock / msw / nock)
  (8) Mock 安全防護 / 路徑白名單約束
compatibility: opencode
metadata:
  audience: agents
  domain: testing
tags:
  - agents/skills
  - agents/guidelines
  - testing
  - testing/mock
  - testing/jest
  - filesystem
  - nodejs
---

# 測試模擬與系統依賴隔離規範 / Test Mock & System Dependencies Isolation

## 概述

本規範定義在撰寫與重構測試時，針對**系統依賴（檔案系統、日期時間、環境變數、網路請求）與外部模組**的模擬 (Mock)、監控 (Spy) 與隔離原則。

核心目標在於：
1. **防止環境污染**：杜絕測試對實體檔案系統、全域環境變數造成殘留變更。
2. **保障測試確定性**：消除真實時間流逝與網路外部服務波動帶來的不穩定性。
3. **安全邊界防護**：即使在模擬環境下，所有路徑仍須嚴格限制在測試專用目錄內。
4. **雜訊最小化**：避免不必要的 I/O 模擬，優先使用純資料與純函式斷言。

---

## 核心決策：系統依賴處理矩陣 / System Dependencies Decision Matrix

遇到外部資源與系統依賴時，依下表順序進行決策：

| 系統資源 / Resource | 優先處理策略 (Priority) | 替代/備選策略 (Fallback) | 推薦工具 (Recommended Tools) |
| :--- | :--- | :--- | :--- |
| **檔案內容驗證** | 非 I/O API（如 `stringify()` 直接斷言字串） | 記憶體虛擬檔案系統 | 純函式、`memfs-extra` |
| **檔案系統 (fs) 操作** | 記憶體虛擬檔案系統 (In-Memory FS) | 專案內臨時目錄 (`test/temp/`) + 清理 | `memfs-extra`, `jest.mock('fs')` |
| **依賴模組 (Modules)** | 依賴注入 (Dependency Injection, DI) | 模組級攔截或方法監控 (Spy) | `jest.mock()`, `jest.spyOn()` |
| **日期時間 (Date/Time)** | 假計時器 (Fake Timers / 凍結時鐘) | 監控時間方法 (`spyOn(Date, 'now')`) | `jest.useFakeTimers()`, `setSystemTime()` |
| **環境變數 (process.env)** | 測試生命週期備份與還原 | 局部作用域重置 | `beforeEach` 拷貝 + `afterAll` 還原 |
| **網路請求 (Network)** | 一律攔截 (Mock API / 虛擬回應) | 無（嚴禁發送真實外部請求） | `fetchMock`, `msw`, `nock` |

### 決策流程圖

```
需要與系統資源或外部模組互動？
    │
    ├─ 檔案系統操作 (fs)
    │   ├─ 僅驗證產出內容？ ──[是]─→ 優先使用純字串/記憶體 API (如 stringify)，不落盤亦不 mock
    │   └─ 需驗證真實/模組內部 I/O？
    │       ├─ 能主動攔截？ ──[是]─→ 使用 memfs-extra + jest.mock('fs')
    │       └─ 特殊底層/無法 mock？ ──[否]─→ 使用專案臨時目錄 (test/temp/<id>) + 測試後清理
    │
    ├─ 依賴模組 (Modules)
    │   ├─ 支援函式參數注入？ ──[是]─→ 依賴注入 (DI)，傳入 Mock 實例
    │   ├─ 僅需覆寫單一方法？ ──[是]─→ jest.spyOn(obj, 'method').mockReturnValue(...)
    │   └─ 內部緊密耦合？ ──[是]─→ jest.mock('module-name', () => ({ ... }))
    │
    ├─ 日期時間 (Date/Time) ──→ jest.useFakeTimers() + jest.setSystemTime(...)
    │
    ├─ 環境變數 (process.env) ──→ beforeEach 備份 + afterAll 還原 + jest.resetModules()
    │
    └─ 網路請求 (Network) ──→ 一律使用 fetchMock / msw / nock 阻斷連線
```

---

## 檔案系統 Mock：memfs-extra 指南

直接操作磁碟會產生並行衝突、權限異常與檔案遺留問題。測試 Node.js 檔案操作時，推薦使用 `memfs-extra` 在記憶體中建立虛擬檔案系統。

### 1. 主動接管原則 / Active Interception Principle

**Mock 必須主動接管原生模組，而非僅建立孤立的 mock 實例。**

測試目標或第三方套件內部常直接呼叫 `import fs from 'fs'`。透過 `jest.mock('fs')` 主動接管，所有深層呼叫都會自動被虛擬檔案系統攔截，無需侵入修改原始碼。

### 2. 行內模擬 (Inline Mock) — 推薦模式

適用於絕大多數測試檔案。具備最高靈活性，可針對單一測試檔自定義虛擬環境，且能同時模擬 `fs/promises`。

```typescript
// test/file-service.spec.ts
import fs from 'fs';
import { getVolumeFromFs } from 'memfs-extra';
import { __ROOT_TEST_TEMP } from '../__root';

// 1. 於檔案頂部主動接管 fs 與 fs/promises
jest.mock('fs', () => require('memfs-extra/fs-extra'));
jest.mock('fs/promises', () => require('memfs-extra/fs-extra').promises);

describe('FileService (Inline Mock)', () => {
    // 2. 取得 Volume 物件並驗證 mock 成功
    const vol = getVolumeFromFs(fs);
    expect(vol).toBeDefined();

    beforeEach(() => {
        // 3. 測試前重置虛擬檔案系統狀態
        vol.reset();
    });

    it('應在記憶體中建立並讀取檔案', () => {
        const filePath = `${__ROOT_TEST_TEMP}/data.json`;
        const testData = { success: true, count: 42 };

        fs.writeFileSync(filePath, JSON.stringify(testData));
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        expect(content).toEqual(testData);
    });

    it('應支援 async/await 子模組操作', async () => {
        const filePath = `${__ROOT_TEST_TEMP}/async.txt`;
        await fs.promises.writeFile(filePath, 'hello memfs');
        const text = await fs.promises.readFile(filePath, 'utf-8');

        expect(text).toBe('hello memfs');
    });
});
```

### 3. 共享模擬 (Share Mock)

適用於整個專案**所有測試檔**皆預設使用虛擬檔案系統的專案。

- **步驟 1**：建立 `test/__mocks__/fs.js`（⚠️ 注意：Jest 機制要求必須為 `.js` 副檔名）：
  ```javascript
  // test/__mocks__/fs.js
  module.exports = require('memfs-extra/fs-extra');
  ```
- **步驟 2**：在測試檔案中直接啟用：
  ```typescript
  import fs from 'fs';
  jest.mock('fs');
  ```

### 4. Volume API 虛擬檔案配置 (推薦作法)

避免使用一連串的 `mkdirSync` 與 `writeFileSync` 準備測試環境。使用 Volume API 的 `fromJSON` 可在一行內宣告完整的目錄樹與檔案內容：

```typescript
import fs from 'fs';
import { getVolumeFromFs } from 'memfs-extra';
import { __ROOT_TEST_TEMP } from '../__root';

jest.mock('fs', () => require('memfs-extra/fs-extra'));

describe('設定虛擬檔案結構', () => {
    const vol = getVolumeFromFs(fs);

    beforeEach(() => {
        vol.reset();
        // 批次注入虛擬檔案與目錄結構
        vol.fromJSON({
            [`${__ROOT_TEST_TEMP}/config.json`]: JSON.stringify({ env: 'test' }),
            [`${__ROOT_TEST_TEMP}/data/users.json`]: JSON.stringify([{ id: 1, name: 'Alice' }]),
            [`${__ROOT_TEST_TEMP}/logs/app.log`]: 'INIT_OK\n',
        });
    });

    it('業務邏輯應能正確讀取預設虛擬檔案', () => {
        expect(fs.existsSync(`${__ROOT_TEST_TEMP}/config.json`)).toBe(true);
        const log = fs.readFileSync(`${__ROOT_TEST_TEMP}/logs/app.log`, 'utf-8');
        expect(log).toContain('INIT_OK');
    });
});
```

#### 常用 Volume API 速查表

| 方法 (Method) | 說明 (Description) |
| :--- | :--- |
| `vol.fromJSON(tree)` | 傳入 `{ '/path/file': 'content' }` 物件批次建立檔案與父層目錄 |
| `vol.reset()` | 清空記憶體中的所有檔案與目錄結構，回到初始空狀態 |
| `vol.toJSON()` | 將當前虛擬檔案系統所有內容序列化為 JSON 物件，便於除錯或 Snapshot |
| `vol.mkdirSync(path, opts)` | 建立虛擬目錄 |
| `vol.writeFileSync(path, data)` | 寫入虛擬檔案 |
| `vol.rmSync(path, opts)` | 刪除虛擬目錄或檔案 |

### 5. 混合真實檔案系統 (Hybrid Mock)

當測試需要讀取真實磁碟上的大型 Fixture，但將寫入操作隔離在記憶體時：

```typescript
import * as realFs from 'fs';

jest.mock('fs', () => {
    const memfs = require('memfs-extra/fs-extra');
    return {
        ...memfs,
        // 保留真實的特定讀取行為或設定檔路徑檢查
        realpathSync: realFs.realpathSync,
    };
});
```

---

## Mock 安全防護與路徑白名單 / Security & Path Constraints

### 1. 虛擬路徑邊界約束原則 / Boundary Constraint

> ⚠️ **重要原則：即使在 Mock 虛擬檔案系統中，路徑仍必須嚴格限制在測試臨時目錄內。**

#### 為什麼 Mock 環境仍需約束路徑？
1. **防止 Mock 穿透與洩漏**：若第三方套件使用原生 C++ 綁定或繞過標準 `fs`，非白名單路徑可能直接作用於真實主機。
2. **避免覆蓋系統關鍵目錄**：硬編碼 `/etc` 或 `C:\Windows` 一旦 Mock 未生效，將造成災難性後果。
3. **消除跨平台路徑解析歧義**：Windows 磁碟代號（`C:`、`D:`）與 POSIX 斜線在虛擬系統與真實系統間容易混淆。

### 2. 路徑白名單與防護流程

```
請求操作路徑 (targetPath)
    │
    ├─ 1. 是否包含危險系統關鍵字？ (Windows, System32, /etc/, /usr/bin/) ──[是]─→ ❌ REJECT (拋出安全性例外)
    ├─ 2. 是否為裸相對路徑或離開專案？ (../../..) ──[是]─→ ❌ REJECT
    ├─ 3. 是否落在白名單範圍內？
    │       ├─ test/temp/ (測試臨時目錄) ──[是]─→ ✅ ALLOWED (可讀寫/可刪除)
    │       ├─ test/fixtures/ (測試資料目錄) ──[是]─→ ✅ READ-ONLY (僅允許讀取)
    │       └─ 專案根目錄 (Project Root) ──[是]─→ ✅ READ-ONLY (僅允許讀取)
    └─ 其他路徑 ──→ ❌ REJECT
```

### 3. 中央化路徑常數模組 (`__root.ts`)

全面杜絕 `../../..` 相對路徑地獄，在專案測試基礎層建立單一事實來源 (SSoT)：

```typescript
// test/__root.ts
import { join } from 'path';

/** 專案根目錄 / Project Root */
export const __ROOT = join(__dirname, '..');

/** 測試根目錄 / Test Root */
export const __TEST_ROOT = join(__ROOT, 'test');

/** 測試資料目錄（唯讀）/ Test Fixtures (Read-Only) */
export const __TEST_FIXTURES = join(__TEST_ROOT, 'fixtures');

/** 測試臨時目錄（唯一可寫入區域）/ Test Temp (Writable) */
export const __ROOT_TEST_TEMP = join(__TEST_ROOT, 'temp');

/** 建置產出目錄 / Build Output */
export const __DIST = join(__ROOT, 'dist');
```

在測試中統一引用：

```typescript
import { join } from 'path';
import { __ROOT_TEST_TEMP, __TEST_FIXTURES } from '../__root';

// ✅ 正確：基於專用常數組裝臨時目錄子路徑
const safeTempFile = join(__ROOT_TEST_TEMP, 'session-123', 'output.json');

// ❌ 錯誤：裸相對路徑（極易受當前工作目錄影響而污染根目錄）
const dangerousPath = './output.json';

// ❌ 錯誤：硬編碼系統根目錄
const rootPath = '/temp/output.json';
```

### 4. 實用路徑控管工具組合

在建立進階安全測試環境或封裝安全測試容器 (Safe Mock Runner) 時，推薦搭配下列工具：

```typescript
import { normalize } from 'upath2';
import { pathInsideDirectory } from 'path-in-dir';
import { pathIsSame } from 'path-is-same';
import { isMatch } from 'micromatch';
import { __ROOT, __ROOT_TEST_TEMP, __TEST_FIXTURES } from '../__root';

/**
 * 驗證路徑是否符合安全白名單
 * @param targetPath 目標路徑
 * @param writeAccess 是否需要寫入權限
 */
export function isSafePath(targetPath: string, writeAccess = false): boolean {
    const normalized = normalize(targetPath);
    const tempDir = normalize(__ROOT_TEST_TEMP);
    const fixturesDir = normalize(__TEST_FIXTURES);
    const rootDir = normalize(__ROOT);

    // 1. 若要求寫入，僅允許落在 test/temp 內
    if (writeAccess) {
        return pathInsideDirectory(normalized, tempDir);
    }

    // 2. 唯讀操作允許 test/temp, test/fixtures 與專案根目錄
    return (
        pathInsideDirectory(normalized, tempDir) ||
        pathInsideDirectory(normalized, fixturesDir) ||
        pathInsideDirectory(normalized, rootDir)
    );
}
```

---

## 模組與函式 Mock / Module & Function Mocking

### 1. 第三方模組級攔截 (`jest.mock`)

當被測程式依賴外部 SDK、第三方模組（如發送簡訊、呼叫雲端服務）時，應在檔案頂部攔截整個模組：

```typescript
// 攔截第三方依賴模組
jest.mock('external-notification-client', () => ({
    NotificationService: jest.fn().mockImplementation(() => ({
        sendPush: jest.fn().mockResolvedValue({ messageId: 'mock-msg-1' }),
        sendSms: jest.fn().mockResolvedValue(true),
    })),
}));

import { NotificationService } from 'external-notification-client';
import { notifyUser } from '../src/notifier';

describe('notifyUser', () => {
    it('應正確呼叫推播服務', async () => {
        await notifyUser({ userId: 101, message: 'Welcome' });

        const instance = (NotificationService as jest.Mock).mock.results[0].value;
        expect(instance.sendPush).toHaveBeenCalledWith(
            expect.objectContaining({ message: 'Welcome' })
        );
    });
});
```

### 2. 方法級監控與還原 (`jest.spyOn`)

適用於**僅需置換單一方法或監控呼叫次數**的情境。測試完畢後必須呼叫 `mockRestore()` 以免污染後續測試：

```typescript
import * as userModel from '../src/models/user';
import { getProfile } from '../src/services/profile';

describe('getProfile', () => {
    let spyFindUser: jest.SpyInstance;

    beforeEach(() => {
        // 監控單一方法並自定義回傳
        spyFindUser = jest.spyOn(userModel, 'findUserById').mockResolvedValue({
            id: 99,
            name: 'Bob',
            roles: ['user'],
        });
    });

    afterEach(() => {
        // 務必還原原始方法！
        spyFindUser.mockRestore();
    });

    it('應正確使用 Mock 結果組裝資料', async () => {
        const profile = await getProfile(99);

        expect(spyFindUser).toHaveBeenCalledTimes(1);
        expect(spyFindUser).toHaveBeenCalledWith(99);
        expect(profile.displayName).toBe('Bob');
    });
});
```

### 3. Mock 與 Spy 斷言語法規範

斷言呼叫狀態時，應直接使用語義明確的専用 Matcher，避免手動計算長度或屬性：

```typescript
// ❌ 不良範例：語義模糊且失敗訊息晦澀
expect(mockFn.mock.calls.length).toBe(2);
expect(mockFn.mock.calls[0][0]).toBe('id-123');

// ✅ 良好範例：使用專用斷言
expect(mockFn).toHaveBeenCalledTimes(2);
expect(mockFn).toHaveBeenCalledWith('id-123');

// ✅ 搭配 Asymmetric Matcher 比對局部參數（避免寫死不重要的細節）
expect(mockFn).toHaveBeenCalledWith(
    'id-123',
    expect.objectContaining({
        status: 'active',
        updatedAt: expect.any(Date),
    })
);
```

### 4. 依賴注入 (DI) vs 框架 Mock 決策準則

- **自研業務邏輯**：優先透過函式參數或類別建構子注入依賴（如 `function processOrder(repo: IOrderRepo)`），在測試中直接傳入純物件 Mock，最乾淨且解耦。
- **外部第三方套件 / 既有遺留代碼**：若無法修改原始碼簽章，才使用 `jest.mock()` 或 `jest.spyOn()` 進行框架層級攔截。

---

## 系統依賴 Mock: Timers, Environment & Network

### 1. 日期與時間 (Fake Timers)

依賴真實時間會導致測試偶發失敗（Flaky Tests）。必須使用 Fake Timers 凍結系統時鐘：

```typescript
describe('Token 驗證過期測試', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        // 鎖定系統基線時間
        jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    });

    afterAll(() => {
        // 還原真實時鐘
        jest.useRealTimers();
    });

    it('快進時間應正確觸發過期', () => {
        const token = generateExpiringToken({ expiresIn: '1h' });
        expect(isTokenValid(token)).toBe(true);

        // 快進 61 分鐘
        jest.advanceTimersByTime(61 * 60 * 1000);

        expect(isTokenValid(token)).toBe(false);
    });
});
```

### 2. 環境變數隔離 (`process.env`)

全域 `process.env` 的修改會洩漏至後續所有測試檔案。標準隔離寫法：

```typescript
describe('載入環境變數設定', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // 重置模組快取，避免被前次 require 快取影響
        jest.resetModules();
        // 淺拷貝備份獨立環境
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        // 套件執行完畢後完整還原原始環境
        process.env = originalEnv;
    });

    it('應在指定環境啟用除錯日誌', () => {
        process.env.APP_ENV = 'development';
        process.env.DEBUG = 'true';

        const { getAppConfig } = require('../src/config');
        expect(getAppConfig().enableDebug).toBe(true);
    });
});
```

### 3. 網路請求攔截 (Network Requests)

**測試執行期間嚴禁發出真實 HTTP 請求。**

- **小型專案 / 單純 fetch 呼叫**：使用 `jest-fetch-mock`：
  ```typescript
  import { enableFetchMocks } from 'jest-fetch-mock';
  enableFetchMocks();

  beforeEach(() => {
      fetchMock.resetMocks();
  });

  it('應解析成功回應', async () => {
      fetchMock.mockResponseOnce(JSON.stringify({ userId: 1, role: 'admin' }));
      const user = await fetchUserProfile(1);
      expect(user.role).toBe('admin');
  });
  ```
- **完整服務 / API 協同**：推薦使用 [MSW (Mock Service Worker)](https://mswjs.io/) 宣告式模擬網路階層。

---

## 跨測試框架 Mock API 對照表

不同測試框架具備類似的 Mock 概念，依照環境使用對應 API：

| 模擬能力 (Capability) | Jest | Vitest | Bun (`bun:test`) | Node.js 原生測試 (`node:test`) |
| :--- | :--- | :--- | :--- | :--- |
| **宣告 Mock 函式** | `jest.fn()` | `vi.fn()` | `mock()` | `t.mock.fn()` |
| **模組全域攔截** | `jest.mock(id, factory)` | `vi.mock(id, factory)` | `mock.module(id, factory)` | 需依賴注入或自訂 loader |
| **方法監控 (Spy)** | `jest.spyOn(target, method)` | `vi.spyOn(target, method)` | `spyOn(target, method)` | `t.mock.method(target, method)` |
| **呼叫次數驗證** | `expect(f).toHaveBeenCalledTimes(n)` | `expect(f).toHaveBeenCalledTimes(n)` | `expect(f).toHaveBeenCalledTimes(n)` | `t.assert.strictEqual(f.mock.callCount(), n)` |
| **呼叫參數驗證** | `expect(f).toHaveBeenCalledWith(...)` | `expect(f).toHaveBeenCalledWith(...)` | `expect(f).toHaveBeenCalledWith(...)` | `t.assert.deepStrictEqual(f.mock.calls[0].arguments, [...])` |
| **假計時器 (Timers)** | `jest.useFakeTimers()` | `vi.useFakeTimers()` | `setSystemTime(date)` | `t.mock.timers.enable()` |
| **清理與重置** | `jest.clearAllMocks()` / `resetAllMocks()` | `vi.clearAllMocks()` / `resetAllMocks()` | `mock.restore()` | `t.mock.reset()` |

> 提示：在 Node.js 原生測試中遷移或撰寫測試時，詳細語法可配合參閱 [test-convert-to-node-test](../test-convert-to-node-test/SKILL.md)。

---

## 雜訊避免與反模式速查 / Anti-Patterns & Noise Avoidance

| 反模式 (Anti-Pattern) | 問題 (Issue) | 最佳實踐 (Best Practice) |
| :--- | :--- | :--- |
| **盲目 Mock fs 只為比對字串** | 建立、寫入、讀回、刪除，產生大量樣板代碼 | 被測類別拆分 `stringify()` 純字串回傳方法，直接斷言回傳值 |
| **在 Mock 內實作複雜業務邏輯** | Mock 實作出現 Bug，使測試本身需要被測試 | Mock 僅回傳固定結構 (Stub)，不做動態運算 |
| **測試後遺漏清理 (Leaked State)** | `process.env` 或全域變數殘留，導致後續測試隨機爆錯 | 一律在 `afterEach` / `afterAll` 執行 `mockRestore()` 或環境還原 |
| **斷言無關緊要的內部呼叫次數** | 被測代碼重構內部實作時破壞測試（過度脆弱） | 僅對邊界行為（如真正發送郵件、寫入關鍵日誌）斷言次數 |
| **裸相對路徑傳入 Mock fs** | Windows/POSIX 混亂，甚至穿透記憶體污染本機目錄 | 永遠使用 `path.join(__ROOT_TEST_TEMP, ...)` 鎖定範圍 |

---

## 相關規範與資源

- [test-file-best-practices](../test-file-best-practices/SKILL.md) — 測試檔案結構、命名、分割與 Snapshot 規範
- [test-convert-to-node-test](../test-convert-to-node-test/SKILL.md) — Node.js 原生測試架構與 `t.mock` 轉換指南
- [memfs-extra 官方套件文件](https://www.npmjs.com/package/memfs-extra)
- [Jest Mock Functions 官方文檔](https://jestjs.io/docs/mock-functions)
- [Jest Timer Mocks 官方文檔](https://jestjs.io/docs/timer-mocks)
