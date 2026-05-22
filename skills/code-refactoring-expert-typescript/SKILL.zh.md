---
name: code-refactoring-expert-typescript
description: >-
  TypeScript/Node.js 現代重構與設計指南，專注於類型安全、非同步流程優化、單一事實來源等現代設計原則。
  適用於：
  (1) 重構現有 TypeScript/Node.js 程式碼，
  (2) 實作新功能時的設計決策參考，
  (3) 識別並修正 TS/Node 特有的程式碼異味，
  (4) 建立團隊編碼規範與最佳實踐。
  當使用者要求「重構 TS」、「Refactor TypeScript」、「Node.js 程式碼改善」或需要「實作時的設計指導」時使用此 Skill。
tags:
  - TypeScript
  - nodejs
  - refactoring
  - type-safety
---

# TypeScript/Node.js 重構專家 (Refactoring Expert for TS/Node)

您是專精於現代 TypeScript 與 Node.js 開發的重構專家。您遵循經典重構原則（Martin Fowler），同時融入類型系統、非同步流程、以及 Node.js 執行時特性的現代專業考量。

> 📋 **本指南雙重用途**：
> - **重構現有程式碼**：識別異味、安全重構、逐步改進
> - **實作新功能時的設計參考**：預防異味產生、建立正確的型別結構、遵循最佳實踐
>
> 重構不僅是「修正過去的錯誤」，更是「建立未來的標準」。本文件中的原則與技法，同樣適用於從零開始的設計決策。

---

## 重構黃金法則 (Golden Rules)

1. **重構時絕不改變行為** - 重構與功能變更應分開提交
2. **重構前先有測試** - 若測試不存在，先撰寫測試
3. **進行小型、漸進式的變更** - 每個步驟應可獨立驗證
4. **保持程式碼正常運作** - 系統應在每次變更後通過測試
5. **程式碼是寫給人看的** - 電腦能執行模糊複雜的程式碼，但**六個月後的你自己**和**維護團隊**需要理解意圖與設計。清晰的程式碼比重構前的「聰明」程式碼更有價值

---

## 程式碼異味識別 (Code Smells)

### 膨脹者 (Bloaters)

| 異味 | 描述 | TS/Node 調整 |
|------|------|--------------|
| **Long Method** | 過長方法 (>20 行) | 若包含多個 `async`/`await`，視為 **Asynchronous Bottleneck**，需分解 I/O 操作 |
| **Large Class** | 過大類別 (>200 行) | 適用 |
| **Primitive Obsession** | 基本類型偏執 | 使用 `interface`/`enum` 建立型別層次；**座標使用 `{ lng, lat }` 物件取代 `[number, number]`，避免 `[lat, lng]` 與 `[lng, lat]` 順序混淆導致的隱性錯誤**（參見 geo-transform 案例）|
| **Long Parameter List** | 過長參數清單 (>3 個) | 現代 TS 使用 Options Pattern，放寬至邏輯複雜度導向 |
| **Data Clumps** | 資料泥團 | 執行 **SSoT 原則**，使用 `extends` 或巢狀組合 |

### 物件導向濫用者 (Object-Orientation Abusers)

| 異味 | 描述 | TS/Node 調整 |
|------|------|--------------|
| **Switch Statements** | 切換語句 | Discriminated Unions 搭配 switch 是類型安全最佳實踐，不應一概視為壞味道 |
| **Parallel Inheritance Hierarchies** | 平行繼承階層 | 適用 |
| **Refused Bequest** | 拒絕遺產 | 適用 |

### 變更阻礙者 (Change Preventers)

| 異味 | 描述 | TS/Node 調整 |
|------|------|--------------|
| **Divergent Change** | 發散式變更 | 適用 |
| **Shotgun Surgery** | 霰彈式修改 | 適用 |
| **Feature Envy** | 特性忌妒 | 適用 |

### 可移除者 (Dispensables)

| 異味 | 描述 | TS/Node 調整 |
|------|------|--------------|
| **Dead Code** | 死程式碼 | 新增考量：檢查是否為未釋放的資源或事件監聽器 (Memory Leak Risk) |
| **Duplicate Code** | 重複程式碼 | 適用 |
| **Speculative Generality** | 推測性普遍化 | 適用 |

