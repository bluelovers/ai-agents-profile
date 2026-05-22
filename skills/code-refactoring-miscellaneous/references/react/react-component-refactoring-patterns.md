---
description: React 組件重構模式 - 組件提取、條件渲染、參數傳遞優化等實用技巧
tags:
  - documentation/references
  - React
  - refactoring
  - react/components
  - patterns
---

# React 組件重構模式

本文檔記錄 React 組件重構的實用模式與技巧，基於實際專案中的重構經驗整理。

---

## 1. 組件提取與抽象化

### 概念

將內嵌在主組件中的複雜 JSX 結構提取為獨立的函數組件，提升可維護性和可重用性。

### 重構前：內嵌組件

```typescript
// ❌ 內嵌在主組件中，依賴外部變數
export default function FacilityMap() {
    const [data, setData] = useState([]);
    const handleClick = (item) => { /* ... */ };

    // 內嵌組件
    const BottomListPanel = () => (
        <Flex vertical style={{ background: token.colorBgContainer }}>
            <Typography.Title>附近設施點</Typography.Title>
            <DataList
                data={data}           // 直接依賴外部 state
                onClick={handleClick} // 直接依賴外部函數
            />
        </Flex>
    );

    return <Layout>{BottomListPanel()}</Layout>;
}
```

### 重構後：獨立組件

```typescript
// ✅ 提取為獨立組件，明確依賴
interface IBottomListPanelProps {
    data: IDataItem[];
    onItemClick: (item: IDataItem) => void;
    background?: string;
}

const BottomListPanel = (props: IBottomListPanelProps) => (
    <Flex vertical style={{ background: props.background }}>
        <Typography.Title>附近設施點</Typography.Title>
        <DataList
            data={props.data}
            onClick={props.onItemClick}
        />
    </Flex>
);

// 使用方式
export default function FacilityMap() {
    const [data, setData] = useState([]);
    const handleClick = (item) => { /* ... */ };

    return (
        <Layout>
            <BottomListPanel
                data={data}
                onItemClick={handleClick}
                background={token.colorBgContainer}
            />
        </Layout>
    );
}
```

### 收益

- **可重用性**：組件可在不同上下文中重用
- **類型安全**：明確的 props 類型定義
- **可測試性**：可獨立測試組件邏輯
- **依賴明確**：清楚知道組件需要哪些輸入

---

## 2. 條件渲染重構

### 概念

使用抽象組件處理複雜的條件渲染邏輯，避免重複的 JSX 結構。

### 重構前：重複的條件渲染

```typescript
// ❌ 地圖區域 JSX 重複定義
export default function FacilityMap() {
    const [displayMode, setDisplayMode] = useState<EnumDisplayMode>(EnumDisplayMode.SIDEBAR);

    return (
        <Layout>
            {displayMode === EnumDisplayMode.SIDEBAR ? (
                /* 側邊欄模式：僅地圖區域 */
                <Layout.Content>
                    <SearchPanel />
                    <MapContainer />
                    <MapControls />
                </Layout.Content>
            ) : (
                /* 底部面板模式：地圖 + 底部列表面板 */
                <Layout style={{ flex: 1 }}>
                    <Layout.Content>
                        <SearchPanel />
                        <MapContainer />
                        <MapControls />
                    </Layout.Content>
                    <BottomPanel />
                </Layout>
            )}
        </Layout>
    );
}
```

### 重構後：抽象佈局組件

```typescript
// ✅ 抽象佈局組件處理條件渲染
interface IConditionalLayoutProps {
    displayMode: EnumDisplayMode;
    children: React.ReactNode;
    bottomPanel?: React.ReactNode;
}

function ConditionalLayout(props: IConditionalLayoutProps) {
    if (props.displayMode !== EnumDisplayMode.SIDEBAR) {
        return (
            <Layout style={{ flex: 1 }}>
                {props.children}
                {props.bottomPanel}
            </Layout>
        );
    }
    return <>{props.children}</>;
}

// 使用方式
export default function FacilityMap() {
    const [displayMode, setDisplayMode] = useState<EnumDisplayMode>(EnumDisplayMode.SIDEBAR);

    const mapContent = (
        <Layout.Content>
            <SearchPanel />
            <MapContainer />
            <MapControls />
        </Layout.Content>
    );

    return (
        <Layout>
            <ConditionalLayout
                displayMode={displayMode}
                bottomPanel={<BottomPanel />}
            >
                {mapContent}
            </ConditionalLayout>
        </Layout>
    );
}
```

### 收益

- **消除重複**：避免地圖區域 JSX 的重複定義
- **邏輯集中**：條件渲染邏輯集中在一個地方
- **可維護性**：修改佈局邏輯只需修改一個地方
- **可讀性**：主組件結構更清晰

---

## 3. 參數傳遞優化

### 概念

明確組件依賴，避免隱式的閉包依賴，提升組件的獨立性。

