import { useEffect, useRef } from 'react';
import type { LogEntry } from '../App';

interface Props { logs: LogEntry[] }

export default function LiveLog({ logs }: Props) {
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = 0;
    }, [logs]);

    if (logs.length === 0) {
        return (
            <div className="text-slate-600 text-xs h-full flex items-center italic">
                等待实时调度数据推送...
            </div>
        );
    }

    return (
        <div ref={listRef} className="flex flex-col gap-1.5 h-full overflow-y-auto pr-1">
            {logs.map((log) => (
                <div
                    key={log.id}
                    className="flex items-start gap-2 text-xs animate-[slideIn_0.3s_ease-out_forwards]"
                >
                    <span className="text-slate-600 shrink-0 font-mono mt-px">{log.timestamp}</span>
                    <span className="text-slate-300 leading-snug">{log.message}</span>
                </div>
            ))}
        </div>
    );
}
