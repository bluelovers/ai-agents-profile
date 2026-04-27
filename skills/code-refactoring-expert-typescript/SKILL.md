---
name: code-refactoring-expert-typescript
description: >-
  Modern TypeScript/Node.js refactoring and design guide, focusing on type safety, async flow optimization, single source of truth, and other modern design principles. Suitable for: (1) refactoring existing TypeScript/Node.js code, (2) design decision reference when implementing new features, (3) identifying and fixing TS/Node-specific code smells, (4) establishing team coding standards and best practices. Use this Skill when users request "Refactor TS", "Refactor TypeScript", "Node.js code improvement", or need "implementation design guidance".
---

# TypeScript/Node.js Refactoring Expert

You are an expert in modern TypeScript and Node.js development refactoring. You follow classic refactoring principles (Martin Fowler) while incorporating modern professional considerations for type systems, asynchronous flows, and Node.js runtime characteristics.

> 📋 **Dual Purpose of This Guide**:
> - **Refactor existing code**: Identify smells, safe refactoring, gradual improvement
> - **Design reference for new features**: Prevent smells, establish correct type structures, follow best practices
>
> Refactoring is not just about "fixing past mistakes" but "establishing future standards". The principles and techniques in this document apply equally to design decisions starting from scratch.

---

## Golden Rules

1. **Never change behavior during refactoring** - Keep refactoring and feature changes in separate commits
2. **Have tests before refactoring** - If tests don't exist, write them first
3. **Make small, incremental changes** - Each step should be independently verifiable
4. **Keep the code working** - System should pass tests after every change
5. **Code is written for humans** - Computers can execute vague and complex code, but **your future self in six months** and the **maintenance team** need to understand intent and design. Clear code is more valuable than "clever" code before refactoring

---

## Code Smell Identification

### Bloaters

| Smell | Description | TS/Node Adjustment |
|-------|-------------|-------------------|
| **Long Method** | Method >20 lines | If contains multiple `async`/`await`, treat as **Asynchronous Bottleneck**, decompose I/O operations |
| **Large Class** | Class >200 lines | Applicable |
| **Primitive Obsession** | Primitive type obsession | Use `interface`/`enum` to build type hierarchy; **use `{ lng, lat }` object instead of `[number, number]` for coordinates, avoiding implicit errors caused by order confusion between `[lat, lng]` and `[lng, lat]`** (see geo-transform case) |
| **Long Parameter List** | Parameter list >3 items | Modern TS uses Options Pattern, relax to complexity-driven |
| **Data Clumps** | Data clumps | Apply **SSoT principle**, use `extends` or nested composition |

### Object-Orientation Abusers

| Smell | Description | TS/Node Adjustment |
|-------|-------------|-------------------|
| **Switch Statements** | Switch statements | Discriminated Unions with switch are type-safe best practices, not inherently bad |
| **Parallel Inheritance Hierarchies** | Parallel inheritance hierarchies | Applicable |
| **Refused Bequest** | Refused bequest | Applicable |

### Change Preventers

| Smell | Description | TS/Node Adjustment |
|-------|-------------|-------------------|
| **Divergent Change** | Divergent change | Applicable |
| **Shotgun Surgery** | Shotgun surgery | Applicable |
| **Feature Envy** | Feature envy | Applicable |

### Dispensables

| Smell | Description | TS/Node Adjustment |
|-------|-------------|-------------------|
| **Dead Code** | Dead code | Additional consideration: check for unreleased resources or event listeners (Memory Leak Risk) |
| **Duplicate Code** | Duplicate code | Applicable |
| **Speculative Generality** | Speculative generality | Applicable |
| **Comments** | Excessive comments | Applicable |

### Couplers

| Smell | Description | TS/Node Adjustment |
|-------|-------------|-------------------|
| **Inappropriate Intimacy** | Inappropriate intimacy | Applicable |
| **Message Chains** | Message chains | Applicable |
| **Middle Man** | Middle man | Applicable |

---

## TypeScript Modern Design Principles

### 1. Single Source of Truth (SSoT)

**Core Concept:** Composition over Duplication. When multiple data structures share the same underlying data, that underlying data must be extracted as an independent type.

**Applies to:** `Data Clumps`, `Primitive Obsession`

#### ❌ Anti-pattern: Scattered Definitions

```typescript
// Coordinate definitions repeated in multiple places
export interface IGeoBounds {
    northWest: { lng: number; lat: number; };  // Repeated definition
    northEast: { lng: number; lat: number; };  // Repeated definition
    southWest: { lng: number; lat: number; };  // Repeated definition
    southEast: { lng: number; lat: number; };  // Repeated definition
}

export interface IStationBase {
    lng: number;  // Repeated again
    lat: number;  // Repeated again
    dataType: EnumDatasetType;
    name: string;
    address: string;
}
}
```

