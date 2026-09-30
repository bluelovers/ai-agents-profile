---
tags:
  - documentation/references
  - refactoring
  - TypeScript
  - single-source-of-truth
  - ssot
  - anti-pattern
---

# SSOT 重構的反模式：冗餘別名與偷懶取代法 (SSOT Refactoring Anti-Patterns: Redundant Aliasing & Lazy Replacement)

本案例彙整兩類在「收斂為單一事實來源 (SSOT)」過程中極易出現的命名反模式：
(1) 用匯入別名遮掩同名碰撞、再將原名重新繫結（問題 1–3）；
(2) SSOT 重構時「偷懶取代法」導致 `A2 = A1, A3 = A1`（問題 4）。
兩者的共同代價：同一個值存在多個名字，單一事實來源被名義上的多份定義掩蓋。

---

## Case A — 匯入別名遮掩碰撞 + 多餘重新繫結（問題 1–3）

### 程式碼

```typescript
import { SKILL_EXTRA_NUMERIC_KEYS as SHARED_SKILL_EXTRA_NUMERIC_KEYS } from './yaml-skill-keys';
//        A1 ────────────────────────────────► B
const SKILL_EXTRA_NUMERIC_KEYS = SHARED_SKILL_EXTRA_NUMERIC_KEYS;
//     A2 ◄──────────────── B
```

| 符號 | 來源 | 角色 |
|------|------|------|
| A1 | `./yaml-skill-keys` 匯出的 `SKILL_EXTRA_NUMERIC_KEYS` | 被匯入的真源 |
| B  | `import { ... as SHARED_SKILL_EXTRA_NUMERIC_KEYS }` | A1 的匯入別名 |
| A2 | 本檔 `const SKILL_EXTRA_NUMERIC_KEYS` | 與 A1 同名的本地符號 |

### 問題 1：本檔不該存在與「被匯入來源原名」同名的符號

**根因（結構層）**：匯入檔同時有 A1（來自 `yaml-skill-keys`）與 A2（本地 `const`，同名）。這是命名碰撞的既成事實，也是 SSoT 氣味——「同一個名字」同時指向外部匯入與本地定義，代表重複定義或命名歧義。

正確前提是：**要匯入 A1，本檔就不該再有自有的 `SKILL_EXTRA_NUMERIC_KEYS`**。

### 問題 2：用「匯入別名 `as B`」閃避碰撞，而非改名源頭

```typescript
import { SKILL_EXTRA_NUMERIC_KEYS as SHARED_SKILL_EXTRA_NUMERIC_KEYS } from './yaml-skill-keys';
```

**問題點（修復位置錯誤 / 掩蓋）**：為了不與本地 A2 撞名，在**匯入端**改成 `SHARED_...`，是把症狀在消費邊掩蓋，而非解決「A1 與 A2 同名」的根源。

**正確做法**：在**其中一個原始定義**改名，讓兩件事物從源頭就有不同名字，再用真名直接匯入：
- 本檔的 A2 才是該保留的本地變體 → 把本地 `const SKILL_EXTRA_NUMERIC_KEYS` 改名為 `LOCAL_SKILL_EXTRA_NUMERIC_KEYS`，再 `import { SKILL_EXTRA_NUMERIC_KEYS }`。
- 值本就應來自 `yaml-skill-keys` → 直接刪掉本地 A2，用真名匯入。

`as` 別名不是不能用，而是**用錯地方**：它把「兩個同名東西」藏進一個匯入點，原始碼裡 A1 與 A2 依然同名共存。

### 問題 3：把 `A1 as B` 之後，又讓 `A2 = B`（與問題 2 根因完全不同）

```typescript
const SKILL_EXTRA_NUMERIC_KEYS = SHARED_SKILL_EXTRA_NUMERIC_KEYS;
//     A2                       = B ( = A1 )
```

**問題點（多餘的重新繫結 / 冗餘間接層）**：這不是「怎麼處理匯入來避開碰撞」（那是問題 2），而是**匯入後多此一舉地重建原名**，讓它指向別名 B。結果是同一個值有了三個名字 A1 / B / A2。

這一行 `const A2 = B` 完全無意義：
- 執行期 `A2 === B === A1`（對物件/陣列只是多一個別名）；
- 誤導讀者以為 A2 是獨立本地定義，實則是匯入值的影子；
- 模糊單一事實來源：有人改 A2 以為在改本地資料，或改匯入端以為 A2 不會跟動——兩者都會跟動，但路徑繞得令人困惑。

