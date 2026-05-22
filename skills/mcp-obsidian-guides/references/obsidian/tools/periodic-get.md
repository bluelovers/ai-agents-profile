---
tags:
  - obsidian
  - mcp
  - obsidian/rest/get
  - documentation/references
---

# `GET /periodic/{period}/` — Get Periodic Note (Period Only)

> Tags: `Periodic Notes`

## Summary

Get current periodic note for the specified period.

## Parameters

| Name | In | Required | Type | Default | Description |
|------|----|----------|------|---------|-------------|
| `period` | path | ✅ | `daily` / `weekly` / `monthly` / `quarterly` / `yearly` | `daily` | The name of the period for which you would like to grab the current note. |

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
