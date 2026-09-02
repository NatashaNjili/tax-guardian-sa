-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  user_type TEXT NOT NULL DEFAULT 'employee',
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  tax_election TEXT NOT NULL DEFAULT 'standard',
  vat_registered BOOLEAN NOT NULL DEFAULT false,
  estimated_annual_turnover NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_year_start DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_profiles TO authenticated;
GRANT ALL ON public.business_profiles TO service_role;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own business profile" ON public.business_profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.salary_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  period_month DATE NOT NULL,
  tax_year TEXT NOT NULL,
  basic_salary NUMERIC(14,2) NOT NULL DEFAULT 0,
  bonus NUMERIC(14,2) NOT NULL DEFAULT 0,
  overtime NUMERIC(14,2) NOT NULL DEFAULT 0,
  other_taxable_income NUMERIC(14,2) NOT NULL DEFAULT 0,
  gross_salary NUMERIC(14,2) NOT NULL DEFAULT 0,
  paye_deducted NUMERIC(14,2) NOT NULL DEFAULT 0,
  estimated_paye NUMERIC(14,2) NOT NULL DEFAULT 0,
  paye_difference NUMERIC(14,2) NOT NULL DEFAULT 0,
  uif NUMERIC(14,2) NOT NULL DEFAULT 0,
  other_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_salary NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_status TEXT NOT NULL DEFAULT 'aligned',
  payslip_path TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.salary_records TO authenticated;
GRANT ALL ON public.salary_records TO service_role;
ALTER TABLE public.salary_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own salary records" ON public.salary_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.income_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  deposit_date DATE NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  source_description TEXT,
  category TEXT NOT NULL DEFAULT 'untagged',
  linked_period DATE,
  notes TEXT,
  evidence_path TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.income_deposits TO authenticated;
GRANT ALL ON public.income_deposits TO service_role;
ALTER TABLE public.income_deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own deposits" ON public.income_deposits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.expense_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  expense_date DATE NOT NULL,
  vendor TEXT,
  amount NUMERIC(14,2) NOT NULL,
  vat_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  ai_suggested_category TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  ai_reason TEXT,
  description TEXT,
  receipt_path TEXT,
  is_capital_item BOOLEAN NOT NULL DEFAULT false,
  needs_review BOOLEAN NOT NULL DEFAULT false,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expense_records TO authenticated;
GRANT ALL ON public.expense_records TO service_role;
ALTER TABLE public.expense_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own expenses" ON public.expense_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.tax_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  related_record_id UUID,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  period_label TEXT,
  description TEXT NOT NULL,
  estimated_amount NUMERIC(14,2),
  actual_amount NUMERIC(14,2),
  difference NUMERIC(14,2),
  recommended_action TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tax_alerts TO authenticated;
GRANT ALL ON public.tax_alerts TO service_role;
ALTER TABLE public.tax_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alerts" ON public.tax_alerts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.tax_provisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  tax_year TEXT NOT NULL,
  obligation_type TEXT NOT NULL DEFAULT 'provisional_tax',
  amount NUMERIC(14,2) NOT NULL,
  set_aside_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tax_provisions TO authenticated;
GRANT ALL ON public.tax_provisions TO service_role;
ALTER TABLE public.tax_provisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own provisions" ON public.tax_provisions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.audit_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  narrative TEXT,
  totals JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_packs TO authenticated;
GRANT ALL ON public.audit_packs TO service_role;
ALTER TABLE public.audit_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own packs" ON public.audit_packs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.tax_rate_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_year TEXT NOT NULL UNIQUE,
  brackets JSONB NOT NULL,
  rebates JSONB NOT NULL,
  thresholds JSONB NOT NULL,
  turnover_tax_bands JSONB,
  vat_thresholds JSONB,
  interest_rates JSONB,
  source_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tax_rate_config TO authenticated, anon;
GRANT ALL ON public.tax_rate_config TO service_role;
ALTER TABLE public.tax_rate_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read tax config" ON public.tax_rate_config FOR SELECT TO authenticated, anon USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER t_profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_bp_upd BEFORE UPDATE ON public.business_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_sal_upd BEFORE UPDATE ON public.salary_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_dep_upd BEFORE UPDATE ON public.income_deposits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_exp_upd BEFORE UPDATE ON public.expense_records FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER t_alert_upd BEFORE UPDATE ON public.tax_alerts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.tax_rate_config (tax_year, brackets, rebates, thresholds, turnover_tax_bands, vat_thresholds, interest_rates, source_note) VALUES
('2025/26',
 '[{"min":0,"max":237100,"rate":0.18,"base":0},{"min":237101,"max":370500,"rate":0.26,"base":42678},{"min":370501,"max":512800,"rate":0.31,"base":77362},{"min":512801,"max":673000,"rate":0.36,"base":121475},{"min":673001,"max":857900,"rate":0.39,"base":179147},{"min":857901,"max":1817000,"rate":0.41,"base":251258},{"min":1817001,"max":null,"rate":0.45,"base":644489}]',
 '{"primary":17235,"secondary":9444,"tertiary":3145}',
 '{"under65":95750,"age65":148217,"age75":165689}',
 '[{"min":0,"max":95000,"rate":0,"base":0},{"min":95001,"max":365000,"rate":0.01,"base":0},{"min":365001,"max":550000,"rate":0.02,"base":2700},{"min":550001,"max":750000,"rate":0.03,"base":6400},{"min":750001,"max":1000000,"rate":0.03,"base":12400}]',
 '{"compulsory":1000000,"voluntary":50000}',
 '{"late_payment":0.1075,"provisional_overpayment_refund":0.0675}',
 'Reference figures. Verify against SARS before relying on them.'),
('2026/27',
 '[{"min":0,"max":245200,"rate":0.18,"base":0},{"min":245201,"max":383100,"rate":0.26,"base":44136},{"min":383101,"max":530200,"rate":0.31,"base":80990},{"min":530201,"max":695900,"rate":0.36,"base":126591},{"min":695901,"max":887000,"rate":0.39,"base":186243},{"min":887001,"max":1878800,"rate":0.41,"base":260772},{"min":1878801,"max":null,"rate":0.45,"base":667410}]',
 '{"primary":17821,"secondary":9765,"tertiary":3252}',
 '{"under65":99005,"age65":153254,"age75":171322}',
 '[{"min":0,"max":600000,"rate":0,"base":0},{"min":600001,"max":900000,"rate":0.01,"base":0},{"min":900001,"max":1500000,"rate":0.02,"base":3000},{"min":1500001,"max":2300000,"rate":0.03,"base":15000}]',
 '{"compulsory":2300000,"voluntary":120000}',
 '{"late_payment":0.1025,"provisional_overpayment_refund":0.0625,"successful_appeal_refund":0.1025}',
 'Estimated 2026/27 figures pending confirmation against the published SARS tables. Verify before relying on them.');