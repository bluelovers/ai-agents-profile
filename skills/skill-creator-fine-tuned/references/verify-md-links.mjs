#!/usr/bin/env node
/**
 * Markdown 連結驗證工具 / Markdown Link Verifier
 *
 * 掃描指定根目錄下的 Markdown 檔案，驗證所有內部連結（檔案路徑與標題錨點）是否有效；
 * 外部連結（http、https、mailto 等協定）一律略過，不發起任何網路請求。
 * Scans Markdown files under a given root and verifies that every internal link
 * (file path and heading anchor) resolves. External links are skipped entirely.
 *
 * 用法 / Usage:
 *   node <script> [root-dir] [options]
 *
 * root-dir 預設為「當前工作目錄」；路徑不硬編碼於腳本中，一律於執行時傳入。
 * 腳本名稱亦於執行時自動取得（參考 convert-inline-to-block.cjs 的「自我偵測檔名」做法）。
 * The root directory defaults to the current working directory; no path is
 * hard-coded here — it is supplied at run time, and the script name is detected
 * at runtime (mirroring the "self-detected filename" style of convert-inline-to-block.cjs).
 *
 * 選項 / Options:
 *   -h, --help           顯示使用說明 / show this help
 *       --include-hidden 一併掃描隱藏目錄（預設略過 `.` 開頭的目錄）
 *                        also scan hidden directories (skipped by default)
 *
 * 範例（路徑依實際環境調整；腳本名稱執行時自動取得）/ Examples
 * (adjust paths; the script name is detected at runtime, not hard-coded):
 *   node verify-md-links.mjs /path/to/repo
 *   node verify-md-links.mjs .
 *   node verify-md-links.mjs . --include-hidden
 *
 * 驗證規則 / Verification rules:
 *   - 略過 frontmatter、程式碼區塊、行內程式碼與 HTML 註解中的連結（視為文件範例）
 *     Links inside frontmatter, code fences, inline code or HTML comments are
 *     treated as documentation examples and skipped.
 *   - 錨點依 GitHub 標題 slug 演算法產生：小寫、移除非字母數字、空白逐一轉連字號、
 *     重複標題附加 -1 序號
 *     Anchors follow GitHub's heading slug rules: lowercase, strip punctuation,
 *     each space becomes a hyphen, duplicate headings get a -1 suffix.
 *   - 路徑區分大小寫，避免在 Linux / GitHub 上 404
 *     Paths are case-sensitive to avoid breakage on Linux / GitHub.
 *   - 偵測到斷裂時自動「向上偵測」：依來源檔位置解析最終路徑，若中間目錄不存在，
 *     則向上層目錄搜尋同名檔作為候選，減少手動排查（見同目錄 verify-md-links.md）。
 *     On a broken link the script auto-suggests candidates: it resolves the path
 *     from the source file's location and, when an intermediate directory is
 *     missing, walks up to find a same-named file (see verify-md-links.md).
 *
 * 回傳碼 / Exit codes:
 *   0 = 全部通過 / all links valid
 *   1 = 發現斷裂連結 / broken links found
 *   2 = 參數或路徑錯誤 / invalid usage or bad path
 */

import {
	existsSync,
	readdirSync,
	readFileSync,
} from 'node:fs'
import {
	basename,
	join,
	relative,
	resolve,
	sep,
} from 'node:path'
import { fileURLToPath } from 'node:url'

/** 腳本自身檔名（執行時自動取得，不寫死於程式碼中）/ This script's own basename, derived at runtime (never hard-coded) */
const SELF_NAME = basename(fileURLToPath(import.meta.url))

/** 永遠略過的目錄 / Directories always skipped during traversal */
const ALWAYS_SKIP_DIRS = new Set(['node_modules', '.git'])

/** 視為外部連結的協定前綴（開頭匹配即略過驗證）/ Scheme prefixes treated as external */
const EXTERNAL_SCHEME_RE = /^[a-z][a-z0-9+.-]*:/i

