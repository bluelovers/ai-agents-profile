---
name: readme-updater
description: 分析 monorepo 或一般專案，檢查並更新 README 說明文件，支援參照 docs 目錄與子 packages 的 README 檢查。
---

# README Updater Skill

此技能用於分析專案結構（包括 monorepo），檢查現有 README 文件的完整性與準確性，並提供更新建議或直接更新 README 內容。

## 使用指南

當使用者要求更新或檢查 README 時，請遵循以下步驟：

### 1. 專案結構分析

首先判斷專案類型：

- **檢查是否為 monorepo**：
  - 查看根目錄是否有 `packages/`、`apps/` 等目錄
  - 檢查 `package.json` 是否有 `workspaces` 欄位
  - 檢查是否有 `lerna.json`、`pnpm-workspace.yaml` 等 monorepo 標誌

- **識別專案類型**：
  - Node.js (package.json)
  - Python (setup.py, pyproject.toml, requirements.txt)
  - 其他語言或框架

### 2. 收集專案資訊

從以下來源收集資訊：

#### 根目錄資訊
- `package.json` / `pyproject.toml` 等配置檔案 (configuration files)
  - 專案名稱、描述
- `docs/` 目錄下的文件
  - 架構說明 (architecture)
  - API 文件
  - 使用指南 (usage guide)
  - 配置說明 (configuration)

#### 程式碼結構
- 主要目錄結構
- 核心模組與功能
- 入口檔案 (entry point)
- 配置檔案

#### Monorepo 子 Packages（如適用）
- 列出所有子 packages
- 每個 package 的：
  - 名稱與用途
  - 依賴關係 (dependencies)
  - README 狀態

### 3. 分析現有 README

檢查現有 README 是否包含以下標準章節 (standard sections)：

#### 必要章節 (Required Sections)
- [ ] **專案標題與簡介**
  - 清晰的專案名稱
  - 一句話描述專案用途
  - 專案徽章 (badges)：版本、CI 狀態、授權等

- [ ] **功能特色** (Features)
  - 列出主要功能
  - 突出優勢與特點

- [ ] **安裝說明** (Installation)
  - 系統需求 (requirements)
  - 安裝步驟
  - 依賴項目

- [ ] **使用方法** (Usage)
  - 基本使用範例
  - 常見用例 (common use cases)
  - 程式碼範例

- [ ] **API 文件** (API Documentation)
  - 主要 API 說明
  - 或連結到詳細文件

- [ ] **配置說明** (Configuration)
  - 配置選項 (options)
  - 環境變數 (environment variables)
  - 配置檔案範例

#### 建議章節 (Recommended Sections)
- [ ] **開發指南** (Development)
  - 開發環境設置
  - 建置指令 (build commands)
  - 測試指令 (test commands)
  
- [ ] **貢獻指南** (Contributing)
  - 如何貢獻
  - 程式碼規範 (code standards)
  - PR 流程 (pull request workflow)

- [ ] **授權資訊** (License)

- [ ] **更新日誌** (Changelog)
  - 或連結到 CHANGELOG.md

- [ ] **常見問題** (FAQ)

- [ ] **相關資源** (Related Resources)
  - 相關專案
  - 參考文件

### 4. Monorepo 特殊處理

如果是 monorepo：

1. **根目錄 README (Root README)**：
   - 說明整體專案架構 (project architecture)
   - 列出所有子 packages 及其用途
   - 提供 monorepo 的開發指南
   - 說明 packages 之間的依賴關係

2. **檢查每個子 package**：
   ```
   packages/
   ├── package-a/
   │   └── README.md  ← 檢查此檔案 (check this file)
   ├── package-b/
   │   └── README.md  ← 檢查此檔案 (check this file)
   └── package-c/
       └── README.md  ← 檢查此檔案 (check this file)
   ```

3. **子 package README 應包含**：
   - Package 名稱與用途
   - 安裝方式（從 monorepo 或獨立安裝）
   - 使用範例
   - API 文件（或連結）
   - 與其他 packages 的關係

### 5. 參照 docs 目錄

如果專案有 `docs/` 目錄：

1. **掃描 docs 內容**：
   - 列出所有文件
   - 識別文件主題 (topics)

