---
name: factual-accuracy-guard
description: "Prevents AI agents from adding unfactual content in responses or queries, avoiding execution of erroneous tasks based on unverified false, fictional, or incorrect preconceptions. Prohibits fabricating non-existent facts; even in role-playing mode, facts must be integrated unless the fictional world rules specify otherwise."
compatibility: opencode
metadata:
  audience: agents
  domain: safety, quality-control
tags:
  - accuracy
  - fact-checking
  - safety
---

# Factual Accuracy Guard Skill

## Core Purpose

This skill prevents AI Agents from：
- Adding unfactual content in responses or queries
- Executing tasks based on unverified false, fictional, or incorrect preconceptions
- Fabricating non-existent facts, data, or concepts

---

## Error Pattern Recognition

### Common Error Types

| Error Type | Description | Example |
|------------|-------------|---------|
| **Name Confusion** | Mixing up different entities with the same name | Mistaking `chroma.js` (color library) for ChromaDB (vector database) |
| **Over-inference** | Over-extrapolating from partial information | Adding concepts not present in provided URLs |
| **Popularity Bias** | Prioritizing "well-known" tech over user context | Ignoring chroma.js URL because ChromaDB is more popular |
| **Fabricated Details** | Making up non-existent methods, properties, parameters | Writing about API methods or config options that don't exist |
| **Unverified Assumptions** | Treating guesses as facts for task execution | Assuming project type without confirming URL content |

---

## Core Principles

### P1. Input Source Authority

```
Treat user-provided input sources (URLs, documents, code) as the sole authoritative reference.
```

**Rules:**
- When task includes URLs, must use `webfetch()` to retrieve content first
- Prompts must not include concepts or terminology absent from URL content
- User-provided context takes precedence over any preconceptions

**Decision Flow:**
```
Receive task (with name + URL)
    │
    ▼
Does URL exist?
    │
    ├─ Yes → Use webfetch to read URL content → Execute based on content
    │
    └─ No → Does name have multiple meanings?
              │
              ├─ Yes → Use "literal meaning" or request clarification
              │
              └─ No → Execute normally
```

### P2. Minimum Assumption

```
If a name has multiple uses, default to "the project pointed to by the first URL" or "the most directly relevant meaning."
```

**Conditions allowing other projects (must ALL be true):**
1. User explicitly states "not referring to XXX"
2. OR URL content severely mismatches expectations AND URL is confirmed invalid/outdated

### P3. Fact Verification Mandatory

```
Verify key facts before executing any task.
```

**Checklist:**
- [ ] Has the entity corresponding to the name been confirmed?
- [ ] Has URL content been read and understood?
- [ ] Is there ambiguity? Has it been resolved?
- [ ] Does the prompt contain unverified information?
- [ ] Is the decision based on evidence rather than speculation?

### P4. No Fabrication

```
Do not fabricate any non-existent facts, methods, properties, parameters, or behaviors.
```

**Including but not limited to:**
- Non-existent API methods or functions
- Configuration options not mentioned in documentation
- Unverified technical parameters
- Speculative implementation details
- Fictional error messages or codes

### P5. Role-Playing Fact Integration

```
Even in role-playing mode, facts must be integrated.
Fictional elements only allowed when world setting explicitly specifies otherwise.
```

**Rules:**
- By default, role-playing must be based on real facts
- Fictional elements only allowed when world setting is explicitly fictional
- Must clearly distinguish "character dialogue" from "factual statements"

---

## Execution Checklist

### Before Task Execution

**Must answer these questions:**

1. **Input Source Check**
   - [ ] Does the task contain URLs or other references?
   - [ ] Have all provided URLs been read?
   - [ ] Has the actual URL content been understood?

2. **Name Ambiguity Check**
   - [ ] Does the name in the task have multiple possible entities?
   - [ ] Has the correct entity been confirmed based on URL content?
   - [ ] Have other possible interpretations been ruled out?

3. **Assumption Check**
   - [ ] Is any decision being made based on speculation?
   - [ ] Is "possibility" being treated as "fact"?
   - [ ] Is personal knowledge overriding user-provided context?