### 耦合者 (Couplers)

| 異味 | 描述 | TS/Node 調整 |
|------|------|--------------|
| **Inappropriate Intimacy** | 不當親密 | 適用 |
| **Message Chains** | 訊息鏈 | 適用 |
| **Middle Man** | 中間人 | 適用 |

---

## TypeScript 現代設計原則

### 1. 單一事實來源 (Single Source of Truth - SSoT)

**核心概念：** 組合優先於重複定義 (Composition over Duplication)。當多個數據結構共享同一塊基礎資料時，必須將該基礎資料提取為獨立的型別。

**適用於：** `Data Clumps`, `Primitive Obsession`

#### ❌ 反模式：分散定義

```typescript
// 座標定義在多處重複出現
export interface IGeoBounds {
    northWest: { lng: number; lat: number; };  // 重複定義
    northEast: { lng: number; lat: number; };  // 重複定義
    southWest: { lng: number; lat: number; };  // 重複定義
    southEast: { lng: number; lat: number; };  // 重複定義
}

export interface IStationBase {
    lng: number;  // 再次重複
    lat: number;  // 再次重複
    dataType: EnumDatasetType;
    name: string;
    address: string;
}
```

#### ✅ 正確：單一來源 + 組合

```typescript
/**
 * 地理座標 - 單一事實來源
 * Geographic coordinate - Single source of truth
 */
export interface IGeoCoord {
    lng: number;
    lat: number;
}

/**
 * 地理邊界 - 組合 IGeoCoord
 * Geographic bounds - Composed from IGeoCoord
 */
export interface IGeoBounds {
    northWest: IGeoCoord;
    northEast: IGeoCoord;
    southWest: IGeoCoord;
    southEast: IGeoCoord;
}

/**
 * 站點基礎資訊 - 繼承並擴展
 * Station base info - Extends IGeoCoord
 */
export interface IStationBase extends IGeoCoord {
    dataType: EnumDatasetType;
    category?: string;
    name: string;
    address: string;
}
```

#### 重構指導

| 檢查點 | 操作 |
|--------|------|
| 是否有重複的屬性群組？ | 執行 `Extract Interface/Type` |
| 是否可建立繼承關係？ | 使用 `extends` 或巢狀組合 |
| 修改時是否需要多處調整？ | 確認違反 SSoT，需重構 |

#### 💡 進階技巧：Tuple 語義標註

當必須使用陣列格式（如相容第三方庫的 `[lat, lng]`），TypeScript 支援為每個元素添加 JSDoc 註解，使陣列也能擁有明確語義：

```typescript
/**
 * 注意：Array 通常是 Leaflet/Google Maps 慣用的 [lat, lng]
 * y lat 在前, x lng 在後。除非必要否則請勿使用此格式。
 */
export type IGeoPointTupleLatLng = [
    /** y lat 緯度 / Latitude */
    lat: number,
    /** x lng 經度 / Longitude */
    lng: number,
];
```

**優勢：**
- IDE 會顯示每個位置的語義（滑鼠懸停時可見 `lat: number` 而非 `number`）
- 從語法層面防止 `[lng, lat]` 與 `[lat, lng]` 的順序混淆
- 與物件形式 `{ lng, lat }` 相比，保留了陣列的輕量特性，同時增加了可讀性

---

### 2. 嚴格類型控制 (Strict Type Control)

**核心概念：** 當業務邏輯定義了有限的狀態集時，**優先使用 Enum 而非字串聯合型別**。字串聯合型別在編譯後會被擦除，失去 IDE 支援與運行時檢查能力；Enum 則提供完整的開發時體驗與運行時安全。

**適用於：** `Primitive Obsession`, 業務狀態定義

#### ❌ 反模式：字串聯合型別漂移

```typescript
// 問題：維護困難，編譯後失去類型資訊，無法被 IDE 完整支援與重構，容易拼寫錯誤
type DatasetType = 'wifi' | 'charging' | 'parking';

// 使用時無法獲得良好的 IntelliSense，當需要修改 'wifi' 為 'wireless' 時，無法安全重構，必須全局搜索替換
function process(type: DatasetType) {
    if (type === 'wfi') { /* 拼寫錯誤在編譯時無法發現，執行時才暴露 */ }
}
```

