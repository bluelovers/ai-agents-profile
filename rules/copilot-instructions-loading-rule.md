# GitHub Copilot 指令載入規則
# GitHub Copilot Instructions Loading Rule

## 概述

本規則定義了非 VS Code agents 如何載入並使用 GitHub Copilot 指令配置，實現跨平台 AI 指令的一致性。

## 指令層次結構

GitHub Copilot 指令採用「全域基礎 + 局部精確」的雙層配置架構：

### 1. 全域指令：`.github/copilot-instructions.md`

**定位：專案憲法 (Global Rules)**

- **生效範圍**：整個專案的所有檔案
- **載入方式**：始終載入，作為基礎背景約束
- **核心內容**：
  - 專案簡述與核心業務邏輯
  - 技術棧清單
  - 通用語法偏好
  - 嚴格禁忌事項

### 2. 精確指令：`.github/instructions/*.instructions.md`

**定位：領域專業手冊 (Specialized Rules)**

- **生效範圍**：情境感知（Context-aware），根據當前編輯的檔案路徑或類型自動匹配
- **載入方式**：選擇性載入，依據檔案類型或路徑匹配
- **核心內容**：
  - UI 組件規範
  - API 邏輯規範
  - 測試模板規範
  - 其他特定領域規範

## 載入流程

### 步驟 1：檢查全域指令

```
開始任務
    │
    ▼
檢查 .github/copilot-instructions.md 是否存在？
    │
    ├─ 是 → 讀取並載入為基礎約束
    │
    └─ 否 → 繼續執行任務
```

### 步驟 2：選擇性載入精確指令

```
確定當前任務情境
    │
    ▼
掃描 .github/instructions/ 目錄
    │
    ▼
根據 applyTo 規則匹配相關指令
    │
    ▼
載入匹配的指令檔案
```

## 精確指令匹配規則

精確指令檔案應在開頭使用 `applyTo` 欄位定義適用範圍：

### applyTo 語法格式

```markdown
---
applyTo: "**/*.ts"
---

# TypeScript 指令內容
```

### applyTo 匹配模式

| 模式 | 說明 | 範例 |
|------|------|------|
| `"**/*.ts"` | 所有 TypeScript 檔案 | `src/utils/helper.ts` |
| `"**/*.test.ts"` | 所有測試檔案 | `src/utils/helper.test.ts` |
| `"src/api/**"` | API 目錄下的所有檔案 | `src/api/users.ts` |
| `"**/*.tsx"` | 所有 React 組件 | `src/components/Button.tsx` |
| `"**/styles/**"` | 樣式目錄下的所有檔案 | `src/styles/main.css` |

### 多模式匹配

可使用陣列定義多個匹配模式：

```markdown
---
applyTo: 
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript 與 TSX 指令內容
```

## 指令優先順序

當多個指令同時生效時，遵循以下優先順序：

1. **精確指令** > **全域指令**（精確指令覆蓋全域指令）
2. **後載入的精確指令** > **先載入的精確指令**（依字母順序載入）
3. **專案根目錄指令** > **上層目錄指令**

## 實作範例

### 全域指令範例

```markdown
# .github/copilot-instructions.md

# 專案規範

## 技術棧
- PNPM + TypeScript
- Next.js + Tailwind CSS

## 編碼規範
- 優先使用 Functional Programming
- 註釋一律使用繁體中文
- 禁止使用 `any` 類型
```

### 精確指令範例

```markdown
# .github/instructions/test.instructions.md

---
applyTo: 
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

# 測試檔案規範

## 測試框架
- 使用 Vitest 作為測試框架
- 使用 Snapshot 測試優先原則

## 測試組織
- 每個測試檔案應專注於單一功能模組
- 當測試案例超過 100 行時，考慮分割
```

## Agent 實作指南

### 讀取指令的偽代碼

```typescript
interface CopilotInstruction {
  path: string;
  content: string;
  applyTo?: string | string[];
}

async function loadCopilotInstructions(
  context: {
    filePath: string;
    taskType: string;
  }
): Promise<CopilotInstruction[]> {
  const instructions: CopilotInstruction[] = [];

  // 1. 載入全域指令
  const globalPath = '.github/copilot-instructions.md';
  if (await fileExists(globalPath)) {
    instructions.push({
      path: globalPath,
      content: await readFile(globalPath),
    });
  }

  // 2. 載入匹配的精確指令
  const instructionsDir = '.github/instructions';
  if (await directoryExists(instructionsDir)) {
    const files = await listFiles(instructionsDir, '*.instructions.md');
    
    for (const file of files) {
      const content = await readFile(file);
      const applyTo = parseApplyTo(content);
      
      if (matchesPattern(context.filePath, applyTo)) {
        instructions.push({
          path: file,
          content: content,
          applyTo: applyTo,
        });
      }
    }
  }

  return instructions;
}
```

### 指令應用流程

```typescript
function applyInstructions(
  instructions: CopilotInstruction[],
  task: string
): string {
  // 1. 合併所有指令內容
  const combinedInstructions = instructions
    .map(i => `## 來源: ${i.path}\n\n${i.content}`)
    .join('\n\n---\n\n');

  // 2. 將指令注入到任務提示中
  return `
# 專案指令約束

請遵循以下專案指令執行任務：

${combinedInstructions}

---

# 任務

${task}
`;
}
```

## 相關資源

- [VS Code Copilot 指令配置規範指南](../docs/VS_Code_Copilot.md)
- [GitHub Copilot Custom Instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)
