'use client';

import React, { useRef } from 'react';
import { Download, Upload, Database, Layout } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { cn } from '@/lib/utils';
import { WidgetConfig } from '@/types';
import { getTemplate } from './templates';

export const DashboardControls = () => {
    const { widgets, addWidget, setWidgets, viewMode, setViewMode } = useDashboardStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const data = JSON.stringify(widgets, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (Array.isArray(json)) {
                    const validWidgets = json.filter((w: any) => w.id && w.type && w.layout);
                    if (validWidgets.length > 0) {

                        const isTemplateMode = viewMode === 'template';

                        const warning = isTemplateMode
                            ? "\n\n⚠️ Note: You are adding to a Template.\nThese changes are session-only unless you Export."
                            : "\n\n(Added to bottom of your dashboard)";

                        const shouldMerge = confirm(`Import ${validWidgets.length} widgets?${warning}`);

                        if (shouldMerge) {
                            // 1. Calculate new Y position (Append to bottom)
                            const maxY = widgets.reduce((max, w) => Math.max(max, w.layout.y + w.layout.h), 0);

                            // 2. Prepare new widgets (New IDs + shifted Y position)
                            const newWidgets = validWidgets.map((w: WidgetConfig, index: number) => ({
                                ...w,
                                id: `imported-${Date.now()}-${index}`, // Fresh ID
                                layout: {
                                    ...w.layout,
                                    i: `imported-${Date.now()}-${index}`,
                                    y: maxY + (w.layout.y || 0) // Shift down
                                }
                            }));

                            // 3. Merge and Update
                            setWidgets([...widgets, ...newWidgets]);
                            // If we were in template mode and added something, strictly we are still in template mode session
                            setTimeout(() => window.location.reload(), 100);
                        }
                    } else {
                        alert('No valid widgets found in JSON.');
                    }
                }
            } catch (err) {
                alert('Invalid JSON file');
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const loadTemplate = (key: string) => {
        if (widgets.length > 0) {
            if (!confirm('This will replace your current dashboard. Continue?')) return;
            // AUTO-BACKUP: Save current user widgets before overwriting
            localStorage.setItem('finboard_user_backup', JSON.stringify(widgets));
        }

        const templateWidgets = getTemplate(key);
        setWidgets(templateWidgets);
        setViewMode('template'); // <--- Marked as Template Mode
        setTimeout(() => window.location.reload(), 100);
    };

    // START MOck Toggle Implementation
    const [isMockActive, setIsMockActive] = React.useState(false);

    React.useEffect(() => {
        const stored = sessionStorage.getItem('use_mock') === 'true';
        setIsMockActive(stored);
    }, []);

    const toggleMock = () => {
        const newValue = !isMockActive;
        sessionStorage.setItem('use_mock', newValue.toString());
        setIsMockActive(newValue);
        window.location.reload();
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={toggleMock}
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    isMockActive ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
                title="Toggle Mock Data (No API usage)"
            >
                <Database size={14} />
                {isMockActive ? 'Mock On' : 'Live'}
            </button>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Template Dropdown (Simple Hover/Click for now) */}
            <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <Layout size={14} />
                    Templates
                </button>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                    <button onClick={() => loadTemplate('crypto')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        🚀 Crypto Tracker
                    </button>
                    <button onClick={() => loadTemplate('stocks')} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                        📈 Stock Market
                    </button>

                    {/* Restore Feature */}
                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                    <button
                        onClick={() => {
                            const backup = localStorage.getItem('finboard_user_backup');
                            if (backup) {
                                if (confirm('Restore your previous custom widgets?')) {
                                    setWidgets(JSON.parse(backup));
                                    setViewMode('custom'); // Reset to Custom Mode
                                    setTimeout(() => window.location.reload(), 100);
                                }
                            } else {
                                alert('No saved layout found.');
                            }
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium"
                    >
                        ↺ Restore My Widgets
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                    <button onClick={() => { setWidgets([]); setViewMode('custom'); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        🗑️ Clear All
                    </button>
                </div>
            </div>

            <button
                onClick={handleExport}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Export Dashboard"
            >
                <Download size={18} />
            </button>

            <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Import Dashboard"
            >
                <Upload size={18} />
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
            />
        </div>
    );
};
