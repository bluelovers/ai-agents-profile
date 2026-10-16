---
title: 職責分離與檔名辨識規範 (Separation of Responsibilities)
description: SKILL「規則 2：職責分離」完整內容：入口/編排檔（CLI）保持精瘦、tsx 禁止私有化囤積（子元件可同檔共存但仍須 export 公開）、瀏覽器與檔案系統等環境領域邏輯分離，以及以專案規範或通用可辨識名稱（如 fs 模組命名 -io）進行檔名/路徑層級的職責辨識，附 ❌/✅ 對照範例與檢查表。
tags:
  - documentation/references
  - refactoring
  - TypeScript
  - separation-of-responsibilities
  - file-naming
  - cli
  - tsx
---

# 職責分離與檔名辨識規範 (Separation of Responsibilities)

> 本文自 SKILL **規則 2（職責分離）** 抽離，收納完整內容：必要性說明、四條規則的 ❌/✅ 對照範例（CLI、`.tsx`、環境領域）、檔名與路徑命名慣例對照表，以及檢查表。

---

## 核心概念與必要性 (Core Concept & Why)

**檔案是職責的最小單位，檔名是該職責的第一行文件。** 讀者（與 Agent）判斷「某段邏輯在哪裡」時，第一個線索不是逐檔開啟掃描，而是檔名與路徑。

**為什麼必須強制分離（必要性）：**

1. **可測試性**：入口檔（CLI 介面、頁面元件）若吸收了核心邏輯，測試就必須「啟動整個 CLI」或「渲染整個元件」才能間接覆蓋；抽離後的純邏輯可直接單元測試。
2. **可複用性**：「目前只有一個消費者」不等於「永遠只有一個」。定義與邏輯私藏在入口檔內，第二個消費者出現時只能複製一份（違反 SSoT）或反向依賴入口檔（職責倒置）。
3. **環境安全**：`fs`、`window` 等環境 API 一旦滲入共用邏輯，該邏輯便無法在另一環境執行或測試（打包器、SSR、測試框架皆會出問題）。
4. **可定位性**：檔名即索引。`-io`、`*.browser.ts` 等可辨識後綴，讓「改需求找檔案」的成本從「逐檔開啟」降為「檢視路徑」。

> **預設值：預設「抽離並以可辨識檔名放置」。私有化（不 export、留在入口檔內）需要明確意圖，而非預設行為。**

---

## 規則 R1：入口/編排檔保持精瘦（CLI 為例）

CLI 專案中，CLI 實作檔只該負責「接線」(wiring)：解析參數 → 呼叫驗證 → 委派核心邏輯 → 輸出結果。**凡是非該 CLI 專屬的邏輯或定義——即使目前只有該 CLI 使用——都應抽離至獨立檔案**，包含：

- **參數設定**：選項定義、預設值、位置參數宣告
- **驗證邏輯**：現在或將來需要被驗證、測試的邏輯
- **核心轉換/業務邏輯**：與 `process.argv`、`console`、`fs` 無關的純邏輯

判斷依據不是「有幾個消費者」，而是「這段邏輯的職責是否為 CLI 專屬」。

### ❌ 反模式：所有職責擠在 CLI 實作檔

```typescript
// src/cli.ts — 參數、驗證、核心邏輯、fs 全部擠在入口檔
import { readFileSync, writeFileSync } from 'node:fs';

interface IConvertOptions {
    input: string;
    output: string;
    pretty: boolean;
}

// 參數解析：可獨立測試的邏輯，卻被鎖在入口檔
function parseArgs(argv: string[]): IConvertOptions {
    const input = argv[2];
    const output = argv[3] ?? input.replace(/\.json$/, '.min.json');
    const pretty = argv.includes('--pretty');
    if (!input) throw new Error('usage: convert <input> [--pretty]');
    return { input, output, pretty };
}

// 驗證邏輯：同樣可獨立測試，卻無法脫離 CLI 單獨引用
function validateOptions(options: IConvertOptions): void {
    if (!options.input.endsWith('.json')) throw new Error('input must be .json');
}

// 核心轉換邏輯：非 CLI 專屬（API、批次工具未來也需要），卻與 process.argv 綁在同一檔
function normalizeJson(raw: string, pretty: boolean): string {
    const data = JSON.parse(raw);
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv);
    validateOptions(options);
    const raw = readFileSync(options.input, 'utf-8');
    writeFileSync(options.output, normalizeJson(raw, options.pretty));
}

main();
```

**問題點：**

1. **測試必須啟動 CLI**：想測 `normalizeJson`，得先繞過 `parseArgs` 與 `process.argv`；想測 `parseArgs`，又會連帶載入 `fs`。
2. **核心邏輯被 CLI 綁架**：日後 API 或批次工具需要同一轉換邏輯時，只能複製（違反 SSoT）或 import CLI 入口檔（職責倒置）。
3. **無法辨識**：檔名 `cli.ts` 完全沒有透露內部藏有可複用的核心邏輯。

