/**
 * Obsidian 標籤驗證腳本
 * Obsidian Tag Validation Script
 *
 * 驗證一組標籤字串是否符合 Obsidian 的標籤格式規則：
 * - 允許字母、數字、底線 (_)、連字號 (-)、斜線 (/)、Unicode 字元
 * - 必須包含至少一個非數值字元
 *
 * Usage:
 *   tsx scripts/validate-tags.ts <tag1> <tag2> ...
 *
 * Examples:
 *   tsx scripts/validate-tags.ts "project/active" "bug" "1984"
 *   tsx scripts/validate-tags.ts "專案/進行中" "✅done"
 */

/** 有效標籤字元的正則表達式模式 */
const TAG_PATTERN = /^[\p{L}\p{N}_\-\/]+$/u;

/** Unicode 符號與 Emoji 模式（含零寬連接序列） */
const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;

/**
 * 檢查標籤是否僅包含數值字元
 * Check if tag contains only numerical characters
 *
 * @param tag - 要檢查的標籤 / Tag to check
 * @returns 是否僅為數字 / Whether it's purely numeric
 */
function isPurelyNumeric(tag: string): boolean
{
	return /^\d+$/.test(tag);
}

/**
 * 驗證單一標籤是否合法
 * Validate a single tag
 *
 * @param tag - 要驗證的標籤 / Tag to validate
 * @returns 驗證結果，包含是否合法與錯誤訊息 / Validation result with validity and error message
 */
function validateSingleTag(tag: string): { valid: boolean; error?: string }
{
	if (!tag || tag.trim().length === 0)
	{
		return { valid: false, error: "標籤不可為空 / Tag cannot be empty" };
	}

	if (isPurelyNumeric(tag))
	{
		return {
			valid: false,
			error: `標籤 "${tag}" 僅包含數字，無效 / Tag "${tag}" is purely numeric, invalid`,
		};
	}

	const hasBaseChars = TAG_PATTERN.test(tag);
	const hasEmoji = EMOJI_PATTERN.test(tag);

	if (!hasBaseChars && !hasEmoji)
	{
		return {
			valid: false,
			error: `標籤 "${tag}" 包含不允許的字元 / Tag "${tag}" contains disallowed characters`,
		};
	}

	// 檢查巢狀標籤的每一層
	const parts = tag.split("/");
	for (const part of parts)
	{
		if (part.length === 0)
		{
			return {
				valid: false,
				error: `標籤 "${tag}" 包含空的巢狀層級（連續斜線或前後斜線）/ Tag "${tag}" contains empty nested level`,
			};
		}
		if (isPurelyNumeric(part))
		{
			return {
				valid: false,
				error: `標籤 "${tag}" 的巢狀層級 "${part}" 僅包含數字 / Nested level "${part}" in tag "${tag}" is purely numeric`,
			};
		}
	}

	return { valid: true };
}

/**
 * 主程式：驗證命令列傳入的所有標籤
 * Main: validate all tags passed via command line
 */
function main(): void
{
	const args = process.argv.slice(2);

	if (args.length === 0)
	{
		console.error("用法 / Usage: tsx validate-tags.ts <tag1> <tag2> ...");
		process.exit(1);
	}

	let hasError = false;

	console.log("=== Obsidian 標籤驗證結果 / Tag Validation Results ===");
	console.log("");

	for (const tag of args)
	{
		const result = validateSingleTag(tag);
		const status = result.valid ? "✅" : "❌";
		console.log(`${status} "${tag}"`);

		if (result.valid)
		{
			console.log(`   狀態 / Status: 有效 / Valid`);
		}
		else
		{
			console.log(`   狀態 / Status: 無效 / Invalid`);
			console.log(`   原因 / Reason: ${result.error}`);
			hasError = true;
		}

		console.log("");
	}

	if (hasError)
	{
		process.exit(1);
	}
	else
	{
		console.log("所有標籤皆有效 / All tags are valid.");
	}
}

main();
