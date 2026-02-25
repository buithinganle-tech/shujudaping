import { TrendingUp, TrendingDown, Users, Bus, Globe, Wifi } from 'lucide-react';

interface Props {
    totalRevenue: number;
    totalPassengerFlow: number;
    charterRatio: number;
    revenueGrowth: number;
    flowGrowth: number;
}

function KpiCard({
    label, value, unit, growth, icon: Icon, color
}: {
    label: string; value: string; unit: string;
    growth?: number; icon: React.ElementType; color: string;
}) {
    const isUp = growth !== undefined && growth >= 0;
    return (
        <div className={`flex-1 rounded-xl bg-[#0f1d35]/60 border ${color} p-3 flex flex-col gap-1 min-w-0`}>
            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 tracking-wide">{label}</span>
                <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex items-end gap-1.5 mt-0.5">
                <span className="text-xl md:text-2xl font-mono font-bold text-white leading-none">{value}</span>
                <span className="text-xs text-slate-400 mb-0.5">{unit}</span>
            </div>
            {growth !== undefined && (
                <div className={`flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isUp ? '+' : ''}{growth}% 日环比
                </div>
            )}
        </div>
    );
}

export default function Header({ totalRevenue, totalPassengerFlow, charterRatio, revenueGrowth, flowGrowth }: Props) {
    return (
        <div className="bg-[#0a1628]/90 backdrop-blur-md rounded-xl border border-slate-700/60 shadow-[0_0_20px_rgba(56,189,248,0.1)] p-4 shrink-0">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* 品牌区 */}
                <div className="flex items-center gap-3 min-w-0 shrink-0">
                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30 shrink-0">
                        <Globe className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-base md:text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 whitespace-nowrap">
                            湘潭交运集团数字化指挥中心
                        </h1>
                        <p className="text-[10px] text-slate-500 tracking-widest">
                            实时客流监控 · 营收构成分析 · 重点专项调度
                        </p>
                    </div>
                </div>

                {/* KPI 卡片区 */}
                <div className="flex gap-3 flex-1 min-w-0">
                    <KpiCard
                        label="今日营收总额"
                        value={`¥${(totalRevenue / 10000).toFixed(1)}万`}
                        unit="元"
                        growth={revenueGrowth}
                        icon={Bus}
                        color="border-cyan-500/30"
                    />
                    <KpiCard
                        label="实时客流监控"
                        value={totalPassengerFlow.toLocaleString()}
                        unit="人次"
                        growth={flowGrowth}
                        icon={Users}
                        color="border-blue-500/30"
                    />
                    <KpiCard
                        label="包车业务占比"
                        value={`${charterRatio}`}
                        unit="%"
                        icon={TrendingUp}
                        color="border-violet-500/30"
                    />
                </div>

                {/* 系统状态 */}
                <div className="hidden md:flex flex-col items-center justify-center shrink-0">
                    <div className="relative flex items-center justify-center w-8 h-8">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-20 animate-ping" />
                        <Wifi className="w-4 h-4 text-emerald-400 relative z-10" />
                    </div>
                    <span className="text-[9px] text-emerald-400 mt-1 font-bold tracking-widest">系统在线</span>
                </div>
            </div>
        </div>
    );
}
