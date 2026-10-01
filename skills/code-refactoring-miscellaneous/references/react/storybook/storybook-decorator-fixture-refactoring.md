---
title: Storybook 重構指南 - 公用 Decorator、同源根 Decorator、Fixture 資料抽離與 meta.title 分類
description: 抽離公用 Decorator、以同源根 Decorator 統一載入共用樣式避免「定義了卻沒效果／效果不完整」、展示資料分類抽離至 fixtures，並以多級 meta.title 整理側邊欄分類
tags:
  - documentation/references
  - React
  - Storybook
  - refactoring
  - react/storybook
---

# Storybook 重構指南 (Storybook Refactoring Guide)

本文記錄 Storybook 專案的重構模式，依據實際專案經驗整理。各模式獨立成節，可單獨查閱與套用。

**目前收錄：**

1. 抽離公用 Decorator (Extract Shared Decorators)
2. 同源的根 Decorator (Single Root Decorator)
3. 在根 Decorator 引用公用樣式 (Load Shared Styles in the Root Decorator)
4. 展示資料分類抽離至 fixture 資料夾 (Extract Display Data into Fixtures)
5. 以 `meta.title` 整理分類（多級目錄）(Organize with Multi-level `meta.title`)

---

## 1. 抽離公用 Decorator (Extract Shared Decorators)

### 概念 (Concept)

Decorator 負責為 story 建立**展示環境**（內距、容器寬度、主題、Provider...）。若每個 story 檔案各自內聯這些包裝，就是另一種「複製字面值」——改版時需逐檔修改，且容易漏改造成展示不一致。

將重複的包裝抽離為**共用 Decorator**（定義一次、多處引用），與 [CSS 指南：抽離共用樣式值](../../css/css-refactoring-guide.md) 是同一個 SSoT 原則，只是層級從「樣式值」提升到「元件包裝」。

### 重構前：每個 story 重複包裝

```tsx
// ❌ 內距、容器寬度散落在各個 story：改版需逐檔修改，容易漏改
export const Default = () => (
	<div style={{ padding: 24, maxWidth: 480 }}>
		<UserCard user={userBasic} />
	</div>
);

export const Suspended = () => (
	<div style={{ padding: 24, maxWidth: 480 }}>
		<UserCard user={userSuspended} />
	</div>
);
```

```tsx
// ❌ 同一段 decorators 陣列在多個檔案重複出現
export default {
	decorators: [(Story) => (
		<div style={{ padding: 24 }}>
			<Story />
		</div>
	)],
} satisfies Meta;
```

### 重構後：共用 Decorator 檔案

```tsx
// src/stories/decorators/layoutDecorators.ts
import type { Decorator } from '@storybook/react';

/* 展示用內距：讓元件脫離 iframe 邊緣，預覽更接近實際頁面 (padding to detach from iframe edge) */
export const withPadding: Decorator = (Story) => (
	<div className="story-padding">
		<Story />
	</div>
);

/* 限制展示寬度：模擬元件在版面中的實際可用空間 (constrain width to realistic layout space) */
export const withMaxWidth: Decorator = (Story) => (
	<div className="story-max-w-md">
		<Story />
	</div>
);
```

```tsx
// 重構後：story 檔案只引用共用 Decorator，包裝細節集中在單一定義處
export const Default: Story = {
	decorators: [withPadding, withMaxWidth],
	args: { user: userBasic },
};

export const Suspended: Story = {
	decorators: [withPadding, withMaxWidth],
	args: { user: userSuspended },
};
```

> **注意**：共用樣式類別（`.story-padding`、`.story-max-w-md`）必須由**根 Decorator 統一載入**才會生效——見第 3 節。

### 收益 (Benefits)

- **單一定義處**：展示包裝改版只改一個檔案
- **可組合**：`decorators: [withPadding, withMaxWidth]` 自由拼裝，也可抽出展示慣例成固定組合
- **可搜尋**：搜尋 `withPadding` 即可列出所有使用點

---

## 2. 同源的根 Decorator (Single Root Decorator)

### 概念 (Concept)

Storybook 的 Decorator 依 **preview（全域）→ meta（元件）→ story（案例）** 由外而內自動巢狀包覆：

