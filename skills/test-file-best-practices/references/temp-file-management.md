---
tags:
  - documentation/references
  - testing
  - testing/temp-files
  - testing/fs-safety
---

# 臨時檔案管理：Mock 安全規則與清理策略 / Temporary File Management — Mock Safety Rules & Cleanup Strategy

本文件收錄 `SKILL.md` 中「臨時檔案管理原則」的詳細實作內容，包含 Mock 環境安全規則、路徑控管模組用法、共享路徑定義，以及完整的清理策略。主文件僅保留原則摘要，詳細範例統一集中於此，避免主文件過於臃腫。

---

## Mock 環境安全規則 / Mock Environment Safety Rules

**對於有可能涉及檔案寫入/刪除的模組或測試，應使用 mock 環境防止 fs 操作臨時目錄 (test/temp) 以外任何路徑。**

### 核心原則

1. **白名單路徑** - 僅允許操作以下路徑：
   - `test/temp/` - 測試臨時目錄（可讀寫）
   - `test/fixtures/` - 測試資料目錄（唯讀）
   - 專案根目錄（可讀取）

2. **讀取權限** - 對臨時目錄以外的路徑，僅允許讀取操作，不得進行寫入、更改、刪除、建立等操作

3. **主動接管 fs 方法** - Mock 應採用能主動接管 fs 方法的方式（如 `jest.mock('fs')`），而非直接操作 mock fs 物件。因為 fs 操作可能存在於原始邏輯或第三方模組中，需要讓這些操作自動被 mock 攔截

4. **Mock 隔離** - 使用 memfs-extra 在記憶體中模擬檔案系統操作，避免影響真實檔案系統。詳細使用方式請參考 [skills/test-js-mock](../../test-js-mock/SKILL.md)

### 安全檢查流程

```
1. 相對路徑檢查
   └── 如果是相對路徑且未允許 → ❌ REJECTED

2. 白名單檢查
   ├── test/temp/        → ✅ ALLOWED（可讀寫）
   ├── test/fixtures/    → ✅ ALLOWED（唯讀）
   └── 專案根目錄         → ✅ ALLOWED（可讀取）

3. 危險關鍵詞檢查
   ├── Windows: \Windows\, \System32\, \Program Files\  → ❌ REJECTED
   ├── Unix: /etc/, /usr/bin/, /sys/, /boot/           → ❌ REJECTED
   └── 其他系統目錄                                      → ❌ REJECTED

4. 範圍檢查
   └── 是否在專案根目錄內  → ❌ REJECTED（若在外）
```

### 使用範例

```typescript
// ✅ 正確：使用 jest.mock() 主動接管 fs 模組
// 讓原始邏輯或第三方模組中的 fs 操作自動被 mock 攔截
jest.mock('fs', () => {
    const mockFs = {
        readFileSync: jest.fn(),
        writeFileSync: jest.fn(),
        unlinkSync: jest.fn(),
        mkdirSync: jest.fn(),
        existsSync: jest.fn(),
    };
    return mockFs;
});

describe('Config Tests', () => {
    const fs = require('fs');

    beforeEach(() => {
        // 重置所有 mock
        jest.clearAllMocks();
    });

    it('should mock config file', () => {
        // 設定 mock 行為
        fs.readFileSync.mockReturnValue(JSON.stringify({
            show_banner: true,
            agents: { monarch: { poll_interval: 5000 } }
        }));

        // 執行原始邏輯（會自動使用 mock 的 fs）
        const config = loadConfig();

        // 驗證
        expect(fs.readFileSync).toHaveBeenCalled();
        expect(config.show_banner).toBe(true);
    });
});

// ✅ 正確：使用 MockEnv 進行安全的檔案操作
import { MockEnv } from "./test/lib/mock-env";

describe('File Processing', () => {
    const env = new MockEnv();

    beforeEach(() => env.reset());
    afterEach(() => env.cleanup());

    it('should process files safely', () => {
        // 使用安全的 fs 包裝
        env.safeFs.writeFileSync(`${__TEST_TEMP}/output.txt`, 'result');

        // 驗證檔案存在
        expect(env.safeFs.existsSync(`${__TEST_TEMP}/output.txt`)).toBe(true);
    });
});

// ❌ 錯誤：直接操作臨時目錄外的路徑
it('should NOT modify files outside temp', () => {
    const configPath = path.join(process.cwd(), 'config', 'settings.json');
    fs.writeFileSync(configPath, '{}');  // ❌ 禁止：寫入
    fs.unlinkSync(configPath);            // ❌ 禁止：刪除
    fs.mkdirSync(path.join(process.cwd(), 'some-new-dir'));  // ❌ 禁止：新增
});

// ✅ 正確：僅讀取臨時目錄外的路徑
it('should read files outside temp', () => {
    const configPath = path.join(process.cwd(), 'src', 'config.json');
    const configData = fs.readFileSync(configPath, 'utf-8');  // ✅ 允許：僅讀取
});
```

