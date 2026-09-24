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
  - async
  - agents/skills
  - single-source-of-truth
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

1. **單一事實原則 (SSoT) 為最優先** - 在架構設計、日常實作與重構時，SSoT 均為最高準則。型別、邏輯、狀態與常數都必須擁有唯一的單一事實來源，杜絕重複定義與多處維護
2. **重構時絕不改變行為** - 重構與功能變更應分開提交
3. **重構前先有測試，阻礙測試或複用時應抽離細化** - 若測試不存在先撰寫測試；當現有實作阻礙測試或複用時，應抽離細化為獨立可測試單元，**嚴禁為了測試而複製邏輯**，避免脫離單一事實來源
4. **進行小型、漸進式的變更** - 每個步驟應可獨立驗證
5. **保持程式碼正常運作** - 系統應在每次變更後通過測試
6. **程式碼是寫給人看的** - 電腦能執行模糊複雜的程式碼，但**六個月後的你自己**和**維護團隊**需要理解意圖與設計。清晰的程式碼比重構前的「聰明」程式碼更有價值

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

> 🌟 **最高原則：設計、實作與重構時，單一事實原則 (SSoT) 為最優先考量 (Highest Priority)！**
> 無論是從零架構設計、日常功能實作、或是既有程式碼重構，都必須將建立與維護 SSoT 視為第一順位準則。資料、狀態、邏輯或型別只要存在多份分散定義，必然導致維護失控、型別漂移、重複維護與多處散落修改。

**核心概念：** 繼承與組合優先於重複定義 (Inheritance & Composition over Duplication)。任何業務實體、型別結構與運算邏輯，在系統中必須有且僅有唯一的權威單一事實來源。

**適用於：** `Data Clumps`, `Primitive Obsession`, `Duplicate Code`, `Type Drift`, `Shotgun Surgery`

#### SSoT 六大核心支柱

1. **同領域或重覆定義型別「優先採用繼承」而非各自定義**：
   - 同領域 (Same Domain) 或具有重疊欄位/語義的模型，**應優先採用繼承 (`interface ... extends ...`) 或基礎型別擴展，而非各自獨立定義**。
   - 各自定義會破壞模型的血緣關係，引發「型別漂移 (Type Drift)」。繼承能確保基礎模型演進時，所有衍生型別自動向下保持同步。
2. **型別與 Class 之間重覆的定義「應使用 implements 約束」**：
   - 當 Class 與 Interface/Type 之間存在重覆的結構、屬性或方法宣告時，**必須在 Class 上明確宣告 `implements Interface` 強制契約約束**，而非各自獨立撰寫相同的欄位。
   - 各自宣告會破壞 SSoT，導致 Interface 作為規範與 Class 作為實作之間產生「靜默型別漂移 (Silent Type Drift)」。宣告 `implements` 能讓編譯器在介面規格變更時立即防禦報錯，並強化 IDE 的雙向導航（尋找實作/轉至介面）。
3. **業務狀態與有限集合「優先採用 Enum 設計」而非字面值聯合（字串或數字聯合）**：
   - 定義有限狀態集、分類、運作模式等業務集合時，**應優先採用 Enum 設計，而非字串或數字等字面值聯合型別 (Literal Union: `'a' | 'b'` 或 `0 | 1`)**。
   - **數字聯合型別是字面值聯合的另一種形式（本質是魔術數字 Magic Number）**：例如 `{ /** 技能類型：0＝物理, 1＝魔法 */ type: 0 | 1; }` 或 `export type ISkillDamageType = 0 | 1;`，即使抽成了 Type Alias，本質依然是披著型別外衣的魔術數字。程式碼充斥看不出意圖的 `0` 與 `1`，必須時刻依賴註解反查；**應同樣重構為語義明確的 Enum**（如 `enum EnumSkillDamageType { PHYSICAL = 0, MAGIC = 1 }`）。
   - **避免事後二次重構成本**：初期若便宜行事使用字串或數字聯合，隨業務演進（如需迭代枚舉所有選項、反向映射、執行期防禦校驗、IDE 重命名與跨檔案引用追蹤），往往迫使團隊**事後再次耗費龐大精力將字串/數字聯合全面重構為 Enum**。在設計/實作期直接以 Enum 作為單一事實來源，一步到位確立型別與數值的雙重唯一來源。
