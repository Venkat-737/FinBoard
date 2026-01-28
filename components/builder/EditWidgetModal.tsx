'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { WidgetConfig } from '@/types';
import { useDashboardStore } from '@/store/dashboardStore';
import { JsonPathPicker } from './JsonPathPicker';
import { cn } from '@/lib/utils';

interface EditWidgetModalProps {
    widget: WidgetConfig;
    onClose: () => void;
}

export const EditWidgetModal = ({ widget, onClose }: EditWidgetModalProps) => {
    const { updateWidget } = useDashboardStore();
    const [title, setTitle] = useState(widget.title);
    const [description, setDescription] = useState(widget.description || '');
    const [apiUrl, setApiUrl] = useState(widget.apiConfig.endpoint);
    const [refreshInterval, setRefreshInterval] = useState(widget.apiConfig.pollingInterval);

    const [dataMap, setDataMap] = useState(widget.dataMap);
    const [activeInput, setActiveInput] = useState<string>('primary');

    const handleSave = () => {
        updateWidget(widget.id, {
            title,
            ...(description && { description }),
            apiConfig: {
                ...widget.apiConfig,
                endpoint: apiUrl,
                pollingInterval: refreshInterval
            },
            dataMap
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">

                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h2 className="text-lg font-bold">Edit Widget</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Basic Settings */}
                    <div className="space-y-4">
                        {/* Widget Title */}
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-500">Widget Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        {/* Widget Description */}
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-500">
                                Description <span className="text-slate-400 font-normal">(optional)</span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Add a brief description..."
                                rows={2}
                            />
                        </div>

                        {/* Refresh Interval */}
                        <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-500">Refresh (sec)</label>
                            <input
                                type="number"
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                min="5"
                                max="300"
                            />
                        </div>
                    </div>

                    {/* API URL Section */}
                    <div>
                        <label className="block text-xs font-semibold mb-1 text-slate-500">API Endpoint</label>
                        <input
                            type="text"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                            className="w-full px-3 py-2 font-mono text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    {/* FIELD SELECTION INTERFACE */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">Data Mapping</span>
                            <span className="text-[10px] text-blue-500">Click JSON to select fields</span>
                        </div>

                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: JSON Explorer */}
                            <div>
                                <JsonPathPicker
                                    url={apiUrl}
                                    label="API Response Explorer"
                                    onPick={(path, val) => {
                                        if (activeInput === 'primary') setDataMap(prev => ({ ...prev, primary: path }));
                                        if (activeInput === 'delta') setDataMap(prev => ({ ...prev, delta: path }));
                                        if (activeInput === 'subtitle') setDataMap(prev => ({ ...prev, subtitle: path }));
                                        if (activeInput === 'xField') setDataMap(prev => ({ ...prev, xField: path }));
                                        if (activeInput === 'yField') setDataMap(prev => ({ ...prev, yField: path }));
                                    }}
                                    selectedPath={typeof dataMap[activeInput as keyof typeof dataMap] === 'string' ? dataMap[activeInput as keyof typeof dataMap] as string : undefined}
                                />
                            </div>

                            {/* Right: Field Inputs */}
                            <div className="space-y-4">
                                {widget.type === 'CARD' && (
                                    <>
                                        <div
                                            className={cn("p-2 rounded-lg border cursor-pointer transition-all", activeInput === 'primary' ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-800 hover:border-slate-300")}
                                            onClick={() => setActiveInput('primary')}
                                        >
                                            <label className="text-xs font-semibold text-slate-500 cursor-pointer">Primary Value Field</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <input
                                                    value={dataMap.primary || ''}
                                                    onChange={e => setDataMap({ ...dataMap, primary: e.target.value })}
                                                    className="w-full bg-transparent text-sm font-mono outline-none text-slate-700 dark:text-slate-200"
                                                    placeholder="Select from JSON..."
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className={cn("p-2 rounded-lg border cursor-pointer transition-all", activeInput === 'delta' ? "border-green-500 bg-green-50/50 dark:bg-green-900/20" : "border-slate-200 dark:border-slate-800 hover:border-slate-300")}
                                            onClick={() => setActiveInput('delta')}
                                        >
                                            <label className="text-xs font-semibold text-slate-500 cursor-pointer">Change % Field</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                <input
                                                    value={dataMap.delta || ''}
                                                    onChange={e => setDataMap({ ...dataMap, delta: e.target.value })}
                                                    className="w-full bg-transparent text-sm font-mono outline-none text-slate-700 dark:text-slate-200"
                                                    placeholder="Optional..."
                                                />
                                            </div>
                                        </div>

                                        <div
                                            className={cn("p-2 rounded-lg border cursor-pointer transition-all", activeInput === 'subtitle' ? "border-amber-500 bg-amber-50/50 dark:bg-amber-900/20" : "border-slate-200 dark:border-slate-800 hover:border-slate-300")}
                                            onClick={() => setActiveInput('subtitle')}
                                        >
                                            <label className="text-xs font-semibold text-slate-500 cursor-pointer">Label / Subtitle</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                                <input
                                                    value={dataMap.subtitle || ''}
                                                    onChange={e => setDataMap({ ...dataMap, subtitle: e.target.value })}
                                                    className="w-full bg-transparent text-sm font-mono outline-none text-slate-700 dark:text-slate-200"
                                                    placeholder="USD or path..."
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {widget.type === 'CHART' && (
                                    <>
                                        <div
                                            className={cn("p-2 rounded-lg border cursor-pointer transition-all", activeInput === 'yField' ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-800 hover:border-slate-300")}
                                            onClick={() => setActiveInput('yField')}
                                        >
                                            <label className="text-xs font-semibold text-slate-500 cursor-pointer">Y-Axis Data (Values)</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                <input
                                                    value={dataMap.yField || ''}
                                                    onChange={e => setDataMap({ ...dataMap, yField: e.target.value })}
                                                    className="w-full bg-transparent text-sm font-mono outline-none text-slate-700 dark:text-slate-200"
                                                    placeholder="array path or key..."
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Formatting Option */}
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <label className="block text-xs font-semibold mb-1 text-slate-500">Value Formatting</label>
                                    <select
                                        value={dataMap.format || 'auto'}
                                        onChange={(e) => setDataMap({ ...dataMap, format: e.target.value as any })}
                                        className="w-full px-2 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none"
                                    >
                                        <option value="auto">Auto-detect</option>
                                        <option value="currency">Currency ($)</option>
                                        <option value="percent">Percentage (%)</option>
                                        <option value="number">Number (1,234)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
