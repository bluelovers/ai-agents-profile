---
tags:
  - rules
  - unimplemented
  - code
  - handling
  - documentation
---

# 無法實現代碼處理規則
# Unimplemented Code Handling Rules

## 概述

本規則定義了當遇到目前無法實現的代碼時的處理方式。這不是簡單地刪除代碼，而是將其轉化為有意義的文檔，保留技術上下文並為未來實現做準備。

This rule defines how to handle code that cannot be currently implemented. Instead of simply deleting code, it transforms it into meaningful documentation that preserves technical context and prepares for future implementation.

---

## 核心原則

### 1. 保留為註解 (Preserve as Comments)

當遇到目前無法實現的功能時，**必須保留原始實現作為參考**。這不是簡單地刪除代碼，而是將其轉化為有意義的文檔。

When encountering features that cannot be currently implemented, **the original implementation must be preserved as reference**. Instead of simply deleting code, transform it into meaningful documentation.

#### 代碼過長時的處理

如果無法實現的代碼過長（如超過 20 行），建議將原始代碼紀錄在獨立的參考文件中，避免影響主程式碼的可讀性。

When the unimplemented code is too long (e.g., more than 20 lines), it is recommended to record the original code in a separate reference file to avoid affecting the readability of the main codebase.

```typescript
// ✅ 簡短代碼：直接保留在註解中
// ✅ Short code: Keep directly in comments
/**
 * TODO: [TS-001] 運行時類型反射
 * Original implementation:
 * ```typescript
 * type RuntimeType<T> = ...
 * ```
 */

// ✅ 代碼過長時：引用外部參考文件
// ✅ Long code: Reference external reference file
/**
 * TODO: [TS-001] 運行時類型反射
 * 原始實現過長，詳見 / Original implementation too long, see:
 * references/unimplemented/runtime-type-reflection.md
 */
```

### 2. 雙語說明 (Bilingual Explanations)

**所有無法實現的代碼都必須包含中文和英文說明**，確保不同背景的開發者都能理解。

**All unimplemented code must include both Chinese and English explanations** to ensure developers from different backgrounds can understand.

```typescript
/**
 * 運行時類型驗證功能
 * Runtime type validation feature
 *
 * 原始實現 (不可行 / Not feasible):
 * ```typescript
 * type RuntimeTypeOf<T> = ... // 嘗試在運行時獲取類型資訊
 * ```
 *
 * 限制原因 / Limitation reason:
 * TypeScript 類型在編譯後被完全擦除，無法在運行時獲取類型資訊
 * TypeScript types are completely erased after compilation,
 * making runtime type information inaccessible
 */
```

### 3. TODO 標記 (TODO Markers)

每個無法實現的類型都建議有清晰的 **TODO 標記**，可選擇性包含限制編號。

Each unimplemented type should have a clear **TODO marker**, limitation IDs are optional.

```typescript
// TODO: 運行時類型反射限制 (可選擇加入編號如 [GEN-001])
// TODO: Runtime type reflection limitation (optional ID like [GEN-001] can be added)
//
// 無法實現：/ Cannot implement:
// - 在運行時動態獲取類型資訊 / Dynamically获取运行时类型信息
// - 根據運行時數據生成類型 / Generate types based on runtime data
//
// 替代方案：/ Alternative solutions:
// - 使用 zod/joi 等運行時驗證庫
// - Use zod/joi for runtime validation
//
// 未來可能：/ Future possibility:
// - 關注 TypeScript 官方動態類型提案
// - Monitor TypeScript official dynamic type proposals
```

### 4. 參考價值 (Reference Value)

說明無法實現代碼的學習價值、未來實現可能性和替代方案。

Explain the learning value, future implementation possibilities, and alternatives for unimplemented code.

```typescript
/**
 * 參考價值 / Reference Value:
 * - 學習價值：了解 [具體技術] 的限制和設計考量
 * - Learning value: Understanding limitations and design considerations of [specific technology]
 * - 未來實現：當 [技術版本/環境] 更新時可能支援
 * - Future implementation: May be supported when [technology version/environment] updates
 * - 替代方案：可以使用 [替代技術/庫] 實現類似功能
 * - Alternatives: Similar functionality can be implemented using [alternative technology/library]
 */
```

---

## 處理流程

### 步驟 1：識別無法實現的代碼

```
遇到無法實現的功能
    │
    ▼
這是系統或環境限制嗎？
    │
    ├─ 是 → 進入無法實現處理流程
    │
    └─ 否 → 嘗試修復或尋找替代設計
```

### 步驟 2：分類限制類型

| 限制類型 | 範例 | 處理方式 |
|---------|------|---------|
| 語言限制 | TypeScript 運行時類型擦除 | 保留原始嘗試，說明限制 |
| 環境限制 | 瀏覽器 API 兼容性 | 提供特性檢測備案 |
| 性能限制 | 複雜算法無法達標 | 記錄優化過程 |
| 依賴限制 | 第三方庫不支援 | 追蹤庫的更新 |

### 步驟 3：生成保留代碼

