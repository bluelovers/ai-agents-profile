---
title: 外部 API 類型安全封裝模式
description: 將鬆散類型的外部 API（如 VS Code Memento）封裝為嚴格類型的內部接口，實現編譯期類型安全與運行時數據一致性。
tags:
  - documentation/references
  - type-safety
  - encapsulation
  - API
  - refactoring
---

# 外部 API 類型安全封裝模式

## 概述

當使用第三方庫或框架提供的外部 API 時，常常面臨**類型定義過於寬鬆**的問題。這些 API 通常使用 `string` 鍵和 `any` 值來提供最大靈活性，但這也意味著失去了 TypeScript 的類型保護。

本模式展示如何將鬆散類型的外部 API **封裝為嚴格類型的內部接口**，在保持外部 API 靈活性的同時，為應用程式提供編譯期類型安全。

## 問題情境

### 外部 API 的類型問題

以 VS Code Extension API 的 `Memento` 接口為例：

```typescript
/**
 * A memento represents a storage utility. It can store and retrieve values.
 */
export interface Memento {
    /**
     * Returns the stored keys.
     */
    keys(): readonly string[];

    /**
     * Return a value.
     * @param key A string.
     * @returns The stored value or `undefined`.
     */
    get<T>(key: string): T | undefined;

    /**
     * Return a value.
     * @param key A string.
     * @param defaultValue A value that should be returned when there is no value.
     * @returns The stored value or the defaultValue.
     */
    get<T>(key: string, defaultValue: T): T;

    /**
     * Store a value. The value must be JSON-stringifyable.
     * @param key A string.
     * @param value A value. MUST not contain cyclic references.
     */
    update(key: string, value: any): Thenable<void>;
}
```

**類型安全風險：**
- `key: string` - 任何字串都可作為鍵，無法防止拼寫錯誤
- `value: any` - 無類型檢查，可能存儲錯誤類型的數據
- 調用時無法知道某個鍵對應什麼類型的值
- 重構時無法追蹤哪些鍵被使用

### ❌ 不良實踐：直接使用外部 API

```typescript
// ❌ 直接使用外部 API - 無類型保護
const history = context.globalState.get('serchHistory'); // 拼寫錯誤！編譯器無法發現
context.globalState.update('selectedIDEs', 'string');   // ❌ 錯誤類型！應該是 number[]

// ❌ 沒有智能提示，不知道有哪些可用的鍵
// ❌ 不知道每個鍵對應什麼類型的值
```

## 解決方案：類型安全封裝層

### 核心概念

1. **定義鍵的枚舉 (Enum)**：將所有合法的鍵集中定義為枚舉
2. **定義鍵值對映射接口**：為每個鍵明確指定對應的值的類型
3. **創建封裝類**：將外部 API 包裝在類型安全的接口後面

### 實作步驟

#### 步驟 1：定義鍵枚舉

```typescript
/**
 * 全局狀態鍵名枚舉
 * Global state key name enum
 */
export const enum EnumGlobalStateName
{
    /** 搜尋歷史記錄 / Search history */
    searchHistory = 'searchHistory',
    /** 已選擇的 IDE / Selected IDEs */
    selectedIDEs = 'selectedIDEs',
    /** 使用者偏好設定 / User preferences */
    userPreferences = 'userPreferences',
}
```

#### 步驟 2：定義鍵值類型映射

```typescript
/**
 * 搜尋歷史記錄狀態接口
 * Search history state interface
 */
export interface IGlobalStateSearchHistory
{
    key: EnumGlobalStateName.searchHistory;
    value: string[];
}

/**
 * 已選 IDE 狀態接口
 * Selected IDEs state interface
 */
export interface IGlobalStateSelectedIDEs
{
    key: EnumGlobalStateName.selectedIDEs;
    value: number[];
}

/**
 * 使用者偏好設定狀態接口
 * User preferences state interface
 */
export interface IGlobalStateUserPreferences
{
    key: EnumGlobalStateName.userPreferences;
    value: {
        theme: 'light' | 'dark';
        autoSave: boolean;
    };
}

/**
 * 所有全局狀態類型的聯合類型
 * Union type of all global state types
 */
export type IGlobalStateAll =
    | IGlobalStateSearchHistory
    | IGlobalStateSelectedIDEs
    | IGlobalStateUserPreferences;
```

#### 步驟 3：創建類型安全封裝類

