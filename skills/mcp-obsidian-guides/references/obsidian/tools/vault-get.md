---
tags:
  - obsidian
  - mcp
  - vault
  - get
  - read
  - documentation/references
---

# `GET /vault/{filename}` — Get File Content

> Tags: `Vault Files`

## Summary

Return the content of a single file in your vault.

## Description

Returns the content of the file at the specified path in your vault should the file exist.

If you specify the header `Accept: application/vnd.olrapi.note+json`, will return a JSON representation of your note including parsed tag and frontmatter data as well as filesystem metadata.  See "responses" below for details.

## Parameters

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `filename` | path | ✅ | string (path) | Path to the relevant file (relative to your vault root). |

## Responses

### 200 — `text/markdown`

```markdown
# This is my document

something else here
```

### 200 — `application/vnd.olrapi.note+json`

See NoteJson schema.

| Status | Description |
|--------|-------------|
| 200 | Success |
| 404 | File does not exist |
