import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Activity, Lock, Unlock, Plus } from 'lucide-react'
import { supabase } from './lib/supabase'
import Header from './components/Header'
import LiveLog from './components/LiveLog'
import WidgetPicker from './components/WidgetPicker'
import ErrorBoundary from './components/ErrorBoundary'
import AddWidgetModal from './components/AddWidgetModal'
import AdminPage from './pages/AdminPage'
import type { Database } from './types/supabase'

type DashboardConfig = Database['public']['Tables']['dashboard_configs']['Row'];

export interface CompanyMetric {
  id: string;
  branch_name: string;
  daily_revenue: number;
  project_progress: number;
  passenger_flow: number;
  charter_revenue: number;
  social_engagement: number;
  safety_days: number;
  is_active: boolean;
  updated_at: string;
}

export interface LogEntry {
  id: string;
  message: string;
  timestamp: string;
}

function App() {
  const [metrics, setMetrics] = useState<CompanyMetric[]>([])
  const [prevMetrics, setPrevMetrics] = useState<CompanyMetric[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [configs, setConfigs] = useState<DashboardConfig[]>([])
  const [isConfigLoading, setIsConfigLoading] = useState(true)

  // Admin & Modal State
  const [isAdminMode, setIsAdminMode] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const addLog = (message: string) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      message,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false })
    }
    setLogs(prev => [entry, ...prev].slice(0, 50))
  }

  useEffect(() => {
    const fetchMetrics = async () => {
      // 取所有数据，按 updated_at 倒序
      const { data: allData } = await supabase
        .from('company_metrics')
        .select('*')
        .order('updated_at', { ascending: false })

      if (!allData || allData.length === 0) {
        addLog('⚠️ 暂无节点数据，请确认数据库已初始化')
        return
      }

      // 按 branch_name 取最新一条 → 今日数据
      const latestMap = new Map<string, CompanyMetric>()
      const secondMap = new Map<string, CompanyMetric>()
      for (const row of allData as CompanyMetric[]) {
        if (!latestMap.has(row.branch_name)) {
          latestMap.set(row.branch_name, row)
        } else if (!secondMap.has(row.branch_name)) {
          secondMap.set(row.branch_name, row)
        }
      }

      const todayData = Array.from(latestMap.values())
      const yesterdayData = Array.from(secondMap.values())

      setMetrics(todayData)
      setPrevMetrics(yesterdayData)
      addLog('🟢 集团数字化指挥中心上线，全节点数据加载完成')
    }

    const fetchConfigs = async () => {
      setIsConfigLoading(true)
      const { data, error } = await supabase
        .from('dashboard_configs')
        .select('*')
        .order('order', { ascending: true })

      if (error) {
        addLog(`❌ 配置加载失败: ${error.message}`)
        setIsConfigLoading(false)
        return
      }
      setConfigs(data || [])
      setIsConfigLoading(false)
    }

    fetchMetrics()
    fetchConfigs()

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'company_metrics' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as CompanyMetric
            setMetrics(prev => prev.map(item => item.id === updated.id ? updated : item))
            addLog(`⚡ 实时刷新：[${updated.branch_name}] 营收 ¥${Number(updated.daily_revenue).toLocaleString()} · 客流 ${Number(updated.passenger_flow).toLocaleString()} 人次`)
          } else if (payload.eventType === 'INSERT') {
            const inserted = payload.new as CompanyMetric
            setMetrics(prev => [...prev, inserted])
            addLog(`📡 新节点接入：${inserted.branch_name} 已并入调度网络`)
          }
        }
      )
      .subscribe()

    const configChannel = supabase
      .channel('schema-config-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'dashboard_configs' },
        () => {
          fetchConfigs(); // Re-fetch on any config change
        }
      )
      .subscribe()


    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(configChannel)
    }
  }, [])

  const totalRevenue = metrics.reduce((sum, i) => sum + Number(i.daily_revenue || 0), 0)
  const totalPassengerFlow = metrics.reduce((sum, i) => sum + Number(i.passenger_flow || 0), 0)
  const totalCharter = metrics.reduce((sum, i) => sum + Number(i.charter_revenue || 0), 0)
  const charterRatio = totalRevenue > 0 ? Math.round((totalCharter / totalRevenue) * 100) : 0

  const prevRevenue = prevMetrics.reduce((sum, i) => sum + Number(i.daily_revenue || 0), 0)
  const prevFlow = prevMetrics.reduce((sum, i) => sum + Number(i.passenger_flow || 0), 0)
  const revenueGrowth = prevRevenue > 0 ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) : 0
  const flowGrowth = prevFlow > 0 ? Math.round(((totalPassengerFlow - prevFlow) / prevFlow) * 100) : 0

  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/" element={
        <div className="w-full h-full min-h-screen bg-[#060d1a] text-slate-200 flex flex-col p-3 md:p-4 gap-4 box-border absolute inset-0 overflow-hidden">
          <Header
            totalRevenue={totalRevenue}
            totalPassengerFlow={totalPassengerFlow}
            charterRatio={charterRatio}
            revenueGrowth={revenueGrowth}
            flowGrowth={flowGrowth}
          />

          {/* 动态配置化大屏渲染区域 */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto min-h-0 pb-4 custom-scrollbar pr-2">
            {isConfigLoading ? (
              <div className="col-span-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <div className="w-16 h-16 rounded-full border-t-2 border-cyan-500 animate-spin"></div>
                <p>正在加载大屏配置 (Supabase)...</p>
              </div>
            ) : configs.length === 0 ? (
              <div className="col-span-full h-full flex flex-col items-center justify-center text-slate-500 gap-4">
                <Activity className="w-16 h-16 text-slate-700 mb-2 opacity-50" />
                <p>大屏目前没有任何模块，或者数据库表仍为空。</p>
                <p className="text-sm">请等待后续管理员功能开发，或检查 Supabase 数据。</p>
              </div>
            ) : (
              configs.map(config => (
                <div key={config.id} className={`${config.chart_type === 'bar' || config.chart_type === 'line' ? 'md:col-span-2 xl:col-span-2' : 'col-span-1'} flex flex-col`}>
                  <ErrorBoundary fallbackTitle={config.title}>
                    <WidgetPicker
                      config={config}
                      data={metrics}
                    />
                  </ErrorBoundary>
                </div>
              ))
            )}
          </div>

          <div className="h-[130px] shrink-0 bg-[#07111f]/90 backdrop-blur-md rounded-xl border border-slate-700/40 px-4 py-3 flex flex-col overflow-hidden">
            <h2 className="text-xs font-bold text-emerald-400 mb-2 flex items-center uppercase tracking-widest shrink-0">
              <Activity className="w-3.5 h-3.5 mr-1.5" /> 实时调度日志
            </h2>
            <div className="flex-1 overflow-hidden">
              <LiveLog logs={logs} />
            </div>
          </div>

          {/* Admin Mode Toggle (Bottom Left) */}
          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className={`absolute bottom-6 left-6 p-3 rounded-full flex items-center justify-center transition-all shadow-lg backdrop-blur-md border ${isAdminMode
              ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30'
              : 'bg-slate-800/50 text-slate-500 border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-300'
              }`}
            title={isAdminMode ? "关闭监控管理模式" : "开启监控管理模式"}
          >
            {isAdminMode ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </button>

          {/* Add Widget FAB (Bottom Right, visible only in Admin Mode) */}
          {isAdminMode && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="absolute bottom-6 right-6 p-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full shadow-lg shadow-cyan-900/50 hover:shadow-cyan-500/50 hover:scale-105 transition-all animate-in slide-in-from-bottom-5"
              title="添加数据板块"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}

          {/* Add Widget Modal */}
          <AddWidgetModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            nextOrder={configs.length > 0 ? Math.max(...configs.map(c => c.order)) + 1 : 1}
          />
        </div>
      } />
    </Routes>
  )
}

export default App
