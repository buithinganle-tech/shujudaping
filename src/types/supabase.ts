export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

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
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    chart_type: string
                    data_source: string
                    order?: number
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    chart_type?: string
                    data_source?: string
                    order?: number
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