### ✅ 正確：薄入口 + 職責檔（檔名即可辨識職責）

```text
src/
├── cli.ts            # 薄入口：僅接線（parse → validate → delegate → output）
├── cli-args.ts       # 參數設定與解析（可獨立測試）
├── cli-validate.ts   # 驗證邏輯（可獨立測試）
├── normalize-json.ts # 核心邏輯：純函式，與 CLI 無關，可被 API/批次工具複用
└── io.ts             # fs 讀寫邊界（-io 命名，Node 環境限定）
```

```typescript
// src/cli.ts — ✅ 薄入口：只做接線
import { parseArgs } from './cli-args.js';
import { validateOptions } from './cli-validate.js';
import { normalizeJson } from './normalize-json.js';
import { readTextFile, writeTextFile } from './io.js';

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));
    validateOptions(options);
    const raw = await readTextFile(options.input);
    await writeTextFile(options.output, normalizeJson(raw, options.pretty));
}

main();
```

```typescript
// src/normalize-json.ts — ✅ 純核心邏輯：無 fs、無 process，可直接單元測試與複用
export function normalizeJson(raw: string, pretty: boolean): string {
    const data = JSON.parse(raw) as unknown;
    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
}
```

```typescript
// src/io.ts — ✅ 檔案系統邊界：Node 專屬職責集中在可辨識的 -io 檔案
import { readFile, writeFile } from 'node:fs/promises';

export async function readTextFile(path: string): Promise<string> {
    return readFile(path, 'utf-8');
}

export async function writeTextFile(path: string, content: string): Promise<void> {
    await writeFile(path, content, 'utf-8');
}
```

---

## 規則 R2：`.tsx` 檔案禁止私有化囤積

`.tsx` 檔案的職責是「描述 UI 與組裝」。**在沒有特定意圖的情況下，禁止把定義、邏輯、元件私有化（不 export、囤積在元件檔內）**：

- **可公用的定義**（props 型別、共用常數、領域 Enum）→ 抽離至獨立（非 tsx）檔案並 export
- **非 tsx 邏輯**（純計算、格式化、資料轉換、hooks）→ 抽離至獨立（非 tsx）檔案，使其可在無 React 環境下測試
- **子元件**（純 JSX 的輔助元件）→ **不强制抽離**為獨立檔案——強制拆檔只會造成元件檔案過多，增加雜訊與維護困難；可與主元件同檔共存，但**必須 export 公開**，不得私有化
- 元件檔只保留 JSX 與組裝（wiring）

私有化需要「明確意圖」並在該處留下理由；預設行為是「抽離並 export」（子元件則為「同檔共存 + export 公開」）。

### ❌ 反模式：元件檔私藏定義與邏輯

```tsx
// src/components/UserCard.tsx — 定義、純邏輯、hooks 全部私藏（未 export）
const AVATAR_SIZE = 24;                          // 可被其他元件共用的常數，卻私藏

interface IUserCardProps { user: IUser; }        // 可被容器/測試共用的型別，卻私藏

// 純邏輯：與 JSX 完全無關，卻被鎖在 tsx 檔內
function formatUserName(user: IUser): string {
    return `${user.name}#${user.discriminator}`;
}

// hook：無 JSX，應獨立可測，卻私藏
function useAvatarUrl(user: IUser): string {
    return useMemo(() => buildAvatarUrl(user.id), [user.id]);
}

export function UserCard({ user }: IUserCardProps) {
    const avatarUrl = useAvatarUrl(user);
    return (
        <div className="user-card">
            <img src={avatarUrl} width={AVATAR_SIZE} height={AVATAR_SIZE} alt="" />
            <span>{formatUserName(user)}</span>
        </div>
    );
}
```

**問題點：**

1. `formatUserName`、`useAvatarUrl` 無 JSX 卻無法被獨立單元測試——測試它們必須渲染整個 `UserCard`。
2. `AVATAR_SIZE`、`IUserCardProps` 第二個消費者（容器元件、測試、故事書）出現時，只能複製或穿透 import 元件檔。
3. 檔名 `UserCard.tsx` 完全沒有透露內部藏有可複用的純邏輯與型別。

### ✅ 正確：元件檔只保留 JSX 與組裝，其餘抽離為可辨識檔案

```text
src/
├── components/user-card.tsx  # 元件檔：僅 JSX 與組裝
├── user-card.types.ts        # props 與相關型別（容器/測試可直接引用）
├── format-user-name.ts       # 純邏輯：無 React 依賴，可獨立單元測試
├── use-avatar-url.ts         # hook：無 JSX，可獨立測試
└── constants/
    └── user-card.ts          # 共用常數（AVATAR_SIZE 等）
