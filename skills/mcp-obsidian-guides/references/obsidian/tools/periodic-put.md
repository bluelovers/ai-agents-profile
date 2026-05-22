---
tags:
  - obsidian
  - mcp
  - periodic-notes
  - put
  - documentation/references
---

# `PUT /periodic/{period}/` — Update Periodic Note (Period Only)

> Tags: `Periodic Notes`

## Summary

Update the content of a periodic note.

## Parameters

| Name | In | Required | Type | Default | Description |
|------|----|----------|------|---------|-------------|
| `period` | path | ✅ | `daily` / `weekly` / `monthly` / `quarterly` / `yearly` | `daily` | The name of the period for which you would like to grab the current note. |

### Request Body

`Content of the file you would like to upload.`

Supports `*/*` and `text/markdown` content types.

## Responses

| Status | Description |
|--------|-------------|
| 204 | Success |
| 400 | Incoming file could not be processed.  Make sure you have specified a reasonable file name, and make sure you have set a reasonable 'Content-Type' header; if you are uploading a note, 'text/markdown' is likely the right choice. |
| 405 | Your path references a directory instead of a file; this request method is valid only for updating files. |
