# 🛠 註解格式規範

## 核心原則

IDE 及 AI 在處理程式碼時，會優先解析 **語義化標籤**（如 JSDoc）與 **上下文關聯**。為了確保代碼的可維護性與提示的精準度，請遵循以下邏輯與範式。

---

## 1. 結構化文檔註解 (Documentation Blocks)

凡是涉及 **函式定義、類別、介面、重要的常數或設定值、複雜邏輯區塊、關鍵邏輯或算法**，必須使用編輯器可識別的標準區塊註解。這有助於 IDE 及 AI 在提供自動補全（IntelliSense）時顯示正確的提示訊息。

- **格式：** 使用 `/** ... */`
- **適用場景：** 模組、API 接口、函式定義、類別、介面、重要的常數或設定值、複雜邏輯區塊、關鍵邏輯或算法。

範例：

```js
/**
 * 處理用戶訂單並計算總金額
 * @param {Object} order - 訂單物件
 * @param {number} taxRate - 稅率 (例如 0.05)
 * @returns {number} 含稅後的總金額
 */
function calculateTotal(order, taxRate) {
    // ...邏輯
}

/**
 * 安全上限 - 用於格式偵測的效能保護
 * Safety limits - performance protection for format detection
 *
 * @type {number}
 */
const MAX_CHARS = 2000;
```

---

## 2. 單行區塊註解 (Single-line Block)

對於能夠被編輯器標記，但內容較短的說明，使用單行的區塊註解格式。

對於使用 TypeScript 的變數或屬性，若程式碼中已明確標註型別（例如 `private ideList: IIDEInfo[]`），則無需在 JSDoc 中再次使用 `@type` 標註。當新增簡短說明時，可直接使用單行區塊註解（`/** 註解內容 */`）以保持簡潔與一致性。

- **格式：**`/** 註解內容 */`
- **適用場景：** 變數聲明、配置項、常數說明。

範例：

```js
/** 設定 API 請求的超時時間（毫秒） */
const API_TIMEOUT = 5000;

/** 初始化用戶狀態快取 */
let userCache = new Map();
```

```typescript
/** IDE 列表：存儲成功偵測到的可用 IDE */
private ideList: IIDEInfo[] = [];
```

---

## 3. 註解位置規範 (Placement Rules)

**註解應放置於代碼上方，而非代碼後方。** 這樣的安排有助於提升代碼的可讀性，並使 IDE 及 AI 能夠更好地理解上下文關聯。

### 3.1 對陣列元素的註解

```typescript
// ✅ 推薦：註解放在上方
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
    /[\u0370-\u03FF]+/,
];
```

### 3.2 對物件屬性的註解

```typescript
// ✅ 推薦：使用文檔區塊註解，放置於屬性上方
let jsonHandlerOptions = {
	/**
	 * 是否允許註解
	 * @default true
	 */
	allowComments: true
}
```

### 3.3 注意事項

- **避免代碼後方註解** (`code // comment`)：直行註解會降低代碼的視覺層級，分散閱讀焦點
- **對齊與視覺性**：註解在上方時，能清晰分隔邏輯段落，提升掃描效率
- **IDE 支援**：將註解置於上方，更能幫助編輯器正確識別與該代碼相關的上下文


---

## 4. 靈活性原則 (Flexibility Principle)

在不違反上述規則的情況下，可保持原有的註解風格。對於既有代碼庫或特定邏輯區塊，如果已有清晰且一致的註解慣例，無需強制改寫。重點是確保：

- **邏輯清晰**：註解準確表達意圖
- **一致性**：同一文件或模組內保持同一風格
- **可維護性**：未來的開發者能快速理解

### 4.1 改善既有代碼的註解

當遇到需要優化的既有註解時，應同時改善邏輯清晰度和註解品質。以下是改善範例：

❌ **改善前**

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

✅ **改善後**

```typescript
/**
 * 檢查是否有共同詞性標籤
 * 注意：原始模式已不合需求，因為單一項目可能有多個詞性
 * TODO: 確認潛在 BUG 的有效性
 */
else if (m = (w1.p & w2.p))
{
    // 若包含名詞標籤，則標記為真
    if (m & POSTAG.D_N)
    {
        bool = true;
    }
}
```

**改善重點：**
- 文檔註解提供清晰的邏輯意圖
- 如果有必要則使用 TODO / FIXME 等追蹤標籤

---

## 5. 短註解 (Inline/Short Comments)

僅限於兩行（含）以內的簡單邏輯說明或暫時性標記。否則請使用多行區塊註解格式。

- **格式：** `//`
- **適用場景：** 簡單的邏輯分段、TODO 標記、臨時排除代碼。

範例：

```js
// 如果快取存在則直接回傳
if (cache.has(key)) return cache.get(key);

// TODO: 優化大數據量下的迴圈效能
processData(data);
```

---

## 詳細註解內容參考 (Detailed Comment Content)

有關雙語註解的範例、JSDoc 模板與具體實作細節，請參閱技能文檔：

- [skills/analyze-code-commenter/SKILL.md](../skills/analyze-code-commenter/SKILL.md)

此處包含雙語註解模板、inline/block 使用準則及多種範例，作為撰寫與自動化註解的參考。

---

## 額外建議

- 對公開/內部 API、library 函式與複雜演算法務必補上完整範例或使用情境。
