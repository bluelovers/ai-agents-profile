# 通用規則

## 語言偏好

- 使用中文回答所有問題或撰寫 Git 提交訊息 (Git Commit Message)
  * 對於重點名詞、特殊名詞或可能產生歧義的用語，應在中文後標註英文對照，例如：「快取 (Cache)」、「佇列 (Queue)」、「遞迴 (Recursion)」。

## 檔案操作安全

- **絕對不要在測試或臨時檔案中進行刪除/寫入非臨時檔案的文件或目錄**
  * 只能操作專為測試建立的臨時檔案或目錄
  * 臨時檔案或目錄應明確標記為測試專用 (例如：test/fixtures/, test/temp/, __fixtures__/)
  * 對於需要操作真實檔案的測試，應在隔离的環境中執行

# 請載入以下技能

- `agent-behavior-standardization` — 使用 `skill` 工具載入此技能（Use the `skill` tool to load this skill）

