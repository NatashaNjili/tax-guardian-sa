import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { summariseLedger } from "@/lib/ai.functions";
import { useAuth } from "@/hooks/useAuth";
import {
  useBusinessProfile,
  useDeposits,
  useExpenses,
  useProfile,
  useRefresh,
  useTaxConfig,
} from "@/hooks/useTaxData";
import {
  DEPOSIT_CATEGORIES,
  EXPENSE_CATEGORIES,
  calculateTurnoverTax,
  categoryLabel,
  depositLabel,
  summarisePeriod,
} from "@/lib/tax-engine";
import { rands, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/ledger")({
  head: () => ({
    meta: [
      { title: "Business ledger — TaxGuard SA" },
      {
        name: "description",
        content:
          "Tag every deposit, keep your expenses in order and see a plain-language profit picture for your business.",
      },
      { property: "og:title", content: "Business ledger — TaxGuard SA" },
      {
        property: "og:description",
        content: "Not every rand that lands in your account is income. Tag it and see the real picture.",
      },
    ],
  }),
  component: LedgerPage,
});

function LedgerPage() {
  const { user } = useAuth();
  const uid = user?.id;
  const { data: deposits = [] } = useDeposits(uid);
  const { data: expenses = [] } = useExpenses(uid);
  const { data: profile } = useProfile(uid);
  const { data: business } = useBusinessProfile(uid);
  const { data: config } = useTaxConfig();
  const refresh = useRefresh();
  const summarise = useServerFn(summariseLedger);

  const [dep, setDep] = useState({
    deposit_date: new Date().toISOString().slice(0, 10),
    amount: "",
    source: "",
    category: "untagged",
    notes: "",
  });
  const [summary, setSummary] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState(false);

  const totals = useMemo(
    () =>
      summarisePeriod(
        deposits.map((d) => ({ amount: Number(d.amount), category: d.category })),
        expenses.map((e) => ({
          amount: Number(e.amount),
          category: e.category,
          is_capital_item: e.is_capital_item,
        })),
      ),
    [deposits, expenses],
  );

  const untagged = deposits.filter((d) => d.category === "untagged");
  const vat = config?.active?.vat_thresholds ?? null;
  const turnover = calculateTurnoverTax(config?.active?.turnover_tax_bands ?? null, totals.income);

  async function addDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) return;
    if (!dep.amount) return toast.error("Please enter the amount that came in.");
    setBusy(true);
    const { error } = await supabase.from("income_deposits").insert({
      user_id: uid,
      deposit_date: dep.deposit_date,
      amount: Number(dep.amount),
      source: dep.source || null,
      category: dep.category,
      notes: dep.notes || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setDep({ ...dep, amount: "", source: "", notes: "", category: "untagged" });
    refresh(["deposits"]);
    toast.success("Deposit recorded.");
  }

  async function retag(id: string, category: string) {
    const { error } = await supabase.from("income_deposits").update({ category }).eq("id", id);
    if (error) return toast.error(error.message);
    refresh(["deposits"]);
  }

  async function recategorise(id: string, category: string) {
    const { error } = await supabase
      .from("expense_records")
      .update({ category, needs_review: false })
      .eq("id", id);
    if (error) return toast.error(error.message);
    refresh(["expenses"]);
  }

  async function removeDeposit(id: string) {
    const { error } = await supabase.from("income_deposits").delete().eq("id", id);
    if (error) return toast.error(error.message);
    refresh(["deposits"]);
  }

  async function explain() {
    setThinking(true);
    try {
      const facts = [
        `Business income tagged as taxable: ${rands(totals.income, 0)}`,
        `Stock and cost of sales: ${rands(totals.costOfSales, 0)}`,
        `Running costs: ${rands(totals.operatingExpenses, 0)}`,
        `Equipment and vehicles (capital items, written off over years): ${rands(totals.capitalItems, 0)}`,
        `Estimated profit before tax: ${rands(totals.profit, 0)}`,
        `Receipts on file: ${totals.receiptCount}`,
        `Deposits still untagged: ${untagged.length}`,
      ].join("\n");
      const res = await summarise({
        data: { facts, language: profile?.preferred_language ?? "en" },
      });
      setSummary(res.summary);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not write a summary right now.");
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business ledger"
        description="Money in, money out — and what it actually means. Not every rand that lands in your account is income."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Taxable income tagged" value={rands(totals.income, 0)} tone="primary" />
        <StatCard label="Stock / cost of sales" value={rands(totals.costOfSales, 0)} />
        <StatCard label="Running costs" value={rands(totals.operatingExpenses, 0)} />
        <StatCard
          label="Estimated profit"
          value={rands(totals.profit, 0)}
          tone={totals.profit >= 0 ? "success" : "warning"}
          hint="Estimate from what you recorded"
        />
      </div>

      {totals.capitalItems > 0 ? (
        <p className="surface p-4 text-sm text-muted-foreground">
          {rands(totals.capitalItems, 0)} of equipment or vehicles is kept out of the profit figure
          above. A capital item is written off gradually over its useful life, not deducted all at
          once — a registered practitioner can confirm the write-off for your case.
        </p>
      ) : null}

      <div className="surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">What this means in plain words</h2>
          <Button size="sm" variant="outline" onClick={explain} disabled={thinking}>
            {thinking ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {thinking ? "Writing…" : "Explain my ledger"}
          </Button>
        </div>
        {summary ? (
          <p className="mt-3 whitespace-pre-wrap text-sm">{summary}</p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            We write a short summary using only the totals above — no figure is invented.
          </p>
        )}
      </div>

      <section className="surface p-5">
        <h2 className="font-display text-lg font-semibold">Record a deposit</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Log what came into your account and say what it was. Anything left untagged is flagged,
          because an untagged deposit can look like income.
        </p>
        <form onSubmit={addDeposit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ddate">Date</Label>
            <Input
              id="ddate"
              type="date"
              value={dep.deposit_date}
              onChange={(e) => setDep({ ...dep, deposit_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="damount">Amount (R)</Label>
            <Input
              id="damount"
              inputMode="decimal"
              value={dep.amount}
              onChange={(e) => setDep({ ...dep, amount: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dsource">Who paid you</Label>
            <Input
              id="dsource"
              value={dep.source}
              onChange={(e) => setDep({ ...dep, source: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dcat">What was it?</Label>
            <Select value={dep.category} onValueChange={(v) => setDep({ ...dep, category: v })}>
              <SelectTrigger id="dcat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEPOSIT_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                    {c.taxable ? " (counts as income)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="dnotes">Notes (optional)</Label>
            <Input
              id="dnotes"
              value={dep.notes}
              onChange={(e) => setDep({ ...dep, notes: e.target.value })}
              placeholder="e.g. part payment for the June order"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Add deposit"}
            </Button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">
          Deposits ({deposits.length})
          {untagged.length > 0 ? (
            <Badge variant="destructive" className="ml-2 align-middle">
              {untagged.length} untagged
            </Badge>
          ) : null}
        </h2>
        {deposits.length === 0 ? (
          <p className="surface p-5 text-sm text-muted-foreground">Nothing recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {deposits.map((d) => (
              <div key={d.id} className="surface flex flex-wrap items-center gap-3 p-4 text-sm">
                <div className="min-w-36">
                  <p className="font-medium">{d.source || "Unknown source"}</p>
                  <p className="text-xs text-muted-foreground">{shortDate(d.deposit_date)}</p>
                </div>
                <p className="num min-w-28 font-medium">{rands(d.amount)}</p>
                <Select value={d.category} onValueChange={(v) => retag(d.id, v)}>
                  <SelectTrigger className="w-56" aria-label={`Category for deposit of ${rands(d.amount)}`}>
                    <SelectValue>{depositLabel(d.category)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {DEPOSIT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {d.is_demo ? <Badge variant="outline">Demo</Badge> : null}
                <span className="flex-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeDeposit(d.id)}
                  aria-label="Delete deposit"
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">Expenses ({expenses.length})</h2>
        {expenses.length === 0 ? (
          <p className="surface p-5 text-sm text-muted-foreground">
            No expenses yet. Photograph a slip on the receipts page and it lands here.
          </p>
        ) : (
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="surface flex flex-wrap items-center gap-3 p-4 text-sm">
                <div className="min-w-36">
                  <p className="font-medium">{e.vendor || "Unnamed supplier"}</p>
                  <p className="text-xs text-muted-foreground">{shortDate(e.expense_date)}</p>
                </div>
                <p className="num min-w-28 font-medium">{rands(e.amount)}</p>
                <Select value={e.category} onValueChange={(v) => recategorise(e.id, v)}>
                  <SelectTrigger className="w-60" aria-label={`Category for ${e.vendor ?? "expense"}`}>
                    <SelectValue>{categoryLabel(e.category)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {e.receipt_path ? <Badge variant="secondary">Proof on file</Badge> : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="surface p-5 text-sm">
        <h2 className="font-display text-lg font-semibold">Turnover tax and VAT — a quick check</h2>
        {turnover ? (
          <p className="mt-2 text-muted-foreground">
            If your yearly turnover stays near {rands(totals.income, 0)}, the simplified turnover tax
            route would come to roughly {rands(turnover.tax, 0)} for the year. Turnover tax is worked
            out on sales rather than profit, so it suits businesses with few expenses. This is an
            estimate to help you ask the right question, not advice on which route to choose.
          </p>
        ) : (
          <p className="mt-2 text-muted-foreground">
            Turnover tax is a simplified route for very small businesses, worked out on sales rather
            than profit. Record more income before comparing the two routes.
          </p>
        )}
        {vat ? (
          <p className="mt-3 text-muted-foreground">
            VAT registration becomes compulsory once turnover passes {rands(vat.compulsory, 0)} in
            any 12 months, and you may register voluntarily above {rands(vat.voluntary, 0)}. Your
            tagged income so far is {rands(totals.income, 0)}
            {business?.is_vat_registered ? " and you are marked as VAT registered." : "."}
          </p>
        ) : null}
      </section>

      <Disclaimer />
    </div>
  );
}
