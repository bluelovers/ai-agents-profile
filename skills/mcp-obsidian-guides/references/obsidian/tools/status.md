---
tags:
  - obsidian
  - mcp
  - obsidian/rest/status
  - documentation/references
---

# `GET /` — Server Status

> Tags: `Status`

## Summary

Returns basic details about the server.

## Description

Returns basic details about the server as well as your authentication status.

This is the only API request that does *not* require authentication.

## Responses

### 200

```json
{
  "authenticated": true,
  "ok": "'OK'",
  "service": "'Obsidian Local REST API'",
  "versions": {
    "obsidian": "Obsidian plugin API version",
    "self": "Plugin version."
  }
}
```
