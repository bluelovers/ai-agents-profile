---
tags:
  - obsidian
  - mcp
  - vault
  - put
  - create
---

# `PUT /vault/{filename}` — Create or Update File

> Tags: `Vault Files`

## Summary

Create a new file in your vault or update the content of an existing one.

## Description

Creates a new file in your vault or updates the content of an existing one if the specified file already exists.

## Parameters

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `filename` | path | ✅ | string (path) | Path to the relevant file (relative to your vault root). |

### Request Body

`Content of the file you would like to upload.`

Supports `*/*` and `text/markdown` content types.

## Responses

| Status | Description |
|--------|-------------|
| 204 | Success |
| 400 | Incoming file could not be processed.  Make sure you have specified a reasonable file name, and make sure you have set a reasonable 'Content-Type' header; if you are uploading a note, 'text/markdown' is likely the right choice. |
| 405 | Your path references a directory instead of a file; this request method is valid only for updating files. |
