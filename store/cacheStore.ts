import { create } from 'zustand';

interface CacheEntry {
    data: any;
    timestamp: number;
}

interface CacheState {
    cache: Record<string, CacheEntry>;
    setCache: (key: string, data: any) => void;
    getCache: (key: string) => CacheEntry | undefined;
}

import { persist, createJSONStorage } from 'zustand/middleware';

export const useCacheStore = create<CacheState>()(
    persist(
        (set, get) => ({
            cache: {},
            setCache: (key, data) =>
                set((state) => ({
                    cache: {
                        ...state.cache,
                        [key]: { data, timestamp: Date.now() },
                    },
                })),
            getCache: (key) => get().cache[key],
        }),
        {
            name: 'finboard-api-cache',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
