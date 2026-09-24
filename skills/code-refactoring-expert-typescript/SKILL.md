---
name: code-refactoring-expert-typescript
description: >-
  A modern TypeScript/Node.js refactoring and design guide focused on type safety,
  asynchronous workflow optimization, Single Source of Truth (SSOT), maintainability,
  consistency, and other modern software design principles.
  Includes, but is not limited to:
  (1) refactoring existing TypeScript/Node.js code,
  (2) providing architectural and design guidance when implementing new features,
  (3) identifying and correcting TypeScript/Node.js-specific code smells,
  (4) establishing team coding standards and best practices,
  (5) preventing duplicated definitions and fragmented data sources while maintaining
      a Single Source of Truth (SSOT),
  (6) improving type design, modularity, testability, readability, and maintainability.
  Applicable to:
  (1) requests such as "Refactor TypeScript", "Refactor TS", or "Improve Node.js code",
  (2) requests for TypeScript/Node.js implementation and design guidance,
  (3) requests involving improvements to code architecture, type safety,
      asynchronous workflows, maintainability, or code quality.
tags:
  - TypeScript
  - nodejs
  - refactoring
  - type-safety
  - async
  - agents/skills
  - single-source-of-truth
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

1. **Single Source of Truth (SSoT) is Top Priority** - In architecture design, daily implementation, and refactoring, SSoT is the highest principle. Types, logic, states, and constants must have a single authoritative source, eliminating duplicate definitions and scattered maintenance
2. **Never change behavior during refactoring** - Keep refactoring and feature changes in separate commits
3. **Have tests before refactoring; decompose and refine when testing/reuse is blocked** - If tests don't exist, write them first. When existing implementations hinder testing or reuse, decompose and refine them into independent units. **Never duplicate logic for tests**, as this breaks the Single Source of Truth
4. **Make small, incremental changes** - Each step should be independently verifiable
5. **Keep the code working** - System should pass tests after every change
6. **Code is written for humans** - Computers can execute vague and complex code, but **your future self in six months** and the **maintenance team** need to understand intent and design. Clear code is more valuable than "clever" code before refactoring

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

### Couplers

| Smell | Description | TS/Node Adjustment |
|-------|-------------|-------------------|
| **Inappropriate Intimacy** | Inappropriate intimacy | Applicable |
| **Message Chains** | Message chains | Applicable |
| **Middle Man** | Middle man | Applicable |

---

## TypeScript Modern Design Principles

### 1. Single Source of Truth (SSoT)

> 🌟 **Top Priority: Single Source of Truth (SSoT) is the Highest Priority in Design, Implementation, and Refactoring!**
> Whether designing architecture from scratch, implementing everyday features, or refactoring existing code, establishing and maintaining SSoT must be the primary consideration. When data, states, logic, or types exist in multiple scattered definitions, system degradation, type drift, duplicate maintenance, and shotgun surgery inevitably follow.

**Core Concept:** Inheritance & Composition over Duplication. Any business entity, type structure, or calculation logic must have one and only one authoritative source of truth in the system.

**Applies to:** `Data Clumps`, `Primitive Obsession`, `Duplicate Code`, `Type Drift`, `Shotgun Surgery`

#### Five Core Pillars of SSoT

1. **Same-Domain or Duplicate Types: Prioritize Inheritance over Independent Definitions**:
   - Types within the same domain or sharing overlapping fields/semantics **should prioritize inheritance (`interface ... extends ...`) or base type extension over independent redefinition**.
   - Defining types separately breaks domain bloodlines and causes "Type Drift". Inheritance ensures that when base models evolve, all derived types automatically stay in sync.
2. **Business States and Finite Sets: Prioritize Enum over String Unions**:
   - When defining finite state sets, categories, or operation modes, **prioritize Enum design over string union types (`'a' | 'b'`)**.
   - **Avoid costly secondary refactoring**: Developers often start with string unions for brevity, but as requirements grow (iterating options for UI dropdowns, reverse lookups, runtime defensive validation, safe renaming across files), teams are frequently forced to **refactor string unions into Enums all over again**. Designing with Enums from day one establishes a single source of truth for both type space and value space, eliminating redundant refactoring cycles.
