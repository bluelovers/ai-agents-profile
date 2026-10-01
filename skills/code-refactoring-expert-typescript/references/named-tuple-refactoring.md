---
title: Tuple 與 Named Tuple 重構規範（規範 F 完整內容）
description: 規範 F 完整內容：Tuple 位置語義以 Enum 錨定、❌/✅ 對照範例、Named Tuple 與 rest 元素不豁免抽離，以及不使用 Enum 時的共享解構邏輯（單一事實來源）
tags:
  - documentation/references
  - refactoring
  - TypeScript
  - named-tuple
---

# Tuple 與 Named Tuple 重構規範（規範 F 完整內容）

> 本文自 SKILL **規範 F** 抽離，收納其**完整內容**（規則、❌/✅ 對照範例、SSoT 收益、替代方案、共享解構邏輯）與 Tuple 形態速查表。

---

## Tuple 形態速查表：不只 named 與 rest

**三種 Tuple 形態都要認得**——不要只認得 named 與 rest，而漏掉最普通的無 label 形態：

| 形態 | 語法範例 | 對應術語 | 說明 |
|------|----------|----------|------|
| 普通 Tuple | `[boolean, number, any]` | Tuple | 無 label、無 rest；最常見，也最容易被誤當成「一般陣列」而忽略位置語義 |
| Named Tuple | `[castTime: number, stiff: number]` | **Labeled Tuple Elements**（TS 4.0 官方名稱） | 每個位置帶 label；僅存在於型別層，執行期擦除 |
| 帶 rest 元素的 Tuple | `[string, ...number[]]` | **Rest element**（變長元素）；進階形態屬 Variadic Tuple Types | 尾部 `...T[]` 為變長，長度不固定 |

> ⚠️ **三者都是 Tuple**：本文的抽離規範，以及「Enum 具名索引 / 共享解構邏輯」的取值規範，對三種形態**一體適用**。只認得 named 與 rest、卻放過 `[boolean, number, any]` 這種最普通的內聯形態，正是位置語義漂移的開頭。

---

## 規範 F：Tuple 順序語義應以 Enum 作為單一事實來源，禁止 inline

對於「每個位置都承載特定業務語義」的陣列（例如攻擊 `[physical, magic]`、減傷 `[phys %, phys flat, mag %, mag flat]`），**絕不能**設計成內聯 (inline) 型別並僅以註解寫著「index semantics follow EnumX」。內聯 Tuple 會把「位置契約」散落在各個使用端，而僅靠註解的連結並不被編譯器強制——使用端仍會退化為裸索引 `tuple[0]` / `tuple[1]`，一旦順序調整便靜默出錯。

**規則：**
1. 為「槽位索引」定義一個 **Enum**（`EnumAtkSlot`、`EnumDefSlot` …），作為「每個位置代表什麼」的單一事實來源。
2. 將 Tuple **抽離為具名型別別名**，在使用端絕不再內聯展開。
3. 在**每個存取點都透過 Enum 成員索引**，而非裸數字字面值；**若不使用 Enum 作為具名索引，則必須建立單一事實的共享解構邏輯**統一取值（見下方〈不使用 Enum 作為具名索引時〉一節）。

> ⚠️ **Named Tuple 並不豁免抽離。** 即使你為每個位置加上 label（例如 `charge?: [castTime: number, stiff: number]`），它**依然是內聯型別**——Named Tuple 的 label 只是「看起來」像自我說明而已。它依舊把形狀散落、無法被其他模組共用，且一旦插入、移除或調整某個位置仍會靜默漂移。**務必抽離為具名型別別名**；label 應歸屬於抽離出來的型別，絕不可寫在屬性上：

```typescript
// ❌ 絕不可：在屬性上內聯 Named Tuple
charge?: [castTime: number, stiff: number];

// ✅ 務必：抽離為具名型別後再引用
export type IChargeTuple = [castTime: number, stiff: number];
interface ISkill { charge?: IChargeTuple; }
```

**同樣的規則也涵蓋帶有其餘（變長）元素的 Tuple／陣列——`[T, ...U[]]` 以及任何陣列字面量形狀**——具備 rest 元素並不代表可以內聯定義：

```typescript
// ❌ 絕不可：在屬性上內聯帶 rest 元素的 Tuple
tags?: [string, ...number[]];

// ✅ 務必：抽離為具名型別後再引用
export type ITagTuple = [string, ...number[]];
interface IItem { tags?: ITagTuple; }
```

### ❌ 反模式：內聯 Tuple + 只靠註解連結 Enum

