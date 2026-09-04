import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAlerts, useDeposits, useRefresh } from "@/hooks/useTaxData";
import { rands, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({
    meta: [
      { title: "Tax alerts — TaxGuard SA" },
      {
        name: "description",
        content:
          "Every open issue in one place: missing PAYE, possible shortfalls, untagged deposits and receipts that need review.",
      },
      { property: "og:title", content: "Tax alerts — TaxGuard SA" },
      { property: "og:description", content: "Everything that needs your attention, in one list." },
    ],
  }),
  component: AlertsPage,
});

const STATUS_NEXT: Record<string, string> = { new: "reviewing", reviewing: "resolved", resolved: "new" };

function AlertsPage() {
  const { user } = useAuth();
  const uid = user?.id;
  const { data: alerts = [] } = useAlerts(uid);
  const { data: deposits = [] } = useDeposits(uid);
  const refresh = useRefresh();

  const untagged = deposits.filter((d) => d.category === "untagged");

  async function cycle(id: string, status: string) {
    const next = STATUS_NEXT[status] ?? "reviewing";
    const { error } = await supabase.from("tax_alerts").update({ status: next }).eq("id", id);
    if (error) return toast.error(error.message);
    refresh(["alerts"]);
  }

  const open = alerts.filter((a) => a.status !== "resolved");
  const done = alerts.filter((a) => a.status === "resolved");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tax alerts"
        description={`${open.length} open · ${done.length} resolved. Nothing here is a demand from SARS — these are things worth checking.`}
      />

      {untagged.length > 0 ? (
        <div className="surface border-warning p-4 text-sm">
          <p className="font-medium">
            {untagged.length} deposit{untagged.length === 1 ? "" : "s"} not tagged yet
          </p>
          <p className="mt-1 text-muted-foreground">
            An untagged deposit could be counted as business income by default. Open the business
            ledger and say what each one actually was.
          </p>
        </div>
      ) : null}

      {alerts.length === 0 ? (
        <p className="surface p-5 text-sm text-muted-foreground">
          No alerts yet. As you record payslips and receipts, anything that looks off will show up
          here.
        </p>
      ) : (
        <div className="space-y-3">
          {[...open, ...done].map((a) => (
            <article
              key={a.id}
              className={`surface p-4 ${a.severity === "urgent" ? "border-destructive" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    a.severity === "urgent"
                      ? "destructive"
                      : a.severity === "info"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {a.severity === "urgent" ? "Urgent" : a.severity === "info" ? "For info" : "Check this"}
                </Badge>
                {a.period_label ? <span className="text-sm font-medium">{a.period_label}</span> : null}
                <span className="text-xs text-muted-foreground">{shortDate(a.created_at)}</span>
                <span className="flex-1" />
                <Button size="sm" variant="outline" onClick={() => cycle(a.id, a.status)}>
                  {a.status === "new" ? "Mark as reviewing" : a.status === "reviewing" ? "Mark resolved" : "Reopen"}
                </Button>
              </div>
              <p className="mt-2 text-sm">{a.description}</p>
              {a.estimated_amount != null ? (
                <p className="num mt-2 text-sm text-muted-foreground">
                  Estimated {rands(a.estimated_amount, 0)} · Recorded {rands(a.actual_amount ?? 0, 0)}{" "}
                  · Difference {rands(a.difference ?? 0, 0)}
                </p>
              ) : null}
              {a.recommended_action ? (
                <p className="mt-2 rounded-lg bg-muted/60 p-3 text-sm">{a.recommended_action}</p>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <Disclaimer compact />
    </div>
  );
}
