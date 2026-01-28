'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { WidgetConfig } from '@/types';
import { useDashboardStore } from '@/store/dashboardStore';

interface ChartWidgetProps {
    data: Array<{ activeX: any; activeY: any }>;
    widget?: WidgetConfig;
}

export const ChartWidget = ({ data, widget }: ChartWidgetProps) => {
    const { theme } = useDashboardStore();

    const isDark = theme === 'dark';

    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const axisColor = isDark ? '#94a3b8' : '#64748b';
    const labelColor = isDark ? '#f1f5f9' : '#334155';
    const gridOpacity = 1;

    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 p-4 text-center">
                <p>No chart data available.</p>
                <p className="opacity-50 mt-1">Check API or Field Mapping.</p>
            </div>
        );
    }

    const getYAxisLabel = (): string => {
        if (!widget?.dataMap?.yField) return 'Value';

        const field = widget.dataMap.yField;
        const primary = widget.dataMap.primary || '';

        if (!isNaN(Number(field))) {
            const primaryName = primary.split('.').pop() || primary;
            if (primaryName) {
                return primaryName.toUpperCase().replace(/_/g, ' ');
            }
        }

        const fieldName = field.split('.').pop() || field;

        const labelMap: Record<string, string> = {
            'c': 'Price',
            'o': 'Open',
            'h': 'High',
            'l': 'Low',
            'v': 'Vol',
            '1': 'Price',
        };

        return labelMap[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    };

    const getXAxisLabel = (): string => {
        if (!widget?.dataMap?.xField) return 'Date';
        const field = widget.dataMap.xField;
        const fieldName = field.split('.').pop() || field;

        if (fieldName === '0') return 'Date';
        if (fieldName === '1') return 'Price';

        return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    };

    const yAxisLabel = getYAxisLabel();
    const xAxisLabel = getXAxisLabel();

    const formatPreference = widget?.dataMap?.format || 'auto';

    const toCompact = (val: number): string => {
        const absVal = Math.abs(val);
        if (absVal >= 1000000000000) return (val / 1000000000000).toFixed(1) + 'T';
        if (absVal >= 1000000000) return (val / 1000000000).toFixed(1) + 'B';
        if (absVal >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        if (absVal >= 1000) return (val / 1000).toFixed(1) + 'k';
        return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
    };

    const formatValue = (val: any): string => {
        if (typeof val !== 'number') return val;
        return toCompact(val);
    };

    const formatTooltip = (val: any): string => {
        if (typeof val !== 'number') return val;

        if (formatPreference === 'currency') return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        if (formatPreference === 'percent') return val.toFixed(2) + '%';
        if (formatPreference === 'number') return val.toLocaleString();

        return val.toLocaleString();
    };

    return (
        <div className="flex flex-col h-full overflow-hidden p-4 pt-6">
            {/* Header info / Legendary can go here if needed */}
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={gridOpacity} vertical={false} />
                    <XAxis
                        dataKey="activeX"
                        tick={{ fontSize: 9, fill: axisColor }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={40}
                        tickMargin={10}
                        label={{ value: xAxisLabel, position: 'insideBottom', offset: -10, fontSize: 10, fill: axisColor, fontWeight: 600 }}
                    />
                    <YAxis
                        dataKey="activeY"
                        width={90}
                        tick={{ fontSize: 9, fill: axisColor }}
                        tickLine={false}
                        axisLine={false}
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => {
                            if (typeof val !== 'number') return val;

                            if (formatPreference === 'currency') return '$' + toCompact(val);
                            if (formatPreference === 'percent') return toCompact(val) + '%';
                            if (formatPreference === 'number') return toCompact(val);

                            return toCompact(val);
                        }}
                        label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: 15, fontSize: 10, fill: axisColor, fontWeight: 600 }}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                            backgroundColor: isDark ? '#1e293b' : '#ffffff',
                            color: isDark ? '#f1f5f9' : '#1e293b'
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                        formatter={(value: any) => [
                            formatTooltip(value),
                            yAxisLabel
                        ]}
                    />
                    <Area
                        type="monotone"
                        dataKey="activeY"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorVal)"
                        animationDuration={1000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
