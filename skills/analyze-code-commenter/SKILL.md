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
    *   **語言要求**：
        *   同時包含 **繁體中文 (Traditional Chinese, zh-TW)** 與 **英文 (English)**。
        *   繁體中文在前，英文在後，或視版面配置清晰呈現。
    *   **內容要求**：
        *   解釋「為什麼這樣做」 (Why) 而非僅解釋「做了什麼」 (What)。
        *   說明參數、返回值、可能的副作用或異常。
4.  **應用變更**：
    *   使用 `multi_replace_file_content` 或 `replace_file_content` 工具將註解插入代碼中。
    *   **絕對禁止** 更改任何現有的程式碼 formatting（縮排、換行、空格等），僅在空白處或行間插入註解。
    *   **絕對禁止** 刪除舊有已被註解不使用的代碼（如 `// old code...` 或 `/* ... */` 包裹的廢棄代碼）。
    *   對於重點名詞、特殊名詞或可能產生歧義的用語，應在繁體中文後標註英文對照，例如：「快取 (Cache)」、「佇列 (Queue)」、「遞迴 (Recursion)」。

## 範例

### Before

```typescript
protected _calculateWeight(value: number): number
{
    if (value < 0) return 0;
    return value * 1.5;
}
```

### After

```typescript
    /**
     * 計算權重
     * Calculate the weight
     *
     * 如果輸入值小於 0，則返回 0；否則返回值的 1.5 倍。
     * If the input value is less than 0, return 0; otherwise, return 1.5 times the value.
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

## 注意事項

- 保持原有代碼風格一致性。
- 確保繁體中文使用台灣慣用語彙。
- 若檔案過大，請分段處理。
