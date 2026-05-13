# `GET /vault/` — List Vault Root

> Tags: `Vault Directories`

## Summary

List files that exist in the root of your vault.

## Description

Lists files in the root directory of your vault.

Note: that this is exactly the same API endpoint as the below "List files that exist in the specified directory." and exists here only due to a quirk of this particular interactive tool.

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
