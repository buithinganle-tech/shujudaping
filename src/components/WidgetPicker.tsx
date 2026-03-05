import React from 'react';
import type { Database, WidgetConfig } from '../types/supabase';
import type { CompanyMetric } from '../App';
import RevenueChart from './RevenueChart';
import MarketingGauge from './MarketingGauge';
import ProgressRing from './ProgressRing';
import ProjectProgress from './ProjectProgress';
import ComparisonChart from './ComparisonChart';
import MetricCardGroup from './MetricCardGroup';
import { useWidgetData } from '../hooks/useWidgetData';

type DashboardConfig = Database['public']['Tables']['dashboard_configs']['Row'];

interface WidgetPickerProps {
    config: DashboardConfig;
    data: CompanyMetric[];
}

export default function WidgetPicker({ config, data }: WidgetPickerProps) {
    // 解析高级配置（JSONB 字段）
    const widgetConfig: WidgetConfig = (config.config && typeof config.config === 'object')
        ? config.config as WidgetConfig
        : {};

    // 使用数据查询引擎获取线路级历史数据
    const { primary, compare, isLoading, error } = useWidgetData(widgetConfig);

    const WidgetCard = ({ children, title }: { children: React.ReactNode, title: string }) => (
        <div className="bg-slate-800/50 rounded-xl p-4 md:p-5 border border-slate-700/50 flex flex-col items-start justify-between min-h-[300px] relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 z-10">{title}</h3>
            <div className="w-full flex-1 z-10">
                {children}
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />
        </div>
    );

    // 加载/错误状态渲染（仅对需要查询引擎的新图表类型生效）
    const renderWithLoading = (content: React.ReactNode) => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full text-slate-500 gap-3">
                    <div className="w-5 h-5 rounded-full border-t-2 border-cyan-500 animate-spin" />
                    <span className="text-sm">正在查询数据...</span>
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex items-center justify-center h-full text-red-400 text-sm px-4 text-center">
                    ⚠️ {error}
                </div>
            );
        }
        if (primary.length === 0) {
            return (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                    暂无匹配数据，请检查线路和时间范围配置
                </div>
            );
        }
        return content;
    };

    switch (config.chart_type) {
        // ── 老图表类型（使用 company_metrics 全局数据） ──
        case 'bar':
        case 'line':
            return (
                <WidgetCard title={config.title}>
                    <RevenueChart data={data} />
                </WidgetCard>
            );

        case 'gauge':
            return (
                <WidgetCard title={config.title}>
                    <MarketingGauge totalEngagement={data.reduce((sum, d) => sum + Number(d.social_engagement || 0), 0)} />
                </WidgetCard>
            );

        case 'progress':
            return (
                <WidgetCard title={config.title}>
                    <ProgressRing data={data} />
                </WidgetCard>
            );

        case 'project_timeline':
            return (
                <WidgetCard title={config.title}>
                    <ProjectProgress data={data} />
                </WidgetCard>
            );

        // ── 新图表类型（使用 route_daily_metrics 历史数据） ──
        case 'comparison':
            return (
                <WidgetCard title={config.title}>
                    {renderWithLoading(
                        <ComparisonChart
                            primary={primary}
                            compare={compare}
                            metrics={widgetConfig.metrics || [{ key: 'revenue', label: '营收' }]}
                        />
                    )}
                </WidgetCard>
            );

        case 'metric_cards':
            return (
                <WidgetCard title={config.title}>
                    {renderWithLoading(
                        <MetricCardGroup
                            data={primary}
                            compareData={compare}
                            metrics={widgetConfig.metrics || [{ key: 'revenue', label: '营收' }]}
                        />
                    )}
                </WidgetCard>
            );

        default:
            return (
                <WidgetCard title={config.title}>
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        不支持的图表类型: {config.chart_type}
                    </div>
                </WidgetCard>
            );
    }
}
