'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableWidgetProps {
    data: any[];
    format?: 'auto' | 'currency' | 'percent' | 'number';
}

type SortDirection = 'asc' | 'desc' | null;

export const TableWidget = ({ data, format = 'auto' }: TableWidgetProps) => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    const pageSize = 5;

    // Normalize Data: Ensure it's an array of objects
    const safeData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data.map(item => {
            if (typeof item === 'object' && item !== null) return item;
            return { Value: item };
        });
    }, [data]);

    // Filter
    const filteredData = useMemo(() => {
        if (!search) return safeData;
        const lowerSearch = search.toLowerCase();
        return safeData.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(lowerSearch)
            )
        );
    }, [safeData, search]);

    // Sort
    const sortedData = useMemo(() => {
        if (!sortColumn || !sortDirection) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = a[sortColumn];
            const bVal = b[sortColumn];

            // Handle null/undefined
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            // Compare numbers
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            // Compare strings
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();

            if (sortDirection === 'asc') {
                return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
            } else {
                return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
            }
        });
    }, [filteredData, sortColumn, sortDirection]);

    // Paginate
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

    // Columns
    const columns = useMemo(() => {
        if (safeData.length === 0) return [];
        return Object.keys(safeData[0]).slice(0, 4);
    }, [safeData]);

    // Handle column header click
    const handleSort = (column: string) => {
        if (sortColumn === column) {
            if (sortDirection === 'asc') {
                setSortDirection('desc');
            } else if (sortDirection === 'desc') {
                setSortColumn(null);
                setSortDirection(null);
            }
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
        setPage(1);
    };

    const getSortIcon = (column: string) => {
        if (sortColumn !== column) {
            return <ArrowUpDown size={12} className="opacity-30" />;
        }
        if (sortDirection === 'asc') {
            return <ArrowUp size={12} className="text-blue-500" />;
        }
        return <ArrowDown size={12} className="text-blue-500" />;
    };

    // Format Cell Values
    const formatValue = (val: any) => {
        if (val === null || val === undefined) return '-';
        if (typeof val === 'number') {
            if (format === 'currency') return '$' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            if (format === 'percent') return val.toFixed(2) + '%';
            if (format === 'number') return val.toLocaleString(undefined, { maximumFractionDigits: 2 });

            // Auto logic
            if (Math.abs(val) > 1000) return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
            return val.toLocaleString(undefined, { maximumFractionDigits: 4 });
        }
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
    };

    if (safeData.length === 0) {
        return <div className="text-slate-400 text-xs text-center p-8 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">No data available</div>;
    }

    return (
        <div className="flex flex-col h-full gap-3">
            {/* Toolbar */}
            <div className="flex gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                    <input
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="Filter and search stocks..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-auto rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all h-0">
                <table className="w-full text-[11px] text-left border-collapse">
                    <thead className="bg-slate-100/50 dark:bg-slate-800/50 sticky top-0 backdrop-blur-md z-10 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            {columns.map(col => (
                                <th
                                    key={col}
                                    className="px-3 py-2.5 font-bold text-slate-600 dark:text-slate-300 capitalize cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 select-none transition-colors"
                                    onClick={() => handleSort(col)}
                                >
                                    <div className={cn("flex items-center gap-1.5", typeof safeData[0][col] === 'number' && "justify-end")}>
                                        <span>{col.replace(/_/g, ' ')}</span>
                                        {getSortIcon(col)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {paginatedData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                                {columns.map(col => (
                                    <td
                                        key={col}
                                        className={cn(
                                            "px-3 py-2.5 truncate max-w-[120px] text-slate-700 dark:text-slate-300 font-medium",
                                            typeof row[col] === 'number' && "text-right font-mono text-blue-600 dark:text-blue-400"
                                        )}
                                        title={typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                                    >
                                        {formatValue(row[col])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Panel */}
            <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium px-1">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span>{sortedData.length} records found</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-lg">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="p-1 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-md disabled:opacity-30 disabled:hover:shadow-none transition-all"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <span className="px-2">{page} / {totalPages || 1}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || totalPages === 0}
                        className="p-1 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm rounded-md disabled:opacity-30 disabled:hover:shadow-none transition-all"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
