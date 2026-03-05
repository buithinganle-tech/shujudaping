import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallbackTitle?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error in widget:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="bg-slate-800/50 rounded-xl p-4 md:p-5 border border-red-500/30 flex flex-col items-center justify-center min-h-[300px] text-center">
                    <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-300 mb-2">
                        组件渲染失败{this.props.fallbackTitle ? ` (${this.props.fallbackTitle})` : ''}
                    </h3>
                    <p className="text-xs text-red-400 max-w-xs break-words">
                        {this.state.error?.message || '发生了未知的渲染错误'}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
