import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { RouteMetricRow } from '../hooks/useWidgetData'
import type { MetricConfig } from '../types/supabase'

interface Props {
    data: RouteMetricRow[]
    compareData: RouteMetricRow[]
    metrics: MetricConfig[]
}

// 字段到默认单位的映射
const UNITS: Record<string, string> = {
    revenue: '元',
    passenger_count: '人',
    energy_cost: '元',
    mileage: 'km',
}

export default function MetricCardGroup({ data, compareData, metrics }: Props) {
    if (!metrics || metrics.length === 0) {
        return <div className="text-slate-500 text-sm text-center py-4">暂无指标配置</div>
    }

    // 按指标聚合：取所有行该字段的合计
    const sum = (rows: RouteMetricRow[], key: string) =>
        rows.reduce((s, r) => s + Number((r as any)[key] || 0), 0)

    return (
        <div className="grid grid-cols-2 gap-3 h-full content-start">
            {metrics.map((metric) => {
                const currentVal = sum(data, metric.key)
                const compareVal = compareData.length > 0 ? sum(compareData, metric.key) : null
                const changePercent = compareVal && compareVal > 0
                    ? Math.round(((currentVal - compareVal) / compareVal) * 100)
                    : null

                return (
                    <div
                        key={metric.key}
                        className="bg-slate-900/50 border border-slate-700/40 rounded-lg p-3 flex flex-col justify-between hover:border-cyan-500/30 transition-colors"
                    >
                        <span className="text-[11px] text-slate-400 font-medium truncate">
                            {metric.label}
                        </span>
                        <div className="mt-2 flex items-end justify-between">
                            <span className="text-xl font-bold text-slate-100 font-mono">
                                {currentVal.toLocaleString()}
                                <span className="text-[10px] text-slate-500 ml-1 font-normal">{UNITS[metric.key] || ''}</span>
                            </span>

                            {changePercent !== null && (
                                <span className={`flex items-center gap-0.5 text-xs font-medium ${changePercent > 0 ? 'text-emerald-400' : changePercent < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                    {changePercent > 0 ? <TrendingUp className="w-3 h-3" /> : changePercent < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                                    {changePercent > 0 ? '+' : ''}{changePercent}%
                                </span>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
