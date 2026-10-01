---
title: React State/Ref/Memo Decision Guide
description: React 重構時 State、RefObject、IRefObjectMaybe<T> 與 useMemo 的選擇與判定指南 - 數據流判定矩陣、詳細判定標準、重構實戰流程與總結建議
tags:
  - documentation/references
  - React
  - refactoring
  - react/hooks
  - react/state-management
---

# React State/Ref/Memo 判定指南

這是一份針對 React 重構時，關於 **State**、**RefObject** 與 **`IRefObjectMaybe<T>` (Value/RefObject)**、**Memo** 的選擇與判定指南。你可以將這套邏輯應用在開發 Hook 或複雜組件的決策中。

---

## 🟢 React 數據流判定矩陣 (Decision Matrix)

| 數據類型 | 變動時是否需要 UI 更新？ | 是否作為 Hook 依賴 (Dependency)？ | 核心定位 |
| :--- | :--- | :--- | :--- |
| **State** (`useState`) | **是** | 是 | **驅動者 (Driver)**：改變它，就是為了讓畫面或邏輯重新跑一遍。 |
| **RefObject** (`useRef`) | **否** | 否 | **存儲器 (Storage)**：改變它，只是為了「記住」值，不希望驚動 UI。 |
| **`IRefObjectMaybe<T>`** (通用型) | **視傳入情況而定** | 否 (通常不放) | **配置項 (Config)**：提供彈性，讓外部決定要不要驅動更新。 |
| **Memo** (`useMemo`) | **是** (計算結果變化時) | 是 (被記憶化的計算) | **派生者 (Deriver)**：從其他數據推導計算，保持引用穩定。 |

---

## 🛠️ 詳細判定指南

### 1. 什麼時候該用 State (`useState`)？

當該數據的「值」是 **UI 的一部分**，或 **邏輯的觸發開關** 時。

*   **關鍵問題**：如果這個值變了，使用者應該看到變化嗎？或是某個 Hook（如 `useSWR`, `useEffect`）應該立刻重新執行嗎？
*   **範例**：
    *   API 回傳的資料 (`data`)。
    *   分頁、搜尋關鍵字。
    *   控制 SWR 請求的 `activeKey`。
*   **重構信號**：如果你發現某個變數改變後，必須呼叫另一個 `set` 或觸發 `render` 才能生效，它就必須是 State。

```typescript
// ✅ activeKey 是 State：它的改變要驅動 SWR 重新發請求
const [activeKey, setActiveKey] = useState<string | null>(null);

useEffect(() => {
    if (shouldTrigger) {
        setActiveKey(newKey); // 改變 → SWR 重跑 → UI 更新
    }
}, [position]);

const { data } = useSWR(activeKey, fetcher); // activeKey 是 SWR 的驅動源
```

### 2. 什麼時候該用 RefObject (`useRef`)？

當該數據是 **純邏輯判定** 或 **實例引用**，且不直接參與渲染時。

*   **關鍵問題**：我是否需要「跨渲染週期」記住這個值，但又不希望值改變時導致畫面閃爍或多餘重繪？
*   **範例**：
    *   **邊界快取**：如你案例中的 `boundsRef`，只用來判定「要不要發請求」。
    *   **計時器 ID**：`setTimeout` 的 ID。
    *   **DOM 元素**：`inputRef`。
    *   **上一次的 Props**：用來做 PrevProps 比較。
*   **重構信號**：如果你發現某個 `useState` 產生的值，在程式碼中只出現在 `if` 判斷裡，從來沒出現在 JSX 中，請考慮將它重構成 RefObject 以優化效能。

```typescript
// ❌ 錯誤：triggerThresholdRangeBounds 只用於 if 判斷，卻用 State 存儲
const [triggerThresholdRangeBounds, setTriggerThresholdRangeBounds] = useState(null);
// ...
if (!isCoordWithinRange(coord, triggerThresholdRangeBounds)) { /* 發請求 */ }
// JSX 中完全沒有用到它 → 每次更新都白白觸發 re-render

// ✅ 正確：改用 Ref，靜默記憶，不驚動 UI
const boundsRef = useRef<{ trigger?: IGpsLngLatMinMax | null }>({});
// ...
if (!isCoordWithinRange(coord, boundsRef.current.trigger)) { /* 發請求 */ }
// onSuccess 中更新，零 re-render
onSuccess: (res) => { boundsRef.current.trigger = res.triggerThresholdRangeBounds; }
```

