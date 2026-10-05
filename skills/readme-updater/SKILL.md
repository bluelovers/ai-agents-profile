---
name: readme-updater
description: |-
  Analyze monorepo or single projects, check and update README documentation.
  Use when users request
  (1) Update README,
  (2) Check README completeness,
  (3) "更新 README",
  (4) "檢查說明文件",
  (5) Documentation review.
  Supports docs directory references and sub-package README checks.
tags:
  - documentation/README
  - documentation
  - project-analysis
  - monorepo
  - agents/skills
---

# README Updater

Analyze project structure, check README completeness, and provide updates.

## Workflow

1. **Analyze project structure** - Determine if monorepo or single project (read `lerna.json` → `pnpm-workspace.yaml` → `package.json`, **stop at first hit**)
2. **Collect paths only** - Record file/directory paths and existence-derived info; **no content reads**; first try `pnpm -r ls --depth -1` (出錯 → fallback 原有路徑掃描); then build the **todo path list** and re-remind: **one by one**
3. **Check sub-packages** - For monorepos, process packages **one by one**; user's extra per-package tasks run in that package's turn (see Monorepo Handling). Sub-task/sub-agent groups: ONE BY ONE (分析 → 更新), 回報僅在組結束/停止時
4. **Root README phase** - 分析／更新 root README（必備：專案主要功能/負責內容、主套件介紹；其餘皆選填）— **永遠在所有路徑結束後執行**，除非使用者要求提前
5. **Generate report** - List missing/outdated sections
6. **Apply updates** - After user confirmation

## Project Analysis

### Detect Monorepo

Prefer path existence checks (`packages/`, `apps/` directories) first.
If config confirmation is needed, read **in this order, stopping at the
first hit**:

```
lerna.json → pnpm-workspace.yaml → package.json
```

- Stop as soon as monorepo path information (workspace globs/paths) is
  obtained — do **not** read all three files.
- `package.json` is only read if the first two did not yield the answer
  (e.g. `workspaces` field).
- Once detected, record only the workspace path patterns; do not carry
  other file contents forward.

### Collect Paths

Collection stage records **paths and existence-derived info only**.
Do not open, read, or scan file contents at this stage.

> Exception: the earlier **Detect Monorepo** stage may read config files,
> but only following its stop-at-first-hit rule above.

#### Fast path: pnpm 套件列表指令

先直接嘗試以指令收集套件列表：

```bash
pnpm -r ls --depth -1
```

- **成功** → 從輸出取得各套件的名稱與路徑，直接填入 todo path list。
- **出錯** → 可能不是 pnpm 專案（或未安裝 pnpm），**改用原有方案**：
  依 `packages/`、`apps/` 等目錄結構逐一列出路徑。

```
pnpm -r ls --depth -1
    ├─ 成功 → 套件列表（名稱 + 路徑）→ todo 列表
    └─ 出錯 → fallback：原有路徑掃描方案（僅目錄路徑，不讀內容）
```

- 此指令只為**列出套件清單**；其輸出不得用來判斷「哪個套件需要更新」。
- 無論走哪條路，收集階段結束時的產物都相同：**純路徑 todo 列表**。

| Source | Extract (path-level only) |
|--------|---------------------------|
| Root config files | Paths exist: `package.json`, `pyproject.toml`, lockfiles |
| `docs/` directory | Path exists; list file paths under it (names only) |
| Code structure | Top-level directory paths only |
| Sub-packages | Directory paths + package name from each dir path/manifest path, **or via `pnpm -r ls --depth -1`** (queue for one-by-one processing) |

Note: **README existence is NOT checked here.** Whether a package has a
README is determined later, inside that package's own processing turn.

All content reads (config values, README text, docs contents, code
internals) happen later, inside the turn where that item is processed.

## README Standard Sections

> **適用範圍說明：** 以下 Required/Recommended 清單適用於**子套件 README**。
> **Root README 的必備項目不同** — 僅「專案主要功能／負責內容」與「主套件介紹」
> 兩項必備，其餘（含下列 Required 項目）皆為選填，見 Root README 一節。

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

### Sequential Package Processing (One by One)

After scanning and listing all packages, process each package individually
in sequence. Do **not** pre-read or pre-detect whether a package needs
updates/fixes before starting its cycle.

