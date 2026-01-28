'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getNestedValue } from '@/lib/data-utils';

interface JsonExplorerProps {
    data: any;
    onSelectPath: (path: string, value: any) => void;
    selectedPaths?: Record<string, string>; // e.g. { primary: 'data.rates' }
    widgetType?: 'CARD' | 'TABLE' | 'CHART' | null;
}

const JsonNode = ({
    data,
    path = '',
    onSelectPath,
    level = 0,
    widgetType,
    isRootArray = false
}: {
    data: any;
    path?: string;
    onSelectPath: (path: string, value: any) => void;
    level?: number;
    widgetType?: 'CARD' | 'TABLE' | 'CHART' | null;
    isRootArray?: boolean;
}) => {
    const [expanded, setExpanded] = useState<boolean>(level < 1); // Expand first level by default

    if (typeof data === 'object' && data !== null) {
        const isArray = Array.isArray(data);
        const keys = Object.keys(data);
        const isEmpty = keys.length === 0;

        return (
            <div className="text-sm font-mono">
                <div
                    className="flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 rounded cursor-pointer select-none"
                    onClick={() => setExpanded(!expanded)}
                    style={{ paddingLeft: `${level * 12}px` }}
                >
                    {isEmpty ? <div className="w-4" /> : (
                        expanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />
                    )}
                    <span className="text-purple-600 dark:text-purple-400 font-bold">{(!path || path === 'ROOT') ? 'Main List' : path.split('.').pop()}</span>
                    <span className="text-slate-400">:</span>
                    <span className="text-slate-500">{isArray ? `Array[${keys.length}]` : `{Object}`}</span>

                    {/* Select Button for Object/Array - Hide for TABLE child items */}
                    {!(widgetType === 'TABLE' && level > 0 && isRootArray) && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelectPath(path || 'ROOT', data);
                            }}
                            className="ml-auto px-2 py-0.5 text-[10px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
                        >
                            Select
                        </button>
                    )}
                </div>

                {expanded && !isEmpty && (
                    <div>
                        {keys.map((key) => (
                            <JsonNode
                                key={key}
                                data={data[key]}
                                path={path ? `${path}.${key}` : key}
                                onSelectPath={onSelectPath}
                                level={level + 1}
                                widgetType={widgetType}
                                isRootArray={isArray && level === 0}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Primitive Value
    return (
        <div
            className="group flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 p-0.5 rounded cursor-pointer"
            style={{ paddingLeft: `${level * 12}px` }}
            onClick={() => onSelectPath(path, data)}
        >
            <div className="w-4" />
            <span className="text-blue-600 dark:text-blue-400">{path.split('.').pop()}</span>
            <span className="text-slate-400">:</span>
            <span className="text-green-600 dark:text-green-400 truncate max-w-[200px] inline-block align-bottom">
                {String(data)}
            </span>
        </div>
    );
};

export const JsonExplorer = ({ data, onSelectPath, widgetType }: JsonExplorerProps) => {
    if (!data) return <div className="text-slate-400 text-sm italic p-4">No data loaded</div>;

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-black overflow-auto max-h-[300px]">
            <JsonNode data={data} onSelectPath={onSelectPath} widgetType={widgetType} />
        </div>
    );
};
