import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBusinessProfile, useProfile, useRefresh, useTaxConfig } from "@/hooks/useTaxData";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { currentTaxYear, taxYearFor } from "@/lib/tax-year";
import { estimateMonthlyPaye, payeStatus } from "@/lib/tax-engine";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TaxGuard SA" },
      {
        name: "description",
        content: "Your details, your language, your business profile, and what TaxGuard stores about you.",
      },
      { property: "og:title", content: "Settings — TaxGuard SA" },
      { property: "og:description", content: "Your details, language and privacy choices." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const uid = user?.id;
  const { data: profile } = useProfile(uid);
  const { data: business } = useBusinessProfile(uid);
  const { data: config } = useTaxConfig();
  const refresh = useRefresh();

  const [p, setP] = useState({ full_name: "", preferred_language: "en", user_type: "employee", age: "30" });
  const [b, setB] = useState({
    business_name: "",
    business_type: "sole_proprietor",
    is_vat_registered: false,
    is_provisional_taxpayer: false,
    annual_turnover_estimate: "",
  });
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);

  useEffect(() => {
    if (profile)
      setP({
        full_name: profile.full_name ?? "",
        preferred_language: profile.preferred_language ?? "en",
        user_type: profile.user_type ?? "employee",
        age: String(profile.age ?? 30),
      });
  }, [profile]);

  useEffect(() => {
    if (business)
      setB({
        business_name: business.business_name ?? "",
        business_type: business.business_type ?? "sole_proprietor",
        is_vat_registered: !!business.is_vat_registered,
        is_provisional_taxpayer: !!business.is_provisional_taxpayer,
        annual_turnover_estimate: business.annual_turnover_estimate
          ? String(business.annual_turnover_estimate)
          : "",
      });
  }, [business]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: p.full_name || null,
        preferred_language: p.preferred_language,
        user_type: p.user_type,
        age: Number(p.age) || 30,
      })
      .eq("id", uid);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh(["profile"]);
    toast.success("Saved.");
  }

  async function saveBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    setBusy(true);
    const payload = {
      user_id: uid,
      business_name: b.business_name || null,
      business_type: b.business_type,
      is_vat_registered: b.is_vat_registered,
      is_provisional_taxpayer: b.is_provisional_taxpayer,
      annual_turnover_estimate: b.annual_turnover_estimate
        ? Number(b.annual_turnover_estimate)
        : null,
    };
    const { error } = business
      ? await supabase.from("business_profiles").update(payload).eq("user_id", uid)
      : await supabase.from("business_profiles").insert(payload);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh(["business-profile"]);
    toast.success("Business details saved.");
  }

  async function loadDemo() {
    if (!uid || !config?.active) return;
    setDemoBusy(true);
    try {
      const now = new Date();
      const months = [3, 2, 1, 0].map((back) => {
        const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
        return d.toISOString().slice(0, 10);
      });
      const salaryRows = months.map((month, i) => {
        const gross = 21500 + i * 500;
        const est = estimateMonthlyPaye(config.active!, gross, 30).estimatedPaye;
        const actual = i === 2 ? 0 : Math.round(est * (i === 1 ? 0.7 : 1) * 100) / 100;
        return {
          user_id: uid,
          period_month: month,
          tax_year: taxYearFor(month),
          basic_salary: gross,
          bonus: 0,
          overtime: 0,
          other_taxable_income: 0,
          gross_salary: gross,
          paye_deducted: actual,
          estimated_paye: Math.round(est * 100) / 100,
          paye_difference: Math.round((est - actual) * 100) / 100,
          uif: 177.12,
          other_deductions: 0,
          net_salary: gross - actual - 177.12,
          tax_status: payeStatus(est, actual),
          is_demo: true,
        };
      });
      const deposits = [
        { d: months[3], a: 8400, s: "Thandi's Spaza order", c: "business_sale" },
        { d: months[2], a: 12750, s: "Market weekend takings", c: "business_sale" },
        { d: months[1], a: 5000, s: "Loan from cousin", c: "loan" },
        { d: months[0], a: 3200, s: "Unknown EFT", c: "untagged" },
      ].map((r) => ({
        user_id: uid,
        deposit_date: r.d,
        amount: r.a,
        source: r.s,
        category: r.c,
        is_demo: true,
      }));
      const expenses = [
        { d: months[3], v: "Makro", a: 4300, c: "cost_of_sales", cap: false },
        { d: months[2], v: "Engen garage", a: 950, c: "transport", cap: false },
        { d: months[2], v: "Vodacom", a: 349, c: "telephone_data", cap: false },
        { d: months[1], v: "Game", a: 6200, c: "capital_asset", cap: true },
        { d: months[0], v: "Landlord", a: 2500, c: "rent", cap: false },
      ].map((r) => ({
        user_id: uid,
        expense_date: r.d,
        vendor: r.v,
        amount: r.a,
        vat_amount: Math.round((r.a - r.a / 1.15) * 100) / 100,
        category: r.c,
        ai_suggested_category: r.c,
        ai_reason: "Demo record",
        is_capital_item: r.cap,
        needs_review: false,
        is_demo: true,
      }));

      const results = await Promise.all([
        supabase.from("salary_records").insert(salaryRows),
        supabase.from("income_deposits").insert(deposits),
        supabase.from("expense_records").insert(expenses),
        supabase.from("tax_provisions").insert({
          user_id: uid,
          tax_year: currentTaxYear(),
          set_aside_date: months[1],
          amount: 2500,
          note: "Demo: moved to savings",
          is_demo: true,
        }),
      ]);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
      refresh(["salary", "deposits", "expenses", "provisions", "alerts"]);
      toast.success("Demo records added. They are labelled Demo everywhere.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load the demo records.");
    } finally {
      setDemoBusy(false);
    }
  }

  async function clearDemo() {
    if (!uid) return;
    setDemoBusy(true);
    await Promise.all([
      supabase.from("salary_records").delete().eq("user_id", uid).eq("is_demo", true),
      supabase.from("income_deposits").delete().eq("user_id", uid).eq("is_demo", true),
      supabase.from("expense_records").delete().eq("user_id", uid).eq("is_demo", true),
      supabase.from("tax_provisions").delete().eq("user_id", uid).eq("is_demo", true),
    ]);
    setDemoBusy(false);
    refresh(["salary", "deposits", "expenses", "provisions", "alerts"]);
    toast.success("Demo records removed.");
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Your details, your language and what we keep." />

      <form onSubmit={saveProfile} className="surface grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-display text-lg font-semibold sm:col-span-2">About you</h2>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={p.full_name} onChange={(e) => setP({ ...p, full_name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input id="age" inputMode="numeric" value={p.age} onChange={(e) => setP({ ...p, age: e.target.value })} />
          <p className="text-xs text-muted-foreground">Age changes the rebates you qualify for.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Preferred language</Label>
          <Select value={p.preferred_language} onValueChange={(v) => setP({ ...p, preferred_language: v })}>
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="utype">What describes you best?</Label>
          <Select value={p.user_type} onValueChange={(v) => setP({ ...p, user_type: v })}>
            <SelectTrigger id="utype">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">I earn a salary</SelectItem>
              <SelectItem value="business">I run a small business</SelectItem>
              <SelectItem value="both">Both — salary and a side business</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>
            Save my details
          </Button>
        </div>
      </form>

      <form onSubmit={saveBusiness} className="surface grid gap-4 p-5 sm:grid-cols-2">
        <h2 className="font-display text-lg font-semibold sm:col-span-2">Your business</h2>
        <div className="space-y-2">
          <Label htmlFor="bname">Business name</Label>
          <Input id="bname" value={b.business_name} onChange={(e) => setB({ ...b, business_name: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="btype">Type</Label>
          <Select value={b.business_type} onValueChange={(v) => setB({ ...b, business_type: v })}>
            <SelectTrigger id="btype">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sole_proprietor">Sole proprietor (just me)</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="company">Registered company</SelectItem>
              <SelectItem value="informal">Informal trading</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="turnover">Rough yearly turnover (R)</Label>
          <Input
            id="turnover"
            inputMode="decimal"
            value={b.annual_turnover_estimate}
            onChange={(e) => setB({ ...b, annual_turnover_estimate: e.target.value })}
          />
        </div>
        <div className="flex flex-col justify-end gap-3">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={b.is_vat_registered}
              onCheckedChange={(v) => setB({ ...b, is_vat_registered: !!v })}
            />
            I am registered for VAT
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={b.is_provisional_taxpayer}
              onCheckedChange={(v) => setB({ ...b, is_provisional_taxpayer: !!v })}
            />
            I am a provisional taxpayer (I estimate my tax twice a year)
          </label>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>
            Save business details
          </Button>
        </div>
      </form>

      <section className="surface p-5">
        <h2 className="font-display text-lg font-semibold">Try it with example records</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Adds a few made-up payslips, deposits and receipts so you can see how everything works.
          Each one is labelled Demo and you can remove them all at once.
        </p>
        <div className="mt-3 flex gap-2">
          <Button onClick={loadDemo} disabled={demoBusy} variant="outline">
            {demoBusy ? "Working…" : "Load demo records"}
          </Button>
          <Button onClick={clearDemo} disabled={demoBusy} variant="ghost">
            Remove demo records
          </Button>
        </div>
      </section>

      <section className="surface p-5 text-sm">
        <h2 className="font-display text-lg font-semibold">What we keep, and what we never ask for</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Only you can see your records — they are locked to your account.</li>
          <li>Receipt and payslip photos are stored privately in your own folder.</li>
          <li>
            We never ask for your ID number, bank account number or eFiling password, and you should
            never type them here.
          </li>
          <li>
            Tax figures come from our tax tables for {config?.years.join(", ") ?? "the current year"}
            , not from a guess.
          </li>
        </ul>
        <p className="mt-3">Signed in as {user?.email}.</p>
      </section>

      <Disclaimer />
    </div>
  );
}