#### ✅ Correct: Single Source + Composition

```typescript
/**
 * Geographic coordinate - Single source of truth
 * Geographic coordinate - Single source of truth
 */
export interface IGeoCoord {
    lng: number;
    lat: number;
}

/**
 * Geographic bounds - Composed from IGeoCoord
 * Geographic bounds - Composed from IGeoCoord
 */
export interface IGeoBounds {
    northWest: IGeoCoord;
    northEast: IGeoCoord;
    southWest: IGeoCoord;
    southEast: IGeoCoord;
}

/**
 * Station base info - Extends IGeoCoord
 * Station base info - Extends IGeoCoord
 */
export interface IStationBase extends IGeoCoord {
    dataType: EnumDatasetType;
    category?: string;
    name: string;
    address: string;
}
```

#### Refactoring Guide

| Check | Action |
|-------|--------|
| Are there repeated property groups? | Execute `Extract Interface/Type` |
| Can inheritance relationship be established? | Use `extends` or nested composition |
| Do modifications require changes in multiple places? | Confirm violation of SSoT, needs refactoring |

#### 💡 Advanced Technique: Tuple Semantic Annotation

When you must use array format (e.g., compatible with third-party libraries' `[lat, lng]`), TypeScript supports adding JSDoc annotations to each element, giving arrays clear semantics:

```typescript
/**
 * Note: Array is typically Leaflet/Google Maps convention [lat, lng]
 * y lat first, x lng second. Do not use this format unless necessary.
 */
export type IGeoPointTupleLatLng = [
    /** y lat latitude / Latitude */
    lat: number,
    /** x lng longitude / Longitude */
    lng: number,
];
```

**Benefits:**
- IDE shows semantics for each position (hover shows `lat: number` instead of `number`)
- Prevents order confusion between `[lng, lat]` and `[lat, lng]` at syntax level
- Compared to object form `{ lng, lat }`, retains array's lightweight nature while improving readability

---

### 2. Strict Type Control

**Core Concept:** When business logic defines a finite set of states, **prefer Enum over string union types**. String union types are erased after compilation, losing IDE support and runtime checking capabilities; Enums provide complete development experience and runtime safety.

**Applies to:** `Primitive Obsession`, business state definitions

#### ❌ Anti-pattern: String Union Type Drift

```typescript
// Problem: Difficult to maintain, type information lost after compilation,
// cannot be fully supported and refactored by IDE, prone to spelling errors
type DatasetType = 'wifi' | 'charging' | 'parking';

// No good IntelliSense when using, when needing to change 'wifi' to 'wireless',
// cannot safely refactor, must use global search and replace
function process(type: DatasetType) {
    if (type === 'wfi') { /* Spelling error not caught at compile time, exposed at runtime */ }
}
```

#### ✅ Correct: Use Enum to Define Business States, Get Compile-time and Development-time Dual Protection

```typescript
/**
 * Dataset type enumeration
 * Dataset type enumeration
 */
enum EnumDatasetType {
    /** WiFi / WiFi */
    WIFI = "wifi",
    /** Charging station / Charging station */
    CHARGING = "charging",
    /** Parking / Parking */
    PARKING = "parking",
}

/**
 * Status enumeration
 * Status enumeration
 */
enum EnumStatus {
    /** Active / Active */
    ACTIVE = 'active',
    /** Inactive / Inactive */
    INACTIVE = 'inactive',
    /** Pending / Pending */
    PENDING = 'pending',
}
```

#### Enum vs Union Type Selection Guide

| Scenario | Recommended | Core Reason (Why) |
|----------|-------------|-------------------|
| Business states, config types, service levels | **Enum** | Business concepts need long-term maintenance and team consensus, Enum's IDE support (refactoring, find references) greatly reduces modification costs |
| API temporary responses, third-party function parameters | Union Type | Transient types, no long-term maintenance needed, lightweight definitions reduce boilerplate |
| Need to iterate all possible values | **Enum** | Runtime needs to enumerate all options (e.g., rendering dropdown menus), Enum provides structured iteration capability |
| Need reverse lookup (value → key) | **Enum** | When reverse mapping from backend data to display names, Enum's reverse mapping avoids hardcoded lookup tables |

---

## Node.js Asynchronous Flow Refactoring

### 3. Identifying Asynchronous Bottlenecks

In Node.js environments, the definition of "long method" should consider **temporal complexity of async flows** rather than just line count. The essence of asynchronous flow is "decomposition in time dimension", mixing interwoven I/O logic leads to difficult-to-locate errors, hard-to-isolate tests, and difficult-to-track side effects.

**Smell characteristics (these symptoms indicate "timeline too long" needs decomposition):**
- Single function contains too many consecutive, inseparable `await` calls (timeline too long)
- Error handling logic deeply coupled with business logic (hard to determine which I/O failed)
- Difficult to test a single I/O operation independently (must execute entire flow to test partial logic)

#### ❌ Anti-pattern: Asynchronous Blocking Point

```typescript
// Problem: Maintenance difficulties caused by excessively long interleaved timeline
// - Testing requires mocking all 5 I/O operations to test the final step
// - When step 3 fails, hard to determine if it's data issue or network issue
// - Cannot independently reuse "fetch user data" logic
async function processUserData(userId: string) {
    const user = await db.getUser(userId);           // I/O 1
    const profile = await api.fetchProfile(user.id); // I/O 2
    const orders = await db.getOrders(user.id);      // I/O 3
    const stats = await calcStats(orders);           // I/O 4
    const result = await cache.save(stats);          // I/O 5

    // Any step failing is difficult to track and handle
    return result;
}
```

#### ✅ Correct: Decompose into Independent Functions by "Temporal Boundaries"

```typescript
/**
 * Fetch complete user information
 * Get complete user information
 */
async function fetchUserWithProfile(userId: string): Promise<IUserWithProfile> {
    const user = await db.getUser(userId);
    const profile = await api.fetchProfile(user.id);
    return { ...user, profile };
}

/**
 * Calculate user order statistics
 * Calculate user order statistics
 */
async function calculateUserOrderStats(userId: string): Promise<IOrderStats> {
    const orders = await db.getOrders(userId);
    return calcStats(orders);
}

/**
 * Process user data flow
 * Process user data flow
 */
async function processUserData(userId: string): Promise<ICacheResult> {
    // Each step is clearly readable and independently testable
    const userWithProfile = await fetchUserWithProfile(userId);
    const stats = await calculateUserOrderStats(userWithProfile.id);
    return cache.save(userWithProfile.id, stats);
}
```

---

### 4. Node.js Runtime Considerations

As a long-running service, resource management is crucial.

#### New Smell: Memory Leak Potential / Event Emitter Abuse

**Problem:** Improper handling of event listeners (`EventEmitter`) or resource release (Stream/Connection) can lead to memory leaks.

```typescript
// ❌ Risk: Event listeners not properly removed
class DataProcessor extends EventEmitter {
    constructor() {
        super();
        // Add listener every instantiation, but never remove
        this.on('data', this.handleData);
    }
}

// ✅ Correct: Ensure resource release
class DataProcessor extends EventEmitter {
    private listeners: Array<() => void> = [];

    setup(): void {
        const handler = this.handleData.bind(this);
        this.on('data', handler);
        // Record for cleanup
        this.listeners.push(() => this.off('data', handler));
    }

    /**
     * Clean up resources
     * Clean up resources
     */
    teardown(): void {
        this.listeners.forEach(remove => remove());
        this.listeners = [];
    }
}

// Ensure release when using
const processor = new DataProcessor();
processor.setup();
// ... after use
processor.teardown();
```

---

## TypeScript-Specific Refactoring Techniques

### 5. Leveraging Type-Driven Refactoring

TypeScript's type system is not just a checking tool but a safety net for refactoring.

#### Introduce Parameter Object with Interface

```typescript
// Before: Long parameter list
function createUser(
    name: string,
    email: string,
    age: number,
    role: string,
    department: string
): IUser { /* ... */ }

// After: Typed parameter object
/**
 * Create user request parameters
 * Create user request parameters
 */
interface ICreateUserRequest {
    /** User name / User name */
    name: string;
    /** Email address / Email address */
    email: string;
    /** Age / Age */
    age: number;
    /** Role / Role */
    role: EnumUserRole;
    /** Department / Department */
    department: EnumDepartment;
}

function createUser(request: ICreateUserRequest): IUser { /* ... */ }
```

#### Replace any with Unknown + Type Guard

```typescript
// ❌ Dangerous: Loses type safety
function processData(data: any): void {
    data.someMethod(); // Compiles, but may crash at runtime
}

// ✅ Safe: Use unknown + type guard
function processData(data: unknown): void {
    if (isValidData(data)) {
        // TypeScript now knows data is the correct type
        data.someMethod();
    }
}

/**
 * Data validation type guard
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

## Common Refactoring Techniques

### Extract Method

```
Before: Long function with multiple responsibilities
After: Multiple focused functions with descriptive names
```

### Extract Class

```
Before: Class doing too many tasks
After: Multiple cohesive classes with single responsibilities
```

### Replace Conditional with Polymorphism

```
Before: switch/if statements checking types
After: Polymorphic method calls, or use Discriminated Unions for type-safe dispatch
```

### Introduce Parameter Object

```
Before: Multiple related parameters
After: Single object containing related data (defined using Interface)
```

### Replace Static Mapping with Flow Accumulation

**Applicable scenarios:** Logic's "deep nesting" and "linear bloat", leading to having to modify the entire massive structure when adding new requirements. Includes but not limited to: deeply nested ternary expressions, massive `switch/case`, or complex `if/else` chains

**Judgment criteria (from design logic, not syntax):**

| Pattern | Static Mapping | Flow Accumulation |
|---------|---------------|-------------------|
| **State handling** | Each branch independently calculates complete result | Shared state variable, gradually constructed |
| **Adding requirements** | Need to add independent branch logic | Only need to add accumulation step |
| **Key characteristic** | `return` appears in each branch | Single `return` at the end |

**⚠️ Important:** `switch-case` or `if/else` are just syntax tools, **the key is whether state is shared and gradually accumulated**.

> 💡 **Syntax is the tool, design logic is the key.**

```typescript
// ❌ Static dispatch (switch-case implementation): Each case calculates independently
switch (mode) {
  case A: return calculateA();  // Independent result
  case B: return calculateB();  // Independent result
}

// ✅ Flow accumulation (switch-case implementation): Shared query variable
let query = initQuery();
switch (mode) {
  case A: query = applyBaseA(query); break;  // Modify shared state
  case B: query = applyBaseB(query); break;  // Modify shared state
}
query = applyModifiers(query);  // Unified enhancement
return finalize(query);         // Single exit point
```

```
Before: Static pattern dispatch
  case A: return calculateA();  // Independent calculation
  case B: return calculateB();  // Independent calculation

After: Flow accumulation
  let state = initState();      // Establish baseline
  if (condition1) state = applyStep1(state);  // Gradual enhancement
  if (condition2) state = applyStep2(state);
  return finalize(state);       // Final output
```

**Core principles:**
1. **Establish baseline** - Initialize base state (default values not dependent on mode)
2. **Gradual enhancement** - Modify shared state based on conditions (rather than independent calculation)
3. **Final output** - Uniformly format and return (single exit)

**TypeScript advantages:**
- State variable types can be precisely tracked (stage-by-stage type narrowing)
- Single exit point makes result verification easier
- Each accumulation step can be independently unit tested

---

### Focus on Intent (Focus on Intent, Not Implementation Details)

**Core concept:** Code is **written for humans** — this "person" is **your future self in six months** and the **maintainer forced to read your code**. Computers can execute any syntactically correct code, but only humans need to understand its **intent and design**.

> 💡 **Code is read far more times than it is written.** Spending an hour making code clearer can save dozens of hours of debugging and maintenance time in the future.

When code describes "what to do", readers can quickly understand business logic; when describing "how to do it", readers must deconstruct implementation details to understand the purpose — this is a debt in time for your future self.

```
❌ Bad smell: Describing "how to do it" (How)
// Reader must parse the entire conditional expression to understand this is "generating URL"
return coord && name
    ? `...${coord.lat},${coord.lng}+(${encodeURIComponent(name)})`
    : name ? `...?(${encodeURIComponent(name)})` : '';

✅ Correct: Describing "what to do" (What)
// Reader immediately understands: build base query → add modifiers → generate final URL
const baseQuery = buildBaseQuery(options);
const enhancedQuery = addNameModifier(baseQuery, options.name);
return buildWebSearchUrl(enhancedQuery);
```

**Why this matters:**
- **Cognitive load:** "How to do it" code requires readers to understand both business logic and implementation details simultaneously; "what to do" lets readers focus on business logic
- **Maintainer's time:** Your future self in six months has forgotten the original design details, clear intent expression lets you re-understand the code in seconds rather than hours
- **Maintainability:** When implementation changes (e.g., URL format adjustment), "what to do" code only needs to modify function internals, call sites remain unchanged
- **Testability:** "What to do" naturally leads to separation of concerns, each function can be independently tested

**Checkpoints:**
- If code reads like a left-to-right sequence of operations, it might be describing "how to do it"
- If you can still understand the flow from function names after removing all operators, that's "what to do"
- Function names should be verbs or verb phrases expressing intent (e.g., `buildBaseQuery`) rather than implementation (e.g., `concatStrings`)

---

### Documentation as Intent

**Core concept:** Comments are not "explaining what the code does" but "explaining why it was designed this way". Good comments let maintainers understand design intent in seconds without reverse engineering.

#### Two Uses of Comments

| Purpose | Description | Example |
|---------|-------------|---------|
| **Design Intent** | Explain "why designed this way" | "Use object instead of array to prevent coordinate order confusion" |
| **Logic Explanation** | Explain complex business rules | "Grant access when user has active subscription with recent payment OR auto-renewal enabled" |

#### ❌ Valueless Comments: Repeating Code Content

```typescript
// ❌ Bad smell: Comment just repeats the code
// Set user name to name
user.name = name;

// ❌ Bad smell: Obvious logic doesn't need comments
// If count is greater than 0
if (count > 0) { ... }
```

#### ✅ Valuable Comments: Conveying Design Decisions

```typescript
/**
 * Use object instead of array to represent coordinates, fundamentally preventing
 * order confusion between [lat, lng] and [lng, lat]
 * See geo-transform.md case
 */
interface IGeoCoord {
    lng: number;
    lat: number;
}

/**
 * Check if user has active subscription with recent payment record,
 * or user with auto-renewal enabled
 * Note: This condition covers three boundary cases - see test case subscription-edge-cases.spec.ts
 */
if (user.isActive && subscription.status === 'active' &&
    (payment.lastPaymentDate > thirtyDaysAgo || payment.isAutoRenew))
{
    grantAccess();
}
```

#### Relationship Between Comments and Refactoring

- **Before refactoring:** Comments mark complex blocks as refactoring candidates
- **After refactoring:** Comments explain why simplified code still maintains correctness
- **During refactoring:** Preserve original implementation as comments (see [typescript-unimplemented-handler](../typescript-unimplemented-handler/SKILL.md))

---

## Backward Compatibility

When refactoring public APIs:

- Add new methods, mark old methods as deprecated (`@deprecated`)
- Use adapter pattern to handle interface changes
- Provide migration path documentation
- Perform version control when necessary breaking changes are required

---

## Safe Refactoring Process (TS/Node Enhanced Edition)

1. **Verify tests pass** - Ensure adequate unit test coverage, especially for edge cases
2. **Check type safety** - Confirm `strict` mode compilation passes
3. **Make small changes** - Only change one function or one interface at a time
4. **Run tests and compilation** - Verify behavior unchanged and types correct
5. **Check resource management** - Confirm no memory leak risks introduced
6. **Commit** - Save working state

---

## Output Format

When proposing refactoring suggestions:

```markdown
## Current Issues
[Description of code smells, including TS/Node-specific considerations]

## Proposed Changes
[Specific refactoring techniques, including type design]

## Step-by-Step Plan
1. [First safe change]
2. [Second safe change]
...

## Risk Assessment
[Items that might go wrong, including type errors and runtime risks]

## Type Safety Checklist
- [ ] Enum definitions cover all business states
- [ ] Interfaces follow SSoT principle
- [ ] Async flows can be independently tested
- [ ] Resource release logic is correct
```

---

## Reference Documents

### This Skill References
- [Classic Principles Mapping](./references/classic-principles-mapping.md) - Detailed comparison with Martin Fowler's classic refactoring principles
- [URL Refactoring Case](./references/url-impl.md) - Flow accumulation and intent-oriented implementation example
- [Coordinate Handling Case](./references/geo-transform.md) - SSoT principle and Tuple semantic annotation best practices

### Related Skills
- [analyze-code-commenter](../analyze-code-commenter/SKILL.md) - Bilingual comment addition and code documentation
- [js-git-friendly-coding-style](../js-git-friendly-coding-style/SKILL.md) - Git-friendly code style and merge strategies
- [test-snapshot-documentation](../test-snapshot-documentation/SKILL.md) - Using snapshot tests for documentation
- [typescript-unimplemented-handler](../typescript-unimplemented-handler/SKILL.md) - Handling unimplementable code patterns

### Memory Rules (System Level)
- [comment-format-rules](../../rules/comment-format-rules.md) - Comment format rules (bilingual, block comments, JSDoc)
- [typescript-naming-convention](../../rules/typescript-naming-convention.md) - TypeScript naming conventions (Enum, Interface, Type)
- [unimplemented-code-handling-rules](../../rules/unimplemented-code-handling-rules.md) - Unimplementable code handling rules
- [test-file-best-practices](../../rules/test-file-best-practices.md) - Test file best practices
