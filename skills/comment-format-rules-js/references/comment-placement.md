---
description: >-
  詳細規範註解的放置位置：代碼上方原則、陣列元素、物件屬性、Interface/Type 成員註解，
  以及 JSDoc @example 區塊內允許行內註解的例外情況。
tags:
  - comments/format
  - documentation/jsdoc
  - documentation/references
---

# 註解位置規範 (Placement Rules)

**註解應放置於代碼上方，而非代碼後方。** 這樣的安排有助於提升代碼的可讀性，並使 IDE 及 AI 能夠更好地理解上下文關聯。

## 對陣列元素的註解

```typescript
// ✅ 推薦：註解放在上方
let arr = [
    /** 數字 / Numbers */
    /[\d０-９]+(?:,[\d０-９]+)?(?:\.[\d０-９]+)?/,
    /** 英文及擴展拉丁字母 / English and extended Latin */
    /[\w０-９Ａ-Ｚａ-ｚ\u0100-\u017F\u00A1-\u00FF]+/,
    /** 阿拉伯文 / Arabic */
    /[\u0600-\u06FF\u0750-\u077F]+/,
    /** 俄文（西里爾字母）/ Russian (Cyrillic) */
    /[\u0400-\u04FF]+/,
    /** 希臘文 / Greek */
    /[\u0370-\u03FF]+/,
];
```

## 對物件屬性的註解

```typescript
// ✅ 推薦：使用文檔區塊註解，放置於屬性上方
let jsonHandlerOptions = {
	/**
	 * 是否允許註解
	 * @default true
	 */
	allowComments: true
}
```

## Interface 與 Type 成員註解規則

**禁止在 Interface 或 Type 的 JSDoc 中使用 `@property` 描述成員**，應在每個成員上方直接添加註解：

```typescript
// ❌ 錯誤：使用 @property 在 interface JSDoc 中描述成員
/**
 * 工具配置介面
 * Tool configuration interface
 *
 * @property description - 描述說明 / Description
 * @property shortDescription - 簡短描述 / Short description
 * @property args - 參數 / Arguments
 */
interface I_AriseToolsConfigEntry {
	description?: string;
	shortDescription: string;
	args: unknown;
}

// ✅ 正確：在每個成員上方直接添加註解
interface I_AriseToolsConfigEntry
{
	/** 描述說明 / Description */
	description?: string;
	/** 簡短描述 / Short description */
	shortDescription: string;
	/** 參數 / Arguments */
	args: unknown;
}
```

**原因：**
- `@property` 標籤需要額外維護，且容易與實際成員脫節
- 成員上方的註解更直觀，IDE 可正確識別並顯示 IntelliSense
- 符合「每個成員獨立註解」的核心原則

## 注意事項

- **避免代碼後方註解** (`code // comment`)：直行註解會降低代碼的視覺層級，分散閱讀焦點
- **對齊與視覺性**：註解在上方時，能清晰分隔邏輯段落，提升掃描效率
- **IDE 支援**：將註解置於上方，更能幫助編輯器正確識別與該代碼相關的上下文

## 例外情況：JSDoc `@example` 區塊內的行內註解

在 JSDoc 的 `@example` 程式碼範例區塊中，**允許使用行內註解 (`//`)**。這是因為：

1. 範例中的註解屬於文件展示用途，非實際執行代碼
2. 用於說明預期輸出或行為（如 `console.log(x); // 輸出: 3`）
3. 系統限制：範例內無法使用巢狀的區塊註解

```typescript
/**
 * @example
 * ```typescript
 * // 修改克隆的樣式不會影響原始
 * cloned._styles.push({ open: '\\x1b[34m', close: '\\x1b[39m', closeRe: /\\x1b[39m/ });
 * console.log(source._styles.length); // 2（原始未變）
 * console.log(cloned._styles.length); // 3（克隆已修改）
 * ```
 */
```
