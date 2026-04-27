# 座標處理重構案例 (Coordinate Processing Case Study)

本案例展示如何透過型別設計從根源上消除隱性錯誤，並平衡外部庫相容性與程式碼安全性。

---

## 問題背景

### 隱性錯誤的溫床：座標順序混淆

地理座標處理中，常見兩種表示方式：
- **Leaflet / Google Maps**: `[lat, lng]` (y 在前, x 在後)
- **直覺 / 數學慣例**: `[x, y]` / `[lng, lat]` (x 在前, y 在後)

```typescript
// ❌ 錯誤：直覺使用 [lng, lat]，與 Leaflet 預期相反
const point = [121.5, 25.0];  // 這是 [lng, lat] 還是 [lat, lng]？
map.setView(point);           // 可能導致位置完全錯誤！
```

此類錯誤難以察覺，因為：
1. 編譯器無法檢測 `[number, number]` 的順序錯誤
2. 運行時可能產生看似合理但實際錯誤的結果
3. 問題通常在整合測試或生產環境才浮現

---

## 解決方案：多層次防禦設計

### 第一層：主要介面使用具名物件

```typescript
/**
 * GPS 座標介面
 * GPS coordinate interface
 */
export interface IGeoCoord {
    /** X 座標（經度）/ X coordinate (longitude) */
    lng: number;
    /** Y 座標（緯度）/ Y coordinate (latitude) */
    lat: number;
}
```

**優勢：**
- IDE 自動提示屬性名稱，無法誤用順序
- 編譯時檢查：必須明確指定 `lng` 或 `lat`
- 自文件化：閱讀程式碼時立即理解含義

### 第二層：陣列僅限外部介接，並提供轉換橋樑

```typescript
/**
 * 注意：Array 通常是 Leaflet/Google Maps 慣用的 [lat, lng]
 * y lat 在前, x lng 在後。除非必要否則請勿使用此格式。
 */
export type IGeoPointTupleLatLng = [
    /** y lat 緯度 / Latitude */
    lat: number,
    /** x lng 經度 / Longitude */
    lng: number,
];

/**
 * 將陣列格式轉為物件格式 `[lat, lng]` -> `{lng, lat}`
 */
export function wrapCoordinateFromPointTupleLatLng(
    pointTupleLatLng: IGeoPointTupleLatLng
): IGeoCoord {
    return {
        lng: pointTupleLatLng[1],  // 明確指出 index 1 是 lng
        lat: pointTupleLatLng[0],  // 明確指出 index 0 是 lat
    };
}
```

**設計意圖：**
- 陣列僅用於與第三方庫（Leaflet/Google Maps）的邊界
- 轉換函式作為「防火牆」，將外部慣用格式轉為內部標準
- Tuple 語義標註提供 IDE 提示，降低直接使用陣列時的錯誤風險

### 第三層：SSoT 原則貫穿整體設計

```typescript
/**
 * 經緯度最小值介面
 * Longitude/latitude minimum interface
 */
export interface IGpsLngLatMin {
    /** x lng 經度最小值 / Minimum longitude */
    minLng: number;
    /** y lat 緯度最小值 / Minimum latitude */
    minLat: number;
}

/**
 * 經緯度最大值介面
 * Longitude/latitude maximum interface
 */
export interface IGpsLngLatMax {
    /** x lng 經度最大值 / Maximum longitude */
    maxLng: number;
    /** y lat 緯度最大值 / Maximum latitude */
    maxLat: number;
}

/**
 * 經緯度範圍介面（最小值 + 最大值）
 * 透過繼承組合，避免重複定義
 */
export interface IGpsLngLatMinMax extends IGpsLngLatMin, IGpsLngLatMax {
    // 自動繼承 minLng, minLat, maxLng, maxLat
}

/**
 * 統一格式的區塊邊界介面
 */
export interface IGeoBounds {
    /** (0,1) 西北角座標 / Northwest corner coordinates */
    northWest: IGeoCoord;
    /** (1,1) 東北角座標 / Northeast corner coordinates */
    northEast: IGeoCoord;
    /** (0,0) 西南角座標 / Southwest corner coordinates */
    southWest: IGeoCoord;
    /** (1,0) 東南角座標 / Southeast corner coordinates */
    southEast: IGeoCoord;
}
```

---

## 核心原則總結

### 1. 物件優先於陣列

```
推薦層級：
1. ✅ { lng, lat } - 具名屬性，無歧義
2. ⚠️ [lat, number, lng: number] - Tuple 語義標註，IDE 支援
3. ❌ [number, number] - 純陣列，語義全失
```

### 2. 單一轉換點原則

所有外部陣列格式應在單一函式（如 `wrapCoordinateFromPointTupleLatLng`）中完成轉換，而非分散在各處。

### 3. 型別即文件

透過 Interface 定義和 JSDoc 註解，使型別系統成為活文件，指導正確使用方式。

---

## 重構指導

當遇到座標相關程式碼時：

| 檢查點 | 操作 |
|--------|------|
| 是否使用 `[number, number]` 表示座標？ | 重構為 `IGeoCoord` 或至少 `IGeoPointTupleLatLng` |
| 是否有多處進行 `[lat, lng]` ↔ `{lng, lat}` 轉換？ | 統一使用單一轉換函式，遵循 DRY |
| 是否有多個類似的座標相關介面？ | 應用 SSoT，提取共用基礎型別 |

---

## 參考連結

- [TypeScript Tuple 型別文件](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types)
- [Leaflet LatLng 格式說明](https://leafletjs.com/reference.html#latlng)
- [Google Maps Platform - Coordinates](https://developers.google.com/maps/documentation/javascript/coordinates)
