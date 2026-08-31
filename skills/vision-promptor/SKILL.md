---
name: vision-promptor
description: |-
  Guide for crafting effective text-to-image prompts and expanding short user ideas into detailed, production-ready image-generation prompts. Use when users request prompt engineering for AI image generation, vision prompts, image prompts, Krea prompts, or ask to expand/enhance a prompt for text-to-image models.

  Triggers when user mentions:
  - "image prompt" / "generate an image" / "text-to-image prompt"
  - "prompt engineering" / "prompt expand" / "enhance my prompt"
  - "Krea" / "Krea 2" / "turbo model"
  - "vision promptor" / "vision prompting"
  - "AI art prompt" / "generate art with prompts"
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
---

# Vision Promptor

## What I Do

- Guide users on writing natural-language prompts for text-to-image models (e.g. Krea turbo model, Z-Image, Illustrious, ... etc.)
- Expand short or vague prompts into longer, detailed, production-ready prompts
- Provide prompting best practices and real-world examples

## Resources

- [references/prompting.md](references/prompting.md) — Prompting guidelines, best practices, and 20 example prompts with sample outputs
- [references/expansion.txt](references/expansion.txt) — System prompt for LLM-assisted prompt expansion

## Workflow

### 1. Consult the Prompting Guidelines

Read [references/prompting.md](references/prompting.md) for:

- Best practices for natural-language image prompts
- Resolution and model considerations (turbo model supports up to 2k resolution)
- 20 detailed example prompts covering diverse styles and subjects

### 2. Expand User Prompts

If the user wants to enhance a short prompt, use [references/expansion.txt](references/expansion.txt) as a system prompt for an LLM. This expansion follows these rules:

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