### 重構前：隱式依賴

```typescript
// ❌ 組件直接依賴外部變數和函數
export default function FacilityMap() {
    const [data, setData] = useState([]);
    const [position, setPosition] = useState(null);
    const token = theme.useToken();

    const handleClick = (item) => {
        setPosition(item.location);
    };

    const BottomPanel = () => (
        <div style={{
            background: token.colorBgContainer,  // 直接依賴 token
            padding: '16px'
        }}>
            <DataList
                data={data}                    // 直接依賴外部 state
                onClick={handleClick}           // 直接依賴外部函數
                position={position}            // 直接依賴外部 state
            />
        </div>
    );

    return <BottomPanel />;
}
```

### 重構後：明確依賴

```typescript
// ✅ 組件接受明確的 props，避免隱式依賴
interface IBottomPanelProps {
    data: IDataItem[];
    onItemClick: (item: IDataItem) => void;
    currentPosition: IPosition | null;
    backgroundColor: string;
    padding?: string;
}

const BottomPanel = (props: IBottomPanelProps) => (
    <div style={{
        background: props.backgroundColor,
        padding: props.padding ?? '16px'
    }}>
        <DataList
            data={props.data}
            onClick={props.onItemClick}
            position={props.currentPosition}
        />
    </div>
);

// 使用方式
export default function FacilityMap() {
    const [data, setData] = useState([]);
    const [position, setPosition] = useState(null);
    const { token } = theme.useToken();

    const handleClick = (item) => {
        setPosition(item.location);
    };

    return (
        <BottomPanel
            data={data}
            onItemClick={handleClick}
            currentPosition={position}
            backgroundColor={token.colorBgContainer}
        />
    );
}
```

### 收益

- **依賴明確**：組件依賴通過 props 明確傳遞
- **可測試性**：可輕鬆模擬 props 進行測試
- **重用性**：組件不依賴外部上下文，更易重用
- **類型安全**：TypeScript 可檢查 props 的類型正確性

---

## 4. CSS 變數使用優化

### 概念

使用 CSS 變數而非直接使用 token 值，提升主題切換的靈活性。

### 重構前：直接使用 Token

```typescript
// ❌ 直接使用 token 值，不支援動態主題切換
const StyledPanel = () => {
    const { token } = theme.useToken();

    return (
        <div style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            color: token.colorText,
        }}>
            Panel Content
        </div>
    );
};
```

### 重構後：使用 CSS 變數

```typescript
// ✅ 使用 CSS 變數，支援動態主題切換
const StyledPanel = () => {
    return (
        <div style={{
            background: `var(--ant-color-bg-container)`,
            border: `1px solid var(--ant-color-border-secondary)`,
            color: `var(--ant-color-text)`,
        }}>
            Panel Content
        </div>
    );
};
```

### 收益

- **動態主題**：CSS 變數可在運行時動態更新
- **一致性**：確保樣式與主題系統保持同步
- **性能優化**：避免重複計算 token 值
- **主題切換**：支援實時主題切換無需重新渲染

---

## 5. 組件組合模式

### 概念

使用組件組合替代繼承，建立更靈活的組件結構。

### 重構前：複雜的單一組件

```typescript
// ❌ 單一組件處理所有邏輯
export default function ComplexMap() {
    const [mode, setMode] = useState<EnumEditMode>(EnumEditMode.VIEW);
    const [data, setData] = useState([]);
    const [selected, setSelected] = useState(null);

    // 大量的條件邏輯
    return (
        <Layout>
            {mode === EnumEditMode.VIEW && <ViewMode data={data} selected={selected} />}
            {mode === EnumEditMode.EDIT && <EditMode data={data} setData={setData} />}
            {mode === EnumEditMode.ADMIN && <AdminMode data={data} setData={setData} />}
        </Layout>
    );
}
```

### 重構後：組件組合

```typescript
// ✅ 使用組件組合，每個組件職責單一
interface IMapContainerProps {
    mode: EnumEditMode;
    data: IDataItem[];
    selected: IDataItem | null;
    onSelectionChange: (item: IDataItem | null) => void;
    onDataChange: (data: IDataItem[]) => void;
}

const MapContainer = (props: IMapContainerProps) => {
    const modeComponents = {
        [EnumEditMode.VIEW]: ViewMode,
        [EnumEditMode.EDIT]: EditMode,
        [EnumEditMode.ADMIN]: AdminMode
    };

    const ModeComponent = modeComponents[props.mode];

    return (
        <Layout>
            <ModeComponent
                data={props.data}
                selected={props.selected}
                onSelectionChange={props.onSelectionChange}
                onDataChange={props.onDataChange}
            />
        </Layout>
    );
};

// 使用方式
export default function ComplexMap() {
    const [mode, setMode] = useState<EnumEditMode>(EnumEditMode.VIEW);
    const [data, setData] = useState([]);
    const [selected, setSelected] = useState(null);

    return (
        <MapContainer
            mode={mode}
            data={data}
            selected={selected}
            onSelectionChange={setSelected}
            onDataChange={setData}
        />
    );
}
```

