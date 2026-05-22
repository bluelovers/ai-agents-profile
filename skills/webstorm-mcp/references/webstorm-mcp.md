---
tags:
  - webstorm
  - mcp
  - protocol
  - commands
  - jetbrains
---

# WebStorm MCP (Model Context Protocol) 文檔

## 協議概述

| 項目 | 說明 |
|------|------|
| 協議名稱 | MCP (Model Context Protocol) |
| 服務類型 | WebStorm JetBrains IDE |
| 協議前綴 | `webstorm_` / `webstorm-stream_` |

---

## 協議配置與 MCP 設定

MCP 協議配置的詳細說明，包括設定檔位置、協議類型與網址、SSE vs Streamable HTTP 比較等，請參閱 [WebStorm MCP 配置說明](./webstorm-mcp-config.md)。

---

## MCP 指令列表

### 檔案操作 (6 個)

#### webstorm_open_file_in_editor
在編輯器中開啟檔案，可指定專案路徑。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `filePath` | string | 是 | 檔案路徑（相對於專案根目錄） |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_open_file_in_editor = (_: {
    // Opens the specified file in the JetBrains IDE editor.
    // Requires a filePath parameter containing the path to the file to open.
    // The file path can be absolute or relative to the project root.
    filePath: string,
    projectPath?: string,
}) => any;
```

#### webstorm_create_new_file
建立新檔案，可指定檔案內容、是否覆寫已存在的檔案，以及專案路徑。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `pathInProject` | string | 是 | 檔案路徑（相對於專案根目錄） |
| `text` | string | 否 | 檔案內容 |
| `overwrite` | boolean | 否 | 是否覆寫已存在的檔案 |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_create_new_file = (_: {
    // Creates a new file at the specified path within the project directory and optionally populates it with text if provided.
    // Note: Creates any necessary parent directories automatically.
    pathInProject: string,
    text?: string,
    overwrite?: boolean,
    projectPath?: string,
}) => any;
```

#### webstorm_read_file
讀取檔案內容，支援多種讀取模式（如按行、按欄位、按偏移量等），可指定讀取範圍（起始行/欄位、結束行/欄位、最大行數等），適用於需要精確讀取檔案特定部分的場景。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `file_path` | string | 是 | 檔案路徑（相對於專案根目錄） |
| `mode` | string | 否 | 讀取模式：`slice` / `lines` / `line_columns` / `offsets` / `indentation` |
| `start_line` | number | 否 | 起始行號（1-indexed） |
| `max_lines` | number | 否 | 最大行數 |
| `end_line` | number | 否 | 結束行號 |
| `start_column` | number | 否 | 起始欄位 |
| `end_column` | number | 否 | 結束欄位 |
| `start_offset` | number | 否 | 起始偏移量（0-indexed） |
| `end_offset` | number | 否 | 結束偏移量 |
| `context_lines` | number | 否 | 上下文行數 |
| `max_levels` | number | 否 | 最大縮排層級 |
| `include_siblings` | boolean | 否 | 包含同層級節點 |
| `include_header` | boolean | 否 | 包含標頭註解 |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_read_file = (_: {
    // Reads a local file and returns numbered lines (1-indexed) as text.
    // Modes: slice, lines, line_columns, offsets, or indentation.
    // Slice uses start_line and max_lines. Lines uses start_line/end_line (inclusive).
    // Line_columns uses start_line/start_column and end_line/end_column (end is exclusive; end_line defaults to start_line).
    // Offsets uses start_offset/end_offset (end is exclusive). Indentation uses start_line with max_levels/include_*.
    // max_lines caps the total output in all modes; context_lines applies to range modes (per side).
    file_path: string,
    mode?: string,
    start_line?: number,
    max_lines?: number,
    end_line?: number,
    start_column?: number,
    end_column?: number,
    start_offset?: number,
    end_offset?: number,
    context_lines?: number,
    max_levels?: number,
    include_siblings?: boolean,
    include_header?: boolean,
    projectPath?: string,
}) => any;
```

#### webstorm_get_file_text_by_path
取得檔案文字內容，支援截斷模式（如從開始、中間、結束截斷），可指定最大行數，適用於需要快速預覽大型檔案的場景。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `pathInProject` | string | 是 | 檔案路徑（相對於專案根目錄） |
| `truncateMode` | string | 否 | 截斷模式：`START` / `MIDDLE` / `END` / `NONE` |
| `maxLinesCount` | number | 否 | 最大行數 |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_get_file_text_by_path = (_: {
    // Retrieves the text content of a file using its path relative to project root.
    // Use this tool to read file contents when you have the file's project-relative path.
    // In the case of binary files, the tool returns an error.
    // If the file is too large, the text will be truncated with '<<<...content truncated...>>>' marker and in according to the `truncateMode` parameter.
    pathInProject: string,
    truncateMode?: "START" | "MIDDLE" | "END" | "NONE",
    maxLinesCount?: number,
    projectPath?: string,
}) => any;
```

