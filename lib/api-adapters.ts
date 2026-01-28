import { WidgetConfig } from '@/types';
import { getNestedValue } from './data-utils';

/**
 * The Adapter Interface
 * Takes raw API response + Widget Configuration
 * Returns specialized data for the Widget Type
 */
export const processWidgetData = (data: any, widget: WidgetConfig) => {
    const { dataMap, type } = widget;

    // 1. GENERIC ADAPTER
    // Uses the user-defined paths to extract data

    // 2. FINNHUB ADAPTER
    // Detects Finnhub structure automatically or via config

    // Case A: Finnhub Candles (Columnar Data: c=[], t=[], v=[], etc.)
    // The user can select which field to plot (c, v, h, l, o)
    const t = data.t;

    // Check if this is Finnhub candle data
    if (Array.isArray(t) && (data.c || data.v || data.h || data.l || data.o)) {
        // Determine which field to use for Y-axis
        let yFieldData = data.c; // Default to close prices

        if (dataMap.yField) {
            const fieldName = dataMap.yField.split('.').pop();
            if (fieldName && data[fieldName] && Array.isArray(data[fieldName])) {
                yFieldData = data[fieldName];
            }
        }

        // Transform Columnar -> Row-based for Recharts
        if (Array.isArray(yFieldData) && yFieldData.length === t.length) {
            return t.map((time: number, i: number) => ({
                activeX: new Date(time * 1000).toLocaleDateString(),
                activeY: yFieldData[i]
            }));
        }
    }

    // Case B: Finnhub Quote (Simple Object: c, d, dp)
    if (data.c !== undefined && data.dp !== undefined) {
        if (type === 'CARD') {
            return {
                primary: data.c,
                delta: data.dp,
                subtitle: "USD"
            };
        }
    }

    // 3. COINCAP ADAPTER (History)
    // Detects CoinCap history structure: { data: [{ priceUsd: "...", time: ... }], timestamp: ... }
    if (data.data && Array.isArray(data.data) && data.timestamp && data.data.length > 0 && data.data[0].priceUsd && data.data[0].time) {
        return data.data.map((item: any) => ({
            activeX: new Date(item.time).toLocaleDateString(),
            activeY: parseFloat(item.priceUsd)
        }));
    }

    // 4. COINGECKO ADAPTER (Market Chart)
    // Detects CoinGecko structure: { prices: [[timestamp, price], ...], market_caps: ..., total_volumes: ... }

    // Debugging path selection
    const primaryPath = dataMap.primary || 'prices';
    const resolvedArray = getNestedValue(data, primaryPath);

    // Fallback to 'prices' directly if resolution failed but 'prices' exists (and primary wasn't explicitly set to something else that failed)
    const targetArray = (Array.isArray(resolvedArray) && resolvedArray.length > 0)
        ? resolvedArray
        : data.prices;

    if (targetArray && Array.isArray(targetArray) && targetArray.length > 0 && Array.isArray(targetArray[0]) && targetArray[0].length === 2) {
        // console.log(`[Adapter] CoinGecko using path: ${primaryPath}, Items: ${targetArray.length}`);
        return targetArray.map(([time, value]: [number, number]) => ({
            activeX: new Date(time).toLocaleDateString(),
            activeY: value
        }));
    }

    // 5. GENERIC ADAPTER (Fallback)
    if (type === 'CARD') {
        let primary = getNestedValue(data, dataMap.primary || '');

        //If primary is an array, take the LAST item
        if (Array.isArray(primary) && primary.length > 0) {
            primary = primary[primary.length - 1];
        }

        const delta = dataMap.delta ? getNestedValue(data, dataMap.delta) : undefined;
        const finalDelta = (Array.isArray(delta) && delta.length > 0) ? delta[delta.length - 1] : delta;

        const subtitle = dataMap.subtitle ? getNestedValue(data, dataMap.subtitle) : widget.title;

        let safePrimary = primary;
        if (typeof primary === 'object' && primary !== null && !Array.isArray(primary)) {
            const knownKeys = ['value', 'price', 'amount', 'c', 'close', 'NSE', 'BSE', 'symbol', 'name'];
            for (const key of knownKeys) {
                if (primary[key] !== undefined && primary[key] !== null) {
                    safePrimary = primary[key];
                    break;
                }
            }
        }

        return {
            primary: safePrimary,
            delta: finalDelta,
            subtitle
        };
    }

    if (type === 'TABLE') {
        const list = getNestedValue(data, dataMap.primary || '');

        if (Array.isArray(list)) {
            return list;
        }

        // Handle Object Maps (e.g. Alpha Vantage "Time Series": { "2024-01-01": {...}, ... })
        // We convert this to an Array and inject the Key (Date) so the table can display it.
        if (list && typeof list === 'object') {
            return Object.entries(list).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    return { ROOT_KEY: key, ...value }; // Inject Key
                }
                return { ROOT_KEY: key, Value: value };
            });
        }

        return [];
    }

    if (type === 'CHART') {
        const rawSeries = getNestedValue(data, dataMap.primary || '');

        // Handle Object-based series (Alpha Vantage style)
        if (rawSeries && typeof rawSeries === 'object' && !Array.isArray(rawSeries)) {
            return Object.entries(rawSeries).map(([time, values]: [string, any]) => ({
                activeX: time,
                activeY: getNestedValue(values, dataMap.yField || '')
            })).reverse();
        }

        // Handle Array-based series
        if (Array.isArray(rawSeries)) {
            return rawSeries.map(item => {
                const yVal = getNestedValue(item, dataMap.yField || '');
                const parsedY = (typeof yVal === 'string' && !isNaN(parseFloat(yVal)))
                    ? parseFloat(yVal)
                    : yVal;

                return {
                    activeX: getNestedValue(item, dataMap.xField || ''),
                    activeY: parsedY
                };
            });
        }
        return [];
    }

    return data;
};