3. **Duplicate Logic: Extract into Shared Units, Never Scatter for Independent Maintenance**:
   - SSoT governs not only types, but fundamentally **business logic and processing flows**.
   - **Duplicate evaluation, calculation, validation, or transformation logic must be strictly extracted into shared functions (utilities, pure functions, or services), never scattered across multiple locations**.
   - Scattering duplicate logic creates a maintenance nightmare: whenever business rules update or bugs are fixed, developers must manually patch all scattered copies (classic Shotgun Surgery). Missing even one leads to inconsistent behavior and severe production bugs.
4. **Decompose and Refine When Blocked; Never Duplicate Logic for Testing**:
   - When any existing implementation hinders testing or reuse due to excessive size, tight coupling, or side-effects, **strictly decompose and refine the implementation (Extract & Refine)** into independent, testable, and reusable units.
   - **Strictly Forbid Logic Duplication for Testing**: Never duplicate or re-implement business logic in test files, mock helpers, or shadow modules to satisfy tests. Duplicating logic completely breaks SSoT. When production logic changes, unsynchronized duplicate test logic creates false confidence, invalidates tests, and breeds severe maintenance blind spots.
5. **Type Dependencies and Derivations: Preserve Type Traceability**:
   - When a field or parameter is based on another type, use index access (`OriginalType['field']`) or `Pick<OriginalType, ...>` to preserve the reference chain, ensuring automatic change propagation (see 1.5).

---

#### Guideline A: Prioritize Inheritance for Same-Domain Types, Avoid Independent Redefinition

##### ❌ Anti-pattern: Scattered Independent Definitions in the Same Domain
```typescript
// Coordinates and stations belong to the same domain, yet base properties are redefined separately
export interface IGeoBounds {
    northWest: { lng: number; lat: number; };  // Repeated definition
    northEast: { lng: number; lat: number; };  // Repeated definition
    southWest: { lng: number; lat: number; };  // Repeated definition
    southEast: { lng: number; lat: number; };  // Repeated definition
}

export interface IStationBase {
    lng: number;  // Repeated again; cannot auto-sync if coordinates add altitude `alt`
    lat: number;  // Repeated again
    dataType: EnumDatasetType;
    name: string;
    address: string;
}
```

##### ✅ Correct: Extract Base Interface and Prioritize Inheritance / Composition
```typescript
/**
 * Geographic coordinate - Single source of truth
 */
export interface IGeoCoord {
    lng: number;
    lat: number;
}

/**
 * Geographic bounds - Composed from IGeoCoord
 */
export interface IGeoBounds {
    northWest: IGeoCoord;
    northEast: IGeoCoord;
    southWest: IGeoCoord;
    southEast: IGeoCoord;
}

/**
 * Station base info - Extends IGeoCoord rather than redefining independently
 */
export interface IStationBase extends IGeoCoord {
    dataType: EnumDatasetType;
    category?: string;
    name: string;
    address: string;
}
```

---

#### Guideline B: Extract Duplicate Logic into Shared Units, Eliminate Multi-place Maintenance

##### ❌ Anti-pattern: Calculation and Business Logic Scattered in Multiple Places
```typescript
// Shopping cart checkout logic
async function checkoutCart(cart: ICart): Promise<number> {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.05; // Hardcoded tax calculation
    const shipping = subtotal >= 1000 ? 0 : 60; // Free shipping threshold logic scattered
    return Math.round((subtotal * (1 + taxRate) + shipping) * 100) / 100;
}

// Invoice generation: Identical pricing logic duplicated!
async function generateInvoice(order: IOrder): Promise<IInvoice> {
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxRate = 0.05; // Duplicate maintenance: easily missed if tax rate changes
    const shipping = subtotal >= 1000 ? 0 : 60; // Duplicate maintenance: easily desynchronized
    const total = Math.round((subtotal * (1 + taxRate) + shipping) * 100) / 100;
    return { orderId: order.id, subtotal, taxRate, shipping, total };
}
```

