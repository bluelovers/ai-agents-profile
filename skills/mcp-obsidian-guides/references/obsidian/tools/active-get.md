---
tags:
  - obsidian
  - mcp
  - active-file
  - get
  - read
  - documentation/references
---

# `GET /active/` — Get Active File

> Tags: `Active File`

## Summary

Return the content of the active file open in Obsidian.

## Description

Returns the content of the currently active file in Obsidian.

If you specify the header `Accept: application/vnd.olrapi.note+json`, will return a JSON representation of your note including parsed tag and frontmatter data as well as filesystem metadata.  See "responses" below for details.

## Responses

### 200 — `text/markdown`

```markdown
# This is my document

something else here
```

### 200 — `application/vnd.olrapi.note+json`

See NoteJson schema.
