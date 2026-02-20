---
name: nodejs-readme-updater
description: Update Node.js module README.md with installation commands and package.json description/keywords. Use when users request (1) Update README installation section, (2) Add missing install commands, (3) Update package.json description, (4) Update package.json keywords, (5) "更新 README 安裝指令", (6) "補齊安裝指令", (7) "更新模組描述", (8) "補齊關鍵字", (9) Node.js module documentation update.
---

# Node.js README Updater

Update Node.js module README.md with complete installation commands and synchronize package.json description and keywords.

## Workflow

1. **Read package.json** - Get module name, description, and keywords
2. **Read README.md** - Analyze existing content
3. **Check installation commands** - Detect and complete missing install commands
4. **Check description** - Update if empty in both README and package.json
5. **Check keywords** - Analyze and suggest missing keywords
6. **Apply updates** - Modify files after analysis

## Installation Commands Detection

### Package Managers to Check

| Manager | Command Pattern | Alias |
|---------|----------------|-------|
| npm | `npm install <name>` | - |
| yarn | `yarn add <name>` | - |
| yarn-tool | `yarn-tool add <name>` | - |
| yt | `yt add <name>` | yarn-tool alias |
| pnpm | `pnpm add <name>` | - |

### Detection Logic

Scan README for installation section patterns:
- `## Install`, `## Installation`, `## 安裝`
- Code blocks with install commands
- Any existing package manager commands

### Completion Template

When any install command is found, ensure ALL are present:

```markdown
## 安裝 (Installation)

```bash
# 使用 yarn / Using yarn
yarn add <%= name %>

# 使用 yarn-tool / Using yarn-tool
yarn-tool add <%= name %>
# yt 是 yarn-tool 的別名 / yt is an alias for yarn-tool
yt add <%= name %>

# 使用 pnpm / Using pnpm
pnpm add <%= name %>

# 使用 npm / Using npm
npm install <%= name %>
```
```

### Completion Rules

1. **If ANY install command exists** → Add missing ones
2. **If NO install section exists** → Create complete section
3. **Preserve existing order** → Add missing commands at appropriate position
4. **Use package.json name** → Replace `<%= name %>` with actual package name

## Description Update

### Conditions to Update

Update description when BOTH conditions are met:
1. README has no short description (first paragraph after title is empty or missing)
2. `package.json` has empty or missing `description` field

### Analysis Sources

Generate appropriate description from:
1. **package.json keywords** - Infer purpose from keywords
2. **Main export file** - Read `index.ts`/`index.js` for module purpose
3. **Directory structure** - `lib/`, `src/` contents indicate functionality
4. **Existing README content** - Extract from longer descriptions if present
5. **Dependencies** - Related packages suggest functionality

### Description Format

- **Language**: Traditional Chinese with English terms in parentheses
- **Length**: 1-2 sentences, under 100 characters
- **Style**: Clear, concise, describe main functionality

Example:
```
用於解析和處理 semver 版本字串的工具庫 (Utility for parsing and processing semver version strings)
```

## Keywords Analysis

### Conditions to Update

Update keywords when:
1. `package.json` has empty or missing `keywords` field
2. `package.json` has minimal keywords (< 15) that don't adequately describe the module

### Analysis Sources

Generate appropriate keywords from:

1. **Package name** - Extract meaningful parts from scoped/name
   - `@yarn-tool/ncu-ws` → `yarn-tool`, `ncu`, `workspaces`
   - `semver-parse` → `semver`, `parse`, `version`

2. **Dependencies** - Related packages indicate category
   - `npm-check-updates` → `npm`, `update`, `dependencies`
   - `yarnlock` → `yarn`, `lockfile`

3. **Main export file** - Function/class names suggest purpose
   - Export `parseSemVer` → `parse`, `parser`
   - Export `detectVersion` → `detect`, `version`

4. **Directory structure** - Folder names indicate features
   - `lib/parse/` → `parse`
   - `lib/utils/` → `utils`, `utility`

5. **README content** - Extract from description and features

### Common Keyword Categories

| Category | Example Keywords |
|----------|-----------------|
| Package Manager | `npm`, `yarn`, `pnpm`, `yarn-tool` |
| Workspace | `workspaces`, `monorepo`, `lerna` |
| Version Management | `semver`, `version`, `release` |
| File Operations | `parse`, `read`, `write`, `transform` |
| Development | `cli`, `tool`, `util`, `helper` |
| Lock File | `yarnlock`, `lockfile`, `yarn-lock` |

### Keyword Generation Rules

