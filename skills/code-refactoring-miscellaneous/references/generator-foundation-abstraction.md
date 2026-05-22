---
title: Generator 底層抽象重構模式 - 完整案例分析
description: 將重複的 Generator 邏輯提取為底層抽象，實現職責分離和代碼復用的詳細案例分析
tags:
  - documentation/references
  - refactoring
  - generator
  - abstraction
---

# Generator 底層抽象重構模式

## 案例背景

在 Ant Design CSS Variable 工具庫中，存在多個 Generator 函數用於處理 Token 物件的轉換。這些函數都有相似的深度遍歷邏輯，導致代碼重複和維護困難。

## 重構前問題分析

### 代碼結構問題

```typescript
// 重構前：每個 Generator 都有相同的遍歷邏輯
function* convertTokenKeysToCSSVarGenerator(tokenObj, options) {
    const { deep = false } = options || {};
    
    function* processObject(obj) {
        for (const key of Object.keys(obj)) {
            const cssVarKey = antdTokenToCSSVar(key);
            const value = obj[key];
            
            // ❌ 重複的深度遍歷邏輯
            if (deep && value && typeof value === 'object' && !Array.isArray(value)) {
                yield* processObject(value);
            } else {
                yield [cssVarKey, value];
            }
        }
    }
    
    yield* processObject(tokenObj);
}

function* convertTokenValuesToCSSVarGenerator(tokenObj, options) {
    const { deep = false } = options || {};
    
    function* processObject(obj) {
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            
            // ❌ 相同的深度遍歷邏輯
            if (deep && value && typeof value === 'object' && !Array.isArray(value)) {
                yield* processObject(value);
            } else {
                // 不同的轉換邏輯
                if (typeof value === 'string') {
                    const cssVarValue = antdTokenToCSSVar(value);
                    yield [key, cssVarValue];
                } else {
                    yield [key, value];
                }
            }
        }
    }
    
    yield* processObject(tokenObj);
}
```

### 問題識別

1. **代碼重複**：每個 Generator 都有相同的 `processObject` 邏輯
2. **維護困難**：修改遍歷邏輯需要同步更新多個函數
3. **職責混合**：遍歷邏輯與轉換邏輯耦合在一起
4. **擴展性差**：新增轉換函數需要重寫遍歷邏輯

## 重構策略：底層抽象模式

### 核心思想

將遍歷邏輯提取為獨立的底層 Generator，其他函數基於此進行組合。

### 重構步驟

#### Step 1: 創建底層抽象

```typescript
/**
 * 底層 Generator：遍歷 tokenObj 並逐步返回原始的 [key, value] 對
 * 這是所有 Generator 轉換函數的底層基礎，專門處理物件的深度遍歷
 */
function* walkTokenObjectGenerator(obj, options) {
    const { deep = false } = options || {};
    
    for (const key of Object.keys(obj)) {
        const value = obj[key];
        
        // 深度遍歷邏輯統一處理
        if (deep && value && typeof value === 'object' && !Array.isArray(value)) {
            yield* walkTokenObjectGenerator(value, { deep });
        } else {
            yield [key, value];
        }
    }
}
```

#### Step 2: 重構現有函數

```typescript
// 重構後：基於底層抽象的組合模式
function* convertTokenKeysToCSSVarGenerator(tokenObj, options) {
    for (const [key, value] of walkTokenObjectGenerator(tokenObj, options)) {
        // 專注於轉換邏輯
        const cssVarKey = antdTokenToCSSVar(key);
        yield [cssVarKey, value];
    }
}

function* convertTokenValuesToCSSVarGenerator(tokenObj, options) {
    for (const [key, value] of walkTokenObjectGenerator(tokenObj, options)) {
        // 專注於轉換邏輯
        if (typeof value === 'string') {
            const cssVarValue = antdTokenToCSSVar(value);
            yield [key, cssVarValue];
        } else {
            yield [key, value];
        }
    }
}
```

## 重構收益分析

### 代碼質量提升

| 指標 | 重構前 | 重構後 | 改進 |
|------|--------|--------|------|
| **代碼行數** | 每個函數 ~20 行 | 底層 15 行 + 各函數 ~8 行 | 減少 40% |
| **重複邏輯** | 4 處相同遍歷邏輯 | 1 處統一處理 | 消除重複 |
| **圈複雜度** | 每個函數都有嵌套邏輯 | 底層處理複雜度，上層簡化 | 降低複雜度 |

