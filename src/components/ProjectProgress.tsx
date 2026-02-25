import { Target, Bus } from 'lucide-react';
import type { CompanyMetric } from '../App';

interface Props { data: CompanyMetric[] }

// 月度目标常量
const CAMPUS_PARTNER_TARGET = 90;     // 校园合伙人计划月度目标进度%
const CHARTER_MONTHLY_TARGET = 500000; // 包车业务月度营收目标（元）

function ProgressBar({ value, max, color, label, unit = '%', prefix = '' }: {
    value: number; max: number; color: string; label: string; unit?: string; prefix?: string;
}) {
    const pct = Math.min(Math.round((value / max) * 100), 100);
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">{label}</span>
                <span className={`font-mono font-bold ${color}`}>
                    {prefix}{typeof value === 'number' && unit !== '%' ? value.toLocaleString() : value}{unit}
                    <span className="text-slate-500 font-normal ml-1">/ {prefix}{typeof max === 'number' && unit !== '%' ? max.toLocaleString() : max}{unit}</span>
                </span>
            </div>
            <div className="h-2.5 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out`}
                    style={{
                        width: `${pct}%`,
                        background: color === 'text-cyan-400'
                            ? 'linear-gradient(90deg, #0ea5e9, #38bdf8)'
                            : 'linear-gradient(90deg, #7c3aed, #a78bfa)'
                    }}
                />
            </div>
            <div className="flex justify-between text-[10px] text-slate-600">
                <span>0</span>
                <span className={`${color} font-semibold`}>{pct}% 达成</span>
                <span>{unit === '%' ? '100%' : `目标`}</span>
            </div>
        </div>
    );
}

export default function ProjectProgress({ data }: Props) {
    const avgProgress = data.length > 0
        ? Math.round(data.reduce((s, d) => s + (d.project_progress || 0), 0) / data.length)
        : 0;
    const totalCharter = data.reduce((s, d) => s + Number(d.charter_revenue || 0), 0);

    return (
        <div className="flex flex-col gap-4 h-full">
            <h2 className="text-sm font-semibold text-cyan-400 flex items-center shrink-0">
                <Target className="w-4 h-4 mr-1.5" /> 重点专项调度
            </h2>

            <div className="flex flex-col gap-5 flex-1">
                <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/40">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-cyan-500/10 rounded border border-cyan-500/20">
                            <Target className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200 tracking-wide">校园合伙人计划</span>
                    </div>
                    <ProgressBar
                        value={avgProgress}
                        max={CAMPUS_PARTNER_TARGET}
                        color="text-cyan-400"
                        label="月度执行进度"
                        unit="%"
                    />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        {data.slice(0, 4).map(d => (
                            <div key={d.id} className="flex justify-between items-center text-[10px] text-slate-500">
                                <span className="truncate mr-1">{d.branch_name.replace('汽车站', '').replace('客运分公司', '客运')}</span>
                                <span className="text-slate-400 shrink-0">{d.project_progress ?? 0}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/40">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-violet-500/10 rounded border border-violet-500/20">
                            <Bus className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200 tracking-wide">包车业务月度指标</span>
                    </div>
                    <ProgressBar
                        value={totalCharter}
                        max={CHARTER_MONTHLY_TARGET}
                        color="text-violet-400"
                        label="月度营收累计"
                        unit="元"
                        prefix="¥"
                    />
                    <p className="text-[10px] text-slate-600 mt-2 text-right">
                        月度目标：¥{CHARTER_MONTHLY_TARGET.toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
