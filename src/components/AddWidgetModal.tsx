import React, { useState, useEffect } from 'react';
import { X, PlusCircle, LayoutTemplate, Database as DbIcon, Type, Route, Calendar, BarChart3, LineChart, PieChart, Activity, Gauge, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { WidgetConfig, MetricConfig } from '../types/supabase';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    nextOrder: number;
}

const AVAILABLE_METRICS: { key: string; defaultLabel: string }[] = [
    { key: 'revenue', defaultLabel: '营收(元)' },
    { key: 'passenger_count', defaultLabel: '人数(人)' },
    { key: 'energy_cost', defaultLabel: '能耗(元)' },
    { key: 'mileage', defaultLabel: '里程(km)' },
];

const CHART_TYPES = [
    { id: 'comparison', label: '趋势对比图', desc: '多线路指标对比', icon: LineChart, isBi: true },
    { id: 'metric_cards', label: '指标卡片群', desc: '核心数据展示', icon: Activity, isBi: true },
    { id: 'line', label: '全局折线', desc: '公司级收益趋势', icon: LineChart, isBi: false },
    { id: 'bar', label: '全局柱状', desc: '各站点横向对比', icon: BarChart3, isBi: false },
    { id: 'gauge', label: '全局大盘', desc: '单项指标仪表盘', icon: Gauge, isBi: false },
    { id: 'progress', label: '进度环', desc: '任务完成度', icon: PieChart, isBi: false },
];

