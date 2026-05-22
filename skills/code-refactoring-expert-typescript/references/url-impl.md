---
tags:
  - documentation/references
  - url
  - refactoring
  - code-logic
---

# 💡 代碼邏輯重構與實作時參考指南 (Code Logic Refactoring Guide)

## 🎯 目標：從靜態模式分派轉向流程抽象化
本指南基於分析複雜業務邏輯函數（如 URL 生成器）的經驗，旨在指導開發者如何設計出**高維護性 (High Maintainability)**、**低重複度 (Low Redundancy)** 和 **高擴展性 (High Scalability)** 的程式碼。

---

## 🧠 核心設計原則與範例分析

### 1. DRY 原則至上 (Don't Repeat Yourself)
*   **問題：** 當同一段邏輯（如 `encodeURIComponent`、基礎字串拼接）在多個分支中重複出現時，代碼的維護成本會成比例增加。
*   **✅ 好範例 (Code B 模式): 抽象化細節**
    ```javascript
    // 1. 輔助函數集中處理編碼和格式化
    const formatCoord = (coord) => `${coord.lat},${coord.lng}`;
    const buildUrlQuery = (params) => `?q=${encodeURIComponent(params)}`;

    function generateMapsUrl({ coord, name }) {
        // 2. 在調用層級處理邏輯，避免在每個分支中重複編碼
        if (name) return `...${buildUrlQuery(name + ' data')}`;
        return `...${formatCoord(coord)}`; // 基礎操作集中化
    }
    ```
*   **❌ 壞範例 (Code A 模式): 重複硬編碼**
    ```javascript
    // 座標和編碼邏輯被重複地嵌入到每一個 case 中
    case EnumGoogleMapsMode.WebCoordName:
        return coord && name
            ? `...${coord.lat},${coord.lng}+(${encodeURIComponent(name)})` // 重複1
            : '';
    // ... 接下來的 WebCoordAddress, WebAddressName 等所有 case 都會重複編碼和拼接邏輯
    ```

### 2. 流程累積優於靜態分派 (Flow over Static Mapping)
*   **問題：** 過度依賴巨大的 `switch/case` 或深層巢狀的三元運算式，造成邏輯的「深度嵌套」和「線形膨脹」。當需求增加新組合時，必須修改整個龐大的結構。
*   **✅ 好範例 (Code B 模式): 線性流程累積狀態**
    ```javascript
    function generateMapsUrl(options) {
        let query = ''; // 初始化基線狀態

        // Step 1: 確立基礎（例如：從座標開始）
        if (options.coord) {
            query = `${options.coord.lat},${options.coord.lng}`;
        } else if (options.address) {
            query = options.address; // 地址作為基線
        }

        // Step 2: 逐步增補狀態（修飾語）
        if (options.name && query) {
            query += `+(${encodeURIComponent(options.name)})`;
        } else if (options.name && !query) {
             query = encodeURIComponent(options.name); // 如果只有名稱，則設定為基線
        }

        // Step 3: 最後的清理和返回
        return buildWebSearchUrl(query);
    }
    ```
*   **❌ 壞範例 (Code A 模式): 深層巢狀與分派邏輯混雜**
    ```javascript
    case EnumGoogleMapsMode.WebCoordName:
        // 閱讀者需要解構這一長串三元運算式才能理解流程
        return coord && name
            ? `...${coord.lat},${coord.lng}+(${encodeURIComponent(name)})`
            : name ? `...?(${encodeURIComponent(name)})` : ''; // 嵌套過深，邏輯分支複雜
    ```

### 3. 關注意圖而非實現細節 (Focus on Intent)
*   **原則：** 代碼應該清晰地表達「目的」，而不是只是機械性地執行一系列操作。
*   **💡 指導:** 如果程式碼讀起來像是一串從左到右的運算式，它可能是在描述「如何做」，而非在陳述「要做什麼」。

---

## 🛠️ 重構實作步驟指南（Checklist）

在開始重構一個複雜的邏輯函數時，請按照以下順序思考和執行：

| 階段 | 行為/目標 | 如何實現 (Refactoring Pattern) | 檢查點 (Code Smell Check) |
| :--- | :--- | :--- | :--- |
| **1. 隔離基礎** | 識別所有重複出現的、通用的操作（如格式化、編碼）。 | 將其抽取為獨立的 `const` 或 `function`。例如：`formatCoordinates(coord)`，`encodeParam(param)`。 | 是否存在多於一次的 URL 編碼調用？ (若有，立刻抽離) |
| **2. 確立基線** | 確定所有輸入參數組合中，「最基本」或「必須」存在的那個狀態是什麼（Base State）。 | 在函數開頭，根據必要條件初始化核心變數（例如：`let query = '';`）。 | 是否每個模式都從零開始重新計算基礎查詢？ (若有，則需重構) |
| **3. 流程累積** | 處理所有變化和增補的邏輯。避免巨型 `switch` 或深層嵌套。 | 使用清晰、線性的 `if / else if` 結構來決定如何修改或增補「基線狀態」。 | 是否存在多個層級以上嵌套的三元運算式？ (若有，請展開為 `if/else`) |
| **4. 抽象化決策** | 當邏輯涉及複雜的參數優先級時，不要寫死在每個模式中。 | 設計一個獨立的、可調用的「策略函數」（Strategy Function）來決定哪個參數應該被使用。 | 是否將複雜的判斷邏輯混在了 URL 生成的細節中？ (若有，則應分離出決策層) |
