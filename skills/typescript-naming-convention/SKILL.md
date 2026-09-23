---
name: typescript-naming-convention
description: |-
  規範 TypeScript Enum、Interface 與 Type Alias 的命名與型別文件。
  當使用者提及以下關鍵字或情境時觸發：
  - Enum, Interface, Type Alias 命名/實作/重構
  - Enum{Name}
  - I{Name}
  - 型別命名 type naming
tags:
  - typescript
  - naming-convention
  - typescript/types
  - typescript/enums
  - typescript/interfaces
  - typescript/type-aliases
  - documentation/jsdoc
  - agents/skills
---

# TypeScript 命名規則 / TypeScript Naming Convention

將 TypeScript 型別宣告統一為可預測的命名與文件格式。

---

## 核心規則

| 型別種類 | 命名格式 | 範例 |
| :--- | :--- | :--- |
| Enum | `Enum{Name}`，PascalCase | `EnumResultType` |
| Interface | `I{Name}`，PascalCase | `IUserInfo` |
| Type Alias | `I{Name}`，PascalCase | `IApiResponse<T>` |

對既有規則未涵蓋的宣告，沿用專案既有命名慣例，不要自行發明前綴。

---

## 執行流程

1. 判斷宣告是 Enum、Interface 或 Type Alias。
2. 保留語意名稱與泛型參數，套用對應命名格式。
3. 在型別宣告前加入 `/** ... */` 區塊文件。
4. 依成員種類加入適當的文件註解。
5. 使用下方的驗證清單檢查命名、文件與連結。

---

## 文件要求

- 為所有 Enum、Interface 與 Type Alias 使用區塊文件。
- 在文件中使用繁體中文說明型別用途與語意。
- 視需要加入英文說明，保持中英文順序一致。
- 建議為 Enum 成員加入用途說明。
- Interface 屬性建議使用單行區塊註解。
- Interface 方法建議使用包含參數與回傳值的 JSDoc。
- 物件型別 Type Alias 的屬性建議使用單行區塊註解。
- 函式型別參數與回傳值建議使用 JSDoc 標註。

詳細格式遵循 [註解格式規範](../../rules/comment-format-rules.md)。

---

## 判定流程

```text
新的型別宣告
    │
    ├─ Enum          → Enum{Name}
    ├─ Interface     → I{Name}
    ├─ Type Alias    → I{Name}
    └─ 其他型別      → 沿用專案既有慣例
```

完整規則、範例與錯誤模式分別查閱：

- [命名規則與判定流程](./references/naming-rules.md)
- [完整範例與錯誤模式](./references/examples.md)

---

## 驗證清單

- [ ] Enum 使用 `Enum` 前綴與 PascalCase。
- [ ] Interface 使用 `I` 前綴與 PascalCase。
- [ ] Type Alias 使用 `I` 前綴與 PascalCase。
- [ ] 型別宣告前有 `/** ... */` 文件。
- [ ] 文件包含中文用途與語意說明。
- [ ] 成員文件符合其宣告種類。
- [ ] 相關規範連結仍可解析。