#### webstorm_replace_text_in_file
替換檔案中的文字，支援全部替換、區分大小寫、正規表達式等選項，適用於批次修改檔案內容的場景。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `pathInProject` | string | 是 | 檔案路徑（相對於專案根目錄） |
| `oldText` | string | 是 | 要替換的文字 |
| `newText` | string | 是 | 替換後的文字 |
| `replaceAll` | boolean | 否 | 是否替換所有匹配項（預設：true） |
| `caseSensitive` | boolean | 否 | 是否區分大小寫（預設：true） |
| `regex` | boolean | 否 | 是否使用正規表達式（預設：false） |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_replace_text_in_file = (_: {
    // Replaces text in a file with flexible options for find and replace operations.
    // Use this tool to make targeted changes without replacing the entire file content.
    // This is the most efficient tool for file modifications when you know the exact text to replace.
    // Requires three parameters:
    // - pathInProject: The path to the target file, relative to project root
    // - oldTextOrPatte: The text to be replaced (exact match by default)
    // - newText: The replacement text
    // Optional parameters:
    // - replaceAll: Whether to replace all occurrences (default: true)
    // - caseSensitive: Whether the search is case-sensitive (default: true)
    // - regex: Whether to treat oldText as a regular expression (default: false)
    // Returns one of these responses:
    // - "ok" when replacement happened
    // - error "project dir not found" if project directory cannot be determined
    // - error "file not found" if the file doesn't exist
    // - error "could not get document" if the file content cannot be accessed
    // - error "no occurrences found" if the old text was not found in the file
    // Note: Automatically saves the file after modification
    pathInProject: string,
    oldText: string,
    newText: string,
    replaceAll?: boolean,
    caseSensitive?: boolean,
    regex?: boolean,
    projectPath?: string,
}) => any;
```

#### webstorm_reformat_file
格式化檔案，使用 WebStorm 內建的格式化工具，適用於統一程式碼風格的場景。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `path` | string | 是 | 檔案路徑（相對於專案根目錄） |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_reformat_file = (_: {
    // Reformats a specified file in the JetBrains IDE.
    // Use this tool to apply code formatting rules to a file identified by its path.
    path: string,
    projectPath?: string,
}) => any;
```

---

### 檔案搜尋 (7 個)

#### webstorm_search_file
使用 glob 模式搜尋檔案，支援路徑過濾、包含排除的檔案、結果數量限制等選項，適用於快速尋找符合特定模式的檔案。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `q` | string | 是 | Glob 模式（如 `*.ts`） |
| `paths` | string[] | 否 | 額外的路徑過濾 |
| `includeExcluded` | boolean | 否 | 包含排除的檔案 |
| `limit` | number | 否 | 結果數量限制 |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_search_file = (_: {
    // Searches for files by glob pattern within the project.
    // Use this tool when you need to match file paths using glob syntax.
    // Glob patterns are relative to the project root.
    // Examples: "**/*.kt", "src/**/Foo*.java", "build.gradle.kts".
    // Patterns without '/' are treated as "**/pattern".
    // Paths are optional additional glob filters relative to the project root.
    q: string,
    paths?: string[],
    includeExcluded?: boolean,
    limit?: number,
    projectPath?: string,
}) => any;
```

#### webstorm_find_files_by_glob
按 glob 模式查找檔案，支援子目錄路徑、包含排除的檔案、結果數量限制、逾時時間等選項，適用於精確查找符合特定模式的檔案。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `globPattern` | string | 是 | Glob 模式 |
| `subDirectoryRelativePath` | string | 否 | 子目錄路徑 |
| `addExcluded` | boolean | 否 | 包含排除的檔案 |
| `fileCountLimit` | number | 否 | 結果數量限制 |
| `timeout` | number | 否 | 逾時時間（毫秒） |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_find_files_by_glob = (_: {
    // Searches for all files in the project whose relative paths match the specified glob pattern.
    // The search is performed recursively in all subdirectories of the project directory or a specified subdirectory.
    // Use this tool when you need to find files by a glob pattern (e.g. '**/*.txt').
    globPattern: string,
    subDirectoryRelativePath?: string,
    addExcluded?: boolean,
    fileCountLimit?: number,
    timeout?: number,
    projectPath?: string,
}) => any;
```

