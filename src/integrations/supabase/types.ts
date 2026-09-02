export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_packs: {
        Row: {
          created_at: string
          id: string
          narrative: string | null
          period_end: string
          period_start: string
          totals: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          narrative?: string | null
          period_end: string
          period_start: string
          totals?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          narrative?: string | null
          period_end?: string
          period_start?: string
          totals?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          business_name: string
          created_at: string
          estimated_annual_turnover: number
          id: string
          tax_election: string
          tax_year_start: string | null
          updated_at: string
          user_id: string
          vat_registered: boolean
        }
        Insert: {
          business_name: string
          created_at?: string
          estimated_annual_turnover?: number
          id?: string
          tax_election?: string
          tax_year_start?: string | null
          updated_at?: string
          user_id: string
          vat_registered?: boolean
        }
        Update: {
          business_name?: string
          created_at?: string
          estimated_annual_turnover?: number
          id?: string
          tax_election?: string
          tax_year_start?: string | null
          updated_at?: string
          user_id?: string
          vat_registered?: boolean
        }
        Relationships: []
      }
      expense_records: {
        Row: {
          ai_reason: string | null
          ai_suggested_category: string | null
          amount: number
          category: string
          created_at: string
          description: string | null
          expense_date: string
          id: string
          is_capital_item: boolean
          is_demo: boolean
          needs_review: boolean
          receipt_path: string | null
          updated_at: string
          user_id: string
          vat_amount: number
          vendor: string | null
        }
        Insert: {
          ai_reason?: string | null
          ai_suggested_category?: string | null
          amount: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date: string
          id?: string
          is_capital_item?: boolean
          is_demo?: boolean
          needs_review?: boolean
          receipt_path?: string | null
          updated_at?: string
          user_id: string
          vat_amount?: number
          vendor?: string | null
        }
        Update: {
          ai_reason?: string | null
          ai_suggested_category?: string | null
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          is_capital_item?: boolean
          is_demo?: boolean
          needs_review?: boolean
          receipt_path?: string | null
          updated_at?: string
          user_id?: string
          vat_amount?: number
          vendor?: string | null
        }
        Relationships: []
      }
      income_deposits: {
        Row: {
          amount: number
          category: string
          created_at: string
          deposit_date: string
          evidence_path: string | null
          id: string
          is_demo: boolean
          linked_period: string | null
          notes: string | null
          source_description: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category?: string
          created_at?: string
          deposit_date: string
          evidence_path?: string | null
          id?: string
          is_demo?: boolean
          linked_period?: string | null
          notes?: string | null
          source_description?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          deposit_date?: string
          evidence_path?: string | null
          id?: string
          is_demo?: boolean
          linked_period?: string | null
          notes?: string | null
          source_description?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          onboarded: boolean
          preferred_language: string
          updated_at: string
          user_type: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          onboarded?: boolean
          preferred_language?: string
          updated_at?: string
          user_type?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          preferred_language?: string
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      salary_records: {
        Row: {
          basic_salary: number
          bonus: number
          created_at: string
          estimated_paye: number
          gross_salary: number
          id: string
          is_demo: boolean
          net_salary: number
          other_deductions: number
          other_taxable_income: number
          overtime: number
          paye_deducted: number
          paye_difference: number
          payslip_path: string | null
          period_month: string
          tax_status: string
          tax_year: string
          uif: number
          updated_at: string
          user_id: string
        }
        Insert: {
          basic_salary?: number
          bonus?: number
          created_at?: string
          estimated_paye?: number
          gross_salary?: number
          id?: string
          is_demo?: boolean
          net_salary?: number
          other_deductions?: number
          other_taxable_income?: number
          overtime?: number
          paye_deducted?: number
          paye_difference?: number
          payslip_path?: string | null
          period_month: string
          tax_status?: string
          tax_year: string
          uif?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          basic_salary?: number
          bonus?: number
          created_at?: string
          estimated_paye?: number
          gross_salary?: number
          id?: string
          is_demo?: boolean
          net_salary?: number
          other_deductions?: number
          other_taxable_income?: number
          overtime?: number
          paye_deducted?: number
          paye_difference?: number
          payslip_path?: string | null
          period_month?: string
          tax_status?: string
          tax_year?: string
          uif?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_alerts: {
        Row: {
          actual_amount: number | null
          alert_type: string
          created_at: string
          description: string
          difference: number | null
          estimated_amount: number | null
          id: string
          is_demo: boolean
          period_label: string | null
          recommended_action: string | null
          related_record_id: string | null
          severity: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_amount?: number | null
          alert_type: string
          created_at?: string
          description: string
          difference?: number | null
          estimated_amount?: number | null
          id?: string
          is_demo?: boolean
          period_label?: string | null
          recommended_action?: string | null
          related_record_id?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_amount?: number | null
          alert_type?: string
          created_at?: string
          description?: string
          difference?: number | null
          estimated_amount?: number | null
          id?: string
          is_demo?: boolean
          period_label?: string | null
          recommended_action?: string | null
          related_record_id?: string | null
          severity?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_provisions: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_demo: boolean
          notes: string | null
          obligation_type: string
          set_aside_date: string
          tax_year: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          is_demo?: boolean
          notes?: string | null
          obligation_type?: string
          set_aside_date?: string
          tax_year: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_demo?: boolean
          notes?: string | null
          obligation_type?: string
          set_aside_date?: string
          tax_year?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_rate_config: {
        Row: {
          brackets: Json
          created_at: string
          id: string
          interest_rates: Json | null
          rebates: Json
          source_note: string | null
          tax_year: string
          thresholds: Json
          turnover_tax_bands: Json | null
          vat_thresholds: Json | null
        }
        Insert: {
          brackets: Json
          created_at?: string
          id?: string
          interest_rates?: Json | null
          rebates: Json
          source_note?: string | null
          tax_year: string
          thresholds: Json
          turnover_tax_bands?: Json | null
          vat_thresholds?: Json | null
        }
        Update: {
          brackets?: Json
          created_at?: string
          id?: string
          interest_rates?: Json | null
          rebates?: Json
          source_note?: string | null
          tax_year?: string
          thresholds?: Json
          turnover_tax_bands?: Json | null
          vat_thresholds?: Json | null
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
