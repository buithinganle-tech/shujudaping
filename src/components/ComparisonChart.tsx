import ReactECharts from 'echarts-for-react'
import type { RouteMetricRow } from '../hooks/useWidgetData'
import type { MetricConfig } from '../types/supabase'

interface Props {
    primary: RouteMetricRow[]
    compare: RouteMetricRow[]
    metrics: MetricConfig[]
    title?: string
}

// 中文标签映射
const METRIC_LABELS: Record<string, string> = {
    revenue: '营收(元)',
    passenger_count: '人数(人)',
    energy_cost: '能耗(元)',
    mileage: '里程(km)',
}

// 颜色调色盘
const COLORS = {
    primary: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'],
    compare: ['rgba(14,165,233,0.35)', 'rgba(139,92,246,0.35)', 'rgba(245,158,11,0.35)', 'rgba(16,185,129,0.35)'],
}

export default function ComparisonChart({ primary, compare, metrics, title }: Props) {
    if (!metrics || metrics.length === 0) {
        return <div className="text-slate-500 text-sm text-center py-8">请在配置中选择至少一个指标</div>
    }

    // 收集所有日期作为 X 轴
    const allDates = [...new Set([
        ...primary.map(r => r.record_date),
        ...compare.map(r => r.record_date),
    ])].sort()

    // 收集所有涉及的线路
    const primaryRoutes = [...new Set(primary.map(r => r.route_name))]
    const compareRoutes = [...new Set(compare.map(r => r.route_name))]

    // 为每个指标 × 每条线路生成一条 Series
    const series: any[] = []

    metrics.forEach((metric, mi) => {
        const metricKey = metric.key as keyof RouteMetricRow

        // 主数据线路
        primaryRoutes.forEach((route, ri) => {
            const routeData = primary.filter(r => r.route_name === route)
            series.push({
                name: `${metric.label || METRIC_LABELS[metric.key] || metric.key} (${route})`,
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 6,
                lineStyle: { width: 2.5, color: COLORS.primary[(mi + ri) % COLORS.primary.length] },
                itemStyle: {
                    color: COLORS.primary[(mi + ri) % COLORS.primary.length],
                    borderColor: '#0f1d35',
                    borderWidth: 2,
                },
                areaStyle: {
                    color: {
                        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: COLORS.primary[(mi + ri) % COLORS.primary.length].replace(')', ',0.25)').replace('rgb', 'rgba') },
                            { offset: 1, color: 'rgba(0,0,0,0)' },
                        ],
                    },
                },
                data: allDates.map(date => {
                    const row = routeData.find(r => r.record_date === date)
                    return row ? Number(row[metricKey]) : null
                }),
            })
        })

        // 对比线路（虚线）
        compareRoutes.forEach((route, ri) => {
            const routeData = compare.filter(r => r.route_name === route)
            series.push({
                name: `${metric.label || METRIC_LABELS[metric.key] || metric.key} (${route} 对比)`,
                type: 'line',
                smooth: true,
                symbol: 'diamond',
                symbolSize: 5,
                lineStyle: {
                    width: 2,
                    type: 'dashed',
                    color: COLORS.compare[(mi + ri) % COLORS.compare.length],
                },
                itemStyle: {
                    color: COLORS.compare[(mi + ri) % COLORS.compare.length],
                },
                data: allDates.map(date => {
                    const row = routeData.find(r => r.record_date === date)
                    return row ? Number(row[metricKey]) : null
                }),
            })
        })
    })

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(6, 13, 26, 0.95)',
            borderColor: '#1e3a5f',
            textStyle: { color: '#e2e8f0', fontSize: 12 },
        },
        legend: {
            data: series.map(s => s.name),
            textStyle: { color: '#94a3b8', fontSize: 10 },
            bottom: 0,
            type: 'scroll',
        },
        grid: { left: '3%', right: '4%', bottom: '60px', top: title ? '40px' : '16px', containLabel: true },
        xAxis: {
            type: 'category',
            data: allDates,
            axisLabel: { color: '#94a3b8', fontSize: 10 },
            axisLine: { lineStyle: { color: '#1e3a5f' } },
            axisTick: { show: false },
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#475569', fontSize: 10 },
            splitLine: { lineStyle: { color: 'rgba(56,189,248,0.06)' } },
        },
        series,
    }

    return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
}