#### webstorm_find_files_by_name_keyword
按檔名關鍵字查找，支援結果數量限制、逾時時間等選項，適用於根據檔名關鍵字快速尋找檔案。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `nameKeyword` | string | 是 | 檔名關鍵字 |
| `fileCountLimit` | number | 否 | 結果數量限制 |
| `timeout` | number | 否 | 逾時時間（毫秒） |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_find_files_by_name_keyword = (_: {
    // Searches for all files in the project whose names contain the specified keyword (case-insensitive).
    // Use this tool to locate files when you know part of the filename.
    // Note: Matched only names, not paths, because works via indexes.
    // Note: Only searches through files within the project directory, excluding libraries and external dependencies.
    // Note: Prefer this tool over other `find` tools because it's much faster,
    // but remember that this tool searches only names, not paths and it doesn't support glob patterns.
    nameKeyword: string,
    fileCountLimit?: number,
    timeout?: number,
    projectPath?: string,
}) => any;
```

#### webstorm_search_in_files_by_text
在檔案中搜尋文字，支援搜尋目錄、檔案遮罩、區分大小寫、最大結果數、逾時時間等選項，適用於在多個檔案中搜尋特定文字。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `searchText` | string | 是 | 搜尋文字 |
| `directoryToSearch` | string | 否 | 搜尋目錄 |
| `fileMask` | string | 否 | 檔案遮罩（如 `*.ts`） |
| `caseSensitive` | boolean | 否 | 是否區分大小寫 |
| `maxUsageCount` | number | 否 | 最大結果數 |
| `timeout` | number | 否 | 逾時時間（毫秒） |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_search_in_files_by_text = (_: {
    // Searches for a text substring within all files in the project using IntelliJ's search engine.
    // Prefer this tool over reading files with command-line tools because it's much faster.
    // The result occurrences are surrounded with `||` characters, e.g. `some text ||substring|| text`
    searchText: string,
    directoryToSearch?: string,
    fileMask?: string,
    caseSensitive?: boolean,
    maxUsageCount?: number,
    timeout?: number,
    projectPath?: string,
}) => any;
```

#### webstorm_search_in_files_by_regex
在檔案中搜尋正規表達式，支援搜尋目錄、檔案遮罩、區分大小寫、最大結果數、逾時時間等選項，適用於在多個檔案中使用正規表達式搜尋。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `regexPattern` | string | 是 | 正規表達式 |
| `directoryToSearch` | string | 否 | 搜尋目錄 |
| `fileMask` | string | 否 | 檔案遮罩 |
| `caseSensitive` | boolean | 否 | 是否區分大小寫 |
| `maxUsageCount` | number | 否 | 最大結果數 |
| `timeout` | number | 否 | 逾時時間（毫秒） |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_search_in_files_by_regex = (_: {
    // Searches with a regex pattern within all files in the project using IntelliJ's search engine.
    // Prefer this tool over reading files with command-line tools because it's much faster.
    // The result occurrences are surrounded with || characters, e.g. `some text ||substring|| text`
    regexPattern: string,
    directoryToSearch?: string,
    fileMask?: string,
    caseSensitive?: boolean,
    maxUsageCount?: number,
    timeout?: number,
    projectPath?: string,
}) => any;
```

#### webstorm_search_text
文字搜尋，返回搜尋結果含代碼片段，支援路徑過濾、結果數量限制等選項，適用於需要查看搜尋結果上下文的場景。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `q` | string | 是 | 搜尋文字 |
| `paths` | string[] | 否 | 路徑過濾 |
| `limit` | number | 否 | 結果數量限制 |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_search_text = (_: {
    // Searches for a text substring within project files.
    // Use this tool for fast text search with snippet results.
    // Results include match coordinates when available (1-based line/column, 0-based offsets).
    // Paths are glob patterns relative to the project root.
    // Examples: ["src/**", "!**/test/**"], ["**/*.kt"], ["foo/"].
    q: string,
    paths?: string[],
    limit?: number,
    projectPath?: string,
}) => any;
```

