---
tags:
  - reference
  - unimplemented
  - code
  - examples
---

# 無法實現代碼參考範例
# Unimplemented Code Reference Examples

本目錄收錄過長的無法實現代碼範例，供主規則文件引用。

This directory contains examples of unimplemented code that is too long to include directly in the main rule file, for reference purposes.

---

## 使用方式

當無法實現的代碼超過約 20 行時，在程式碼中使用引用方式：

```typescript
/**
 * TODO: [類別-編號] 功能名稱
 * 原始實現過長，詳見 / Original implementation too long, see:
 * rules/unimplemented-code-handling-references/filename.md
 */
```

---

## 範例列表

### runtime-type-reflection.md

運行時類型反射的詳細實現嘗試，包含完整的類型推斷邏輯。

Runtime type reflection detailed implementation attempts, including complete type inference logic.

### dynamic-code-generation.md

動態代碼生成的多種嘗試方式，包括 eval、Function 建構子等。

Multiple attempts at dynamic code generation, including eval, Function constructor, etc.

### complex-algorithm.md

複雜算法的無法實現版本，需要運行時優化或特定硬體支援。

Complex algorithm unimplemented versions that require runtime optimization or specific hardware support.

---

## 新增範例

若要新增範例，請遵循以下格式：

```markdown
# [功能名稱]
# [Feature Name]

## 限制描述 / Limitation Description

[中文說明]

[English description]

## 原始代碼 / Original Code

```[語言]
// 完整且過長的無法實現代碼
```

## 限制原因 / Limitation Reason

- [原因 1]
- [原因 2]

## 參考價值 / Reference Value

- 學習價值：...
- 未來實現：...
- 替代方案：...
```
