---
tags:
  - typescript
  - alternatives
  - runtime-validation
  - type-system
  - zod
---

# TypeScript 運行時替代方案

本文件提供無法通過 TypeScript 類型系統實現的功能的運行時替代解決方案。

---

## 替代方案總覽

| 限制類型 | 運行時替代方案 | 推薦庫 |
|---------|--------------|--------|
| 運行時類型反射 | 運行時類型驗證 | zod, io-ts, runtypes |
| 動態類型生成 | 動態 Schema 驗證 | ajv, joi |
| 深層類型遞迴 | 迭代類型定義 | 手動實現 |
| 枚舉成員類型 | const 對象 + as const | 原生 |
| 私有成員訪問 | 存取器方法 / Symbol | 原生 |

---

## Alt-001: 運行時類型驗證 - Zod

### 安裝

```bash
npm install zod
```

### 使用範例

```typescript
import { z } from 'zod';

// 定義 schema
const UserSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100),
    email: z.string().email(),
    age: z.number().int().positive().optional(),
    role: z.enum(['admin', 'user', 'guest']),
});

// 運行時驗證
function validateUser(data: unknown): User {
    return UserSchema.parse(data); // 拋出錯誤或返回驗證後的類型
}

// 類型推斷 - 從 schema 推斷 TypeScript 類型
type User = z.infer<typeof UserSchema>;
// 類型為：
// {
//     id: string;
//     name: string;
//     email: string;
//     age?: number;
//     role: 'admin' | 'user' | 'guest';
// }
```

### 優勢

- **類型安全**：從 schema 推斷 TypeScript 類型
- **驗證錯誤**：提供清晰的錯誤訊息
- **可擴展**：支持自定義驗證器

---

## Alt-002: 運行時類型驗證 - io-ts

### 安裝

```bash
npm install io-ts fp-ts
```

### 使用範例

```typescript
import * as t from 'io-ts';
import { right, isRight } from 'fp-ts/Either';

// 定義類型
const UserCodec = t.type({
    id: t.string,
    name: t.string,
    email: t.string,
});

// 運行時驗證
function validateUser(data: unknown): User | null {
    const result = UserCodec.decode(data);
    if (isRight(result)) {
        return result.right;
    }
    return null;
}

// 類型推斷
interface User extends t.TypeOf<typeof UserCodec> {}
```

---

## Alt-003: JSON Schema 驗證 - Ajv

### 安裝

```bash
npm install ajv
```

### 使用範例

```typescript
import Ajv from 'ajv';

const ajv = new Ajv();

// 定義 schema
const schema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        age: { type: 'integer', minimum: 0 },
        email: { type: 'string', format: 'email' }
    },
    required: ['name', 'email']
};

const validate = ajv.compile(schema);

function validateUser(data: unknown): boolean {
    const valid = validate(data);
    if (!valid) {
        console.log(validate.errors);
    }
    return valid!;
}
```

---

## Alt-004: 深度嵌套類型的運行時處理

### 使用 Lodash 進行深度操作

```typescript
import _ from 'lodash';

// 深度Partial（可選）
const deepPartial = <T>(obj: T): Partial<T> => {
    return _.mapValues(obj, (value) => 
        _.isObject(value) ? deepPartial(value) : value
    ) as Partial<T>;
};

// 深度只讀
const deepReadonly = <T>(obj: T): Readonly<T> => {
    return Object.freeze(
        _.mapValues(obj, (value) => 
            _.isObject(value) ? deepReadonly(value) : value
        ) as Readonly<T>
    );
};

// 深度比較
const deepEqual = (a: unknown, b: unknown): boolean => {
    return _.isEqual(a, b);
};
```

### 自定義深度工具

```typescript
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 運行時實現
function deepPartialRuntime<T>(obj: T): DeepPartial<T> {
    if (obj === null || typeof obj !== 'object') {
        return obj as DeepPartial<T>;
    }
    
    const result: Record<string, unknown> = {};
    for (const key in obj) {
        const value = obj[key];
        if (value && typeof value === 'object') {
            result[key] = deepPartialRuntime(value);
        } else {
            result[key] = value as any;
        }
    }
    return result as DeepPartial<T>;
}
```

---

## Alt-005: 替代枚舉的最佳實踐

