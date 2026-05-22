---
tags:
  - obsidian
  - mcp
  - periodic-notes
  - put
  - with-date
  - documentation/references
---

# `PUT /periodic/{year}/{month}/{day}/{period}/` — Update Periodic Note (With Date)

> Tags: `Periodic Notes`

## Summary

Update the content of a periodic note.

## Parameters

| Name | In | Required | Type | Default | Description |
|------|----|----------|------|---------|-------------|
| `year` | path | ✅ | number | — | The year of the date for which you would like to grab a periodic note. |
| `month` | path | ✅ | number | — | The month (1-12) of the date for which you would like to grab a periodic note. |
| `day` | path | ✅ | number | — | The day (1-31) of the date for which you would like to grab a periodic note. |
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
