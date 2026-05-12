/**
 * 如需新增工具檢測，請參考 `references/script-analysis.md` 中的實作細節。
 *
 * @example
 * ( (echo %COMSPEC% | findstr /I "cmd.exe" >nul 2>&1 && node agent-detect-shell CMD=%COMSPEC%) || (echo $PSHOME | findstr /I "PowerShell" >nul 2>&1 && node agent-detect-shell PowerShell=$PSHOME) || node agent-detect-shell Bash=$0 )
 */
const os = require('os');
const { execSync } = require('child_process');

// Get shell type from command line argument
const shellType = process.argv[2] || 'Unknown';

/**
 * @param {(string | (() => any))[]} list
 * @returns {string}
 */
function detectLazy(list, argv = '--version')
{
	for (const cmd of list)
	{
		try
		{
			if (typeof cmd === 'string')
			{
				return execSync(cmd + ' ' + argv, { encoding: 'utf8' }).trim();
			}
			else if (typeof cmd === 'function')
			{
				return cmd();
			}
		}
		catch
		{
			continue;
		}
	}
	// return 'Not detected';
}

const uv = detectLazy(['uv']);

// Output detection results
const results = {
	shell: shellType,
	cwd: process.cwd(),
	// script: __filename,
	platform: `${os.platform()} (${os.type()})`,
	arch: os.arch(),
	// user: os.userInfo().username,
	node: process.version,
	uv,
	python: detectLazy([
		uv && 'uv run python',
		'python',
		'python3',
	],
		// `-c "import sys; print(sys.executable + ' (' + sys.version + ')')"`
	),
};

console.log(JSON.stringify(results, null, 2));
