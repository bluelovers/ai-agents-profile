---
name: code-refactoring-miscellaneous
description: >-
  Miscellaneous cases and concepts for TypeScript/Node.js refactoring, supplementing the core refactoring guide.
  Covers additional patterns, edge cases, and specialized refactoring techniques that don't fit into the core refactoring principles.
  Suitable for:
  (1) Handling complex refactoring scenarios,
  (2) Solving code smells not covered by standard guides,
  (3) Advanced TypeScript patterns,
  (4) Node.js specific considerations,
  (5) React/JSX/HTML/DOM specific considerations,
  and (6) Cross-domain concerns.
  Use this Skill when users ask about "miscellaneous refactoring", "edge cases", "advanced patterns", or when the core guide needs supplementation.
---

# TypeScript/Node.js Refactoring - Miscellaneous Cases and Concepts

You are an expert in handling complex and specialized refactoring scenarios that go beyond standard patterns.
This guide supplements the core refactoring principles, providing additional cases, edge conditions, and advanced techniques.

> **Purpose of this guide**:
> - **Handle edge cases**: Covers refactoring scenarios not addressed by standard patterns
> - **Advanced patterns**: Specialized techniques for complex TypeScript/Node.js situations
> - **Cross-domain concerns**: Refactoring considerations that span multiple domains
> - **Practical supplements**: Real-world complex situations and their solutions

[code-refactoring-expert-typescript](../code-refactoring-expert-typescript/SKILL.md) - Core refactoring principles

---

## Async/Await Edge Cases

### Parallel vs Sequential Execution

**Problem**: Unnecessary sequential execution of independent asynchronous operations.

#### Anti-pattern: Sequential execution of independent calls

```typescript
async function processUserData(userId: string) {
    const user = await fetchUser(userId);      // Wait for completion
    const profile = await fetchProfile(userId); // Wait for completion
    const settings = await fetchSettings(userId); // Wait for completion

    return { user, profile, settings };
}
```

#### Solution: Use Promise.all for parallel execution

```typescript
async function processUserData(userId: string) {
    const [user, profile, settings] = await Promise.all([
        fetchUser(userId),
        fetchProfile(userId),
        fetchSettings(userId)
    ]);

    return { user, profile, settings };
}
```

#### Advanced: Use Promise.allSettled for partial failures

```typescript
async function processUserDataSafe(userId: string) {
    const results = await Promise.allSettled([
        fetchUser(userId),
        fetchProfile(userId),
        fetchSettings(userId)
    ]);

    return {
        user: results[0].status === 'fulfilled' ? results[0].value : null,
        profile: results[1].status === 'fulfilled' ? results[1].value : null,
        settings: results[2].status === 'fulfilled' ? results[2].value : null,
        errors: results.filter(r => r.status === 'rejected').map(r => r.reason)
    };
}
```

### Async Generator Refactoring

**Problem**: Loading all data into memory when processing large datasets.

#### Anti-pattern: Load all data

```typescript
async function processAllRecords() {
    const allRecords = await fetchAllRecords(); // Could be millions of records!
    for (const record of allRecords) {
        await processRecord(record);
    }
}
```

#### Solution: Async generators

```typescript
async function* processRecordsGenerator(): AsyncGenerator<Record> {
    let cursor = null;
    do {
        const { records, nextCursor } = await fetchRecordsBatch(cursor);
        for (const record of records) {
            yield record;
        }
        cursor = nextCursor;
    } while (cursor);
}

async function processAllRecords() {
    for await (const record of processRecordsGenerator()) {
        await processRecord(record);
    }
}
```

---

## Advanced Type System Patterns

### Template Literal Types

**Problem**: Creating types from string patterns.

#### Solution: Use enums to create valid values

```typescript
enum EnumHttpMethod {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE'
}

type IEndpoint = `/api/${EnumHttpMethod}/${string}`;

function handleRequest(endpoint: IEndpoint) { /* ... */ }

handleRequest('/api/GET/users');    // Valid
handleRequest('/api/PATCH/users');  // Invalid
```

---

## External API Type-Safe Wrapper Pattern

### Overview

Wrap **loosely-typed external APIs** (like VS Code `Memento`, `localStorage`, etc.) into **strictly-typed internal interfaces**, achieving compile-time type safety and runtime data consistency.

### Core Problem

External APIs typically use `string` keys + `any` values for maximum flexibility:

