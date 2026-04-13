---
name: test-js-mock
description: 使用 Jest 模擬 Node.js 內建模組（如 fs、path 等）的技能。當測試需要隔離檔案系統操作或進行安全的測試時使用此技能。啟動條件：(1) Mock fs 模組 / Mock fs module (2) Jest Mock 檔案系統 / Jest Mock file system (3) 模擬 Node.js 內建模組 / Mock Node.js built-in modules (4) jest.mock 使用教學 / jest.mock usage guide (5) 使用 memfs-extra 模擬 fs / Use memfs-extra to mock fs (6) 記憶體檔案系統測試 / In-memory file system testing (7) Mock fs 測試 / Mock fs test (8) 隔離檔案系統測試 / Isolated file system testing (9) 安全的檔案系統操作 / Safe file system operations (10) Jest 虛擬檔案 / Jest virtual file system
compatibility: opencode
metadata:
  audience: agents
  domain: testing
---

## 介紹 / Introduction

本技能提供使用 Jest 模擬 Node.js 內建模組的完整指南，特別是針對 `fs` 檔案系統模組的 Mock 技術。這對於在測試環境中隔離檔案系統操作、避免污染真實檔案系統非常重要。

This skill provides a complete guide to mocking Node.js built-in modules using Jest, especially for the `fs` file system module. This is crucial for isolating file system operations in test environments and avoiding pollution of the real file system.

## 核心概念 / Core Concepts

### 為什麼需要 Mock fs？

在測試中直接操作真實檔案系統會導致以下問題：

- **污染開發環境**：測試產生的檔案可能殘留在專案中
- **測試不穩定**：不同環境下的路徑權限問題
- **並行測試衝突**：多個測試同時寫入同一檔案
- **清理困難**：測試中斷時無法自動清理

Using real file system in tests can cause:
- **Environment pollution**: Test files may remain in the project
- **Unstable tests**: Path permission issues in different environments
- **Parallel test conflicts**: Multiple tests writing to the same file
- **Cleanup issues**: Files remain when tests are interrupted

---

## 方法一：Share Mock（共享模擬）

### 說明 / Description

透過在 `__mocks__` 資料夾中建立模擬檔案來實現。這是一種全域性的模擬方式，適合於整個專案多個測試檔案都需要模擬 `fs` 的情況。

This method is implemented by creating a mock file in the `__mocks__` folder. It is a global mocking approach suitable for scenarios where multiple test files across the project need to mock `fs`.

### 實作步驟 / Implementation Steps

**步驟 1：建立模擬檔案**

建立 `test/__mocks__/fs.js`（注意：必須是 `.js` 副檔名才有效）：

```javascript
// test/__mocks__/fs.js
module.exports = require('memfs-extra/fs-extra');
```

**步驟 2：在測試檔案中啟用模擬**

```typescript
// test/some-feature.spec.ts
import fs from 'fs';

// 啟動模擬（放在 import 之後）
jest.mock('fs');

describe('Some Feature', () => {
    it('should read file from memory', () => {
        // 現在 fs 是記憶體中的虛擬檔案系統
        expect(fs).toHaveProperty('readJSON');
    });
});
```

### 優點 / Pros

- 設定一次即可在多處使用，程式碼簡潔
- Easy to reuse across multiple tests once configured

### 適用場景 / Use Cases

- 當你的專案幾乎所有測試都需要使用虛擬檔案系統時
- When almost all tests in your project require a virtual file system

---

## 方法二：Inline Mock（行內模擬）

### 說明 / Description

此方法在個別測試檔案中直接定義模擬行為。它提供了更高的靈活性，允許你針對特定測試檔案自定義模擬內容。

This method defines the mock behavior directly within individual test files. It provides higher flexibility, allowing you to customize the mock for specific test files.

### 實作步驟 / Implementation Steps

**直接在使用測試檔案的頂部使用 `jest.mock` 並提供工廠函式：**

```typescript
// test/some-feature.spec.ts
import fs from 'fs';

// Mock fs 模組
jest.mock('fs', () => {
    return require('memfs-extra/fs-extra');
});

// Mock fs/promises 子模組
jest.mock('fs/promises', () => {
    return require('memfs-extra/fs-extra').promises;
});

describe('Some Feature', () => {
    it('should read file from memory', () => {
        expect(fs).toHaveProperty('readJSON');
    });
});
```

### 優點 / Pros

- 靈活性高，不會影響到其他不需要模擬 `fs` 的測試檔案
- 可以同時模擬子模組（如 `fs/promises`）

### 適用場景 / Use Cases

- 當只有少數測試檔案需要模擬 `fs`
- 當不同測試需要不同的模擬行為時

---

## 完整範例 / Complete Example

