# Code Comment Examples

Detailed before/after examples for bilingual comment patterns (Traditional Chinese + English).

### 範例一：類別與成員註解

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

### 範例二：複雜邏輯區塊

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

    /**
     * 以批次方式迭代處理所有項目
     * Iterate through all items in batches
     *
     * 取得當前批次的項目子集
     * Get the subset of items for the current batch
     *
     * 並行處理當前批次，等待所有項目完成
     * Process current batch in parallel, waiting for all items to complete
     *
     * 將有效結果加入結果陣列，過濾掉失敗項目
     * Add valid results to the result array, filtering out failed items
     */
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

### 範例三：陣列元素註解

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

### 範例四：保留原始區塊註解風格

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

### 範例五：長行內註解分行顯示

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
- 若檔案過大，請分段處理。
