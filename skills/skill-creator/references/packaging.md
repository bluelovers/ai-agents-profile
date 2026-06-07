# Skill Packaging, Installation, and Updates

This reference covers how to package a skill into a distributable `.skill` file, and how to handle updates when the skill is already installed in a read-only location.

## Prerequisites

- Python must be available in the environment.
- The skill directory must contain a valid `SKILL.md` with proper YAML frontmatter.

## Packaging a Skill

Run the packaging script from the skill-creator directory:

```bash
scripts/package_skill.py <path/to/skill-folder>
```

Optional output directory:

```bash
scripts/package_skill.py <path/to/skill-folder> ./dist
```

The script will:

1. **Validate** the skill, checking:
   - YAML frontmatter format and required fields
   - Skill naming conventions and directory structure
   - Description completeness and quality
   - File organization and resource references

2. **Package** the skill if validation passes, creating a `.skill` file named after the skill (e.g., `my-skill.skill`). The `.skill` file is a zip file with a `.skill` extension.

If validation fails, the script reports the errors and exits without creating a package. Fix any validation errors and run the packaging command again.

## Updating an Existing Skill

When the user asks to update a skill that is already installed:

- **Preserve the original name.** Keep the directory name and `name` frontmatter field unchanged. E.g., if the installed skill is `research-helper`, output `research-helper.skill` (not `research-helper-v2`).
- **Copy to a writable location before editing.** The installed skill path may be read-only. Copy to `/tmp/<skill-name>/`, edit there, and package from the copy.
- **Stage in `/tmp/` first if needed.** When packaging, write to `/tmp/` first, then copy the `.skill` file to the output directory to avoid permission errors.

## Installing a Packaged Skill

After packaging, direct the user to the resulting `.skill` file path so they can install it using the standard skill installation process for their environment.
