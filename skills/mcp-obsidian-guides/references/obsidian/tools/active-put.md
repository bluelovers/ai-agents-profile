# `PUT /active/` — Update Active File

> Tags: `Active File`

## Summary

Update the content of the active file open in Obsidian.

## Parameters

### Request Body

`Content of the file you would like to upload.`

Supports `*/*` and `text/markdown` content types.

## Responses

| Status | Description |
|--------|-------------|
| 204 | Success |
| 400 | Incoming file could not be processed.  Make sure you have specified a reasonable file name, and make sure you have set a reasonable 'Content-Type' header; if you are uploading a note, 'text/markdown' is likely the right choice. |
| 405 | Your path references a directory instead of a file; this request method is valid only for updating files. |
