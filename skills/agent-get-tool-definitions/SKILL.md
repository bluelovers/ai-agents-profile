---
name: agent-get-tool-definitions
description: 說明如何在 OpenCode 平台中取得工具定義（Tool Definitions）。AI 可透過會話初始化時自動注入的 System Prompt 取得工具定義的完整內容，包括工具名稱、參數類型與描述說明。Use when users request (1) 取得工具定義, (2) Tool definition source, (3) Tool metadata, (4) OpenCode tool definitions, (5) 工具元數據取得.
tags:
  - agents/tools/tool-definitions
  - opencode
  - agents/prompts/system-prompts
  - agents/skills
---

# 工具定義（Tool Definitions）取得說明

## 概述

本 skill 說明如何在 OpenCode 平台中取得工具定義（Tool Definitions）。

**核心要點**：
- Tool Definitions 是 OpenCode 平台在**會話初始化時**，由系統**自動注入**到 AI 的上下文（Context）中
- AI 可以透過**系統提示（System Prompt）**取得這些工具定義的完整內容
- AI 可以**直接使用**這些定義來執行任務

This skill explains how to obtain tool definitions (Tool Definitions) in the OpenCode platform.

**Core Points**:
- Tool Definitions are automatically injected into the AI's context during **session initialization** by the OpenCode platform
- AI can obtain the complete content of these tool definitions through the **System Prompt**
- AI can directly use these definitions to perform tasks

---

## 什麼是 Tool Definitions

### 定義說明

Tool Definitions 是 OpenCode 平台中每個工具的結構化元數據（Metadata），包含：

| 元數據項目 | 說明 |
|-----------|------|
| 工具名稱（Function Name） | 工具的唯一識別符 |
| 參數定義（Parameters Schema） | 工具接受的輸入參數結構與類型 |
| 描述說明（Description） | 工具功能的文字描述 |

### 範例結構

```typescript
type tool_name = (_: {
    // 工具描述
    param1: string,    // 必填參數
    param2?: number,   // 可選參數
}) => any;
```

---

## 如何取得 Tool Definitions

### 取得流程

```
會話初始化
    │
    ▼
OpenCode 平台載入工具配置
    │
    ▼
系統將 Tool Definitions 注入到 System Prompt
    │
    ▼
AI 在上下文（Context）中取得工具定義
```

### 關鍵：System Prompt

Tool Definitions 是作為 **System Prompt（系統提示）** 的一部分提供給 AI。當 OpenCode 會話開始時，系統會自動將所有已配置的工具定義注入到 AI 可以讀取的上下文中。

### AI 如何查看定義

AI 可以透過以下方式取得工具定義的內容：

1. **直接調用工具**：AI 知道工具名稱和參數要求，可以直接調用
2. **格式化輸出**：AI 可以將已取得的定義格式化輸出給用戶

```typescript
// 當需要輸出工具定義時，AI 可以格式化為：
type webstorm_open_file_in_editor = (_: {
    // Opens the specified file in the JetBrains IDE editor.
    // Requires a filePath parameter containing the path to the file to open.
    // The file path can be absolute or relative to the project root.
    filePath: string,
    projectPath?: string,
}) => any;
```

---

## 核心概念

### AI 與 Tool Definitions 的關係

```
┌─────────────────────────────────────────────────────────┐
│                    OpenCode 會話                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              System Prompt（系統提示）            │   │
│  │                                                 │   │
│  │   ## Tools                                     │   │
│  │   ## Available Tools                           │   │
│  │   type webstorm_open_file_in_editor = ...      │   │
│  │   type webstorm_read_file = ...                │   │
│  │   ...                                          │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                              │
│                         ▼                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │              AI（人工智能）                       │   │
│  │                                                 │   │
│  │   ✅ 可以從 System Prompt 取得工具定義            │   │
│  │   ✅ 可以直接使用這些定義來執行任務                │   │
│  │   ✅ 可以將定義格式化輸出給用戶                   │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 定義取得狀態

| 行為 | 狀態 | 說明 |
|------|------|------|
| 從 System Prompt 取得定義 | ✅ 可行 | 定義在系統提示中，AI 可以讀取 |
| AI 使用定義執行任務 | ✅ 可行 | AI 可以直接調用工具 |
| AI 展示完整定義給用戶 | ✅ 可行 | AI 可以將定義格式化輸出 |

---

## 實際應用

### 應用場景

當需要使用工具時，AI 無需「取得」定義，而是直接使用：

```
任務：開啟檔案
    │
    ▼
AI 從上下文中知道 webstorm_open_file_in_editor 工具
    │
    ▼
直接調用工具：webstorm_open_file_in_editor({ filePath: "..." })
```

當需要展示工具定義時，AI 可以格式化輸出：

```typescript
// AI 從上下文中取得的原始定義可能類似：
/**
 * Opens the specified file in the JetBrains IDE editor.
 * Requires a filePath parameter containing the path to the file to open.
 * The file path can be absolute or relative to the project root.
 */
type webstorm_open_file_in_editor = (_: {
    filePath: string,
    projectPath?: string,
}) => any;
```

---

## 常見工具前綴

OpenCode 平台中常見的工具前綴：

| 前綴 | 應用場景 |
|------|---------|
| `webstorm_` / `webstorm-stream_` | WebStorm IDE 整合 |
| `chrome-devtools_` | Chrome 開發工具 |
| `pencil_` | Pencil 設計工具 |
| `arise_` | Arise 代理框架 |
| `context7_` | Context7 文檔查詢 |

---

## 重要說明

### 給 AI 的指示

1. **Tool Definitions 已在上下文中**：AI 可以直接使用，無需額外「取得」
2. **定義來源是 System Prompt**：工具定義是會話初始化時由系統注入的
3. **可以格式化輸出**：如需展示定義，可以將其格式化為可讀的形式

### 取得定義的方法

當其他 AI 代理詢問如何取得 Tool Definitions 時，請告知：

> Tool Definitions 是 OpenCode 平台在會話初始化時，由 System Prompt 自動注入到 AI 上下文中的。AI 可以直接從上下文中取得這些定義的完整內容，包括工具名稱、參數類型和描述說明。

---

## 正確的理解方式

```
❌ 錯誤理解：
「我要怎麼取得 Tool Definitions？」
→ 不需要「取得」，定義已經在上下文中

✅ 正確理解：
「Tool Definitions 已經在 System Prompt 中了，
 我可以直接使用它們，也可以將它們格式化輸出給用戶」
```

---

## 相關資源

- [OpenCode 官方網站](https://opencode.ai/)
- [WebStorm MCP Skill](../webstorm-mcp/SKILL.md)
- [JetBrains MCP 伺服器](https://github.com/modelcontextprotocol/server-jetbrains)

---
