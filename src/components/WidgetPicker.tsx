import React from 'react';
import type { Database } from '../types/supabase';
import type { CompanyMetric } from '../App';
import RevenueChart from './RevenueChart';
import MarketingGauge from './MarketingGauge';
import ProgressRing from './ProgressRing';
import ProjectProgress from './ProjectProgress';

type DashboardConfig = Database['public']['Tables']['dashboard_configs']['Row'];

interface WidgetPickerProps {
    config: DashboardConfig;
    data: CompanyMetric[];
    // If we have specific data for projects or specific sources, we can pass them down here
    projectData?: any[];
}

export default function WidgetPicker({ config, data }: WidgetPickerProps) {
    // In a real application, we might filter `data` based on `config.data_source`.
    // For the initial step to not break existing logic too much, we pass the same props down
    // but let the specific chart render.

    const WidgetCard = ({ children, title }: { children: React.ReactNode, title: string }) => (
        <div className="bg-slate-800/50 rounded-xl p-4 md:p-5 border border-slate-700/50 flex flex-col items-start justify-between min-h-[300px] relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 z-10">{title}</h3>
            <div className="w-full flex-1 z-10">
                {children}
            </div>
            {/* Subtle background glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none" />
        </div>
    );

    switch (config.chart_type) {
        case 'bar':
        case 'line':
            // Currently our RevenueChart handles both Bar and Line
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
            )

        default:
            return (
                <WidgetCard title={config.title}>
                    <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                        Unsupported chart type: {config.chart_type}
                    </div>
                </WidgetCard>
            );
    }
}