```
preview 根 Decorator（唯一來源 / 同源起點）
└─ meta 層 Decorator（元件特性：主題、Mock、版面）
   └─ story 層 Decorator（單一案例專屬）
      └─ <Story />
```

**推薦為所有 Decorator 建立或繼承一個「同源的根 Decorator」**——樣式入口、根容器 class、環境 Provider 都只存在一份。否則各層各自定義「環境包裝」，就會出現多個來源：重複載入樣式、根 class 缺漏、效果互相覆蓋或疊加成非預期結果。

### 模式 A（推薦）：在 preview 建立全域根，其餘自動繼承

```tsx
// .storybook/preview.tsx
import type { Preview } from '@storybook/react';
import { rootDecorator } from '../src/stories/decorators/rootDecorator';

const preview: Preview = {
	// 全域唯一根：所有 story 與後續 Decorator 都由它包覆（同源起點）
	decorators: [rootDecorator],
	parameters: {
		layout: 'centered',
	},
};

export default preview;
```

```tsx
// src/stories/decorators/rootDecorator.tsx
import type { Decorator } from '@storybook/react';
import type { PropsWithChildren } from 'react';

// 公用樣式載入：見第 3 節
import '../../../styles/tokens.css';
import '../../../styles/global.scss';
import './storybook-shared.css';

/* 根容器：套用與應用程式入口同源的 class，使字型、背景、CSS 變數作用域一致 */
function StoryRoot({ children }: PropsWithChildren) {
	return <div className="app-root story-root">{children}</div>;
}

/* 全域根 Decorator —— 所有 Decorator 與 Story 的唯一同源起點 */
export const rootDecorator: Decorator = (Story) => (
	<StoryRoot>
		<Story />
	</StoryRoot>
);
```

此模式下，meta / story 層的特性 Decorator **自動繼承**根（Storybook 已把根包在外層），只需包自己的職責：

```tsx
/* ✅ 特性 Decorator 只包自己的職責：根由 preview 自動提供，不重複包覆 */
export const withCard: Decorator = (Story) => (
	<div className="story-card">
		<Story />
	</div>
);
```

### 模式 B：以工廠「繼承」根（需脫離 preview 獨立使用時）

當 Decorator 也可能在**不經 preview 的環境**使用（單元測試、文件產生器），要保證與全域根同源時，以工廠函式從根衍生：

```tsx
// src/stories/decorators/createFeatureDecorator.tsx
import type { Decorator } from '@storybook/react';
import type { ReactNode } from 'react';
import { StoryRoot } from './rootDecorator';

type TFeatureWrap = (story: ReactNode) => ReactNode;

/**
 * 特性 Decorator 工廠：一律以 StoryRoot（與根 Decorator 同一個容器）包裹，
 * 保證脫離 preview 使用時仍載入同樣式、套用同樣的根 class
 */
export const createFeatureDecorator =
	(wrap: TFeatureWrap): Decorator =>
	(Story) =>
		<StoryRoot>{wrap(<Story />)}</StoryRoot>;

/* 由工廠衍生的特性 Decorator：樣式入口與根同源 */
export const withCard = createFeatureDecorator((story) => (
	<div className="story-card">{story}</div>
));
```

> **⚠️ 兩種模式擇一**：根放 preview（模式 A）時，特性 Decorator **不要再包 StoryRoot**，否則根被重複包覆；只有在 preview **沒有**根的前提下，才用工廠顯式繼承（模式 B）。

### 收益 (Benefits)

- **同源**：樣式入口、根 class、Provider 只存在一份，不會「這裡有、那裡漏」
- **自動繼承**：新故事一建立就拿到完整環境，不需記得手動加裝飾
- **職責清晰**：根管「環境與樣式」，特性 Decorator 管「展示情境」

---

## 3. 在根 Decorator 引用公用樣式 (Load Shared Styles in the Root Decorator)

### 概念 (Concept)

共用樣式（設計 token、全域 reset、story 專用工具類）必須在**根 Decorator 所在檔案**中載入，且根容器套用與應用入口同源的 class。如此所有 story 才能繼承 CSS 自訂屬性、使用共用類別，避免兩種典型症狀：

- **「明明定義了卻沒效果」**——樣式定義存在於程式碼中，但 Storybook 的 iframe 根本沒載入它
- **「效果不完整」**——載入了一部分，或包裝節點破壞了樣式生效的條件

