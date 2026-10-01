---
title: References for Code Refactoring - Miscellaneous
description: Reference materials for TypeScript/Node.js refactoring patterns and best practices
tags:
  - documentation/references
  - refactoring
  - TypeScript
  - nodejs
  - documentation/index
---

# References for Code Refactoring - Miscellaneous

This directory contains reference materials that supplement the main [code-refactoring-miscellaneous](../SKILL.md) skill. These references provide detailed information on specific patterns, techniques, and best practices.

## Available References

- [css/css-refactoring-guide.md](./css/css-refactoring-guide.md) - CSS refactoring guide: extracting shared style values into CSS custom properties or SCSS variables (SSoT) to prevent style drift when modifying styles or adding new effects
- [react/storybook/storybook-decorator-fixture-refactoring.md](./react/storybook/storybook-decorator-fixture-refactoring.md) - Storybook refactoring guide: shared decorators, single same-origin root decorator with shared style loading, categorized fixture data extraction, and multi-level meta.title sidebar organization
- [dom-selector-enum-pattern.md](./dom-selector-enum-pattern.md) - Refactoring scattered hardcoded DOM IDs and CSS class selectors into unified Enum management
- [react-state-ref-memo-decision-guide.md](./react/react-state-ref-memo-decision-guide.md) - Decision guide for choosing State / RefObject / `IRefObjectMaybe<T>` / useMemo during React refactoring, with decision matrix and refactoring workflow
- [react-state-ref-memo-refactoring.md](./react/react-state-ref-memo-refactoring.md) - Complete case study of refactoring a React Hook from excessive useState to optimized State + RefObject + useMemo pattern

## How to Use These References

### During Refactoring
1. Identify the refactoring challenge or pattern you're dealing with
2. Look for relevant patterns in these reference documents
3. Apply the patterns to your codebase
4. Test thoroughly to ensure correctness

### As Learning Material
- Study patterns before encountering them in code
- Understand the "why" behind each pattern
- Practice implementing patterns in isolation
- Share knowledge with team members

## Adding New References

When adding new reference materials:
1. Create a new markdown file in this directory
2. Include YAML frontmatter with title and description
3. Provide clear examples (before/after patterns)
4. Explain the reasoning behind each pattern
5. Link to the main SKILL.md file
6. Update this README to include the new reference

## Related Resources

- [Main Skill Documentation](../SKILL.md) - Core refactoring guidance
- [TypeScript Official Documentation](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Refactoring by Martin Fowler](https://refactoring.com/)

## Contributing

If you encounter patterns or scenarios that aren't covered:
1. Document the pattern with before/after examples
2. Explain the problem and solution clearly
3. Add to this reference collection
4. Consider submitting a pull request

## License

These reference materials follow the same licensing as the main skill documentation.