---
name: vision-promptor
description: |-
  Guide for crafting effective text-to-image prompts and expanding short user ideas into detailed, production-ready image-generation prompts. Use when users request prompt engineering for AI image generation, vision prompts, image prompts, Krea prompts, to expand/enhance a prompt for text-to-image models, to describe an image/scene/visual elements/style, to optimize prompt layout/formatting, to brainstorm prompt ideas, or to assist describing screenshots/visual media content when the model has vision capability.

  Triggers when user mentions:
  - "image prompt" / "generate an image" / "text-to-image prompt"
  - "prompt engineering" / "prompt expand" / "enhance my prompt"
  - "Krea" / "Krea 2" / "turbo model"
  - "vision promptor" / "vision prompting"
  - "AI art prompt" / "generate art with prompts"
  - "layered prompt" / "圖層式提示詞" / "空間圖層結構式提示詞" / "structured composition prompting"
  - "describe this image" / "描述圖片" / "畫面描述" / "視覺要素" / "風格描述"
  - "prompt layout" / "prompt formatting" / "提示詞排版"
  - "prompt ideas" / "suggest a prompt" / "構思提示詞" / "建議提示詞"
  - "describe screenshot" / "截圖描述" / "視覺媒體內容"
tags:
  - agents/skills/prompts
  - agents/skills/image-generation
  - image-generation
  - prompt-engineering
  - krea2
  - agents/skills
  - comfyui
  - sd-webui
  - prompts/rules
  - prompts
  - prompts/natural-language
---

# Vision Promptor

## What I Do

- Guide users on writing natural-language prompts for text-to-image models (e.g. Krea2, Krea turbo model, Z-Image, Illustrious, ... etc.)
- Expand short or vague prompts into longer, detailed, production-ready prompts
- Provide prompting best practices and real-world examples
- Guide all three prompt forms — the layered method (圖層式提示詞) for precise spatial control, the fluent narrative paragraph method (段落式提示詞／敘事式提示詞) for cinematic atmosphere, and booru-style tags (標籤式提示詞) for tag-based models — and how to mix them

## 適用場景 (Use Cases)

包含但不限於 (including but not limited to):

- **要求描述圖片／畫面／視覺要素／風格** — describing an image, scene, visual elements, or art style on request
- **輔助描述畫面截圖／視覺媒體內容** — even when the model itself has vision capability, use this skill to structure and polish its descriptions of screenshots, stills, and other visual media (visual-element breakdown, style identification, wording)
- **提示詞排版優化** — optimizing prompt layout: line breaks, blank lines, grouping, and overall structure
- **構思建議提示詞** — brainstorming and proposing prompt ideas from a short idea, reference, or requirement
- Natural-language prompt writing, expansion, and best practices (see What I Do above)
- Choosing and mixing the three prompt forms (see Three Prompt Forms below)

## Resources


- [references/np-spatial-layer-structured.md](references/np-spatial-layer-structured.md) — 圖層式提示詞 (Spatial-Layer-Structured Prompting) full specification: template, mandatory rules, pitfalls, applicability, and checklist
- [references/np-fluent-narrative-paragraph.md](references/np-fluent-narrative-paragraph.md) — 段落式提示詞 (Fluent Narrative Paragraph / Natural Language Paragraph): template, mandatory rules, layout rules (line breaks & blank lines), and relation to the layered method
- [references/tp-booru-style-tags.md](references/tp-booru-style-tags.md) — 標籤式提示詞 (Booru-style Tags / Token-weighted Tags): ordered tag listing, template, and applicable scenarios
- [references/mp-prompts-merge-001.md](references/mp-prompts-merge-001.md) — Merge prompt technique: base prompt + `[PROMPT]` slot for modular, swappable character/scenario insertion with zero re-tuning
- [references/dy-dynamic-prompts.md](references/dy-dynamic-prompts.md) — Dynamic Prompts concept: `{a|b|c}` = pick one of a/b/c, `{a|b|c|}` = also allows blank;

- [references/prompts/README.md](references/prompts/README.md) — **Prompt examples index (範例索引)**: all example files by category (layered / narrative / tags / demi-human modules / style mix / thematic collections)
- [references/expansion.txt](references/expansion.txt) — System prompt for LLM-assisted prompt expansion

## Three Prompt Forms (三型提示詞)

| Form | Strengths | Guide |
| --- | --- | --- |
| Layered — 圖層式提示詞 | precise spatial control, object placement | [references/np-spatial-layer-structured.md](references/np-spatial-layer-structured.md) |
| Narrative paragraph — 段落式提示詞／敘事式提示詞 | lighting, atmosphere, cinematic feel | [references/np-fluent-narrative-paragraph.md](references/np-fluent-narrative-paragraph.md) |
| Tags — 標籤式提示詞 | compatibility with tag-based (booru / sd1.5) models | [references/tp-booru-style-tags.md](references/tp-booru-style-tags.md) |

**Shared principles:**

