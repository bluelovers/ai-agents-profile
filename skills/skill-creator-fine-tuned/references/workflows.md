---
title: 複雜工作流程與分支邏輯設計模式
description: >-
  提供建立 Skill 時引導 Agent 執行多步驟、順序式工作流程與條件分支邏輯的設計模式。
  避免 Agent 執行混亂，確保複雜操作的確定性與正確性。
tags:
  - agents/skills/skill-creation
  - agents/workflow
  - documentation/references
---

# 工作流程設計模式參照 | Workflow Patterns Reference

當技能涉及複雜的多步驟操作、環境偵測、或需要根據特定條件選擇不同處理路徑時，使用這些工作流程模式來引導 Agent。

---

## 📌 順序工作流程 (Sequential Workflows)

對於複雜的任務，將操作分解為清晰的、順序式的步驟，並在 `SKILL.md` 的前段提供整個流程的全局概覽，以確保 Agent 保持清晰的思維路徑：

```markdown
填寫 PDF 表單的工作流程包含以下步驟：

1. **分析表單**：執行 `analyze_form.py` 偵測表單欄位。
2. **建立欄位對照表**：編輯 `fields.json` 定義對應關係。
3. **驗證對照表**：執行 `validate_fields.py` 確保對應格式無誤。
4. **填充表單**：執行 `fill_form.py` 進行實際寫入。
5. **驗證輸出結果**：執行 `verify_output.py` 確保輸出 PDF 的完整性。
```

---

## 📌 分支與條件工作流程 (Conditional Workflows)

對於具有多種變體、框架或執行環境的技能，引導 Agent 進行明確的條件判斷：

```markdown
1. **判定修改類型與環境**：
   - 🆕 **建立新內容**？ → 遵循下方「建立工作流程」的指示。
   - ✏️ **編輯現有內容**？ → 遵循下方「編輯工作流程」的指示。

2. **建立工作流程**：[具體步驟]
3. **編輯工作流程**：[具體步驟]
```

> [!IMPORTANT]
> 結合「漸進式揭露原則」，若不同分支的細節極其複雜，請將分支細節拆分至 `references/` 目錄的獨立 Markdown 檔案中。
> 例如：
> - AWS 部署細節放置於 `references/aws.md`
> - GCP 部署細節放置於 `references/gcp.md`
