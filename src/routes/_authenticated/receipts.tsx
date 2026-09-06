import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Disclaimer } from "@/components/Disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { extractReceipt } from "@/lib/ai.functions";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses, useRefresh } from "@/hooks/useTaxData";
import { EXPENSE_CATEGORIES, categoryLabel } from "@/lib/tax-engine";
import { rands, shortDate } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/receipts")({
  head: () => ({
    meta: [
      { title: "Snap a receipt — TaxGuard SA" },
      {
        name: "description",
        content:
          "Photograph a till slip or proof of payment. It is read, sorted into a bookkeeping category, and stored with the picture as proof.",
      },
      { property: "og:title", content: "Snap a receipt — TaxGuard SA" },
      {
        property: "og:description",
        content: "Photograph a slip and keep the proof attached to the ledger entry.",
      },
    ],
  }),
  component: ReceiptsPage,
});

type Draft = {
  vendor: string;
  date: string;
  amount: string;
  vat_amount: string;
  description: string;
  category: string;
  is_capital_item: boolean;
  reason: string;
};

function ReceiptsPage() {
  const { user } = useAuth();
  const uid = user?.id;
  const { data: expenses = [] } = useExpenses(uid);
  const refresh = useRefresh();
  const extract = useServerFn(extractReceipt);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  async function onPick(f: File | null) {
    if (!f) return;
    setFile(f);
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });
    setPreviewUrl(dataUrl);
    setReading(true);
    try {
      const result = await extract({ data: { imageDataUrl: dataUrl } });
      setDraft({
        vendor: result.vendor ?? "",
        date: result.date ?? new Date().toISOString().slice(0, 10),
        amount: result.amount != null ? String(result.amount) : "",
        vat_amount: result.vat_amount != null ? String(result.vat_amount) : "0",
        description: result.description ?? "",
        category: result.category ?? "other",
        is_capital_item: !!result.is_capital_item,
        reason: result.reason ?? "",
      });
      if (!result.confident || result.amount == null) {
        toast.warning("Some details were hard to read. Please check them before saving.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read that image.");
      setDraft({
        vendor: "",
        date: new Date().toISOString().slice(0, 10),
        amount: "",
        vat_amount: "0",
        description: "",
        category: "other",
        is_capital_item: false,
        reason: "Not read automatically — please fill it in.",
      });
    } finally {
      setReading(false);
    }
  }

  async function save() {
    if (!uid || !draft) return;
    if (!draft.amount) {
      toast.error("Please enter the amount on the slip.");
      return;
    }
    setSaving(true);
    try {
      let path: string | null = null;
      if (file) {
        const key = `${uid}/receipts/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
        const { error } = await supabase.storage.from("receipts").upload(key, file);
        if (error) throw error;
        path = key;
      }
      const { error } = await supabase.from("expense_records").insert({
        user_id: uid,
        expense_date: draft.date,
        vendor: draft.vendor || null,
        amount: Number(draft.amount),
        vat_amount: Number(draft.vat_amount || 0),
        ai_suggested_category: draft.category,
        category: draft.category,
        ai_reason: draft.reason,
        description: draft.description || null,
        receipt_path: path,
        is_capital_item: draft.is_capital_item,
        needs_review: draft.category === "other",
      });
      if (error) throw error;
      toast.success("Saved with the photo attached as proof.");
      setDraft(null);
      setFile(null);
      setPreviewUrl(null);
      refresh(["expenses"]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save that expense.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    const { error } = await supabase.from("expense_records").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    refresh(["expenses"]);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Snap a receipt"
        description="Take a photo of the slip or proof of payment. We read it, suggest a category, and keep the picture attached — the picture is the proof, not just the number."
      />

      <div className="surface p-5">
        <Label htmlFor="receipt" className="mb-2 block">
          Photograph or upload a slip
        </Label>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            id="receipt"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
            className="max-w-sm"
          />
          {reading ? (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Reading the slip…
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Camera className="size-4" aria-hidden /> A clear, flat, well-lit photo reads best.
            </span>
          )}
        </div>

        {draft ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[240px_1fr]">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="The slip you photographed"
                className="w-full rounded-xl border border-border object-cover"
              />
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vendor">Shop / supplier</Label>
                <Input
                  id="vendor"
                  value={draft.vendor}
                  onChange={(e) => setDraft({ ...draft, vendor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={draft.date}
                  onChange={(e) => setDraft({ ...draft, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (R)</Label>
                <Input
                  id="amount"
                  inputMode="decimal"
                  value={draft.amount}
                  onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vat">VAT on the slip (R)</Label>
                <Input
                  id="vat"
                  inputMode="decimal"
                  value={draft.vat_amount}
                  onChange={(e) => setDraft({ ...draft, vat_amount: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="desc">What was bought</Label>
                <Input
                  id="desc"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="cat">Category</Label>
                <Select
                  value={draft.category}
                  onValueChange={(v) => setDraft({ ...draft, category: v })}
                >
                  <SelectTrigger id="cat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {draft.reason ? (
                  <p className="text-xs text-muted-foreground">{draft.reason} You can change it.</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  id="capital"
                  checked={draft.is_capital_item}
                  onCheckedChange={(v) => setDraft({ ...draft, is_capital_item: !!v })}
                />
                <Label htmlFor="capital" className="text-sm font-normal">
                  This is equipment or a vehicle that lasts for years (a capital item — it is written
                  off gradually, not all in one month)
                </Label>
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button onClick={save} disabled={saving}>
                  {saving ? "Saving…" : "Save to my ledger"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDraft(null);
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">
          Receipts recorded ({expenses.length})
        </h2>
        {expenses.length === 0 ? (
          <p className="surface p-5 text-sm text-muted-foreground">
            No receipts yet. Every slip you photograph becomes evidence you can show later.
          </p>
        ) : (
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="surface flex flex-wrap items-center gap-3 p-4 text-sm">
                <div className="min-w-40">
                  <p className="font-medium">{e.vendor || "Unnamed supplier"}</p>
                  <p className="text-xs text-muted-foreground">{shortDate(e.expense_date)}</p>
                </div>
                <p className="num min-w-28 font-medium">{rands(e.amount)}</p>
                <Badge variant="outline">{categoryLabel(e.category)}</Badge>
                {e.is_capital_item ? <Badge variant="secondary">Capital item</Badge> : null}
                {e.needs_review ? <Badge variant="destructive">Needs review</Badge> : null}
                {e.receipt_path ? (
                  <Badge variant="secondary">Photo attached</Badge>
                ) : (
                  <Badge variant="outline">No photo</Badge>
                )}
                {e.is_demo ? <Badge variant="outline">Demo</Badge> : null}
                <span className="flex-1" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(e.id)}
                  aria-label={`Delete expense from ${e.vendor ?? "supplier"}`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <Disclaimer compact />
    </div>
  );
}