##### ✅ Correct: Extract as Shared Domain Logic with Single Source of Truth
```typescript
/**
 * Pricing configuration constants - Single source of truth
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
 * Calculate order pricing breakdown - Authoritative single source of truth for pricing logic
 * Rule changes only need to be updated once here, automatically synchronized across carts, invoices, and reports
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

#### Guideline C: Prioritize Enum Design for Business States to Prevent Secondary Refactoring

##### ❌ Anti-pattern: String Unions Leading to Inevitable Secondary Refactoring
```typescript
// Initial implementation uses string union
type IUserRole = 'admin' | 'editor' | 'viewer';

// As requirements expand, the team needs to:
// 1. Iterate over all roles to render dropdown menus in UI -> String unions cannot be iterated at runtime
// 2. Validate unknown API response data -> Cannot easily validate unlike Object.values(Enum)
// 3. Safely rename 'editor' -> 'content_manager' -> Global string find-and-replace is risky
// Result: Forced to spend extensive effort refactoring UserRole to EnumUserRole across the entire codebase!
```

##### ✅ Correct: Use Enum from Day One as Single Source of Truth
```typescript
/**
 * User role enumeration - Single source of truth for both types and runtime values
 */
export enum EnumUserRole {
    ADMIN = 'admin',
    EDITOR = 'editor',
    VIEWER = 'viewer',
}

// Full capabilities out-of-the-box, preventing secondary refactoring:
export const ALL_USER_ROLES = Object.values(EnumUserRole); // Easily iterable
export function isValidRole(value: unknown): value is EnumUserRole {
    return typeof value === 'string' && Object.values(EnumUserRole).includes(value as EnumUserRole);
}
```

---

#### Guideline D: Decompose and Refine When Blocked; Never Duplicate Logic for Testing

##### ❌ Anti-pattern: Existing Implementation Hinders Testing, Logic Duplicated in Tests
```typescript
// Business module (bonusService.ts)
// Database I/O, email notifications, and complex bonus calculation are tangled in one method, making unit testing difficult
export class BonusService {
    async processUserBonus(userId: string): Promise<void> {
        const user = await db.findUser(userId);
        // Core calculation logic buried inside I/O flow:
        const bonus = (user.points > 1000 ? user.points * 0.1 : user.points * 0.05) + (user.isVip ? 50 : 0);
        await db.saveBonus(userId, bonus);
        await emailClient.send(user.email, `Bonus: ${bonus}`);
    }
}

// Test file (bonusService.spec.ts)
// ❌ Severe smell: Because BonusService is hard to test, developer duplicated the logic inside the test file!
function calculateExpectedBonusForTest(points: number, isVip: boolean): number {
    // Duplicated production logic! Deviates from Single Source of Truth (SSoT)
    return (points > 1000 ? points * 0.1 : points * 0.05) + (isVip ? 50 : 0);
}

it('should calculate bonus', () => {
    // Test relies on copied logic; if production bonus changes (e.g. VIP bonus becomes 100),
    // test fails to catch discrepancies unless manually synchronized, or can falsely pass if the copy replicates the bug!
    expect(calculateExpectedBonusForTest(2000, true)).toBe(250);
});
```

##### ✅ Correct: Decompose and Refine into Pure Function, Shared Single Source of Truth
```typescript
// Extracted shared calculation unit (bonusCalculator.ts) - Pure, testable, highly reusable
export interface IUserBonusMetrics {
    points: number;
    isVip: boolean;
}

/**
 * Calculate user bonus points - Authoritative single source of truth
 * Decomposing removes testing obstacles and allows safe reuse across other services
 */
export function calculateUserBonus(metrics: IUserBonusMetrics): number {
    const baseRate = metrics.points > 1000 ? 0.1 : 0.05;
    const vipBonus = metrics.isVip ? 50 : 0;
    return metrics.points * baseRate + vipBonus;
}

// Business module (bonusService.ts) - Production code invokes the authoritative single source
export class BonusService {
    async processUserBonus(userId: string): Promise<void> {
        const user = await db.findUser(userId);
        const bonus = calculateUserBonus({ points: user.points, isVip: user.isVip });
        await db.saveBonus(userId, bonus);
        await emailClient.send(user.email, `Bonus: ${bonus}`);
    }
}

