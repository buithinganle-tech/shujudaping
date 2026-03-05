import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { WidgetConfig } from '../types/supabase'

export interface RouteMetricRow {
    id: string
    route_name: string
    record_date: string
    revenue: number
    passenger_count: number
    energy_cost: number
    mileage: number
    custom_metrics?: Record<string, number>
    [key: string]: any // allow dynamic metric access
}

export interface WidgetDataResult {
    primary: RouteMetricRow[]
    compare: RouteMetricRow[]
    isLoading: boolean
    error: string | null
}

/**
 * 根据 WidgetConfig 中的线路、时间、对比等配置，
 * 从 route_daily_metrics 表中精准查询数据。
 */
export function useWidgetData(config: WidgetConfig | undefined): WidgetDataResult {
    const [primary, setPrimary] = useState<RouteMetricRow[]>([])
    const [compare, setCompare] = useState<RouteMetricRow[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!config || !config.routes || config.routes.length === 0) {
            setIsLoading(false)
            return
        }

        const fetchData = async () => {
            setIsLoading(true)
            setError(null)

            try {
                // ── 计算日期范围 ──
                const { start, end } = resolveDateRange(config.date_range)

                // ── 主数据查询 ──
                let primaryQuery = supabase
                    .from('route_daily_metrics')
                    .select('*')
                    .in('route_name', config.routes!)
                    .order('record_date', { ascending: true })

                if (start) primaryQuery = primaryQuery.gte('record_date', start)
                if (end) primaryQuery = primaryQuery.lte('record_date', end)

                const { data: primaryData, error: primaryError } = await primaryQuery

                if (primaryError) {
                    setError(`主数据查询失败: ${primaryError.message}`)
                    setIsLoading(false)
                    return
                }
                setPrimary(flattenCustomMetrics((primaryData as RouteMetricRow[]) || []))

                // ── 对比数据查询（如果有） ──
                if (config.compare_routes && config.compare_routes.length > 0) {
                    const compareRange = config.compare_date_range
                        ? resolveDateRange(config.compare_date_range)
                        : { start, end } // 默认用同一时间段

                    let compareQuery = supabase
                        .from('route_daily_metrics')
                        .select('*')
                        .in('route_name', config.compare_routes)
                        .order('record_date', { ascending: true })

                    if (compareRange.start) compareQuery = compareQuery.gte('record_date', compareRange.start)
                    if (compareRange.end) compareQuery = compareQuery.lte('record_date', compareRange.end)

                    const { data: compareData, error: compareError } = await compareQuery

                    if (compareError) {
                        setError(`对比数据查询失败: ${compareError.message}`)
                    } else {
                        setCompare(flattenCustomMetrics((compareData as RouteMetricRow[]) || []))
                    }
                } else {
                    setCompare([])
                }
            } catch (err: any) {
                setError(err.message || '未知查询错误')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [
        // 只在配置核心字段变化时重查
        JSON.stringify(config?.routes),
        JSON.stringify(config?.compare_routes),
        JSON.stringify(config?.date_range),
        JSON.stringify(config?.compare_date_range),
    ])

    return { primary, compare, isLoading, error }
}

// ── 工具函数：将 date_range 配置解析为起止日期字符串 ──
function resolveDateRange(
    range?: { type: string; start?: string; end?: string }
): { start: string | null; end: string | null } {
    if (!range) return { start: null, end: null }

    const today = new Date()
    const fmt = (d: Date) => d.toISOString().split('T')[0]

    switch (range.type) {
        case 'last_7_days': {
            const s = new Date(today)
            s.setDate(s.getDate() - 6)
            return { start: fmt(s), end: fmt(today) }
        }
        case 'last_30_days': {
            const s = new Date(today)
            s.setDate(s.getDate() - 29)
            return { start: fmt(s), end: fmt(today) }
        }
        case 'this_month': {
            const s = new Date(today.getFullYear(), today.getMonth(), 1)
            return { start: fmt(s), end: fmt(today) }
        }
        case 'last_month': {
            const s = new Date(today.getFullYear(), today.getMonth() - 1, 1)
            const e = new Date(today.getFullYear(), today.getMonth(), 0) // last day of prev month
            return { start: fmt(s), end: fmt(e) }
        }
        case 'last_month_same_period': {
            const s = new Date(today)
            s.setMonth(s.getMonth() - 1)
            s.setDate(1)
            const e = new Date(today)
            e.setMonth(e.getMonth() - 1)
            return { start: fmt(s), end: fmt(e) }
        }
        case 'custom':
            return { start: range.start || null, end: range.end || null }
        default:
            return { start: null, end: null }
    }
}

/**
 * 将每行的 custom_metrics JSONB 字段平铺到行对象上，
 * 使自定义指标的 key（如 maintenance_fee）可以像 revenue 一样直接通过 row[key] 访问。
 */
function flattenCustomMetrics(rows: RouteMetricRow[]): RouteMetricRow[] {
    return rows.map(row => {
        if (!row.custom_metrics || typeof row.custom_metrics !== 'object') return row
        return { ...row, ...row.custom_metrics }
    })
}
