---
name: analyze-code-commenter
description: 分析代碼並添加雙語註解（繁體中文與英文），針對核心邏輯、內部方法與 protected/private 成員，且不改變原始代碼格式。
---

# Analyze Code Commenter Skill

此技能用於分析程式碼，並在不改變原始代碼格式的前提下，為核心邏輯、內部方法及 `protected`/`private` 成員添加詳細的雙語註解（繁體中文與英文）。

## 使用指南

當使用者要求分析代碼並添加註解時，請遵循以下步驟：

1.  **讀取代碼**：完整讀取目標檔案的內容。
2.  **分析結構**：
    *   識別核心業務邏輯與演算法。
    *   識別所有 `private`、`protected` 方法或屬性。
    *   識別複雜的內部邏輯區塊。
3.  **生成註解**：
    *   為識別出的部分生成註解。
    *   **格式要求**：
        *   若為方法/類別/屬性，優先使用 JSDoc 格式 `/** ... */`。
        *   若為行內邏輯，使用單行註解 `// ...`。
        *   **保留原始風格**：若原始註解已為區塊風格 `/** ... */`，則保留該格式並添加英文翻譯，不轉換為單行註解。
    *   **語言要求**：
        *   同時包含 **繁體中文 (Traditional Chinese, zh-TW)** 與 **英文 (English)**。
        *   繁體中文在前，英文在後，或視版面配置清晰呈現。
    *   **內容要求**：
        *   解釋「為什麼這樣做」 (Why) 而非僅解釋「做了什麼」 (What)。
        *   說明參數、返回值、可能的副作用或異常。
    *   **格式總結**：

        | 註解類型 | 格式 |
        |---------|------|
        | JSDoc（方法/類別/屬性） | 先中文段落，後英文段落 |
        | 行內註解（簡短） | `// 中文說明 / English description` |
        | 行內註解（較長） | 分兩行：`// 中文說明` 換行 `// English description` |
        | 陣列元素 | 註解放在元素上方，使用 `// 中文 / English` 格式 |
        | 原始區塊註解 | 保留 `/** ... */` 格式，添加英文翻譯 |
4.  **應用變更**：
    *   使用 `multi_replace_file_content` 或 `replace_file_content` 工具將註解插入代碼中。
    *   **絕對禁止** 更改任何現有的程式碼 formatting（縮排、換行、空格等），僅在空白處或行間插入註解。
    *   **絕對禁止** 刪除舊有已被註解不使用的代碼（如 `// old code...` 或 `/* ... */` 包裹的廢棄代碼）。
    *   對於重點名詞、特殊名詞或可能產生歧義的用語，應在繁體中文後標註英文對照，例如：「快取 (Cache)」、「佇列 (Queue)」、「遞迴 (Recursion)」。

## 範例

### 範例一：方法註解

#### Before

```typescript
    protected _calculateWeight(value: number): number
    {
        if (value < 0) return 0;
        return value * 1.5;
    }
```

#### After

```typescript
    /**
     * 計算權重
     * Calculate the weight
     *
     * 如果輸入值小於 0，則返回 0；否則返回值的 1.5 倍。
     * 用於標準化數據範圍，確保權重值不為負數。
     *
     * If the input value is less than 0, return 0; otherwise, return 1.5 times the value.
     * Used to normalize data range and ensure weight values are non-negative.
     *
     * @protected
     * @param {number} value - 輸入數值 / Input value
     * @returns {number} 計算後的權重 / Calculated weight
     */
    protected _calculateWeight(value: number): number
    {
        if (value < 0) return 0;
        return value * 1.5;
    }
```

### 範例二：類別註解

#### Before

```typescript
class DataProcessor {
    private cache: Map<string, any>;
    private maxCacheSize: number = 100;

    constructor(maxSize?: number) {
        this.cache = new Map();
        if (maxSize) this.maxCacheSize = maxSize;
    }
}
```

#### After

