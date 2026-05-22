---
tags:
  - obsidian
  - mcp
  - commands
  - list
  - documentation/references
---

# `GET /commands/` — List Available Commands

> Tags: `Commands`

## Summary

Get a list of available commands.

## Responses

### 200

```json
{
  "commands": [
    {
      "id": "global-search:open",
      "name": "Search: Search in all files"
    },
    {
      "id": "graph:open",
      "name": "Graph view: Open graph view"
    }
  ]
}
```