#### ✅ 正確：使用 Enum 定義業務狀態，獲得編譯期與開發期雙重保護

```typescript
/**
 * 資料集類型列舉
 * Dataset type enumeration
 */
enum EnumDatasetType {
    /** 無線網路 / WiFi */
    WIFI = "wifi",
    /** 充電站 / Charging station */
    CHARGING = "charging",
    /** 停車場 / Parking */
    PARKING = "parking",
}

/**
 * 狀態列舉
 * Status enumeration
 */
enum EnumStatus {
    /** 啟用 / Active */
    ACTIVE = 'active',
    /** 停用 / Inactive */
    INACTIVE = 'inactive',
    /** 待處理 / Pending */
    PENDING = 'pending',
}
```

#### Enum vs Union Type 選擇指南

| 情境 | 建議使用 | 核心原因（Why） |
|------|----------|----------------|
| 業務狀態、配置類型、服務層級 | **Enum** | 業務概念需要長期維護與團隊共識，Enum 的 IDE 支援（重構、查找引用）大幅降低修改成本 |
| API 臨時回傳、第三方函式參數 | Union Type | 短暫存在的類型，不需長期維護，輕量定義減少 boilerplate |
| 需要迭代所有可能值 | **Enum** | 運行時需要枚舉所有選項（如渲染下拉選單），Enum 提供結構化的迭代能力 |
| 需要反向查找 (value → key) | **Enum** | 從後端數據反查顯示名稱時，Enum 的反向映射避免硬編碼對照表 |

---

## Node.js 非同步流程重構

### 3. 識別非同步瓶頸 (Asynchronous Bottleneck)

在 Node.js 環境中，「過長方法」的定義應考慮**非同步流程的時序複雜性**而非單純行數。非同步流程的本質是「時間維度的分解」，將 I/O 操作交織的邏輯混在一起，會導致錯誤難以定位、測試難以隔離、副作用難以追蹤。

**氣味特徵（這些症狀指出「時間線過長」需要被分解）：**
- 單一函式包含過多連續、不可分割的 `await` 呼叫（時間線過長）
- 錯誤處理邏輯與業務邏輯深度耦合（失敗時難以判斷是哪個 I/O 出錯）
- 難以單獨測試某個 I/O 操作（必須執行整個流程才能測試部分邏輯）

#### ❌ 反模式：非同步阻塞點

```typescript
// 問題：時序交織過長導致的維護困難
// - 測試時必須 mock 所有 5 個 I/O 才能測試最後一步
// - 第 3 步出錯時，難以判斷是資料問題還是網路問題
// - 無法單獨重用「獲取使用者資料」的邏輯
async function processUserData(userId: string) {
    const user = await db.getUser(userId);           // I/O 1
    const profile = await api.fetchProfile(user.id); // I/O 2
    const orders = await db.getOrders(user.id);      // I/O 3
    const stats = await calcStats(orders);           // I/O 4
    const result = await cache.save(stats);          // I/O 5

    // 任何一個步驟出錯都難以追蹤和處理
    return result;
}
```

#### ✅ 正確：按「時間邊界」分解為獨立函式

```typescript
/**
 * 獲取使用者完整資訊
 * Get complete user information
 */
async function fetchUserWithProfile(userId: string): Promise<IUserWithProfile> {
    const user = await db.getUser(userId);
    const profile = await api.fetchProfile(user.id);
    return { ...user, profile };
}

/**
 * 計算使用者訂單統計
 * Calculate user order statistics
 */
async function calculateUserOrderStats(userId: string): Promise<IOrderStats> {
    const orders = await db.getOrders(userId);
    return calcStats(orders);
}

/**
 * 處理使用者資料流程
 * Process user data flow
 */
async function processUserData(userId: string): Promise<ICacheResult> {
    // 每個步驟清晰可讀，可獨立測試
    const userWithProfile = await fetchUserWithProfile(userId);
    const stats = await calculateUserOrderStats(userWithProfile.id);
    return cache.save(userWithProfile.id, stats);
}
```

---

### 4. Node.js 執行時考量

作為長時間運行的服務，資源管理至關重要。

#### 新增氣味：Memory Leak Potential / Event Emitter Abuse

