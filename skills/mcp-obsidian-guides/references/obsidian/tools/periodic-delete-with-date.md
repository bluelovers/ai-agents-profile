---
tags:
  - obsidian
  - mcp
  - obsidian/rest/delete
  - documentation/references
---

# `DELETE /periodic/{year}/{month}/{day}/{period}/` — Delete Periodic Note (With Date)

> Tags: `Periodic Notes`

## Summary

Delete a periodic note.

## Description

Deletes the periodic note for the specified period.

## Parameters

| Name | In | Required | Type | Default | Description |
|------|----|----------|------|---------|-------------|
| `year` | path | ✅ | number | — | The year of the date for which you would like to grab a periodic note. |
| `month` | path | ✅ | number | — | The month (1-12) of the date for which you would like to grab a periodic note. |
| `day` | path | ✅ | number | — | The day (1-31) of the date for which you would like to grab a periodic note. |
| `period` | path | ✅ | `daily` / `weekly` / `monthly` / `quarterly` / `yearly` | `daily` | The name of the period for which you would like to grab the current note. |

## Responses

| Status | Description |
|--------|-------------|
| 204 | Success |
| 404 | File does not exist. |
| 405 | Your path references a directory instead of a file; this request method is valid only for updating files. |