- **Not mutually exclusive (非互斥)** — the three forms are on the same spectrum and can be mixed: a tag list with a narrative atmosphere closing; layered blocks filled with tags; a narrative opening followed by layered blocks …
- **Segmentation & line breaks (分段與分行)** — in practice, **no matter which form (layered / narrative / tags), prompts need paragraph breaks and line breaks**: group content by theme, break over-long logical lines at sentence/theme boundaries, and keep each section readable. Details in each guide's layout rules (use `#` to preserve blank lines if an editor swallows them; `# ---` as a separator when needed).
  **Impact note:** whether a prompt is line-broken has **little effect on the generated image itself** — its value is for **humans: readability (閱讀性) and replaceability (可替換性)**; line breaks and blank lines mark module boundaries, making structure scannable and whole-block replacement easy.

## People Versions Rule (人物三版本規則)

**When the user gives a prompt that may contain people/characters, or when the request may directly or indirectly generate a prompt containing people** (使用者給予的提示詞可能包含人物，或要求可能直接／間接生成包含人物的提示詞時), deliver **all three versions at once** (同時給予以下三個版本)：

1. **無人物版本 (No-people version)** — remove characters entirely; keep the scene readable via **positive state description** (e.g. `empty tables and drifting smoke emphasize calm after activity`), never via negative phrasing
2. **有人物版本 (With-people version)** — characters present but composed as part of the scene, not the focal point; follow *Respect the Human Form* (assume clothing coverage, depict with dignity)
3. **人物為焦點／主體版本 (People-as-focus version)** — characters as the clear subject of the composition, with the scene, framing, and lighting arranged around them

**Notes:**

- The three versions share the same scene skeleton — only the **presence and weight of people** changes
- All versions still obey the shared rules above (no negative phrasing, segmentation & line breaks, Faithfulness First, Respect the Human Form)
- **Original-version notice (同版提醒)** — if a delivered version is the same as the user's original prompt, **explicitly remind the user that this version is the original version** (提醒該版本為原始版本).
  - 判定標準：僅調整排版（分行、分段、空白）而**未更動／增減內容** → **視為等同原始版本**，同樣須提醒
  - 符號修正與錯字修正**允許**，不影響此判定（仍視為等同原始版本）

## Workflow

### 0. Browse the Examples Index (可選)

Need a starting point or a pattern to imitate? Scan [references/prompts/README.md](references/prompts/README.md) — the examples index lists every example file by form (layered / narrative / tags / style mix) with its ID scheme and next available number.

### 1. Consult the Prompting Guidelines

Read [references/prompts/np-prompting.md](references/prompts/np-prompting.md) for:

- Best practices for natural-language image prompts
- Resolution and model considerations (turbo model supports up to 2k resolution)
- 20 detailed example prompts covering diverse styles and subjects

### 2. Expand User Prompts

If the user wants to enhance a short prompt, use [references/expansion.txt](references/expansion.txt) as a system prompt for an LLM. For scenes that need precise spatial control, also apply the structured method in step 4. **If people/characters may be involved (directly or indirectly), also deliver all three people versions — see People Versions Rule above.** This expansion follows these rules:

- **Faithfulness First** — Preserve all original subjects, actions, colors, and spatial relationships
- **Practical T2I Structure** — Group subjects with attributes; use grounded phrasing
- **Style Planning Stays Internal** — Reason about style, medium, framing internally; don't emit tags
- **Text Rendering** — Wrap requested visible text in quotes
- **Avoid Over-Specification** — Don't invent details not implied by the input
- **Respect Existing Detail** — Lightly polish already-detailed prompts
- **Respect the Human Form** — Treat people with dignity; assume clothing coverage
- **Preserve User Medium** — Honor explicit medium requests (photo, illustration, painting, etc.)

### 3. Output Format

After expansion, return a single cohesive prompt paragraph (no bullets, JSON, or markdown formatting).

### 4. Spatial-Layer-Structured Scene Prompts (圖層式提示詞)

When a request needs **precise spatial control** — multi-layer architecture, interior layouts, game scene concept art, or scenes with many objects that must stay in specific zones — apply the layer-based method instead of (or on top of) plain expansion.

Read [references/np-spatial-layer-structured.md](references/np-spatial-layer-structured.md) for the detailed specification:

- **Core idea** — Global Context & View Angle → layered blocks → Atmosphere closing
- **Standard template** — the four-part structure with fill-in slots
- **Three mandatory rules** — lens locking in the prefix; layout & negative space inside every layer (never a bare object list); standardized block tags with at least two anchors
- **Layer dimensions** — Where / What / How for each layer
- **Common pitfall & fix** — object-list-only layers vs. compositional guidance, with before/after examples
- **Applicability & checklist** — when to use it, plus a pre-send review checklist

Then browse [references/prompts/np-spatial-layer-structured-example.md](references/prompts/np-spatial-layer-structured-example.md) for classified examples (depth axis / floors / functional zones / mixed / uncategorized), each with a short Chinese description.