/** 行內連結與圖片 / Inline links and images */
const INLINE_LINK_RE = /!?\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+["'][^"']*["'])?\s*\)/g

/** 參考式連結定義（每個定義一行）/ Reference-style link definitions (one per line) */
const REF_DEF_RE = /^\s{0,3}\[[^\]]+\]:\s*(?:<([^>]+)>|(\S+))/

/** 可能是清單項目的行首，不可作為 setext 標題的來源 / Lines that cannot seed a setext heading */
const LIST_LIKE_RE = /^\s{0,3}(?:[-*+]|\d{1,9}[.)])\s+/

/**
 * 以相對根目錄的 POSIX 風格路徑表示（Markdown 連結一律使用 `/`）
 * Express a path relative to the root in POSIX style (Markdown links always use `/`)
 */
function toRelative(root, fullPath)
{
	return relative(root, fullPath).split(sep).join('/')
}

/**
 * 遞迴收集根目錄下的所有檔案與目錄（不可達的符號連結直接略過）
 * Recursively collect every file and directory under the root (unreachable symlinks are skipped)
 */
function walk(root, current, collected, includeHidden)
{
	const entries = readdirSync(current, { withFileTypes: true })

	for (const entry of entries)
	{
		if (entry.isSymbolicLink()) continue

		const fullPath = join(current, entry.name)

		if (entry.isDirectory())
		{
			if (ALWAYS_SKIP_DIRS.has(entry.name)) continue
			if (!includeHidden && entry.name.startsWith('.')) continue

			collected.dirs.push(toRelative(root, fullPath))
			walk(root, fullPath, collected, includeHidden)
		}
		else if (entry.isFile())
		{
			collected.files.push(toRelative(root, fullPath))
		}
	}
}

/**
 * 逐行遮罩 frontmatter 與程式碼圍欄（以空字串取代，保留行號）
 * Blank out frontmatter and fenced code blocks line by line (empty string keeps line numbers)
 */