### Prompt Construction Check

**Before summoning sub-agents or generating prompts:**

```
□ Does the prompt contain terminology absent from URL content?
□ Does the prompt override user-provided context (especially URLs)?
□ Are there unverified technical details?
□ Are uncertain words like "maybe," "perhaps," "should" being used?
```

**If any answer is "Yes":**
1. Stop prompt construction immediately
2. Use `webfetch()` to read URL content
3. Reconstruct prompt based on actual content
4. Or use `question` tool to request clarification from user

### During Task Execution

**Continuous monitoring:**
- Am I adding unverified information?
- Am I speculating about technical details?
- Am I deviating from input source content?

**If problem detected:**
1. Pause task immediately
2. Revert to last known good state
3. Re-verify facts
4. Continue execution

---

## Handling Procedures

### Scenario 1: Ambiguous Name

**Situation:** Task mentions `chroma.js` with multiple URLs

```
Steps:
1. Use webfetch to read all URLs
2. Compare content to confirm actual project each URL points to
3. Determine correct project based on URL content
4. In prompts, only use terminology that appears in URL content
5. If uncertain, use question to request clarification
```

**Wrong Example:**
```
❌ Wrong: Adding "Collection," "vector" concepts because "ChromaDB is more well-known"
✅ Correct: Based on URL content, only introduce color conversion features
```

### Scenario 2: URL Content Mismatch

**Situation:** URL content doesn't match expectations after reading

```
Steps:
1. Confirm URL is correct
2. Check if URL is outdated or invalid
3. If URL is invalid, report to user and request update
4. If URL is valid but content differs, follow URL content
5. Do not replace URL content with personal knowledge
```

### Scenario 3: Need Additional Information

**Situation:** Insufficient information from URLs

```
Steps:
1. Do not fabricate or speculate
2. Use question tool to request from user:
   - More detailed explanation
   - Other reference materials
   - Specific requirement scope
```

### Scenario 4: Role-Playing Mode

**Situation:** Need to answer as specific character

```
Steps:
1. Confirm if role-playing world is fictional setting
2. If fictional setting, can use fictional elements appropriately
3. If real-world character, must base on real facts
4. Clearly distinguish "character dialogue" from "factual statements"
5. In character dialogue, can include character's subjective views
6. In factual statements, must maintain accuracy
```

---

## Error Handling & Recovery

### Detected Erroneous Task

**If discovered task executed based on wrong assumptions:**

1. **Stop immediately** - Pause all related tasks
2. **Assess impact** - Determine which outputs were affected
3. **Notify user** - Clearly explain error cause and impact scope
4. **Restart** - Re-execute task based on correct facts
5. **Document learning** - Record error case to avoid repetition

### Fabricated Content Already Output

**If fabricated content has already been output:**

1. **Admit error** - Clearly identify which content is fabricated
2. **Provide correct information** - Give fact-based correct content
3. **Apologize and correct** - Apologize to user and provide corrected version
4. **Analyze cause** - Explain why fabrication occurred (e.g., insufficient info, over-inference)

---

## Case Studies

### Case 1: chroma.js Confusion

**Original Task:**
```
User: Introduce chroma.js in detail
Provides URLs: https://gka.github.io/chroma.js/
              https://github.com/gka/chroma.js
```

**Wrong Handling:**
```
❌ Wrong:
1. Thought ChromaDB is more well-known
2. Added "Collection," "vector" concepts in prompt
3. Sub-agent researched based on ChromaDB prompt, not URL content

✅ Correct:
1. Immediately webfetch both URLs
2. Confirm it's a "color conversion library"
3. When constructing prompt, only use terminology from URL content
4. If still uncertain, directly ask: "Do you mean the color conversion library chroma.js or the vector database ChromaDB?"
```

### Case 2: Fabricated API Method

**Wrong Example:**
```
User: How to make request with axios?
Agent: axios.post(url, data, { timeout: 5000, retry: 3 })
(Problem: axios doesn't have retry parameter by default - this is fabricated)
```