1. **Extract from package name** - Split by `/` and `-`
2. **Add category keywords** - Based on module purpose
3. **Include dependency-related** - Main dependencies as keywords
4. **Keep concise** - 15-20 keywords optimal
5. **Avoid duplicates** - Check existing keywords
6. **Lowercase only** - All keywords in lowercase
7. **New keywords first** - Place newly added keywords at the beginning of the array
8. **Sort by relevance** - Order new keywords by their relevance to the module (highest relevance first)
9. **Preserve existing order** - Do not change the order of existing keywords, append them after new keywords

### Keyword Relevance Priority

When adding new keywords, sort by relevance in this order:

| Priority | Source | Example |
|----------|--------|---------|
| 1 (Highest) | Package name core | `yarn-tool` from `@yarn-tool/ncu-ws` |
| 2 | Main functionality | `workspaces`, `ncu` from module purpose |
| 3 | Key dependencies | `npm-check-updates`, `yarnlock` |
| 4 | Category keywords | `npm`, `yarn`, `monorepo` |
| 5 (Lowest) | Generic terms | `package`, `tool`, `util` |

### Keyword Ordering Example

```
Existing keywords: ["old-keyword-1", "old-keyword-2"]
New keywords (sorted by relevance): ["yarn-tool", "ncu", "workspaces", "npm-check-updates"]

Final result:
[
  "yarn-tool",      // New - highest relevance (package name core)
  "ncu",            // New - high relevance (main functionality)
  "workspaces",     // New - high relevance (main functionality)
  "npm-check-updates", // New - medium relevance (key dependency)
  "old-keyword-1",  // Existing - preserved order
  "old-keyword-2"   // Existing - preserved order
]
```

### Example Keywords Generation

```
Package: @yarn-tool/ncu-ws
Dependencies: npm-check-updates, yarnlock, fs-extra
Existing keywords: []

New keywords (sorted by relevance):
[
  "yarn-tool",        // Package name core
  "ncu",              // Main functionality
  "workspaces",       // Main functionality (ws = workspaces)
  "npm-check-updates", // Key dependency
  "yarn",             // Category keyword
  "npm",              // Category keyword
  "monorepo",         // Category keyword
  "dependencies",     // Generic term
  "update",           // Generic term
  "yarnlock",         // Related dependency
  "package"           // Generic term
]
```

If existing keywords were present:
```
Existing keywords: ["cli", "helper"]

Final keywords array:
[
  "yarn-tool",        // New - highest relevance
  "ncu",              // New - high relevance
  "workspaces",       // New - high relevance
  "npm-check-updates", // New - medium relevance
  "yarn",             // New - category
  "npm",              // New - category
  "monorepo",         // New - category
  "cli",              // Existing - preserved
  "helper"            // Existing - preserved
]
```

## File Modification

### README.md Updates

1. **Installation section** - Add after description/intro, before usage
2. **Description paragraph** - Update first paragraph after title if empty

### package.json Updates

1. **description field** - Add or update with generated description
2. **keywords field** - Add or update with generated keywords
3. **Preserve formatting** - Maintain existing JSON structure

## Critical Constraints

- **Preserve existing content** - Only add missing parts
- **Consistent formatting** - Match existing README style
- **Traditional Chinese** - Use Taiwan terminology
- **Package name accuracy** - Use exact name from package.json
- **No duplicate commands** - Check before adding

## Example Workflow

```
User: Update README for this module

1. Read package.json → name: "@yarn-tool/ncu-ws", description: "", keywords: []
2. Read README.md → Has yarn install, missing others
3. Detect installation → Found: yarn add @yarn-tool/ncu-ws
4. Complete commands → Add npm, pnpm, yarn-tool, yt
5. Check description → Both empty
6. Analyze module → Dependencies: npm-check-updates, yarnlock
7. Generate description → "Workspaces 環境下的 npm-check-updates 整合工具"
8. Check keywords → Empty or minimal
9. Generate keywords → ["yarn", "yarn-tool", "npm", "ncu", "workspaces", ...]
10. Update files → README + package.json
```

## Output Format

Report changes made:

```markdown
# README Update Report

## Installation Commands
- ✓ yarn add - already exists
- + yarn-tool add - added
- + yt add - added
- + pnpm add - added
- + npm install - added

## Description
- package.json: Updated with "工具描述..."
- README.md: No change (description exists)

## Keywords
- package.json: Added 10 keywords
- Added: yarn, yarn-tool, npm, ncu, workspaces, monorepo, dependencies, update, yarnlock, package

## Files Modified
- README.md
- package.json
```