```
Scan & list all packages → queue: [pkg-A, pkg-B, pkg-C, ...]
    │
    ▼ (one by one, no pre-reading)
Process pkg-A completely (analyze → package.json → README → report → update)
    │
    ▼
Process pkg-B completely
    │
    ▼
...
```

#### Todo Path List (建立於收集階段完成後)

When the path collection stage finishes, immediately write a **todo list
of paths** before doing anything else:

```markdown
## TODO (one by one — 僅路徑，尚未讀取內容)

- [ ] packages/core
- [ ] packages/utils
- [ ] packages/cli
- [ ] README.md (root, 全域階段)
```

Self-reminder to repeat before starting:

> **ONE BY ONE. Do not pre-read. Do not batch-analyze.**
> Finish the current path's turn completely before touching the next path.

- Tick an item only when that path's own turn is fully finished.
- The todo list is a work queue, **not** an analysis result — listing a
  path here says nothing about whether it needs updates.

#### Ordering (處理順序的決定)

The queue order can be decided by either approach — pick one, no deep
analysis needed:

- **由上往下** - Root/outer paths first, then deeper levels
  (`packages/*` → `packages/core/*`)
- **由下往上（bottom-up）** - Start from the deepest / innermost
  sub-folder packages, work up toward the outer level
  (`packages/core/*` → `packages/*`)

```
paths: [packages, packages/core, packages/core/deep, apps]

由下往上 → packages/core/deep → packages/core → packages → apps
由上往下 → packages → packages/core → packages/core/deep → apps
```

- Bottom-up is a valid default when inner packages are the building
  blocks that outer levels depend on.
- Order only defines **sequence** — it does not imply analysis, and no
  path may be read just to decide the order.
- Root README stays last regardless of the chosen direction (unless the
  user asks to run it earlier).

Rules:

- **Collection = paths only** - The scan/list phase only records paths
  (directories, file locations) and what is directly known from their
  existence (e.g. "this package directory is empty"). No file contents
  are read during collection, and **README existence is not checked** —
  that is determined in the package's own processing turn.
- **No pre-detection** - Do not open a package's README or files in advance
  to decide if it "probably needs updating". Detection (including whether
  its README exists at all) happens only inside that package's own
  processing turn.
- **Complete one before the next** - Finish the full turn (analyze →
  package.json `description`/`keywords` → README → report → update) for
  the current package before moving to the next one.
- **User's extra instructions wait for their package's turn** - If the
  user gave additional per-package tasks (e.g. "rename X in utils",
  "add badges to cli"), do not execute them early or batch them elsewhere.
  Execute them **only inside that package's own processing turn**, after
  its analysis — as part of the same turn cycle (package.json → README →
  report → update).
  Instructions that target the root README or the whole repo follow the
  root/global phase instead.
- **Shallow cross-package reads only** - When a package references another
  package, read only the necessary content (e.g. package name, version,
  exported API surface). Do **not** dig into that package's internals,
  history, or full README; the referenced package will be processed on its
  own turn anyway.

#### Per-package Turn Order (套件輪次內的順序)

Each package's own turn runs in this fixed order:

```
1. Analyze        - Read this package's files (first time it is read)
2. package.json   - Check / update `description` and `keywords`
3. README         - Check / update README sections  ← 排在 package.json 之後
4. Report         - List findings for this package
5. Update         - Apply changes after user confirmation
```

- **`description` / `keywords` 檢查與更新是套件任務的一部分** - Verify they
  exist, are non-empty, match the package's actual purpose, and stay
  consistent with the README intro (same terminology, same one-line pitch).
- **README 更新順序排在 package.json 之後** - Do not touch the README
  before `description` / `keywords` are checked; the README intro should
  be aligned with the final package.json wording, not the other way around.
- Both steps live in the same turn — no separate pre-pass over package.json
  files, and no deferring the README to a later batch.
- Root-level `package.json` fields follow the root/global phase, same as
  the root README.

#### Keywords Update Policy (keywords 更新策略)

**永不刪除既有標籤** - Existing keywords are only ever added to, never
removed.

**重寫／移除既有標籤的例外條件** - The never-delete / never-rewrite rule
holds **unless** the tag meets one of these:

1. **你在執行任務過程中加入的標籤** - A tag you added yourself during
   this very task (it is not "既有" yet, so you may revise or drop it in
   the same run), or
