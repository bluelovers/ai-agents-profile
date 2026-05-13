# `POST /search/simple/` — Simple Search

> Tags: `Search`

## Summary

Search for documents matching a specified text query

## Parameters

| Name | In | Required | Type | Default | Description |
|------|----|----------|------|---------|-------------|
| `query` | query | ✅ | string | — | Your search query |
| `contextLength` | query | ❌ | number | 100 | How much context to return around the matching string |

## Responses

### 200

```json
[
  {
    "filename": "Path to the matching file",
    "matches": [
      {
        "context": "context string",
        "match": {
          "start": 0,
          "end": 10
        }
      }
    ],
    "score": 0
  }
]
```