#### webstorm_search_symbol
搜尋符號（類別、方法、欄位），支援路徑過濾、結果數量限制等選項，適用於尋找特定符號的定義或引用。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `q` | string | 是 | 符號查詢文字 |
| `paths` | string[] | 否 | 路徑過濾 |
| `limit` | number | 否 | 結果數量限制 |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_search_symbol = (_: {
    // Searches for symbols (classes, methods, fields).
    // Use this tool for semantic lookup by identifier fragments.
    // Results include match coordinates when available (1-based line/column, 0-based offsets).
    // Paths are glob patterns relative to the project root.
    q: string,
    paths?: string[],
    limit?: number,
    projectPath?: string,
}) => any;
```

---

### 目錄與專案 (5 個)

#### webstorm_list_directory_tree
列出目錄樹結構，支援最大遞迴深度、逾時時間等選項，適用於快速了解專案目錄結構。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `directoryPath` | string | 是 | 目錄路徑（相對於專案根目錄） |
| `maxDepth` | number | 否 | 最大遞迴深度 |
| `timeout` | number | 否 | 逾時時間（毫秒） |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_list_directory_tree = (_: {
    // Provides a tree representation of the specified directory in the pseudo graphic format like `tree` utility does.
    // Use this tool to explore the contents of a directory or the whole project.
    // You MUST prefer this tool over listing directories via command line utilities like `ls` or `dir`.
    directoryPath: string,
    maxDepth?: number,
    timeout?: number,
    projectPath?: string,
}) => any;
```

#### webstorm_get_all_open_file_paths
取得所有已開啟的檔案路徑，適用於了解目前開啟的檔案清單。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_get_all_open_file_paths = (_: {
    // Returns active editor's and other open editors' file paths relative to the project root.
    // Use this tool to explore current open editors.
    projectPath?: string,
}) => any;
```

#### webstorm_get_project_dependencies
取得專案依賴，適用於了解專案的依賴關係。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_get_project_dependencies = (_: {
    // Get a list of all dependencies defined in the project.
    // Returns structured information about project library names.
    projectPath?: string,
}) => any;
```

#### webstorm_get_project_modules
取得專案模組，適用於了解專案的模組結構。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_get_project_modules = (_: {
    // Get a list of all modules in the project with their types.
    // Returns structured information about each module including name and type.
    projectPath?: string,
}) => any;
```

#### webstorm_get_repositories
取得 VCS 儲存庫清單，適用於了解專案的版本控制狀態。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_get_repositories = (_: {
    // Retrieves the list of VCS roots in the project.
    // This is useful to detect all repositories in a multi-repository project.
    projectPath?: string,
}) => any;
```

---

### 程式碼分析 (3 個)

#### webstorm_get_file_problems
取得檔案問題（錯誤、警告），支援只顯示錯誤、逾時時間等選項，適用於檢查檔案的語法錯誤或警告。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `filePath` | string | 是 | 檔案路徑（相對於專案根目錄） |
| `errorsOnly` | boolean | 否 | 是否只顯示錯誤 |
| `timeout` | number | 否 | 逾時時間（毫秒） |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_get_file_problems = (_: {
    // Analyzes the specified file for errors and warnings using IntelliJ's inspections.
    // Use this tool to identify coding issues, syntax errors, and other problems in a specific file.
    // Returns a list of problems found in the file, including severity, description, and location information.
    // Note: Only analyzes files within the project directory.
    // Note: Lines and Columns are 1-based.
    filePath: string,
    errorsOnly?: boolean,
    timeout?: number,
    projectPath?: string,
}) => any;
```

#### webstorm_get_symbol_info
取得符號資訊，可指定檔案路徑、行號、欄位號，適用於取得特定符號的詳細資訊。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `filePath` | string | 是 | 檔案路徑（相對於專案根目錄） |
| `line` | number | 是 | 行號（1-indexed） |
| `column` | number | 是 | 欄位號（1-indexed） |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_get_symbol_info = (_: {
    // Retrieves information about the symbol at the specified position in the specified file.
    // Provides the same information as Quick Documentation feature of IntelliJ IDEA does.
    // This tool is useful for getting information about the symbol at the specified position in the specified file.
    // The information may include the symbol's name, signature, type, documentation, etc. It depends on a particular language.
    // If the position has a reference to a symbol the tool will return a piece of code with the declaration of the symbol if possible.
    // Use this tool to understand symbols declaration, semantics, where it's declared, etc.
    filePath: string,
    line: number,
    column: number,
    projectPath?: string,
}) => any;
```

