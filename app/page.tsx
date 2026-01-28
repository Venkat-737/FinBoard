'use client';

import React, { useEffect, useState } from 'react';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { Header } from '@/components/dashboard/Header';
import { AddWidgetModal } from '@/components/builder/AddWidgetModal';
import { useDashboardStore } from '@/store/dashboardStore';

export default function Home() {
  const { theme, setTheme } = useDashboardStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize theme on mount to avoid hydration mismatch
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      <Header onAddWidget={() => setIsModalOpen(true)} />

      <DashboardGrid />

      {/* Placeholder for Modal - Phase 3 will implement this */}
      {isModalOpen && <AddWidgetModal onClose={() => setIsModalOpen(false)} />}
    </main>
  );
}
