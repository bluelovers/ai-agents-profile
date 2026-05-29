/**
 * Obsidian Frontmatter Tags 提取腳本
 * Obsidian Frontmatter Tags Extraction Script
 *
 * 從 Obsidian markdown 檔案的 frontmatter 中提取 tags 陣列。
 *
 * Usage:
 *   tsx scripts/extract-tags.ts <file-path>
 *
 * Examples:
 *   tsx scripts/extract-tags.ts "path/to/note.md"
 *   tsx scripts/extract-tags.ts "C:/vault/notes/my-note.md"
 */
/// <reference types="node" />

import { readFileSync, existsSync } from "fs";

/**
 * 從 markdown 內容中提取 frontmatter 區塊
 * Extract frontmatter block from markdown content
 *
 * @param content - markdown 檔案內容 / Markdown file content
 * @returns frontmatter 字串，若不存在則為 null / Frontmatter string or null
 */
function extractFrontmatter(content: string): string | null
{
	const match = content.match(/^---\s*\n([\s\S]*?)\n---/);

	if (!match)
	{
		return null;
	}

	return match[1];
}

/**
 * 從 frontmatter 字串中解析 tags 陣列
 * Parse tags array from frontmatter string
 *
 * @param frontmatter - frontmatter YAML 字串 / Frontmatter YAML string
 * @returns 標籤陣列 / Array of tags
 */
function parseTags(frontmatter: string): string[]
{
	const tags: string[] = [];

	// 匹配行內陣列格式: tags: [tag1, tag2, ...]
	const inlineMatch = frontmatter.match(/^tags:\s*\[([^\]]*)\]/m);

	if (inlineMatch)
	{
		const items = inlineMatch[1].split(",").map(s => s.trim().replace(/^['"]|['"]$/g, ""));

		return items.filter(s => s.length > 0);
	}

	// 匹配多行列表格式: tags:\n  - tag1\n  - tag2
	const listRegex = /^tags:\s*$/m;
	const listMatch = frontmatter.match(listRegex);

	if (listMatch)
	{
		const afterTags = frontmatter.slice(listMatch.index! + listMatch[0].length);
		const listItemRegex = /^\s+-\s+(.+)$/gm;
		let item: RegExpExecArray | null;

		while ((item = listItemRegex.exec(afterTags)) !== null)
		{
			const tag = item[1].trim().replace(/^['"]|['"]$/g, "");

			if (tag.length > 0)
			{
				tags.push(tag);
			}
		}
	}

	return tags;
}

/**
 * 從檔案路徑讀取並提取 tags
 * Read file and extract tags
 *
 * @param filePath - markdown 檔案路徑 / Markdown file path
 */
function extractTagsFromFile(filePath: string): void
{
	if (!existsSync(filePath))
	{
		console.error(`❌ File not found: ${filePath}`);
		process.exit(1);
	}

	const content = readFileSync(filePath, "utf-8");
	const frontmatter = extractFrontmatter(content);

	if (!frontmatter)
	{
		console.log(`ℹ️  File "${filePath}" has no frontmatter block`);
		process.exit(0);
	}

	const tags = parseTags(frontmatter);

	if (tags.length === 0)
	{
		console.log(`ℹ️  No tags found in frontmatter of "${filePath}"`);
		process.exit(0);
	}

	console.log(`=== Tag Extraction Results ===`);
	console.log(`File: ${filePath}`);
	console.log(`Tag count: ${tags.length}`);
	console.log("");
	console.log("Tag list:");

	for (const tag of tags)
	{
		console.log(`  - ${tag}`);
	}
}

// ==================== 主程式 / Main ====================

const args = process.argv.slice(2);

if (args.length === 0)
{
	console.error("Usage: tsx extract-tags.ts <file-path>");
	process.exit(1);
}

extractTagsFromFile(args[0]);
