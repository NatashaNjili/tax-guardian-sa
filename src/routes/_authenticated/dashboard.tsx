import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowRight,
  BellRing,
  Camera,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { PageHeader } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  useAlerts,
  useDeposits,
  useExpenses,
  useProfile,
  useProvisions,
  useSalaryRecords,
  useTaxConfig,
} from "@/hooks/useTaxData";
import { rands, randsShort, monthLabel } from "@/lib/format";
import { currentTaxYear, FILING_SEASON, daysUntil } from "@/lib/tax-year";
import { summarisePeriod } from "@/lib/tax-engine";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — TaxGuard SA" },
      {
        name: "description",
        content: "Your income, PAYE, estimates, differences and open tax alerts in one view.",
      },
      { property: "og:title", content: "Dashboard — TaxGuard SA" },
      { property: "og:description", content: "Income, PAYE, estimates and alerts in one view." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const uid = user?.id;
  const { data: profile } = useProfile(uid);
  const { data: salary = [] } = useSalaryRecords(uid);
  const { data: deposits = [] } = useDeposits(uid);
  const { data: expenses = [] } = useExpenses(uid);
  const { data: alerts = [] } = useAlerts(uid);
  const { data: provisions = [] } = useProvisions(uid);
  const { data: config } = useTaxConfig();

  const year = currentTaxYear();
  const showsBusiness = profile?.user_type !== "employee";
  const showsEmployee = profile?.user_type !== "business";

  const totals = useMemo(() => {
    const yearSalary = salary.filter((s) => s.tax_year === year);
    const gross = yearSalary.reduce((t, s) => t + Number(s.gross_salary), 0);
    const paye = yearSalary.reduce((t, s) => t + Number(s.paye_deducted), 0);
    const estPaye = yearSalary.reduce((t, s) => t + Number(s.estimated_paye), 0);
    const net = yearSalary.reduce((t, s) => t + Number(s.net_salary), 0);
    const business = summarisePeriod(
      deposits.map((d) => ({ amount: Number(d.amount), category: d.category })),
      expenses.map((e) => ({
        amount: Number(e.amount),
        category: e.category,
        is_capital_item: e.is_capital_item,
      })),
    );
    const setAside = provisions.reduce((t, p) => t + Number(p.amount), 0);
    return {
      gross,
      paye,
      estPaye,
      net,
      diff: estPaye - paye,
      months: yearSalary.length,
      business,
      setAside,
    };
  }, [salary, deposits, expenses, provisions, year]);

  const openAlerts = alerts.filter((a) => a.status !== "resolved");
  const untagged = deposits.filter((d) => d.category === "untagged").length;

  const chartData = useMemo(
    () =>
      [...salary]
        .filter((s) => s.tax_year === year)
        .sort((a, b) => a.period_month.localeCompare(b.period_month))
        .map((s) => ({
          month: monthLabel(s.period_month).slice(0, 3),
          Gross: Number(s.gross_salary),
          Net: Number(s.net_salary),
          "PAYE deducted": Number(s.paye_deducted),
          "PAYE estimated": Number(s.estimated_paye),
        })),
    [salary, year],
  );

  const businessChart = useMemo(() => {
    const map = new Map<string, { month: string; Income: number; Expenses: number }>();
    for (const d of deposits) {
      const k = d.deposit_date.slice(0, 7);
      const row = map.get(k) ?? { month: k, Income: 0, Expenses: 0 };
      row.Income += Number(d.amount);
      map.set(k, row);
    }
    for (const e of expenses) {
      const k = e.expense_date.slice(0, 7);
      const row = map.get(k) ?? { month: k, Income: 0, Expenses: 0 };
      row.Expenses += Number(e.amount);
      map.set(k, row);
    }
    return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
  }, [deposits, expenses]);

  const days = daysUntil(FILING_SEASON.nonProvisionalDeadline);
  const empty = salary.length === 0 && deposits.length === 0 && expenses.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}`}
        description={`Tax year ${year}. Everything below is an estimate built from what you have recorded.`}
        action={
          <Button asChild>
            <Link to="/receipts">
              <Camera className="size-4" aria-hidden /> Snap a receipt
            </Link>
          </Button>
        }
      />

      {config?.stale ? (
        <div className="surface border-warning p-4 text-sm">
          Our tax tables cover {config.years.join(", ")}. Today falls in tax year {year} — please
          check the current SARS figures before relying on any estimate here.
        </div>
      ) : null}

      {empty ? (
        <div className="surface p-6">
          <h2 className="font-display text-lg font-semibold">Let's start with one thing</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Nothing is recorded yet. Add one payslip or photograph one receipt — that is enough to
            begin the record. You can add the rest whenever you have time.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link to="/salary">Add a payslip</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/receipts">Snap a receipt</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link to="/settings">Load demo data</Link>
            </Button>
          </div>
        </div>
      ) : null}

      {showsEmployee ? (
        <section aria-labelledby="salary-story" className="space-y-3">
          <h2 id="salary-story" className="font-display text-lg font-semibold">
            Salary: income → deducted → expected → difference
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              label="Gross salary this year"
              value={randsShort(totals.gross)}
              hint={`${totals.months} month${totals.months === 1 ? "" : "s"} recorded`}
              icon={<Wallet className="size-4 text-muted-foreground" aria-hidden />}
            />
            <StatCard label="PAYE deducted" value={randsShort(totals.paye)} />
            <StatCard label="Estimated PAYE" value={randsShort(totals.estPaye)} tone="primary" />
            <StatCard
              label="Possible difference"
              value={randsShort(Math.abs(totals.diff))}
              tone={totals.diff > 100 ? "warning" : totals.diff < -100 ? "info" : "success"}
              hint={
                totals.diff > 100
                  ? "Less was deducted than we estimate"
                  : totals.diff < -100
                    ? "More was deducted than we estimate"
                    : "Close to our estimate"
              }
              icon={
                totals.diff > 100 ? (
                  <TrendingDown className="size-4 text-warning" aria-hidden />
                ) : (
                  <TrendingUp className="size-4 text-success" aria-hidden />
                )
              }
            />
            <StatCard label="Net received" value={randsShort(totals.net)} tone="success" />
          </div>
        </section>
      ) : null}

      {showsBusiness ? (
        <section aria-labelledby="business-story" className="space-y-3">
          <h2 id="business-story" className="font-display text-lg font-semibold">
            Business: what came in, what it really cost
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Business income logged"
              value={randsShort(totals.business.income)}
              hint={untagged > 0 ? `${untagged} deposit(s) still untagged` : "All deposits tagged"}
              tone={untagged > 0 ? "warning" : "neutral"}
            />
            <StatCard
              label="Stock & running costs"
              value={randsShort(totals.business.costOfSales + totals.business.operatingExpenses)}
              hint={`${totals.business.receiptCount} receipt(s) attached`}
            />
            <StatCard
              label="Estimated taxable profit"
              value={randsShort(totals.business.profit)}
              tone="primary"
            />
            <StatCard
              label="Money set aside"
              value={randsShort(totals.setAside)}
              tone="success"
              hint="Not tax paid — money you are holding"
              icon={<PiggyBank className="size-4 text-muted-foreground" aria-hidden />}
            />
          </div>
        </section>
      ) : null}

      <section className="surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            Tax alerts{" "}
            {openAlerts.length > 0 ? (
              <Badge variant="destructive" className="ml-1 align-middle">
                {openAlerts.length}
              </Badge>
            ) : null}
          </h2>
          <Button asChild size="sm" variant="ghost">
            <Link to="/alerts">
              See all <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
        {openAlerts.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Nothing needs your attention right now.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {openAlerts.slice(0, 3).map((a) => (
              <li key={a.id} className="flex items-start gap-3 rounded-lg bg-muted/60 p-3 text-sm">
                <BellRing
                  className={
                    a.severity === "urgent" ? "mt-0.5 size-4 text-destructive" : "mt-0.5 size-4 text-warning"
                  }
                  aria-hidden
                />
                <div>
                  <p className="font-medium">
                    {a.period_label ? `${a.period_label}: ` : ""}
                    {a.description}
                  </p>
                  {a.recommended_action ? (
                    <p className="text-muted-foreground">{a.recommended_action}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {chartData.length > 1 ? (
        <section className="grid gap-4 lg:grid-cols-2">
          <div className="surface p-5">
            <h3 className="mb-3 text-sm font-medium">Gross vs net pay</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis fontSize={12} stroke="var(--color-muted-foreground)" width={60} />
                <Tooltip formatter={(v: number) => rands(v, 0)} />
                <Legend />
                <Bar dataKey="Gross" fill="var(--color-chart-1)" radius={4} />
                <Bar dataKey="Net" fill="var(--color-chart-3)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="surface p-5">
            <h3 className="mb-3 text-sm font-medium">PAYE: estimated vs deducted</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis fontSize={12} stroke="var(--color-muted-foreground)" width={60} />
                <Tooltip formatter={(v: number) => rands(v, 0)} />
                <Legend />
                <Line dataKey="PAYE estimated" stroke="var(--color-chart-1)" strokeWidth={2} />
                <Line dataKey="PAYE deducted" stroke="var(--color-chart-2)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      ) : null}

      {showsBusiness && businessChart.length > 1 ? (
        <section className="surface p-5">
          <h3 className="mb-3 text-sm font-medium">Income vs expenses over time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={businessChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" fontSize={12} stroke="var(--color-muted-foreground)" />
              <YAxis fontSize={12} stroke="var(--color-muted-foreground)" width={60} />
              <Tooltip formatter={(v: number) => rands(v, 0)} />
              <Legend />
              <Bar dataKey="Income" fill="var(--color-chart-3)" radius={4} />
              <Bar dataKey="Expenses" fill="var(--color-chart-2)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      ) : null}

      <section className="surface p-5 text-sm">
        <h3 className="font-display text-base font-semibold">Your filing deadline</h3>
        <p className="mt-2 text-muted-foreground">
          Individuals who are not provisional taxpayers file by 23 October 2026
          {days > 0 ? ` — ${days} days from today` : ""}. Provisional taxpayers (people who earn
          business or freelance income and estimate their tax twice a year) file by 22 January 2027.
          Filing late brings a fixed monthly administrative penalty that keeps growing while the
          return is outstanding, so it is worth doing early.
        </p>
      </section>

      <Disclaimer />
    </div>
  );
}