### 常見失效原因 (Why Styles Silently Fail)

| 症狀 | 原因 |
|------|------|
| 明明定義了卻沒效果 | 樣式入口寫在 `App.tsx`，而 **Storybook 不渲染 App** → token/工具類未載入 → `var(--x)` 在計算值時間失效、屬性退回初始值（**靜默失效，無任何錯誤**） |
| 效果不完整（樣式） | 根 Decorator 只 import 一部分（有 token 沒 reset、或漏了 story 專用類）；Storybook 自身的預設樣式（`layout`、`backgrounds`）覆蓋了自訂設定 |
| 效果不完整（佈局） | Decorator 的包裝節點改變了生效條件——`padding`/`overflow`/`transform` 改變定位參照，使 `position: fixed`、滿版尺寸等「只對一半」 |
| 樣式時有時無 | 樣式 import 散落在個別 story 檔案，有的 story 有載入、有的沒有 |

> 靜默失效的完整說明（含 `var()` fallback 陷阱）見 [CSS 重構指南：常見陷阱](../../css/css-refactoring-guide.md)。

### 解決方案：根 Decorator 單一載入點

```tsx
// src/stories/decorators/rootDecorator.tsx
import type { Decorator } from '@storybook/react';
import type { PropsWithChildren } from 'react';

/*
 * 公用樣式單一入口：
 * 1. tokens.css —— 設計 token（--color-primary 等 CSS 自訂屬性）
 * 2. global.scss —— reset、字型、基礎元素樣式
 * 3. storybook-shared.css —— story 專用共用類（.story-padding / .story-card / .story-max-w-md）
 */
import '../../../styles/tokens.css';
import '../../../styles/global.scss';
import './storybook-shared.css';

function StoryRoot({ children }: PropsWithChildren) {
	// app-root：與應用入口同源的根 class，確保 token 作用域、字型、背景一致
	return <div className="app-root story-root">{children}</div>;
}

export const rootDecorator: Decorator = (Story) => (
	<StoryRoot>
		<Story />
	</StoryRoot>
);
```

```css
/*
 * storybook-shared.css —— 供各共用 Decorator 引用的展示類
 * 由根 Decorator 統一載入，避免「Decorator 引用了 class，但 class 未定義」
 */
.story-root
{
	/* 取用 token：token 檔未載入時這裡會靜默失效，故與 tokens.css 綁定於同一入口 */
	padding: var(--space-md, 24px);
	background-color: var(--color-bg, #fff);
}

.story-padding
{
	padding: var(--space-md, 24px);
}

.story-max-w-md
{
	/* 限制展示寬度並置中，模擬元件在版面中的可用空間 */
	max-width: 480px;
	margin-inline: auto;
}
```

### 驗證方法 (How to Verify)

1. **檢查 token 是否載入**：DevTools 選取根容器 → Computed → 搜尋自訂屬性；或 Console 執行
   `getComputedStyle(document.querySelector('.story-root')).getPropertyValue('--color-bg')`
   ——回傳**空字串**代表 token 檔沒被載入（症狀：定義了卻沒效果）
2. **檢查根 class**：根容器是否同時帶有 `app-root story-root`
3. **檢查佈局條件**：外層包裝有無多餘的 `overflow` / `transform` / `padding` 改變定位參照（症狀：效果不完整）
4. **逐一檢查裝飾層**：關閉 meta/story 層 Decorator，確認根層單獨作用時樣式已完整

### 收益 (Benefits)

- **單一載入點**：token / 全域樣式 / story 工具類只在根 Decorator 載入一次，不會重複或缺漏
- **同源繼承**：根容器 class 與應用入口一致，CSS 變數作用域、字型、背景在 Storybook 內外相同
- **可驗證**：失效時有明確的檢查路徑（computed value → 載入點 → 包裝條件）

---

## 4. 展示資料分類抽離至 fixture 資料夾 (Extract Display Data into Fixtures)

### 概念 (Concept)

展示資料（展示用的假資料）不應內聯在 story 檔案中——story 應只描述**「呈現哪個情境」**，資料本身抽離到 stories 專用的 **fixture 資料夾**，並分類管理。

