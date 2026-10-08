---
description: >-
  「標籤式提示詞 (Booru-style Tags)」撰寫指南，中文簡稱「標籤提示詞」
  （檔名前綴 tp- = tag prompt），英文別名 Token-weighted Tags
  （同義稱呼：booru tag、sd1.5 tag）。核心只有一條：標籤是有序的——
  既非無序堆疊、也非按字母排序，而是類似敘事式的感覺依序列出標籤。
  說明標準標籤模板、依主題群組的分行方式、必要時混入自然語言輔助，
  以及適用情境。三型共通原則（分段分行、非互斥）已提升至主技能 SKILL.md。
tags:
  - prompts/rules
  - prompts
  - prompt-engineering
  - sd-webui
  - documentation/references
---

# 標籤式提示詞（Booru-style Tags）

| 名稱欄位 | 內容 |
| --- | --- |
| 中文全名 | 標籤式提示詞 |
| 中文簡稱 | **標籤提示詞**（檔名前綴 `tp-` = tag prompt，標籤提示詞） |
| 英文名稱 | Booru-style Tags |
| 英文別名 | Token-weighted Tags |
| 同義稱呼 | booru tag / sd1.5 tag |
| 範例提示詞 | [prompts/tp-booru-style-tags-example.md](prompts/tp-booru-style-tags-example.md)（T0001 起始編號） |
| 對照方法 | [np-spatial-layer-structured.md](np-spatial-layer-structured.md)（圖層式）、[np-fluent-narrative-paragraph.md](np-fluent-narrative-paragraph.md)（敘事式） |

---

## 1. 核心設計理念

標籤式以**逗號分隔的標籤串列**描述畫面，每個標籤作為獨立詞元參與注意力分配，故又稱 **Token-weighted Tags**（詞元加權標籤）。

**唯一的關鍵心法：標籤是有序的。**

- ❌ 不是無序堆疊
- ❌ 也不是按字母排序
- ✅ 而是**類似敘事式的感覺，依序列出標籤**——由整體到局部、由主體到細節，就像一句被拆成關鍵詞的敘事

> 標籤型沒什麼特別需要說的，本篇刻意保持精簡；其餘原則見第 3 節的三型共通事項。

---

## 2. 標準語法結構（Template）

```text
[品質 Quality], [主體 Subject], [外觀 Appearance], [服裝 Clothing], [姿勢動作 Pose/Action], [場景 Background], [光線 Lighting], [風格 Style], [技術參數 Technical],
```

- **逗號分隔，依主題群組分行**（分段與分行是三型共通原則，見主技能 [SKILL.md](../../SKILL.md)）：

```text
1girl, solo, long hair, black hair, school uniform,
cherry blossoms,
blue sky, sunny day,
depth of field,
```

- **必要時可混入自然語言輔助**——沒有規定一定要純標籤
- **排序示範**（依敘事感 vs 字母序）：

```text
✅ 依敘事感排序：1girl, solo, long hair, black hair, school uniform, cherry blossoms, blue sky, sunny day, depth of field,
❌ 字母排序：1girl, black hair, blue sky, cherry blossoms, depth of field, long hair, school uniform, solo, sunny day,
```

---

## 3. 三型共通原則（圖層／敘事／標籤）

分段與分行、非互斥等**三型共通原則已提升至主技能**，見 [SKILL.md](../../SKILL.md) 的「Three Prompt Forms (三型提示詞)」。

- **分段與分行** — 不管哪一種形式的提示詞（圖層、敘事、標籤），實務上都需要分段與分行；標籤式依主題群組分行、依類別分段
- **非互斥** — 三型可自由混用（標籤接敘事收尾、圖層塊內用標籤、敘事開場接標籤……）

---

## 4. 適用情境（Do's & Don'ts）

✅ **最適合**：

- sd1.5 系與 danbooru／booru 訓練的模型
- ComfyUI、SD WebUI 等以標籤為輸入習慣的工作流
- 需要逐詞粒度控制、方便複用與增刪標籤的場景

⚠️ **較不適合**：

- 以自然語言見長的模型（如 Krea2 等）→ 改用 [敘事式](np-fluent-narrative-paragraph.md) 或 [圖層式](np-spatial-layer-structured.md)

---

## 5. 撰寫檢查清單（Checklist）

- [ ] 標籤是否依**敘事感**排序（非無序、非字母序）？
- [ ] 是否依主題群組分行、依類別分段，避免全部擠成一整行？
- [ ] 需要精確分區或大段光影敘事時，是否考慮與圖層式／敘事式混用？

---

## 6. 範例參考

完整的標籤式範例提示詞以 **T0001 起始編號**，請見：

- [prompts/tp-booru-style-tags-example.md](prompts/tp-booru-style-tags-example.md)