```typescript
// External API type definitions are too loose
interface Memento {
    get<T>(key: string): T | undefined;     // key is any string
    update(key: string, value: any): void;  // value is any
}

// Problems from direct usage
context.globalState.get('serchHistory');        // Typo! Compiler won't complain
context.globalState.update('selectedIDEs', 'x'); // Type error! Should be number[]
```

### Wrapping Strategy

#### 1. Define key enum + key-value type mapping

```typescript
export const enum EnumGlobalStateName {
    searchHistory = 'searchHistory',
    selectedIDEs = 'selectedIDEs',
}

// Define value type for each key
export interface IGlobalStateSearchHistory {
    key: EnumGlobalStateName.searchHistory;
    value: string[];
}

export interface IGlobalStateSelectedIDEs {
    key: EnumGlobalStateName.selectedIDEs;
    value: number[];
}

export type IGlobalStateAll = IGlobalStateSearchHistory | IGlobalStateSelectedIDEs;
```

#### 2. Create type-safe wrapper class

```typescript
export class VscodeExtensionContextGlobalState {
    constructor(protected globalState: Memento) {}

    /**
     * Use generic conditional types to implement key-to-value type mapping
     * K extends EnumGlobalStateName: Restricts key to enum values
     * Extract<IGlobalStateAll, { key: K }>: Extracts matching interface from union type
     * T["value"]: Gets the value type of that interface
     */
    get<K extends EnumGlobalStateName, T extends Extract<IGlobalStateAll, { key: K }>>(
        key: K,
        defaultValue?: T["value"]
    ): T["value"] | undefined {
        return this.globalState.get(key, defaultValue);
    }

    update<K extends EnumGlobalStateName, T extends Extract<IGlobalStateAll, { key: K }>>(
        key: K,
        value: T["value"]
    ): Thenable<void> {
        return this.globalState.update(key, value);
    }
}
```

#### 3. Type-safe usage

```typescript
const state = new VscodeExtensionContextGlobalState(context.globalState);

// Key names have IntelliSense and compile-time checks
const history = state.get(EnumGlobalStateName.searchHistory);
//    ^? Type inferred as string[] | undefined

// Key name errors are caught immediately
state.get('serchHistory'); // Error: Type mismatch

// Value types have compile-time checks
state.update(EnumGlobalStateName.selectedIDEs, [1, 2, 3]);      // number[]
state.update(EnumGlobalStateName.selectedIDEs, 'invalid');      // Type error!
```

### Key Benefits

| Benefit | Description |
|---------|-------------|
| **Compile-time type safety** | Key name typos, value type errors caught at compile time |
| **IntelliSense** | IDE provides key name autocomplete and value type hints |
| **Refactorability** | Renaming enum values can be done via IDE global refactoring |
| **Backward compatibility** | When underlying external API changes, only modify the wrapper layer |

### Applicable Scenarios

- VS Code Extension's `globalState` / `workspaceState`
- Browser `localStorage` / `sessionStorage`
- Key-value database clients (Redis, etc.)
- Any `string` key + `any` value external API

### Advanced Usage: Abstract Class Integration

In large projects, integrate GlobalState wrapper into an abstract base class to simplify state management across multiple classes:

#### Pattern 1: Auto lazy-loading (recommended)

```typescript
/**
 * Auto-initialize GlobalState from ExtensionContext
 * Implement lazy-loading via getter
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

// Usage
export class MyController extends AbstractClassWithContextGlobalState
{
    async saveData(data: string[]): Promise<void>
    {
        await this.globalState.update(EnumGlobalStateName.searchHistory, data);
    }
}
```

#### Pattern 2: Factory function

```typescript
export function newVscodeExtensionContextGlobalState(globalState: ExtensionContext["globalState"])
{
    return new VscodeExtensionContextGlobalState(globalState);
}

// Usage
const state = newVscodeExtensionContextGlobalState(context.globalState);
```

**Full case reference**: [External API Type-Safe Wrapper Pattern](./references/external-api-type-safe-wrapper.md)

---

## DOM Selector Enum Pattern

### Overview

Refactor scattered and fragile **hardcoded DOM element IDs** and **CSS class selectors** in frontend applications into a unified Enum management system, establishing a **Single Source of Truth**.

### Problem Scenario

Using hardcoded strings to reference UI elements carries the following risks:

