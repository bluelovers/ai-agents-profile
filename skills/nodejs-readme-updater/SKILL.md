---
name: nodejs-readme-updater
description: Update Node.js module README.md with installation commands and package.json description. Use when users request (1) Update README installation section, (2) Add missing install commands, (3) Update package.json description, (4) "更新 README 安裝指令", (5) "補齊安裝指令", (6) "更新模組描述", (7) Node.js module documentation update.
---

# Node.js README Updater

Update Node.js module README.md with complete installation commands and synchronize package.json description.

## Workflow

1. **Read package.json** - Get module name and description
2. **Read README.md** - Analyze existing content
3. **Check installation commands** - Detect and complete missing install commands
4. **Check description** - Update if empty in both README and package.json
5. **Apply updates** - Modify files after analysis

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
## Install

```bash
yarn add <%= name %>

yarn-tool add <%= name %>
yt add <%= name %>

pnpm add <%= name %>

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

## File Modification

### README.md Updates

1. **Installation section** - Add after description/intro, before usage
2. **Description paragraph** - Update first paragraph after title if empty

### package.json Updates

1. **description field** - Add or update with generated description
2. **Preserve formatting** - Maintain existing JSON structure

## Critical Constraints

- **Preserve existing content** - Only add missing parts
- **Consistent formatting** - Match existing README style
- **Traditional Chinese** - Use Taiwan terminology
- **Package name accuracy** - Use exact name from package.json
- **No duplicate commands** - Check before adding

## Example Workflow

```
User: Update README for this module

1. Read package.json → name: "@yarn-tool/ncu-ws", description: ""
2. Read README.md → Has yarn install, missing others
3. Detect installation → Found: yarn add @yarn-tool/ncu-ws
4. Complete commands → Add npm, pnpm, yarn-tool, yt
5. Check description → Both empty
6. Analyze module → Dependencies: npm-check-updates, yarnlock
7. Generate description → "Workspaces 環境下的 npm-check-updates 整合工具"
8. Update files → README + package.json
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

## Files Modified
- README.md
- package.json
```
