---
description: Get latest N reviews on PR in target Github Repo
---

Get latest 5 reviews on PR $2 in repo $1
| gh pr view $2 --repo $1 --json reviews --jq '.reviews | sort_by(.submittedAt) | reverse | .[0:5] | .[] | {author:.author.login, state: .state, submittedAt: .submittedAt, body: .body}'