1. **Low maintainability and high coupling** - Business logic layer tightly coupled to low-level DOM positioning details
2. **Zero compiler safety checks** - Selector typos are only discovered at runtime
3. **Lack of developer experience** - IDE cannot provide autocomplete or cross-file refactoring support
4. **Hidden risks in HTML/JSX layer** - The problem isn't just in JavaScript logic code; **hardcoded `id` and `className` in HTML and JSX templates are also risk sources**. And compared to JS code, HTML/JSX maintenance is harder to spot issues (lack of type checking, opaque cross-file references), making them easier to miss during refactoring

#### Anti-pattern

```typescript
// Hardcoded IDs - difficult to maintain, error-prone
const element = document.getElementById('searchResults');
const input = document.getElementById('searchInput') as HTMLInputElement;

// Hardcoded CSS class selectors
const radio = document.querySelector<HTMLInputElement>('.ide-source-radio:checked');
```

### Solution: Two-Level Abstraction

#### Level 1: Physical Anchors

`EnumWebviewElemId` and `EnumCssClassSelector` - Define unified identifiers for DOM element IDs and CSS classes, serving as string bridges connecting code and HTML.

```typescript
/**
 * DOM element ID enum (Single Source of Truth)
 */
export const enum EnumWebviewElemId
{
    /** Search results container */
    searchResults = 'searchResults',
    /** Search input field */
    searchInput = 'searchInput',
    /** Message display container */
    message = 'message',
}

/**
 * CSS class selector enum (Single Source of Truth)
 */
export const enum EnumCssClassSelector
{
    /** Tab navigation container */
    tabs = 'tabs',
    /** IDE checkbox */
    ideCheckbox = 'ide-checkbox',
    /** IDE source radio button */
    ideSourceRadio = 'ide-source-radio',
}
```

#### Level 2: Business Semantic Identifiers

`EnumTabName` - Defines semantic identifiers for business states and behaviors (like tab names, operation modes), keeping logic code independent of DOM structure.

```typescript
/**
 * Tab name enum - Business semantic identifier
 */
export const enum EnumTabName
{
    /** Sync settings tab */
    sync = 'sync',
    /** View all settings tab */
    values = 'values',
    /** Selected settings tab */
    selected = 'selected',
}
```

### Helper Function Implementation

```typescript
/**
 * Query single element by EnumWebviewElemId
 */
export function querySelectorById<T extends HTMLElement>(id: EnumWebviewElemId | EnumTabName): T | null
{
    return document.getElementById(id) as T | null;
}

/**
 * Query single element by EnumCssClassSelector
 */
export function querySelectorByClass<T extends HTMLElement>(classSelector: EnumCssClassSelector, suffix?: string): T | null
{
    return document.querySelector<T>(`.${classSelector}${suffix ?? ''}`);
}

/**
 * Query all elements by EnumCssClassSelector
 */
export function querySelectorAllByClass<T extends HTMLElement>(classSelector: EnumCssClassSelector, suffix?: string): NodeListOf<T>
{
    return document.querySelectorAll<T>(`.${classSelector}${suffix ?? ''}`);
}
```

### Usage Examples

```typescript
// Using Enum - type safe, maintainable
import { EnumWebviewElemId, EnumCssClassSelector, EnumTabName } from './scripts/elem-get';

// Basic element query
const searchResults = querySelectorById<HTMLDivElement>(EnumWebviewElemId.searchResults);

// With pseudo-class selector
const checkedRadio = querySelectorByClass<HTMLInputElement>(
    EnumCssClassSelector.ideSourceRadio,
    ':checked'
);

// Tab switching logic - using business semantic identifiers
ALL_TAB_NAMES.forEach(tabName => {
    const el = querySelectorById<HTMLDivElement>(tabName);
    el?.classList.toggle('active', tabName === currentTab);
});
```

### Architecture-Level Benefits

1. **Single Source of Truth** - All selector definitions centralized in Enum files, modify one place and it applies globally
2. **Compile-time safety guarantees** - TypeScript compiler catches references to non-existent Enum values
3. **Testability and isolation** - Business logic can be unit tested independently of DOM environment
4. **IDE support and DX** - Autocomplete, refactoring support, navigation features improve development efficiency
5. **Discoverability** - New developers can quickly find all available selectors

### Naming Conventions

| Type | Naming Pattern | Example | Responsibility Level |
| :--- | :--- | :--- | :--- |
| **DOM ID** | `Enum{Name}ElemId` | `EnumWebviewElemId` | Physical locator (low-level) |
| **CSS Class** | `Enum{Name}ClassSelector` | `EnumCssClassSelector` | Physical locator (low-level) |
| **Tab/State** | `Enum{Name}` (standalone) | `EnumTabName` | Business semantic identifier (high-level) |

