import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/StatCard";
import { Disclaimer } from "@/components/Disclaimer";
import { useTaxConfig } from "@/hooks/useTaxData";
import { calculateAnnualTax } from "@/lib/tax-engine";
import { rands, percent } from "@/lib/format";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "South African tax calculator — TaxGuard SA" },
      {
        name: "description",
        content:
          "Estimate your annual tax, monthly PAYE and take-home pay using current South African brackets and rebates. No sign-up needed.",
      },
      { property: "og:title", content: "South African tax calculator — TaxGuard SA" },
      {
        property: "og:description",
        content: "Estimate annual tax, monthly PAYE and take-home pay. Free, no sign-up.",
      },
    ],
  }),
  component: CalculatorPage,
});

function CalculatorPage() {
  const { data } = useTaxConfig();
  const [basis, setBasis] = useState<"monthly" | "annual">("monthly");
  const [amount, setAmount] = useState("25000");
  const [bonus, setBonus] = useState("0");
  const [other, setOther] = useState("0");
  const [age, setAge] = useState("30");

  const config = data?.active ?? null;

  const result = useMemo(() => {
    if (!config) return null;
    const base = Number(amount) || 0;
    const annualBase = basis === "monthly" ? base * 12 : base;
    const annual = annualBase + (Number(bonus) || 0) + (Number(other) || 0);
    return { annual, calc: calculateAnnualTax(config, annual, Number(age) || 30) };
  }, [config, amount, basis, bonus, other, age]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link to="/">
          <ArrowLeft className="size-4" aria-hidden /> Back
        </Link>
      </Button>
      <h1 className="font-display text-3xl font-semibold">Tax calculator</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        South Africa uses progressive tax brackets — think of a staircase. You only pay the higher
        rate on the portion of income that lands on that higher step, not on everything you earn.
        Nothing here is saved.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="surface space-y-4 p-5">
          <div className="space-y-2">
            <Label htmlFor="basis">Is that amount monthly or yearly?</Label>
            <Select value={basis} onValueChange={(v) => setBasis(v as "monthly" | "annual")}>
              <SelectTrigger id="basis">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="annual">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Salary or business profit (R)</Label>
            <Input
              id="amount"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bonus">Yearly bonus (R)</Label>
            <Input
              id="bonus"
              inputMode="decimal"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="other">Other yearly income (R)</Label>
            <Input
              id="other"
              inputMode="decimal"
              value={other}
              onChange={(e) => setOther(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Your age</Label>
            <Input id="age" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              Age matters because of rebates (a fixed amount subtracted from your tax) that increase
              at 65 and again at 75.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {!config ? (
            <div className="surface p-5 text-sm text-muted-foreground">
              Loading the tax tables…
            </div>
          ) : result ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Taxable income (year)" value={rands(result.annual, 0)} />
                <StatCard
                  label="Estimated tax (year)"
                  value={rands(result.calc.annualTax, 0)}
                  tone="primary"
                />
                <StatCard
                  label="Estimated monthly PAYE"
                  value={rands(result.calc.monthlyTax, 0)}
                  tone="primary"
                />
                <StatCard
                  label="Estimated take-home (month)"
                  value={rands(result.annual / 12 - result.calc.monthlyTax, 0)}
                  tone="success"
                />
              </div>
              <div className="surface space-y-2 p-5 text-sm">
                <p className="font-medium">How we got there ({config.tax_year} tables)</p>
                <p className="text-muted-foreground">
                  Tax before rebates: {rands(result.calc.taxBeforeRebates, 0)} · Rebates:{" "}
                  −{rands(result.calc.rebate, 0)} · Tax for the year:{" "}
                  {rands(result.calc.annualTax, 0)}.
                </p>
                <p className="text-muted-foreground">
                  Your top step (marginal rate) is {percent(result.calc.marginalRate, 0)}, but you
                  only pay that on the income sitting on that step. Overall you pay about{" "}
                  {percent(result.calc.effectiveRate)} of your income in tax.
                </p>
                {result.calc.belowThreshold ? (
                  <p className="text-success">
                    This is below the tax threshold of {rands(result.calc.threshold, 0)} for your
                    age, so no income tax is estimated.
                  </p>
                ) : null}
              </div>
              {data?.stale ? (
                <div className="surface border-warning p-4 text-sm text-muted-foreground">
                  These tables were written for {config.tax_year}. We are now in a different tax
                  year — check the current SARS figures before relying on this.
                </div>
              ) : null}
            </>
          ) : null}
          <Disclaimer compact />
        </div>
      </div>
    </div>
  );
}
