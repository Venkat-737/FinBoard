'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardWidgetProps {
    data: {
        primary?: any;
        delta?: any;
        subtitle?: string;
        format?: 'auto' | 'currency' | 'percent' | 'number';
    }
}

export const CardWidget = ({ data }: CardWidgetProps) => {
    const { primary, delta, subtitle, format = 'auto' } = data || {};

    const extractPrimitive = (val: any, depth = 0): string | number => {
        if (depth > 5) return '[Complex Data]';
        if (val === null || val === undefined) return '--';

        if (typeof val === 'number') return val;
        if (typeof val === 'string') return val;
        if (typeof val === 'boolean') return val.toString();

        // Handle arrays - try to find first primitive
        if (Array.isArray(val)) {
            for (const item of val) {
                const result = extractPrimitive(item, depth + 1);
                if (result !== '--' && result !== '[Complex Data]') return result;
            }
            return `[${val.length} items]`;
        }

        // Handle objects - search for known value keys first
        if (typeof val === 'object') {
            const priorityKeys = [
                'value', 'price', 'amount', 'c', 'close', 'last',
                'NSE', 'BSE', 'current', 'currentPrice',
                'symbol', 'name', 'title', 'label',
                'companyName', 'ticker'
            ];

            // Try priority keys first
            for (const key of priorityKeys) {
                if (val[key] !== undefined && val[key] !== null) {
                    const result = extractPrimitive(val[key], depth + 1);
                    if (result !== '--' && result !== '[Complex Data]') return result;
                }
            }

            // Try all values
            const values = Object.values(val);
            for (const v of values) {
                const result = extractPrimitive(v, depth + 1);
                if (result !== '--' && result !== '[Complex Data]') return result;
            }

            // stringify
            try {
                const str = JSON.stringify(val);
                return str.length > 20 ? str.slice(0, 17) + '...' : str;
            } catch {
                return '[Object]';
            }
        }

        return String(val);
    };

    const toCompact = (val: number): string => {
        const absVal = Math.abs(val);
        if (absVal >= 1000000000000) return (val / 1000000000000).toFixed(1) + 'T';
        if (absVal >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
        if (absVal >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (absVal >= 1000) return (val / 1000).toFixed(1) + 'k';
        return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    const formatValue = (val: any): string => {
        const primitive = extractPrimitive(val);
        let num: number | null = null;

        if (typeof primitive === 'number') {
            num = primitive;
        } else if (typeof primitive === 'string') {
            const parsed = parseFloat(primitive);
            if (!isNaN(parsed)) num = parsed;
        }

        if (num !== null) {
            if (format === 'currency') return '$' + toCompact(num);
            if (format === 'percent') return toCompact(num) + '%';
            if (format === 'number') return toCompact(num);

            return toCompact(num);
        }

        return String(primitive);
    };

    const formatDelta = (val: any): { text: string; color: string; Icon: any } => {
        const primitive = extractPrimitive(val);

        if (typeof primitive === 'number') {
            const isPos = primitive > 0;
            const isNeg = primitive < 0;
            return {
                text: Math.abs(primitive).toFixed(2) + '%',
                color: isPos ? 'text-green-500' : isNeg ? 'text-red-500' : 'text-slate-500',
                Icon: isPos ? ArrowUp : isNeg ? ArrowDown : Minus
            };
        }

        if (typeof primitive === 'string') {
            const num = parseFloat(primitive);
            if (!isNaN(num)) return formatDelta(num);
        }

        return { text: String(primitive), color: 'text-slate-500', Icon: Minus };
    };

    const deltaInfo = formatDelta(delta);
    const DeltaIcon = deltaInfo.Icon;

    return (
        <div className="flex flex-col h-full pt-2 pb-6 px-4 mb-4">
            <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1 uppercase tracking-wider">
                {subtitle}
            </h4>
            <div className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight mb-2">
                {formatValue(primary)}
            </div>
            {delta !== undefined && (
                <div className={cn("flex items-center gap-1 mt-auto text-sm font-bold pb-8", deltaInfo.color)}>
                    <DeltaIcon size={14} strokeWidth={3} />
                    <span>{deltaInfo.text}</span>
                </div>
            )}
        </div>
    );
};