// Test file (bonusCalculator.spec.ts) - Directly tests the authoritative entity with zero logic duplication
it('should calculate correct bonus', () => {
    expect(calculateUserBonus({ points: 2000, isVip: true })).toBe(250);
});
```

---

#### Refactoring Guide

| Check | Action |
|-------|--------|
| Designing, implementing, or refactoring? | **Treat SSoT as top priority**; verify all types and logic have a single authoritative source |
| Same-domain or duplicate property groups? | **Prioritize inheritance (`interface ... extends ...`)** or composition; avoid separate definitions |
| Finite business states, categories, or options? | **Prioritize Enum design** over string unions to avoid secondary refactoring later |
| Duplicate calculation, validation, or transformation logic? | **Extract into shared pure functions/utilities**; eliminate multi-place maintenance |
| Implementation hinders testing or reuse? | **Decompose and refine (Extract & Refine)** into pure/isolated units; **never duplicate logic for tests** |
| Are there fields based on another type? | Use `OriginalType['fieldName']` or `Pick<OriginalType, ...>` to preserve traceability |
| Do modifications require changes in multiple places? | Confirm severe SSoT violation, refactor immediately to a single source of truth |

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

### 1.5 Type Traceability

**Core Concept:** When type fields or parameters are based on another type, use Index Access or `Pick` to preserve references to the original type, ensuring type changes propagate automatically and maintain single source of truth.

**Applies to:** `Type Drift`, cross-module type duplication

#### ❌ Anti-pattern: Type Drift and Duplicate Definitions

```typescript
// Problem: Directly duplicating types - even if original ITripDetail changes,
// you must manually sync multiple places
export interface ITripDetailMapValue {
    hero?: IRawHeroV2;
    addresses?: IRawAddressBlockV2;
    stats?: IRawStatTable;
    breakdown: IRawBreakdownItem[];
    mapUrl: string;        // Duplicate definition, if ITripDetail.mapUrl changes to URL object,
                           // all locations must be manually updated
    message: string;       // Duplicate definition
    pickupCoords: { lng: number; lat: number };  // Duplicated coordinate type
    dropoffCoords: { lng: number; lat: number };  // Duplicated coordinate type
    // ... more duplicated fields
}
```

#### ✅ Correct: Single Source + Index Access

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
 * Trip detail - Complete type definition
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
 * Trip detail map value - Selects coordinate-related fields from ITripDetail
 * Trip detail map value - Selects coordinate-related fields from ITripDetail
 *
 * Using Pick preserves type traceability - auto-syncs when ITripDetail changes
 * Using Pick preserves type traceability, auto-syncs when ITripDetail changes
 */
export interface ITripDetailMapValue extends Pick<ITripDetail, 'mapUrl' | 'message' | 'pickupCoords' | 'dropoffCoords' | 'cancelCoords' | 'unknownCoords'> {
    hero?: IRawHeroV2;
    addresses?: IRawAddressBlockV2;
    stats?: IRawStatTable;
    breakdown: IRawBreakdownItem[];
}
```

#### Single Field Index Access

When referencing only a single field, use index access for readability:

```typescript
// ✅ Single field using index access
interface IUserRef {
    /** User identifier / User identifier */
    id: IUser['id'];           // From IUser, auto-syncs if IUser.id type changes
    /** User display name / User display name */
    displayName: IUser['name']; // From IUser, maintains type consistency
}
```

#### Refactoring Guide

| Check | Action |
|-------|--------|
| Are there fields based on another type? | Use `OriginalType['fieldName']` or `Pick<OriginalType, 'field1' \| 'field2'>` |
| Do you need multiple fields from the same type? | Use `Pick<OriginalType, 'field1' \| 'field2' \| ...>` instead of multiple index accesses |
| Do changes require updates in multiple places? | Confirm SSoT violation, refactor to index access or Pick |

---

### 3. Strict Type Control

