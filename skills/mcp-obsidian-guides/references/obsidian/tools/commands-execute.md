---
tags:
  - obsidian
  - mcp
  - commands
  - execute
---

# `POST /commands/{commandId}/` — Execute Command

> Tags: `Commands`

## Summary

Execute a command.

## Parameters

| Name | In | Required | Description |
|------|----|----------|-------------|
| `commandId` | path | ✅ | The id of the command to execute |

## Responses

| Status | Description |
|--------|-------------|
| 204 | Success |
| 404 | The command you specified does not exist. |