**與問題 2 的關鍵差異**：問題 2 是「在哪裡改名」的判斷錯（在匯入邊 `as` 閃避，而非改源頭名）；問題 3 是「匯入後多餘地重建原名」的冗餘（即便別名有正當理由，這行也無存在價值）。

### Case A 正確做法

```typescript
// ✅ 情況 A：值本就應來自 yaml-skill-keys —— 刪掉本地 A2，真名直接匯入
import { SKILL_EXTRA_NUMERIC_KEYS } from './yaml-skill-keys';

// ✅ 情況 B：本檔確實需要自己的變體 —— 在源頭改名，二者從此不同名
import { SKILL_EXTRA_NUMERIC_KEYS } from './yaml-skill-keys';
const LOCAL_SKILL_EXTRA_NUMERIC_KEYS = [/* 本檔專用 */];
```

兩者都消滅了「A1 / B / A2 三名指一物」的怪象，也消除潛在的靜默行為變更風險：現有那行 `const A2 = B` 若原本本地 A2 是另一組不同的 keys，其內容會被匯入值整個覆寫——而程式碼看起來卻像「本地定義仍在」。

---

## Case B — SSOT 重構「偷懶取代法」→ `A2 = A1, A3 = A1`（問題 4）

### 背景

這類問題特別容易發生在**重構邁向單一事實來源時**。正確做法應是：從一開始就**只使用單一來源**，把所有消費點改成直接引用那個來源。但常見的懶惰做法是「取代法」——把唯一來源搬去共用模組後，不刪除舊的本地名字，而是把每一個舊名字**重新指向**新來源。結果：值雖然統一了，名字卻留下一堆，形成 `A2 = A1, A3 = A1`。

### 程式碼

```typescript
// ❌ 重構前：三處各自持有同一組 keys 的副本
const SKILL_EXTRA_NUMERIC_KEYS = [...];               // A（舊本地定義）
const EXTRA_KEYS = SKILL_EXTRA_NUMERIC_KEYS;          // A2 = A（舊複製）
const NUMERIC_SKILL_KEYS = SKILL_EXTRA_NUMERIC_KEYS;  // A3 = A（舊複製）

// ❌ 重構前：三處各自持有同一組 keys 的副本
const SKILL_EXTRA_NUMERIC_KEYS = [...];               // A（舊本地定義）
const EXTRA_KEYS = [...];          // A2 = A（舊複製）
const NUMERIC_SKILL_KEYS = [...];  // A3 = A（舊複製）

// ❌ 重構後（偷懶取代法）：把唯一來源搬到 yaml-skill-keys，但用「取代」而非「只用單源」
import { SKILL_EXTRA_NUMERIC_KEYS } from './yaml-skill-keys'; // A1 真源
const EXTRA_KEYS = SKILL_EXTRA_NUMERIC_KEYS;           // A2 = A1
const NUMERIC_SKILL_KEYS = SKILL_EXTRA_NUMERIC_KEYS;   // A3 = A1
```

### 問題點

SSOT 的目標是「一個來源」。但偷懶取代法只把**舊名字重新指向**新單源，產生 `A2 = A1, A3 = A1`。現在這個值有三個名字。*名字* 的重複仍然存在，即使 *值* 已統一。這會：

- 抵消 SSOT 帶來的可讀性/可除錯性：讀者仍看到多個名字，不知哪個才是權威；
- 埋下維護地雷：有人對 `EXTRA_KEYS` 加鍵以為獨立，或在別處重新定義 `NUMERIC_SKILL_KEYS`，再次引入漂移；
- 讓「單一事實來源」淪為口號——名義上有三份定義，只是它們都指同一個值。

### 正確做法

```typescript
// ✅ 重構後：只保留唯一來源，刪除所有舊別名，消費點直接引用 A1
import { SKILL_EXTRA_NUMERIC_KEYS } from './yaml-skill-keys';
// 所有原本使用 EXTRA_KEYS / NUMERIC_SKILL_KEYS 的地方，改為 SKILL_EXTRA_NUMERIC_KEYS
```

核心原則：**重構一開始就只用單一來源**——刪掉舊名字（`EXTRA_KEYS`、`NUMERIC_SKILL_KEYS`），並把所有消費點更新為直接引用 `SKILL_EXTRA_NUMERIC_KEYS`，而不是保留舊名字當作別名。