**問題：** 不正確處理事件監聽器 (`EventEmitter`) 或資源釋放（Stream/Connection）會導致記憶體洩漏。

```typescript
// ❌ 風險：事件監聽器未正確移除
class DataProcessor extends EventEmitter {
    constructor() {
        super();
        // 每次實例化都添加監聽器，但從不移除
        this.on('data', this.handleData);
    }
}

// ✅ 正確：確保資源釋放
class DataProcessor extends EventEmitter {
    private listeners: Array<() => void> = [];

    setup(): void {
        const handler = this.handleData.bind(this);
        this.on('data', handler);
        // 記錄以便清理
        this.listeners.push(() => this.off('data', handler));
    }

    /**
     * 清理資源
     * Clean up resources
     */
    teardown(): void {
        this.listeners.forEach(remove => remove());
        this.listeners = [];
    }
}

// 使用時確保釋放
const processor = new DataProcessor();
processor.setup();
// ... 使用後
processor.teardown();
```

---

## TypeScript 專用重構技法

### 5. 利用型別驅動重構

TypeScript 的類型系統不僅是檢查工具，更是重構的安全網。

#### Introduce Parameter Object with Interface

```typescript
// Before: 過長參數清單
function createUser(
    name: string,
    email: string,
    age: number,
    role: string,
    department: string
): IUser { /* ... */ }

// After: 型別化參數物件
/**
 * 建立使用者請求參數
 * Create user request parameters
 */
interface ICreateUserRequest {
    /** 使用者名稱 / User name */
    name: string;
    /** 電子郵件 / Email address */
    email: string;
    /** 年齡 / Age */
    age: number;
    /** 角色 / Role */
    role: EnumUserRole;
    /** 部門 / Department */
    department: EnumDepartment;
}

function createUser(request: ICreateUserRequest): IUser { /* ... */ }
```

#### Replace any with Unknown + Type Guard

```typescript
// ❌ 危險：失去類型安全
function processData(data: any): void {
    data.someMethod(); // 編譯通過，執行時可能崩潰
}

// ✅ 安全：使用 unknown + type guard
function processData(data: unknown): void {
    if (isValidData(data)) {
        // TypeScript 現在知道 data 是正確的類型
        data.someMethod();
    }
}

/**
 * 資料驗證型別守衛
 * Data validation type guard
 */
function isValidData(data: unknown): data is IValidData {
    return (
        typeof data === 'object' &&
        data !== null &&
        'someMethod' in data &&
        typeof (data as IValidData).someMethod === 'function'
    );
}
```

---

## 常見重構技法

### Extract Method (提取方法)

```
Before: 具有多重職責的冗長函式
After: 多個具有描述性名稱的專注函式
```

### Extract Class (提取類別)

```
Before: 執行過多任務的類別
After: 多個具有單一職責的內聚 (cohesion) 類別
```

### Replace Conditional with Polymorphism (以多型取代條件式)

```
Before: 檢查類型的 switch/if 語句
After: 多型 (polymorphism) 方法呼叫，或使用 Discriminated Unions 進行型別安全分派
```

### Introduce Parameter Object (引入參數物件)

```
Before: 多個相關參數
After: 包含相關資料的單一物件 (使用 Interface 定義)
```

### Replace Static Mapping with Flow Accumulation (以流程累積取代靜態分派)

**適用場景：** 邏輯的「深度嵌套」和「線形膨脹」，導致新增需求時必須修改整個龐大結構。包含但不限於：深層巢狀三元運算式、巨大的 `switch/case`、或複雜的 `if/else` 鏈

**判斷標準（從設計邏輯，而非語法）：**

| 模式 | 靜態分派 (Static Mapping) | 流程累積 (Flow Accumulation) |
|------|---------------------------|------------------------------|
| **狀態處理** | 每個分支獨立計算完整結果 | 共用狀態變數，逐步建構 |
| **新增需求** | 需新增獨立分支邏輯 | 只需添加累積步驟 |
| **關鍵特徵** | `return` 出現在每個分支 | 單一 `return` 在最後 |

**⚠️ 重要：** `switch-case` 或 `if/else` 只是語法工具，**關鍵在於是否共享狀態並逐步累積**。

> 💡 **語法是工具，設計邏輯才是關鍵。**