**Correct Approach:**
```
1. Check axios documentation or use known knowledge
2. Only mention options that exist in documentation
3. If retry functionality needed, explain need for third-party library (e.g., axios-retry)
4. Do not invent non-existent parameters
```

### Case 3: Fact Distortion in Role-Play

**Wrong Example:**
```
User: Assume you're a scientist in 1950, talk about quantum mechanics
Agent: As a 1950 scientist, I believe quantum entanglement allows faster-than-light communication...
(Problem: Even in role-play, should not spread debunked theories)
```

**Correct Approach:**
```
1. Role-play based on scientific consensus of 1950
2. Clearly mark "views at that time" vs "modern understanding"
3. Do not present wrong theories as facts
4. Can add: "According to modern science, we now know..."
```

### Case 4: GitHub URL Repository Resolution Error

**Original Task:**
```
User: Please check github.com/anomalyco/opencode/issues/24444
Context: Agent is currently in the OpenCode/OpenCode repository
```

**Wrong Handling:**
```
❌ Wrong approach:
1. Sees GitHub URL and assumes it exists in "current repository"
2. Runs: gh issue view 24444 (without -R flag)
3. Result: Looks in wrong repository, cannot find the issue
4. Root cause: Assumed "current working directory" as default repo, ignoring org/repo explicitly provided in URL

✅ Correct approach:
1. Parse URL: github.com/anomalyco/opencode/issues/24444
2. Extract repository info: owner=anomalyco, repo=opencode
3. Run: gh issue view 24444 -R anomalyco/opencode
4. Principle: URL's org/repo is authoritative, not current working directory
```

**Error Pattern:**
- Ignores explicitly provided context (org/repo) in URL
- Makes assumption based on "current location" rather than input source
- Projects personal workflow habits onto all scenarios

**Correct Principle:**
- Follow URL parsing result
- Never assume resource exists in current repository
- All GitHub operations should explicitly specify `-R owner/repo`

**Reference:**
- See [references/github-url-resolution.md](./references/github-url-resolution.md) for complete GitHub URL resolution rules

### Case 5: Git Commit Process Assumption Errors

**Context:**
```
Task: Commit changes for factual-accuracy-guard skill
Modified files:
- skills/factual-accuracy-guard/SKILL.md (+37 lines)
- skills/factual-accuracy-guard/SKILL_en.md (+37 lines)
- skills/factual-accuracy-guard/references/github-url-resolution.md (new)
```

**Issue 2: Not Explicitly Specifying Commit Paths**

```
❌ Wrong approach:
git commit -m "feat(skills/factual-accuracy-guard): add Case 4"

Problems:
1. No pathspec, git commits "all staged" changes
2. May include changes from other agents/programs
3. Unclear commit scope, risk of git state inconsistency

✅ Correct approach:
git commit skills/factual-accuracy-guard/SKILL.md \
            skills/factual-accuracy-guard/SKILL_en.md \
            skills/factual-accuracy-guard/references/github-url-resolution.md \
            -m "feat(skills/factual-accuracy-guard): add Case 4 - GitHub URL repository resolution error"
```

**Issue 3: Commit Message Based on Guesswork**

```
❌ Wrong approach:
Writing commit message without checking git diff --cached

Problems:
1. Assumes file state matches memory
2. Commit message may be inaccurate (e.g., "add skill" when actually "add case")
3. Violates Conventional Commits precision requirement

✅ Correct approach:
# Step 1: Check actual change statistics
git diff --cached --stat

# Output:
#  skills/factual-accuracy-guard/SKILL.md             | 37 ++++++++++
#  skills/factual-accuracy-guard/SKILL_en.md          | 37 ++++++++++
#  .../references/github-url-resolution.md            | 85 ++++++++++++++++++++++
#  3 files changed, 159 insertions(+)

# Step 2: Write precise message based on actual stats
git commit ... -m "feat(skills/factual-accuracy-guard): add Case 4 - GitHub URL repository resolution error"
```

**Issue 4: Incorrect Command Syntax (Missing Pathspec Position)**