export default function AddWidgetModal({ isOpen, onClose, nextOrder }: Props) {
    const [title, setTitle] = useState('');
    const [chartType, setChartType] = useState('comparison');
    const [dataSource, setDataSource] = useState('route_daily_metrics');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 线路选择
    const [availableRoutes, setAvailableRoutes] = useState<string[]>([]);
    const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
    const [compareRoutes, setCompareRoutes] = useState<string[]>([]);

    // 时间维度
    const [dateRangeType, setDateRangeType] = useState('last_7_days');

    // 指标选择
    const [selectedMetrics, setSelectedMetrics] = useState<MetricConfig[]>([
        { key: 'revenue', label: '营收(元)' }
    ]);

    // 自定义指标发现
    const [discoveredCustomKeys, setDiscoveredCustomKeys] = useState<string[]>([]);
    const [newCustomKey, setNewCustomKey] = useState('');

    // 是否为高级图表（需要线路/指标配置）
    const isAdvancedType = chartType === 'comparison' || chartType === 'metric_cards';

    // 加载可用线路 和 自定义指标 keys
    useEffect(() => {
        if (!isOpen) return;
        const fetchRoutes = async () => {
            const { data } = await supabase
                .from('route_daily_metrics')
                .select('route_name, custom_metrics')
            if (data) {
                const uniqueRoutes = [...new Set(data.map((r: any) => r.route_name))];
                setAvailableRoutes(uniqueRoutes);

                // 从数据中发现所有自定义指标 key
                const customKeys = new Set<string>();
                for (const row of data) {
                    const cm = (row as any).custom_metrics;
                    if (cm && typeof cm === 'object') {
                        Object.keys(cm).forEach(k => customKeys.add(k));
                    }
                }
                setDiscoveredCustomKeys([...customKeys]);
            }
        };
        fetchRoutes();
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleRoute = (route: string, list: string[], setList: (v: string[]) => void) => {
        setList(list.includes(route) ? list.filter(r => r !== route) : [...list, route]);
    };

    const toggleMetric = (key: string) => {
        if (selectedMetrics.find(m => m.key === key)) {
            setSelectedMetrics(selectedMetrics.filter(m => m.key !== key));
        } else {
            const defaultLabel = AVAILABLE_METRICS.find(m => m.key === key)?.defaultLabel || key;
            setSelectedMetrics([...selectedMetrics, { key, label: defaultLabel }]);
        }
    };

    const updateMetricLabel = (key: string, label: string) => {
        setSelectedMetrics(selectedMetrics.map(m => m.key === key ? { ...m, label } : m));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { setError('请输入板块标题'); return; }
        if (isAdvancedType && selectedRoutes.length === 0) { setError('至少选择一条线路'); return; }
        if (isAdvancedType && selectedMetrics.length === 0) { setError('至少选择一个指标'); return; }

        setIsSubmitting(true);
        setError(null);

        const config: WidgetConfig = isAdvancedType ? {
            routes: selectedRoutes,
            compare_routes: compareRoutes.length > 0 ? compareRoutes : undefined,
            date_range: { type: dateRangeType as any },
            metrics: selectedMetrics,
            view_mode: 'daily',
        } : {};

        const { error: insertError } = await supabase
            .from('dashboard_configs')
            .insert({
                title: title.trim(),
                chart_type: chartType,
                data_source: isAdvancedType ? 'route_daily_metrics' : dataSource,
                order: nextOrder,
                config: config as any,
            });

        setIsSubmitting(false);

        if (insertError) {
            setError(`保存失败: ${insertError.message}`);
        } else {
            setTitle(''); setChartType('comparison'); setSelectedRoutes([]); setCompareRoutes([]);
            setSelectedMetrics([{ key: 'revenue', label: '营收(元)' }]);
            onClose();
        }
    };

    const inputCls = "w-full bg-slate-900/50 border border-slate-700/50 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all";
    const selectCls = `${inputCls} appearance-none cursor-pointer`;
    const labelCls = "text-xs font-semibold text-slate-300 flex items-center gap-1.5 ml-1";
    const chipBaseCls = "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer select-none";

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f1d35] border border-cyan-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl shadow-cyan-900/20 relative max-h-[90vh] overflow-y-auto custom-scrollbar">

                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
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
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* 板块标题 */}
                    <div className="space-y-1.5">
                        <label className={labelCls}><Type className="w-3.5 h-3.5 text-slate-400" /> 板块标题</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：湘潭-花石 每日营收趋势" className={inputCls} />
                    </div>

                    {/* 图表类型 (可视化选择区域) */}
                    <div className="space-y-2">
                        <label className={labelCls}><LayoutTemplate className="w-3.5 h-3.5 text-slate-400" /> 选择图表形态</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {CHART_TYPES.map(ct => {
                                const Icon = ct.icon;
                                const isSelected = chartType === ct.id;
                                return (
                                    <button
                                        key={ct.id}
                                        type="button"
                                        onClick={() => setChartType(ct.id)}
                                        className={`relative flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${isSelected
                                            ? 'bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50 transform scale-[0.98]'
                                            : 'bg-slate-900/50 border-slate-700/50 hover:border-slate-500/50 hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                                        <div className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                                            {ct.label}
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-1 scale-90">
                                            {ct.desc}
                                        </div>
                                        {ct.isBi && (
                                            <div className="absolute top-1.5 right-1.5 text-[8px] font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-1.5 py-0.5 rounded shadow-sm">
                                                BI
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── 高级配置区域（仅对 comparison / metric_cards 显示） ── */}
                    {isAdvancedType && (
                        <>
                            {/* 线路选择 */}
                            <div className="space-y-1.5">
                                <label className={labelCls}><Route className="w-3.5 h-3.5 text-slate-400" /> 选择线路</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableRoutes.length === 0 ? (
                                        <span className="text-xs text-slate-500">暂无可用线路，请先在数据库中录入数据</span>
                                    ) : availableRoutes.map(route => (
                                        <button key={route} type="button"
                                            onClick={() => toggleRoute(route, selectedRoutes, setSelectedRoutes)}
                                            className={`${chipBaseCls} ${selectedRoutes.includes(route) ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-900/50 text-slate-400 border-slate-700/50 hover:border-slate-600'}`}
                                        >
                                            {route}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 对比线路（可选） */}
                            <div className="space-y-1.5">
                                <label className={labelCls}><Route className="w-3.5 h-3.5 text-violet-400" /> 对比线路 (可选)</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableRoutes.filter(r => !selectedRoutes.includes(r)).length === 0 ? (
                                        <span className="text-xs text-slate-500">没有其他可对比线路</span>
                                    ) : availableRoutes.filter(r => !selectedRoutes.includes(r)).map(route => (
                                        <button key={route} type="button"
                                            onClick={() => toggleRoute(route, compareRoutes, setCompareRoutes)}
                                            className={`${chipBaseCls} ${compareRoutes.includes(route) ? 'bg-violet-500/20 text-violet-300 border-violet-500/50' : 'bg-slate-900/50 text-slate-400 border-slate-700/50 hover:border-slate-600'}`}
                                        >
                                            {route}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 时间维度 */}
                            <div className="space-y-1.5">
                                <label className={labelCls}><Calendar className="w-3.5 h-3.5 text-slate-400" /> 时间范围</label>
                                <div className="relative">
                                    <select value={dateRangeType} onChange={e => setDateRangeType(e.target.value)} className={selectCls}>
                                        <option value="last_7_days">最近 7 天</option>
                                        <option value="last_30_days">最近 30 天</option>
                                        <option value="this_month">本月至今</option>
                                        <option value="last_month">上月整月</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* 指标选择与自定义标题 */}
                            <div className="space-y-2">
                                <label className={labelCls}><BarChart3 className="w-3.5 h-3.5 text-slate-400" /> 展示指标 (点选并自定义标题)</label>
                                <div className="space-y-2">
                                    {/* 基础指标 */}
                                    {AVAILABLE_METRICS.map(am => {
                                        const isSelected = !!selectedMetrics.find(m => m.key === am.key);
                                        const currentLabel = selectedMetrics.find(m => m.key === am.key)?.label || '';
                                        return (
                                            <div key={am.key} className="flex items-center gap-2">
                                                <button type="button" onClick={() => toggleMetric(am.key)}
                                                    className={`${chipBaseCls} shrink-0 ${isSelected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-slate-900/50 text-slate-400 border-slate-700/50 hover:border-slate-600'}`}
                                                >
                                                    {am.defaultLabel}
                                                </button>
                                                {isSelected && (
                                                    <input
                                                        type="text"
                                                        value={currentLabel}
                                                        onChange={e => updateMetricLabel(am.key, e.target.value)}
                                                        placeholder="自定义显示标题"
                                                        className="flex-1 bg-slate-900/50 border border-slate-700/50 focus:border-emerald-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none"
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* 动态发现的自定义指标 */}
                                    {discoveredCustomKeys.length > 0 && (
                                        <>
                                            <div className="h-px bg-slate-700/40 my-1" />
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">🔍 从数据库发现的自定义指标</p>
                                            {discoveredCustomKeys.map(ck => {
                                                const isSelected = !!selectedMetrics.find(m => m.key === ck);
                                                const currentLabel = selectedMetrics.find(m => m.key === ck)?.label || '';
                                                return (
                                                    <div key={ck} className="flex items-center gap-2">
                                                        <button type="button" onClick={() => toggleMetric(ck)}
                                                            className={`${chipBaseCls} shrink-0 ${isSelected ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-slate-900/50 text-slate-400 border-slate-700/50 hover:border-slate-600'}`}
                                                        >
                                                            {ck}
                                                        </button>
                                                        {isSelected && (
                                                            <input
                                                                type="text"
                                                                value={currentLabel}
                                                                onChange={e => updateMetricLabel(ck, e.target.value)}
                                                                placeholder="自定义显示标题"
                                                                className="flex-1 bg-slate-900/50 border border-slate-700/50 focus:border-amber-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}

                                    {/* 手动输入新的自定义指标 key */}
                                    <div className="flex items-center gap-2 pt-1">
                                        <input
                                            type="text"
                                            value={newCustomKey}
                                            onChange={e => setNewCustomKey(e.target.value)}
                                            placeholder="手动输入指标名，如：维修费"
                                            className="flex-1 bg-slate-900/50 border border-dashed border-slate-600/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500/50"
                                        />
                                        <button type="button"
                                            onClick={() => {
                                                const k = newCustomKey.trim();
                                                if (k && !selectedMetrics.find(m => m.key === k)) {
                                                    setSelectedMetrics(prev => [...prev, { key: k, label: k }]);
                                                    setNewCustomKey('');
                                                }
                                            }}
                                            className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
                                            title="添加此指标"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* 传统图表的数据源选择 */}
                    {!isAdvancedType && (
                        <div className="space-y-1.5">
                            <label className={labelCls}><DbIcon className="w-3.5 h-3.5 text-slate-400" /> 绑定数据源</label>
                            <div className="relative">
                                <select value={dataSource} onChange={e => setDataSource(e.target.value)} className={selectCls}>
                                    <option value="revenue">全节点营收与客流</option>
                                    <option value="passenger_flow">客运专项监控</option>
                                    <option value="project">校园与包车专项指标</option>
                                    <option value="social">自媒体影响力矩阵</option>
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors">取消</button>
                        <button type="submit" disabled={isSubmitting} className="flex-[2] px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {isSubmitting ? (<><div className="w-4 h-4 rounded-full border-t-2 border-white animate-spin" /> 正在保存...</>) : '确认添加并在大屏显示'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