### Case B 變體：字串聯合 → enum 後 `type IA = EnumA`（同屬「偷懶取代法」）

#### 程式碼

```typescript
// ❌ 重構前
type IA = 'a' | 'b';

// ✅ 正確：遷移為 enum
enum EnumA { A = 'a', B = 'b' }

// ❌ 偷懶取代法：把舊名字 IA 重新指向新 enum，而非刪除 IA 讓消費點直接用 EnumA
type IA = EnumA;
```

#### 問題點 / Problem

這是「偷懶取代法」在**型別層**的同款表現：你只是把舊名字 `IA` 重新指向新單源 `EnumA`，而非刪除 `IA`、讓所有消費點直接使用 `EnumA`。結果同一個概念有了兩個名字（`IA` 與 `EnumA`），正是 Case B 的 `A2 = A1` 在型別上的版本。

這同時觸犯本技能已明訂的規則：**`I = Enum` 模式（`type IA = EnumA`）本質上有缺陷、絕不該使用**（見核心指南「將字串型別重構為 enum」一節）。遷移為 enum 的目的，正是要建立「型別空間與數值空間的唯一來源」`EnumA`；保留 `type IA = EnumA` 等於又立了一個同名鏡像，讓讀者不知道誰才是權威，也讓 enum 演化時要多追蹤一個名字。

> 延伸坑：`IA` 只是型別別名，無法在執行期當作物件使用（`Object.values(IA)` 不行，必須 `EnumA`）。保留 `IA` 會在「型別用 IA、執行期用 EnumA」之間重新切出一道縫，反而助長漂移。

#### 正確做法 / Correct fix

```typescript
// ✅ 刪除舊名字 IA，消費點直接引用 EnumA（型別與值皆同源）
enum EnumA { A = 'a', B = 'b' }
// 原使用 IA 的地方改為 EnumA
```

Core principle (same as Case B): **use only the single source from the start** — delete the legacy alias `IA`; every consumer references `EnumA` directly for both types and runtime values.

---

## Case C — 重構後建立 Barrel Index re-export（偷懶取代法的模組層版本）

### 背景

「偷懶取代法」不只發生在值/型別別名，也發生在**模組路徑層**。收斂為單一事實來源時（例如把定義搬進共用模組），正確做法是更新所有內部消費點、直接引用新來源路徑。但常見的偷懶做法是：在舊位置建立一個 **Barrel Index re-export**（`export * from './realModule'` 或 `export { X } from './realModule'`），讓舊的 import 路徑繼續通過——等於把舊路徑當作別名保留下來。

### 程式碼

```typescript
// ✅ 重構後：定義搬到唯一來源 src/core/keys.ts
// src/core/keys.ts
export const SKILL_EXTRA_NUMERIC_KEYS = [...];

// ❌ 偷懶取代法：在舊位置建立 barrel re-export，讓舊 import 路徑繼續通過
// src/skill/keys.ts（舊檔，本應刪除）
export * from '../core/keys';                 // barrel re-export
// 或 export { SKILL_EXTRA_NUMERIC_KEYS } from '../core/keys';
```

### 問題點

內部消費點仍從 `src/skill/keys` 匯入（舊路徑），而非 `src/core/keys`（單一來源）。兩個路徑指向同一個模組——舊路徑以 re-export 的形式存活，正是 Case B 的 `A2 = A1` 在**模組層**的版本。

這會：
- 抵消 SSOT 的可讀性/可除錯性：讀者不知道哪條路徑才是權威；Find References、rename、tree-shaking、循環依賴偵測等工具效力下降（詳見 `code-refactoring-miscellaneous` 的 **Barrel Index Avoidance Rule**）。
- 埋下漂移風險：有人改動 re-export 檔以為是來源，或在新路徑與舊路徑之間來回，再次引入不一致。
- 讓「單一事實來源」淪為口號：名義上兩個入口，只是其中一個轉手給另一個。

### 正確做法 / Correct fix

```typescript
// ✅ 刪除舊位置的 barrel re-export 檔（src/skill/keys.ts）
// ✅ 所有內部消費點直接引用單一來源路徑
import { SKILL_EXTRA_NUMERIC_KEYS } from '../core/keys';
```

**內部專案引用一律使用直接路徑**；Barrel Index re-export 在原則上**禁止**於重構後建立。

### 可接受例外 / Acceptable exceptions

