---
name: test-snapshot-documentation
description: 利用測試快照來達到文件化的非常規使用方式。當用戶請求 (1) 使用快照進行文件化，(2) 將快照作為範例展示，(3) "snapshot 文件化"，(4) "快照測試文件"，(5) "測試快照作為文件"，(6) "為測試保留結果"，(7) "為測試增加說明" 時使用此技能。This skill guides the unconventional use of test snapshots for documentation purposes, transforming test snapshots into living documentation that showcases behavior, examples, and API usage.
---

# Snapshot Documentation

此技能指導如何將測試快照（Snapshot）轉化為文件化的非常規使用方式，讓快照不僅是測試驗證工具，更是行為展示、API 範例和教學材料。

## 核心概念

### 與傳統斷言的比較

| 面向 | 傳統斷言 | 文件化快照 |
|------|---------|-----------|
| 主要目標 | 驗證正確性 | 行為展示 + 驗證 |
| 可讀性 | 取決於測試名稱 | 快照本身即文件 |
| 維護成本 | 低 | 中（需更新說明） |
| 適用場景 | 單元測試 | API 範例、教學 |

---

## 快照物件結構

### 最小結構

```typescript
expect({
    explain: '說明 / 描述 / 邏輯解釋',  // 必填（標題/描述/邏輯/複合式）
    result: { /* ... */ },             // 必填（始終保留）
}).toMatchSnapshot()
```

### 完整結構

```typescript
expect({
    explain: '說明 / Description',     // 必填
    tags?: 'tag1, tag2, tag3',         // 可選
    result: { /* ... */ },             // 必填
    input?: { target, source },       // 可選
}).toMatchSnapshot()
```

---

## 欄位規範

### 2.1 explain - 測試說明

- **必填**：每個快照至少需要 `explain`
- **用途**：幫助快速理解快照的內容與邏輯
- **類型**：
  - **標題式**：簡短說明測試目的
  - **描述式**：描述預期行為
  - **邏輯式**：解釋合併邏輯
  - **複合式**：結合以上，以快速理解為主
- **格式**：雙語（繁中 + 英文）或純英文
- **長度**：可以是**單行**或**多行**文字，視說明需求而定
- **擴展用途**：可以補充說明 `result` 中各欄位的來源或意義，幫助理解輸出結構

```typescript
// 短句範例
explain: '✅ 新增鍵 / Add keys'

// 複雜範例：說明 result 中各欄位的來源
explain: '✅ 多個物件合併（不同類型）：所有屬性被合併

result 中
- first: 來自第一個物件
- second: 來自第二個物件
- third: 來自第三個物件
- fourth: 來自第四個物件'
```

### 2.2 tags - 分類標籤

- **格式**：以 `, ` （逗號 + 空格）分隔的多重標籤
- **語法**：字串形式 `tag1, tag2, tag3`（非陣列）
- **用途**：人類可讀的分類識別
- **使用時機**：只有當測試項目有特別意義或需要被檢索時，才需要加上 `tags`

```typescript
// ✅ 正確
tags: 'basic, root-level, keys'

// ❌ 錯誤（陣列形式）
tags: ['basic', 'root-level']
```

### 2.3 input - 輸入資料

- **來源**：來自函式參數，不一定是 `target` / `source`
- **結構**：根據函式簽章決定（如 `{ array: [...] }`、`{ options: {} }`）
- **判定邏輯**：

```
input 複雜度判定
    │
    ▼
屬性數量 ≤ 3 且 無深度嵌套？
    │
    ├─ 是 → 保留 input
    │
    └─ 否 → 移除 input（依賴 result 推導）
```

```typescript
// ✅ 簡單案例：保留 input（來自函式參數）
input: { array: [1, 2, 3] }
input: { target: { a: 1 }, source: { b: 2 } }

// ✅ 複雜案例：移除 input
// （依賴快照差異顯示輸入輸出變化）
```

### 2.4 result - 輸出結果

- **必填**：始終保留
- **用途**：斷言驗證 + 行為展示

### 2.5 多結果命名規範（解決快照排序問題）

當需要在同一個快照檔案中展示多個結果時（例如比較不同函式的輸出），建議使用 `result{FeatureName}` 的命名模式，而非 `{FeatureName}Result`。