2. **使用者許可的** - The user explicitly permitted rewriting/removing it.

No other case allows touching an existing tag.

Merge procedure (when an update is warranted):

```
1. 假設 keywords 都不存在 → 先擬出你認為最能代表此套件的標籤清單 mine
2. 合併 → final = mine（放前方） + 原始 existing
3. 去重（保留在首次出現位置）→ 不需依文字排序
```

```
existing: ["create-by-tsdx", "parser", "cli"]
mine:     ["markdown", "parser"]

final = ["markdown", "parser", "create-by-tsdx", "cli"]
         └─ mine 在前 ─┘ └── 去重後的原有標籤 ──┘
```

**特殊建立標籤（絕不刪除）** - Scaffolding-tool markers written when the
package was created must be preserved verbatim, e.g.:

- `"create-by-yarn-tool"`
- `"create-by-tsdx"`

Treat this list as non-exhaustive: any `create-by-*` or similar
generator/scaffold marker gets the same protection.

**更新時機（不需每次都更新）** - Prefer leaving `keywords` untouched,
but adding is still allowed:

- 既有標籤已不足以表示套件特點（too few / too vague / missing the
  package's actual purpose），或
- 本次輪次正在更新 `description` — 順帶一併更新 keywords
- 其餘情況：**想到更好的標籤可以加入**（append via the merge procedure
  above），但**不主動重寫或移除既有標籤**（例外見上方例外條件）

- **不需要按文字排序** - Order is not meaningful; keep `mine` first as
  defined above.
- **新加入的標籤限英文** - Any tag you introduce must be in English
  (e.g. `markdown`, `cli`). The only exception: a non-English tag may stay
  **if it already exists in `keywords`** — those are preserved as-is under
  the never-delete rule, never re-added by you.
- 標籤需與 description/README 的英文用詞一致（新增標籤時）。

### Grouped Dispatch (10+ packages / sub-tasks / sub-agents)

When the todo path list has **10 or more packages**, or when you plan to
hand work to **sub-tasks / sub-agents**, split the path list into groups
instead of dispatching everything at once.

Grouping rules:

- **Group size: 1~5 paths per group** - Paths only; no pre-read contents.
- **Max 3 groups per dispatch round** - Dispatch at most 3 groups at a
  time; wait for their results before dispatching the next round.
- **Still one by one inside each group** - Every group repeats the same
  self-reminder and processes its paths sequentially, never in parallel
  within the group.

#### Grouping Strategy (分組策略)

Preferred: group by **rough path-based association** — a simple, low-effort
guess based on the path strings alone. **No deep thinking, no file reads,
no dependency analysis.**

Signals usable from paths only (path strings are already collected):

- Shared parent directory — `packages/core-a`, `packages/core-b`
- Name prefix / scope — `@scope/utils-*`, `*-adapter`
- Directory area — `apps/*` vs `packages/*`, `plugins/*` vs `libs/*`
- Obvious keyword in the name — `auth`, `cli`, `docs`

```
paths: [packages/auth-core, packages/auth-jwt, packages/ui, packages/cli,
        libs/parser, packages/auth/core/deep]

粗略分組（僅看路徑字串，不深入思考）：
  Group A [packages/auth-core, packages/auth-jwt, packages/auth/core/deep]  ← auth 關鍵字（跨層級）
  Group B [packages/ui, packages/cli]                                       ← 同為 packages/ 前段
  Group C [libs/parser]                                                     ← libs/ 區域
```

Rules:

- **跨層級分組允許（cross-level grouping）** - A group does **not** have to
  keep paths at the same hierarchy level; paths from different depths or
  different parent directories may share a group if they associate roughly
  (e.g. `packages/auth` + `packages/auth/core/deep` + `libs/auth-utils`).
- **粗略即可** - The guess only needs to be plausible; wrong grouping is
  harmless (it does not change correctness, only batching convenience).
- **絕不為分組讀檔** - Grouping must never trigger content reads; it
  happens right after path collection, before any package turn.
- Fallback: if paths give no signal, group sequentially in todo order
  (1~5 per group), regardless of level.

#### Sub-task / Sub-agent Turn Cycle (子任務／子代理的輪次循環)

A group dispatched to a **sub-task / sub-agent** uses a different cycle
than the main task:

```
Main task (direct execution):  ONE BY ONE (分析 → 更新 → 回報)
Sub-task / Sub-agent group:    ONE BY ONE (分析 → 更新)  →  回報僅在組結束/停止時
```

- Inside the group, each path runs **analyze → update only** — no
  per-package reporting between paths.
- The group **reports once** when it either:
  - **finishes** all its paths, or
  - **stops** (abandon rule triggered).
- Report content: results of every path processed + the list of abandoned
  (unprocessed) paths.

Abandon-and-report rule:

- If, during a group's sequential processing, a path turns out to need
  **large-scale or complex handling**, that group **automatically abandons
  its remaining paths** (do not attempt them) and **stops**.
- The group then reports **once**: what it completed + the list of
  abandoned paths.
- The main task collects all abandoned paths and **re-dispatches** them
  in a later round (again max 3 groups, 1~5 paths each).

```
todo: 12 paths
  ├─ Round 1 → Group A [1-5] + Group B [6-10] + Group C [11-12]   (max 3 groups)
  │     └─ Group B hits a complex pkg at path 8
  │           → abandon 9, 10 → report: [9, 10] unprocessed
  ├─ Round 2 → main task re-dispatches abandoned paths (grouped again)
  └─ ... until todo list is fully ticked (or user is consulted)
```

- Abandoned ≠ skipped: every path must eventually be either processed or
  explicitly reported as unprocessed to the user.

### Root README

**主要責任（核心，必備）：**

- **介紹本專案的主要功能／負責內容** - What this project does, its main
  features and scope
- **介紹主套件** - List the main sub-packages with purposes

**其餘內容皆為選填（非必寫）：**

以下項目**不一定要撰寫**，僅在有需要時才補充：

- Overall project architecture
- Monorepo development guide
- Package dependency relationships
- 以及 README Standard Sections 中 Required 以外的所有項目

```
Root README 責任範圍：
    ├─ 必備 → 專案主要功能/負責內容、主套件介紹
    └─ 選填 → 架構說明、開發指南、相依關係、其餘章節（按需撰寫）
```

#### 執行時機（永遠最後）

- **Root README 的分析／更新任務永遠排在所有路徑（todo list 全部套件）
  結束之後才執行** — 包括其 `package.json` 的 root 層欄位。
- **例外：使用者明確要求提前執行**時，才可提前。
- 收集階段建立 todo 時，root README 就放在清單**最末端**（標記
  `root, 全域階段`），以視覺化此順序。

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

### Required（必備）
#### ✓ Complete
- 專案主要功能／負責內容
- 主套件介紹

#### ✗ Missing or Outdated
- 主套件介紹（missing）

### Optional（選填 — 僅列出已存在且過時者；不存在不算缺失）
- Installation (version outdated)
- Architecture（未撰寫 → 不列為缺失）

## Sub-Packages Status

| Package | package.json (description/keywords) | README Exists | Completeness | Issues |
|---------|--------------------------------------|---------------|--------------|--------|
| @scope/core | ✓ / ✓ | ✓ | 90% | Missing config section |
| @scope/utils | ✗ / outdated | ✓ | 60% | description empty; keywords missing |
| @scope/cli | ✓ / ✗ | ✗ | 0% | README not found |

## Suggested Updates

### 1. Add Sub-packages Introduction（必備）
[Example content...]

### 2.（選填，僅在使用者要求時）Add Architecture Section
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

## Generic Sections Constraint

### 不主動添加的章節

當 README 中**不存在**以下概念時，**除非使用者明確要求**，否則不應寫入：

- `## author` - 作者資訊
- `## 相容性` - Compatibility（如 Node.js 版本要求）
- `## 貢獻` - Contributing（如 "歡迎提交 Issue 和 Pull Request!"）
- `## 授權` - License（如 "ISC License"）

### 判斷邏輯

```
檢查現有 README
    │
    ▼
該章節是否存在？
    │
    ├─ 是 → 保留原有內容，可選擇性更新
    │
    └─ 否 → 不主動添加，除非使用者明確要求
```

### 範例

```markdown
# 錯誤示範（不應主動添加）

## author
John Doe

## 相容性
- Node.js >= 12

## 貢獻
歡迎提交 Issue 和 Pull Request！

## 授權
ISC License
```