### 3. 什麼時候該用 `IRefObjectMaybe<T>` (`T | RefObject<T>`)？

當你在寫一個 **通用 Hook (Utility Hook)**，且希望由 **外部調用者** 決定數據的「反應式特性」時。
*   **判定情境**：
    *   **傳入 Value**：外部希望「只要這個設定一變，Hook 就立刻重跑」。需要即時響應。
    *   **傳入 RefObject**：外部希望「我改設定時 Hook 先別動，等你下次因為其他原因（如位置變動）自然觸發時才讀取」。不希望額外 re-render。
*   **範例**：
    *   `ignoreCacheCheck` 開關。
    *   自定義的 `enabled` 旗標。
*   **重構信號**：如果你正在寫一個 Library 給別人用，或者這個 Hook 會在很多不同場景出現，使用 `IRefObjectMaybe<T>` + `unwrapRefObject` 能提供最高水平的彈性。

```typescript
// Hook 簽名：外部決定 ignoreCheck 是否反應式
function useFacilityPointBlocksData(
    position: IGeoPointTupleLatLng,
    ignoreCheck?: IRefObjectMaybe<boolean>  // 接受 value 或 ref 都行
) {
    useEffect(() => {
        const shouldIgnore = unwrapRefObject(ignoreCheck); // 統一拆箱
        // ...
    }, [position]); // ignoreCheck 不在依賴陣列，不會額外觸發
}

// 調用端選擇：
useFacilityPointBlocksData(pos, true);           // 傳 value → 反應式
useFacilityPointBlocksData(pos, ignoreCheckRef); // 傳 ref   → 靜音
```

### 4. 什麼時候該用 Memo (`useMemo`)？

當該數據是 **可以從其他 State/Props 推導出來的計算結果**，且 **需要保持引用穩定** 時。
*   **關鍵問題**：
    *   這個值是否只是其他數據的「轉換」或「篩選」結果？
    *   是否需要在多次渲染間保持相同的引用（避免子組件不必要的 re-render）？
    *   計算成本是否較高，值得記憶化？
*   **範例**：
    *   **API 數據的轉換**：如 `fillFacilityPointData(batchData?.data)`，將原始 API 響應轉換為組件需要的格式。
    *   **派生狀態的封裝**：將多個相關數據封裝成單一回傳物件，確保引用穩定。
    *   **過濾/排序後的列表**：從原始列表派生的過濾結果。
    *   **計算屬性**：複雜的數據轉換或聚合。
*   **重構信號**：
    *   如果你發現自己為了「組裝回傳物件」而創建多個獨立的 `useState`，這些都應該用 `useMemo` 取代。
    *   如果子組件因為父組件傳入的物件引用變化而過度 re-render，使用 `useMemo` 保持引用穩定。

```typescript
// ❌ 錯誤：5 個 useState 各自存儲，onSuccess 裡 5 個 setXxx
const [data, setData] = useState(null);
const [categories, setCategories] = useState([]);
const [matchedRangeBounds, setMatchedRangeBounds] = useState(null);
// ... 還有 2 個

// ✅ 正確：全部從 batchData 派生，一個 useMemo 搞定
const { data: batchData, error, isLoading } = useSWR(activeKey, fetcher);

return useMemo(() => ({
    data: fillFacilityPointData(batchData?.data),
    categories: batchData?.categories ?? [],
    matchedRangeBounds: batchData?.matchedRangeBounds ?? null,
    triggerThresholdRangeBounds: batchData?.triggerThresholdRangeBounds ?? null,
    blockScanRangeBounds: batchData?.blockScanRangeBounds ?? null,
    error,
    isLoading,
}), [batchData, error, isLoading]);
// batchData 更新 → 所有派生值一起更新，引用穩定，子組件不會多餘 re-render
```

---

## 🏗️ 重構實戰流程 (Refactoring Workflow)

當你看到一段「笨重」的代碼（如你原本那堆 `useState`），請按照以下步驟清理：

### Step 1: 找出「真．驅動源」

找出那個**一旦改變，全世界都要跟著動**的變數。
*   在此案例中，是 `activeKey`。它動了，SWR 就動。

```typescript
// ✅ activeKey 才是真正的驅動源
// 它改變 → SWR 重跑 → batchData 更新 → UI 更新
const [activeKey, setActiveKey] = useState<string | null>(null);
```

### Step 2: 降級「靜態記憶」為 RefObject

