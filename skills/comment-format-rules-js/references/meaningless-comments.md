---
description: >-
  無意義註解的判定與處理：僅重複宣告關鍵字（interface、enum、type 等）的註解不得新增，
  遇到既有者直接刪除；確需說明時改寫為用途、約束或業務意圖。
tags:
  - comments/format
  - documentation/references
  - comments
---

# 無意義註解 (Meaningless Comments)

僅重複宣告關鍵字本身、不含任何語義資訊的註解屬**無意義註解**：不得新增，遇到既有者直接刪除。

## 錯誤案例 (Bad Examples)

```typescript
// ❌ 錯誤：僅標示宣告形式，資訊與宣告關鍵字完全重複
/**
 * 介面 / interface
 */
interface ISkillDef

/**
 * 枚舉
 */
enum EnumStatusPrefix

/**
 * type
 */
type ITypeA
```

宣告形式已是自明資訊：`interface`、`enum`、`type`、`class` 等關鍵字本身已表達宣告形式，再以註解標示一次不提供任何新資訊。

## 正確處理 (Correct Handling)

移除註解後若理解不減損，即屬無意義註解——直接刪除：

```typescript
// ✅ 正確：直接刪除該註解
interface ISkillDef
enum EnumStatusPrefix
type ITypeA
```

## 需要說明時 (When Explanation Is Needed)

若該宣告確實需要解釋，改寫為說明**用途、約束或業務意圖**的有意義註解，而非標示其宣告型別：

```typescript
/**
 * 技能定義：描述一個可被載入的技能之名稱、說明與觸發條件
 * Skill definition: name, description and trigger conditions of a loadable skill
 */
interface ISkillDef
```
