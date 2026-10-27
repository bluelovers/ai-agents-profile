---
title: 路徑分類與公有區域使用規範
description: >-
  定義資料夾路徑的分類原則：善用多級路徑承擔分類、共用目錄不得私有化，
  以及路徑須保持通用性與複用性，避免過度限定成單一主題專屬。
tags:
  - agents/skills
  - file-naming
  - path-classification
  - documentation/references
---

# 路徑分類規範 / Path Classification Specification

路徑是比檔名更上游的分類工具。良好的路徑層級能讓檔案「放在哪裡」本身就表達分類，避免檔名承載過多資訊。

---

## 多級路徑承擔分類

優先用資料夾層級表達分類，而非把分類資訊全塞進檔名：

```text
✅ docs/guides/getting-started.md
✅ docs/features/auto-remove-space/usage.md
❌ docs/guides-getting-started.md
❌ docs/autoRemoveSpace-usage.md
```

多級路徑同時改善：檔案總管瀏覽、依路徑搜尋、同類內容聚合。

---

## 公有區域不私有化

倉庫級的共用目錄（`docs/`、`docs/guides/` 等）屬於**公有區域**，服務整個專案的所有主題。不得把它們當成特定功能的專屬資料夾：

```text
❌ docs/autoRemoveSpace/        ← docs 變成 autoRemoveSpace 的私有領域
✅ docs/features/auto-remove-space/
```

私有化會造成：

1. 後續其他主題無法合理找到歸屬，開始在 docs 根目錄亂放；
2. 目錄語意失真——瀏覽者以為 `docs/` 底下的一級資料夾都是通用分類；
3. 主題退役或改名時，公有結構被連帶破壞。

> [!IMPORTANT]
> 若某主題內容量足以成一級目錄，仍應放在通用分類層之下（如 `docs/features/<topic>/`、`docs/rfc/<topic>/`），而非直接掛在公有根目錄。

---

## 路徑保持通用與可複用

路徑分類必須能容納**同類的其他內容**。只能容納單一主題的路徑等於沒有分類：

```text
❌ docs/01-autoRemoveSpace/     ← 過度限定：只能放這一個功能
✅ docs/features/               ← 通用層：所有功能文件都能複用
   └─ auto-remove-space/
      └─ README.md
```

判斷方法：想像下一個新功能的文件能否自然放入同一層級。

- 能 → 該層級通用，分類有效；
- 不能（路徑已綁死特定主題）→ 過度限定，需上提一層重構。

---

## 檢查清單

- [ ] 分類優先由路徑層級表達，檔名只描述內容本身。
- [ ] 共用目錄（`docs/` 等）未被單一主題壟斷。
- [ ] 每一層路徑都能容納同類的新內容（可複用）。
- [ ] 目錄層級深度適中：過淺導致扁平混雜，過深導致導航困難。
