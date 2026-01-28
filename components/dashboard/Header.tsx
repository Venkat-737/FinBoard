'use client';

import React from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Plus, LayoutTemplate, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardControls } from './DashboardControls';

interface HeaderProps {
    onAddWidget: () => void;
}

export const Header = ({ onAddWidget }: HeaderProps) => {
    const { isEditMode, toggleEditMode, theme, setTheme } = useDashboardStore();

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <header className="w-full h-16 glass-panel border-b-0 sticky top-0 z-50 flex items-center">
            <div className="dashboard-container flex items-center justify-between px-4 sm:px-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                        F
                    </div>
                    <h1 className="text-xl font-bold tracking-tight bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                        FinBoard
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />

                    {/* Edit Mode Toggle */}
                    <button
                        onClick={toggleEditMode}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border",
                            isEditMode
                                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25"
                                : "text-slate-600 border-slate-200 hover:border-slate-300 dark:text-slate-300 dark:border-slate-800 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                        )}
                    >
                        <LayoutTemplate size={16} />
                        {isEditMode ? 'Finish' : 'Edit'}
                    </button>

                    <DashboardControls />

                    {/* Add Widget Button */}
                    <button
                        onClick={onAddWidget}
                        className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-xl hover:scale-105 active:scale-95"
                    >
                        <Plus size={18} />
                        Add Widget
                    </button>
                </div>
            </div>
        </header>
    );
};
