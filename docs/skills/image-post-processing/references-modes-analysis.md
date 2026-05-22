---
tags:
  - documentation
  - image-post-processing
  - analysis
  - modes
  - documentation/references
---

# 參考類 (References) 文件分析

## 分析對象

| 文件 | Skill | 主要用途 |
|------|-------|---------|
| `modes.md` | generate2dsprite | 資產類型、動作、束預設、表預設定義 |

---

## 核心功能

**模式定義字典** - 提供所有可用的資產類型、動作類型、束配置和表配置的完整清單，供 agent 在使用者請求模糊時選擇正確的資產計劃。

---

## 資產類型 (Asset Types)

### 定義清單

| 類型 | 描述 | 典型使用 |
|------|------|---------|
| `player` | 可控制的 overworld 英雄 | 主角角色 |
| `npc` | 可讀取角色的城鎮或野外角色 | 非玩家角色 |
| `creature` | 怪物、野獸、靈魂、Boss、召喚物 | 敵對/中立生物 |
| `character` | 側視角或非 overworld 人形單位 | 非特定玩家/NPC 的角色 |
| `spell` | 可施放的魔法或技能序列 | 法術效果 |
| `projectile` | 可循環的飛行物件 | 光球、箭、火球、子彈 |
| `impact` | 命中爆發、爆炸、接觸 FX | 碰撞效果 |
| `prop` | 物品、武器、神社物件、拾取物、可部署物 | 場景道具 |
| `summon` | 召喚單位或生物入場資產 | 召喚動畫 |
| `fx` | 通用視覺效果表 | 特效 |

---

## 動作類型 (Actions)

### 定義清單

| 動作 | 描述 | 應用場景 |
|------|------|---------|
| `single` | 單一靜態精靈 | 靜態道具 |
| `idle` | 循環呼吸/站姿/光環循環 | 待機動畫 |
| `cast` | 法術或技能蓄力/釋放 | 施法動畫 |
| `attack` | 僅攻擊動畫 | 攻擊動作 |
| `hurt` | 受傷反應 | 受擊動畫 |
| `combat` | 組合攻擊 + 受傷表 | 戰鬥包 |
| `walk` | 移動循環 | 行走動畫 |
| `run` | 更快的移動循環 | 跑步動畫 |
| `hover` | 空中待機/移動循環 | 漂浮動畫 |
| `charge` | 蓄力或衝刺準備 | 蓄力動畫 |
| `projectile` | 可循環的飛行動作 | 飛行道具 |
| `impact` | 接觸爆發 | 碰撞效果 |
| `explode` | 更強的衝擊或破壞爆發 | 爆炸效果 |
| `death` | 擊敗/消失/倒塌序列 | 死亡動畫 |

---

## 束預設 (Bundle Presets)

### 定義清單

| 束類型 | 預設內容 | 可選內容 | 使用時機 |
|--------|---------|---------|---------|
| `single_asset` | 單一精靈或單一表 | - | 單一資產 |
| `unit_bundle` | `idle` + `combat` | `walk` | 單位完整包 |
| `spell_bundle` | `cast` + `projectile` + `impact` | - | 法術完整序列 |
| `combat_bundle` | `idle` + `attack` + `hurt` | - | 戰鬥動作包 |
| `line_bundle` | 1-3 形態，每形態選擇需要的表 | - | 進化線/形態線 |

---

## 表預設 (Sheet Presets)

### 定義清單

| 尺寸 | 幀數 | 典型用途 |
|------|------|---------|
| `1x4` | 4 | 飛行道具、簡單循環 FX |
| `2x2` | 4 | 標準待機、攻擊/受傷/碰撞、側視角行走 |
| `2x3` | 6 | 施法序列、死亡序列、較豐富的戰鬥動作 |
| `3x3` | 9 | 大型生物待機、Boss 光環循環、高價值展示待機 |
| `4x4` | 16 | 俯視角 4 方向玩家行走表 |

---

## Agent-First 映射提示

### 自然語言到資產計劃的轉換

| 使用者請求 | 資產類型 | 動作/配置 |
|-----------|---------|----------|
| "make a 4-direction main hero" | `player` | `player_sheet` |
| "make a healer npc" | `npc` | `single_asset`, `role=healer` |
| "make a healer npc walk sheet" | `npc` | `walk` |
| "make a boss idle" | `creature` | `idle` (prefer `3x3`) |
| "make a wizard throwing a magic orb" | `spell_bundle` | 完整法術序列 |
| "make a fireball projectile" | `projectile` | `projectile` (prefer `1x4`) |
| "make a hit explosion" | `impact` | `impact` (prefer `2x2`) |
| "make a summon entrance" | `summon` | `cast` or `impact` |
| "make a full fire samurai creature line" | `line_bundle` | 規劃 1-3 形態，每形態選擇表 |

---

## 舊版相容性

### 保留的舊版映射

| 舊版名稱 | 對應配置 |
|---------|---------|
| `player_sheet` | 4-direction overworld walk |
| `player_walk` | 2x2 down-facing walk |
| `npc_walk` | 2x2 down-facing walk |
| `combat` | 2x2 attack + hurt |
| `evolution` | legacy concept sheet |

---

## 處理器預設 (Processor Defaults)

### 處理參數建議

| 場景 | 建議參數 |
|------|---------|
| 多幀表一致性 | `shared_scale=true` |
| 地面角色對齊 | `align=bottom` or `feet` |
| 漂浮效果/飛行道具對齊 | `align=center` |
| 原始表包含分離火花或邊緣碎片 | `component_mode=largest` |
| 分離效果是資產輪廓的預期部分 | `component_mode=all` |

---

## 輸出形狀 (Output Shape)

### 各模式產出

| 模式 | 輸出內容 |
|------|---------|
| any sheet mode | 透明表 + 逐幀 PNGs + GIF |
| `player_sheet` | 加上方向條和四個 GIF |
| `single_asset` | 清理後的透明 PNG |
| bundles | bundle 根目錄內每個資產一個輸出資料夾 |

---

## 與其他文件的關聯

### 與 `prompt-rules.md` 的關係

| 文件 | 功能 | 互動 |
|------|------|------|
| `modes.md` | 定義 "有哪些選項" | 提供可用值清單 |
| `prompt-rules.md` | 定義 "如何撰寫提示" | 引用 modes.md 中的值 |

**使用流程：**
1. 使用 `modes.md` 選擇資產類型、動作、束配置
2. 使用 `prompt-rules.md` 撰寫符合規範的提示詞

---

*報告生成時間：2026-05-02*
