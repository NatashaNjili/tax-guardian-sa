import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { askAssistant } from "@/lib/ai.functions";
import { useAuth } from "@/hooks/useAuth";
import { useDeposits, useExpenses, useProfile, useSalaryRecords } from "@/hooks/useTaxData";
import { LANGUAGE_OPTIONS } from "@/lib/languages";
import { summarisePeriod } from "@/lib/tax-engine";
import { rands } from "@/lib/format";
import { currentTaxYear } from "@/lib/tax-year";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({
    meta: [
      { title: "Ask a tax question — TaxGuard SA" },
      {
        name: "description",
        content:
          "Plain-language answers about South African tax in your own language, one question at a time.",
      },
      { property: "og:title", content: "Ask a tax question — TaxGuard SA" },
      { property: "og:description", content: "Plain-language tax answers in your own language." },
    ],
  }),
  component: AssistantPage,
});

const STARTERS = [
  "I have never filed a tax return. Where do I start?",
  "What is PAYE and why is it taken off my salary?",
  "Do I have to register for VAT?",
  "What is a provisional taxpayer?",
  "SARS says I must send proof. What does that mean?",
];

type Msg = { role: "user" | "assistant"; content: string };

function AssistantPage() {
  const { user } = useAuth();
  const uid = user?.id;
  const { data: profile } = useProfile(uid);
  const { data: salary = [] } = useSalaryRecords(uid);
  const { data: deposits = [] } = useDeposits(uid);
  const { data: expenses = [] } = useExpenses(uid);
  const ask = useServerFn(askAssistant);

  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile?.preferred_language) setLanguage(profile.preferred_language);
  }, [profile?.preferred_language]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const year = currentTaxYear();
      const yearSalary = salary.filter((s) => s.tax_year === year);
      const totals = summarisePeriod(
        deposits.map((d) => ({ amount: Number(d.amount), category: d.category })),
        expenses.map((e) => ({
          amount: Number(e.amount),
          category: e.category,
          is_capital_item: e.is_capital_item,
        })),
      );
      const context = [
        `Tax year: ${year}`,
        `Salary months recorded: ${yearSalary.length}`,
        `Gross salary recorded: ${rands(yearSalary.reduce((t, s) => t + Number(s.gross_salary), 0), 0)}`,
        `PAYE deducted: ${rands(yearSalary.reduce((t, s) => t + Number(s.paye_deducted), 0), 0)}`,
        `Business income tagged: ${rands(totals.income, 0)}`,
        `Business expenses: ${rands(totals.costOfSales + totals.operatingExpenses, 0)}`,
        `Estimated business profit: ${rands(totals.profit, 0)}`,
      ].join("\n");

      const res = await ask({ data: { messages: next.slice(-20), language, context } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not answer right now.");
      setMessages(messages);
      setInput(question);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ask a tax question"
        description="Ask in your own words, in your own language. Answers are explanations and estimates — never a filing, a decision, or a promise."
      />

      <div className="surface p-4">
        <Label htmlFor="lang" className="text-sm">
          Answer me in
        </Label>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger id="lang" className="mt-2 w-64">
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

      {messages.length === 0 ? (
        <div className="surface p-5">
          <p className="text-sm text-muted-foreground">
            Not sure where to start? Tap one of these. There is no wrong question here.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STARTERS.map((s) => (
              <Button key={s} size="sm" variant="outline" onClick={() => send(s)}>
                {s}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3" aria-live="polite">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-sm text-primary-foreground"
                  : "surface max-w-[95%] whitespace-pre-wrap p-4 text-sm"
              }
            >
              {m.content}
            </div>
          ))}
          {busy ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Thinking…
            </p>
          ) : null}
          <div ref={endRef} />
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="surface flex items-end gap-2 p-3"
      >
        <div className="flex-1">
          <Label htmlFor="q" className="sr-only">
            Your question
          </Label>
          <Textarea
            id="q"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question…"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
          />
        </div>
        <Button type="submit" disabled={busy || !input.trim()} aria-label="Send question">
          <Send className="size-4" aria-hidden />
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        Never type your ID number, bank account number, or eFiling password here. You do not need
        them to use TaxGuard.
      </p>

      <Disclaimer />
    </div>
  );
}