```typescript
/**
 * 數據處理器
 * Data Processor
 *
 * 提供數據轉換、快取管理與批次處理功能。
 * 支援自訂快取大小上限，預設為 100 筆資料。
 * 使用 LRU (Least Recently Used) 策略自動清理過期快取。
 *
 * Provides data transformation, cache management, and batch processing capabilities.
 * Supports customizable cache size limit, defaulting to 100 entries.
 * Uses LRU (Least Recently Used) strategy to automatically clean up expired cache.
 */
class DataProcessor {
    /**
     * 快取儲存空間
     * Cache Storage
     *
     * 使用 Map 結構儲存已處理的數據，以鍵值對形式管理。
     * 避免重複處理相同數據，提升效能。
     *
     * Uses Map structure to store processed data, managed as key-value pairs.
     * Avoids reprocessing the same data to improve performance.
     *
     * @private
     */
    private cache: Map<string, any>;

    /**
     * 快取大小上限
     * Maximum Cache Size
     *
     * 控制快取可儲存的最大資料筆數。
     * 當超過此上限時，會自動移除最久未使用的項目。
     *
     * Controls the maximum number of entries the cache can store.
     * When exceeding this limit, the least recently used item is automatically removed.
     *
     * @private
     */
    private maxCacheSize: number = 100;

    /**
     * 建構函式
     * Constructor
     *
     * 初始化數據處理器實例，設定快取大小上限。
     * 若未指定大小，則使用預設值 100。
     *
     * Initializes a data processor instance and sets the cache size limit.
     * If no size is specified, the default value of 100 is used.
     *
     * @param {number} [maxSize] - 選填，快取大小上限 / Optional, maximum cache size
     */
    constructor(maxSize?: number) {
        this.cache = new Map();
        if (maxSize) this.maxCacheSize = maxSize;
    }
}
```

### 範例三：行內註解

#### Before

```typescript
private _transformData(raw: unknown): Result {
    const parsed = JSON.parse(JSON.stringify(raw));
    const filtered = parsed.filter(item => item.active);
    return filtered.map(item => ({
        id: item.id,
        value: this._normalize(item.value)
    }));
}
```

#### After

```typescript
    /**
     * 轉換數據
     * Transform Data
     *
     * 將原始數據轉換為標準化格式。
     * 包含深拷貝、過濾無效項目與正規化處理。
     *
     * Transforms raw data into a standardized format.
     * Includes deep copy, filtering invalid items, and normalization.
     *
     * @private
     * @param {unknown} raw - 原始數據 / Raw data
     * @returns {Result} 轉換後的結果 / Transformed result
     */
    private _transformData(raw: unknown): Result {
        // 深拷貝以避免修改原始資料 / Deep copy to avoid modifying the original data
        const parsed = JSON.parse(JSON.stringify(raw));

        // 過濾掉未啟用的項目 / Filter out inactive items
        const filtered = parsed.filter(item => item.active);

        // 轉換為標準格式並正規化數值 / Convert to standard format and normalize values
        return filtered.map(item => ({
            id: item.id,
            value: this._normalize(item.value)
        }));
    }
```

### 範例四：複雜邏輯區塊

#### Before

```typescript
async function processBatch(items: Item[]): Promise<ProcessedItem[]> {
    const results: ProcessedItem[] = [];
    const batchSize = 10;

    for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        const processed = await Promise.all(
            batch.map(item => transformItem(item))
        );
        results.push(...processed.filter(Boolean));
    }

    return results;
}
```

#### After

