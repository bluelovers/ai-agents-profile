---
tags:
  - obsidian
  - mcp
  - periodic-notes
  - delete
---

# `DELETE /periodic/{period}/` — Delete Periodic Note (Period Only)

> Tags: `Periodic Notes`

## Summary

Delete a periodic note.

## Description

Deletes the periodic note for the specified period.

## Parameters

| Name | In | Required | Type | Default | Description |
|------|----|----------|------|---------|-------------|
| `period` | path | ✅ | `daily` / `weekly` / `monthly` / `quarterly` / `yearly` | `daily` | The name of the period for which you would like to grab the current note. |

## Responses

| Status | Description |
|--------|-------------|
| 204 | Success |
| 404 | File does not exist. |
| 405 | Your path references a directory instead of a file; this request method is valid only for updating files. |