### 路徑控管模組 / Path Control Modules

**可使用 upath2、path-is-same、path-in-dir、micromatch 或其他等模組搭配組合控管路徑。**

#### 推薦模組

| 模組 | 用途 | 範例 |
|------|------|------|
| `upath2` | 跨平台路徑處理（統一正斜線 `/`） | `normalize("D:\\path\\to\\file")` → `"D:/path/to/file"` |
| `path-in-dir` | 檢查路徑是否在指定目錄內 | `pathInsideDirectory(path, rootDir)` |
| `path-is-same` | 比較路徑是否相同（解析符號連結） | `pathIsSame(path1, path2)` |
| `micromatch` | Glob pattern 匹配（用於過濾路徑） | `isMatch("**/*.ts", pattern)` |

#### 使用範例

```typescript
import { normalize } from "upath2";
import { pathInsideDirectory } from "path-in-dir";
import { pathIsSame } from "path-is-same";
import { isMatch } from "micromatch";

// 跨平台路徑處理
const normalizedPath = normalize("D:\\Users\\project\\src\\config.json");
// → "D:/Users/project/src/config.json"

// 檢查路徑是否在白名單目錄內
const isInTemp = pathInsideDirectory(
    normalizedPath,
    normalize(path.join(process.cwd(), 'test', 'temp'))
);

// 比較路徑是否相同
const isSame = pathIsSame(
    normalize(path1),
    normalize(path2)
);

// 使用 Glob pattern 過濾路徑
const isTsFile = isMatch(normalizedPath, "**/*.ts");
const isTestFile = isMatch(normalizedPath, "**/*.test.ts");
```

#### 安全檢查實作

```typescript
import { normalize } from "upath2";
import { pathInsideDirectory } from "path-in-dir";

/**
 * 檢查路徑是否安全（在白名單目錄內）
 * Check if path is safe (inside whitelist directories)
 *
 * @param targetPath - 目標路徑 / Target path
 * @returns 是否安全 / Whether safe
 */
function isPathSafe(targetPath: string): boolean {
    const normalizedPath = normalize(targetPath);
    const projectRoot = normalize(process.cwd());

    // 白名單目錄
    const whitelistDirs = [
        normalize(path.join(projectRoot, 'test', 'temp')),
        normalize(path.join(projectRoot, 'test', 'fixtures')),
        projectRoot,
    ];

    // 檢查是否在白名單目錄內
    for (const dir of whitelistDirs) {
        if (pathInsideDirectory(normalizedPath, dir)) {
            return true;
        }
    }

    return false;
}
```

### 共享路徑定義檔案 / Shared Path Definitions

**可使用共享的路徑定義檔案來避免使用相對路徑造成的非預期狀況。**

#### 為什麼需要共享路徑定義

使用相對路徑（如 `../`、`../../`）可能導致以下問題：
- 路徑層級混亂，難以維護
- 檔案移動後路徑失效
- 不同環境下路徑不一致
- 難以統一管理專案路徑

#### 建議實作方式

建立中央化的路徑定義檔案（如 `__root.ts`），統一管理專案路徑：

```typescript
/**
 * 專案根路徑定義 / Project Root Path Definitions
 *
 * 使用中央化路徑管理，避免相對路徑 ../ 地獄
 * Centralized path management to avoid relative path ../../.. hell
 */
/// <reference types="node" />

import { join } from "path";

/** 專案根目錄 / Project root directory */
export const __ROOT = join(__dirname);

/** 作業系統判斷 / Operating system detection */
export const isWin = process.platform === "win32";

// 測試路徑架構 / Test Path Structure
// test/
// ├── fixtures/              ← 測試資料夾（唯讀）
// └── temp/                 ← 臨時檔案（可寫，永遠建立子資料夾）
//     ├── fake-bun/
//     └── temp-paths/

/** 測試根目錄 / Test root directory */
export const __TEST_ROOT = join(__ROOT, "test");

/** 測試資料目錄（唯讀）/ Test fixtures directory (read-only) */
export const __TEST_FIXTURES = join(__TEST_ROOT, "fixtures");

/** 測試臨時目錄（可寫）/ Test temp directory (writable) */
export const __TEST_TEMP = join(__TEST_ROOT, "temp");

/** 建置輸出目錄 / Build output directory */
export const __DIST = join(__ROOT, "dist");
```

#### 使用範例

```typescript
// ✅ 正確：使用共享路徑定義
import { __TEST_TEMP, __TEST_FIXTURES } from "../__root";

// 建立臨時檔案路徑
const tempFile = join(__TEST_TEMP, "temp-paths", "output.json");

// 建立 fixtures 檔案路徑
const fixtureFile = join(__TEST_FIXTURES, "mock-data.json");

// ❌ 錯誤：使用相對路徑
const tempFile = join("../../../test/temp/output.json");  // 容易出錯
```

#### 優點