#### webstorm_build_project
建置專案，支援完整重建、指定要編譯的檔案列表、逾時時間等選項，適用於編譯專案。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `rebuild` | boolean | 否 | 是否執行完整重建 |
| `filesToRebuild` | string[] | 否 | 要編譯的檔案列表 |
| `timeout` | number | 否 | 逾時時間（毫秒） |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_build_project = (_: {
    // Triggers building of the project or specified files, waits for completion, and returns build errors.
    // Use this tool to build the project or compile files and get detailed information about compilation errors and warnings.
    rebuild?: boolean,
    filesToRebuild?: string[],
    timeout?: number,
    projectPath?: string,
}) => any;
```

---

### 程式碼重構 (1 個)

#### webstorm_rename_refactoring
重新命名重構，可指定檔案路徑、現有符號名稱、新名稱，適用於批次重新命名符號。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `pathInProject` | string | 是 | 檔案路徑（相對於專案根目錄） |
| `symbolName` | string | 是 | 現有符號名稱 |
| `newName` | string | 是 | 新名稱 |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_rename_refactoring = (_: {
    // Renames a symbol (variable, function, class, etc.) in the specified file.
    // Use this tool to perform rename refactoring operations.
    // The `rename_refactoring` tool is a powerful, context-aware utility. Unlike a simple text search-and-replace,
    // it understands the code's structure and will intelligently update ALL references to the specified symbol throughout the project,
    // ensuring code integrity and preventing broken references. It is ALWAYS the preferred method for renaming programmatic symbols.
    // Requires three parameters:
    // - pathInProject: The relative path to the file from the project's root directory (e.g. `src/api/controllers/userController.js`)
    // - symbolName: The exact, case-sensitive name of the existing symbol to be renamed (e.g. `getUserData`)
    // - newName: The new, case-sensitive name for the symbol (e.g. `fetchUserData`).
    // Returns a success message if the rename operation was successful.
    // Returns an error message if the file or symbol cannot be found or the rename operation failed.
    pathInProject: string,
    symbolName: string,
    newName: string,
    projectPath?: string,
}) => any;
```

---

### 執行與終端 (3 個)

#### webstorm_execute_run_configuration
執行執行配置，可指定運行配置名稱、逾時時間、最大行數限制、截斷模式等選項，適用於執行預先定義的運行配置。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `configurationName` | string | 是 | 運行配置名稱 |
| `timeout` | number | 否 | 逾時時間（毫秒） |
| `maxLinesCount` | number | 否 | 最大行數限制 |
| `truncateMode` | string | 否 | 截斷模式：`START` / `MIDDLE` / `END` / `NONE` |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_execute_run_configuration = (_: {
    // Run a specific run configuration in the current project and wait up to specified timeout for it to finish.
    // Use this tool to run a run configuration that you have found from the "get_run_configurations" tool.
    // Returns the execution result including exit code, output, and success status.
    configurationName: string,
    timeout?: number,
    maxLinesCount?: number,
    truncateMode?: "START" | "MIDDLE" | "END" | "NONE",
    projectPath?: string,
}) => any;
```

#### webstorm_get_run_configurations
取得執行配置清單，適用於了解可用的運行配置。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_get_run_configurations = (_: {
    // Returns a list of run configurations for the current project.
    // Run configurations are usually used to define user the way how to run a user application, task or test suite from sources.
    // This tool provides additional info like command line, working directory, and environment variables if they are available.
    // Use this tool to query the list of available run configurations in the current project.
    projectPath?: string,
}) => any;
```

