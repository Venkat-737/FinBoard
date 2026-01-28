'use client';

import React, { useMemo } from 'react';
import { WidgetConfig } from '@/types';
import { usePolling } from '@/lib/usePolling';
import { processWidgetData } from '@/lib/api-adapters';
import { WidgetWrapper } from '../dashboard/WidgetWrapper';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

import { CardWidget } from './CardWidget';
import { TableWidget } from './TableWidget';
import { ChartWidget } from './ChartWidget';

interface WidgetRendererProps {
    widget: WidgetConfig;
}

export const WidgetRenderer = ({ widget }: WidgetRendererProps) => {
    const { data, loading, error, lastUpdated, isMock } = usePolling(widget.apiConfig.endpoint, widget.apiConfig.pollingInterval);

    const processedData = useMemo(() => {
        if (!data) return null;
        return processWidgetData(data, widget);
    }, [data, widget]);

    const renderContent = () => {
        if (!processedData && loading) return <div className="animate-pulse h-full bg-slate-100 dark:bg-slate-800 rounded opacity-50" />;
        if (!processedData) return <div className="text-xs text-slate-400">Waiting for data...</div>;

        switch (widget.type) {
            case 'CARD':
                return <CardWidget data={{ ...processedData, format: widget.dataMap?.format }} />;
            case 'TABLE':
                return <TableWidget data={processedData} format={widget.dataMap?.format} />;
            case 'CHART':
                return <ChartWidget data={processedData} widget={widget} />;
            default:
                return <div className="text-red-500">Unknown Widget Type</div>;
        }
    };

    return (
        <WidgetWrapper
            widget={widget}
            loading={loading}
            error={error}
            isMock={isMock}
            lastUpdated={lastUpdated}
            className="h-full w-full"
        >
            <ErrorBoundary>
                {renderContent()}
            </ErrorBoundary>
        </WidgetWrapper>
    );
};
