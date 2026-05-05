---
title: React State/Ref/Memo Refactoring - useFacilityPointBlocksData Case Study
description: 完整重構案例分析 - 將過度使用 useState 的 React Hook 重構為 State + RefObject + useMemo 的優化模式
---

# React State/Ref/Memo 重構案例

## 案例背景

將一個過度使用 `useState` 的 React Hook (`useFacilityPointBlocksData`) 重構為**更精簡、更高效**的實現，展示 `State`、`RefObject` 與 `useMemo` 的正確選用。

---

## 重構前代碼 (Before)

```typescript
import { useMemo, useState } from 'react';
import { isCoordWithinRange } from '../../lib/utils/geo/geo-check';
import {
	transformCoordinateToUriQueryLatLng,
	wrapCoordinateFromPointTupleLatLng,
} from '../../lib/utils/geo/geo-transform';
import { EnumDatasetType, IGeoCoord, IGeoPointTupleLatLng, IGpsLngLatMinMax } from '../../lib/utils/grid/grid-types';
import useSWR from 'swr';
import { IApiReturnBlocksBatch } from 'src/types/index';
import { buildFetcher, fetcher } from '../../lib/utils/fetch/fetcher';
import { getSnappedCoord } from '@/lib/utils/geo/geo-bounds-utils';

function fillFacilityPointData(data?: IApiReturnBlocksBatch["data"])
{
	const facilityPointData: NonNullable<IApiReturnBlocksBatch["data"]> = {} as any;

	Object.values(EnumDatasetType).forEach((type) =>
	{
		facilityPointData[type] = data?.[type] ?? [];
	});

	return facilityPointData;
}

export function useFacilityPointBlocksData(position: IGeoPointTupleLatLng | IGeoCoord, ignoreCacheCheck?: boolean)
{
	/** 當前資料的範圍邊界 / Current data range bounds */
	const [matchedRangeBounds, setMatchedRangeBounds] = useState<IGpsLngLatMinMax | null>(null);

	const [triggerThresholdRangeBounds, setTriggerThresholdRangeBounds] = useState<IGpsLngLatMinMax | null>(null);
	const [blockScanRangeBounds, setBlockScanRangeBounds] = useState<IGpsLngLatMinMax | null>(null);

	const [data, setData] = useState<IApiReturnBlocksBatch["data"] | null>(fillFacilityPointData());

	/** 此區域內的所有分類清單 / All categories in this area */
	const [categories, setCategories] = useState<string[]>([]);

	let swrKey = null;
	if (position)
	{
		let coord: IGeoCoord;

		if (Array.isArray(position))
		{
			coord = wrapCoordinateFromPointTupleLatLng(position);
		}
		else
		{
			coord = position;
		}

		const snappedCenter = getSnappedCoord(coord);

		const bool = ignoreCacheCheck || !triggerThresholdRangeBounds
			|| !isCoordWithinRange(coord, triggerThresholdRangeBounds)
			|| !isCoordWithinRange(snappedCenter, triggerThresholdRangeBounds)
		;

		if (bool)
		{
			swrKey = `/api/blocks-batch?${transformCoordinateToUriQueryLatLng(snappedCenter)}`;
		}

		console.log('useFacilityPointBlocksData', swrKey, position, triggerThresholdRangeBounds, bool);
	}

	const fetcherFacilityPoint = buildFetcher<IApiReturnBlocksBatch>(fetcher, {
		onSuccess(data)
		{
			console.log('[useFacilityPointBlocksData] API response:', data.success,
				'\nwifi count:', data.data?.[EnumDatasetType.WIFI]?.length,
				'\ncharging count:', data.data?.[EnumDatasetType.CHARGING]?.length,
				'\nrange:', data.matchedRangeBounds,
			);

			return data;
		},
	});

	const { error, isLoading } = useSWR(swrKey, fetcherFacilityPoint, {
		revalidateOnFocus: false,
		onSuccess: (batchData) =>
		{
			if (batchData.matchedRangeBounds)
			{
				setMatchedRangeBounds(batchData.matchedRangeBounds);
			}

			if (batchData.triggerThresholdRangeBounds)
			{
				setTriggerThresholdRangeBounds(batchData.triggerThresholdRangeBounds);
			}

			if (batchData.blockScanRangeBounds)
			{
				setBlockScanRangeBounds(batchData.blockScanRangeBounds);
			}

			if (batchData.data)
			{
				setData(batchData.data);
			}

			/** 擷取此區域內的所有分類清單 / Extract categories from API response */
			if (batchData.categories)
			{
				setCategories((batchData as any).categories);
			}
		},
	});

	return {
		data,
		matchedRangeBounds,
		triggerThresholdRangeBounds,
		blockScanRangeBounds,
		error,
		isLoading,
		categories,
	} as const;
}
```