4. **重複邏輯「抽離為共用」而非散落各處各自維護**：
   - SSoT 不僅管轄型別結構，更深植於**業務邏輯與流程運算**。
   - **重複的判斷、計算、驗證或資料轉換邏輯，應強制抽離為共用函式 (Shared Utility / Pure Function / Service)，絕不允許重複散落於各處**。
   - 散落於多處會造成「各自維護」的惡夢：業務規則更新時必須在所有散落點同步修改（典型「霰彈式修改 Shotgun Surgery」）；一旦漏改任一處，即造成各處行為不一致與嚴重生產事故。
5. **阻礙測試或複用時「應抽離細化，嚴禁為測試複製邏輯」**：
   - 當任何現有實作因結構過大、深度耦合或副作用而阻礙測試或難以複用時，**必須對該實作進行抽離細化 (Decompose & Refine)**，將純運算與核心邏輯提取為獨立單元。
   - **嚴禁為了測試而複製邏輯 (Strictly Forbid Logic Duplication for Testing)**：絕不能為了寫單元測試或輔助比對，而在測試檔案中複製或重寫一套實作邏輯。複製邏輯會徹底脫離單一事實來源，在生產邏輯變更時無法同步，讓測試失去防護價值並埋下重大隱患。
6. **型別依賴與衍生「保留型別可追溯性 (Type Traceability)」**：
   - 當欄位依賴另一型別時，使用索引存取 (`OriginalType['fieldName']`) 或 `Pick<OriginalType, ...>` 保留對原始型別的引用，確保變更自動傳播（參見 1.5）。

---

#### 規範 A：同領域型別優先繼承，杜絕各自定義

##### ❌ 反模式：分散定義同領域型別
```typescript
// 座標與站點在同領域，卻各自重複定義基礎屬性
export interface IGeoBounds {
    northWest: { lng: number; lat: number; };  // 重複定義
    northEast: { lng: number; lat: number; };  // 重複定義
    southWest: { lng: number; lat: number; };  // 重複定義
    southEast: { lng: number; lat: number; };  // 重複定義
}

export interface IStationBase {
    lng: number;  // 再次重複，若座標改為支援高程 alt 則無法自動同步
    lat: number;  // 再次重複
    dataType: EnumDatasetType;
    name: string;
    address: string;
}
```

##### ✅ 正確：提取基礎 Interface 並優先繼承/組合
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
 * 站點基礎資訊 - 優先繼承 IGeoCoord 而非各自重複定義
 * Station base info - Extends IGeoCoord
 */
export interface IStationBase extends IGeoCoord {
    dataType: EnumDatasetType;
    category?: string;
    name: string;
    address: string;
}
```

---

#### 規範 B：重複邏輯抽離共用，杜絕散落各處各自維護

##### ❌ 反模式：運算與業務邏輯散落各處，各自硬編碼維護
```typescript
// 購物車結帳邏輯
async function checkoutCart(cart: ICart): Promise<number> {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.05; // 稅率邏輯散落
    const shipping = subtotal >= 1000 ? 0 : 60; // 免運門檻散落
    return Math.round((subtotal * (1 + taxRate) + shipping) * 100) / 100;
}

// 發票產生邏輯：相同邏輯再次重複編寫！
async function generateInvoice(order: IOrder): Promise<IInvoice> {
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.05; // 重複維護：若稅率調整，極易漏改此處
    const shipping = subtotal >= 1000 ? 0 : 60; // 重複維護：門檻調整時兩邊行為不同步
    const total = Math.round((subtotal * (1 + taxRate) + shipping) * 100) / 100;
    return { orderId: order.id, subtotal, taxRate, shipping, total };
}
```

##### ✅ 正確：抽離為單一事實來源的共用領域邏輯
```typescript
/**
 * 訂價規則常數 - 單一事實來源
 */
export const PRICING_CONFIG = {
    TAX_RATE: 0.05,
    FREE_SHIPPING_THRESHOLD: 1000,
    DEFAULT_SHIPPING_FEE: 60,
} as const;

export interface IOrderPricingBreakdown {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
}

/**
 * 訂單費用計算 - 唯一的業務邏輯單一事實來源
 * 規則更新只需修改此處，購物車、發票、報表全部自動保持一致
 */