### 收益

- **單一職責**：每個組件只負責一種模式
- **可擴展性**：新增模式只需添加新組件
- **可測試性**：每個組件可獨立測試
- **可維護性**：邏輯分離，易於維護

---

## 6. Hook 抽象模式

### 概念

將複雜的狀態邏輯提取為自定義 Hook，提升邏輯重用性。

### 重構前：組件內複雜邏輯

```typescript
// ❌ 複雜的狀態邏輯混在組件中
export default function DataComponent() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});

    useEffect(() => {
        setLoading(true);
        fetchData(filters)
            .then(setData)
            .catch(setError)
            .finally(() => setLoading(false));
    }, [filters]);

    // 複雮的數據處理邏輯...
}
```

### 重構後：自定義 Hook

```typescript
// ✅ 提取為自定義 Hook
interface IUseDataOptions {
    filters: Record<string, any>;
    autoFetch?: boolean;
}

interface IUseDataReturn<T> {
    data: T[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    updateFilters: (filters: Record<string, any>) => void;
}

function useData<T = any>(options: IUseDataOptions): IUseDataReturn<T> {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [filters, setFilters] = useState(options.filters);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await apiService.fetchData<T>(filters);
            setData(result);
            setError(null);
        } catch (err) {
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        if (options.autoFetch !== false) {
            fetchData();
        }
    }, [fetchData, options.autoFetch]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        updateFilters: setFilters
    };
}

// 使用方式
export default function DataComponent() {
    const [filters, setFilters] = useState({});

    const { data, loading, error, refetch, updateFilters } = useData({
        filters,
        autoFetch: true
    });

    // 組件只專注於 UI 邏輯
}
```

### 收益

- **邏輯重用**：Hook 可在多個組件中重用
- **關注點分離**：UI 邏輯與業務邏輯分離
- **可測試性**：Hook 可獨立測試
- **類型安全**：明確的輸入輸出類型

---

## 7. 字串聯合重構為 Enum

### 概念

將分散的字串聯合類型重構為 Enum，提供更好的類型安全、IntelliSense 支援和重構能力。

### 重構前：字串聯合

```typescript
// ❌ 使用字串聯合，容易拼寫錯誤
type TDisplayMode = 'sidebar' | 'bottom';
type TEditMode = 'view' | 'edit' | 'admin';

export default function FacilityMap() {
    const [displayMode, setDisplayMode] = useState<TDisplayMode>('sidebar');
    const [editMode, setEditMode] = useState<TEditMode>('view');

    // 條件邏輯
    if (displayMode === 'sidebar') {
        // ...
    }

    // 容易拼寫錯誤
    if (editMode === 'veiw') { // ❌ 拼寫錯誤！
        // ...
    }
}
```

### 重構後：Enum

```typescript
// ✅ 使用 Enum，提供類型安全和 IntelliSense
export const enum EnumDisplayMode {
    /** 側邊欄模式 / Sidebar mode */
    SIDEBAR = 'sidebar',
    /** 底部面板模式 / Bottom panel mode */
    BOTTOM = 'bottom'
}

export const enum EnumEditMode {
    /** 檢視模式 / View mode */
    VIEW = 'view',
    /** 編輯模式 / Edit mode */
    EDIT = 'edit',
    /** 管理模式 / Admin mode */
    ADMIN = 'admin'
}

export default function FacilityMap() {
    const [displayMode, setDisplayMode] = useState<EnumDisplayMode>(EnumDisplayMode.SIDEBAR);
    const [editMode, setEditMode] = useState<EnumEditMode>(EnumEditMode.VIEW);

    // 條件邏輯 - 有 IntelliSense 支援
    if (displayMode === EnumDisplayMode.SIDEBAR) {
        // ...
    }

    // 編譯期檢查拼寫錯誤
    if (editMode === EnumEditMode.VEIW) { // ❌ 編譯錯誤！
        // ...
    }
}
```

### 收益

- **編譯期安全**：拼寫錯誤會在編譯期被發現
- **IntelliSense 支援**：IDE 提供自動完成和提示
- **重構能力**：可通過 IDE 全局重構 Enum 值
- **可讀性**：Enum 值更具語義性
- **類型推導**：TypeScript 能更好地推導類型

---

## 總結

這些重構模式遵循以下核心原則：

1. **單一職責原則**：每個組件只負責一個功能
2. **依賴注入**：通過 props 明確傳遞依賴
3. **組件組合**：使用組合替代繼承
4. **邏輯抽象**：將複雜邏輯提取為 Hook
5. **類型安全**：充分利用 TypeScript 的類型系統
6. **Enum 優先**：使用 Enum 替代字串聯合

通過應用這些模式，可以顯著提升 React 應用的可維護性、可重用性和類型安全性。
