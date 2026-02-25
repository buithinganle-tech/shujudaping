import ReactECharts from 'echarts-for-react';
import { Megaphone } from 'lucide-react';

interface Props { totalEngagement: number }

const MARKETING_TARGET = 200000; // 抖音营销月度流量目标

export default function MarketingGauge({ totalEngagement }: Props) {
    const achieveRate = Math.min(Math.round((totalEngagement / MARKETING_TARGET) * 100), 100);

    const option = {
        backgroundColor: 'transparent',
        series: [
            {
                type: 'gauge',
                startAngle: 210,
                endAngle: -30,
                min: 0,
                max: 100,
                radius: '88%',
                center: ['50%', '60%'],
                pointer: {
                    show: true,
                    length: '55%',
                    width: 4,
                    itemStyle: { color: '#a78bfa' }
                },
                progress: {
                    show: true,
                    width: 10,
                    itemStyle: {
                        color: {
                            type: 'linear', x: 0, y: 0, x2: 1, y2: 0,
                            colorStops: [{ offset: 0, color: '#7c3aed' }, { offset: 1, color: '#c084fc' }]
                        }
                    }
                },
                axisLine: {
                    lineStyle: { width: 10, color: [[1, 'rgba(51,65,85,0.5)']] }
                },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                anchor: {
                    show: true,
                    size: 10,
                    itemStyle: { color: '#a78bfa', borderColor: '#0f1d35', borderWidth: 2 }
                },
                detail: {
                    offsetCenter: [0, '20%'],
                    fontSize: 22,
                    fontWeight: 'bold',
                    color: '#a78bfa',
                    fontFamily: 'monospace',
                    formatter: `${achieveRate}%`
                },
                title: {
                    offsetCenter: [0, '50%'],
                    fontSize: 10,
                    color: '#64748b',
                },
                data: [{ value: achieveRate, name: '流量达成率' }],
                animationDuration: 1500,
                animationEasing: 'cubicOut',
            }
        ]
    };

    return (
        <div className="flex flex-col h-full">
            <h2 className="text-sm font-semibold text-violet-400 flex items-center shrink-0">
                <Megaphone className="w-4 h-4 mr-1.5" /> 数字化营销权重
            </h2>
            <div className="flex flex-1 items-center min-h-0">
                <div className="flex-1 min-h-[100px]">
                    <ReactECharts option={option} style={{ height: '100%', width: '100%', minHeight: '120px' }} />
                </div>
                <div className="shrink-0 pr-2 text-right space-y-1.5">
                    <div>
                        <p className="text-[10px] text-slate-500">抖音总互动量</p>
                        <p className="text-sm font-mono font-bold text-violet-300">{totalEngagement.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500">月度流量目标</p>
                        <p className="text-sm font-mono font-bold text-slate-400">{MARKETING_TARGET.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
