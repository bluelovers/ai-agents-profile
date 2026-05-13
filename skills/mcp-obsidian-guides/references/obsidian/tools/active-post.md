# `POST /active/` — Append to Active File

> Tags: `Active File`

## Summary

Append content to the active file open in Obsidian.

## Description

Appends content to the end of the currently-open note.

If you would like to insert text relative to a particular heading instead of appending to the end of the file, see 'patch'.

## Parameters

### Request Body

`Content you would like to append.`

Supports `text/markdown`.

## Responses

| Status | Description |
|--------|-------------|
| 204 | Success |
| 400 | Bad Request |
| 405 | Your path references a directory instead of a file; this request method is valid only for updating files. |
