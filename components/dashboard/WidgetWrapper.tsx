'use client';

import React, { useState } from 'react';
import { WidgetConfig } from '@/types';
import { cn } from '@/lib/utils';
import { X, Settings, GripHorizontal, RefreshCw } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { EditWidgetModal } from '../builder/EditWidgetModal';

interface WidgetWrapperProps {
    widget: WidgetConfig;
    children: React.ReactNode;
    loading?: boolean;
    error?: string | null;
    isMock?: boolean;
    lastUpdated?: Date | null;
    className?: string;
    style?: React.CSSProperties;
    onMouseDown?: React.MouseEventHandler;
    onMouseUp?: React.MouseEventHandler;
    onTouchEnd?: React.TouchEventHandler;
}

export const WidgetWrapper = React.forwardRef<HTMLDivElement, WidgetWrapperProps>(
    ({ widget, children, loading = false, error = null, isMock = false, lastUpdated, className, style, onMouseDown, onMouseUp, onTouchEnd, ...props }, ref) => {
        const { removeWidget, isEditMode, setEditingWidget } = useDashboardStore();

        return (
            <div
                ref={ref}
                style={style}
                className={cn(
                    "glass-panel rounded-2xl flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-white/30 dark:hover:border-white/20",
                    className
                )}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
                onTouchEnd={onTouchEnd}
                {...props}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100/50 dark:border-white/5 bg-slate-50/30 dark:bg-white/5">
                    <div className="flex items-center gap-2">
                        {/* Drag Handle */}
                        <div className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 drag-handle">
                            <GripHorizontal size={16} />
                        </div>
                        <div className="flex flex-col">
                            <h3 className="font-bold text-[13px] tracking-tight text-slate-800 dark:text-slate-100 uppercase flex items-center gap-2" title={widget.title}>
                                {widget.title}
                                {widget.title.includes('(') && (
                                    <span className="bg-blue-600 text-[9px] px-1.5 py-0.5 rounded text-white font-black tracking-widest shadow-sm">
                                        {widget.title.match(/\((.*?)\)/)?.[1] || ''}
                                    </span>
                                )}
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium ml-2">
                                    (via {widget.apiConfig.endpoint.includes('coingecko') ? 'CoinGecko' :
                                        widget.apiConfig.endpoint.includes('alphavantage') ? 'Alpha Vantage' :
                                            widget.apiConfig.endpoint.includes('finnhub') ? 'Finnhub' : 'API'})
                                </span>
                            </h3>
                            {widget.description && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2" title={widget.description}>
                                    {widget.description}
                                </p>
                            )}
                        </div>
                        {/* Status Badge */}
                        {!loading && !error && (
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded-full font-medium border ml-2 self-start mt-0.5",
                                isMock
                                    ? "bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                                    : "bg-green-100 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                            )} title={isMock ? "Using Preview Data (API Limit or Network blocked)" : "Live Data from API"}>
                                {isMock ? "Preview" : "Live"}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {loading && <RefreshCw size={14} className="animate-spin text-blue-500" />}
                        {isEditMode && (
                            <>
                                <button
                                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md text-slate-400 transition-colors"
                                    onClick={() => setEditingWidget(widget.id)}
                                    title="Edit widget settings"
                                >
                                    <Settings size={14} />
                                </button>
                                <button
                                    onClick={() => removeWidget(widget.id)}
                                    className="p-1.5 hover:bg-red-100 hover:text-red-500 rounded-md text-slate-400 transition-colors"
                                    title="Delete widget"
                                >
                                    <X size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-4 pt-2 pb-12 overflow-x-hidden relative min-h-0">
                    {error ? (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-500 bg-red-50/10 p-4 text-center">
                            {error}
                        </div>
                    ) : (
                        children
                    )}
                </div>

                {/* Last Updated Timestamp */}
                {lastUpdated && !error && (
                    <div className="px-5 py-2 border-t border-slate-100/50 dark:border-white/5 bg-slate-50/30 dark:bg-white/5 flex justify-between items-center">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </p>
                    </div>
                )}
            </div>
        );
    }
);

WidgetWrapper.displayName = 'WidgetWrapper';
