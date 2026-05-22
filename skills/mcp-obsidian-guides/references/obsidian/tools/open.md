---
tags:
  - obsidian
  - mcp
  - open-file
  - documentation/references
---

# `POST /open/{filename}` — Open Document

> Tags: `Open`

## Summary

Open the specified document in Obsidian

## Description

Opens the specified document in Obsidian.

Note: Obsidian will create a new document at the path you have specified if such a document did not already exist.

## Parameters

| Name | In | Required | Type | Description |
|------|----|----------|------|-------------|
| `filename` | path | ✅ | string (path) | Path to the file to return (relative to your vault root). |
| `newLeaf` | query | ❌ | boolean | Open this as a new leaf? |

## Responses

| Status | Description |
|--------|-------------|
| 200 | Success |
