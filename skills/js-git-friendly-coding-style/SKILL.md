---
name: js-git-friendly-coding-style
description: 基於 JavaScript 的代碼風格，優化 Git diff 可讀性與可合併性。使用 Tab 縮排（除非原始縮排是空格），Allman 風格大括號。
---

# JavaScript Git-Friendly 代碼風格

此風格旨在減少 Git 差異中的視覺雜訊，提升程式碼合併時的可讀性與安全性。

## 核心原則

1. **最小化無關變更**：不增加原本沒有的元素
2. **清晰的邊界識別**：大括號換行使程式碼區塊邊界更直觀
3. **一致的縮排**：預設使用 Tab（除非原始縮排是空格，則保留原樣）

### 不增加原本沒有的 `{` 或 `;`

如果原始代碼沒有大括號或分號，保持原樣：

```javascript
// ✅ 保持不變
if (maxSize) this.maxCacheSize = maxSize

// ✅ 保持不變
if (condition)
    doSomething()
else
    doOther()
```

不要強行轉換為：

```javascript
// ❌ 不要這樣做
if (maxSize)
{
    this.maxCacheSize = maxSize;
}
```

除非**使用者明確要求**添加分號。

## 格式規則

> ⚠️ 以下代碼範例使用 Tab 縮排

### 1. 縮排與行尾

- 預設使用 **Tab** 縮排
- **例外**：若原始程式碼使用空格縮排，則保持原樣
- **行尾 (Line Ending)**：一律使用 **LF** (`\n`)，不論系統環境為何

### 2. 函數定義

```javascript
function foo()
{
	// ...
}

export function bar()
{
	// ...
}
```

### 3. 控制結構

```javascript
if (condition)
{
	// ...
}
else if (otherCondition)
{
	// ...
}
else
{
	// ...
}

for (let i = 0; i < n; i++)
{
	// ...
}

while (condition)
{
	// ...
}

switch (value)
{
	case 'a':
		// ...
		break;
	default:
		// ...
}
```

### 4. 解構賦值

```javascript
const {
	foo,
	bar,
} = object;

let {
	keys = [],
	useSource,
} = options;
```

### 5. 類型定義 (TypeScript)

```typescript
interface IOptions<T>
{
	keys?: string[];
	sort?: (a: any, b: any) => number;
}
```

### 6. 註解風格

當需要為代碼添加註解時，推薦參考 [analyze-code-commenter skill](../analyze-code-commenter/) 的風格：
- **只使用區塊註解** (`/** ... */`)，**不使用行內註解** (`//`)

### 7. 其餘遵循 Standard Style

- 結尾不加分號（除非必要）
- **使用單引號字串** ( `'` 而非 `"` )
- 使用 trailing comma

## 使用時機

### ✅ 主動套用此風格的情況

1. **創建新檔案** - 從零開始的程式碼套用此風格
2. **用戶明確要求** - 當用戶要求使用此風格時

### ❌ 不應套用此風格的情況

1. **修改他人代碼** - 保持原有格式，不強行套用此風格
2. **用戶未指定風格** - 保持原檔案的格式一致性
3. **Lint 修復** - 僅修正語法錯誤，不主動調整格式

## 與 Standard Style 的差異

| 項目 | Standard Style | Git-Friendly |
|------|----------------|--------------|
| 函數大括號 | 同一行 | 換行 |
| if/else 大括號 | 同一行 | 換行 |
| 縮排 | 2 空格 | Tab（除非原為空格）|
| 行尾 | 環境預設 | LF（統一）|