```

```tsx
// src/components/user-card.tsx — ✅ 只保留 JSX 與組裝
import { formatUserName } from '../format-user-name.js';
import { useAvatarUrl } from '../use-avatar-url.js';
import { AVATAR_SIZE } from '../constants/user-card.js';
import type { IUserCardProps } from '../user-card.types.js';

export function UserCard({ user }: IUserCardProps) {
    const avatarUrl = useAvatarUrl(user);
    return (
        <div className="user-card">
            <img src={avatarUrl} width={AVATAR_SIZE} height={AVATAR_SIZE} alt="" />
            <span>{formatUserName(user)}</span>
        </div>
    );
}
```

```typescript
// src/format-user-name.ts — ✅ 純邏輯獨立成檔，無 React 依賴
export function formatUserName(user: IUser): string {
    return `${user.name}#${user.discriminator}`;
}
```

### 子元件：可同檔共存，但必須 export 公開

若「子元件」（純 JSX 的輔助元件）僅服務於此元件、拆檔只會增加檔案雜訊，**允許與主元件同檔共存**——但共存不等於私有化：**必須 `export` 公開**，讓其他檔案（容器、測試、故事書）可直接引用，且日後第二個消費者出現時無需搬移。

```tsx
// ✅ 子元件與主元件同檔共存，但兩者皆 export 公開
// （useAvatarUrl / AVATAR_SIZE / formatUserName 由前例已抽離的檔案匯入）
import { formatUserName } from '../format-user-name.js';
import { useAvatarUrl } from '../use-avatar-url.js';
import { AVATAR_SIZE } from '../constants/user-card.js';

export interface IUserCardProps { user: IUser; }

export function UserAvatar({ user }: IUserCardProps) {
    const avatarUrl = useAvatarUrl(user);
    return <img src={avatarUrl} width={AVATAR_SIZE} height={AVATAR_SIZE} alt="" />;
}

export function UserCard({ user }: IUserCardProps) {
    return (
        <div className="user-card">
            <UserAvatar user={user} />
            <span>{formatUserName(user)}</span>
        </div>
    );
}
```

```tsx
// ❌ 同檔共存卻未 export（私有化）——第二個消費者只能複製或穿透 import
function UserAvatar({ user }: IUserCardProps) { /* ... */ } // 未 export：禁止
export function UserCard({ user }: IUserCardProps) { /* ... */ }
```

> 💡 **抽離 vs 公開是兩個獨立決策**：抽離（是否拆檔案）由「是否增加雜訊」衡量——子元件通常不拆；公開（是否 export）沒有例外——**一切可複用的定義/邏輯/元件都必須 export**。私有化（不 export）需要明確理由，不能以「只有一個使用者」為由。

---

## 規則 R3：環境領域邏輯分離（Browser / 檔案系統 / Node）

不同**環境領域** (Environment Domain) 的邏輯必須分離：**純邏輯不得直接 import 環境 API**；環境存取應收斂在邊界檔（boundary file）內，由邊界檔呼叫純核心。

- **瀏覽器領域**：`window`、`document`、`localStorage`、DOM 操作
- **檔案系統領域**：`node:fs`、路徑讀寫（應以 `-io` 或 `io/` 目錄辨識）
- **Node/伺服器領域**：`process`、環境變數、伺服器限定 API

### ❌ 反模式：純邏輯直接觸碰環境 API

```typescript
// src/config.ts — 名為「共用」，卻直接依賴 Node fs
import { readFileSync } from 'node:fs';

export function loadConfig(path: string): IAppConfig {
    return validateConfig(JSON.parse(readFileSync(path, 'utf-8')));
}

// 純驗證邏輯：因同檔的 fs import，連帶無法在瀏覽器/測試環境載入
export function validateConfig(data: unknown): IAppConfig {
    /* ... */
}
```

```typescript
// src/theme.ts — 模組頂層直接觸碰 window：import 即炸（SSR / Node 測試皆無法載入）
const saved = localStorage.getItem('theme'); // ReferenceError in Node
export function getSavedTheme(): string | null {
    return saved;
}
```

**問題點：** 純邏輯（`validateConfig`、主題決策）與環境 API 同檔，導致**整個模組跨環境不可載入**——打包器、SSR、測試框架都會失敗；想單測純邏輯也必須先 mock 整個環境。

### ✅ 正確：純核心 + 環境邊界（`-io` / `*.browser.ts`）

```text
src/
├── config.ts               # 純驗證與型別：環境無關，兩端皆可測
├── config-io.ts            # 讀檔邊界（-io）：Node 專屬，呼叫純核心
├── shared/theme.ts         # 純主題決策：環境無關
└── browser/
    └── theme-storage.browser.ts # 瀏覽器邊界：localStorage 存取
