export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface MetricConfig {
    key: string       // 数据库字段名，如 'revenue', 'passenger_count'
    label: string     // 自定义显示标题，如 '花石线日入'
}

export interface WidgetConfig {
    routes?: string[]              // 主选线路，如 ['湘潭-花石']
    compare_routes?: string[]      // 对比线路，如 ['湘潭-湘乡']
    date_range?: {
        type: 'last_7_days' | 'last_30_days' | 'this_month' | 'last_month' | 'custom'
        start?: string             // 自定义开始日期
        end?: string               // 自定义结束日期
    }
    compare_date_range?: {
        type: 'last_month_same_period' | 'custom'
        start?: string
        end?: string
    }
    metrics?: MetricConfig[]       // 要展示的指标及其自定义标题
    view_mode?: 'daily' | 'monthly'
}

export interface Database {
    public: {
        Tables: {
            dashboard_configs: {
                Row: {
                    id: string
                    title: string
                    chart_type: string
                    data_source: string
                    order: number
                    config: WidgetConfig
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    chart_type: string
                    data_source: string
                    order?: number
                    config?: WidgetConfig
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    chart_type?: string
                    data_source?: string
                    order?: number
                    config?: WidgetConfig
                    created_at?: string | null
                }
                Relationships: []
            }
            route_daily_metrics: {
                Row: {
                    id: string
                    route_name: string
                    record_date: string
                    revenue: number
                    passenger_count: number
                    energy_cost: number
                    mileage: number
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    route_name: string
                    record_date: string
                    revenue?: number
                    passenger_count?: number
                    energy_cost?: number
                    mileage?: number
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    route_name?: string
                    record_date?: string
                    revenue?: number
                    passenger_count?: number
                    energy_cost?: number
                    mileage?: number
                    created_at?: string | null
                }
                Relationships: []
            }
            company_metrics: {
                Row: {
                    id: string
                    branch_name: string
                    daily_revenue: number
                    project_progress: number
                    passenger_flow: number
                    charter_revenue: number
                    social_engagement: number
                    safety_days: number
                    is_active: boolean
                    updated_at: string
                }
                Insert: {
                    id?: string
                    branch_name: string
                    daily_revenue?: number
                    project_progress?: number
                    passenger_flow?: number
                    charter_revenue?: number
                    social_engagement?: number
                    safety_days?: number
                    is_active?: boolean
                    updated_at?: string
                }
                Update: {
                    id?: string
                    branch_name?: string
                    daily_revenue?: number
                    project_progress?: number
                    passenger_flow?: number
                    charter_revenue?: number
                    social_engagement?: number
                    safety_days?: number
                    is_active?: boolean
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