### HTML & JSX Integration (Important! Higher maintenance difficulty)

**Why this is especially important**:

Many developers only focus on refactoring JavaScript logic code, but overlook the hardcoding issues in the **HTML/JSX template layer**. In fact, **HTML/JSX maintenance difficulty is often higher than JS code**:

- **Lack of type protection**: `id="sync"` in JSX doesn't go through TypeScript compiler checks, typos can only be discovered at runtime
- **Opaque cross-file references**: JS code can track variable references, but strings in HTML have no explicit connection to logic code, making them easy to miss when modifying
- **Visual contract layer semantic fracture**: HTML/JSX is the **visual contract layer** of frontend applications. Using hardcoded strings directly at this layer causes semantic fractures and runtime bombs

#### Full Page Structure

```jsx
// Before - Hardcoded IDs
<div id="sync" className="tab-content active">
  <div className="section">
    <h2>Search & Sync Settings</h2>
    <div className="search-container">
      <input type="text" className="search-input" id="searchInput" />
    </div>
    <div id="searchResults" className="results-container">
      {/* Search results */}
    </div>
  </div>
</div>

// After - Using Enums
<div id={EnumTabName.sync} className="tab-content active">
  <div className="section">
    <h2>Search & Sync Settings</h2>
    <div className="search-container">
      <input
        type="text"
        className="search-input"
        id={EnumWebviewElemId.searchInput}
      />
    </div>
    <div id={EnumWebviewElemId.searchResults} className="results-container">
      {/* Search results */}
    </div>
  </div>
</div>
```

#### Navigation Component

```typescript
// Before - Hardcoded tab names
export function SettingsNavigation()
{
  return (
    <>
      <button className={`tab${activeTab === 'sync' ? ' active' : ''}`}
        onClick={() => setActiveTab('sync')}>Sync</button>
      <button className={`tab${activeTab === 'values' ? ' active' : ''}`}
        onClick={() => setActiveTab('values')}>Values</button>
    </>
  );
}

// After - Using EnumTabName
export function SettingsNavigation()
{
  return (
    <>
      {ALL_TAB_NAMES.map(tabName => (
        <button
          key={tabName}
          className={`tab${activeTab.value === tabName ? ' active' : ''}`}
          onClick={() => { activeTab.value = tabName; }}
        >
          {getTabLabel(tabName)}
        </button>
      ))}
    </>
  );
}
```

---

## Class Member Access Modifier Best Practices

### Default to `protected` Instead of `private`

Unless there are special requirements or explicit user requests, **`private` is not recommended**. It is recommended to **default to `protected`** for handling non-public members.

#### Reasons

- **Supports internal inheritance**: When a class needs to be inherited (even internally), `protected` allows subclasses to access parent class members, while `private` completely blocks access
- **Avoids breaking changes during refactoring**: If the class needs to be extended for inheritance later, changing from `private` to `protected` is a breaking change
- **TypeScript's soft restriction**: TypeScript's `private` is only checked at compile time, and can still be accessed at runtime; in comparison, `protected` provides reasonable encapsulation while retaining extension flexibility

#### Example

```typescript
// Not recommended: Overly restrictive, blocking inheritance possibilities
class DataProcessor {
    private cache = new Map<string, unknown>();
    private logger = console;

    process(data: unknown) {
        this.logger.log('Processing...');
        // Subclass cannot access this.cache and this.logger
    }
}

// Recommended: Retain inheritance extension flexibility
class DataProcessor {
    protected cache = new Map<string, unknown>();
    protected logger = console;

    process(data: unknown) {
        this.logger.log('Processing...');
        // Subclass can normally access and override these members
    }
}

// Works normally during internal inheritance
class ExtendedDataProcessor extends DataProcessor {
    async processAsync(data: unknown) {
        // Can access parent's protected members
        this.logger.log('Async processing...');
        const cached = this.cache.get('key');
        // ...
    }
}
```

#### Exceptions

The following situations **may still consider using `private`**:

1. **Strict encapsulation requirements**: When a member is purely internal implementation detail, and definitely won't be needed by inheriting classes
2. **Clear design intent**: When the team has an explicit agreement that certain members absolutely should not be overridden or accessed

> **Summary**: `protected` is a safer default choice, it strikes a balance between encapsulation and extensibility, avoiding refactoring difficulties due to over-restriction.

---

## React State/Ref/Memo Decision Guide

