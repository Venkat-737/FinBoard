'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMockData } from '@/lib/mock-service';
import { useCacheStore } from '@/store/cacheStore';

interface JsonPathPickerProps {
    url: string;
    onPick: (path: string, value: any) => void;
    label: string;
    selectedPath?: string;
}

export const JsonPathPicker = ({ url, onPick, label, selectedPath }: JsonPathPickerProps) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCached, setIsCached] = useState(false); // Track if using cached real data
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'ROOT': true });

    const fetchData = async () => {
        if (!url) return;
        setLoading(true);
        setError(null);
        setIsCached(false);

        const globalMockEnabled = typeof window !== 'undefined' && sessionStorage.getItem('use_mock') === 'true';

        if (globalMockEnabled || url.includes('YOUR_API_KEY')) {
            const mock = getMockData(url) as any;
            if (mock) {
                setData(mock);
                setLoading(false);
                return;
            }
        }

        try {
            // Attempt real fetch first
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!res.ok) {
                if (res.status === 429) throw new Error('Rate limit reached');
                throw new Error(`HTTP ${res.status}`);
            }

            const json = await res.json();

            // Rate Limit Check
            if (json['Information'] || json['Note']) {
                throw new Error('API Rate Limit Hit');
            }

            // Success: Update Cache
            useCacheStore.getState().setCache(url, json);
            setData(json);

        } catch (err: any) {
            console.warn("JsonPathPicker: Real fetch failed", err.message);

            // CACHE FALLBACK STRATEGY (Strict Real Data)
            // If live call fails, check if we have ANY valid data in our store
            const cached = useCacheStore.getState().getCache(url);

            if (cached) {
                console.log("JsonPathPicker: Recovering from Cache");
                setData(cached.data);
                setIsCached(true);
            } else {
                setError(`Failed to fetch: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (path: string) => {
        setExpanded(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const renderTree = (node: any, path: string = '') => {
        if (node === null) return <span className="text-slate-400">null</span>;

        const isObj = typeof node === 'object';
        const isArray = Array.isArray(node);
        const isEmpty = isObj && Object.keys(node).length === 0;

        if (!isObj) {
            return (
                <div
                    className={cn(
                        "group flex items-center gap-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 rounded py-0.5 transition-colors",
                        selectedPath === path && "bg-blue-100 dark:bg-blue-900/40 outline outline-1 outline-blue-400"
                    )}
                    onClick={() => onPick(path, node)}
                >
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">{path.split('.').pop()}:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono font-medium text-xs break-all">{String(node)}</span>
                    <span className="opacity-0 group-hover:opacity-100 text-blue-500 text-[10px] ml-auto">Select</span>
                </div>
            );
        }

        const keys = Object.keys(node);
        const isExpanded = expanded[path || 'ROOT'];

        return (
            <div className="ml-2">
                <div
                    className="flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 text-slate-600 dark:text-slate-400 select-none py-0.5"
                    onClick={() => toggleExpand(path || 'ROOT')}
                >
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <span className="font-mono text-xs font-semibold">{path ? path.split('.').pop() : 'ROOT'}</span>
                    <span className="text-[10px] text-slate-400">
                        {isArray ? `[${keys.length}]` : `{${keys.length}}`}
                    </span>
                </div>

                {isExpanded && !isEmpty && (
                    <div className="border-l border-slate-200 dark:border-slate-700 ml-1.5 pl-2">
                        {keys.map(key => {
                            const newPath = path ? `${path}.${key}` : key;
                            return (
                                <div key={newPath}>
                                    {renderTree(node[key], newPath)}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                <div className="flex items-center gap-2">
                    {isCached && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                            <AlertCircle size={10} /> Using Cached Data
                        </span>
                    )}
                    <button
                        onClick={fetchData}
                        disabled={!url || loading}
                        className="text-[10px] flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? <RefreshCw size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                        {data ? 'Refresh JSON' : 'Load JSON'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-500 text-xs p-2 bg-red-50 dark:bg-red-900/10 rounded">
                    <AlertCircle size={12} />
                    {error}
                </div>
            )}

            {!data && !loading && !error && (
                <div className="text-center py-4 text-xs text-slate-400 italic">
                    Enter API URL and click Load to explore fields
                </div>
            )}

            {data && (
                <div className="max-h-[200px] overflow-auto custom-scrollbar bg-white dark:bg-slate-950 rounded border border-slate-100 dark:border-slate-800/50 p-2">
                    {renderTree(data)}
                </div>
            )}
        </div>
    );
};