**原因**：Jest 快照檔案通常按照描述（describe）名稱的字母順序排序，使用 `result` 前綴可以將所有結果集中在一起，方便查閱與維護。

| 模式 | 範例 | 優勢 |
|------|------|------|
| **推薦** | `resultDeepmerge`, `resultLodash` | 快照中所有結果會依 feature 名稱排序，方便管理 |
| **不推薦** | `deepmergeResult`, `lodashResult` | 結果會散落在各字母區塊，難以快速瀏覽 |

```typescript
// ✅ 正確：使用 result 前綴
it('should compare merge results', () => {
    const deepmergeResult = mergeDeep(target, source);
    const lodashResult = _.merge(target, source);

    expect({
        explain: '比較 deepmerge 與 lodash merge 的行為差異',
        resultDeepmerge: deepmergeResult,
        resultLodash: lodashResult,
    }).toMatchSnapshot();
});
```

```typescript
// ❌ 錯誤：使用 Result 後綴（快照會散開）
expect({
    deepmergeResult: deepmergeResult,
    lodashResult: lodashResult,
}).toMatchSnapshot();
```

**補充說明**：
- 這裡的 `result` 是**固定的關鍵字 prefix**，表示這是一個輸出結果
- `{FeatureName}` 是具體的功能或函式名稱（使用 PascalCase 或 camelCase）
- 此規範僅適用於需要在快照中呈現多個結果的場景

---

## tags 命名慣例

### 常用標籤分類

| 類別 | 標籤範例 | 說明 |
|------|---------|------|
| **測試類型** | `basic`, `advanced`, `edge-case` | 測試複雜度 |
| **資料結構** | `object`, `array`, `nested`, `deep` | 輸入資料類型 |
| **功能特性** | `clone`, `merge`, `replace` | 合併行為 |
| **應用場景** | `config`, `preferences`, `state` | 實際應用 |
| **對照組** | `good-example`, `bad-example` | 展示正確/錯誤用法 |

### 命名格式

- 使用 **小寫字母**
- 使用 `-` 或 `_` 分隔詞彙：`nested-object`, `deep_merge`
- 避免中文標籤

```typescript
// ✅ 正確
tags: 'basic, nested-object, merge'

// ❌ 錯誤
tags: '基礎, 巢狀, 合併'
```

---

## 範例

### 簡單案例

```typescript
it('should add keys to empty target', () => {
    const target = {};
    const source = { key1: 'value1', key2: 'value2' };

    const result = merge(target, source);

    expect({
        explain: '✅ 新增至空物件 / Add to empty object',
        tags: 'basic, root-level, keys',
        input: { target, source },  // 來自函式參數
        result,
    }).toMatchSnapshot();
});
```

### 函式參數案例

```typescript
it('should merge array of objects', () => {
    const input = [{ a: 1 }, { b: 2 }];
    const result = deepmergeAll(input);

    expect({
        explain: '合併物件陣列',
        input: { input },  // 參數名稱為 input
        result,
    }).toMatchSnapshot();
});
```

### 複雜案例

```typescript
it('should deeply merge nested objects', () => {
    const target = {
        user: {
            name: 'Alice',
            settings: { theme: 'dark' }
        }
    };
    const source = {
        user: {
            age: 30,
            settings: { language: 'en' }
        }
    };

    const result = merge(target, source);

    expect({
        explain: 'Deep nested merge preserves nested structure',
        tags: 'nested, deep, object-merge',
        result,
    }).toMatchSnapshot();
});
```

---

## 使用時機

### 適合使用文件化快照的場景

1. **API 範例展示** - 需要展示函式輸入輸出的各種情況
2. **教學材料** - 行為導向的說明文件
3. **回歸測試** - 同時記錄預期行為供日後參考
4. **複雜輸出驗證** - 大型物件結構的比對與展示

### 不適合的場景

1. **簡單斷言** - 單一值或簡單布林驗證
2. **效能測試** - 需要數值精確比較
3. **隨機輸出** - 每次執行結果不同

---

## 相關資源

- [Jest Snapshot Testing](https://jestjs.io/docs/snapshot-testing)
- [測試檔案最佳實踐規範](../../rules/test-file-best-practices.md)
- [測試框架 API 重構範例](../../rules/test-file-best-practices/examples.md)