1. **路徑一致性** - 所有路徑都從專案根目錄計算，確保一致性
2. **易於維護** - 路徑定義集中管理，修改時只需更改一處
3. **避免錯誤** - 不需要記憶相對路徑層級，減少錯誤
4. **跨環境相容** - 使用 `join()` 確保跨平台路徑格式正確

### 注意事項

- **預設啟用安全檢查** - memfs-extra 配合 Jest mock 機制，應確保路徑限制在測試臨時目錄內
- **記憶體隔離** - memfs-extra 在記憶體中模擬檔案系統，不會影響真實檔案系統
- **跨平台路徑處理** - 使用 `upath2` 統一處理 Windows/Unix 路徑格式
- **並行測試安全** - 每個測試應確保獨立的路徑隔離，避免狀態洩漏
- **Audit Mode** - 如需保留測試輸出供審閱，可使用 memfs-extra 的 Volume 物件進行操作

---

## 清理策略 / Cleanup Strategy

### 自動清理（推薦）

```typescript
import * as fs from 'fs';
import * as path from 'path';

// 使用 afterEach 自動清理
// ⚠️ 重要：除非必要否則不應主動廣域性清除
// 而是只限定於本次操作的臨時子目錄，防止同時有其他測試正在操作臨時目錄
describe('File Processing', () => {
    const tempDirs: string[] = [];

    // 取得具有唯一性 ID 的臨時目錄
    const getTempDir = (subDir: string) => {
        const timestamp = Date.now();
        const tempDir = path.join(process.cwd(), 'test', 'temp', `${subDir}-${timestamp}`);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        tempDirs.push(tempDir);
        return tempDir;
    };

    afterEach(() => {
        // ✅ 正確：只清理本次測試创建的臨時目錄
        // 防止同時有其他測試正在操作臨時目錄
        tempDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true });
            }
        });
        tempDirs.length = 0;
    });

    it('should process files', () => {
        const tempDir = getTempDir('test-output');
        // ... 測試邏輯
    });
});
```

```typescript
// ❌ 錯誤：廣域性清除會影響其他正在運行的測試
afterEach(() => {
    // 這種方式會刪除整個臨時目錄，可能影響並行測試
    fs.rmSync(path.join(process.cwd(), 'test', 'temp'), { recursive: true });
});
```

### 需要審閱時的保留策略

**如果臨時檔案有需要被審閱，可以暫時不刪除。** 這種情況適用於：

- 需要檢查測試輸出的格式是否正確
- 需要分析錯誤發生時的資料狀態
- 需要人工確認測試結果
- **實作失敗但有參考價值的邏輯意圖** - 例如演算法嘗試、參數組合探索等過程記錄
- **錯誤訊息與堆疊追蹤** - 有助於後續開發者理解問題根源
- **效能分析或診斷報告** - 可幫助優化方向的判斷
- **模擬資料的多種變體** - 記錄不同輸入條件下的輸出結果

```typescript
// ✅ 需要審閱時：不執行自動清理
describe('File Processing (Manual Review)', () => {
    // 取得具有唯一性 ID 的臨時目錄，方便追蹤
    const getTempDir = (subDir: string) => {
        const timestamp = Date.now();
        const tempDir = path.join(process.cwd(), 'test', 'temp', `${subDir}-${timestamp}`);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        return tempDir;
    };

    // 不使用 afterEach 清理，讓臨時檔案保留供人工審閱
    it('should generate output file for review', async () => {
        const outputDir = getTempDir('test-output');
        const outputFile = path.join(outputDir, 'result.json');

        const result = await processData(inputData);
        fs.writeFileSync(outputFile, JSON.stringify(result));

        // 測試通過，但保留檔案供人工審閱
        expect(result).toBeDefined();
    });
});
```

### 審閱時保留的輔助資訊類型

當決定保留臨時檔案供審閱時，建議一併保留以下輔助資訊：

```typescript
// ✅ 建議的審閱檔案結構
test/temp/review/
├── review-session-2024-01-15-10-30-00/     # 以日期時間命名審閱回合
│   ├── algorithm-attempts.md               # 演算法嘗試記錄
│   └── notes.md                            # 開發者備註（記錄問題與解決思路）
```

**備註檔案範例（`notes.md`）：**

```markdown
# 審閱筆記

## 問題描述
- 處理大型檔案時效能低落
- 記憶體使用量異常飆升

## 觀察分析
- 演算法嘗試 A：耗時 3.2s，記憶體峰值 512MB
- 演算法嘗試 B：耗時 1.8s，記憶體峰值 380MB
- 建議採用嘗試 B 的分頁策略

## 參考價值
- 為未來優化提供方向
- 記錄了參數調校的過程
```

---

## 相關資源

- [SKILL.md](../SKILL.md)
- [測試框架 API 重構範例 - 系統依賴謹慎處理原則](./examples.md#系統依賴謹慎處理原則)
- [skills/test-js-mock](../../test-js-mock/SKILL.md)