export function calculateOrderPricing(
    items: ReadonlyArray<{ price: number; quantity: number }>
): IOrderPricingBreakdown {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * PRICING_CONFIG.TAX_RATE * 100) / 100;
    const shipping = subtotal >= PRICING_CONFIG.FREE_SHIPPING_THRESHOLD ? 0 : PRICING_CONFIG.DEFAULT_SHIPPING_FEE;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;

    return { subtotal, tax, shipping, total };
}
```

---

#### 規範 C：業務狀態優先採用 Enum 設計，避免字串/數字聯合引發二次重構

##### ❌ 反模式 1：使用字串聯合導致後續被迫二次重構
```typescript
// 初始使用字串聯合
type IUserRole = 'admin' | 'editor' | 'viewer';

// 隨業務擴展，需要：
// 1. 在 UI 遍歷所有角色渲染下拉選單 -> 字串聯合無法在 runtime 迭代
// 2. 驗證後端 API 回傳的 unknown 資料 -> 無法像 Object.values(Enum) 般輕易驗證
// 3. 安全重新命名 'editor' -> 'content_manager' -> 全域字串查找替換風險極高
// 結果：不得不耗費大量時間再次重構，將全專案的 IUserRole 重構為 EnumUserRole！
```

##### ❌ 反模式 2：數字聯合型別（魔術數字型別）
```typescript
// 數字型的聯合型別也是字面值聯合的另一種形式，甚至更隱晦，淪為披著型別外衣的魔術數字 (Magic Number)
export interface ISkill {
    name: string;
    /**
     * 技能類型：0＝物理 (physical)、1＝魔法 (magic)
     */
    type: 0 | 1; // ❌ 壞味道：在介面中直接宣告數字聯合
}

// ❌ 壞味道：即使獨立抽成型別別名，依然只是數字聯合，未能解決魔術數字與 SSoT 問題
export type ISkillDamageType = 0 | 1;

// 使用端充斥看不出意圖的數字，失去自我解釋能力，且需仰賴記憶或註解對照
function applyDamage(skill: ISkill) {
    if (skill.type === 0) { // 0 是什麼？維護者必須反查定義與註解
        // 物理傷害處理
    }
}
```

##### ✅ 正確：設計與實作時直接採用 Enum，一步到位
```typescript
/**
 * 使用者角色列舉 - 型別與執行期數值的單一事實來源
 * User role enumeration - Single source of truth for types and values
 */
export enum EnumUserRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    VIEWER = 'viewer',
}

// 獲得完整能力，杜絕二度重構：
export const ALL_USER_ROLES = Object.values(EnumUserRole); // 自由迭代
export function isValidRole(value: unknown): value is EnumUserRole {
    return typeof value === 'string' && Object.values(EnumUserRole).includes(value as EnumUserRole);
}

/**
 * 技能傷害類型列舉 - 徹底取代 0 | 1 數字聯合
 * Skill damage type enumeration - Completely replaces 0 | 1 numeric union
 */
export enum EnumSkillDamageType {
    /** 物理傷害 / Physical damage */
    PHYSICAL = 0,
    /** 魔法傷害 / Magic damage */
    MAGIC = 1,
}

export interface ISkill {
    name: string;
    /** 技能傷害類型 / Skill damage type */
    type: EnumSkillDamageType; // ✅ 語義明確，直接引用 Enum 作為單一事實來源
}

// 使用端語義明確，享受 IDE 自動補齊、拼寫防護與安全重新命名：
function applyDamage(skill: ISkill) {
    if (skill.type === EnumSkillDamageType.PHYSICAL) {
        // 意圖一目了然，無需依賴脆弱的註解反查
    }
}
```

---

#### 規範 D：阻礙測試或複用時抽離細化，嚴禁為測試複製邏輯

##### ❌ 反模式：現有實作阻礙測試，開發者為測試在測試代碼中複製/重寫邏輯
```typescript
// 業務模組 (bonusService.ts)
// 現有實作將資料庫 I/O、郵件發送與複雜的點數計算全部揉合在一個方法中，難以直接單元測試
export class BonusService {
    async processUserBonus(userId: string): Promise<void> {
        const user = await db.findUser(userId);
        // 核心計算邏輯深埋在 I/O 流程中：
        const bonus = (user.points > 1000 ? user.points * 0.1 : user.points * 0.05) + (user.isVip ? 50 : 0);
        await db.saveBonus(userId, bonus);
        await emailClient.send(user.email, `Bonus: ${bonus}`);
    }
}

