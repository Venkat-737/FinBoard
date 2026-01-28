export type WidgetType = 'CARD' | 'TABLE' | 'CHART';
export type ChartVariant = 'line';

export interface WidgetConfig {
    id: string;
    title: string;
    description?: string;
    type: WidgetType;
    apiConfig: {
        endpoint: string;
        adapterId: 'generic' | 'alpha_vantage';
        pollingInterval: number; // seconds
    };
    dataMap: {
        primary?: string;   // Card: value, Table: list path
        delta?: string;     // Card: change %
        subtitle?: string;  // Card: label
        xField?: string;    // Chart: Time axis
        yField?: string;    // Chart: Value axis
        tableColumns?: { header: string; key: string }[];
        format?: 'auto' | 'currency' | 'percent' | 'number';
    };
    style?: {
        chartVariant?: ChartVariant;
    };
    layout: {
        i: string;
        x: number;
        y: number;
        w: number;
        h: number;
    };
}

export type Theme = 'dark' | 'light';

export interface DashboardState {
    widgets: WidgetConfig[];
    theme: Theme;
    isEditMode: boolean;
    viewMode: 'custom' | 'template';
    editingWidgetId: string | null;
    addWidget: (widget: WidgetConfig) => void;
    removeWidget: (id: string) => void;
    updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
    updateLayout: (layouts: { i: string; x: number; y: number; w: number; h: number }[]) => void;
    setWidgets: (widgets: WidgetConfig[]) => void;
    toggleEditMode: () => void;
    setTheme: (theme: Theme) => void;
    setEditingWidget: (id: string | null) => void;
    setViewMode: (mode: 'custom' | 'template') => void;
}
