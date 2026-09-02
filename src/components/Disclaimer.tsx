import { ShieldAlert } from "lucide-react";

export const DISCLAIMER_TEXT =
  "TaxGuard SA is an independent personal tax and bookkeeping tool and is not affiliated with or endorsed by the South African Revenue Service (SARS). Calculations and evidence packs are estimates and summaries based on information you recorded, and are not official tax assessments or accounting sign-offs. Verify your tax position with a registered tax practitioner, your employer, or SARS directly before relying on any figure for a filing, dispute, or audit response. Official IRP5/IT3 certificates and SARS assessments remain the authoritative records.";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-muted/60 p-4 text-xs leading-relaxed text-muted-foreground">
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-accent-foreground" aria-hidden />
      <p>
        {compact
          ? "Estimates only, based on what you recorded. TaxGuard SA is not SARS and cannot file or dispute anything for you."
          : DISCLAIMER_TEXT}
      </p>
    </div>
  );
}