// 測試檔案 (bonusService.spec.ts)
// ❌ 嚴重壞味道：因為 BonusService 難測，開發者直接在測試檔中複製邏輯來比對！
function calculateExpectedBonusForTest(points: number, isVip: boolean): number {
    // 複製了生產環境邏輯！脫離了單一事實來源 (SSoT)
    return (points > 1000 ? points * 0.1 : points * 0.05) + (isVip ? 50 : 0);
}

it('should calculate bonus', () => {
    // 測試依賴複製的邏輯；若生產端將 VIP 獎勵改為 100，測試若未手動更新將報假警報；
    // 若生產端計算出現 bug，複製邏輯也可能複製了 bug，造成測試虛假通過！
    expect(calculateExpectedBonusForTest(2000, true)).toBe(250);
});
```

##### ✅ 正確：抽離細化為純函式，生產與測試共享唯一單一事實來源
```typescript
// 抽離出的共用計算單元 (bonusCalculator.ts) - 純粹、易測、高度可複用
export interface IUserBonusMetrics {
    points: number;
    isVip: boolean;
}

/**
 * 計算使用者獎勵點數 - 唯一的單一事實來源
 * 抽離細化後，解除了測試阻礙，且可被其他服務安全複用
 */
export function calculateUserBonus(metrics: IUserBonusMetrics): number {
    const baseRate = metrics.points > 1000 ? 0.1 : 0.05;
    const vipBonus = metrics.isVip ? 50 : 0;
    return metrics.points * baseRate + vipBonus;
}

// 業務模組 (bonusService.ts) - 生產程式碼直接調用抽離出的單一權威來源
export class BonusService {
    async processUserBonus(userId: string): Promise<void> {
        const user = await db.findUser(userId);
        const bonus = calculateUserBonus({ points: user.points, isVip: user.isVip });
        await db.saveBonus(userId, bonus);
        await emailClient.send(user.email, `Bonus: ${bonus}`);
    }
}

// 測試檔案 (bonusCalculator.spec.ts) - 直接測試權威實體，零複製邏輯
it('should calculate correct bonus', () => {
    expect(calculateUserBonus({ points: 2000, isVip: true })).toBe(250);
});
```

---

#### 規範 E：型別與 Class 之間重覆的定義，應使用 `implements` 約束

##### ❌ 反模式：Class 與 Interface 結構重覆，卻未以 `implements` 約束
```typescript
// 領域契約介面
export interface IUserProfile {
    id: string;
    username: string;
    email: string;
    updateEmail(newEmail: string): Promise<void>;
}

// ❌ 壞味道：UserProfileEntity 實現了完全相同的結構與方法，卻未宣告 implements！
// 兩者各自獨立宣告，若 IUserProfile 的 email 更名或變更型別，此處不會觸發任何編譯期錯誤，造成「靜默型別漂移」
export class UserProfileEntity {
    id: string;
    username: string;
    email: string;

    constructor(id: string, username: string, email: string) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    async updateEmail(newEmail: string): Promise<void> {
        this.email = newEmail;
    }
}
```

##### ✅ 正確：使用 `implements` 建立強型別編譯期契約約束
```typescript
/**
 * 使用者資訊契約 - 單一事實來源
 */
export interface IUserProfile {
    id: string;
    username: string;
    email: string;
    updateEmail(newEmail: string): Promise<void>;
}

/**
 * 使用者實體類別 - 明確宣告 implements IUserProfile
 * 強制受 Interface 約束，任何屬性、型別或方法簽名變更皆由編譯器防禦報錯，杜絕靜默漂移
 */
export class UserProfileEntity implements IUserProfile {
    constructor(
        public id: string,
        public username: string,
        public email: string,
    ) {}