**Core Concept:** When business logic defines a finite set of states, **prefer Enum over string union types**. String union types are erased after compilation, losing IDE support and runtime checking capabilities; Enums provide complete development experience and runtime safety, serving as the single source of truth (SSoT) for both type space and value space.

> ⚠️ **Avoid the Heavy Cost of Secondary Refactoring**:
> Early in development, teams often declare string unions (e.g., `type Status = 'active' | 'inactive'`) for quick setup. However, as the system grows, requirements inevitably demand: enumerating all options (rendering UI dropdowns/filters), runtime defensive validation, dictionary/mapping tables (e.g., status-to-label or color), and safe IDE renaming with cross-file reference tracking. Because string unions lack runtime presence, teams are eventually **forced to spend immense time and risk refactoring string unions into Enums across the entire codebase**.
> **Prioritize Enum from day one in design and implementation** to establish a single source of truth upfront and eliminate the burden of secondary refactoring.

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

#### ⚠️ Complete Refactoring: Update All Comparison Sites, Not Just the Type Signature

When migrating a string-based type to an Enum, **you must update every comparison value** (`switch`/`case`, `===`, `==`, object keys, etc.) to reference the Enum member. Changing only the parameter/return type signature while leaving literal strings in the branches is a "half-refactored" state — the code still compiles (because the Enum's string value matches), but you lose the very IDE safety, rename propagation, and typo-catching that motivated the migration.

```typescript
// ✅ Correct: Enum definition for target type
enum EnumTargetType {
    /** Enemy / Enemy */
    Enemy = 'enemy',
    /** Friend / Friend */
    Friend = 'friend',
    /** Self / Self */
    Self = 'self',
    /** All / All */
    All = 'all',
}

// ❌ Half-refactored: only the signature changed, comparisons still use raw strings
function targetClass(target: EnumTargetType) {
  switch (target) {
    case 'enemy': return 'dmg';        // String literal survives — no IDE assist, typo-prone
    case 'friend': return 'recover';
    case 'self': return 'support';
    case 'all': return 'support';
    default: return 'support';
  }
}

// ✅ Correct: every comparison site uses the Enum member
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

**Why this matters:**
- **Rename safety**: Renaming `EnumTargetType.Enemy` propagates to all `case` sites only if they reference the member; raw strings require unsafe global search-and-replace.
- **Typo catching**: `case 'enemey':` is silently unreachable (falls to `default`); `case EnumTargetType.Enemey` fails at compile time.
- **Single source of truth**: The valid value set lives in the Enum, not scattered across string literals.

**Checklist when migrating to an Enum:**
| Site | Action |
|------|--------|
| Function parameter / return type | Change type to the Enum |
| `switch (x)` / `case` | Replace string literals with `Enum.X` members |
| `if (x === '...')` / `x !== '...'` | Replace with `x === Enum.X` |
| Object/map keys (`{ 'enemy': ... }`) | Replace with computed keys `[EnumTargetType.Enemy]` or `Enum.X` keys |
| Ternary / array `.includes(['...'])` | Replace members with Enum references |
| Default/unknown handling | Keep `default` only if the input is genuinely external/untrusted |

When refactoring string-based identifiers to enums for improved type safety, **the `I = Enum` pattern (e.g., `IUserRole = EnumUserRole`) is fundamentally flawed and should never be used**.

**Correct approach: Use TypeScript enums directly**

Instead of creating custom type aliases like `IUserRole = EnumUserRole`, define the enum directly:

## Node.js Asynchronous Flow Refactoring

### 4. Identifying Asynchronous Bottlenecks

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

### 6. Leveraging Type-Driven Refactoring

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

### 7. Focus on Intent (Focus on Intent, Not Implementation Details)

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

### 8. Documentation as Intent

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
- [ ] Interfaces follow SSoT principle and type traceability
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
- [typescript-naming-convention](../typescript-naming-convention/SKILL.md) - TypeScript naming conventions (Enum, Interface, Type)
- [unimplemented-code-handling-rules](../../rules/unimplemented-code-handling-rules.md) - Unimplementable code handling rules
- [test-file-best-practices](../../rules/test-file-best-practices.md) - Test file best practices
