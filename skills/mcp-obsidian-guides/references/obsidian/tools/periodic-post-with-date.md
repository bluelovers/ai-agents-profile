# `POST /periodic/{year}/{month}/{day}/{period}/` — Append to Periodic Note (With Date)

> Tags: `Periodic Notes`

## Summary

Append content to a periodic note.

## Description

Appends content to the periodic note for the specified period.  This will create the relevant periodic note if necessary.

## Parameters

| Name | In | Required | Type | Default | Description |
|------|----|----------|------|---------|-------------|
| `year` | path | ✅ | number | — | The year of the date for which you would like to grab a periodic note. |
| `month` | path | ✅ | number | — | The month (1-12) of the date for which you would like to grab a periodic note. |
| `day` | path | ✅ | number | — | The day (1-31) of the date for which you would like to grab a periodic note. |
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