**推薦優先採用共同的 fixtures 路徑**（`src/stories/fixtures/`）作為預設位置——查找位置統一、分類慣例一致、跨組件直接複用；**僅當資料確實為該組件專屬**（其他組件不會使用）時，才放組件本地的 `stories/fixtures/`。

**關注點分離**：

| 關注點 | 放在哪 |
|--------|--------|
| 樣式、版面、環境（Provider、Mock、token） | Decorator（第 1-3 節） |
| 展示資料 | 共同 fixtures 路徑（預設）→ 透過 `args` 傳入 |

Decorator 不塞業務資料、story 不內聯大段資料——兩者各自只有一個家。

### 資料夾結構 (Folder Structure)

```
src/stories/fixtures/        ← 【推薦優先】共同 fixtures 路徑：展示資料的預設放置位置
├── user.ts                  ← 依領域分檔（story 直接從來源檔引用，不建 index 匯出聚合）
└── pagination.ts

src/components/UserCard/
├── UserCard.tsx
└── stories/
    ├── UserCard.stories.tsx
    └── fixtures/            ← 例外：僅放確實為該組件專屬、其他組件不會用到的資料
        └── cardVariants.ts
```

**分類維度 (Categorization)**：

| 維度 | 分檔／命名方式 | 例子 |
|------|----------------|------|
| **依領域 (domain)** | 每個實體一個檔案 | `user.ts` / `order.ts` |
| **依情境 (scenario)** | 每個情境一組命名 export | `userBasic` / `userSuspended` / `userEmpty` |
| **依邊界案例** | export 命名標示極端性 | `userLongName`（截斷）、`usersMany`（分頁） |
| **放置路徑（預設共同路徑）** | 優先放共同的 `src/stories/fixtures/`；僅組件專屬資料放本地 `stories/fixtures/` | `user.ts`（共同）/ `cardVariants.ts`（組件專屬） |

### 重構前：資料內聯在 story

```tsx
// ❌ 大段資料內聯在 story 檔案：難以分類、重複使用，story 被資料淹沒
export const LongName: Story = {
	args: {
		user: {
			id: 'U-0001',
			name: '這是一個用來驗證文字截斷與換行行為的超長使用者姓名測試案例',
			avatar: '/avatars/01.png',
			status: 'active',
			// ...
		},
	},
};
```

### 重構後：fixture 分類抽離

```tsx
// src/stories/fixtures/user.ts —— 共同 fixtures 路徑（推薦優先放置）
import type { IUser } from '../../types/user';

/* 基礎展示用使用者：預設情境的完整資料（其餘情境以此為基底） */
export const userBasic: IUser = {
	id: 'U-0001',
	name: '王小明',
	avatar: '/avatars/01.png',
	status: 'active',
};

/* 已停權使用者：展示狀態標籤與停權樣式 */
export const userSuspended: IUser = {
	...userBasic,
	id: 'U-0002',
	name: '陳停權',
	status: 'suspended',
};

/* 超長姓名：驗證文字截斷與換行行為 */
export const userLongName: IUser = {
	...userBasic,
	name: '這是一個用來驗證文字截斷與換行行為的超長使用者姓名測試案例',
};

/* Builder：以 userBasic 為基底局部覆寫，避免為每個情境整份複製 */
export const buildUser = (overrides: Partial<IUser> = {}): IUser => ({
	...userBasic,
	...overrides,
});
```

```tsx
// UserCard.stories.tsx —— story 只描述情境，資料來自共同 fixtures 路徑（直接從來源檔引用）
import type { Meta, StoryObj } from '@storybook/react';
import { UserCard } from '../UserCard';
import { withCard } from '../../../stories/decorators/layoutDecorators';
import { userBasic, userSuspended, userLongName } from '../../../stories/fixtures/user';

const meta: Meta<typeof UserCard> = {
	component: UserCard,
	decorators: [withCard],
};
export default meta;

type Story = StoryObj<typeof UserCard>;

/* 預設狀態 */
export const Default: Story = { args: { user: userBasic } };

/* 停權狀態 */
export const Suspended: Story = { args: { user: userSuspended } };

/* 超長姓名 */
export const LongName: Story = { args: { user: userLongName } };
```

### 慣例 (Conventions)

