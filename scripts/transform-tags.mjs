/**
 * Tags 結構轉換腳本
 * 根據使用者提供的映射規則，批次更新所有 markdown 檔案的 frontmatter tags
 */
/// <reference types="node" />

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";

// ==================== 設定 ====================

const ROOT = "D:\\Users\\WebstormProjects\\ai-agent\\ai-agents-profile";

const TARGET_DIRS = ["skills", "rules", "docs"];

/** 技能/rules 名稱 - 這些不應該作為 tags */
const SKILL_NAMES = new Set([
  "agent-behavior-standardization",
  "agent-detect-shell",
  "agent-get-tool-definitions",
  "agent-script-execution",
  "analyze-code-commenter",
  "browser-automation",
  "code-refactoring-expert",
  "code-refactoring-expert-typescript",
  "code-refactoring-miscellaneous",
  "comment-format-rules-css",
  "context7-mcp",
  "doc-refactor-doc-optimization",
  "factual-accuracy-guard",
  "js-git-friendly-coding-style",
  "mcp-obsidian-guides",
  "nodejs-module-path",
  "nodejs-readme-updater",
  "obsidian-fm-tags",
  "opencode-newbie-agent-guides",
  "opencode-tool-guides",
  "openspec-apply-change",
  "openspec-archive-change",
  "openspec-explore",
  "openspec-propose",
  "readme-updater",
  "skill-creator",
  "test-js-mock",
  "test-snapshot-documentation",
  "typescript-config",
  "typescript-unimplemented-handler",
  "webstorm-mcp",
]);

/**
 * 標籤轉換映射 (舊 → 新)
 */
const TAG_MAP = new Map([
  // TypeScript 相關
  ["tsconfig", "typescript/tsconfig"],
  ["compiler-options", "typescript/tsconfig/compiler-options"],
  ["tsx", "typescript/tsx"],
  ["type-reflection", "typescript/type-reflection"],
  ["version-6", "typescript/v6"],

  // 測試相關
  ["mocking", "testing/mock"],
  ["snapshot", "testing/snapshot"],
  ["jest", "testing/jest"],
  ["vitest", "testing/vitest"],

  // Agent / Skills 相關
  ["skill-creation", "agents/skills/skill-creation"],
  ["agent-development", "agents/core"],
  ["agent-guides", "agents/guidelines"],
  ["agent-behavior", "agents/behavior"],
  ["agent-detect-shell", "env/shell"],
  ["tool-definitions", "agents/tools/tool-definitions"],
  ["tool-usage", "agents/tools/tool-usage"],
  ["system-prompt", "agents/prompts/system-prompts"],

  // Agents 通用
  ["standardization", "agents/guidelines"],
  ["guidelines", "agents/guidelines"],
  ["best-practices", "agents/guidelines"],
  ["rules", "agents/rules"],
  ["instructions", "agents/rules"],
  ["tools", "agents/tools"],
  ["agent-instructions", "agents/guidelines"],

  // 環境
  ["shell", "env/shell"],
  ["environment-detection", "env/detection"],

  // 註解
  ["code-comments", "comments"],

  // Markdown
  ["frontmatter", "markdown/frontmatter"],

  // Node.js
  ["module-resolution", "nodejs/module-resolution"],
  ["npm", "nodejs/package-management/npm"],
  ["pnpm", "nodejs/package-management/pnpm"],
  ["yarn", "nodejs/package-management/yarn"],
  ["package-management", "nodejs/package-management"],
  ["Node.js", "nodejs"],

  // CSS
  ["SCSS", "css/SCSS"],

  // 編碼風格
  ["Allman", "coding-style/Allman"],

  // Git
  ["commit", "git/commit"],

  // VS Code
  ["VS-Code", "vscode"],

  // JetBrains
  ["webstorm", "jetbrains/webstorm"],

  // 文件
  ["docs", "documentation"],
  ["reference", "documentation/references"],
  ["guide", "guidelines"],

  // 通用
  ["workflow", "agents/workflow"],
]);

/**
 * 轉換單一標籤
 */
