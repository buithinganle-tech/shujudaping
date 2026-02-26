import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { supabase } from './lib/supabase'
import Header from './components/Header'
import RevenueChart from './components/RevenueChart'
import ProjectProgress from './components/ProjectProgress'
import MarketingGauge from './components/MarketingGauge'
import LiveLog from './components/LiveLog'
import AdminPage from './pages/AdminPage'

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
    fetchMetrics()

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

    return () => { supabase.removeChannel(channel) }
  }, [])

  const totalRevenue = metrics.reduce((sum, i) => sum + Number(i.daily_revenue || 0), 0)
  const totalPassengerFlow = metrics.reduce((sum, i) => sum + Number(i.passenger_flow || 0), 0)
  const totalCharter = metrics.reduce((sum, i) => sum + Number(i.charter_revenue || 0), 0)
  const charterRatio = totalRevenue > 0 ? Math.round((totalCharter / totalRevenue) * 100) : 0
  const totalSocialEngagement = metrics.reduce((sum, i) => sum + Number(i.social_engagement || 0), 0)

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

          <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden min-h-0">
            <div className="col-span-12 lg:col-span-7 bg-[#0f1d35]/70 backdrop-blur-md rounded-xl border border-slate-700/50 p-4 shadow-lg flex flex-col overflow-hidden group hover:border-cyan-500/40 transition-colors duration-500">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
              <RevenueChart data={metrics} />
            </div>

            <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 overflow-hidden">
              <div className="flex-[1.2] bg-[#0f1d35]/70 backdrop-blur-md rounded-xl border border-slate-700/50 p-4 shadow-lg flex flex-col overflow-hidden hover:border-cyan-500/40 transition-colors">
                <ProjectProgress data={metrics} />
              </div>
              <div className="flex-1 bg-[#0f1d35]/70 backdrop-blur-md rounded-xl border border-slate-700/50 p-4 shadow-lg flex flex-col overflow-hidden hover:border-violet-500/40 transition-colors">
                <MarketingGauge totalEngagement={totalSocialEngagement} />
              </div>
            </div>
          </div>

          <div className="h-[130px] shrink-0 bg-[#07111f]/90 backdrop-blur-md rounded-xl border border-slate-700/40 px-4 py-3 flex flex-col overflow-hidden">
            <h2 className="text-xs font-bold text-emerald-400 mb-2 flex items-center uppercase tracking-widest shrink-0">
              <Activity className="w-3.5 h-3.5 mr-1.5" /> 实时调度日志
            </h2>
            <div className="flex-1 overflow-hidden">
              <LiveLog logs={logs} />
            </div>
          </div>
        </div>
      } />
    </Routes>
  )
}

export default App