| 規則 | 說明 |
|------|------|
| **優先採用共同的 fixtures 路徑** | 預設從 `src/stories/fixtures/` 引用——查找位置統一、分類慣例一致、跨組件免重複；**僅**資料確實為該組件專屬時，才放本地 `stories/fixtures/` |
| **直接從來源檔 import，不建匯出聚合 (barrel)** | story 以 `../../../stories/fixtures/user` 引用，不建立 `index.ts` 再轉手——隱藏實際依賴、妨礙 tree shaking，且新增 fixture 還要多改一處（見主技能的 Barrel Index 規則） |
| **命名 export，不用 default** | 可被 IDE 自動完成、可全文搜尋與重構 |
| **一律加型別標註** | `const userBasic: IUser` —— 簽名 (signature) 與真實型別不符時立即報錯 |
| **命名表達情境** | `<實體><情境>`（`userSuspended`），而非 `user1` / `user2` |
| **story 不內聯大段資料** | story 只保留 `args` 引用，資料定義全在 fixtures |
| **Decorator 不塞展示資料** | 資料走 `args`，Decorator 只管環境與樣式 |
| **fixture 與環境隔離** | fixture 是靜態展示資料，不 import 生產環境的 API mock，確保展示穩定、不受網路影響 |

### 收益 (Benefits)

- **查找位置統一**：共同 fixtures 路徑是預設入口——找資料不用逐個組件資料夾翻找
- **分類可預期**：依領域分檔、依情境命名 export，找資料只要知道「哪個實體、哪個情境」
- **無重複**：`buildUser` 基底 + 局部覆寫，情境再多也不複製整份資料；跨組件直接共用同一份
- **story 乾淨**：story 檔案只剩情境描述，閱讀與維護成本大幅下降
- **型別保障**：fixture 加型別標註，資料簽名過期立即被編譯器抓到

---

## 5. 以 `meta.title` 整理分類（多級目錄）(Organize with Multi-level `meta.title`)

### 概念 (Concept)

Storybook 側邊欄的分類樹來自 `meta.title`——以 `/` 分隔即可建立**多級目錄**。兩種極端都會讓側邊欄失去導覽價值：

| 極端 | 症狀 | 病因 |
|------|------|------|
| **沒分類／不一致** | 難以找尋組件——側邊欄變成雜亂清單，或與檔案位置對不上 | title 缺省（依檔名／路徑推斷而漂移），或各檔分隔符、大小寫、層級深度各寫各的 |
| **過度碎片化** | 導覽成本反而高於直接搜尋——單項資料夾、層層套疊的小分類淹沒 story | 層級過深、為單一組件開多層資料夾、story 案例也拿來分層 |

**推薦：統一的多級架構——深度 5 級以內都還算合理**，全團隊一致：

| 層級 | 內容 | 例子 |
|------|------|------|
| 第 1 級 | 領域／頁面 (domain) | `DesignSystem` / `Dashboard` / `Marketing` |
| 第 2 級 | 分類 (category) | `Buttons` / `Forms` / `Feedback` |
| 第 3 級 | 組件（葉節點） | `Button` |

上表以 3 級為例；依領域複雜度可延伸至 4-5 級（如 `Dashboard/Marketing/Campaigns/Buttons/Button`）。**超過 5 級**、或出現「同層只有一個子項」的長鏈，才是需要合併的過度碎片化訊號。

story 案例（`Default`、`Loading`...）是**組件的子項**，由 export 名稱表達情境，**不再用 title 加深層級**。

### 重構前：title 缺省或不一致

```tsx
// ❌ 沒有 title：依檔名推斷，路徑隨檔案擺放位置而漂移
export default { component: Button } satisfies Meta<typeof Button>;

// ❌ 各檔寫法不一：分隔符、大小寫、深度各異（且已超過 5 級），側邊欄難以預期
export default { title: 'button', component: Button };
export default { title: 'Forms/inputs/TextInput', component: TextInput };
export default { title: 'Web/Pages/Forms/Inputs/TextInputField/Examples', component: TextInputField };
```

### 重構後：統一的多級 title

```tsx
// src/components/Button/stories/Button.stories.tsx
export default {
	// 多級 title：分類 → 組件（story export 為其下情境，不再加深層級）
	title: 'DesignSystem/Buttons/Button',
	component: Button,
	// autodocs 文件頁掛在組件節點下（與 story 案例同層）
	tags: ['autodocs'],
} satisfies Meta<typeof Button>;
```

