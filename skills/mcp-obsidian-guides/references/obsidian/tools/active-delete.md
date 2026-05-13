# `DELETE /active/` — Delete Active File

> Tags: `Active File`

## Summary

Deletes the currently-active file in Obsidian.

## Parameters

None.

## Responses

| Status | Description |
|--------|-------------|
| 204 | Success |
| 404 | File does not exist. |
| 405 | Your path references a directory instead of a file; this request method is valid only for updating files. |