```typescript
/**
 * VS Code Extension Context GlobalState 的類型安全封裝
 * Type-safe wrapper for VS Code Extension Context GlobalState
 */
export class VscodeExtensionContextGlobalState
{
    /**
     * 構造函數
     * @param globalState - VS Code Memento 實例
     */
    constructor(protected globalState: Memento)
    {
        // protected 允許子類別訪問，適合內部繼承場景
    }

    /**
     * 獲取指定鍵的值
     * Get value by key with type safety
     *
     * @param key - 狀態鍵名（EnumGlobalStateName 枚舉值）
     * @param defaultValue - 默認值（可選）
     * @returns 存儲的值或默認值/undefined
     */
    get<K extends EnumGlobalStateName, T extends Extract<IGlobalStateAll, { key: K }>>(
        key: K,
        defaultValue?: T["value"]
    ): T["value"] | undefined
    {
        return this.globalState.get(key, defaultValue);
    }

    /**
     * 更新指定鍵的值
     * Update value by key with type safety
     *
     * @param key - 狀態鍵名（EnumGlobalStateName 枚舉值）
     * @param value - 要存儲的值（類型由鍵決定）
     * @returns Thenable<void>
     */
    update<K extends EnumGlobalStateName, T extends Extract<IGlobalStateAll, { key: K }>>(
        key: K,
        value: T["value"]
    ): Thenable<void>
    {
        return this.globalState.update(key, value);
    }
}
```

### 類型技巧解析

#### `Extract<IGlobalStateAll, { key: K }>`

這個 TypeScript 工具類型用於從聯合類型中提取匹配的成員：

```typescript
// 當 K = EnumGlobalStateName.searchHistory 時：
// Extract<IGlobalStateAll, { key: EnumGlobalStateName.searchHistory }>
// 結果為：IGlobalStateSearchHistory

// 因此 T["value"] 會推導為：
// IGlobalStateSearchHistory["value"] = string[]
```

這實現了**鍵到值的類型映射**，調用時自動推導正確的類型。

## 使用範例

### ✅ 類型安全的使用方式

```typescript
// ✅ 創建封裝實例
const state = new VscodeExtensionContextGlobalState(context.globalState);

// ✅ 鍵名有智能提示和編譯檢查
const history = state.get(EnumGlobalStateName.searchHistory);
//    ^? 類型推導為 string[] | undefined

// ✅ 鍵名錯誤會立即報錯
const bad = state.get('serchHistory'); // ❌ 錯誤：類型不匹配

// ✅ 值類型有編譯檢查
state.update(EnumGlobalStateName.selectedIDEs, [1, 2, 3]);        // ✅ 正確：number[]
state.update(EnumGlobalStateName.selectedIDEs, 'not an array');   // ❌ 錯誤：類型不匹配

// ✅ 默認值類型也會被檢查
state.get(EnumGlobalStateName.searchHistory, ['default']);  // ✅ 正確：string[]
state.get(EnumGlobalStateName.searchHistory, 123);          // ❌ 錯誤：類型不匹配
```

## 架構優勢

| 優勢 | 說明 |
|------|------|
| **編譯期類型安全** | 鍵名和值類型錯誤在編譯階段即可發現 |
| **智能提示** | IDE 提供鍵名自動完成和值類型提示 |
| **可重構性** | 重命名 Enum 值可通過 IDE 全局重構 |
| **單一事實來源** | 所有鍵和類型定義集中管理 |
| **向後兼容** | 底層外部 API 變更時，只需修改封裝層 |
| **可測試性** | 可為封裝類創建 Mock 實現進行單元測試 |

## 擴展模式

### 添加新的狀態鍵

```typescript
// 1. 在 Enum 中添加新鍵
export const enum EnumGlobalStateName
{
    // ... 現有鍵
    /** 最近打開的文件 / Recently opened files */
    recentFiles = 'recentFiles',
}

// 2. 定義對應的接口
export interface IGlobalStateRecentFiles
{
    key: EnumGlobalStateName.recentFiles;
    value: { path: string; timestamp: number }[];
}

// 3. 添加到聯合類型
export type IGlobalStateAll =
    | IGlobalStateSearchHistory
    | IGlobalStateSelectedIDEs
    | IGlobalStateUserPreferences
    | IGlobalStateRecentFiles;  // 添加新接口

// 封裝類無需修改，自動獲得類型支持！
```

### 與其他模式結合

可與 **DOM Selector Enum Pattern** 結合使用：

```typescript
// 將狀態鍵與 DOM 元素 ID 統一管理
export const enum EnumGlobalStateName
{
    searchHistory = EnumWebviewElemId.searchHistory,  // 復用相同的識別符
}
```

## 進階用法：抽象類整合

