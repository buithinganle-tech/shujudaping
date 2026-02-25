import ReactECharts from 'echarts-for-react';
import type { CompanyMetric } from '../App';

interface Props {
    data: CompanyMetric[];
}

export default function ProgressRing({ data }: Props) {
    const chartData = data.map(d => ({
        value: d.project_progress,
        name: d.branch_name
    }));

    const option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}%',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: '#38bdf8',
            textStyle: { color: '#e2e8f0' }
        },
        legend: {
            orient: 'horizontal',
            bottom: 'bottom',
            textStyle: { color: '#94a3b8' }
        },
        series: [
            {
                name: '项目进度',
                type: 'pie',
                radius: ['45%', '75%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: '#1e293b',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: '#38bdf8',
                        formatter: '{b}\n{c}%'
                    }
                },
                labelLine: { show: false },
                data: chartData,
                animationDuration: 1000,
                animationType: 'scale',
                animationEasing: 'elasticOut'
            }
        ]
    };

    return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
}
