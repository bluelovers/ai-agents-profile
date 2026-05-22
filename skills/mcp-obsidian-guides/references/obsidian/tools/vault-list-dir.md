---
tags:
  - obsidian
  - mcp
  - obsidian/vault
  - obsidian/list
  - obsidian/directory
  - documentation/references
---

# `GET /vault/{pathToDirectory}/` — List Directory

> Tags: `Vault Directories`

## Summary

List files that exist in the specified directory.

## Description

Path to list files from (relative to your vault root).  Note that empty directories will not be returned.

Note: this particular interactive tool requires that you provide an argument for this field, but the API itself will allow you to list the root folder of your vault. If you would like to try listing content in the root of your vault using this interactive tool, use the above "List files that exist in the root of your vault" form above.

## Parameters

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `pathToDirectory` | path | ✅ | string (path) | Path to list files from (relative to your vault root). |

## Responses

### 200

```json
{
  "files": [
    "mydocument.md",
    "somedirectory/"
  ]
}
```

| Status | Description |
|--------|-------------|
| 200 | Success |
| 404 | Directory does not exist |