```typescript
interface IBaseStats {
    /**
     * base attack 2-tuple [physical, magic]
     * index semantics follow EnumAtkSlot.
     */
    atk?: [phys: number, mag: number];

    /**
     * base reduction 4-tuple [phys %, phys flat, mag %, mag flat]
     * index semantics follow EnumDefSlot.
     */
    def?: [physPct: number, physFlat: number, magPct: number, magFlat: number];
}

// 使用端靜默地用裸索引——與 EnumAtkSlot/EnumDefSlot 的連結已斷開：
const phys = stats.atk?.[0];   // 第 0 槽是什麼？只有註解知道
const mFlat = stats.def?.[3];  // 魔法固定減傷？一紙註解契約
```

**為什麼是壞味道：**
- 位置契約被複製成散文；一旦 `EnumAtkSlot` 重新排序，內聯註解與每個裸索引都會靜默地與之脫節。
- 缺乏共用具名型別——任何採用相同形狀的其他模組都必須再次宣告內聯 Tuple，滋生「型別漂移 (Type Drift)」。

### ✅ 正確：以 Enum 作為槽位索引的單一事實來源 + Named Tuple + 透過 Enum 索引

```typescript
/**
 * 攻擊槽位索引 - Tuple 位置語義的單一事實來源
 * Attack slot indices — single source of truth for tuple position semantics.
 */
export enum EnumAtkSlot {
    /** 物理攻擊 / Physical attack */
    PHYSICAL = 0,
    /** 魔法攻擊 / Magic attack */
    MAGIC = 1,
}

/**
 * 減傷槽位索引 - Tuple 位置語義的單一事實來源
 * Reduction slot indices — single source of truth for tuple position semantics.
 */
export enum EnumDefSlot {
    /** 物理減傷百分比 / Physical reduction percentage */
    PHYS_PCT = 0,
    /** 物理固定減傷 / Physical flat reduction */
    PHYS_FLAT = 1,
    /** 魔法減傷百分比 / Magic reduction percentage */
    MAG_PCT = 2,
    /** 魔法固定減傷 / Magic flat reduction */
    MAG_FLAT = 3,
}

/** 基礎攻擊 Tuple - 順序嚴格遵循 EnumAtkSlot */
export type IAttackTuple = [phys: number, mag: number];

/** 基礎減傷 Tuple - 順序嚴格遵循 EnumDefSlot */
export type IDefenseTuple = [physPct: number, physFlat: number, magPct: number, magFlat: number];

interface IBaseStats {
    atk?: IAttackTuple;
    def?: IDefenseTuple;
}

// 存取點引用 Enum —— 槽位重新命名/排序都會自動同步：
const phys = stats.atk?.[EnumAtkSlot.PHYSICAL];
const mFlat = stats.def?.[EnumDefSlot.MAG_FLAT];
```

**為什麼對 SSoT 至關重要：**
- **位置契約集中於一處**——即 Enum。Named Tuple 型別與每個存取點都共享它；重新排序 `EnumAtkSlot` 是編譯期安全、可由 IDE 導航的變更，而非翻找註解的人肉作業。
- **消除魔術索引**——`atk[0]` 變成 `atk[EnumAtkSlot.PHYSICAL]`，自我說明且防拼寫錯誤。
- **可複用而不漂移**——其他模組直接 `import IAttackTuple`，而非重新宣告內聯 Tuple。

> 💡 **當位置本身不穩定時的替代方案：** 若槽位順序本身就是維護隱患（頻繁調序、消費端眾多），優先採用 Primitive Obsession 指導中的**物件形式**（`{ physical, magic }` / `{ physPct, physFlat, magPct, magFlat }`），徹底消除位置脆弱性。唯有當陣列形狀是由合約強制要求（例如固定的傳輸/序列化格式）時，才使用 Enum 錨定的 Tuple。

### 不使用 Enum 作為具名索引時：建立單一事實的共享解構邏輯

**首選**是上述規則 1／3 的做法——以 Enum 作為具名索引（`tuple[EnumAtkSlot.PHYSICAL]`）。

**如果不使用 Enum 作為具名索引**，則**請建立單一事實來源的共享解構邏輯**：將「位置 → 意義」的對應收斂到單一的共用解構函式，所有取值一律經過它，禁止各處自行解構：

```typescript
// ✅ 單一事實來源：位置 → 意義的對應只在這裡定義一次
export function destructureAttack(tuple: IAttackTuple): { physical: number; magic: number } {
    const [physical, magic] = tuple;
    return { physical, magic };
}

// 使用端：只透過共用解構邏輯取值——不自行解構、不裸索引
const { physical } = destructureAttack(stats.atk);
```

**為什麼**：日後若插入、移除或調整位置順序，只需修改此函式一處；除錯時任何「值不對」的問題也只需回溯這一個來源。反之，若各處自行解構，順序一變就會產生分散、靜默的錯誤，**日後難以排查**。

---

## 相關資源

- [主技能文件 code-refactoring-expert-typescript](../SKILL.zh.md) - 重構指導與其餘規範（A–E、G）
- [座標處理重構案例](./geo-transform.md) - Tuple 語義標註實戰
