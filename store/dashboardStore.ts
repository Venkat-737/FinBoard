import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DashboardState, WidgetConfig } from '@/types';

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set) => ({
            widgets: [],
            theme: 'dark',
            isEditMode: false,
            viewMode: 'custom', // Default to custom
            editingWidgetId: null,

            addWidget: (widget) =>
                set((state) => ({
                    widgets: [...state.widgets, widget],
                    viewMode: 'custom'
                })),

            removeWidget: (id) =>
                set((state) => ({
                    widgets: state.widgets.filter((w) => w.id !== id),
                })),

            updateWidget: (id, updates) =>
                set((state) => ({
                    widgets: state.widgets.map((w) =>
                        w.id === id ? { ...w, ...updates } : w
                    ),
                })),

            updateLayout: (layouts) =>
                set((state) => ({
                    widgets: state.widgets.map((w) => {
                        const layoutUpdate = layouts.find((l) => l.i === w.id);
                        if (layoutUpdate) {
                            return {
                                ...w,
                                layout: { ...w.layout, ...layoutUpdate },
                            };
                        }
                        return w;
                    }),
                })),

            setWidgets: (widgets) => set({ widgets }),

            toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),

            setTheme: (theme) => set({ theme }),

            setEditingWidget: (id) => set({ editingWidgetId: id }),

            setViewMode: (mode) => set({ viewMode: mode }),
        }),
        {
            name: 'finboard-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ widgets: state.widgets, theme: state.theme, viewMode: state.viewMode }), // Persist ViewMode
        }
    )
);
