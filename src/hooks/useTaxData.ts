import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TaxConfig } from "@/lib/tax-engine";
import { currentTaxYear } from "@/lib/tax-year";

export function useTaxConfig() {
  return useQuery({
    queryKey: ["tax-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_rate_config")
        .select("*")
        .order("tax_year", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as unknown as TaxConfig[];
      const years = rows.map((r) => r.tax_year);
      const active = rows.find((r) => r.tax_year === currentTaxYear()) ?? rows[0] ?? null;
      return { rows, years, active, stale: !years.includes(currentTaxYear()) };
    },
    staleTime: 60 * 60 * 1000,
  });
}

export function useProfile(userId?: string) {
  return useQuery({
    enabled: !!userId,
    queryKey: ["profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useBusinessProfile(userId?: string) {
  return useQuery({
    enabled: !!userId,
    queryKey: ["business-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSalaryRecords(userId?: string) {
  return useQuery({
    enabled: !!userId,
    queryKey: ["salary", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_records")
        .select("*")
        .order("period_month", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useExpenses(userId?: string) {
  return useQuery({
    enabled: !!userId,
    queryKey: ["expenses", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expense_records")
        .select("*")
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDeposits(userId?: string) {
  return useQuery({
    enabled: !!userId,
    queryKey: ["deposits", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("income_deposits")
        .select("*")
        .order("deposit_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAlerts(userId?: string) {
  return useQuery({
    enabled: !!userId,
    queryKey: ["alerts", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_alerts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useProvisions(userId?: string) {
  return useQuery({
    enabled: !!userId,
    queryKey: ["provisions", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_provisions")
        .select("*")
        .order("set_aside_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRefresh() {
  const qc = useQueryClient();
  return (keys: string[]) => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}