```markdown
# 正確做法

若使用者要求更新 README：
- 先分析現有內容
- 僅補充缺少的核心章節（如 Installation、Usage）
- 不添加上述通用章節，除非明確要求
```

## Negative Examples (不該進行的行為)

以下行為**違反 one by one / 不預讀原則**，即使看似「提高效率」也不得執行。

### 並行預讀 / 先掃描再確認

> **錯誤示範：**
> 「單一專案分析成本高（xx 個子套件），我先並行收集各套件的 README 與原始檔狀態，彙整成報告後再向您確認更新範圍。」

問題所在：

- **並行收集** = 預先讀取所有套件內容，跳過 one by one 逐輪處理
- **彙整成報告後再確認** = 在收集階段就做了分析判定，違反「收集僅路徑」
- 結果會把整批套件的內容一次讀完，本輪變成預讀 + 批次分析

正確做法：

```markdown
1. 收集階段 → 只記路徑，todo 列表 + 自我提醒 ONE BY ONE
2. 依序處理第一個套件 → 分析 → 報告（可先向使用者確認此套件範圍）
3. 完成後才換下一個套件
4. （10+ 套件時）分組派遣，每輪最多 3 組、每組 1~5 路徑，組內仍 one by one
```

### 其他禁止行為

- ❌ **批量預讀** - 一次打開多個套件的 README/原始檔做狀態比較
- ❌ **收集階段做判定** - 在路徑清單上標註「此套件過時／需更新」
- ❌ **提前執行使用者的額外指示** - 在套件輪次開始前就動手
- ❌ **跨套件深挖** - 讀取被引用套件的完整 README、git 歷史或內部實作
- ❌ **組內平行處理** - 分組派遣時，在單一組內同時處理多個路徑
- ❌ **靜默略過** - 放棄的路徑不回報，讓它消失在清單中
- ❌ **提前處理 root README** - 在所有套件路徑尚未結束前就分析／更新 root README（除非使用者要求提前）
- ❌ **子任務逐套件回報** - 子任務／子代理組在組內每個套件後都回報（應在組結束或停止時才回報一次）
- ❌ **為分組而讀檔／深度思考** - 分組策略只看路徑字串做粗略猜測；不得為此讀取檔案內容或做依賴分析
- ❌ **刪除既有 keywords** - keywords 只增不減；尤其 `create-by-yarn-tool`、`create-by-tsdx` 等建立時的特殊標誌絕不可刪。例外僅兩種：該標籤是本次任務中由你加入的、或使用者明確許可
- ❌ **每次輪次都改寫 keywords** - 不需每次都更新；但有更好標籤時可「加入」（僅限英文），不得重寫或移除既有標籤

## Example Workflow

```
User: Update README, and in utils add a bencharks section, in cli fix the version badge

1. Analyze structure → Monorepo detected (packages/ exists)
2. Collect paths only → try `pnpm -r ls --depth -1` → queue: [core, utils, cli]
   (出錯 → fallback: record paths of configs, docs/, package dirs; no file contents read; README existence NOT checked yet; extra user tasks held, not started)
3. Process core → read files now → check package.json description/keywords ✓ → README ✓ → next
4. Process utils → package.json: description empty, keywords outdated → update (after confirmation)
   → then README (排在 package.json 之後): missing usage examples → report + update
   → then execute user's extra task for utils (add bencharks section)
5. Process cli → package.json: keywords missing → update
   → then README: path missing → report + create (after confirmation)
   → then execute user's extra task for cli (fix version badge)
   (cross-package references read shallowly only, e.g. names/versions)
6. Root README phase（**所有路徑結束後才執行**）→ Analyze root README →
   專案功能介紹不足、主套件介紹缺失（必備）；架構章節僅選填、不列為缺失
7. Generate combined report → Root + per-package status table
8. Execute updates → After user confirmation
```

Sub-agent group variant (same run, groups dispatched):

```
Group B (sub-agent): ONE BY ONE (分析 → 更新) for [utils, cli]
  → 組內不逐套件回報
  → 組結束時 回報一次：已完成結果 + 被放棄的路徑列表
  → 若中途遇到複雜套件 → 放棄其餘路徑並停止 → 回報
Root README phase → 仍排在所有路徑（含重新分發的路徑）全部結束之後
```
