---
tags:
  - obsidian
  - mcp
  - obsidian/rest/patch
  - documentation/references
---

# `PATCH /periodic/{year}/{month}/{day}/{period}/` — Patch Periodic Note (With Date)

> Tags: `Periodic Notes`

## Summary

Insert content into a periodic note in Obsidian relative to a heading, block reference, or frontmatter field within that document.

## Description

Inserts content into a periodic note relative to a heading, block refeerence, or frontmatter field within that document.

Allows you to modify the content relative to a heading, block reference, or frontmatter field in your document.

Note that this API was changed in Version 3.0 of this extension and the earlier PATCH API is now deprecated. Requests made using the previous version of this API will continue to work until Version 4.0 is released.  See https://github.com/coddingtonbear/obsidian-local-rest-api/wiki/Changes-to-PATCH-requests-between-versions-2.0-and-3.0 for more details and migration instructions.

This endpoint has the same behavior and examples as `PATCH /active/`. See [active-patch.md](./active-patch.md) for full examples.

## Parameters

| Name | In | Required | Type | Default | Description |
|------|----|----------|------|---------|-------------|
| `year` | path | ✅ | number | — | The year of the date for which you would like to grab a periodic note. |
| `month` | path | ✅ | number | — | The month (1-12) of the date for which you would like to grab a periodic note. |
| `day` | path | ✅ | number | — | The day (1-31) of the date for which you would like to grab a periodic note. |
| `period` | path | ✅ | `daily` / `weekly` / `monthly` / `quarterly` / `yearly` | `daily` | The name of the period for which you would like to grab the current note. |

### Headers

| Name | Required | Type | Description |
|------|----------|------|-------------|
| `Operation` | ✅ | `append` / `prepend` / `replace` | Patch operation to perform |
| `Target-Type` | ✅ | `heading` / `block` / `frontmatter` | Type of target to patch |
| `Target-Delimiter` | ❌ | string (default: `::`) | Delimiter to use for nested targets (i.e. Headings) |
| `Target` | ✅ | string | Target to patch; this value can be URL-Encoded and *must* be URL-Encoded if it includes non-ASCII characters. |
| `Trim-Target-Whitespace` | ❌ | `true` / `false` (default: `false`) | Trim whitespace from Target before applying patch? |

### Request Body

`Content you would like to insert.`

Supports `text/markdown` and `application/json` content types.

## Responses

| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Bad Request; see response message for details. |
| 404 | Does not exist |
| 405 | Your path references a directory instead of a file; this request method is valid only for updating files. |
