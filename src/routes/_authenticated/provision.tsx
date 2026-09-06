import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PiggyBank, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  useDeposits,
  useExpenses,
  useProvisions,
  useRefresh,
  useSalaryRecords,
  useTaxConfig,
} from "@/hooks/useTaxData";
import { calculateAnnualTax, summarisePeriod } from "@/lib/tax-engine";
import { rands, shortDate } from "@/lib/format";
import { FILING_SEASON, currentTaxYear, daysUntil } from "@/lib/tax-year";

export const Route = createFileRoute("/_authenticated/provision")({
  head: () => ({
    meta: [
      { title: "Money set aside — TaxGuard SA" },
      {
        name: "description",
        content:
          "Track the money you are holding back for tax, separately from tax actually paid to SARS.",
      },
      { property: "og:title", content: "Money set aside — TaxGuard SA" },
      {
        property: "og:description",
        content: "Money set aside is money you are holding — it is not tax paid until SARS receives it.",
      },
    ],
  }),
  component: ProvisionPage,
});

function ProvisionPage() {
  const { user } = useAuth();
  const uid = user?.id;
  const { data: provisions = [] } = useProvisions(uid);
  const { data: deposits = [] } = useDeposits(uid);
  const { data: expenses = [] } = useExpenses(uid);
  const { data: salary = [] } = useSalaryRecords(uid);
  const { data: config } = useTaxConfig();
  const refresh = useRefresh();

  const [form, setForm] = useState({
    set_aside_date: new Date().toISOString().slice(0, 10),
    amount: "",
    note: "",
  });
  const [busy, setBusy] = useState(false);

  const year = currentTaxYear();
  const setAside = provisions.reduce((t, p) => t + Number(p.amount), 0);

  const estimate = useMemo(() => {
    if (!config?.active) return null;
    const totals = summarisePeriod(
      deposits.map((d) => ({ amount: Number(d.amount), category: d.category })),
      expenses.map((e) => ({
        amount: Number(e.amount),
        category: e.category,
        is_capital_item: e.is_capital_item,
      })),
    );
    const salaryYear = salary.filter((s) => s.tax_year === year);
    const grossSalary = salaryYear.reduce((t, s) => t + Number(s.gross_salary), 0);
    const payeAlready = salaryYear.reduce((t, s) => t + Number(s.paye_deducted), 0);
    const taxable = Math.max(0, totals.profit) + grossSalary;
    const result = calculateAnnualTax(config.active, taxable, 30);
    const stillNeeded = Math.max(0, result.annualTax - payeAlready);
    return { taxable, result, payeAlready, stillNeeded, profit: totals.profit };
  }, [config, deposits, expenses, salary, year]);

  const suggested = estimate ? Math.max(0, estimate.stillNeeded - setAside) : 0;
  const p1 = daysUntil(FILING_SEASON.provisionalPeriod1);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    if (!form.amount) {
      toast.error("Please enter the amount you put aside.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("tax_provisions").insert({
      user_id: uid,
      tax_year: year,
      set_aside_date: form.set_aside_date,
      amount: Number(form.amount),
      notes: form.note || null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setForm({ ...form, amount: "", note: "" });
    refresh(["provisions"]);
    toast.success("Recorded. Remember: this money is still yours until SARS receives it.");
  }

  async function remove(id: string) {
    const { error } = await supabase.from("tax_provisions").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh(["provisions"]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Money set aside"
        description="A running record of what you are holding back for tax. This is not tax paid — it stays your money until SARS actually receives a payment."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Set aside so far"
          value={rands(setAside, 0)}
          tone="success"
          icon={<PiggyBank className="size-4 text-muted-foreground" aria-hidden />}
        />
        <StatCard
          label="Estimated tax for the year"
          value={estimate ? rands(estimate.result.annualTax, 0) : "—"}
          tone="primary"
          hint="Estimate from what you have recorded"
        />
        <StatCard
          label="Already deducted as PAYE"
          value={estimate ? rands(estimate.payeAlready, 0) : "—"}
        />
        <StatCard
          label="Gap still to cover"
          value={rands(suggested, 0)}
          tone={suggested > 0 ? "warning" : "success"}
          hint={suggested > 0 ? "Consider putting this aside" : "Your set-aside covers the estimate"}
        />
      </div>

      <div className="surface p-5 text-sm">
        <h2 className="font-display text-base font-semibold">How this is worked out</h2>
        <p className="mt-2 text-muted-foreground">
          {estimate
            ? `We add your recorded business profit (${rands(estimate.profit, 0)}) to your recorded salary, work out the estimated tax on that total, and subtract the PAYE already deducted. Nothing here has been sent to SARS.`
            : "Record some income first and we will estimate what to hold back."}
        </p>
        <p className="mt-2 text-muted-foreground">
          Provisional taxpayers estimate and pay twice a year: the first payment is due 31 August
          2026{p1 > 0 ? ` — ${p1} days from today` : ""} and the second on 28 February 2027. Paying
          too little at those dates can bring interest and penalties, so it is worth setting money
          aside as you earn.
        </p>
      </div>

      <form onSubmit={add} className="surface grid gap-4 p-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="pdate">Date</Label>
          <Input
            id="pdate"
            type="date"
            value={form.set_aside_date}
            onChange={(e) => setForm({ ...form, set_aside_date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pamount">Amount put aside (R)</Label>
          <Input
            id="pamount"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pnote">Note (optional)</Label>
          <Input
            id="pnote"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="e.g. moved to savings account"
          />
        </div>
        <div className="sm:col-span-3">
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : "Record money set aside"}
          </Button>
        </div>
      </form>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">History</h2>
        {provisions.length === 0 ? (
          <p className="surface p-5 text-sm text-muted-foreground">
            Nothing set aside yet. Even a small amount each month makes the deadline easier.
          </p>
        ) : (
          <div className="space-y-2">
            {provisions.map((p) => (
              <div key={p.id} className="surface flex flex-wrap items-center gap-3 p-4 text-sm">
                <span className="min-w-32">{shortDate(p.set_aside_date)}</span>
                <span className="num min-w-28 font-medium">{rands(p.amount)}</span>
                <Badge variant="outline">Held, not paid to SARS</Badge>
                <span className="text-muted-foreground">{p.notes}</span>
                <span className="flex-1" />
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)} aria-label="Delete entry">
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Disclaimer />
    </div>
  );
}