#### webstorm_execute_terminal_command
執行終端機命令，可指定命令、是否在 shell 中執行、是否重用現有終端機視窗、逾時時間、最大行數限制、截斷模式等選項，適用於在 WebStorm 終端機中執行命令。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `command` | string | 是 | 要執行的命令 |
| `executeInShell` | boolean | 否 | 是否在 shell 中執行 |
| `reuseExistingTerminalWindow` | boolean | 否 | 是否重用現有終端機視窗 |
| `timeout` | number | 否 | 逾時時間（毫秒） |
| `maxLinesCount` | number | 否 | 最大行數限制 |
| `truncateMode` | string | 否 | 截斷模式 |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_execute_terminal_command = (_: {
    // Executes a specified shell command in the IDE's integrated terminal.
    // Use this tool to run terminal commands within the IDE environment.
    // Requires a command parameter containing the shell command to execute.
    // Important features and limitations:
    // - Checks if process is running before collecting output
    // - Limits output to 2000 lines (truncates excess)
    // - Times out after specified timeout with notification
    // - Requires user confirmation unless "Brave Mode" is enabled in settings
    // Returns possible responses:
    // - Terminal output (truncated if > 2000 lines)
    // - Output with interruption notice if timed out
    // - Error messages for various failure cases
    command: string,
    executeInShell?: boolean,
    reuseExistingTerminalWindow?: boolean,
    timeout?: number,
    maxLinesCount?: number,
    truncateMode?: string,
    projectPath?: string,
}) => any;
```

---

### 其他 (1 個)

#### webstorm_permission_prompt
權限提示，可指定工具使用 ID、工具名稱、輸入物件等，適用於處理需要使用者授權的操作。

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `tool_use_id` | string | 是 | 工具使用 ID |
| `tool_name` | string | 是 | 工具名稱 |
| `input` | object | 否 | 輸入物件 |
| `projectPath` | string | 否 | 專案路徑 |

```typescript
type webstorm_stream_permission_prompt = (_: {
    // permission_prompt
    tool_use_id: string,
    tool_name: string,
    input?: object,
    projectPath?: string,
}) => any;
```

---

## 指令數量統計

| 類別 | 數量 |
|------|------|
| 檔案操作 | 6 |
| 檔案搜尋 | 7 |
| 目錄與專案 | 5 |
| 程式碼分析 | 3 |
| 程式碼重構 | 1 |
| 執行與終端 | 3 |
| 其他 | 1 |
| **總計** | **24** |

---

## 重要觀察與使用須知

### IDE 必須處於執行狀態

| 狀態 | MCP 指令結果 |
|------|-------------|
| IDE 關閉 | ❌ Unable to connect |
| IDE 開啟中 | ❌ 視專案狀態而定 |

**當 WebStorm IDE 關閉時，MCP 指令將無法執行。**

### 必須開啟專案

WebStorm MCP 需要 IDE **載入專案**才能正常運作。

| 狀態 | MCP 指令結果 |
|------|-------------|
| IDE 開啟但無專案 | ❌ Streamable HTTP session not found |
| IDE 開啟 + 開啟專案 | ✅ 正常運作 |

### 正確的啟動方式

**❌ 錯誤的啟動方式**：
```bash
# 只啟動 WebStorm（不開啟專案）
webstorm
```

**✅ 正確的啟動方式**：
```bash
# 使用 CLI 開啟專案目錄
"C:\Users\User\AppData\Local\JetBrains\Toolbox\scripts\webstorm" "D:\Users\WebstormProjects\nodejs-yarn\ws-ts-type"

# 或開啟特定檔案
"C:\Users\User\AppData\Local\JetBrains\Toolbox\scripts\webstorm" "D:\Users\WebstormProjects\nodejs-yarn\ws-ts-type\packages\ts-type\package.json"
```

#### CLI 參數行為觀察

> 詳細 CLI 指令說明，請參閱 [webstorm-cli.md](./webstorm-cli.md)

**快速連結**：
- [檔案開啟與導航](./webstorm-cli.md#11-檔案開啟與導航) - 包含參數行為觀察
- [合併工具](./webstorm-cli.md#13-合併工具-merge)
- [選項](./webstorm-cli.md#2-選項-options)

### 故障排除

| 錯誤訊息 | 解決方式 |
|----------|----------|
| `Unable to connect` | 確認 WebStorm IDE 正在執行 |
| `Streamable HTTP session not found` | 使用 CLI 重新開啟專案 |

---

## 相關資源

- [JetBrains MCP 伺服器](https://github.com/modelcontextprotocol/server-jetbrains)
- [MCP 官方文檔](https://modelcontextprotocol.io/)
- [OpenCode 官方網站](https://opencode.ai/)

---
