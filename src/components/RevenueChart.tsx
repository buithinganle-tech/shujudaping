import ReactECharts from 'echarts-for-react';
import { BarChart2 } from 'lucide-react';
import type { CompanyMetric } from '../App';

interface Props { data: CompanyMetric[] }

export default function RevenueChart({ data }: Props) {
    const sorted = [...data].sort((a, b) => b.daily_revenue - a.daily_revenue);
    const names = sorted.map(d => d.branch_name);
    const revenues = sorted.map(d => d.daily_revenue);
    const flows = sorted.map(d => d.passenger_flow);
    const charters = sorted.map(d => d.charter_revenue);

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross', crossStyle: { color: '#334155' } },
            backgroundColor: 'rgba(6, 13, 26, 0.95)',
            borderColor: '#1e3a5f',
            textStyle: { color: '#e2e8f0', fontSize: 12 },
            formatter: (params: any[]) => {
                const name = params[0].name;
                let str = `<div style="font-weight:bold;margin-bottom:6px;color:#38bdf8">${name}</div>`;
                params.forEach(p => {
                    const val = p.seriesName === '日营收' || p.seriesName === '包车专项'
                        ? `¥${Number(p.value).toLocaleString()}`
                        : `${Number(p.value).toLocaleString()} 人次`;
                    str += `<div style="display:flex;justify-content:space-between;gap:16px">
            <span style="color:${p.color}">${p.marker}${p.seriesName}</span>
            <span style="font-weight:bold">${val}</span>
          </div>`;
                });
                return str;
            }
        },
        legend: {
            data: ['日营收', '包车专项', '实时客流'],
            textStyle: { color: '#94a3b8', fontSize: 11 },
            top: 0,
            right: 0,
            itemHeight: 10,
        },
        grid: { left: '0', right: '60px', bottom: '3%', top: '36px', containLabel: true },
        xAxis: {
            type: 'category',
            data: names,
            axisLabel: { color: '#94a3b8', fontSize: 11, interval: 0 },
            axisLine: { lineStyle: { color: '#1e3a5f' } },
            axisTick: { show: false },
        },
        yAxis: [
            {
                type: 'value',
                name: '营收（元）',
                nameTextStyle: { color: '#475569', fontSize: 10 },
                axisLabel: { color: '#475569', fontSize: 10, formatter: (v: number) => `¥${(v / 10000).toFixed(0)}万` },
                splitLine: { lineStyle: { color: 'rgba(56,189,248,0.06)' } },
            },
            {
                type: 'value',
                name: '客流（人次）',
                nameTextStyle: { color: '#475569', fontSize: 10 },
                axisLabel: { color: '#475569', fontSize: 10, formatter: (v: number) => `${(v / 1000).toFixed(0)}k` },
                splitLine: { show: false },
            }
        ],
        series: [
            {
                name: '日营收',
                type: 'bar',
                yAxisIndex: 0,
                stack: 'revenue',
                data: revenues.map(v => v - (sorted.map(d => d.charter_revenue)[revenues.indexOf(v)] || 0)),
                itemStyle: {
                    color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#0ea5e9' }, { offset: 1, color: 'rgba(14,165,233,0.2)' }] },
                    borderRadius: [0, 0, 0, 0]
                },
                barMaxWidth: 40,
            },
            {
                name: '包车专项',
                type: 'bar',
                yAxisIndex: 0,
                stack: 'revenue',
                data: charters,
                itemStyle: {
                    color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#a78bfa' }, { offset: 1, color: 'rgba(167,139,250,0.3)' }] },
                    borderRadius: [4, 4, 0, 0]
                },
                barMaxWidth: 40,
            },
            {
                name: '实时客流',
                type: 'line',
                yAxisIndex: 1,
                data: flows,
                smooth: true,
                symbol: 'circle',
                symbolSize: 7,
                lineStyle: { color: '#34d399', width: 2 },
                itemStyle: { color: '#34d399', borderColor: '#0f1d35', borderWidth: 2 },
                areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(52,211,153,0.25)' }, { offset: 1, color: 'rgba(52,211,153,0)' }] } },
            }
        ]
    };

    return (
        <>
            <h2 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center shrink-0">
                <BarChart2 className="w-4 h-4 mr-1.5" /> 营收构成分析与实时客流监控
            </h2>
            <div className="flex-1 min-h-0">
                <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
            </div>
        </>
    );
}
