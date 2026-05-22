---
tags:
  - obsidian
  - mcp
  - vault
  - post
  - append
---

# `POST /vault/{filename}` — Append to File

> Tags: `Vault Files`

## Summary

Append content to a new or existing file.

## Description

Appends content to the end of a file in your vault. If the file you have specified does not exist, a new file will be created at that path.

## Parameters

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `filename` | path | ✅ | string (path) | Path to the relevant file (relative to your vault root). |

### Request Body

`Content you would like to append.`

Supports `text/markdown`.

## Responses

| Status | Description |
|--------|-------------|
| 204 | Success |
| 400 | Bad Request |
| 405 | Your path references a directory instead of a file; this request method is valid only for updating files. |