下列情況可保留 re-export（否則仍應避免）：
1. **使用者明確要求指示**（explicit user instruction）。
2. **重構期間暫時 re-export**：為了先專心處理重構或單一事實來源本身，可暫時保留 re-export 作為過渡；**重構完成後必須刪除 re-export，並讓消費點改為直接引用直接路徑**。
3. **對外模組入口點**：該檔案是提供給**外部專案**使用的模組入口點，且**原本就有 export**（即既有的公開 API 介面，而非重構時偷懶新增的內部 barrel）。

> 📚 進一步規範參見 [Barrel Index Avoidance Rule](../../code-refactoring-miscellaneous/SKILL.md#barrel-index-avoidance-rule)（位於 `code-refactoring-miscellaneous`）。

---

## Case D — 重構時於註解內標示非必要內容（移動/抽離紀錄、SSOT 標籤）

### 背景

常見於使用者強調「重構 / 單一事實 / 消除重覆」等重點要求時，agent 把這些要求本身寫進每一個註解：

- `// ssot 單一事實` / `// SSOT`
- `// 移動紀錄：F1 → F2`
- `// 抽離紀錄：從 X 抽離至 Y`

等「非必要內容」。長期累積產生大量無意義紀錄，甚至造成遷移鏈註解：A 註解寫「F1 移動至 F2」，結果在 F2 又看見「移動至 F3」……

### 問題點

1. **註解應解釋「為什麼」而非「做了什麼」的操作日誌**：重構動作（移動、抽離）是版本控制 (git) 已記錄的事實，寫進註解只是噪音。讀者要看的是意圖與不變數，不是遷移履歷。
2. **SSOT / 重構標籤是對讀者的干擾**：在每個檔案標 `// ssot` 不提供任何新資訊——它只是把「我做了 SSOT」這件事重複宣示，對維護毫無幫助。
3. **遷移鏈註解會誤導且迅速過期**：「F1 移動至 F2」在 F2 又被寫成「移動至 F3」，最終沒有一處註解是當前事實，反而比沒有註解更糟——讀者被帶去錯誤的檔案。
4. **累積成大量無意義紀錄**：每個重構動作都留一句，專案越大越喧賓奪主，真正有用的業務註解被淹沒。

### 正確做法 / Correct fix

- 重構時**不**在註解內標示：SSOT 標籤、移動紀錄、抽離紀錄，以及其他純操作日誌。
- 若需保留「為什麼這樣設計」的脈絡，寫**意圖 / 不變數**（例如「集中百分比算式以避免散落重複」），而不是「我做了什麼」。
- 遷移歷程交給 git（`git log` / blame），不要寫進原始碼註解。
- 若真的需要說明某段為何存在，用一句業務 / 設計意圖，而非重構動詞。

### 與本技能的關聯

這與規範 B / B-2 / B-3 是同一紀律的兩面：B 系列要求**程式結構**收斂為 SSOT；Case D 要求**註解**也不要反向膨脹成「重構履歷」——否則表面 SSOT、實則註解裡塞滿重複的移動紀錄。

---

## 總結檢查清單 / Summary Checklist

- [ ] 本檔匯入某符號時，是否仍存在與其原名同名的本地定義？（問題 1）
- [ ] 是否用 `import { X as Y }` 在匯入邊閃避碰撞，而非在源頭改名？（問題 2）
- [ ] 是否在 `X as Y` 之後又 `const X = Y` 重建原名？（問題 3）
- [ ] SSOT 重構時，是否只是把舊名字重新指向新來源（`A2 = A1, A3 = A1`），而非刪除舊名字、讓消費點直接用單源？（問題 4）
- [ ] 重構後是否建立了 Barrel Index re-export 來讓舊 import 路徑繼續通過，而非讓內部消費點直接引用單一來源路徑？（Case C）
- [ ] 重構時是否在註解內標示非必要內容（SSOT 標籤、移動/抽離紀錄等），導致無意義紀錄堆積甚至遷移鏈註解？（Case D）
- [ ] 最終是否達成「一個來源、一個名字、零轉手」？

> 這四個問題本質都是「重複/冗餘命名」，正是本技能 **規範 B（重複邏輯抽離共用）** 與 **規範 B-2（計算密集型專案連瑣碎運算也要抽離）** 的對立面：收斂為 SSOT 時，必須連「名字」也收斂成唯一，否則只是把重複從值搬到了名字。
