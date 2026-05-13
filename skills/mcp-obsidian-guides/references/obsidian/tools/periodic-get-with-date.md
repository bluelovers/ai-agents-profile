# `GET /periodic/{year}/{month}/{day}/{period}/` — Get Periodic Note (With Date)

> Tags: `Periodic Notes`

## Summary

Get current periodic note for the specified period.

## Parameters

| Name | In | Required | Type | Default | Description |
|------|----|----------|------|---------|-------------|
| `year` | path | ✅ | number | — | The year of the date for which you would like to grab a periodic note. |
| `month` | path | ✅ | number | — | The month (1-12) of the date for which you would like to grab a periodic note. |
| `day` | path | ✅ | number | — | The day (1-31) of the date for which you would like to grab a periodic note. |
| `period` | path | ✅ | `daily` / `weekly` / `monthly` / `quarterly` / `yearly` | `daily` | The name of the period for which you would like to grab the current note. |

## Responses

### 200 — `text/markdown`

```markdown
# This is my document

something else here
```

### 200 — `application/vnd.olrapi.note+json`

See NoteJson schema.

| Status | Description |
|--------|-------------|
| 200 | Success |
| 404 | File does not exist |
