import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, ShieldCheck, Wallet, FileSearch, Languages, Calculator } from "lucide-react";
import heroImage from "@/assets/hero-receipt.jpg";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/Disclaimer";
import { FILING_SEASON, daysUntil } from "@/lib/tax-year";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TaxGuard SA — Know your tax. Keep the proof." },
      {
        name: "description",
        content:
          "A plain-language South African tax companion: check your PAYE monthly, snap receipts into a real ledger, and keep evidence ready before SARS ever asks.",
      },
      { property: "og:title", content: "TaxGuard SA — Know your tax. Keep the proof." },
      {
        property: "og:description",
        content:
          "Track PAYE, photograph receipts into a real ledger, and keep SARS-ready evidence from day one.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Wallet,
    title: "Catch PAYE problems early",
    body: "Log each payslip. We estimate what PAYE (the tax your employer takes off your salary each month) should have been and flag a shortfall the same month — not a year later.",
  },
  {
    icon: Camera,
    title: "Snap a slip, keep the proof",
    body: "Photograph every till slip. It is read, sorted into a real expense category, and stored with the picture attached — that photo is the evidence, not just the number.",
  },
  {
    icon: FileSearch,
    title: "Ready before SARS asks",
    body: "Any date range becomes a Supporting Evidence Pack: every deposit explained, every expense backed by a receipt, in minutes instead of months.",
  },
  {
    icon: Languages,
    title: "In your language",
    body: "Ask questions in isiZulu, isiXhosa, Afrikaans, Sepedi, Setswana, Sesotho, Xitsonga, siSwati, Tshivenda, isiNdebele or English. Short answers, no jargon, no shame.",
  },
];

function Landing() {
  const days = daysUntil(FILING_SEASON.nonProvisionalDeadline);

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-6 text-primary" aria-hidden />
          <span className="font-display text-lg font-semibold">TaxGuard SA</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild size="sm">
            <Link to="/calculator">Tax calculator</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:py-16">
        <div>
          <p className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            Built for South African employees and side-hustlers
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight lg:text-5xl">
            Know your tax. Keep the proof.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Money landing in your bank account is not automatically profit. TaxGuard SA helps you
            record what came in, what you actually spent, and what tax has been deducted — so the
            evidence already exists on the day SARS asks for it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">Start free</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/calculator">
                <Calculator className="size-4" aria-hidden /> Try the calculator
              </Link>
            </Button>
          </div>
          {days > 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              <span className="font-medium text-foreground num">{days} days</span> until the 23
              October 2026 filing deadline for individuals who are not provisional taxpayers.
            </p>
          ) : null}
        </div>
        <img
          src={heroImage}
          alt="A shop owner photographing a till slip with her phone behind her counter"
          width={1600}
          height={1104}
          className="w-full rounded-2xl object-cover shadow-[var(--shadow-lift)]"
        />
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="surface p-5">
              <f.icon className="size-5 text-primary" aria-hidden />
              <h2 className="mt-3 font-display text-lg font-semibold">{f.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="surface p-6">
          <h2 className="font-display text-xl font-semibold">Why this matters</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            If you earn R50 000 a month and R45 000 of it goes to stock, transport and running your
            business, that R45 000 is not your profit. But without records, an assessment can treat
            the whole amount as if it were. This app builds the record as you go — one photographed
            slip at a time — so you are never reconstructing a year of paperwork from memory.
          </p>
        </div>
        <div className="mt-6">
          <Disclaimer />
        </div>
      </section>
    </div>
  );
}
