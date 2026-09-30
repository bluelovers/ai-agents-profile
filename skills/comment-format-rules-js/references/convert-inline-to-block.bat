@echo off
REM ============================================================
REM  convert-inline-to-block.bat
REM  呼叫同目錄下的 convert-inline-to-block.cjs，將行內註解 (//) 轉為區塊註解
REM  Call the sibling convert-inline-to-block.cjs to convert inline (//) comments to block comments
REM
REM  用法 / Usage:
REM    convert-inline-to-block.bat <目標> [--write] [--diff] [--no-recursive]
REM
REM  所有參數會原樣傳遞給 .cjs 腳本（%*）
REM  All arguments are passed through to the .cjs script via %*
REM ============================================================

node "%~dp0convert-inline-to-block.cjs" %*