    async updateEmail(newEmail: string): Promise<void> {
        this.email = newEmail;
    }
}
```

**為什麼這對 SSoT 至關重要：**
- **消除重複維護與靜默漂移**：Interface 是「契約與規格的單一事實來源」，`implements` 確保 Class 忠實履行契約。若介面欄位更名或型別調整，編譯器在 Class 定義處立即報錯，而非等到下游使用端賦值時才暴露問題。
- **IDE 雙向導航與重構支援**：`implements` 建立語法層級的直接連結，IDE 可一鍵「尋找所有實作 (Find Implementations)」或「跳至介面定義 (Go to Interface)」，重命名符號時自動雙向同步。
- **職責清晰**：Interface 負責對外契約與規格抽象，Class 負責具體實作與封裝，邊界涇渭分明。

---

#### 重構指導

| 檢查點 | 操作 |
|--------|------|
| 是否在進行設計、實作或重構？ | **將 SSoT 置於最優先原則**，檢查所有型別與邏輯是否具備單一權威來源 |
| 是否為同領域或有重複屬性群組？ | **優先採用繼承 (`interface ... extends ...`)**，或建立巢狀組合，杜絕各自獨立定義 |
| Class 與 Interface 之間存在重複結構或契約？ | **在 Class 上使用 `implements Interface` 約束**，杜絕各自獨立宣告導致靜默型別漂移 |
| 是否定義了有限的業務狀態、分類或數字標記（如 0/1）？ | **優先採用 Enum 設計**而非字串或數字聯合，避免日後需求擴展時再次耗費精力重構為 Enum |
| 是否存在重複的計算、校驗或轉換邏輯？ | **抽離為共用純函式/工具**，杜絕邏輯重複散落導致各處各自維護與更新遺漏 |
| 現有實作阻礙測試或難以複用？ | **進行抽離細化 (Decompose & Refine)**，將核心邏輯抽離為獨立純函式；**嚴禁為測試複製邏輯**而脫離 SSoT |
| 是否有基於另一型別的欄位？ | 使用 `OriginalType['fieldName']` 或 `Pick<OriginalType, ...>` 保留可追溯性 |
| 修改時是否需要手動在多處同步調整？ | 確認嚴重違反 SSoT，需立即重構為單一事實來源 |

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

### 1.5 類型可追溯性 (Type Traceability)

**核心概念：** 當型別欄位或參數基於另一個型別時，應透過索引存取 (Index Access) 或 `Pick` 保留對原始型別的引用，確保型別變更可以自動傳播並維持單一事實來源。

**適用於：** `Type Drift`（型別漂移），跨模組型別重複定義

#### ❌ 反模式：型別漂移與重複定義

```typescript
// 問題：直接重複定義型別，即使原始 ITripDetail 變更，也需手動同步多個地方
export interface ITripDetailMapValue {
    hero?: IRawHeroV2;
    addresses?: IRawAddressBlockV2;
    stats?: IRawStatTable;
    breakdown: IRawBreakdownItem[];
    mapUrl: string;        // 重複定義，若 ITripDetail.mapUrl 改為 URL 物件則需遍歷修改
    message: string;       // 重複定義
    pickupCoords: { lng: number; lat: number };  // 重複定義座標型別
    dropoffCoords: { lng: number; lat: number }; // 重複定義座標型別
    // ... 更多重複欄位
}
```

#### ✅ 正確：單一來源 + 索引存取

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
 * 行程詳細資訊 - 完整型別定義
 * Trip detail - Complete type definition
 */
export interface ITripDetail {
    hero?: IRawHeroV2;
    addresses?: IRawAddressBlockV2;
    stats?: IRawStatTable;
    breakdown: IRawBreakdownItem[];
    mapUrl: string;
    message: string;
    pickupCoords: IGeoCoord;
    dropoffCoords: IGeoCoord;
    cancelCoords: IGeoCoord;
    unknownCoords: IGeoCoord;
}

/**
 * 行程詳細地圖值 - 僅選取 ITripDetail 中的座標相關欄位
 * Trip detail map value - Picks coordinate-related fields from ITripDetail
 *
 * 使用 Pick 保留型別可追溯性，當 ITripDetail 改變時自動同步
 * Using Pick preserves type traceability, auto-syncs when ITripDetail changes
 */
export interface ITripDetailMapValue extends Pick<ITripDetail, 'mapUrl' | 'message' | 'pickupCoords' | 'dropoffCoords' | 'cancelCoords' | 'unknownCoords'> {
    hero?: IRawHeroV2;
    addresses?: IRawAddressBlockV2;
    stats?: IRawStatTable;
    breakdown: IRawBreakdownItem[];
}
```

#### 單一欄位索引存取

當僅需引用單一欄位時，使用索引存取提升可讀性：

```typescript
// ✅ 單一欄位使用索引存取
interface IUserRef {
    /** 使用者識別碼 / User identifier */
    id: IUser['id'];           // 來自 IUser，若 IUser.id 改型則自動同步
    /** 使用者顯示名稱 / User display name */
    displayName: IUser['name']; // 來自 IUser，保持型別一致性
}
```

#### 重構指導