```

```typescript
// src/config-io.ts — ✅ 環境邊界：fs 只存在於 -io 檔案
import { readFile } from 'node:fs/promises';
import { validateConfig } from './config.js';

export async function loadConfig(path: string): Promise<IAppConfig> {
    return validateConfig(JSON.parse(await readFile(path, 'utf-8')));
}
```

```typescript
// src/shared/theme.ts — ✅ 純決策邏輯：無環境依賴
export function resolveTheme(saved: string | null, systemPrefersDark: boolean): EnumTheme {
    if (saved === 'dark' || saved === 'light') return saved;
    return systemPrefersDark ? EnumTheme.DARK : EnumTheme.LIGHT;
}

// src/browser/theme-storage.browser.ts — ✅ 瀏覽器邊界：環境 API 收斂於此
export function readSavedTheme(): string | null {
    return localStorage.getItem('theme');
}
```

**依賴方向（唯一允許的方向）：** 邊界檔 → 純核心；純核心**絕不**回頭 import 邊界檔。

---

## 規則 R4：檔名與路徑層級的職責辨識

新檔案命名時，**優先採用專案既有規範**；專案無規範時，採用通用可辨識名稱。目標是「不開檔即可知職責」。

### 命名慣例對照表

| 職責領域 | 通用可辨識命名 | 說明 |
|----------|----------------|------|
| 檔案系統讀寫 | `*-io.ts` / `io/` 目錄 | fs 相關模組一律以 `-io` 辨識 |
| 瀏覽器 DOM/BOM | `*.browser.ts` / `browser/` 目錄 | `window`、`document`、`localStorage` |
| Node runtime 限定 | `*.node.ts` | 非 fs 的 Node 限定 API |
| 伺服器端 | `*.server.ts` | 瀏覽器不可存取的伺服器邏輯 |
| CLI 參數/驗證 | `*-args.ts` / `*-cli.ts` | 參數設定與 CLI 專屬驗證 |
| 型別定義 | `*.types.ts` 或專案慣例 | 對外可引用的定義 |
| 常數 | `*.constants.ts` 或專案慣例 | 共用常數 |
| React hooks | `use-*.ts` | 無 JSX，獨立可測 |
| 純運算/業務邏輯 | 以領域命名，**不加**環境後綴 | 預設應可在無環境下測試 |

### 路徑層級分離

同領域檔案聚集於目錄，是檔名後綴的互補手段（兩者擇一或並用皆可，重點是**同領域一致**）：

```text
src/
├── cli/          # CLI 專屬：入口、參數、CLI 驗證、輸出格式化
├── io/           # 檔案系統邊界（*-io 或統一收在 io/ 目錄）
├── browser/      # 瀏覽器限定（*.browser.ts 或統一收在 browser/ 目錄）
├── shared/       # 環境無關純邏輯（兩端皆可用、可獨立測試）
└── components/   # UI 元件（tsx：僅 JSX 與組裝）
```

### 常見辨識失敗案例

| 檔名 | 問題 | 改名建議 |
|------|------|----------|
| `utils.ts` / `helpers.ts` | 職責完全不可辨識，通常是杂物抽屜 | 按職責拆分並以領域命名（如 `percent.ts`、`config-io.ts`） |
| `fs.ts` | 尚可但不通用，跨專案認知不一致 | `*-io.ts` 或收進 `io/` 目錄 |
| `data.ts` | 不知是型別、轉換還是 I/O | 拆為 `*.types.ts`（定義）與 `*-io.ts`（存取） |
| `common.ts` | 與 `utils.ts` 同病 | 依職責拆分至領域檔 |

---

## 檢查表 (Checklist)

| 檢查點 | 操作 |
|--------|------|
| 入口檔（CLI 實作、`.tsx` 元件）是否包含非入口專屬的定義或邏輯？ | 抽離至獨立職責檔並 export（子元件例外：可同檔共存，但仍須 export） |
| 邏輯/定義是否因「只有一個使用者」而私藏？ | 仍應抽離；消費者數量不是職責邊界 |
| 子元件是否因「同檔共存」而未 export？ | 共存可以、私有化不行——補上 export 公開 |
| 測試是否被迫啟動整個 CLI / 渲染整個元件才能覆蓋某段邏輯？ | 該邏輯與入口耦合，抽離為可獨立測試的單元 |
| 純邏輯是否直接 import `fs` / `window` / `process`？ | 分離為純核心 + 環境邊界檔（`-io` / `*.browser.ts`） |
| 依賴方向是否反了（純核心 import 邊界檔）？ | 反轉為 邊界檔 → 純核心 的單向依賴 |
| 新檔案名稱能否「不開檔即知職責」？ | 改用專案規範名稱，或通用可辨識後綴（`-io` 等） |
| 是否建立了 `utils.ts` / `helpers.ts` / `common.ts`？ | 改以職責/領域命名，拒絕杂物抽屜 |