對應的側邊欄結構：

```
▼ DesignSystem
  ▼ Buttons
    ▼ Button          ← 組件節點（autodocs 文件頁在此）
      • Default
      • Loading
      • Disabled
```

### 慣例 (Conventions)

| 規則 | 說明 |
|------|------|
| **顯式寫 title，不依賴推斷** | 檔名或檔案搬移不影響側邊欄位置，分類穩定可預期 |
| **深度控制在 5 級以內** | 5 級內都還算合理，依領域複雜度彈性增加；story 案例由 export 名稱表達，不再開層 |
| **單項分類合併** | 同層只有一個子項的分類與上層合併（`Forms/TextInput`，而非 `Web/Forms/Inputs/TextInputField`） |
| **同層命名一致** | 組件層統一 PascalCase；分類層統一複數名詞（`Buttons`），不混用 `buttons` / `btn` / `Button` |
| **段落不冗餘** | 每段資訊各司其職（`DesignSystem/Buttons/Button`）；`Components/Button/Button` 是重複段落 |
| **檔案路徑對齊 title** | `src/components/buttons/` 對應 `DesignSystem/Buttons/`——檔案位置與側邊欄一致，認知落差最小（推薦，但非強制） |

> **⚠️ 改 title 等同改 story id**：story id 由 `title + export 名稱` 計算，既有連結、書籤、視覺回歸測試基準都會失效——分類架構應在導入初期就定案，之後避免隨意更動；修改後 Storybook 也需重新整理才會反映。

### 收益 (Benefits)

- **好找**：一致的多級分類讓側邊欄成為可預期的導覽樹，搭配 Storybook 搜尋（title 即搜尋範圍）快速定位組件
- **不碎片**：深度上限（5 級）與單項合併規則，避免資料夾套疊淹沒 story 案例
- **可維護**：title 顯式且與檔案路徑對齊，新增組件照抄同一架構即可

---

## 檢查清單 (Checklist)

- [ ] 重複出現在 2 個以上 story 的包裝，是否已抽離為共用 Decorator？
- [ ] 是否有**唯一一個根 Decorator**（preview 建立 或 工廠繼承），而非各層自行定義環境？
- [ ] 根容器是否套用與應用入口同源的根 class（`app-root`）？
- [ ] token / 全域樣式 / story 工具類是否**全部由根 Decorator 檔案載入**，無遺漏、無散落？
- [ ] 共用 Decorator 引用的 class，是否都有對應定義（無「引用了但沒定義」）？
- [ ] 是否驗證過 token 有值（computed value 非空字串）？
- [ ] 包裝節點是否破壞了佈局條件（`overflow` / `transform` / 定位參照）？
- [ ] 展示資料是否**優先採用共同的 fixtures 路徑**（`src/stories/fixtures/`），僅組件專屬資料放本地 `stories/fixtures/`？
- [ ] fixture 是否依領域分檔、依情境命名 export，且無 `index.ts` 匯出聚合？
- [ ] story 是否只以 `args` 引用 fixture，未內聯大段資料？
- [ ] Decorator 是否未混入業務資料？
- [ ] `meta.title` 是否**顯式**採用統一的多級架構（領域／分類／組件...），無缺省、無冗餘段落？
- [ ] 分類層級是否控制在 **5 級以內**，單項分類已合併（無過度碎片化）？
- [ ] 檔案路徑是否與 `meta.title` 分類對齊？（推薦，但非強制）

## 相關資源 (Related)

- [skills/code-refactoring-miscellaneous](../../../SKILL.md) - 核心重構指引
- [CSS 重構指南](../../css/css-refactoring-guide.md) - 抽離共用樣式值、`var()` 靜默失效陷阱（本指南第 1、3 節的樣式基礎）
- [comment-format-rules-css](../../../../comment-format-rules-css/SKILL.md) - CSS/SCSS 註解格式規範
- [Storybook Docs: Decorators](https://storybook.js.org/docs/writing-stories/decorators)
- [Storybook Docs: Style and Layout](https://storybook.js.org/docs/essentials/style-and-layout)
