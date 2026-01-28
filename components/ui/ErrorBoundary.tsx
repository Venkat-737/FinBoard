'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in widget:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center">
                    <AlertCircle size={24} className="mb-2 text-red-400" />
                    <p className="text-xs">Widget Crashed</p>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-2 text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded hover:bg-slate-200"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
