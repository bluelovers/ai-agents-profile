---
tags:
  - obsidian
  - mcp
  - vault
  - delete
  - documentation/references
---

# `DELETE /vault/{filename}` — Delete File

> Tags: `Vault Files`

## Summary

Delete a particular file in your vault.

## Parameters

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `filename` | path | ✅ | string (path) | Path to the relevant file (relative to your vault root). |

## Responses

| Status | Description |
|--------|-------------|
| 204 | Success |
| 404 | File does not exist. |
| 405 | Your path references a directory instead of a file; this request method is valid only for updating files. |