This is a guide for choosing between **State**, **RefObject**, **`IRefObjectMaybe<T>` (Value/RefObject)**, and **Memo** during React refactoring. You can apply this logic when developing hooks or making decisions in complex components.

---

## React Data Flow Decision Matrix

| Data Type | Does it need UI update on change? | As Hook Dependency? | Core Positioning |
| :--- | :--- | :--- | :--- |
| **State** (`useState`) | **Yes** | Yes | **Driver**: Change it to trigger re-render of UI or logic. |
| **RefObject** (`useRef`) | **No** | No | **Storage**: Change it just to "remember" the value, don't want to disturb UI. |
| **`IRefObjectMaybe<T>`** (generic type) | **Depends on input** | No (usually not placed) | **Config**: Provides flexibility, lets external decide whether to drive updates. |
| **Memo** (`useMemo`) | **Yes** (when computed result changes) | Yes (memoized computation) | **Deriver**: Compute from other data, keep reference stable. |

---

## Detailed Decision Guide

### 1. When to use State (`useState`)?

When the data's "value" is **part of the UI**, or **logic trigger switch**.
*   **Key question**: If this value changes, should the user see the change? Or should a Hook (like `useSWR`, `useEffect`) immediately re-execute?
*   **Examples**:
    *   API returned data (`data`).
    *   Pagination, search keywords.
    *   `activeKey` controlling SWR requests.
*   **Refactoring signal**: If you find that after a variable changes, you must call another `set` or trigger `render` to take effect, it must be State.

### 2. When to use RefObject (`useRef`)?

When the data is **pure logic determination** or **instance reference**, and doesn't directly participate in rendering.
*   **Key question**: Do I need to "remember" this value across render cycles, but don't want value changes to cause screen flickering or unnecessary re-renders?
*   **Examples**:
    *   **Boundary cache**: Like `boundsRef` in your case, only used to determine "whether to send a request".
    *   **Timer ID**: `setTimeout` ID.
    *   **DOM element**: `inputRef`.
    *   **Previous Props**: Used for PrevProps comparison.
*   **Refactoring signal**: If you find that a value produced by `useState` only appears in `if` statements in your code, never appears in JSX, consider refactoring it to RefObject for performance optimization.

### 3. When to use `IRefObjectMaybe<T>` (`T | RefObject<T>`)?

When writing a **utility Hook**, and want the **external caller** to decide the "reactive nature" of the data.
*   **Decision scenarios**:
    *   **Passing Value**: External wants "as soon as this config changes, Hook immediately reruns".
    *   **Passing RefObject**: External wants "don't move Hook when I change config, read me next time you rerun for other reasons (like position change)".
*   **Examples**:
    *   `ignoreCacheCheck` switch.
    *   Custom `enabled` flag.
*   **Refactoring signal**: If you're writing a library for others to use, or this Hook will appear in many different scenarios, using `IRefObjectMaybe<T>` + `unwrapRefObject` provides the highest level of flexibility.

### 4. When to use Memo (`useMemo`)?

When the data is **a computation result that can be derived from other State/Props**, and **needs to maintain reference stability**.
*   **Key questions**:
    *   Is this value just a "transformation" or "filtering" result of other data?
    *   Does it need to maintain the same reference across multiple renders (to avoid unnecessary child component re-renders)?
    *   Is the computation cost high enough to justify memoization?
*   **Examples**:
    *   **API data transformation**: Like `fillFacilityPointData(batchData?.data)`, transforming raw API response into format needed by component.
    *   **Derived state encapsulation**: Encapsulating multiple related data into a single return object, ensuring reference stability.
    *   **Filtered/sorted list**: Filtering results derived from original list.
    *   **Computed properties**: Complex data transformation or aggregation.
*   **Refactoring signals**:
    *   If you find yourself creating multiple independent `useState` just to "assemble return object", these should all be replaced with `useMemo`.
    *   If child components over re-render because parent component's object reference changes, use `useMemo` to maintain reference stability.

---

## Refactoring Workflow

When you see "clunky" code (like that pile of `useState`), clean it up following these steps:

### Step 1: Find the "True Driver Source"

Find that variable that **once changed, everything must follow**.
*   In your case, it's `activeKey`. When it moves, SWR moves.

### Step 2: Downgrade "Static Memory" to RefObject

Find those variables that **only write in `onSuccess`, only read in `if`**.
*   For example `matchedRangeBounds`, `triggerThresholdRangeBounds`. These are essentially "auxiliary judgment memory", shouldn't be State that drives UI.

