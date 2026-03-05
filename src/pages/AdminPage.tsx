import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { Send, CheckCircle, AlertCircle, ArrowLeft, BarChart2, Loader2, Route, Building2 } from 'lucide-react'

// ── 分公司数据录入（原有功能） ─────────────────────────
const BRANCHES = ['湘潭客运分公司', '易俗河汽车站', '湘乡汽车站', '韶山汽车站', '公交集团']

type ToastState = 'idle' | 'loading' | 'success' | 'error'

interface BranchFormData {
    branch_name: string
    daily_revenue: string
    passenger_flow: string
    charter_revenue: string
    social_engagement: string
    project_progress: number
    safety_days: string
}

const DEFAULT_BRANCH_FORM: BranchFormData = {
    branch_name: BRANCHES[0],
    daily_revenue: '', passenger_flow: '', charter_revenue: '',
    social_engagement: '', project_progress: 50, safety_days: '',
}

// ── 线路每日数据录入（新增功能） ─────────────────────────
interface RouteFormData {
    route_name: string
    record_date: string
    revenue: string
    passenger_count: string
    energy_cost: string
    mileage: string
}

const today = new Date().toISOString().split('T')[0]

const DEFAULT_ROUTE_FORM: RouteFormData = {
    route_name: '', record_date: today,
    revenue: '', passenger_count: '', energy_cost: '', mileage: '',
}

