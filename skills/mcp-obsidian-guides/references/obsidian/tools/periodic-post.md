---
tags:
  - obsidian
  - mcp
  - obsidian/rest/post
  - documentation/references
---

# `POST /periodic/{period}/` — Append to Periodic Note (Period Only)

> Tags: `Periodic Notes`

## Summary

Append content to a periodic note.

## Description

Appends content to the periodic note for the specified period.  This will create the relevant periodic note if necessary.

## Parameters

| Name | In | Required | Type | Default | Description |
|------|----|----------|------|---------|-------------|
| `period` | path | ✅ | `daily` / `weekly` / `monthly` / `quarterly` / `yearly` | `daily` | The name of the period for which you would like to grab the current note. |

### Request Body

`Content you would like to append.`

Supports `text/markdown`.

## Responses

| Status | Description |
|--------|-------------|
| 204 | Success |
| 400 | Bad Request |
| 405 | Your path references a directory instead of a file; this request method is valid only for updating files. |