### 重構前的問題

1. **過度使用 `useState`**：5 個 `useState` 導致狀態管理複雜
2. **不必要的重新渲染**：邊界數據改變時觸發不必要的渲染
3. **難以維護的 `onSuccess` 回調**：多個 `setXxx` 調用散落各處
4. **派生數據獨立存儲**：`categories` 可以從 `data` 推導，卻獨立存儲

---

## 重構後代碼 (After)

```typescript
import { useEffect, useMemo, useRef, useState } from 'react';
import { isCoordWithinRange } from '../../lib/utils/geo/geo-check';
import
	{
		transformCoordinateToUriQueryLatLng,
		wrapCoordinateFromPointTupleLatLng,
	} from '../../lib/utils/geo/geo-transform';
import { EnumDatasetType, IGeoCoord, IGeoPointTupleLatLng, IGpsLngLatMinMax } from '../../lib/utils/grid/grid-types';
import useSWR from 'swr';
import { IApiReturnBlocksBatch } from '../../types/index';
import { buildFetcher, fetcher } from '../../lib/utils/fetch/fetcher';
import { getSnappedCoord } from '@/lib/utils/geo/geo-bounds-utils';
import { IRefObjectMaybe, unwrapRefObject } from '@/lib/utils/react/var-helper';

function fillFacilityPointData(data?: IApiReturnBlocksBatch["data"])
{
	const facilityPointData: NonNullable<IApiReturnBlocksBatch["data"]> = {} as any;

	Object.values(EnumDatasetType).forEach((type) =>
	{
		facilityPointData[type] = data?.[type] ?? [];
	});

	return facilityPointData;
}

export function useFacilityPointBlocksData(position: IGeoPointTupleLatLng | IGeoCoord, ignoreCheck?: IRefObjectMaybe<boolean>)
{
	/**
	 * 使用 useRef 記憶邊界。
	 * 因為邊界是用來判斷「要不要發請求」，它不需要觸發 re-render，
	 * 真正的 re-render 應該由 SWR 的 data 更新來驅動。
	 */
	const boundsRef = useRef<{
		trigger?: IGpsLngLatMinMax | null;
	}>({});

	/**
	 * 只有在需要更新時，才產生新的 Key
	 * 我們利用一個 state 來鎖定「當前生效的請求 Key」
	 */
	const [activeKey, setActiveKey] = useState<string | null>(null);

	/**
	 * 處理 position 變化邏輯
	 */
	useEffect(() =>
	{
		if (!position) return;

		const coord = Array.isArray(position) ? wrapCoordinateFromPointTupleLatLng(position) : position;
		const snappedCenter = getSnappedCoord(coord);
		const triggerBounds = boundsRef.current.trigger;

		const shouldIgnoreCheck = unwrapRefObject(ignoreCheck);

		const shouldTrigger = shouldIgnoreCheck || !triggerBounds ||
			!isCoordWithinRange(coord, triggerBounds) ||
			!isCoordWithinRange(snappedCenter, triggerBounds);

		if (shouldTrigger)
		{
			const newKey = `/api/blocks-batch?${transformCoordinateToUriQueryLatLng(snappedCenter)}`;
			/** 只有當計算出的 Key 不同時，才更新 state 觸發 SWR */
			if (newKey !== activeKey)
			{
				setActiveKey(newKey);
			}
		}
	}, [position]);

	/**
	 * SWR 主體
	 */
	const { data: batchData, error, isLoading } = useSWR<IApiReturnBlocksBatch>(activeKey, fetcher, {
		revalidateOnFocus: false,
		/**
		 * 這裡可以直接在回傳時同步更新 Ref，不會觸發額外的 render
		 */
		onSuccess: (res) =>
		{
			boundsRef.current.trigger = res.triggerThresholdRangeBounds;
		},
	});

	/**
	 * 衍生資料 (Derived State)
	 * 使用 useMemo 確保回傳物件的引用穩定
	 */
	return useMemo(() => ({
		data: fillFacilityPointData(batchData?.data),
		matchedRangeBounds: batchData?.matchedRangeBounds ?? null,
		triggerThresholdRangeBounds: batchData?.triggerThresholdRangeBounds ?? null,
		blockScanRangeBounds: batchData?.blockScanRangeBounds ?? null,
		categories: batchData?.categories ?? [],
		error,
		isLoading,
	}), [batchData, error, isLoading]);
}
```

