---
tags:
  - typescript
  - limitations
  - type-system
  - reference
  - troubleshooting
---

# TypeScript 類型系統限制詳細說明

本文件列出常見的 TypeScript 類型系統限制，提供問題識別和處理解決方案。

---

## TS-Limit-001: 運行時類型反射

### 問題描述

TypeScript 類型在編譯後會被完全擦除（type erasure），無法在運行時獲取類型資訊。

### 嘗試實現（失敗）

```typescript
// ❌ 無法實現
type GetRuntimeType<T> = T extends infer U ? U : never;

function getTypeInfo<T>(value: T): GetRuntimeType<T> {
    // 嘗試在運行時獲取類型的完整結構
    // 問題：類型資訊在運行時不可用
    return value;
}
```

### 替代方案

```typescript
// ✅ 運行時方案：使用 class-transformer
import { plainToInstance, classToPlain } from 'class-transformer';

class User {
    name: string;
    email: string;
}

function serialize<T>(cls: new () => T, data: unknown): T {
    return plainToInstance(cls, data);
}

// ✅ 使用反射庫：reflect-metadata
import 'reflect-metadata';
import { Reflect } from '@rocber/reflect-metadata';

function getMetadata(target: object, key: string): unknown {
    return Reflect.getMetadata(key, target);
}
```

### 參考價值

- **學習價值**：理解 TypeScript 的靜態類型系統設計目標
- **未來可能**：TypeScript 短期內不會引入運行時反射
- **替代方案**：使用 zod、joi、Yup 等運行時驗證庫

---

## TS-Limit-002: 動態類型生成

### 問題描述

無法根據運行時的實際值動態生成新的類型。

### 嘗試實現（失敗）

```typescript
// ❌ 無法實現
type DynamicSchema<T> = {
    [K in keyof T]: T[K] extends string 
        ? { type: 'string'; value: T[K] }
        : T[K] extends number
        ? { type: 'number'; value: T[K] }
        : { type: 'unknown'; value: T[K] }
};

// 嘗試根據運行時數據生成類型
function createSchema<T>(data: T): DynamicSchema<T> {
    // 問題：類型是在編譯時確定的，無法根據運行時數據動態生成
    return data as DynamicSchema<T>;
}
```

### 替代方案

```typescript
// ✅ 使用泛型 + 運行時處理
type FieldSchema<T> = {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    value: T;
};

function createRuntimeSchema<T>(data: T): FieldSchema<T>[] {
    return Object.entries(data).map(([key, value]) => ({
        type: typeof value as FieldSchema<T>['type'],
        value
    }));
}

// ✅ 使用 JSON Schema 生成器
import { validate } from 'jsonschema';

function generateJsonSchema(data: unknown): object {
    // 使用 jsonschema 庫生成 schema
    return {};
}
```

---

## TS-Limit-003: 遞迴類型深度限制

### 問題描述

TypeScript 對遞迴類型的深度有內在限制（通常為 50-100 層，視複雜度而定）。

### 嘗試實現（失敗）

```typescript
// ❌ 無法實現 - 達到深度限制時會出錯
type DeepNest<T, Depth extends number = 10> = 
    Depth extends 0 
    ? T 
    : T extends object
    ? { [K in keyof T]: DeepNest<T[K], [-1] extends [Depth] ? never : [-1, Depth] extends [Depth, -1] ? never : Subtract<Depth, 1>> }
    : T;

// 問題：當 Depth 超過限制時會出現 "Type instantiation is excessively deep" 錯誤
type DeepNestedObject = DeepNest<MyComplexObject, 100>;
```

### 替代方案

```typescript
// ✅ 方案 1：設定合理的最大深度
type DeepNested10<T> = ...; // 最大 10 層
type DeepNested20<T> = ...; // 最大 20 層

// ✅ 方案 2：使用特定的工具類型
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ✅ 方案 3：使用迭代而非遞迴
type IterateDepth<T, Depth extends number> = {
    0: T;
    1: DeepPartial<T>;
    2: DeepPartial<DeepPartial<T>>;
    // 手動展開每個深度
}[Depth extends 0 ? 0 : Depth extends 1 ? 1 : Depth extends 2 ? 2 : never];
```

---

## TS-Limit-004: 條件類型複雜度

### 問題描述

過於複雜的條件類型推斷會導致類型實例化過度複雜。

### 嘗試實現（失敗）

```typescript
// ❌ 無法實現
type ComplexInference<T> = 
    T extends string ? (
        T extends `${infer A}${infer B}` ? (
            A extends `${infer C}${infer D}` ? (
                D extends '' ? C : ComplexInference<B>
            ) : never
        ) : never
    ) : never;

// 問題：嵌套過深的條件類型難以維護且可能超出類型複雜度限制
```

### 替代方案

```typescript
// ✅ 使用輔助類型分步處理
type Step1<T> = T extends `${infer A}${infer B}` ? A : never;
type Step2<T> = T extends `${infer C}${infer D}` ? C : never;
type Step3<T> = T extends '' ? never : Step2<T>;

// ✅ 使用分佈式條件類型
type Flatten<T> = T extends Array<infer U> ? U : T;

type ProcessUnion<T> = T extends any ? Flatten<T> : never;
```