在大型專案中，通常需要將 GlobalState 封裝整合到多個類別中。以下提供兩種抽象類模式，簡化整合流程：

### 模式一：手動初始化

適合需要在構造函數中傳入已配置好的 `VscodeExtensionContextGlobalState` 實例的場景。

```typescript
/**
 * 手動初始化 VscodeExtensionContextGlobalState
 * 子類別需自行在構造函數中設置 globalState
 */
export abstract class AbstractClassWithGlobalState
{
    protected globalState!: VscodeExtensionContextGlobalState;
}
```

**使用範例：**

```typescript
export class MyService extends AbstractClassWithGlobalState
{
    constructor(globalState: VscodeExtensionContextGlobalState)
    {
        super();
        this.globalState = globalState;
    }

    async getSearchHistory(): Promise<string[]>
    {
        return this.globalState.get(EnumGlobalStateName.searchHistory) ?? [];
    }
}
```

### 模式二：自動由 ExtensionContext 初始化（推薦）

適合直接持有 `ExtensionContext` 的類別，使用**懶加載 (Lazy Loading)** 模式自動創建封裝實例。

```typescript
import { ExtensionContext } from 'vscode';

/**
 * 自動由 ExtensionContext 初始化 VscodeExtensionContextGlobalState
 * 透過 getter 實現懶加載，第一次訪問時才創建實例
 */
export abstract class AbstractClassWithContextGlobalState
{
    protected context!: ExtensionContext;
    #globalState!: VscodeExtensionContextGlobalState;

    protected get globalState(): VscodeExtensionContextGlobalState
    {
        if (!this.#globalState)
        {
            this.#globalState = new VscodeExtensionContextGlobalState(this.context.globalState);
        }

        return this.#globalState;
    }
}
```

**使用範例：**

```typescript
export class MyController extends AbstractClassWithContextGlobalState
{
    constructor(context: ExtensionContext)
    {
        super();
        this.context = context;
    }

    async saveSelectedIDEs(ides: number[]): Promise<void>
    {
        // 第一次調用時自動創建封裝實例
        await this.globalState.update(EnumGlobalStateName.selectedIDEs, ides);
    }
}
```

### 工廠函數

提供便利的工廠函數，根據不同場景創建實例：

```typescript
/**
 * 從 ExtensionContext 創建 GlobalState 封裝實例
 * @param context - VS Code ExtensionContext
 * @returns VscodeExtensionContextGlobalState 實例
 */
export function newVscodeExtensionContextGlobalStateByContext(context: ExtensionContext)
{
    return new VscodeExtensionContextGlobalState(context.globalState);
}

/**
 * 從 Memento（GlobalState）創建封裝實例
 * @param globalState - ExtensionContext 的 globalState 屬性
 * @returns VscodeExtensionContextGlobalState 實例
 */
export function newVscodeExtensionContextGlobalState(globalState: ExtensionContext["globalState"])
{
    return new VscodeExtensionContextGlobalState(globalState);
}
```

**使用範例：**

```typescript
// 方式一：從 ExtensionContext 創建
const state1 = newVscodeExtensionContextGlobalStateByContext(context);

// 方式二：直接從 globalState 創建
const state2 = newVscodeExtensionContextGlobalState(context.globalState);

// 兩者等價，根據場景選擇更方便的方式
```

### 選擇指南

| 模式 | 適用場景 | 優勢 |
|------|----------|------|
| **手動初始化** | 需要與其他服務共享同一 GlobalState 實例 | 靈活控制實例來源，便於單元測試時注入 Mock |
| **自動初始化** | 類別直接持有 ExtensionContext | 簡化構造函數，懶加載減少啟動時資源消耗 |
| **工廠函數** | 需要快速創建實例的工具函數 | 簡潔的 API，適合函數式編程風格 |

## 適用場景

- **VS Code Extension 開發**：封裝 `globalState`、`workspaceState`
- **瀏覽器存儲 API**：封裝 `localStorage`、`sessionStorage`
- **數據庫客戶端**：為鍵值存儲（Redis 等）提供類型安全層
- **配置管理**：為 JSON 配置文件提供類型安全訪問
- **任何 `string` 鍵 + `any` 值的外部 API**

## 例外情況

以下情況**不需要此封裝**：

- 外部 API 已提供足夠嚴格的類型定義
- 臨時腳本或原型開發，不需要長期維護
- 鍵的數量極少（1-2 個）且類型簡單的情況

---

## 相關資源

- [TypeScript Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
- [TypeScript Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [VS Code Extension API - Memento](https://code.visualstudio.com/api/references/vscode-api#Memento)