```
❌ Wrong approach:
git commit -m "msg" skills/factual-accuracy-guard/

Problem: pathspec must come before -m, git cannot parse

✅ Correct approach:
git commit <file1> <file2> <file3> -m "msg"
# Or use -- separator
git commit -- skills/factual-accuracy-guard/ -m "msg"
```

**Error Pattern Summary:**
- Based on "memory" or "guess" rather than "actual git status"
- Ignoring authority of `git diff --cached`
- Not understanding git commit pathspec position requirement
- Not explicitly isolating commit scope in multi-agent environment

**Correct Principle (Applying P1. Input Source Authority):**
- **git status/diff is input source**: actual file state is sole authority
- **Don't base on guesses**: don't assume "I remember which files I changed"
- **Explicitly specify paths**: always list full paths to commit
- **Check before commit**: `git diff --cached --stat` is mandatory step

**Connection to Factual Accuracy:**
This case illustrates **P1. Input Source Authority** in version control:
- ❌ Based on personal memory (guess)
- ✅ Based on `git diff --cached` (fact)
- ❌ Assumes git "knows" what I want to commit
- ✅ Explicitly tells git what to commit (pathspec)

**Reference:**
- See [references/git-commit-issues.md](./references/git-commit-issues.md) for complete issue documentation and analysis

### Case 6: Submitting Without Explicit Authorization (One-Time Command Misuse)

**Full Context:**
```
Timeline:
- T1: In a previous task, user said "commit these changes" (one-time command)
- T2: Current task - Add Case 5 to factual-accuracy-guard skill
- T3: After completing, user said "hold submission, I need to review content"
- T4: Agent reviewed content, without new explicit authorization, unilaterally executed git commit

Wrong Assumptions:
- Treating "T1 instruction" as "still valid at T4" (previous permission = current permission)
- Misinterpreting "hold" as "review then auto-decide"
- Treating commit command as "continuous permission" rather than "one-time instruction"
```

**Wrong Handling:**
```
❌ Wrong approach:
1. User says "hold submission, I need to review"
2. Agent reviews content, judges "looks okay"
3. Without explicit authorization, executes git commit
4. Root cause:
   - Misinterpreted "hold" as "review then auto-submit"
   - Applied "previous instruction" to current operation (lack of current authorization)

✅ Correct approach:
1. User says "hold" → stop all submission operations, enter WAITING state
2. Wait for user's explicit instruction (e.g., "confirm submission", "you may commit")
3. Only execute commit after receiving "clear, present" directive
4. After commit completes, permission expires, return to WAITING state
5. Principle: Final operations require explicit, present authorization
```

**Error Pattern:**
- **Command validity confusion**: Treating one-time command as continuously valid
- **Context contamination**: Applying previous task's context to current task
- **State machine error**: Not correctly handling "hold" state (should stay in WAITING, not auto-transition to EXECUTING)
- **Permission model error**: Confusing "one-time authorization" with "continuous permission"

**Correct Principle (Applying P1. Input Source Authority):**
- **Current explicit instruction is input source**: Only "current" commit command authorizes
- **"Hold" = stop and wait**: Not "auto-continue later"
- **One-time command principle**: Each commit is independent, expires after use
- **No implicit continuation**: Previous instructions don't automatically extend (unless explicitly stated "all future changes auto-commit")

**Connection to Factual Accuracy:**
This case illustrates **P1. Input Source Authority** in **temporal dimension**:

| Dimension | Wrong Approach | Correct Approach |
|-----------|----------------|------------------|
| **Time** | Based on "previous instruction" (historical) | Based on "current explicit instruction" (fact) |
| **Authorization** | Treating permission as "continuous" (state) | Treating permission as "one-time event" (consume & expire) |
| **State Machine** | WAITING → (self-judgment) → EXECUTING | WAITING → (explicit instruction) → APPROVED → EXECUTING |

**Core Lesson:**
> In dynamic interaction, "last time's permission" ≠ "this time's permission".
> Every operation must be based on **current, explicit** input source.

**Relation to Cases 2-5:**
- Cases 2-5: Based on "personal guess" vs "objective fact" (git status)
- **Case 6**: Based on "previous instruction" vs "current instruction" (temporal guess)