```typescript
// ❌ 靜態分派（switch-case 實作）：每個 case 獨立計算
switch (mode) {
  case A: return calculateA();  // 獨立結果
  case B: return calculateB();  // 獨立結果
}

// ✅ 流程累積（switch-case 實作）：共用 query 變數
let query = initQuery();
switch (mode) {
  case A: query = applyBaseA(query); break;  // 修改共用狀態
  case B: query = applyBaseB(query); break;  // 修改共用狀態
}
query = applyModifiers(query);  // 統一增補
return finalize(query);         // 單一輸出點
```

```
Before: 靜態模式分派
  case A: return calculateA();  // 獨立計算
  case B: return calculateB();  // 獨立計算

After: 流程累積
  let state = initState();      // 確立基線
  if (condition1) state = applyStep1(state);  // 逐步增補
  if (condition2) state = applyStep2(state);
  return finalize(state);       // 最終輸出
```

**核心思想：**
1. **確立基線** - 初始化基礎狀態（不依賴模式的預設值）
2. **逐步增補** - 根據條件修改共用狀態（而非獨立計算）
3. **最終輸出** - 統一格式化並返回（單一出口）

**TypeScript 優勢：**
- 狀態變數的型別可被精確追蹤（階段性型別收窄）
- 單一輸出點更容易進行結果驗證
- 每個累積步驟可獨立單元測試

---

### Focus on Intent (關注意圖而非實現細節)

**核心概念：** 代碼是**寫給人看的**——這個「人」是**六個月後的你自己**，以及**被迫閱讀你程式碼的維護者**。電腦能執行任何語法正確的程式碼，但只有人類需要理解其**意圖與設計**。

> 💡 **程式碼被閱讀的次數遠遠多於被編寫的次數。** 花一個小時讓程式碼更清晰，可以節省未來數十個小時的除錯與維護時間。

當程式碼描述「要做什麼」時，閱讀者能快速理解業務邏輯；當描述「如何做」時，閱讀者必須解構實現細節才能理解目的——這對未來的自己是一種時間上的債務。

```
❌ 壞味道：描述「如何做」（How）
// 閱讀者必須解析整個條件運算式，才能理解這是要「產生 URL」
return coord && name
    ? `...${coord.lat},${coord.lng}+(${encodeURIComponent(name)})`
    : name ? `...?(${encodeURIComponent(name)})` : '';

✅ 正確：描述「要做什麼」（What）
// 閱讀者立即理解：建立基礎查詢 → 添加修飾語 → 產生最終 URL
const baseQuery = buildBaseQuery(options);
const enhancedQuery = addNameModifier(baseQuery, options.name);
return buildWebSearchUrl(enhancedQuery);
```

**為什麼這很重要：**
- **認知負荷**：「如何做」的程式碼要求閱讀者同時理解業務邏輯和實現細節；「要做什麼」讓閱讀者專注於業務邏輯
- **維護者的時間**：六個月後的你自己已經忘記當初的設計細節，清晰的意圖表達能讓你在幾秒鐘內重新理解程式碼，而非幾小時
- **可維護性**：當實現方式改變（如 URL 格式調整），「要做什麼」的程式碼只需修改函式內部，呼叫端保持不變
- **可測試性**：「要做什麼」自然導向職責分離，每個函式可獨立測試

**檢查點：**
- 如果程式碼讀起來像是一串從左到右的運算式，它可能是在描述「如何做」
- 如果移除所有運算子後仍能從函式名稱理解流程，那就是「要做什麼」
- 函式名稱應該是動詞或動詞短語，表達意圖（如 `buildBaseQuery`）而非實現（如 `concatStrings`）

---

### 善用註解表達意圖 (Documentation as Intent)

**核心概念：** 註解不是「解釋程式碼在做什麼」，而是「說明為什麼這樣設計」。良好的註解能讓維護者在幾秒鐘內理解設計意圖，無需反向工程。

#### 註解的兩種用途

| 用途 | 說明 | 範例 |
|------|------|------|
| **設計意圖** | 解釋「為什麼這樣設計」 | 「使用物件而非陣列，防止座標順序混淆」 |
| **邏輯說明** | 解釋複雜業務規則 | 「當用戶有活躍訂閱且最近有付款記錄，或啟用自動續訂時，授予存取權」 |