function stripFrontmatterAndFences(rawLines)
{
	const out = new Array(rawLines.length)
	let index = 0

	if (rawLines.length > 0 && rawLines[0].trim() === '---')
	{
		let close = -1

		for (let i = 1; i < rawLines.length; i++)
		{
			const trimmed = rawLines[i].trim()
			if (trimmed === '---' || trimmed === '...')
			{
				close = i
				break
			}
		}

		// 找不到收合標記時視為單純的水平線，內容全部保留
		// Without a closing marker it is an ordinary horizontal rule, so keep everything
		if (close !== -1)
		{
			for (let i = 0; i <= close; i++)
			{
				out[i] = ''
			}
			index = close + 1
		}
	}

	let inFence = false
	let fenceChar = ''

	for (; index < rawLines.length; index++)
	{
		const line = rawLines[index]
		const fence = /^\s{0,3}(`{3,}|~{3,})/.exec(line)

		if (inFence)
		{
			out[index] = ''
			// 收尾圍欄必須與開頭同字元，且整行僅有圍欄標記
			// A closing fence uses the same marker character and nothing else on the line
			if (fence && fence[1][0] === fenceChar && line.trim() === fence[1])
			{
				inFence = false
			}
			continue
		}

		if (fence)
		{
			inFence = true
			fenceChar = fence[1][0]
			out[index] = ''
			continue
		}

		out[index] = line
	}

	return out
}

/**
 * 遮罩 HTML 註解（可跨行），避免把註解內的示意連結當成真實連結
 * Mask HTML comments (which may span lines) so illustrative links are not verified
 */
function maskHtmlComments(lines)
{
	const out = new Array(lines.length)
	let inComment = false

	for (let i = 0; i < lines.length; i++)
	{
		let text = lines[i]

		if (!text)
		{
			out[i] = ''
			continue
		}

		if (inComment)
		{
			const end = text.indexOf('-->')
			if (end === -1)
			{
				out[i] = ''
				continue
			}
			text = text.slice(end + 3)
			inComment = false
		}

		let cursor = 0
		for (;;)
		{
			const start = text.indexOf('<!--', cursor)
			if (start === -1) break

			const end = text.indexOf('-->', start + 4)
			if (end === -1)
			{
				text = text.slice(0, start)
				inComment = true
				break
			}

			text = text.slice(0, start) + text.slice(end + 3)
			cursor = start
		}

		out[i] = text
	}

	return out
}

/**
 * 移除行內程式碼（以空字串取代），連結驗證不採樣本中的程式碼
 * Remove inline code spans (replaced with nothing); sample code is not link-checked
 */
function maskInlineCode(line)
{
	return line ? line.replace(/`[^`]*`/g, '') : line
}

/**
 * 準備解析結果：`body` 供標題擷取（保留行內程式碼內容），`linkSafe` 供連結擷取
 * Prepare parsed lines: `body` for headings (code text kept), `linkSafe` for links
 */
function prepareLines(content)
{
	const rawLines = content.replace(/^﻿/, '').split(/\r?\n/)
	const stripped = stripFrontmatterAndFences(rawLines)
	const body = maskHtmlComments(stripped)

	return {
		body,
		linkSafe: body.map((line) => maskInlineCode(line)),
	}
}

/**
 * 依 GitHub 演算法產生標題錨點 slug（小寫、去標點、空白轉連字號）
 * Build a heading anchor slug following GitHub's algorithm (lowercase, strip punctuation, spaces to hyphens)
 */
function slugify(text)
{
	let value = String(text)
	value = value.replace(/<[^>]*>/g, '')
	value = value.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
	value = value.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
	value = value.replace(/\[([^\]]*)\]\[[^\]]*\]/g, '$1')
	// 成對底線屬強調語法應移除；夾在單字中的底線須保留
	// Paired underscores are emphasis and are removed; intraword underscores must stay
	value = value.replace(/__/g, '')
	value = value.replace(/(^|\s)_/g, '$1')
	value = value.replace(/_(\s|$)/g, '$1')
	value = value.toLowerCase()
	value = value.replace(/[^\p{L}\p{N}\s_-]/gu, '')
	// GitHub 逐個空白轉連字號（不合併），以重現 `a  b` → `a--b`
	// GitHub converts each space individually, reproducing `a  b` → `a--b`
	value = value.replace(/ /g, '-')
	return value
}

/**
 * 去除標題行開頭的區塊引語前綴
 * Strip a leading blockquote prefix from a heading line
 */
function stripBlockQuote(line)
{
	return line.replace(/^\s{0,3}(?:>\s*)+/, '')
}

/**
 * 建立單一檔案的標題錨點集合（重複標題依序附加 -1、-2）
 * Build the anchor set for one file (duplicate headings gain -1, -2 suffixes)
 */