### Step 3: Handle "External Config" as `IRefObjectMaybe<T>`

Handle switches passed in from parameters.
*   Use `unwrapRefObject(config)` to "unbox" inside Effect.

### Step 4: Transform "Derived Data" to Memo

Find values that **can be derived from API results**.
*   For example `categories`, `matchedRangeBounds`, `triggerThresholdRangeBounds`. These are all just parts of `batchData`, don't need their own `useState`.
*   **Benefits of using `useMemo`**:
    *   Ensures **referential stability** of return objects, avoiding unnecessary child component re-renders
    *   Encapsulates multiple related data into a single return object, simplifying interface
    *   Computation logic only executes when dependencies change, avoiding duplicate computation
*   **Implementation pattern**:
    ```typescript
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

---

## Error Handling & Refactoring Patterns

📚 **Complete case reference**: [React Component Refactoring Patterns - Component extraction, conditional rendering, parameter passing optimization and other practical tips](./references/react/react-component-refactoring-patterns.md)

### Concept

Refactor scattered error handling logic into unified error handling patterns to improve code robustness and maintainability.

### Before: Scattered Error Handling

```typescript
// ❌ Error handling logic scattered, lacks consistency
async function fetchUserData(userId: string) {
    try {
        const user = await fetchUser(userId);
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
}

async function fetchUserProfile(userId: string) {
    try {
        const profile = await fetchProfile(userId);
        return profile;
    } catch (error) {
        console.error('Failed to fetch profile:', error);
        return null;
    }
}
```

### After: Unified Error Handling

```typescript
// ✅ Unified error handling pattern
interface IApiError {
    code: string;
    message: string;
    details?: unknown;
}

type TResult<T> =
    | { success: true; data: T }
    | { success: false; error: IApiError };

async function safeApiCall<T>(
    apiCall: () => Promise<T>,
    context: string
): Promise<TResult<T>> {
    try {
        const data = await apiCall();
        return { success: true, data };
    } catch (error) {
        const apiError: IApiError = {
            code: 'API_ERROR',
            message: `Failed to ${context}`,
            details: error
        };

        console.error(`${context} error:`, apiError);
        return { success: false, error: apiError };
    }
}

// Using unified error handling
async function fetchUserData(userId: string) {
    const result = await safeApiCall(() => fetchUser(userId), 'fetch user');
    return result.success ? result.data : null;
}

async function fetchUserProfile(userId: string) {
    const result = await safeApiCall(() => fetchProfile(userId), 'fetch profile');
    return result.success ? result.data : null;
}
```

### Benefits

- **Consistency**: All API calls use the same error handling pattern
- **Type Safety**: Clear success/failure type definitions
- **Traceability**: Unified error log format
- **Extensibility**: Easy to add retry, fallback, and other logic

---

## React Component Refactoring Patterns

### Concept

Refactor complex logic in React components into clearer, more maintainable patterns.

### Component Extraction & Abstraction

**Before**: Inline component depends on external variables
```typescript
const BottomListPanel = () => (
    <Flex vertical style={{ background: token.colorBgContainer }}>
        <DataList data={data} onClick={handleClick} />
    </Flex>
);
```

**After**: Independent component with explicit dependencies
```typescript
interface IBottomListPanelProps {
    data: IDataItem[];
    onItemClick: (item: IDataItem) => void;
    background?: string;
}

const BottomListPanel = (props: IBottomListPanelProps) => (
    <Flex vertical style={{ background: props.background }}>
        <DataList data={props.data} onClick={props.onItemClick} />
    </Flex>
);
```

### Conditional Rendering Refactoring

**Before**: Repeated JSX structure
```typescript
{displayMode === 'sidebar' ? (
    <Layout.Content>...</Layout.Content>
) : (
    <Layout style={{ flex: 1 }}>
        <Layout.Content>...</Layout.Content>
        <BottomPanel />
    </Layout>
)}
```

**After**: Abstract layout component
```typescript
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
```

### Parameter Passing Optimization

**Before**: Implicit dependency on external variables
**After**: Explicit props passing, improving component independence

### CSS Variable Usage Optimization

**Before**: Direct token value usage
**After**: Using CSS variables to support dynamic theme switching

### Component Composition Pattern

**Before**: Complex single component
**After**: Using component composition instead of inheritance

### Hook Abstraction Pattern

**Before**: Complex logic within component
**After**: Extract into custom hooks

### Benefits

- **Reusability**: Components and logic can be used in multiple places
- **Maintainability**: Logic separation, easy to modify
- **Type Safety**: Clear input/output types
- **Testability**: Each part can be tested independently

---

## Data Validation Refactoring Patterns

### Concept

Refactor scattered validation logic into reusable validator patterns to improve code reusability and type safety.

### Before: Inline Validation

```typescript
// ❌ Validation logic scattered, difficult to reuse
function createUser(userData: any) {
    if (!userData.name || typeof userData.name !== 'string') {
        throw new Error('Name is required and must be string');
    }

    if (!userData.email || !userData.email.includes('@')) {
        throw new Error('Valid email is required');
    }

    if (userData.age && (typeof userData.age !== 'number' || userData.age < 0)) {
        throw new Error('Age must be a positive number');
    }

    // Create user logic...
}
```

### After: Validator Pattern

```typescript
// ✅ Reusable validator pattern
interface IValidationRule<T> {
    validate: (value: T) => string | null;
    required?: boolean;
}

interface IValidator<T> {
    rules: IValidationRule<T>[];
    validate: (value: T) => string[];
}

// Create validator factory
function createValidator<T>(rules: IValidationRule<T>[]): IValidator<T> {
    return {
        rules,
        validate: (value: T): string[] => {
            const errors: string[] = [];

            for (const rule of rules) {
                if (!rule.required && (value === undefined || value === null)) {
                    continue;
                }

                const error = rule.validate(value);
                if (error) {
                    errors.push(error);
                }
            }

            return errors;
        }
    };
}

// Common validation rules
const ValidationRules = {
    required: (message: string): IValidationRule<string> => ({
        validate: (value) => !value ? message : null,
        required: true
    }),

    email: (): IValidationRule<string> => ({
        validate: (value) => {
            if (!value) return null;
            return !value.includes('@') ? 'Invalid email format' : null;
        }
    }),

    positiveNumber: (message: string): IValidationRule<number> => ({
        validate: (value) => {
            if (value === undefined) return null;
            return typeof value !== 'number' || value < 0 ? message : null;
        }
    })
};

// Using validator
const userValidator = createValidator({
    name: ValidationRules.required('Name is required'),
    email: [ValidationRules.required('Email is required'), ValidationRules.email()],
    age: ValidationRules.positiveNumber('Age must be positive')
});

interface IUserData {
    name: string;
    email: string;
    age?: number;
}

function createUser(userData: IUserData) {
    const errors = [
        ...userValidator.validate(userData.name),
        ...userValidator.validate(userData.email),
        ...userValidator.validate(userData.age)
    ];

    if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    // Create user logic...
}
```

### Benefits

- **Reusability**: Validation rules can be used in multiple places
- **Composability**: Multiple validation rules can be combined
- **Type Safety**: Clear input/output types
- **Testability**: Each validation rule can be tested independently

---

## Summary & Pro Tips

> **"State is for triggering, RefObject is for remembering."**

*   If you want **Reactive** → **State**.
*   If you want **Performance (silent)** → **RefObject**.
*   If you want **Polymorphic (generic)** → **`IRefObjectMaybe<T>`**.
*   If you want **Derived (computed)** → **useMemo**.

When refactoring `useFacilityPointBlocksData`, compressing the originally scattered 5 `useState` into 1 `activeKey` (State) + 1 `boundsRef` (Ref) + 1 `useMemo` (Derived Data), this is the perfect practice of this guide.

- [React State/Ref/Memo Refactoring Case](./references/react/react-state-ref-memo-refactoring.md) - `useFacilityPointBlocksData` complete refactoring case, demonstrating State + RefObject + useMemo optimization pattern

---

## Barrel Index Avoidance Rule

### Overview

**Barrel index** (also known as "barrel file" or "index barrel") is a pattern where a central `index.ts` file re-exports multiple modules to simplify import paths.

#### What is a Barrel Index?

```typescript
// ❌ Barrel file pattern (index.ts)
// Instead of importing from specific files, you re-export everything through a central file
export * from './UserService';
export * from './OrderService';
export * from './ProductService';

// Usage - shorter but opaque import paths
import { UserService, OrderService } from './services';  // Imports from index.ts
```

```typescript
// ✅ Direct import from source files (recommended)
import { UserService } from './services/UserService';
import { OrderService } from './services/OrderService';
import { ProductService } from './services/ProductService';
```

### Why Avoid Barrel Index?

#### 1. **Hidden Dependencies**

Barrel files obscure the actual module dependencies, making it difficult to understand what a file truly depends on.

```typescript
// ❌ With barrel - unclear what dependencies are actually used
import { UserService, OrderService } from './services';

// ✅ Without barrel - explicit, clear dependencies
import { UserService } from './services/UserService';
import { OrderService } from './services/OrderService';
```

#### 2. **Tree Shaking Problems**

Barrel exports can interfere with tree shaking in bundlers like Webpack, Rollup, or ESBuild, potentially increasing bundle size because the bundler cannot easily eliminate unused exports.

```typescript
// Even if you only use UserService, the barrel file may cause
// all services to be included in the bundle
import { UserService } from './services';  // May include OrderService, ProductService too!
```

#### 3. **IDE & Tooling Limitations**

- **Find All References**: IDE cannot track which specific file exports a symbol
- **Rename Refactoring**: Global rename may break things unexpectedly
- **Navigation**: "Go to Definition" takes you to the barrel file instead of the actual source
- **Circular Dependency Detection**: Harder to detect circular dependencies

#### 4. **Compilation Performance**

TypeScript needs to process all re-exports even when only one module is needed, which can slow down compilation in large projects.

#### 5. **Maintenance Issues**

When a module is removed or renamed, the barrel file must be updated, creating an additional maintenance burden and potential for stale references.

### Rule: Import from Source Paths Directly

**Unless explicitly requested by the user or project requirements, do not create or use barrel index files. All modules should be imported directly from their source paths.**

```typescript
// ❌ Avoid - using barrel index
import { UserService } from '../services';  // Ambiguous path

// ✅ Recommended - explicit source path
import { UserService } from '../services/UserService';
```

### When Barrel Index Might Be Acceptable

Only use barrel index when **explicitly required** by:

1. **Public API design**: When designing a library's public interface where you want to provide a clean, unified entry point
2. **Project conventions**: When the project has an established convention requiring barrel files
3. **Backward compatibility**: When maintaining legacy code that already uses barrel files extensively

Even in these cases, carefully weigh the trade-offs.

### Best Practice: Explicit Imports

```typescript
// ✅ Clear, explicit imports - preferred style
import { UserService } from './services/UserService';
import { OrderService } from './services/OrderService';
import { ProductService } from './services/ProductService';

// ✅ For multiple imports from the same module, use namespace import or named imports
import * as UserModule from './services/UserService';
import { UserService, IUserRepository } from './services/UserService';
```

### Migration Strategy

#### Gradual Migration (Recommended for Legacy Codebases)

If your project already has widespread barrel files, avoid a big-bang rewrite. Instead, follow a gradual approach:

1. **New modules**: Do NOT create new barrel files or add exports to existing ones
2. **During refactoring**: When you touch a file, prefer converting its barrel imports to direct source imports
3. **No forced migration**: Don't change imports that aren't being actively modified — let it happen organically
4. **Final cleanup**: Once all imports have been converted, remove the now-unused barrel files

#### Full Migration (For New Projects or Small Codebases)

If the project is new or small enough, you can migrate all at once:

1. **Identify barrel files**: Find all `index.ts` files that only re-export
2. **Update imports**: Replace barrel imports with direct source imports
3. **Remove barrel files**: Delete the now-unused barrel files

---

## Reference Resources

- [Martin Fowler - Refactoring](https://refactoring.com/)
- [Single Source of Truth Design Pattern](https://en.wikipedia.org/wiki/Single_source_of_truth)
- [TypeScript Design Patterns](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Functional Error Handling in TypeScript](https://dev.to/gcanti/functional-error-handling-in-typescript-2g5o)
- [TypeScript Enum Documentation](https://www.typescriptlang.org/docs/handbook/enums.html)

## Related Skills

- [code-refactoring-expert-typescript](../code-refactoring-expert-typescript/SKILL.md) - Core refactoring principles
- [typescript-unimplemented-handler](../typescript-unimplemented-handler/SKILL.md) - Handling TypeScript limitations

## Further Reading

- [External API Type-Safe Wrapper Pattern](./references/external-api-type-safe-wrapper.md) - Wrapping loosely-typed external APIs (like VS Code Memento) into strictly-typed internal interfaces
- [DOM Selector Enum Pattern - Full Reference](./references/dom-selector-enum-pattern.md) - Detailed HTML/JSX integration examples and advanced applications
- [React Component Refactoring Patterns](./references/react/react-component-refactoring-patterns.md) - React component extraction, conditional rendering, parameter passing optimization and other practical tips