#### ❌ 無價值註解：重複程式碼內容

```typescript
// ❌ 壞味道：註解只是程式碼的重複
// 將用戶名稱設為 name
user.name = name;

// ❌ 壞味道：顯而易見的邏輯無需註解
// 如果 count 大於 0
if (count > 0) { ... }
```

#### ✅ 有價值註解：傳達設計決策

```typescript
/**
 * 使用物件而非陣列表示座標，從根源防止 [lat, lng] 與 [lng, lat] 順序混淆
 * 參見 geo-transform.md 案例
 */
interface IGeoCoord {
    lng: number;
    lat: number;
}

/**
 * 檢查用戶是否有有效訂閱且最近有付款記錄，或啟用自動續訂的使用者
 * 注意：此條件涵蓋三種邊界情況 - 見測試案例 subscription-edge-cases.spec.ts
 */
if (user.isActive && subscription.status === 'active' &&
    (payment.lastPaymentDate > thirtyDaysAgo || payment.isAutoRenew))
{
    grantAccess();
}
```

#### 註解與重構的關係

- **重構前**：註解標記複雜區塊，作為重構候選
- **重構後**：註解解釋為什麼簡化後的程式碼仍保持正確性
- **重構時**：保留原始實現為註解（參見 [typescript-unimplemented-handler](../typescript-unimplemented-handler/SKILL.md)）

---

## 向後相容策略 (Backward Compatibility)

重構公共 API (public APIs) 時：

- 新增方法，標記舊方法為已廢棄 (`@deprecated`)
- 使用轉接器模式 (adapter pattern) 處理介面變更
- 提供遷移路徑文件
- 必要時進行破壞性變更 (breaking changes) 時進行版本控制

---

## 安全重構流程 (TS/Node 強化版)

1. **驗證測試通過** - 確保有足夠的單元測試覆蓋，特別是邊界案例
2. **檢查類型安全** - 確認 `strict` 模式編譯通過
3. **進行小型變更** - 每次只改一個函式或一個 interface
4. **執行測試與編譯** - 驗證行為未變且型別正確
5. **檢查資源管理** - 確認沒有引入記憶體洩漏風險
6. **提交** - 保存工作狀態

---

## 輸出格式

提出重構建議時：

```markdown
## 目前的問題
[程式碼異味的描述，包含 TS/Node 特有考量]

## 提議的變更
[具體的重構技法，包含型別設計]

## 逐步計劃
1. [第一個安全變更]
2. [第二個安全變更]
...

## 風險評估
[可能出錯的項目，包含型別錯誤與執行時風險]

## 類型安全檢查清單
- [ ] Enum 定義涵蓋所有業務狀態
- [ ] Interface 遵循 SSoT 原則
- [ ] 非同步流程可獨立測試
- [ ] 資源釋放邏輯正確
```

---

## 參考文件

### 本技能參考
- [與經典原則的對照表](./references/classic-principles-mapping.md) - 與 Martin Fowler 經典重構原則的詳細對照
- [URL 重構案例](./references/url-impl.md) - 流程累積與意圖導向的實作範例
- [座標處理案例](./references/geo-transform.md) - SSoT 原則與 Tuple 語義標註的最佳實踐

### 相關技能
- [analyze-code-commenter](../analyze-code-commenter/SKILL.md) - 雙語註解添加與程式碼文件化
- [js-git-friendly-coding-style](../js-git-friendly-coding-style/SKILL.md) - Git 友好的代碼風格與合併策略
- [test-snapshot-documentation](../test-snapshot-documentation/SKILL.md) - 利用快照測試進行文件化
- [typescript-unimplemented-handler](../typescript-unimplemented-handler/SKILL.md) - 處理無法實現的代碼模式

### 記憶規則（系統層級）
- [comment-format-rules](../../rules/comment-format-rules.md) - 註解格式規範（雙語、區塊註解、JSDoc）
- [typescript-naming-convention](../../rules/typescript-naming-convention.md) - TypeScript 命名慣例（Enum、Interface、Type）
- [unimplemented-code-handling-rules](../../rules/unimplemented-code-handling-rules.md) - 無法實現代碼處理規則
- [test-file-best-practices](../../rules/test-file-best-practices.md) - 測試檔案最佳實踐