---

## TS-Limit-005: 枚舉成員類型精確性

### 問題描述

TypeScript 枚舉的成員類型不夠精確，無法準確推斷單一成員。

### 嘗試實現（失敗）

```typescript
// ❌ 無法實現精確推斷
enum Status {
    Pending = 'pending',
    Active = 'active',
    Completed = 'completed'
}

// 嘗試精確獲取單一成員類型
type SingleStatus = Status.Active; // ❌ 得到的是 string，而非 'active'

// 問題：枚舉成員的值類型是枚舉本身，而非字面量類型
```

### 替代方案

```typescript
// ✅ 使用 const 對象替代枚舉
const Status = {
    Pending: 'pending',
    Active: 'active',
    Completed: 'completed'
} as const;

type StatusValue = typeof Status[keyof typeof Status];
// 類型為 'pending' | 'active' | 'completed'

// ✅ 使用字面量聯合類型
type Status = 'pending' | 'active' | 'completed';

function setStatus(status: Status): void {
    // 類型精確
}

setStatus('active'); // ✅ 正確
setStatus('invalid'); // ❌ 類型錯誤
```

---

## TS-Limit-006: 私有成員訪問

### 問題描述

無法通過類型系統訪問類的私有成員。

### 嘗試實現（失敗）

```typescript
// ❌ 無法實現
class Container {
    private secret: string;
    
    getSecret(): string {
        return this.secret;
    }
}

type GetPrivateKeys<T> = {
    [K in keyof T]: T[K] extends never ? never : K
}[keyof T];

// 問題：private 成員在類型定義中不可見
```

### 替代方案

```typescript
// ✅ 使用存取器方法
class Container {
    private _secret: string;
    
    get secret(): string {
        return this._secret;
    }
}

// ✅ 使用 Symbol 作為鍵
const SecretKey = Symbol('secret');
class Container {
    [SecretKey]: string;
}

// ✅ 使用映射類型時使用 Record
type PrivateFields<T> = {
    [K in keyof T as `private${Capitalize<string & K>}`]: T[K];
};
```

---

## TS-Limit-007: 函式 overload 動態匹配

### 問題描述

無法根據運行時參數動態選擇函式 overload。

### 嘗試實現（失敗）

```typescript
// ❌ 無法實現
function process(input: string): string;
function process(input: number): number;
function process(input: string | number): string | number {
    return input;
}

// 嘗試根據運行時類型自動選擇 overload
function dynamicProcess(input: unknown): ReturnType<typeof process> {
    // 問題：無法根據 input 的運行時類型自動選擇對應的 overload
    return process(input as any);
}
```

### 替代方案

```typescript
// ✅ 使用手動類型守衛
function isString(input: unknown): input is string {
    return typeof input === 'string';
}

function isNumber(input: unknown): input is number {
    return typeof input === 'number';
}

function dynamicProcess(input: unknown): string | number {
    if (isString(input)) {
        return process(input); // 類型已收縮為 string
    }
    if (isNumber(input)) {
        return process(input); // 類型已收縮為 number
    }
    throw new Error('Invalid input');
}

// ✅ 使用泛型 + 條件類型
function genericProcess<T extends string | number>(input: T): T {
    return input;
}
```

---

## TS-Limit-008: 抽象語法樹（AST）類型操作

### 問題描述

無法在類型層面對代碼的 AST 結構進行操作。

### 嘗試實現（失敗）

```typescript
// ❌ 無法實現
type ParseTemplate<T extends string> = 
    // 嘗試解析模板字面量為 AST
    T extends `${infer Head}${'{${infer Expr}}${infer Tail}` 
    ? { type: 'expression'; value: Expr } | ParseTemplate<Tail>
    : { type: 'text'; value: T };

// 問題：TypeScript 類型系統無法實現完整的模板解析
```

### 替代方案

```typescript
// ✅ 使用 AST 庫在運行時解析
import { parse } from '@babel/parser';

function parseTemplate(template: string): AST {
    return parse(template);
}

// ✅ 使用 TypeScript Compiler API（僅在編譯時）
import * as ts from 'typescript';

function getTypeAtLocation(sourceFile: ts.SourceFile, pos: number): ts.Type {
    const checker = program.getTypeChecker();
    const node = sourceFile.getDescendantAtPos(pos);
    return checker.getTypeAtLocation(node!);
}
```

---

## 限制代碼模板

每當遇到無法實現的類型時，使用以下模板：

```typescript
/**
 * [功能名稱] - 無法實現
 * [Feature Name] - Not Implementable
 *
 * TODO: [TS-XXX-XXX] 具體限制編號和描述
 *
 * 原始實現（失敗）：
 * ```typescript
 * // 原本嘗試實現的代碼
 * ```
 *
 * 限制原因：
 * - 中文說明
 * - English explanation
 *
 * 參考價值：
 * - 學習價值：...
 * - 未來實現：...
 * - 替代方案：...
 */
```

---

## 相關資源

- [替代方案](./alternatives.md) - 運行時解決方案
- [範例](./examples.md) - 完整處理範例