找出那些**只在回調寫入、只在 `if` 裡讀取**的變數，它們不需要觸發渲染。
*   例如 `matchedRangeBounds`, `triggerThresholdRangeBounds`。這些本質上是「輔助判斷的記憶」，不應該是驅動 UI 的 State。

```typescript
// ❌ 重構前：3 個多餘的 useState，每次 onSuccess 都觸發 3 次 re-render
const [matchedRangeBounds, setMatchedRangeBounds] = useState(null);
const [triggerThresholdRangeBounds, setTriggerThresholdRangeBounds] = useState(null);
const [blockScanRangeBounds, setBlockScanRangeBounds] = useState(null);

// ✅ 重構後：合併為 1 個 Ref，onSuccess 更新時零 re-render
const boundsRef = useRef<{ trigger?: IGpsLngLatMinMax | null }>({});
// onSuccess: (res) => { boundsRef.current.trigger = res.triggerThresholdRangeBounds; }
```

### Step 3: 處理「外部配置」為 `IRefObjectMaybe<T>`

處理那些從參數傳進來的開關，讓外部決定是否需要反應式。
*   使用 `unwrapRefObject(config)` 在 Effect 內部「拆箱」。

```typescript
// ✅ 使用 unwrapRefObject 在 Effect 內部「拆箱」
// 無論外部傳 value 還是 ref，內部統一處理
const shouldIgnore = unwrapRefObject(ignoreCheck);
```

### Step 4: 轉化「派生數據」為 Memo

找出那些**可以從 API 結果推導出來**的值，用一個 `useMemo` 統一回傳。
*   例如 `categories`、`matchedRangeBounds`、`triggerThresholdRangeBounds`。這些都只是 `batchData` 的一部分，不需要自己的 `useState`。
*   **使用 `useMemo` 的好處**：
    *   確保回傳物件的 **引用穩定**（Referential Stability），避免子組件不必要的 re-render
    *   將多個相關數據封裝成單一回傳物件，簡化接口
    *   計算邏輯只在依賴項變化時執行，避免重複計算
*   **實作模式**：

    ```typescript
    // ❌ 重構前：data 和 categories 各自有 useState，onSuccess 裡各自 setXxx
    const [data, setData] = useState(fillFacilityPointData());
    const [categories, setCategories] = useState([]);

    // ✅ 重構後：全部從 batchData 派生，引用穩定，onSuccess 只需更新 boundsRef
    return useMemo(() => ({
        data: fillFacilityPointData(batchData?.data),
        matchedRangeBounds: batchData?.matchedRangeBounds ?? null,
        triggerThresholdRangeBounds: batchData?.triggerThresholdRangeBounds ?? null,
        blockScanRangeBounds: batchData?.blockScanRangeBounds ?? null,
        categories: batchData?.categories ?? [],
        error,
        isLoading,
    }), [batchData, error, isLoading]);
    ```

**最終成果**：你在重構 `useFacilityPointBlocksData` 時，將原本散落的 5 個 `useState` 壓縮成 1 個 `activeKey` (State) + 1 個 `boundsRef` (Ref) + 1 個 `useMemo` (Derived Data)，這正是這套指南最完美的實踐。

📚 完整重構案例：[useFacilityPointBlocksData 完整 Before/After](./react-state-ref-memo-refactoring.md) - `useFacilityPointBlocksData` 完整重構案例，展示 State + RefObject + useMemo 的優化模式

---

## 案例：State vs Ref - ManualLocationHandler

📚 完整案例（錯誤分析報告、重構前後對照、重構收益與關鍵教訓）：[React State/Ref/Memo 重構案例 - ManualLocationHandler 錯誤的 State 判斷邏輯](./react-state-ref-memo-refactoring.md)

---

## 📝 總結建議 (Pro Tips)

> **"State 是為了觸發，RefObject 是為了記住。"**

*   如果你想要 **Reactive (反應式)** → **State**。
*   如果你想要 **Performance (效能/靜音)** → **RefObject**。
*   如果你想要 **Polymorphic (多態/通用)** → **`IRefObjectMaybe<T>`**。
*   如果你想要 **Derived (派生計算)** → **useMemo**。

---

## 相關資源

- [React State/Ref/Memo 重構案例](./react-state-ref-memo-refactoring.md) - useFacilityPointBlocksData 完整 Before/After 與 ManualLocationHandler 錯誤判斷案例
- [React 組件重構模式](./react-component-refactoring-patterns.md)
- [主技能文件 code-refactoring-miscellaneous](../../SKILL.md)
