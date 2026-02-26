import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import { Send, CheckCircle, AlertCircle, ArrowLeft, BarChart2, Loader2 } from 'lucide-react'

const BRANCHES = [
    '湘潭客运分公司',
    '易俗河汽车站',
    '湘乡汽车站',
    '韶山汽车站',
    '公交集团',
]

type ToastState = 'idle' | 'loading' | 'success' | 'error'

interface FormData {
    branch_name: string
    daily_revenue: string
    passenger_flow: string
    charter_revenue: string
    social_engagement: string
    project_progress: number
    safety_days: string
}

const DEFAULT_FORM: FormData = {
    branch_name: BRANCHES[0],
    daily_revenue: '',
    passenger_flow: '',
    charter_revenue: '',
    social_engagement: '',
    project_progress: 50,
    safety_days: '',
}

function InputField({
    label, name, value, onChange, placeholder, unit
}: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string; unit?: string;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">{label}</label>
            <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-700/60 rounded-lg overflow-hidden focus-within:border-cyan-500/70 transition-colors">
                <input
                    type="number"
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder ?? '请输入数值'}
                    min="0"
                    className="flex-1 bg-transparent px-4 py-3 text-white placeholder-slate-600 outline-none text-base"
                />
                {unit && (
                    <span className="pr-4 text-sm text-slate-500 shrink-0">{unit}</span>
                )}
            </div>
        </div>
    )
}

export default function AdminPage() {
    const [form, setForm] = useState<FormData>(DEFAULT_FORM)
    const [toast, setToast] = useState<ToastState>('idle')
    const [errMsg, setErrMsg] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setForm(prev => ({ ...prev, [name]: name === 'project_progress' ? Number(value) : value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setToast('loading')
        setErrMsg('')

        const payload = {
            branch_name: form.branch_name,
            daily_revenue: Number(form.daily_revenue) || 0,
            passenger_flow: Number(form.passenger_flow) || 0,
            charter_revenue: Number(form.charter_revenue) || 0,
            social_engagement: Number(form.social_engagement) || 0,
            project_progress: form.project_progress,
            safety_days: Number(form.safety_days) || 0,
            is_active: true,
            updated_at: new Date().toISOString(),
        }

        const { error } = await supabase
            .from('company_metrics')
            .upsert(payload, { onConflict: 'branch_name' })

        if (error) {
            setErrMsg(error.message)
            setToast('error')
        } else {
            setToast('success')
            setTimeout(() => setToast('idle'), 3000)
        }
    }

    return (
        <div className="min-h-screen bg-[#0b1120] text-slate-200 flex flex-col items-center py-8 px-4">
            {/* Header */}
            <div className="w-full max-w-md mb-6">
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-cyan-400 transition-colors mb-4"
                >
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

            {/* Form Card */}
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 flex flex-col gap-5 shadow-xl"
            >
                {/* 分公司选择 */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-300">分公司 / 站点</label>
                    <select
                        name="branch_name"
                        value={form.branch_name}
                        onChange={handleChange}
                        className="bg-slate-900/60 border border-slate-700/60 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-500/70 transition-colors appearance-none text-base"
                    >
                        {BRANCHES.map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </div>

                <div className="h-px bg-slate-700/40" />

                {/* 数值字段 */}
                <InputField label="今日营收" name="daily_revenue" value={form.daily_revenue} onChange={handleChange} placeholder="如：125000" unit="元" />
                <InputField label="今日客流量" name="passenger_flow" value={form.passenger_flow} onChange={handleChange} placeholder="如：6800" unit="人次" />
                <InputField label="包车业务营收" name="charter_revenue" value={form.charter_revenue} onChange={handleChange} placeholder="如：38000" unit="元" />
                <InputField label="抖音互动量" name="social_engagement" value={form.social_engagement} onChange={handleChange} placeholder="如：52000" unit="次" />
                <InputField label="安全运行天数" name="safety_days" value={form.safety_days} onChange={handleChange} placeholder="如：1825" unit="天" />

                {/* 进度滑块 */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-slate-300">重点项目完成进度</label>
                        <span className="text-2xl font-mono font-bold text-cyan-400">{form.project_progress}%</span>
                    </div>
                    <input
                        type="range"
                        name="project_progress"
                        min={0}
                        max={100}
                        value={form.project_progress}
                        onChange={handleChange}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-cyan-400 bg-slate-700"
                    />
                    <div className="flex justify-between text-xs text-slate-600">
                        <span>0%</span><span>50%</span><span>100%</span>
                    </div>
                </div>

                {/* 提交按钮 */}
                <button
                    type="submit"
                    disabled={toast === 'loading'}
                    className="mt-2 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-bold py-4 rounded-xl transition-all duration-200 text-base active:scale-95"
                >
                    {toast === 'loading' ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> 提交中...</>
                    ) : (
                        <><Send className="w-5 h-5" /> 提交数据至大屏</>
                    )}
                </button>

                {/* Toast 提示 */}
                {toast === 'success' && (
                    <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-lg px-4 py-3 text-sm animate-[slideIn_0.3s_ease-out]">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        提交成功，数据已实时同步至监控大屏！
                    </div>
                )}
                {toast === 'error' && (
                    <div className="flex items-start gap-2 bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-lg px-4 py-3 text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>提交失败：{errMsg || '请检查网络或配置'}</span>
                    </div>
                )}
            </form>

            <p className="mt-6 text-xs text-slate-700 text-center">
                仅供内部各站点管理员使用 · 数据提交后立即写入数据库
            </p>
        </div>
    )
}
