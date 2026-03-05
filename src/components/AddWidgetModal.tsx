import React, { useState } from 'react';
import { X, PlusCircle, LayoutTemplate, Database as DbIcon, Type } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    // Optional: Pass current max order to auto-append
    nextOrder: number;
}

export default function AddWidgetModal({ isOpen, onClose, nextOrder }: Props) {
    const [title, setTitle] = useState('');
    const [chartType, setChartType] = useState('metric');
    const [dataSource, setDataSource] = useState('revenue');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('请输入板块标题');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const { error: insertError } = await supabase
            .from('dashboard_configs')
            .insert({
                title: title.trim(),
                chart_type: chartType,
                data_source: dataSource,
                order: nextOrder
            });

        setIsSubmitting(false);

        if (insertError) {
            setError(`保存失败: ${insertError.message}`);
        } else {
            // Reset and close
            setTitle('');
            setChartType('metric');
            setDataSource('revenue');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#0f1d35] border border-cyan-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-cyan-900/20 relative animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20">
                        <PlusCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wide">添加数据板块</h2>
                        <p className="text-xs text-slate-400 mt-0.5">配置全新的大屏监控视图</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 ml-1">
                            <Type className="w-3.5 h-3.5 text-slate-400" /> 版块标题
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="例如：本月销售额分析"
                            className="w-full bg-slate-900/50 border border-slate-700/50 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
                        />
                    </div>

                    {/* Chart Type */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 ml-1">
                            <LayoutTemplate className="w-3.5 h-3.5 text-slate-400" /> 图表展现形式
                        </label>
                        <div className="relative">
                            <select
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                                className="w-full appearance-none bg-slate-900/50 border border-slate-700/50 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer"
                            >
                                <option value="line">折线图 (Line Chart)</option>
                                <option value="bar">柱状图 (Bar Chart)</option>
                                <option value="gauge">仪表盘 (Gauge)</option>
                                <option value="progress">进度环视 (Progress Ring)</option>
                                <option value="project_timeline">多项指标对比 (Project Timeline)</option>
                                <option value="metric">纯数据卡片 (Metric)</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Data Source */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 ml-1">
                            <DbIcon className="w-3.5 h-3.5 text-slate-400" /> 绑定数据源
                        </label>
                        <div className="relative">
                            <select
                                value={dataSource}
                                onChange={(e) => setDataSource(e.target.value)}
                                className="w-full appearance-none bg-slate-900/50 border border-slate-700/50 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer"
                            >
                                <option value="revenue">全节点营收与客流明细</option>
                                <option value="passenger_flow">客运专项监控</option>
                                <option value="project">校园与包车专项指标</option>
                                <option value="social">自媒体影响力矩阵</option>
                            </select>
                            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-[2] px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 rounded-full border-t-2 border-white animate-spin"></div>
                                    正在保存...
                                </>
                            ) : '确认添加并在大屏显示'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
