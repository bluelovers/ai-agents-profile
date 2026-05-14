# TypeScript 6 升級 — 原始碼變更要點

> 基於 TypeScript 5.3.x → 6.0.3 升級經驗整理
> 參考完整升級紀錄：[UPGRADE-LOG.md](../../UPGRADE-LOG.md)

---

## 目錄

- [一、`Uint8Array` 與 `ArrayBuffer` 型別處理](#一-uint8array-與-arraybuffer-型別處理)
  - [正確做法](#正確做法)
  - [❌ 負面案例：不要用 `.buffer` 轉換迎合錯誤型別](#-負面案例不要用-buffer-轉換迎合錯誤型別)
- [二、第三方套件子路徑 import 的類型解析](#二-第三方套件子路徑-import-的類型解析)
  - [正確做法](#正確做法-1)
  - [❌ 負面案例：不要自建 `declare module` 覆蓋第三方型別](#-負面案例不要自建-declare-module-覆蓋第三方型別)
  - [❌ 負面案例：不要用 `paths` 映射不存在路徑](#-負面案例不要用-paths-映射不存在路徑)
- [三、`Blob` 建構子的 `as any` 安全用法](#三-blob-建構子的-as-any-安全用法)
- [四、`http` 模組事件回呼的型別推導](#四-http-模組事件回呼的型別推導)
- [五、檢查清單](#五-檢查清單)

---

## 一、`Uint8Array` 與 `ArrayBuffer` 型別處理

### 背景

TypeScript 6 將 `Uint8Array` 改為泛型：`Uint8Array<T extends ArrayBufferLike>`。在 TS5.x 中 `Uint8Array` 與 `ArrayBuffer` 的型別檢查較寬鬆，TS6 嚴格區分兩者：

- `Uint8Array<ArrayBuffer>` — 不屬於 `ArrayBuffer`
- 常見錯誤：函式宣告回傳 `ArrayBuffer` 但實際回傳 `Uint8Array`

### 錯誤訊息樣式

```
error TS2345: Argument of type 'Uint8Array<ArrayBuffer>' is not assignable to parameter of type 'ArrayBuffer'.
error TS2322: Type 'Uint8Array<ArrayBuffer>' is not assignable to type 'ArrayBuffer'.
```

### 正確做法

**核心原則：不要對抗型別系統，讓型別自然流通。**

#### 情境 1：函式回傳型別宣告錯誤

```typescript
// ❌ 錯誤：型別註記本身就是錯誤的
const stringToBuffer = (input: string): ArrayBuffer => {
  const buf = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) {
    buf[i] = input.charCodeAt(i) & 0xff;
  }
  return buf;  // TS6 報錯
};

// ✅ 正確：移除錯誤的型別註記，讓 TS 推導
const stringToBuffer = (input: string) => {  // TS 自動推導為 Uint8Array
  const buf = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) {
    buf[i] = input.charCodeAt(i) & 0xff;
  }
  return buf;
};
```

#### 情境 2：函式參數型別過窄

```typescript
// ❌ 錯誤：拒絕合法輸入
const base64Url = (buf: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))  // 本體可處理多種型別
  // ...
}

// ✅ 正確：放寬為聯合型別
const base64Url = (buf: ArrayBuffer | Uint8Array): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
  // ...
}
```

#### 情境 3：陣列容器型別不符

```typescript
// ❌ 錯誤
const body: ArrayBuffer[] = [];
body.push(media.content);              // media.content 是 ArrayBuffer ✅
body.push(encoder.encode(data));        // encoder.encode() 回傳 Uint8Array ❌

// ✅ 正確：擴大容器型別
const body: (Uint8Array | ArrayBuffer)[] = [];
body.push(new Uint8Array(media.content));  // 統一轉為 Uint8Array
```

> **注意**：`crypto.subtle.digest()` 接受 `BufferSource`，`Uint8Array` 屬於 `ArrayBufferView` 可直接傳入，**不需要**轉 `ArrayBuffer`。

---

### ❌ 負面案例：不要用 `.buffer` 轉換迎合錯誤型別

```typescript
// ❌ 錯誤做法：加 .buffer 轉換去滿足錯誤的型別註記
const stringToBuffer = (input: string): ArrayBuffer => {
   // ...
   return buf.buffer;  // 強制轉型，治標不治本
};

return base64Url(arr.buffer);  // 每個呼叫點都要加 .buffer
```

**五大問題：**

| 問題 | 說明 |
|:----|:-----|
| 迴避根本原因 | `: ArrayBuffer` 本身就是錯的，應移除而非轉換 |
| 多餘的轉換 | `crypto.subtle.digest()`、`base64Url()` 等 API 已接受 `Uint8Array` |
| 人為 API 限制 | `base64Url(buf: ArrayBuffer)` 拒絕了合法的 `Uint8Array` |
| 縮排雜訊 | 常伴隨大範圍縮排變更，干擾 code review |
| 修改擴散 | 每個 `Uint8Array`→`ArrayBuffer` 傳遞點都得加 `.buffer` |

---

## 二、第三方套件子路徑 import 的類型解析

### 背景

某些第三方套件（如 `markdown-it`）的 `@types/*` 套件只為主模組提供類型定義，不為子路徑（如 `markdown-it/lib/token`）提供獨立的 `.d.ts` 檔案。

TS5.x 可能對子路徑 import 較寬容，但 **TS6 嚴格檢查子路徑模組是否存在對應的類型宣告**。

### 錯誤訊息樣式

```
error TS2307: Cannot find module 'markdown-it/lib/token' or its corresponding type declarations.
error TS2307: Cannot find module 'markdown-it/lib/rules_inline/state_inline' ...
error TS2307: Cannot find module 'markdown-it/lib/rules_block/state_block' ...
```

### 正確做法

#### 步驟 1：在 `types` 中列入套件名稱

```json
{
  "compilerOptions": {
    "types": ["markdown-it", "node"]
  }
}
```

#### 步驟 2：將子路徑 import 改為主模組匯入

```typescript
// ❌ 原本（子路徑 import，TS6 無法解析）
import Token from 'markdown-it/lib/token';
import StateInline from 'markdown-it/lib/rules_inline/state_inline';
import StateBlock from 'markdown-it/lib/rules_block/state_block';

// ✅ 改為從主模組匯入（@types/markdown-it 已匯出這些類型）
import MarkdownIt, { StateBlock, StateInline, Token } from 'markdown-it';
```

#### 步驟 3：確認主模組確實有匯出這些類型

檢查 `@types/<package>/index.d.ts` 或 `package.json` 中的 `types` 指向檔案，確認所需類型是否已從主入口匯出。

---

### ❌ 負面案例：不要自建 `declare module` 覆蓋第三方型別

```typescript
// ❌ 錯誤做法：自行宣告子路徑模組
// src/markdown-it.d.ts
declare module 'markdown-it/lib/token' {
  interface Token { ... }
  export = Token;  // interface 不能 export =
}
```

**問題：**
1. `interface` 無法搭配 `export =`，需要改用 `class`
2. 模組間的類型交叉引用（`StateBlock` 引用 `Token`）無法解析
3. 與 `@types/markdown-it` 主模組宣告衝突
4. 即使加上 `declare module 'markdown-it'` 擴充，`tsc` 仍無法正確合併宣告
5. 維護成本高：需要跟上遊套件的類型定義同步更新

### ❌ 負面案例：不要用 `paths` 映射不存在路徑

```json
{
  "compilerOptions": {
    "paths": {
      "markdown-it/lib/token": ["node_modules/@types/markdown-it/lib/token"]
    }
  }
}
```

**問題：** `@types/markdown-it` 本身沒有為子路徑提供獨立的 `.d.ts` 檔案，這些路徑根本不存在。

---

## 三、`Blob` 建構子的 `as any` 安全用法

### 背景

即使將陣列容器從 `ArrayBuffer[]` 改為 `(Uint8Array | ArrayBuffer)[]`，`Blob` 建構子的參數型別 `BlobPart[]` 仍然無法完全相容：

```typescript
type BlobPart = BufferSource | Blob | string;
// 其中 BufferSource = ArrayBufferView<ArrayBuffer> | ArrayBuffer
```

`Uint8Array<ArrayBufferLike>` 不相容於 `ArrayBufferView<ArrayBuffer>`，因為兩者的 `.buffer` 屬性型別不同：
- `Uint8Array<ArrayBuffer>` → `.buffer` 是 `ArrayBuffer`
- `Uint8Array<ArrayBufferLike>` → `.buffer` 是 `ArrayBufferLike`

### 安全解法

```typescript
return new Blob(body as any).arrayBuffer();
```

> **為什麼安全**：`body` 中的元素都是 `Uint8Array` 或 `ArrayBuffer`，兩者都是有效的 `BlobPart`。這裡的 `as any` 僅繞過型別推導的限制，不影響執行時期行為。

---

## 四、`http` 模組事件回呼的型別推導

### 背景

使用 Node.js `http` 模組建立 server 時，`request` 事件的 `req`/`res` 參數如果沒有 `types: ["node"]`，會因為無法載入 `http` 模組的型別而推導失敗。

### 錯誤訊息樣式

```
error TS7006: Parameter 'req' implicitly has an 'any' type.
error TS7006: Parameter 'res' implicitly has an 'any' type.
```

### 根本原因

不是 `req`/`res` 缺少型別註解，而是 `@types/node` 的型別未被載入，導致 `createServer()` 回傳的 `Server` 型別無法被解析，進而使事件回呼的參數型別推導失敗。

### 解決方式

在 `tsconfig.json` 中加入 `"node"` 到 `types` 陣列即可（同[設定檔變更](ts6-config-changes.md#一-compileroptionstypes-必須明確列出)）。

```json
{
  "compilerOptions": {
    "types": ["node"]
  }
}
```

無需手動為 `req`/`res` 加上型別註解，TypeScript 會自動從 `createServer()` 推導。

---

## 五、檢查清單

升級 TypeScript 主版本時，針對原始碼需檢查：

### 型別相關

- [ ] 所有宣告回傳 `ArrayBuffer` 但實際回傳 `Uint8Array` 的函式（移除錯誤型別註記）
- [ ] 所有參數只接受 `ArrayBuffer` 但本體可處理 `Uint8Array` 的函式（放寬為聯合型別）
- [ ] `Uint8Array[]` / `ArrayBuffer[]` 容器型別是否需要擴大
- [ ] `Blob` 建構子等需要 `as any` 繞過的邊界情況

### Import 相關

- [ ] 任何第三方套件的子路徑 import（如 `pkg/lib/xxx`）
- [ ] 子路徑的類型是否可從主模組匯入
- [ ] `@types/*` 套件是否有提供子路徑的獨立型別檔案

### 應避免的做法

- [ ] 不要加 `.buffer` 轉換去迎合錯誤的型別註記（應移除錯誤註記）
- [ ] 不要自建 `declare module` 覆蓋第三方套件的型別
- [ ] 不要用 `paths` 映射不存在的子路徑型別檔案
- [ ] 不要在修復型別時夾帶無關的縮排變更

---

> **相關檔案**：[設定檔變更](ts6-config-changes.md) | [npm→pnpm 轉換紀錄](pnpm-migration.md)
