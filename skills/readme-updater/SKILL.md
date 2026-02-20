---
name: readme-updater
description: Analyze monorepo or single projects, check and update README documentation. Use when users request (1) Update README, (2) Check README completeness, (3) "更新 README", (4) "檢查說明文件", (5) Documentation review. Supports docs directory references and sub-package README checks.
---

# README Updater

Analyze project structure, check README completeness, and provide updates.

## Workflow

1. **Analyze project structure** - Determine if monorepo or single project
2. **Collect project info** - Read configs, docs, and code structure
3. **Analyze existing README** - Check against standard sections
4. **Check sub-packages** - For monorepos, verify each package's README
5. **Generate report** - List missing/outdated sections
6. **Apply updates** - After user confirmation

## Project Analysis

### Detect Monorepo

Check for:
- `packages/` or `apps/` directories
- `workspaces` field in package.json
- `lerna.json` or `pnpm-workspace.yaml`

### Collect Information

| Source | Extract |
|--------|---------|
| package.json / pyproject.toml | Name, description, version |
| docs/ directory | Architecture, API docs, guides |
| Code structure | Main directories, core modules, entry points |
| Sub-packages | Names, purposes, dependencies, README status |

## README Standard Sections

### Required

- **Title & Introduction** - Clear name, one-line description, badges
- **Features** - Main functionality, advantages
- **Installation** - Requirements, steps, dependencies
- **Usage** - Basic examples, common use cases
- **API Documentation** - Main APIs or links to docs
- **Configuration** - Options, environment variables, examples

### Recommended

- **Development** - Setup, build/test commands
- **Contributing** - How to contribute, code standards, PR workflow
- **License**
- **Changelog** - Or link to CHANGELOG.md
- **FAQ**
- **Related Resources**

## Monorepo Handling

### Root README

- Explain overall project architecture
- List all sub-packages with purposes
- Provide monorepo development guide
- Describe package dependencies

### Sub-package README

Each should include:
- Package name and purpose
- Installation (from monorepo or standalone)
- Usage examples
- API docs or links
- Relationships with other packages

## docs Directory Integration

If `docs/` exists:

1. README should contain **overview & quick start**
2. Link to detailed docs for in-depth content
3. Avoid duplication

Example documentation section:
```markdown
## Documentation

- [Architecture](./docs/architecture.md)
- [API Reference](./docs/api.md)
- [Configuration Guide](./docs/configuration.md)
```

## Output Format

Generate analysis report:

```markdown
# README Analysis Report

## Project Type
- [x] Monorepo / [ ] Single Project

## Root README Status

### ✓ Complete
- Title & Introduction
- Features

### ✗ Missing or Outdated
- Installation (version outdated)
- Sub-packages list (missing)

## Sub-Packages Status

| Package | README Exists | Completeness | Issues |
|---------|---------------|--------------|--------|
| @scope/core | ✓ | 90% | Missing config section |
| @scope/utils | ✓ | 60% | Missing usage examples |
| @scope/cli | ✗ | 0% | README not found |

## Suggested Updates

### 1. Add Project Architecture Section
[Example content...]

## docs Directory

- `docs/architecture.md` - Architecture overview
- `docs/api.md` - API documentation

Recommend adding documentation index to README.
```

## Critical Constraints

- **Consistency** - All READMEs use same format style
- **Traditional Chinese** - Use Taiwan terminology for descriptions
- **Key terms** - Add English in parentheses for clarity: `快取 (Cache)`
- **Code examples** - Keep original language, add bilingual comments
- **Link validity** - Ensure internal links point to correct files
- **Version info** - Match version numbers with package.json
- **Avoid duplication** - Link to docs instead of repeating content

## Example Workflow

```
User: Update README

1. Analyze structure → Monorepo detected (packages/ exists)
2. Collect info → Read package.json, scan docs/, list packages
3. Analyze root README → Missing architecture section, outdated installation
4. Check sub-packages → core: complete, utils: missing examples, cli: no README
5. Provide suggestions → List needed content with examples
6. Execute updates → After user confirmation
```