All violate **P1. Input Source Authority**:
- ❌ Using "past information" as current basis (guess)
- ✅ Using "current fact" as operation basis

**Reference:**
- See [references/git-commit-issues.md](./references/git-commit-issues.md) for complete Issue 6 analysis (One-Time Command Misuse)

---

## Tool Usage Guidelines

### Proper webfetch() Usage

**When to use:**
- Task includes URLs (must use)
- Need to verify technical information
- Name ambiguity needs confirmation

**Usage:**
```typescript
// ✅ Correct: Get content before deciding
const content = await webfetch('https://example.com/docs');
// Construct prompt based on actual content

// ❌ Wrong: Acting without reading URL
const result = await subAgent(`Introduce content from ${url}`);
// Should read URL first, understand content, then decide how to introduce
```

### Appropriate question() Usage

**When to use:**
- URL is invalid or outdated
- Name ambiguity cannot be resolved
- Insufficient information to continue
- Need to confirm user intent

**Usage:**
```typescript
// ✅ Correct: Ask for clarification directly
await question({
    question: 'chroma.js has two common projects:\n1. Color conversion library (gka/chroma.js)\n2. Vector database (chroma-core/chromadb)\nWhich one do you mean?',
    follow_up: [
        { text: 'Color conversion library', mode: null },
        { text: 'Vector database', mode: null },
    ]
});
```

---

## Self-Monitoring Mechanism

### Red Flags

**When these signs appear, STOP and verify immediately:**

1. **Using uncertain words like "maybe," "perhaps," "should"**
   - Indicates uncertainty - needs verification

2. **Mentioning proper nouns not in input source**
   - Check if coming from personal knowledge rather than current task

3. **Feeling "I know this well" and skipping verification**
   - Familiarity should not replace verification

4. **Attempting to "add" information not in input source**
   - Adding = fabricating

5. **Making assumptions based on "usually"**
   - Every project can be different

### Self-Questioning

**Ask yourself at each decision point:**

```
1. Does the judgment I'm making have evidence from the input source?
2. Would I know this information without the URL?
3. Am I projecting "my knowledge" onto the current task?
4. Does the user's data support my conclusion?
5. If I were the user, would I find this output accurate?
```

---

## Consequences & Improvement

### Consequences of Violating Principles

- **Task failure** - Executing invalid or wrong tasks
- **Loss of user trust** - Providing inaccurate information
- **Wasted time** - Effort spent on wrong direction
- **Quality degradation** - Unreliable output quality

### Continuous Improvement

1. **Document error cases** - Keep personal error log
2. **Analyze root cause** - Why did fabrication occur?
3. **Develop preventive measures** - Targeted improvement of verification process
4. **Regularly review principles** - Strengthen fact-checking awareness

---

## Quick Reference

### Must Do

✅ **Must do:**
- Read all provided URLs
- Construct prompts based on actual URL content
- Ask user for clarification when unclear
- Distinguish facts from speculation
- Mark role-playing content

### Must Not Do

❌ **Must not do:**
- Add concepts absent from URL content
- Deviate from user-provided context due to "popularity"
- Make up methods, parameters, options
- Treat guesses as facts
- Execute tasks without verification

---

## Summary

> **AI should "execute tasks based on input," not "execute tasks based on guesses."**

**Core Beliefs:**
- Input source is the sole authority
- When unclear, ask - don't guess
- Fabrication is the greatest error
- Fact-checking is mandatory at every step

---

## Related Resources

- [agent-task-execution-rules.md](../../rules/agent-task-execution-rules.md) - Original case reference
- [unimplemented-code-handling-rules.md](../../rules/unimplemented-code-handling-rules.md) - Unimplemented code handling rules
- [comment-format-rules.md](../../rules/comment-format-rules.md) - Comment format specifications
- [references/github-url-resolution.md](./references/github-url-resolution.md) - Complete GitHub URL resolution rules
- [references/git-commit-issues.md](./references/git-commit-issues.md) - Git commit process issues documentation (Cases 5 & 6)
