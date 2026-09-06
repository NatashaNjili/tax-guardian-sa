import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Download, Printer } from "lucide-react";
import { PageHeader } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  useDeposits,
  useExpenses,
  useProfile,
  useProvisions,
  useSalaryRecords,
  useTaxConfig,
} from "@/hooks/useTaxData";
import {
  calculateAnnualTax,
  categoryLabel,
  depositLabel,
  summarisePeriod,
} from "@/lib/tax-engine";
import { rands, shortDate } from "@/lib/format";
import { currentTaxYear } from "@/lib/tax-year";

export const Route = createFileRoute("/_authenticated/summary")({
  head: () => ({
    meta: [
      { title: "Annual summary & evidence pack — TaxGuard SA" },
      {
        name: "description",
        content:
          "One page you can print or download: income, expenses, estimates and the proof behind every figure.",
      },
      { property: "og:title", content: "Annual summary & evidence pack — TaxGuard SA" },
      {
        property: "og:description",
        content: "Print or download an organised record of your year, with proof attached.",
      },
    ],
  }),
  component: SummaryPage,
});

function SummaryPage() {
  const { user } = useAuth();
  const uid = user?.id;
  const { data: profile } = useProfile(uid);
  const { data: salary = [] } = useSalaryRecords(uid);
  const { data: deposits = [] } = useDeposits(uid);
  const { data: expenses = [] } = useExpenses(uid);
  const { data: provisions = [] } = useProvisions(uid);
  const { data: config } = useTaxConfig();

  const year = currentTaxYear();

  const data = useMemo(() => {
    const yearSalary = salary.filter((s) => s.tax_year === year);
    const gross = yearSalary.reduce((t, s) => t + Number(s.gross_salary), 0);
    const paye = yearSalary.reduce((t, s) => t + Number(s.paye_deducted), 0);
    const totals = summarisePeriod(
      deposits.map((d) => ({ amount: Number(d.amount), category: d.category })),
      expenses.map((e) => ({
        amount: Number(e.amount),
        category: e.category,
        is_capital_item: e.is_capital_item,
      })),
    );
    const taxable = gross + Math.max(0, totals.profit);
    const estimate = config?.active ? calculateAnnualTax(config.active, taxable, 30) : null;
    const withProof = expenses.filter((e) => e.receipt_path).length;
    const untagged = deposits.filter((d) => d.category === "untagged").length;
    const setAside = provisions.reduce((t, p) => t + Number(p.amount), 0);
    return { gross, paye, totals, taxable, estimate, withProof, untagged, setAside };
  }, [salary, deposits, expenses, provisions, config, year]);

  function exportCsv() {
    const rows: string[][] = [
      ["Type", "Date", "Description", "Category", "Amount", "Proof on file"],
      ...salary.map((s) => [
        "Salary",
        s.period_month,
        "Payslip",
        s.tax_status,
        String(s.gross_salary),
        s.payslip_path ? "yes" : "no",
      ]),
      ...deposits.map((d) => [
        "Deposit",
        d.deposit_date,
        d.source_description ?? "",
        depositLabel(d.category),
        String(d.amount),
        "n/a",
      ]),
      ...expenses.map((e) => [
        "Expense",
        e.expense_date,
        e.vendor ?? "",
        categoryLabel(e.category),
        String(e.amount),
        e.receipt_path ? "yes" : "no",
      ]),
      ...provisions.map((p) => [
        "Money set aside (not paid)",
        p.set_aside_date,
        p.notes ?? "",
        "Set aside",
        String(p.amount),
        "n/a",
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `taxguard-records-${year.replace("/", "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Annual summary"
        description={`Tax year ${year}. One organised page for ${profile?.full_name ?? "you"} — print it, download it, or show it to a practitioner.`}
        action={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="size-4" aria-hidden /> Print
            </Button>
            <Button onClick={exportCsv}>
              <Download className="size-4" aria-hidden /> Download records
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Salary income" value={rands(data.gross, 0)} />
        <StatCard label="PAYE deducted" value={rands(data.paye, 0)} />
        <StatCard label="Business profit (estimate)" value={rands(data.totals.profit, 0)} tone="primary" />
        <StatCard
          label="Estimated tax for the year"
          value={data.estimate ? rands(data.estimate.annualTax, 0) : "—"}
          tone="warning"
          hint="Estimate only — SARS decides the final figure"
        />
      </div>

      <section className="surface p-5 text-sm">
        <h2 className="font-display text-lg font-semibold">Evidence you can show</h2>
        <ul className="mt-3 space-y-2 text-muted-foreground">
          <li>
            {data.withProof} of {expenses.length} expenses have the original slip attached.
          </li>
          <li>
            {salary.filter((s) => s.payslip_path).length} of {salary.length} payslips have a document
            attached.
          </li>
          <li>
            {data.untagged === 0
              ? "Every deposit has been explained."
              : `${data.untagged} deposit(s) are still untagged — an untagged deposit can be read as income.`}
          </li>
          <li>
            {rands(data.setAside, 0)} is recorded as money set aside. This is money you are holding,
            not tax paid to SARS.
          </li>
        </ul>
        <p className="mt-3">
          If SARS ever asks you to support a figure, this page plus the attached slips is what you
          send. TaxGuard does not answer SARS for you and does not lodge disputes — a registered tax
          practitioner does that.
        </p>
      </section>

      <section className="surface overflow-x-auto p-5">
        <h2 className="mb-3 font-display text-lg font-semibold">Every record</h2>
        <table className="w-full text-left text-sm">
          <caption className="sr-only">All salary, deposit, expense and set-aside records</caption>
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th scope="col" className="py-2 pr-4 font-medium">Type</th>
              <th scope="col" className="py-2 pr-4 font-medium">Date</th>
              <th scope="col" className="py-2 pr-4 font-medium">Description</th>
              <th scope="col" className="py-2 pr-4 font-medium">Category</th>
              <th scope="col" className="py-2 pr-4 font-medium">Amount</th>
              <th scope="col" className="py-2 font-medium">Proof</th>
            </tr>
          </thead>
          <tbody>
            {salary.map((s) => (
              <tr key={s.id} className="border-b border-border/60">
                <td className="py-2 pr-4">Salary</td>
                <td className="py-2 pr-4">{shortDate(s.period_month)}</td>
                <td className="py-2 pr-4">Payslip</td>
                <td className="py-2 pr-4">Employment income</td>
                <td className="num py-2 pr-4">{rands(s.gross_salary, 0)}</td>
                <td className="py-2">{s.payslip_path ? "Attached" : "—"}</td>
              </tr>
            ))}
            {deposits.map((d) => (
              <tr key={d.id} className="border-b border-border/60">
                <td className="py-2 pr-4">Deposit</td>
                <td className="py-2 pr-4">{shortDate(d.deposit_date)}</td>
                <td className="py-2 pr-4">{d.source_description ?? "—"}</td>
                <td className="py-2 pr-4">{depositLabel(d.category)}</td>
                <td className="num py-2 pr-4">{rands(d.amount, 0)}</td>
                <td className="py-2">—</td>
              </tr>
            ))}
            {expenses.map((e) => (
              <tr key={e.id} className="border-b border-border/60">
                <td className="py-2 pr-4">Expense</td>
                <td className="py-2 pr-4">{shortDate(e.expense_date)}</td>
                <td className="py-2 pr-4">{e.vendor ?? "—"}</td>
                <td className="py-2 pr-4">{categoryLabel(e.category)}</td>
                <td className="num py-2 pr-4">{rands(e.amount, 0)}</td>
                <td className="py-2">{e.receipt_path ? "Photo attached" : "—"}</td>
              </tr>
            ))}
            {provisions.map((p) => (
              <tr key={p.id} className="border-b border-border/60">
                <td className="py-2 pr-4">Set aside</td>
                <td className="py-2 pr-4">{shortDate(p.set_aside_date)}</td>
                <td className="py-2 pr-4">{p.notes ?? "—"}</td>
                <td className="py-2 pr-4">Held, not paid</td>
                <td className="num py-2 pr-4">{rands(p.amount, 0)}</td>
                <td className="py-2">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Disclaimer />
    </div>
  );
}
