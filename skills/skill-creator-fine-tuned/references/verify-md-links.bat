@echo off
REM ============================================================
REM  verify-md-links.bat
REM  呼叫同目錄下的 verify-md-links.mjs，掃描 Markdown 內部連結
REM  Call the sibling verify-md-links.mjs to verify internal Markdown links
REM
REM  用法 / Usage:
REM    verify-md-links.bat [root-dir] [options]
REM
REM  所有參數會原樣傳遞給 .mjs 腳本（%*）
REM  All arguments are passed through to the .mjs script via %*
REM
REM  掃描根目錄不寫死於腳本內；未指定時預設為目前工作目錄。
REM  The scan root is not hard-coded here; it defaults to the current directory.
REM ============================================================

node "%~dp0verify-md-links.mjs" %*
