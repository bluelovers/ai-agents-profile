---
title: AI 輸出設計模式與模版參照
description: >-
  提供建立 Skill 時如何規範 Agent 產出高品質與一致性內容的輸出模式。
  包括嚴格與彈性的模版設計、以及透過 Examples 模式引導 Agent 產出期望語氣與格式的實例。
tags:
  - agents/skills/skill-creation
  - output/patterns
  - documentation/references
---

# 輸出設計模式參照 | Output Patterns Reference

當技能需要引導 Agent 產出高度一致、符合高品質標準的輸出時，應在 Skill 中使用這些既定的設計模式。

---

## 📋 模版設計模式 (Template Pattern)

為輸出提供明確的結構模版。根據應用的嚴格程度，選擇適合的自由度：

### 1. 嚴格模版 (用於 API 回應、結構化資料或嚴格報告)

當輸出的段落與標題必須完全一致、不可任意修改時，使用明確的強約束文字：

```markdown
## 報告結構規範

 Agent 產出時「必須」完全遵循以下模版結構：

# [分析標題]

## 執行摘要
[一小段核心結論與發現]

## 關鍵發現
- 發現 1（附帶支持數據）
- 發現 2（附帶支持數據）
- 發現 3（附帶支持數據）

## 行動建議
1. 具體且可執行的建議
2. 具體且可執行的建議
```

---

### 2. 彈性指引 (當需要 Agent 依據上下文彈性調整時)

當給予 Agent 基本結構，但允許依據實際分析內容進行自適應微調時：

```markdown
## 建議報告結構

以下是推薦的預設格式，請依據實際分析情境進行最佳判斷與微調：

# [分析標題]

## 執行摘要
[概覽]

## 關鍵發現
[可依據實際探查到的數據，自行增減或調整子標題]

## 行動建議
[針對特定上下文量身客製的建議]

可依據分析類型的不同，適度調整或合併段落。
```

---

## 🎨 範例導向模式 (Examples Pattern)

當輸出的品質與語氣、精準度高度依賴於「感官理解」時，提供清晰的輸入/輸出範例是最有效率的作法：

```markdown
## Git Commit 訊息格式規範

請遵循以下範例格式產生 commit 訊息：

**範例 1：**
輸入：新增了使用 JWT token 的使用者驗證功能
輸出：
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**範例 2：**
輸入：修正了報告中日期顯示時區不正確的 bug
輸出：
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```

遵循風格：`型態(範圍): 簡短描述`，並在空一行後撰寫詳細說明。
```

> [!TIP]
> 對於複雜的語境或程式碼格式，提供 2-3 個高品質的範例，比撰寫數百字的文字約束更具指導力。