2. **README 與 docs 的關係**：
   - README 應該包含**概覽與快速開始** (overview & quick start)
   - 詳細內容應連結到 `docs/` 中的對應文件
   - 避免重複內容

3. **在 README 中添加文件連結**：
   ```markdown
   ## 文件 (Documentation)

   - [架構說明](./docs/architecture.md)
   - [API 文件](./docs/api.md)
   - [配置指南](./docs/configuration.md)
   - [開發指南](./docs/development.md)
   ```

### 6. 生成更新建議

分析完成後，提供：

1. **缺失章節清單** (missing sections)
2. **過時內容提醒** (outdated content)
3. **改進建議** (improvement suggestions)
4. **範例內容**（如需要）

### 7. 執行更新

根據使用者確認，執行以下操作：

- 使用 `replace_file_content` 或 `multi_replace_file_content` 更新 README
- 保持現有格式風格
- 使用繁體中文（台灣用語）撰寫說明
- 程式碼範例使用原始語言，但註解使用雙語（繁體中文與英文）

## 工作流程範例

```
使用者：更新 README

1. 分析專案結構 (analyze project structure)
   → 發現是 monorepo (有 packages/ 目錄)
   
2. 收集資訊 (collect information)
   → 讀取 package.json
   → 掃描 docs/ 目錄
   → 列出 packages/*/package.json
   
3. 分析根目錄 README (analyze root README)
   → 缺少「專案架構」章節
   → 缺少子 packages 列表
   → 安裝說明過時
   
4. 檢查子 packages (check sub-packages)
   → packages/core/README.md - 完整 ✓
   → packages/utils/README.md - 缺少使用範例 ✗
   → packages/cli/README.md - 不存在 ✗
   
5. 提供更新建議 (provide suggestions)
   → 列出需要補充的內容
   → 提供範例文字
   
6. 執行更新 (execute updates) - 經使用者確認
   → 更新根目錄 README
   → 為 packages/utils 添加範例
   → 為 packages/cli 建立 README
```

## 注意事項

- **保持一致性 (consistency)**：所有 README 應使用相同的格式風格
- **繁體中文優先**：說明文字使用繁體中文（台灣用語），但重點名詞、特殊名詞或可能產生歧義的用語應標註英文對照
- **程式碼範例 (code examples)**：保持原始語言，但註解使用雙語（繁體中文與英文）
- **連結有效性 (link validity)**：確保所有內部連結指向正確的檔案
- **版本資訊 (version info)**：確保版本號與 package.json 一致
- **徽章更新 (badge updates)**：如有使用徽章 (badges)，確保 URL 正確
- **避免重複 (avoid duplication)**：README 與 docs 之間避免內容重複，使用連結引用

## 輸出格式

分析報告應包含：

```markdown
# README 分析報告

## 專案類型
- [x] Monorepo
- [ ] 單一專案

## 根目錄 README 狀態

### ✓ 已完成
- 專案標題與簡介
- 功能特色

### ✗ 缺失或需更新
- 安裝說明（版本過時）
- 子 packages 列表（缺失）
- 開發指南（缺失）

## 子 Packages 狀態

| Package | README 存在 | 完整度 | 問題 |
|---------|------------|--------|------|
| @scope/core | ✓ | 90% | 缺少配置說明 |
| @scope/utils | ✓ | 60% | 缺少使用範例 |
| @scope/cli | ✗ | 0% | README 不存在 |

## docs 目錄

- `docs/architecture.md` - 架構說明
- `docs/api.md` - API 文件
- `docs/development.md` - 開發指南

建議在 README 中添加文件索引章節。

## 建議更新內容

### 1. 根目錄 README

#### 添加「專案架構」章節
\`\`\`markdown
## 專案架構 (Project Architecture)

本專案採用 monorepo 架構，包含以下 packages：
<!-- This project uses monorepo architecture, containing the following packages: -->

- **@scope/core** - 核心功能模組 (Core functionality module)
- **@scope/utils** - 工具函式庫 (Utility library)
- **@scope/cli** - 命令列工具 (Command-line tool)
\`\`\`

...（其他建議）
```

## 使用範例

```
使用者：幫我檢查並更新這個專案的 README

助手：
1. [分析專案結構]
2. [收集資訊]
3. [生成分析報告]
4. [提供更新建議]
5. [詢問使用者是否執行更新]
```
