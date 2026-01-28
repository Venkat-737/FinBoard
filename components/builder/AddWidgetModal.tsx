'use client';

import React, { useState } from 'react';
import { WidgetConfig, WidgetType } from '@/types';
import { useDashboardStore } from '@/store/dashboardStore';
import { JsonExplorer } from './JsonExplorer';
import { X, Search, Check, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { MOCK_DATA } from '@/lib/mock-service';

interface AddWidgetModalProps {
    onClose: () => void;
}

const WIDGET_TYPES: { type: WidgetType; label: string; desc: string }[] = [
    { type: 'CARD', label: 'Metric Card', desc: 'Display a single value with optional change %' },
    { type: 'TABLE', label: 'Data Table', desc: 'A list of items (requires an Array source)' },
    { type: 'CHART', label: 'Line Chart', desc: 'Visualize trends over time (requires Time Series)' },
];

export const AddWidgetModal = ({ onClose }: AddWidgetModalProps) => {
    const { addWidget } = useDashboardStore();
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
    const [apiUrl, setApiUrl] = useState('');
    const [fetchedData, setFetchedData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Field Mapping State
    const [dataMap, setDataMap] = useState<WidgetConfig['dataMap']>({});

    // Step 1: Configuration (Name + Type)
    // Step 2: Data Source (API URL + Fetch)
    // Step 3: Field Mapping (JSON Explorer)

    const handleLoadMockData = async () => {
        setLoading(true);
        setError(null);

        // Dynamic Mock Loading based on URL (matches Runtime logic)
        // This ensures the Field Mapping (Step 3) matches what usePolling will return.
        const { getMockData } = await import('@/lib/mock-service');
        const mock = getMockData(apiUrl || 'bitcoin'); // default to bitcoin if empty

        setFetchedData(mock);

        setStep(3);
        setLoading(false);
    };

    const handleFetch = async () => {
        if (!apiUrl) return;

        if (apiUrl.includes('YOUR_API_KEY') || apiUrl.includes('indianapi.in')) {
            console.log("Placeholder or IndianAPI detected, switching to Mock Data.");
            await handleLoadMockData();
            setError('⚠️ Test Mode: Using Mock Data (No Valid Key/CORS Protection)');
            return;
        }

        setLoading(true);
        setError(null);
        setFetchedData(null);

        try {
            const res = await fetch(apiUrl);
            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error("Access Denied. Please check your API Key in .env.local.");
                }
                throw new Error(`Failed to fetch API (Status: ${res.status})`);
            }
            const data = await res.json();

            if (data.error && typeof data.error === 'string') {
                const lowerError = data.error.toLowerCase();
                if (lowerError.includes("access") || lowerError.includes("invalid api key") || lowerError.includes("permissions")) {
                    throw new Error("Finnhub Auth Error: Invalid Key or Restricted Resource. Check .env.local.");
                }
            }

            // Intercept Alpha Vantage Rate Limits ("Information": "...")
            if (data['Information'] || data['Note']) {
                console.warn("Alpha Vantage Rate Limit detected in Builder. Showing RAW response.");
                setError('⚠️ API Rate Limit Hit. The response below is the raw error from Alpha Vantage.');
            }

            setFetchedData(data);
            setStep(3); // Auto advance to mapping if successful
        } catch (err: any) {
            let msg = err.message;
            if (msg === 'Failed to fetch' || msg.includes('NetworkError')) {
                msg = "Network Error: Could not connect to API. Check your internet or DNS.";
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldSelect = (path: string, value: any) => {
    };

    const [mappingTarget, setMappingTarget] = useState<keyof WidgetConfig['dataMap']>('primary');

    const onSelectPath = (path: string, value: any) => {
        // Intelligence Logic for Tables AND Charts (List-based types)
        // If determining PRIMARY Source (The Array):
        if (mappingTarget === 'primary') {
            const isChart = selectedType === 'CHART';
            const isArray = Array.isArray(value);
            const isObject = typeof value === 'object' && value !== null;

            // Allow selecting Arrays OR Objects as Primary
            if (isArray || (isChart && isObject)) {
                setDataMap(prev => ({ ...prev, [mappingTarget]: path }));

                if (isChart) {
                    let autoYField = '';

                    if (isObject) {
                        const keys = Object.keys(value);
                        if (keys.length > 0) {
                            const firstChild = value[keys[0]];
                            if (typeof firstChild === 'object' && firstChild !== null) {
                                // Priorities: 4. close (AlphaVantage), close, c (Finnhub), price, value
                                const candidates = ['4. close', 'close', 'c', 'price', 'value', 'amount'];
                                for (const c of candidates) {
                                    if (firstChild[c] !== undefined) {
                                        autoYField = c;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (autoYField) {
                        console.log('Auto-detected Y-Field:', autoYField);
                        setDataMap(prev => ({ ...prev, xField: '', yField: autoYField }));
                    } else {
                        setDataMap(prev => ({ ...prev, xField: '', yField: '' }));
                    }
                }
                return;
            }

            // Fallback: If user selected a child item, find the parent array
            if ((selectedType === 'TABLE' || selectedType === 'CHART') && !isArray) {
                // If user selected a child item, find the parent array
                const parts = path.split('.');
                const lastKey = parts[parts.length - 1];

                // Find the last numeric index in the path
                const partsWithIndex = parts.map((p, i) => ({ val: p, isIndex: !isNaN(Number(p)), index: i }));
                const lastIndexPart = [...partsWithIndex].reverse().find(p => p.isIndex);

                if (lastIndexPart) {
                    // Cut everything after and including this index to get the Array Path
                    const arrayPathParts = parts.slice(0, lastIndexPart.index);
                    const arrayPath = arrayPathParts.length === 0 ? 'ROOT' : arrayPathParts.join('.');
                    setDataMap(prev => ({ ...prev, [mappingTarget]: arrayPath }));
                    return;
                }
            }
        }

        // Logic for Field Mapping (X/Y Fields) for Charts
        if (selectedType === 'CHART' && (mappingTarget === 'xField' || mappingTarget === 'yField')) {
            let fieldName = path.split('.').pop() || path;
            const primaryPath = dataMap.primary;

            // Handle Alpha Vantage / Dictionary Style Series
            // If the path starts with the primary path, calculate relative path
            if (primaryPath && path.startsWith(primaryPath + '.')) {
                const relativePath = path.substring(primaryPath.length + 1);
                const parts = relativePath.split('.');

                if (parts.length > 1) {
                    fieldName = parts.slice(1).join('.');
                }
            }

            console.log('Chart field selection:', { mappingTarget, path, fieldName, primaryPath });
            setDataMap(prev => ({ ...prev, [mappingTarget]: fieldName }));
            return;
        }

        setDataMap(prev => ({ ...prev, [mappingTarget]: path }));
    };

    const handleFinish = () => {
        if (!selectedType) return;

        const { widgets } = useDashboardStore.getState();

        // Smart Layout Calculation - PRIORITIZING SYMMETRY
        let w = selectedType === 'CHART' ? 12 : 4;
        if (selectedType === 'TABLE') w = 12;

        let h = selectedType === 'CHART' ? 8 : 6;
        if (selectedType === 'TABLE') h = 8;

        // Auto-centering: (Total Columns - Width) / 2
        let x = (12 - w) / 2;
        let y = Infinity;

        const newWidget: WidgetConfig = {
            id: uuidv4(),
            title: title || 'New Widget',
            ...(description && { description }),
            type: selectedType,
            apiConfig: {
                endpoint: apiUrl,
                adapterId: 'generic',
                pollingInterval: 30
            },
            dataMap,
            style: {
                chartVariant: 'line'
            },
            layout: {
                i: uuidv4(),
                x,
                y,
                w,
                h
            }
        };

        // Sync ID
        newWidget.layout.i = newWidget.id;

        addWidget(newWidget);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">

                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h2 className="text-lg font-bold">Add New Widget - Step {step} of 3</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6">

                    {/* STEP 1: BASICS */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Widget Title</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent"
                                    placeholder="e.g., Bitcoin Price"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Description <span className="text-slate-400 text-xs font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent resize-none"
                                    placeholder="Add a brief description..."
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {WIDGET_TYPES.map(t => (
                                    <div
                                        key={t.type}
                                        onClick={() => setSelectedType(t.type)}
                                        className={cn(
                                            "p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
                                            selectedType === t.type ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-200 dark:border-slate-700"
                                        )}
                                    >
                                        <h3 className="font-bold">{t.label}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: DATA SOURCE */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">API Endpoint URL</label>
                                <div className="flex gap-2">
                                    <input
                                        value={apiUrl}
                                        onChange={e => setApiUrl(e.target.value)}
                                        className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent font-mono text-sm"
                                        placeholder="https://api.coindesk.com/v1/bpi/currentprice.json"
                                    />
                                    <button
                                        onClick={handleFetch}
                                        disabled={loading || !apiUrl}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Fetch Data'}
                                    </button>
                                </div>
                                {error && (
                                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-lg flex flex-col gap-2">
                                        <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
                                            <span className="text-lg">⚠️</span> {error}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-red-500/80">Network blocked? Try:</p>
                                            <button
                                                onClick={() => {
                                                    setFetchedData(MOCK_DATA.BITCOIN_PRICE);
                                                    setStep(3);
                                                }}
                                                className="text-xs bg-red-100 dark:bg-red-900/40 hover:bg-red-200 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 px-2 py-1 rounded transition-colors font-semibold"
                                            >
                                                Load Mock Data
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 dark:bg-black p-4 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                                <p className="font-semibold mb-2">Verified API Presets (Click to autofill):</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {/* Show Chart preset only for CHART widgets */}
                                    {selectedType === 'CHART' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setApiUrl('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily');
                                                    setDataMap(prev => ({ ...prev, format: 'currency' }));
                                                }}
                                                className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded hover:border-green-500 hover:text-green-600 transition-colors shadow-sm"
                                            >
                                                🦎 BTC (CoinGecko)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setApiUrl('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=30&interval=daily');
                                                    setDataMap(prev => ({ ...prev, format: 'currency' }));
                                                }}
                                                className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded hover:border-purple-500 hover:text-purple-600 transition-colors shadow-sm"
                                            >
                                                ⟠ ETH (CoinGecko)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setApiUrl('https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=30&interval=daily');
                                                    setDataMap(prev => ({ ...prev, format: 'currency' }));
                                                }}
                                                className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded hover:border-teal-500 hover:text-teal-600 transition-colors shadow-sm"
                                            >
                                                ◎ SOL (CoinGecko)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const key = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || 'YOUR_API_KEY';
                                                    setApiUrl(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=${key}`);
                                                }}
                                                className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                                            >
                                                📈 IBM (Alpha Vantage)
                                            </button>
                                        </>
                                    )}

                                    {/* Show Card presets only for CARD widgets */}
                                    {selectedType === 'CARD' && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setApiUrl('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
                                                    setDataMap(prev => ({ ...prev, format: 'currency' }));
                                                }}
                                                className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded hover:border-orange-500 hover:text-orange-600 transition-colors shadow-sm"
                                            >
                                                ₿ Bitcoin (CoinGecko)
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const key = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || 'YOUR_API_KEY';
                                                    setApiUrl(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=${key}`);
                                                    setDataMap(prev => ({ ...prev, format: 'currency' }));
                                                }}
                                                className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                                            >
                                                🏢 IBM Quote (Alpha Vantage)
                                            </button>
                                        </>
                                    )}
                                </div>
                                <ul className="list-disc pl-4 space-y-1 opacity-70">
                                    <li><b>Recommended:</b> Use Finnhub or CoinCap for development.</li>
                                    <li>Alpha Vantage has a strict limit (25 req/day) which blocks you quickly.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: MAPPING */}
                    {step === 3 && fetchedData && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                            {/* Left: JSON Explorer */}
                            <div className="flex flex-col h-full min-h-[300px]">
                                <h3 className="text-sm font-bold mb-1">Select Fields from Response:</h3>
                                <p className="text-xs text-slate-500 mb-2">
                                    {selectedType === 'TABLE'
                                        ? "For Tables, select the list (Array) containing your items. Columns are auto-detected."
                                        : "For Cards, select the specific value you want to display."}
                                </p>
                                <JsonExplorer data={fetchedData} onSelectPath={onSelectPath} widgetType={selectedType} />
                            </div>

                            {/* Right: Mapping Config */}
                            <div className="flex flex-col gap-4">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-2">Mapping: {selectedType}</h4>

                                    <div className="space-y-3">
                                        {/* Primary Field */}
                                        <div
                                            onClick={() => setMappingTarget('primary')}
                                            className={cn("p-3 rounded border cursor-pointer", mappingTarget === 'primary' ? "ring-2 ring-blue-500 bg-white dark:bg-black" : "bg-transparent border-slate-300")}
                                        >
                                            <label className="text-xs font-bold block text-slate-500">
                                                {selectedType === 'TABLE' ? 'Array Source (Primary)' : 'Value Field (Primary)'}
                                            </label>
                                            <div className="font-mono text-sm truncate text-green-600 h-5">
                                                {dataMap.primary === 'ROOT' ? (
                                                    <span className="font-bold flex items-center gap-2">
                                                        <span className="text-lg">✅</span> Main List (All Items)
                                                    </span>
                                                ) : (
                                                    dataMap.primary || <span className="text-slate-300 italic">Click JSON to select...</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delta / X-Axis (Conditional) */}
                                        {(selectedType === 'CARD' || selectedType === 'CHART') && (
                                            <div
                                                onClick={() => setMappingTarget(selectedType === 'CHART' ? 'xField' : 'delta')}
                                                className={cn("p-3 rounded border cursor-pointer", mappingTarget === (selectedType === 'CHART' ? 'xField' : 'delta') ? "ring-2 ring-blue-500 bg-white dark:bg-black" : "bg-transparent border-slate-300")}
                                            >
                                                <label className="text-xs font-bold block text-slate-500">
                                                    {selectedType === 'CHART' ? 'X-Axis (Time)' : 'Change % (Delta)'}
                                                </label>
                                                <div className="font-mono text-sm truncate text-blue-600 h-5">
                                                    {dataMap[selectedType === 'CHART' ? 'xField' : 'delta'] || <span className="text-slate-300 italic">Optional...</span>}
                                                </div>
                                            </div>
                                        )}

                                        {/* Y-Axis (Chart only) */}
                                        {selectedType === 'CHART' && (
                                            <div
                                                onClick={() => setMappingTarget('yField')}
                                                className={cn("p-3 rounded border cursor-pointer", mappingTarget === 'yField' ? "ring-2 ring-blue-500 bg-white dark:bg-black" : "bg-transparent border-slate-300")}
                                            >
                                                <label className="text-xs font-bold block text-slate-500">Y-Axis (Value)</label>
                                                <div className="font-mono text-sm truncate text-purple-600 h-5">
                                                    {dataMap.yField || <span className="text-slate-300 italic">Required...</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between">
                    {step > 1 ? (
                        <button onClick={() => setStep(prev => (prev - 1) as any)} className="text-slate-500 hover:text-slate-700 flex items-center gap-1 font-medium">
                            <ArrowLeft size={16} /> Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(prev => (prev + 1) as any)}
                            disabled={!title || !selectedType || (step === 2 && !fetchedData)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                        >
                            Next <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleFinish}
                            disabled={
                                !dataMap.primary ||
                                (selectedType === 'CHART' && !dataMap.yField)
                            }
                            className={cn(
                                "px-8 py-2 rounded-lg font-medium flex items-center gap-2 transition-all",
                                (dataMap.primary && (selectedType !== 'CHART' || dataMap.yField))
                                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg scale-105"
                                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            )}
                        >
                            <Check size={18} /> Create Widget
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};