```typescript
/**
 * 批次處理
 * Batch Processing
 *
 * 將大量項目分批處理，避免記憶體溢出與 API 限流。
 * 每批處理 10 筆資料，使用並行處理提升效率。
 * 自動過濾處理失敗的項目（返回 null 或 undefined 者）。
 *
 * Processes large numbers of items in batches to avoid memory overflow and API rate limiting.
 * Each batch processes 10 items, using parallel processing to improve efficiency.
 * Automatically filters out failed items (those returning null or undefined).
 *
 * @param {Item[]} items - 待處理的項目陣列 / Array of items to process
 * @returns {Promise<ProcessedItem[]>} 處理完成的項目陣列 / Array of processed items
 */
async function processBatch(items: Item[]): Promise<ProcessedItem[]> {
    const results: ProcessedItem[] = [];

    // 每批處理的項目數量 / Number of items to process per batch
    const batchSize = 10;

    // 以批次方式迭代處理所有項目 / Iterate through all items in batches
    for (let i = 0; i < items.length; i += batchSize) {
        // 取得當前批次的項目子集 / Get the subset of items for the current batch
        const batch = items.slice(i, i + batchSize);

        // 並行處理當前批次，等待所有項目完成 / Process current batch in parallel, waiting for all items to complete
        const processed = await Promise.all(
            batch.map(item => transformItem(item))
        );

        // 將有效結果加入結果陣列，過濾掉失敗項目 / Add valid results to the result array, filtering out failed items
        results.push(...processed.filter(Boolean));
    }

    return results;
}
```

### 範例五：陣列元素註解

#### Before

```typescript
// 定義各種外文字元的匹配模式
let arr = [
    /[\d０-９]+(?:,[\d０-９]+)?(?:\.[\d０-９]+)?/,  // 數字
    /[\w０-９Ａ-Ｚａ-ｚ\u0100-\u017F\u00A1-\u00FF]+/,  // 英文及擴展拉丁字母
    /[\u0600-\u06FF\u0750-\u077F]+/,  // 阿拉伯文
    /[\u0400-\u04FF]+/,  // 俄文（西里爾字母）
    /[\u0370-\u03FF]+/,  // 希臘文
];
```

#### After

```typescript
// 定義各種外文字元的匹配模式 / Define matching patterns for various foreign characters
let arr = [
    // 數字 / Numbers
    /[\d０-９]+(?:,[\d０-９]+)?(?:\.[\d０-９]+)?/,
    // 英文及擴展拉丁字母 / English and extended Latin
    /[\w０-９Ａ-Ｚａ-ｚ\u0100-\u017F\u00A1-\u00FF]+/,
    // 阿拉伯文 / Arabic
    /[\u0600-\u06FF\u0750-\u077F]+/,
    // 俄文（西里爾字母）/ Russian (Cyrillic)
    /[\u0400-\u04FF]+/,
    // 希臘文 / Greek
    // https://unicode-table.com/cn/blocks/greek-coptic/
    /[\u0370-\u03FF]+/,
];
```

### 範例六：保留原始區塊註解風格

#### Before

```typescript
/**
 * 不確定沒有BUG 但原始模式已經不合需求 因為單一項目多個詞性
 */
else if (m = (w1.p & w2.p))
{
    if (1 || m & POSTAG.D_N)
    {
        bool = true;
    }
}
```

#### After

```typescript
/**
 * 不確定沒有 BUG 但原始模式已經不合需求，因為單一項目可能有多個詞性
 * Uncertain if bug-free, but original pattern no longer meets requirements due to multiple POS per item
 */
else if (m = (w1.p & w2.p))
{
    if (1 || m & POSTAG.D_N)
    {
        bool = true;
    }
}
```

### 範例七：長行內註解分行顯示

#### Before

```typescript
// 百分比數字 如 10%，或者下一個詞也是數詞，則合併
if ((
    w2.p & POSTAG.A_M
    && !/^第/.test(w2.w)
```

#### After

```typescript
// 百分比數字 如 10%，或者下一個詞也是數詞，則合併
// Percentage numbers like 10%, or merge if next word is also numeral
if ((
    w2.p & POSTAG.A_M
    && !/^第/.test(w2.w)
```

## 注意事項

- 保持原有代碼風格一致性。
- 確保繁體中文使用台灣慣用語彙。
- 若檔案過大，請分段處理。