### 範例 1：Share Mock 方式

```typescript
// test/__mocks__/fs.js
module.exports = require('memfs-extra/fs-extra');
```

```typescript
// test/file-service.spec.ts
// @noUnusedParameters:false
import fs from 'fs';

jest.mock('fs');

describe('FileService', () => {
    it('should read JSON file', () => {
        const testData = { name: 'test' };

        // 寫入虛擬檔案
        fs.writeFileSync('/test/data.json', JSON.stringify(testData));

        // 讀取虛擬檔案
        const result = fs.readJSONSync('/test/data.json');

        expect(result).toEqual(testData);
    });
});
```

### 範例 2：Inline Mock 方式

```typescript
// test/file-service-inline.spec.ts
// @noUnusedParameters:false
import fs from 'fs';

// Mock fs 和 fs/promises
jest.mock('fs', () => require('memfs-extra/fs-extra'));
jest.mock('fs/promises', () => require('memfs-extra/fs-extra').promises);

describe('FileService (Inline)', () => {
    it('should write and read JSON', () => {
        const testData = { name: 'test', value: 123 };

        fs.writeJSONSync('/test/data.json', testData);
        const result = fs.readJSONSync('/test/data.json');

        expect(result).toEqual(testData);
    });

    it('should handle async operations', async () => {
        await fs.promises.writeFile('/test/async.txt', 'hello');
        const content = await fs.promises.readFile('/test/async.txt', 'utf-8');

        expect(content).toBe('hello');
    });
});
```

---

## 比較 / Comparison

| 特性 / Feature | Share Mock | Inline Mock |
| :--- | :--- | :--- |
| **定義位置 / Location** | `__mocks__/fs.js` | 測試檔案內 / Inside test file |
| **影響範圍 / Scope** | 全域 / 多個檔案 | 單一檔案 |
| **配置複雜度 / Complexity** | 低（一次性配置） | 中（每個檔案需寫一次） |
| **靈活性 / Flexibility** | 低 | 高 |
| **子模組支援 / Sub-module support** | 需額外配置 | 可分別 mock |

---

## 進階技巧 / Advanced Techniques

### 同時 Mock 多個模組

```typescript
jest.mock('fs', () => require('memfs-extra/fs-extra'));
jest.mock('fs/promises', () => require('memfs-extra/fs-extra').promises);
jest.mock('path', () => require('path'));
```

### 自定義 Mock 行為

```typescript
jest.mock('fs', () => {
    const memfs = require('memfs-extra/fs-extra');

    // 自定義行為
    const customFs = {
        ...memfs,
        // 覆寫特定方法
        readFileSync: jest.fn((path) => {
            if (path.includes('protected')) {
                throw new Error('Access denied');
            }
            return memfs.readFileSync(path);
        }),
    };

    return customFs;
});
```

### 與真實 fs 混合使用

當需要同時使用虛擬檔案系統和真實檔案時：

```typescript
import * as fs from 'fs';
import * as realFs from 'fs';

jest.mock('fs', () => {
    const memfs = require('memfs-extra/fs-extra');

    return {
        ...memfs,
        // 保持真實 fs 的某些方法
        existsSync: realFs.existsSync,
    };
});
```

---

## 安全性考量 / Safety Considerations

### 隔離原則

- 確保虛擬檔案操作不會影響真實檔案系統
- 測試完成後應清理虛擬檔案

### 臨時目錄隔離

```typescript
describe('Safe File Operations', () => {
    const testDir = '/test/temp';

    beforeEach(() => {
        // 每個測試前清空虛擬目錄
        if (fs.existsSync(testDir)) {
            fs.rmSync(testDir, { recursive: true });
        }
    });

    it('should isolate test operations', () => {
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(`${testDir}/test.txt`, 'content');

        expect(fs.existsSync(`${testDir}/test.txt`)).toBe(true);
    });
});
```

---

## 常見問題 / FAQ

### Q: 為什麼需要使用 `.js` 副檔名？

Jest 的自動 mock 機制需要 `.js` 副檔名才能正確識別模擬模組。

### Q: 如何 Mock 其他 Node.js 模組？

使用相同的方式：

```typescript
jest.mock('path', () => require('path'));
jest.mock('os', () => require('os'));
```

### Q: 如何確保 Mock 在所有測試前生效？

將 `jest.mock('fs')` 放在測試檔案的頂部，確保在任何測試執行前就已載入。

---

## 相關資源 / Related Resources

- [Jest Manual Mocks](https://jestjs.io/docs/manual-mocks)
- [memfs-extra](https://www.npmjs.com/package/memfs-extra)
- [test-file-best-practices](../rules/test-file-best-practices.md) - 測試檔案最佳實踐