---

## 核心改進點

### 1. State → RefObject 轉換

| 原 `useState` | 改為 | 原因 |
|--------------|------|------|
| `triggerThresholdRangeBounds` | `boundsRef.current.trigger` | 僅用於邏輯判定，不參與渲染 |
| `matchedRangeBounds` | 直接使用 API 數據 | 無需額外存儲 |
| `blockScanRangeBounds` | 直接使用 API 數據 | 無需額外存儲 |

### 2. 派生數據使用 useMemo

```typescript
return useMemo(() => ({
	data: fillFacilityPointData(batchData?.data),
	matchedRangeBounds: batchData?.matchedRangeBounds ?? null,
	// ... 其他派生值
}), [batchData, error, isLoading]);
```

### 3. 引入 IRefObjectMaybe<T> 模式

```typescript
export type IRefObjectMaybe<T> = T | RefObject<T>;

export function unwrapRefObject<T>(val: IRefObjectMaybe<T>): T {
	return isRefObject(val) ? val.current : val;
}
```

允許外部調用者決定配置項是否為「反應式」：
- **傳入 Value**：設定變更時 Hook 立即重跑
- **傳入 RefObject**：設定變更時 Hook 保持靜音

---

## 重構收益

| 指標 | 重構前 | 重構後 |
|------|--------|--------|
| `useState` 數量 | 5 個 | 1 個 |
| `useRef` 使用 | 0 個 | 1 個 |
| `useMemo` 使用 | 0 個 | 1 個 |
| 渲染觸發次數 | 過多 | 優化 |
| 代碼行數 | ~100 行 | ~70 行 |
| 可維護性 | 低 | 高 |

---

## 輔助類型定義

```typescript
import { RefObject } from 'react';

export type IRefObjectMaybe<T> = T | RefObject<T>;

export function isRefObject<T>(val: IRefObjectMaybe<T>): val is RefObject<T>
{
	return val && typeof val === 'object' && 'current' in val;
}

export function unwrapRefObject<T>(val: IRefObjectMaybe<T>): T
{
	return isRefObject(val) ? val.current : val;
}
```

---

## 相關資源

- [Main Skill Documentation](../../SKILL.zh.md) - 核心重構指南
- [React Documentation - useRef](https://react.dev/reference/react/useRef)
- [React Documentation - useMemo](https://react.dev/reference/react/useMemo)
- [SWR Documentation](https://swr.vercel.app/)