### 使用 const 對象

```typescript
// ✅ 推薦：const 對象 + as const
const Status = {
    Pending: 'pending',
    Active: 'active',
    Completed: 'completed',
    Cancelled: 'cancelled',
} as const;

// 類型推斷
type StatusValue = typeof Status[keyof typeof Status];
// 'pending' | 'active' | 'completed' | 'cancelled'

// 枚舉風格的鍵值對
const StatusEnum = {
    ...Status,
} as const;

// 函式參數使用字面量聯合類型
function setStatus(status: StatusValue): void {
    console.log(status);
}

setStatus('active'); // ✅ 正確
setStatus('invalid'); // ❌ 類型錯誤
```

### 使用 Symbol 防止命名衝突

```typescript
const Status = {
    Pending: Symbol('pending'),
    Active: Symbol('active'),
    Completed: Symbol('completed'),
} as const;

// 類型
type StatusSymbol = typeof Status[keyof typeof Status];
```

---

## Alt-006: 運行時私有成員訪問

### 使用 WeakMap 實現真正的私有

```typescript
// 使用 WeakMap 實現私有成員
const privateData = new WeakMap<Container, { secret: string }>();

class Container {
    constructor(secret: string) {
        privateData.set(this, { secret });
    }
    
    getSecret(): string {
        return privateData.get(this)!.secret;
    }
    
    setSecret(secret: string): void {
        privateData.get(this)!.secret = secret;
    }
}

// 外部無法訪問私有數據
const container = new Container('my-secret');
// container.secret // ❌ 不可訪問
container.getSecret(); // ✅ 可訪問
```

### 使用 #private 類字段（ES2022）

```typescript
class Container {
    #secret: string;
    
    constructor(secret: string) {
        this.#secret = secret;
    }
    
    getSecret(): string {
        return this.#secret;
    }
}

// 注意：#private 仍然是運行時私有，不是編譯時私有
// 外部仍然可以通過 Reflect 訪問（但這是不推薦的做法）
```

---

## Alt-007: 運行時函式重載

### 使用類型守衛

```typescript
// 類型守衛函式
function isString(value: unknown): value is string {
    return typeof value === 'string';
}

function isNumber(value: unknown): value is number {
    return typeof value === 'number';
}

function isArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

// 處理函式
function process(input: string): string;
function process(input: number): number;
function process(input: unknown): string | number {
    if (isString(input)) {
        return input.toUpperCase(); // TypeScript 知道 input 是 string
    }
    if (isNumber(input)) {
        return input * 2; // TypeScript 知道 input 是 number
    }
    throw new Error('Invalid type');
}
```

### 使用 discriminated union

```typescript
type Action =
    | { type: 'increment'; payload: number }
    | { type: 'decrement'; payload: number }
    | { type: 'reset' };

function reducer(action: Action): number {
    switch (action.type) {
        case 'increment':
            return action.payload + 1; // 類型已收縮
        case 'decrement':
            return action.payload - 1;
        case 'reset':
            return 0;
    }
}
```

---

## Alt-008: 運行時 AST 操作

### 使用 AST 庫

```typescript
// 使用 @babel/parser 解析
import { parse } from '@babel/parser';

const ast = parse(`
    function hello(name) {
        return 'Hello, ' + name;
    }
`);

// 使用 ts-morph 操作 TypeScript AST
import { Project, SourceFile } from 'ts-morph';

const project = new Project();
const sourceFile = project.addSourceFile('hello.ts', `
    function hello(name: string): string {
        return 'Hello, ' + name;
    }
`);

// 獲取函式
const functionDeclaration = sourceFile.getFunction('hello');
console.log(functionDeclaration.getReturnType().getText());
```

---

## 選擇正確的替代方案

### 決策樹

```
需要運行時類型驗證？
    │
    ├─ 是 → 簡單驗證？ → Zod / runtypes
    │           │
    │           └─ 複雜 schema？ → Ajv / Joi
    │
    └─ 否 → 需要深度嵌套類型？
                │
                ├─ 是 → 使用 lodash 或自定義工具函式
                │
                └─ 否 → 使用 const 對象 + as const
```

---

## 相關資源

- [限制說明](./limitations.md) - TypeScript 類型系統限制
- [範例](./examples.md) - 完整處理範例