function buildAnchors(prepared)
{
	const anchors = new Set()
	const used = new Map()
	let prevText = ''

	const add = (rawText) =>
	{
		const slug = slugify(rawText)
		if (!slug) return

		const count = used.get(slug) ?? 0
		used.set(slug, count + 1)
		anchors.add(count === 0 ? slug : `${slug}-${count}`)
	}

	for (const line of prepared.body)
	{
		const headingLine = stripBlockQuote(line)
		const atx = /^\s{0,3}(#{1,6})\s+(.+?)(?:\s+#+)*\s*$/.exec(headingLine)

		if (atx)
		{
			add(atx[2])
			prevText = ''
			continue
		}

		// setext 標題：前一行非空白文字，本行為 === 或 --- 底線
		// Setext heading: previous line holds text, this line is an === or --- underline
		const setext = /^\s{0,3}(?:=+|-+)\s*$/.exec(headingLine)
		if (setext && prevText && !LIST_LIKE_RE.test(prevText))
		{
			add(prevText)
			prevText = ''
			continue
		}

		prevText = line.trim() ? line.trim() : ''
	}

	return anchors
}

/**
 * 以空字串取代目標路徑中的百分比編碼（無效編碼時維持原樣）
 * Decode percent-encoding in a path (invalid sequences are left untouched)
 */
function decodeSafely(value)
{
	try
	{
		return decodeURIComponent(value)
	}
	catch (error)
	{
		return value
	}
}

/**
 * 以 POSIX 語意解析相對路徑；超出根目錄時回傳 null
 * Resolve a relative path with POSIX semantics; returns null when it escapes the root
 *
 * @param {boolean} [clamp=false] 超出根目錄時改為收斂到根（不回傳 null），
 *                                供「向上偵測」推測候選路徑。
 *                                 When true, instead of returning null on escape,
 *                                 clamp to the root so callers can guess candidates.
 */
function joinPosix(fromDir, target, clamp = false)
{
	const segments = fromDir ? fromDir.split('/') : []

	for (const segment of target.split('/'))
	{
		if (!segment || segment === '.') continue

		if (segment === '..')
		{
			if (segments.length === 0)
			{
				if (!clamp) return null
				continue
			}
			segments.pop()
			continue
		}

		segments.push(segment)
	}

	return segments.join('/')
}

/**
 * 取得（並快取）指定 Markdown 檔案的標題錨點集合
 * Get (and cache) the heading anchor set of a given Markdown file
 */
function getAnchors(relPath, context)
{
	if (context.anchorCache.has(relPath)) return context.anchorCache.get(relPath)

	const content = readFileSync(join(context.root, relPath), 'utf8')
	const anchors = buildAnchors(prepareLines(content))
	context.anchorCache.set(relPath, anchors)
	return anchors
}

/**
 * 計算兩路徑從頭開始的共同片段數（用於候選排序）
 * Count how many leading path segments two paths share (used to rank candidates)
 */
function sharedPrefixDepth(a, b)
{
	const left = a ? a.split('/') : []
	const right = b ? b.split('/') : []
	let depth = 0
	while (depth < left.length && depth < right.length && left[depth] === right[depth]) depth++
	return depth
}

/**
 * 檔案不存在時，向上偵測可能的候選路徑。
 * When a file is missing, walk upward to suggest candidate paths.
 *
 * 做法：把解析後的最終路徑由結尾逐段縮短（保留越長的尾綴越優先），
 * 在已掃描檔案集合中搜尋「以此尾綴結尾」的檔案；
 * 再以「與來源檔同目錄的接近度」＋「與原解析路徑的接近度」排序，
 * 回傳前 3 筆候選，減少手動排查。
 *
 * Approach: shorten the resolved path from the tail (longer tails first) and search
 * the scanned file set for files ending with that tail; rank by proximity to the
 * source file's directory plus proximity to the originally resolved path, returning
 * up to 3 candidates to reduce manual troubleshooting.
 */
function suggestCandidates(missingPath, sourceRel, context)
{
	const segments = missingPath.split('/').filter(Boolean)
	if (segments.length === 0) return []

	const sourceDir = sourceRel.includes('/') ? sourceRel.slice(0, sourceRel.lastIndexOf('/')) : ''

	for (let size = segments.length - 1; size >= 1; size--)
	{
		const suffix = segments.slice(segments.length - size).join('/')
		const matches = []
		for (const file of context.fileSet)
		{
			if (file === suffix || file.endsWith('/' + suffix)) matches.push(file)
		}
		if (matches.length > 0)
		{
			matches.sort((a, b) =>
			{
				const scoreA = sharedPrefixDepth(a, sourceDir) + sharedPrefixDepth(a, missingPath)
				const scoreB = sharedPrefixDepth(b, sourceDir) + sharedPrefixDepth(b, missingPath)
				return scoreB - scoreA || a.localeCompare(b)
			})
			return matches.slice(0, 3)
		}
	}
	return []
}

/**
 * 驗證單一連結目標；回傳問題訊息，有效時回傳 null
 * Verify one link target; returns a problem message, or null when valid
 */
function verifyTarget(rawTarget, sourceRel, context)
{
	let target = rawTarget.trim()
	if (!target) return null
	// 協定相對連結與具協定的外部連結一律略過
	// Protocol-relative and scheme-bearing external links are skipped
	if (target.startsWith('//')) return null
	if (EXTERNAL_SCHEME_RE.test(target)) return null

	let anchor = ''
	const hashIndex = target.indexOf('#')
	if (hashIndex >= 0)
	{
		anchor = decodeSafely(target.slice(hashIndex + 1))
		target = target.slice(0, hashIndex)
	}

	const queryIndex = target.indexOf('?')
	if (queryIndex >= 0) target = target.slice(0, queryIndex)
	target = decodeSafely(target)

	// 純錨點連結：只需檢查同一份檔案的標題
	// Fragment-only link: only the same file's headings matter
	if (!target)
	{
		if (anchor && !getAnchors(sourceRel, context).has(anchor))
		{
			return `anchor not found: #${anchor}`
		}
		return null
	}

	let relPath
	if (target.startsWith('/'))
	{
		// 以 `/` 開頭視為根目錄起算
		// A leading `/` is resolved from the scan root
		relPath = target.slice(1)
	}
	else
	{
		const fromDir = sourceRel.includes('/') ? sourceRel.slice(0, sourceRel.lastIndexOf('/')) : ''
		relPath = joinPosix(fromDir, target)

		if (relPath === null)
		{
			// 向上偵測：若 `..` 超出根目錄，收斂到根目錄後再比對，作為候選提示
			// Upward detection: if `..` escapes the root, clamp to the root and retry as a candidate hint
			const clamped = joinPosix(fromDir, target, true)
			if (clamped && (context.fileSet.has(clamped) || context.dirSet.has(clamped)))
			{
				return `link escapes the scanned root; candidate -> ${clamped}`
			}
			return 'link escapes the scanned root'
		}
	}

	relPath = relPath.replace(/\/+$/, '')
	// 指向根目錄本身（例如 `/`）視為有效
	// Pointing at the scan root itself (e.g. `/`) is valid
	if (!relPath) return null

	if (context.fileSet.has(relPath) || context.dirSet.has(relPath))
	{
		if (anchor && /\.md$/i.test(relPath) && !getAnchors(relPath, context).has(anchor))
		{
			return `anchor not found: #${anchor}`
		}
		return null
	}

	// 大小寫不符在 Windows 上仍存在、但在 Linux / GitHub 會 404
	// A case mismatch exists on Windows but 404s on Linux / GitHub
	const lower = relPath.toLowerCase()
	const actual = context.fileByLower.get(lower) ?? context.dirByLower.get(lower)
	if (actual !== undefined)
	{
		return `case mismatch: should be -> ${actual}`
	}

	// 向上偵測：檔案確實不存在時，嘗試建議相近候選路徑（依來源與原路徑接近度排序）
	// Upward detection: when the file is genuinely missing, suggest nearby candidate paths
	const candidates = suggestCandidates(relPath, sourceRel, context)
	if (candidates.length > 0)
	{
		return `file not found; candidate -> ${candidates.join(' | ')}`
	}
	return 'file not found'
}

/**
 * 從單行擷取所有待驗證的連結目標
 * Extract every link target to verify from one line
 */
function extractTargets(line)
{
	const targets = []
	const definition = REF_DEF_RE.exec(line)

	if (definition) targets.push(definition[1] ?? definition[2] ?? '')

	for (const match of line.matchAll(INLINE_LINK_RE))
	{
		targets.push(match[1] ?? match[2] ?? '')
	}

	return targets
}

/**
 * 顯示使用說明
 * Print usage information
 */
function printUsage()
{
	console.log(`
Usage:
  node ${SELF_NAME} [root-dir] [options]

Arguments:
  root-dir   Root directory to scan (default: current working directory).
             The path is supplied at run time; it is never hard-coded in this script.

Options:
  -h, --help            Show this help.
      --include-hidden  Also scan hidden directories (skipped by default).

Examples:
  node ${SELF_NAME} .
  node ${SELF_NAME} /path/to/repo
  node ${SELF_NAME} . --include-hidden

Exit codes:
  0  all internal links valid
  1  broken links found
  2  invalid usage or bad path
`)
}

/**
 * 主流程：解析參數、掃描、逐檔驗證並輸出報告
 * Main flow: parse arguments, scan, verify each file and print the report
 */
function main(argv)
{
	if (argv.includes('--help') || argv.includes('-h'))
	{
		printUsage()
		return 0
	}

	const flags = []
	const positional = []

	for (const arg of argv)
	{
		if (arg.startsWith('-')) flags.push(arg)
		else positional.push(arg)
	}

	for (const flag of flags)
	{
		if (flag !== '--include-hidden')
		{
			console.error(`[ERROR] unknown option: ${flag}`)
			printUsage()
			return 2
		}
	}

	if (positional.length > 1)
	{
		console.error('[ERROR] too many arguments')
		printUsage()
		return 2
	}

	const root = resolve(positional[0] ?? process.cwd())
	if (!existsSync(root))
	{
		console.error(`[ERROR] root directory not found: ${root}`)
		return 2
	}

	const collected = { files: [], dirs: [''] }

	try
	{
		walk(root, root, collected, flags.includes('--include-hidden'))
	}
	catch (error)
	{
		console.error(`[ERROR] cannot scan root: ${error.message}`)
		return 2
	}

	const fileSet = new Set(collected.files)
	const dirSet = new Set(collected.dirs)
	const fileByLower = new Map()
	const dirByLower = new Map()

	for (const relPath of collected.files) fileByLower.set(relPath.toLowerCase(), relPath)
	for (const relPath of collected.dirs) dirByLower.set(relPath.toLowerCase(), relPath)

	const context = {
		root,
		fileSet,
		dirSet,
		fileByLower,
		dirByLower,
		anchorCache: new Map(),
	}
	const mdFiles = collected.files.filter((file) => file.toLowerCase().endsWith('.md')).sort()
	const problems = []
	let internalCount = 0
	let externalCount = 0

	for (const relPath of mdFiles)
	{
		let content
		try
		{
			content = readFileSync(join(root, relPath), 'utf8')
		}
		catch (error)
		{
			console.warn(`[WARN] cannot read: ${relPath} (${error.message})`)
			continue
		}

		const prepared = prepareLines(content)
		context.anchorCache.set(relPath, buildAnchors(prepared))
		let lineNumber = 0

		for (const line of prepared.linkSafe)
		{
			lineNumber++
			if (!line) continue

			for (const target of extractTargets(line))
			{
				const trimmed = target.trim()
				if (!trimmed || trimmed.startsWith('//') || EXTERNAL_SCHEME_RE.test(trimmed))
				{
					externalCount++
					continue
				}

				internalCount++
				const message = verifyTarget(target, relPath, context)
				if (message !== null)
				{
					problems.push({ source: relPath, line: lineNumber, target: trimmed, message })
				}
			}
		}
	}

	for (const problem of problems)
	{
		console.log(`✖ ${problem.source}:${problem.line} → ${problem.target} | ${problem.message}`)
	}

	console.log('')
	console.log(`scan root: ${root}`)
	console.log(`Markdown files: ${mdFiles.length}`)
	console.log(`internal links: ${internalCount}`)
	console.log(`external links (skipped): ${externalCount}`)
	console.log(`broken links: ${problems.length}`)

	if (problems.length > 0)
	{
		console.log(`✖ found ${problems.length} broken link(s)`)
		return 1
	}

	console.log('✓ all internal links valid')
	return 0
}

process.exitCode = main(process.argv.slice(2))