### 維護性改善

1. **單一修改點**：遍歷邏輯修改只需更新底層函數
2. **職責清晰**：遍歷與轉換邏輯完全分離
3. **測試簡化**：可獨立測試遍歷邏輯和轉換邏輯

### 擴展性提升

```typescript
// 新增轉換函數變得非常簡單
function* convertTokenKeysToUpperCaseGenerator(tokenObj, options) {
    for (const [key, value] of walkTokenObjectGenerator(tokenObj, options)) {
        yield [key.toUpperCase(), value];
    }
}

function* filterStringValuesGenerator(tokenObj, options) {
    for (const [key, value] of walkTokenObjectGenerator(tokenObj, options)) {
        if (typeof value === 'string') {
            yield [key, value];
        }
    }
}
```

## 設計模式分析

### 1. 底層抽象模式 (Foundation Abstraction)

**特徵**：
- 創建專門處理基礎操作的底層函數
- 其他函數基於底層抽象進行組合
- 實現邏輯復用和職責分離

**優勢**：
- 減少代碼重複
- 提高可維護性
- 便於單元測試

### 2. Generator 組合模式 (Generator Composition)

**特徵**：
- 使用 `yield*` 進行 Generator 委托
- 實現數據流的管道式處理
- 保持懶加載和記憶體效率

**技術細節**：
```typescript
// yield* 將控制權委托給另一個 Generator
for (const [key, value] of walkTokenObjectGenerator(tokenObj, options)) {
    // 處理邏輯
}

// 等價於
yield* walkTokenObjectGenerator(tokenObj, options);
```

### 3. 職責分離原則 (Separation of Concerns)

**遍歷職責**：
- 處理物件的深度遍歷
- 管理選項配置
- 控制迭代流程

**轉換職責**：
- 專注於數據轉換邏輯
- 處理類型檢查
- 生成最終結果

## 實際應用場景

### 1. 數據處理管道

```typescript
// 可組合的數據處理管道
function* processDataPipeline(data, options) {
    // 過濾
    for (const [key, value] of filterValidData(data, options)) {
        // 轉換
        const transformed = transformData(key, value);
        // 驗證
        if (validateData(transformed)) {
            yield transformed;
        }
    }
}
```

### 2. 樹形結構遍歷

```typescript
// 通用的樹形結構遍歷
function* walkTree(node, options) {
    const { deep = true } = options;
    
    yield node;
    
    if (deep && node.children) {
        for (const child of node.children) {
            yield* walkTree(child, { deep });
        }
    }
}
```

### 3. 異步數據流

```typescript
// 異步數據流處理
async function* walkAsyncData(data, options) {
    for (const item of data) {
        const processed = await processItem(item);
        yield processed;
    }
}
```

## 最佳實踐建議

### 1. 識別共同模式

尋找多個函數中的重複邏輯模式：
- 相似的遍歷邏輯
- 重複的錯誤處理
- 相同的配置處理

### 2. 設計底層接口

底層抽象應該：
- 提供基礎功能
- 支持必要的配置選項
- 保持接口簡潔

### 3. 實現組合模式

使用 `yield*` 進行組合：
- 保持懶加載特性
- 維持記憶體效率
- 支持鏈式操作

### 4. 測試策略

- 獨立測試底層抽象
- 測試組合邏輯
- 集成測試整體流程

## 總結

Generator 底層抽象重構模式通過提取共同邏輯、創建底層抽象、實現組合模式，有效解決了代碼重複和維護困難的問題。這種模式特別適用於：

- 有相似處理邏輯的多個 Generator 函數
- 需要懶加載和記憶體效率的場景
- 可組合的數據處理管道

通過這種重構，代碼變得更加模組化、可維護和可擴展，為未來的功能增長奠定了良好的基礎。

---

## 相關資源

- [Main Skill Documentation](../../SKILL.zh.md) - 核心重構指南
- [JavaScript Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) - MDN 文檔
- [Design Patterns](https://refactoring.com/design-patterns.html) - 重構模式