function transformTag(tag) {
  const mapped = TAG_MAP.get(tag);
  if (mapped) return mapped;
  if (SKILL_NAMES.has(tag)) return null;
  return tag;
}

/**
 * 遞迴收集所有 .md 檔案
 */
function collectFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * 處理 frontmatter 中的 tags
 */
function processTags(tags, isSkillFile, isReferenceFile) {
  const result = [];

  for (const tag of tags) {
    const transformed = transformTag(tag);
    if (transformed && !result.includes(transformed)) {
      result.push(transformed);
    }
  }

  if (isSkillFile && !result.includes("agents/skills")) {
    result.push("agents/skills");
  }
  if (isReferenceFile && !result.includes("documentation/references")) {
    result.push("documentation/references");
  }

  return result;
}

/**
 * 處理單一檔案
 */
function processFile(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const relativePath = filePath.replace(ROOT + sep, "").replace(/\\/g, "/");

  if (!content.startsWith("---")) {
    console.log(`  ⏭️  無 frontmatter: ${relativePath}`);
    return;
  }

  const endIndex = content.indexOf("---", 3);
  if (endIndex === -1) {
    console.log(`  ⚠️  不完整 frontmatter: ${relativePath}`);
    return;
  }

  const frontmatter = content.slice(0, endIndex + 3);
  const body = content.slice(endIndex + 3);

  if (!frontmatter.includes("\ntags:")) {
    console.log(`  ⏭️  無 tags: ${relativePath}`);
    return;
  }

  // 解析 tags
  const lines = frontmatter.split("\n");
  const tagLines = [];
  let inTags = false;

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimStart();

    if (trimmed.startsWith("tags:") && !inTags) {
      inTags = true;
      continue;
    }

    if (inTags) {
      if (trimmed.startsWith("- ")) {
        tagLines.push(i);
      } else if (trimmed === "" || trimmed.startsWith("---")) {
        break;
      } else if (!trimmed.startsWith("#") && !trimmed.startsWith(" ")) {
        // 新的頂層 key
        break;
      }
    }
  }

  if (tagLines.length === 0) {
    console.log(`  ⏭️  空的 tags: ${relativePath}`);
    return;
  }

  const currentTags = tagLines.map(i => lines[i].trim().slice(2).trim());

  const isSkillFile = /\/SKILL\.md$/.test(relativePath);
  const isReferenceFile = /\/(?:references|test-file-best-practices|unimplemented-code-handling-references)\//.test(relativePath);

  const newTags = processTags(currentTags, isSkillFile, isReferenceFile);

  if (newTags.length === 0) {
    console.log(`  ⚠️  tags 全被移除: ${relativePath}`);
  }

  // 重建: 先移除所有舊的 tag 行 (從後往前)
  const sortedLines = [...tagLines].sort((a, b) => b - a);
  for (const i of sortedLines) {
    lines.splice(i, 1);
  }

  // 找到 tags: 行
  let tagsKeyLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith("tags:")) {
      tagsKeyLine = i;
      break;
    }
  }

  if (tagsKeyLine === -1) return;

  // 重新建立 tags 區塊
  const newTagLines = newTags.map(t => `  - ${t}`);
  lines[tagsKeyLine] = "tags:";
  lines.splice(tagsKeyLine + 1, 0, ...newTagLines);

  const newContent = lines.join("\n") + body;
  writeFileSync(filePath, newContent, "utf-8");
  console.log(`  ✅ ${relativePath}`);
  if (newTags.length > 0) {
    console.log(`     ${JSON.stringify(newTags)}`);
  }
}

// ==================== 主程式 ====================

let allFiles = [];
for (const dir of TARGET_DIRS) {
  const fullDir = join(ROOT, dir);
  if (statSync(fullDir, { throwIfNoEntry: false })) {
    allFiles.push(...collectFiles(fullDir));
  }
}

console.log(`找到 ${allFiles.length} 個 .md 檔案\n`);

for (const file of allFiles) {
  processFile(file);
}

console.log("\n✅ 完成!");