| 檢查點 | 操作 |
|--------|------|
| 是否有基於另一型別的欄位？ | 使用 `OriginalType['fieldName']` 或 `Pick<OriginalType, 'field1' \| 'field2'>` |
| 是否需要多個欄位來自同一型別？ | 使用 `Pick<OriginalType, 'field1' \| 'field2' \| ...>` 取代多個索引存取 |
| 修改後是否需要遍歷多處同步？ | 確認違反 SSoT，需重構為索引存取或 Pick |

---

### 3. 嚴格類型控制 (Strict Type Control)

**核心概念：** 當業務邏輯定義了有限的狀態集時，**優先使用 Enum 而非字串或數字等字面值聯合型別 (Literal Union)**。字面值聯合型別在編譯後會被擦除，失去 IDE 支援與運行時檢查能力；Enum 則提供完整的開發時體驗與運行時安全，是型別空間與數值空間的唯一單一事實來源 (SSoT)。

> ⚠️ **避免事後二次重構的沉重代價（字串與數字聯合皆然）**：
> 開發初期常因省事而宣告字串聯合（例如 `type Status = 'active' | 'inactive'`）或數字聯合（例如 `type: 0 | 1` 或 `type ISkillDamageType = 0 | 1`）。
> - **字串聯合**隨業務演進，面臨需遍歷選項渲染下拉選單、執行期防禦校驗、狀態對照表、安全重新命名等需求，無執行期實體的字串聯合終將難以應對；
> - **數字聯合**本質上更是「披著型別外衣的魔術數字 (Magic Number)」，不僅同樣面臨二度重構困境，還嚴重損害程式碼可讀性，迫使開發者在維護時依賴脆弱的 JSDoc 註解去猜測 `0` 與 `1` 代表什麼。
> 兩者最終都會迫使團隊**事後再次耗費龐大時間與風險，將整個程式碼庫的聯合型別重構為 Enum**。
> **在設計與實作初期即應優先採用 Enum**，一步到位確立單一事實來源，免除後續二次重構的沉重負擔。

**適用於：** `Primitive Obsession`, 業務狀態定義

#### ❌ 反模式：字串與數字聯合型別漂移

```typescript
// 1. 字串聯合問題：維護困難，編譯後失去類型資訊，無法被 IDE 完整支援與重構，容易拼寫錯誤
type IDatasetType = 'wifi' | 'charging' | 'parking';

// 2. 數字聯合問題：本質是魔術數字，失去自我解釋能力，極易混淆
type ISkillDamageType = 0 | 1; // 0=物理? 1=魔法? 難以一眼看出

function process(type: IDatasetType, damageType: ISkillDamageType) {
    if (type === 'wfi') { /* 拼寫錯誤在編譯時無法發現，執行時才暴露 */ }
    if (damageType === 0) { /* 魔術數字 0 是什麼？維護者必須反查定義與註解 */ }
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
 * 技能傷害類型列舉
 * Skill damage type enumeration
 */
enum EnumSkillDamageType {
    /** 物理傷害 / Physical damage */
    PHYSICAL = 0,
    /** 魔法傷害 / Magic damage */
    MAGIC = 1,
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
| 狀態代碼、數值旗標（如 0/1 狀態） | **Enum** | 數字聯合如 `0 \| 1` 本質為魔術數字，Enum 能提供語義化命名、消除對註解的脆弱依賴 |
| API 臨時回傳、第三方函式參數 | Union Type | 短暫存在的類型，不需長期維護，輕量定義減少 boilerplate |
| 需要迭代所有可能值 | **Enum** | 運行時需要枚舉所有選項（如渲染下拉選單），Enum 提供結構化的迭代能力 |
| 需要反向查找 (value → key) | **Enum** | 從後端數據反查顯示名稱時，Enum 的反向映射避免硬編碼對照表 |

#### ⚠️ 完整重構：比對值必須一併更新，而非只改型別簽名

將字串型別遷移為 Enum 時，**必須同步更新所有比對值**（`switch`/`case`、`===`、`==`、物件鍵等）以引用 Enum 成員。若只修改參數/回傳值的型別簽名，而分支中仍保留字串字面值，則屬於「半吊子重構」——程式碼雖仍可編譯（因 Enum 的字串值相符），但卻失去了當初遷移所追求的 IDE 輔助、重新命名自動傳播與拼寫錯誤攔截能力。

```typescript
// ✅ 正確：目標類型的 Enum 定義
enum EnumTargetType {
    /** 敵人 / Enemy */
    Enemy = 'enemy',
    /** 友方 / Friend */
    Friend = 'friend',
    /** 自身 / Self */
    Self = 'self',
    /** 全體 / All */
    All = 'all',
}

