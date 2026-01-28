import { useEffect, useState, useRef } from 'react';
import { useCacheStore } from '@/store/cacheStore';

export function usePolling(url: string, intervalSeconds: number = 30) {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isMock, setIsMock] = useState(false);

    const setCache = useCacheStore((state) => state.setCache);
    const lastFetchRef = useRef<number>(0);

    // Dynamic Interval: Increase to 5 minutes for Alpha Vantage to respect free tier (5 req/min, 500 req/day)
    const effectiveInterval = url.includes('alphavantage') ? 300 : intervalSeconds;

    useEffect(() => {
        let isMounted = true;
        const intervalMs = effectiveInterval * 1000;

        const fetchData = async () => {
            if (!url) return;

            // 0. GLOBAL BUTTON MOCK INTERCEPT
            // If the user has explicitly toggled "Mock On" in the UI, we FORCE the mock service.
            const globalMockEnabled = typeof window !== 'undefined' && sessionStorage.getItem('use_mock') === 'true';

            if (globalMockEnabled || url.includes('YOUR_API_KEY') || url.includes('indianapi.in')) {
                const { getMockData } = await import('./mock-service');
                const mock = getMockData(url);
                if (isMounted && mock) {
                    setData(mock);
                    setLastUpdated(new Date());
                    setIsMock(true);
                    setError(null);
                    setLoading(false);
                    return;
                }
            }

            // 1. FRESH CACHE CHECK
            const freshCacheState = useCacheStore.getState();
            const cached = freshCacheState.getCache(url);
            const now = Date.now();

            // Use cache if fresh enough
            if (cached && (now - cached.timestamp < intervalMs)) {
                if (isMounted) {
                    setData(cached.data);
                    setLastUpdated(new Date(cached.timestamp));
                    setIsMock(false);
                    setError(null);
                }
                return;
            }

            // Deduplication (throttle)
            if (now - lastFetchRef.current < 2000 && lastFetchRef.current !== 0) return;

            if (isMounted) setLoading(true);

            try {
                const res = await fetch(url);
                if (!res.ok) {
                    if (res.status === 429) throw new Error('Rate limit reached');
                    throw new Error(`Error ${res.status}`);
                }
                const json = await res.json();

                // Rate Limit Check (Alpha Vantage specific)
                if (json['Information'] || json['Note']) {
                    console.warn('Alpha Vantage Rate Limit Hit:', json);
                    throw new Error('API Rate Limit Hit (Alpha Vantage)');
                }

                if (isMounted) {
                    setData(json);
                    setLastUpdated(new Date());
                    useCacheStore.getState().setCache(url, json);
                    setIsMock(false);
                    setError(null);
                    lastFetchRef.current = Date.now();
                }
            } catch (err: any) {
                if (isMounted) {
                    console.warn(`[Polling] Error for ${url}:`, err.message);

                    // 3. ROBUST FALLBACK (Strict Real Data Policy)
                    // If network fails (Rate Limit), we check the store AGAIN.
                    // We must find ANY cached data (even if old).
                    const fallbackCache = useCacheStore.getState().getCache(url);

                    if (fallbackCache) {
                        console.log(`[Polling] Recovering from Stale Cache for ${url}`);
                        setData(fallbackCache.data);
                        setLastUpdated(new Date(fallbackCache.timestamp));
                        setIsMock(false);
                        setError(null);
                    } else {
                        setError(err.message || 'Failed to fetch');
                        setIsMock(false);
                    }
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        const id = setInterval(fetchData, intervalMs);

        return () => {
            isMounted = false;
            clearInterval(id);
        };
    }, [url, effectiveInterval]);

    return { data, error, loading, lastUpdated, isMock };
}