// ── 通用输入组件 ──
function InputField({ label, name, value, onChange, placeholder, unit, type = 'number' }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string; unit?: string; type?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">{label}</label>
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/60 rounded-lg overflow-hidden focus-within:border-cyan-500/70 transition-colors">
                <input
                    type={type} name={name} value={value} onChange={onChange}
                    placeholder={placeholder ?? '请输入数值'} min="0"
                    className="flex-1 bg-transparent px-4 py-3 text-white placeholder-slate-600 outline-none text-base"
                />
                {unit && <span className="pr-4 text-sm text-slate-500 shrink-0">{unit}</span>}
            </div>
        </div>
    )
}

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<'branch' | 'route'>('route')

    // ── 分公司表单状态 ──
    const [branchForm, setBranchForm] = useState<BranchFormData>(DEFAULT_BRANCH_FORM)
    const [branchToast, setBranchToast] = useState<ToastState>('idle')
    const [branchErr, setBranchErr] = useState('')

    // ── 线路表单状态 ──
    const [routeForm, setRouteForm] = useState<RouteFormData>(DEFAULT_ROUTE_FORM)
    const [routeToast, setRouteToast] = useState<ToastState>('idle')
    const [routeErr, setRouteErr] = useState('')
    const [availableRoutes, setAvailableRoutes] = useState<string[]>([])
    const [newRouteName, setNewRouteName] = useState('')

    // 加载已有线路列表
    useEffect(() => {
        const fetchRoutes = async () => {
            const { data } = await supabase.from('route_daily_metrics').select('route_name')
            if (data) {
                const unique = [...new Set(data.map((r: any) => r.route_name))]
                setAvailableRoutes(unique)
                if (unique.length > 0 && !routeForm.route_name) {
                    setRouteForm(prev => ({ ...prev, route_name: unique[0] }))
                }
            }
        }
        fetchRoutes()
    }, [])

    // ── 分公司提交 ──
    const handleBranchSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setBranchToast('loading'); setBranchErr('')
        const payload = {
            branch_name: branchForm.branch_name,
            daily_revenue: Number(branchForm.daily_revenue) || 0,
            passenger_flow: Number(branchForm.passenger_flow) || 0,
            charter_revenue: Number(branchForm.charter_revenue) || 0,
            social_engagement: Number(branchForm.social_engagement) || 0,
            project_progress: branchForm.project_progress,
            safety_days: Number(branchForm.safety_days) || 0,
            is_active: true, updated_at: new Date().toISOString(),
        }
        const { error } = await supabase.from('company_metrics').upsert(payload, { onConflict: 'branch_name' })
        if (error) { setBranchErr(error.message); setBranchToast('error') }
        else { setBranchToast('success'); setTimeout(() => setBranchToast('idle'), 3000) }
    }

    // ── 线路提交（upsert） ──
    const handleRouteSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const routeName = newRouteName.trim() || routeForm.route_name
        if (!routeName) { setRouteErr('请选择或输入线路名'); setRouteToast('error'); return }
        if (!routeForm.record_date) { setRouteErr('请选择日期'); setRouteToast('error'); return }

        setRouteToast('loading'); setRouteErr('')
        const payload = {
            route_name: routeName,
            record_date: routeForm.record_date,
            revenue: Number(routeForm.revenue) || 0,
            passenger_count: Number(routeForm.passenger_count) || 0,
            energy_cost: Number(routeForm.energy_cost) || 0,
            mileage: Number(routeForm.mileage) || 0,
        }
        const { error } = await supabase
            .from('route_daily_metrics')
            .upsert(payload, { onConflict: 'route_name,record_date' })

        if (error) { setRouteErr(error.message); setRouteToast('error') }
        else {
            setRouteToast('success')
            // 新线路加入列表
            if (!availableRoutes.includes(routeName)) {
                setAvailableRoutes(prev => [...prev, routeName])
            }
            setNewRouteName('')
            setTimeout(() => setRouteToast('idle'), 3000)
        }
    }

    const handleBranchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setBranchForm(prev => ({ ...prev, [name]: name === 'project_progress' ? Number(value) : value }))
    }

    const handleRouteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setRouteForm(prev => ({ ...prev, [name]: value }))
    }

    const tabCls = (active: boolean) =>
        `flex-1 py-3 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${active ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`

    return (
        <div className="min-h-screen bg-[#0b1120] text-slate-200 flex flex-col items-center py-8 px-4">
            {/* Header */}
            <div className="w-full max-w-md mb-6">
                <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors mb-4">
                    <ArrowLeft className="w-3.5 h-3.5" /> 返回大屏监控
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                        <BarChart2 className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">湘潭交运集团</h1>
                        <p className="text-xs text-slate-500 tracking-wider">数据填报端 · 各分公司使用</p>
                    </div>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="w-full max-w-md flex gap-2 mb-4">
                <button onClick={() => setActiveTab('route')} className={tabCls(activeTab === 'route')}>
                    <Route className="w-4 h-4" /> 线路每日数据
                </button>
                <button onClick={() => setActiveTab('branch')} className={tabCls(activeTab === 'branch')}>
                    <Building2 className="w-4 h-4" /> 分公司总览
                </button>
            </div>

            {/* ════════ 线路每日数据录入 ════════ */}
            {activeTab === 'route' && (
                <form onSubmit={handleRouteSubmit}
                    className="w-full max-w-md bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 flex flex-col gap-5 shadow-xl">

                    {/* 线路选择 / 新增 */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300">线路名称</label>
                        {availableRoutes.length > 0 ? (
                            <select name="route_name" value={routeForm.route_name} onChange={handleRouteChange}
                                className="bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-500/70 transition-colors appearance-none text-base">
                                {availableRoutes.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        ) : (
                            <p className="text-xs text-slate-500">暂无线路，请在下方输入新线路名</p>
                        )}
                        <input type="text" value={newRouteName} onChange={e => setNewRouteName(e.target.value)}
                            placeholder="或输入新线路名，如：湘潭-韶山"
                            className="bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-cyan-500/70 transition-colors" />
                    </div>

                    {/* 日期选择 */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300">数据日期</label>
                        <input type="date" name="record_date" value={routeForm.record_date} onChange={handleRouteChange}
                            className="bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-500/70 transition-colors text-base" />
                    </div>

                    <div className="h-px bg-slate-700/40" />

                    <InputField label="当日营收" name="revenue" value={routeForm.revenue} onChange={handleRouteChange} placeholder="如：5000" unit="元" />
                    <InputField label="当日人数" name="passenger_count" value={routeForm.passenger_count} onChange={handleRouteChange} placeholder="如：200" unit="人" />
                    <InputField label="当日能耗" name="energy_cost" value={routeForm.energy_cost} onChange={handleRouteChange} placeholder="如：800" unit="元" />
                    <InputField label="当日里程" name="mileage" value={routeForm.mileage} onChange={handleRouteChange} placeholder="如：350" unit="km" />

                    <button type="submit" disabled={routeToast === 'loading'}
                        className="mt-2 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-4 rounded-xl transition-all duration-200 text-base active:scale-95">
                        {routeToast === 'loading' ? (<><Loader2 className="w-5 h-5 animate-spin" /> 提交中...</>) : (<><Send className="w-5 h-5" /> 提交线路数据</>)}
                    </button>

                    {routeToast === 'success' && (
                        <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg px-4 py-3 text-sm">
                            <CheckCircle className="w-4 h-4 shrink-0" /> 线路数据已保存，大屏将实时更新！
                        </div>
                    )}
                    {routeToast === 'error' && (
                        <div className="flex items-start gap-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-lg px-4 py-3 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>提交失败：{routeErr}</span>
                        </div>
                    )}
                </form>
            )}

            {/* ════════ 分公司总览录入（原有） ════════ */}
            {activeTab === 'branch' && (
                <form onSubmit={handleBranchSubmit}
                    className="w-full max-w-md bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 flex flex-col gap-5 shadow-xl">

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300">分公司 / 站点</label>
                        <select name="branch_name" value={branchForm.branch_name} onChange={handleBranchChange}
                            className="bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-500/70 transition-colors appearance-none text-base">
                            {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                    </div>

                    <div className="h-px bg-slate-700/40" />

                    <InputField label="今日营收" name="daily_revenue" value={branchForm.daily_revenue} onChange={handleBranchChange} placeholder="如：125000" unit="元" />
                    <InputField label="今日客流量" name="passenger_flow" value={branchForm.passenger_flow} onChange={handleBranchChange} placeholder="如：6800" unit="人次" />
                    <InputField label="包车业务营收" name="charter_revenue" value={branchForm.charter_revenue} onChange={handleBranchChange} placeholder="如：38000" unit="元" />
                    <InputField label="抖音互动量" name="social_engagement" value={branchForm.social_engagement} onChange={handleBranchChange} placeholder="如：52000" unit="次" />
                    <InputField label="安全运行天数" name="safety_days" value={branchForm.safety_days} onChange={handleBranchChange} placeholder="如：1825" unit="天" />

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-300">重点项目完成进度</label>
                            <span className="text-2xl font-mono font-bold text-cyan-400">{branchForm.project_progress}%</span>
                        </div>
                        <input type="range" name="project_progress" min={0} max={100} value={branchForm.project_progress} onChange={handleBranchChange}
                            className="w-full h-2 rounded-full appearance-none cursor-pointer accent-cyan-400 bg-slate-700" />
                        <div className="flex justify-between text-xs text-slate-600">
                            <span>0%</span><span>50%</span><span>100%</span>
                        </div>
                    </div>

                    <button type="submit" disabled={branchToast === 'loading'}
                        className="mt-2 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-4 rounded-xl transition-all duration-200 text-base active:scale-95">
                        {branchToast === 'loading' ? (<><Loader2 className="w-5 h-5 animate-spin" /> 提交中...</>) : (<><Send className="w-5 h-5" /> 提交数据至大屏</>)}
                    </button>

                    {branchToast === 'success' && (
                        <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg px-4 py-3 text-sm">
                            <CheckCircle className="w-4 h-4 shrink-0" /> 提交成功，数据已实时同步至监控大屏！
                        </div>
                    )}
                    {branchToast === 'error' && (
                        <div className="flex items-start gap-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-lg px-4 py-3 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> <span>提交失败：{branchErr}</span>
                        </div>
                    )}
                </form>
            )}

            <p className="mt-6 text-xs text-slate-700 text-center">
                仅供内部各站点管理员使用 · 数据提交后立即写入数据库
            </p>
        </div>
    )
}