// ❌ 半吊子重構：只改了簽名，比對值仍使用原始字串
function targetClass(target: EnumTargetType) {
  switch (target) {
    case 'enemy': return 'dmg';        // 字串字面值殘留 —— 無 IDE 輔助、易拼錯
    case 'friend': return 'recover';
    case 'self': return 'support';
    case 'all': return 'support';
    default: return 'support';
  }
}

// ✅ 正確：每個比對位置都使用 Enum 成員
function targetClass(target: EnumTargetType) {
  switch (target) {
    case EnumTargetType.Enemy: return 'dmg';
    case EnumTargetType.Friend: return 'recover';
    case EnumTargetType.Self: return 'support';
    case EnumTargetType.All: return 'support';
    default: return 'support';
  }
}
```

**為什麼重要：**
- **重新命名安全性**：將 `EnumTargetType.Enemy` 重新命名時，只有在 `case` 中引用成員才會自動傳播；原始字串仍需靠不安全的全局搜索替換。
- **拼寫錯誤攔截**：`case 'enemey':` 會靜默地變成不可達（落入 `default`）；`case EnumTargetType.Enemey` 則在編譯期即報錯。
- **單一事實來源**：合法值集合存在於 Enum 中，而非散落在各處字串字面值。

**遷移至 Enum 時的檢查清單：**
| 位置 | 操作 |
|------|------|
| 函式參數 / 回傳值型別 | 將型別改為 Enum |
| `switch (x)` / `case` | 將字串或數字字面值替換為 `Enum.X` 成員 |
| `if (x === '...')` / `x !== '...'` | 替換為 `x === Enum.X` |
| 數字字面值比對 (`x === 0` / `x === 1`) | 替換為 `x === Enum.X` 成員，消除魔術數字 |
| 物件/對照表鍵 (`{ 'enemy': ... }`) | 替換為計算鍵 `[EnumTargetType.Enemy]` 或 `Enum.X` 鍵 |
| 三元運算式 / 陣列 `.includes(['...'])` | 將成員替換為 Enum 引用 |
| 預設/未知處理 | 僅當輸入確實來自外部/不可信時才保留 `default` |

---

## Node.js 非同步流程重構

### 4. 識別非同步瓶頸 (Asynchronous Bottleneck)

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

### 6. 利用型別驅動重構

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

#### Enforce Interface Implementation on Class (以 implements 約束類別實作)

```typescript
// Before: Class 與 Interface 各自獨立宣告相同契約，缺乏編譯期強制性，易導致型別漂移
interface IUserRepository {
    findById(id: string): Promise<IUser | null>;
    save(user: IUser): Promise<void>;
}

class SqlUserRepository { // ❌ 未宣告 implements，與 IUserRepository 脫節
    async findById(id: string): Promise<IUser | null> { /* ... */ }
    async save(user: IUser): Promise<void> { /* ... */ }
}

// After: 明確以 implements 建立契約約束，Interface 作為單一事實來源
class SqlUserRepository implements IUserRepository { // ✅ 受編譯期強制約束
    async findById(id: string): Promise<IUser | null> { /* ... */ }
    async save(user: IUser): Promise<void> { /* ... */ }
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

### 7. Focus on Intent (關注意圖而非實現細節)

**核心概念：** 代碼是**寫給人看的**——這個「人」是**六個月後的你自己**，以及**被迫閱讀你程式碼的維護者**。電腦能執行任何語法正確的程式碼，但只有人類需要理解其**意圖與設計**。

> 💡 **程式碼被閱讀的次數遠達多於被編寫的次數。** 花一個小時讓程式碼更清晰，可以節省未來數十個小時的除錯與維護時間。

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

### 8. 善用註解表達意圖 (Documentation as Intent)

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
- [ ] Interface 遵循 SSoT 原則與類型可追溯性
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
- [typescript-naming-convention](../typescript-naming-convention/SKILL.md) - TypeScript 命名慣例（Enum、Interface、Type）
- [unimplemented-code-handling-rules](../../rules/unimplemented-code-handling-rules.md) - 無法實現代碼處理規則
- [test-file-best-practices](../../rules/test-file-best-practices.md) - 測試檔案最佳實踐