```typescript
/**
 * [功能名稱]
 * [Feature name]
 *
 * TODO: 具體限制描述 (可選擇加入編號如 [類別-編號])
 *
 * 原始代碼：
 * ```[語言]
 * // 這裡是原本嘗試實現但失敗的代碼
 * ```
 *
 * 限制原因：
 * - 中文說明 / English explanation
 *
 * 參考價值：
 * - 學習價值：...
 * - 未來實現：...
 * - 替代方案：...
 */
```

---

## 限制編號命名規範

### 編號格式（可選）

```
[類別]-[三位數編號]
```

限制編號為可選項目，可根據團隊需求決定是否使用。

### 類別前綴（參考）

### 類別前綴參考

| 前綴 | 適用範圍 | 範例 |
|------|---------|------|
| `GEN` | 通用限制 | `GEN-001` |
| `TS` | TypeScript 限制 | `TS-001` |
| `JS` | JavaScript 限制 | `JS-001` |
| `PY` | Python 限制 | `PY-001` |
| `ENV` | 環境限制 | `ENV-001` |
| `PERF` | 性能限制 | `PERF-001` |
| `LIB` | 第三方庫限制 | `LIB-001` |

---

## 常見無法實現模式

### 模式 1：運行時類型反射

```typescript
// ❌ 無法實現 / Cannot implement
/**
 * 運行時類型反射
 * Runtime type reflection
 *
 * TODO: 問題：大多數靜態類型語言在編譯後會擦除類型資訊
 * TODO: Problem: Most statically-typed languages erase type information after compilation
 *
 * 原始實現：
 * ```typescript
 * type RuntimeType<T> = T extends infer U ? U : never;
 * // 嘗試在運行時獲取類型資訊 - 失敗
 * ```
 *
 * 替代方案：
 * - 使用運行時驗證庫 (zod, io-ts, class-validator)
 * - Use runtime validation libraries (zod, io-ts, class-validator)
 * - 手動定義 type guard
 * - Manually define type guards
 */
```

### 模式 2：動態代碼生成

```typescript
// ❌ 無法實現 / Cannot implement
/**
 * 動態函式生成
 * Dynamic function generation
 *
 * TODO: 問題：許多環境出於安全考量禁止 eval 或動態代碼生成
 * TODO: Problem: Many environments prohibit eval or dynamic code generation for security
 *
 * 原始實現：
 * ```javascript
 * const createHandler = (config) => {
 *   return eval(`(req, res) => ${config.handlerCode}`);
 * };
 * ```
 *
 * 替代方案：
 * - 使用策略模式或命令模式
 * - Use strategy pattern or command pattern
 * - 預定義處理函式映射
 * - Predefined handler function mapping
 */
```

### 模式 3：跨語言代價昂貴的操作

```typescript
// ❌ 不建議實現 / Not recommended to implement
/**
 * 阻塞式文件IO在主線程
 * Blocking file I/O on main thread
 *
 * TODO: 問題：阻塞主線程會導致 UI 卡頓或效能問題
 * TODO: Problem: Blocking main thread causes UI freezing or performance issues
 *
 * 原始實現：
 * ```javascript
 * const data = fs.readFileSync('large-file.txt');
 * ```
 *
 * 替代方案：
 * - 使用非同步 API (fs.promises.readFile)
 * - Use async API (fs.promises.readFile)
 * - 使用 Web Worker
 * - Use Web Worker
 */
```

---

## 與其他規則的整合

### 與註解格式規範的整合

本規則應與 [comment-format-rules.md](comment-format-rules.md) 配合使用：

- 使用結構化文檔註解 (`/** ... */`) 進行說明
- 使用單行區塊註解 (`/** ... */`) 進行簡短說明
- 遵循註解位置規範（放置於代碼上方）

### 與測試檔案最佳實踐的整合

當無法實現的功能涉及測試時：

- 在測試檔案中標註 TODO 說明無法測試的原因
- 記錄未來可能的測試方式
- 提供替代測試方案

---

## 範本總結

```typescript
/**
 * [無法實現的功能名稱]
 * [Unimplemented feature name]
 *
 * TODO: 限制描述 (可選擇加入編號如 [類別-編號])
 * TODO: Limitation description (optional ID like [Category-Number] can be added)
 *
 * 原始代碼：
 * ```[語言]
 * // 原本嘗試實現的代碼
 * ```
 *
 * 限制原因：
 * - 中文說明 / English explanation
 *
 * 參考價值：
 * - 學習價值：...
 * - 未來實現：...
 * - 替代方案：...
 */
```

---

## 相關資源

- [comment-format-rules.md](comment-format-rules.md) - 註解格式規範
- [test-file-best-practices.md](test-file-best-practices.md) - 測試檔案最佳實踐
- [typescript-unimplemented-handler skill](../skills/typescript-unimplemented-handler/SKILL.md) - TypeScript 特定處理器
- [unimplemented-code-handling-references/](unimplemented-code-handling-references/) - 過長無法實現代碼參考檔案
