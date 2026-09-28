# Inline → Block Comment Converter

A small, safety-first helper that converts inline (`//`) comments into block comments
(`/** ... */`), helping bring existing code in line with this skill's "block comments only"
rule. It is **dry-run by default** — nothing is written unless you pass `--write`.

## Files

| File | Purpose |
|------|---------|
| `inline-to-block.cjs` | The converter script (Node.js, CommonJS). |
| `inline-to-block.bat` | Windows launcher. Uses `%~dp0` to locate the sibling `.cjs` and forwards all arguments via `%*`. |
| `inline-to-block.md` | This document. |

## Quick start

```bat
REM Windows (batch launcher)
inline-to-block.bat ./src --write --diff

REM Or call node directly
node "path/to/inline-to-block.cjs" ./src --write --diff
```

## Flags

| Flag | Effect |
|------|--------|
| *(none)* | Dry-run. Reports what would change, writes nothing. |
| `--write` | Actually writes the converted files. |
| `--diff` | Prints a line-level before/after preview of changes. |
| `--no-recursive` | When the target is a directory, process only that directory (no subdirectories). |

Positional arguments are the targets (files or directories). Multiple targets are allowed.

## Behavior

- **Trailing comments** (`code // note`) become an inline block comment placed above the code line.
- **Consecutive pure comment lines** are merged into a single multi-line block comment.
- **Separators** (e.g. `// ===== Title =====`), **directive comments** (`// @ts-ignore`,
  `// eslint-disable`, etc.), and **triple-slash** comments (`/// <reference>`) are kept as-is.
- **Original EOL** (CRLF/LF) is preserved, and existing block comments are never touched.

## Safety limits

The script deliberately stops or warns in risky situations:

- Max files per folder (`MAX_FILES = 20`); the whole task aborts if exceeded.
- Max search depth (`MAX_DEPTH = 2`); `--no-recursive` limits to the target directory only.
- Max file size (`MAX_FILE_BYTES = 100 KiB`); oversized files are skipped entirely.
- Max source line length (`MAX_LINE_LENGTH = 500`); too-long lines are skipped and reported.
- Unsafe target paths are rejected: `..` segments, `//` or `\\`, absolute paths, root/drive root.
- Lines containing both `//` and block-comment markers, or a regex literal, are skipped for review.
- Directory scans reject filenames containing `$`; explicit `$` targets require a `./` prefix.

## Examples

```bat
REM Preview changes for one file (dry-run)
inline-to-block.bat src/utils/format.ts

REM Apply changes to a directory and show a diff
inline-to-block.bat src --write --diff

REM One level only, no recursion
inline-to-block.bat src/components --no-recursive --write
```

## Exit codes

- `0` — completed (including dry-run with no fatal issues).
- `1` — aborted due to unsafe target path or too many files for safety.
