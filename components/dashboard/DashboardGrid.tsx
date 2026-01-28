'use client';

import React, { useEffect, useState } from 'react';
import { Responsive } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { useDashboardStore } from '@/store/dashboardStore';
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer';
import { useWidth } from '@/lib/useWidth';
import { EditWidgetModal } from '../builder/EditWidgetModal';

export const DashboardGrid = () => {
    const { widgets, updateLayout, isEditMode, editingWidgetId, setEditingWidget } = useDashboardStore();
    const [mounted, setMounted] = useState(false);
    const [currentBreakpoint, setCurrentBreakpoint] = useState('lg');
    const { containerRef, width } = useWidth();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (['sm', 'xs', 'xxs'].includes(currentBreakpoint)) return;

        const corruptedWidgets = widgets.filter(w => w.layout.w === 1);

        if (corruptedWidgets.length > 0) {
            console.log('Detected corrupted widgets, healing...', corruptedWidgets);
            const healedLayout = widgets.map(w => ({
                ...w.layout,
                w: w.layout.w === 1 ? 6 : w.layout.w
            }));
            updateLayout(healedLayout);
        }
    }, [widgets, currentBreakpoint, mounted, updateLayout]);

    if (!mounted) return <div className="p-10 text-center text-slate-400">Loading Dashboard...</div>;

    // Generate Responsive Layouts
    const layouts = {
        lg: widgets.map((w) => w.layout),
        md: widgets.map((w) => w.layout),
        sm: widgets.map((w) => ({ ...w.layout, w: 1, x: 0 })),
        xs: widgets.map((w) => ({ ...w.layout, w: 1, x: 0 })),
        xxs: widgets.map((w) => ({ ...w.layout, w: 1, x: 0 })),
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors pb-20 flex flex-col items-center">
            <div ref={containerRef} className="dashboard-container pt-8 min-h-screen">
                <Responsive
                    className="layout mb-20"
                    margin={[10, 10]}
                    layouts={layouts}
                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                    cols={{ lg: 12, md: 12, sm: 1, xs: 1, xxs: 1 }}
                    rowHeight={80}
                    width={width || 1200}
                    // @ts-ignore
                    draggableHandle=".drag-handle"
                    draggableCancel=".recharts-wrapper"
                    isDraggable={true}
                    isResizable={isEditMode}

                    // Critical: Update breakpoint state so we know when to lock writes
                    onBreakpointChange={(newBreakpoint: string) => setCurrentBreakpoint(newBreakpoint)}

                    // Write-Lock: FAIL-SAFE to stop Mobile/Tablet layouts from corrupting Desktop DB
                    onLayoutChange={(currentLayout: any) => {
                        // Only allow saving on Desktop (lg, md)
                        if (!['sm', 'xs', 'xxs'].includes(currentBreakpoint)) {
                            updateLayout(currentLayout);
                        }
                    }}

                >
                    {widgets.map((widget) => (
                        <div key={widget.id}>
                            {/* WidgetRenderer handles the Wrapper and Logic internally now */}
                            <WidgetRenderer widget={widget} />
                        </div>
                    ))}
                </Responsive>

                {widgets.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[50vh] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl m-4">
                        <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-400">Your Dashboard is Empty</h2>
                        <p className="text-slate-400 mt-2">Click "Add Widget" to get started</p>
                    </div>
                )}

                {/* Global Edit Widget Modal */}
                {editingWidgetId && (
                    (() => {
                        const widgetToEdit = widgets.find(w => w.id === editingWidgetId);
                        if (!widgetToEdit) return null;
                        return (
                            <EditWidgetModal
                                widget={widgetToEdit}
                                onClose={() => setEditingWidget(null)}
                            />
                        );
                    })()
                )}
            </div>
        </div>
    );
};
