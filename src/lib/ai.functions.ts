import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.7-flash";

function gatewayError(status: number, body: string) {
  if (status === 402)
    return "The AI workspace credits are used up. Ask the app owner to top up before trying again.";
  if (status === 403) return "AI access is currently blocked for this workspace.";
  if (status === 429) return "Too many requests right now. Please wait a moment and try again.";
  if (status === 401) return "AI is not configured correctly. Please contact support.";
  return `AI request failed (${status}): ${body.slice(0, 200)}`;
}

async function callGateway(body: unknown) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured (missing key).");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(gatewayError(res.status, await res.text()));
  return (await res.json()) as {
    choices: { message: { content: string | null; tool_calls?: unknown } }[];
  };
}

const CATEGORIES = [
  "cost_of_sales",
  "transport",
  "rent",
  "utilities",
  "wages",
  "professional_fees",
  "marketing",
  "repairs",
  "bank_charges",
  "insurance",
  "telephone_data",
  "small_tools",
  "capital_asset",
  "home_office",
  "other",
];

/**
 * Reads a photographed receipt / proof of payment and returns structured data.
 * Extraction is deliberately isolated here so the model or provider can be
 * swapped without touching the ledger.
 */
export const extractReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ imageDataUrl: z.string().min(32) }).parse(data))
  .handler(async ({ data }) => {
    const result = await callGateway({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You read South African till slips, invoices and proof-of-payment screenshots. Extract only what is visible. Amounts are in Rands. If a field is not visible, return null for it — never invent a figure.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract the purchase details and classify it into one of these bookkeeping categories: ${CATEGORIES.join(", ")}. Mark is_capital_item true only for durable equipment or vehicles that should be depreciated rather than expensed at once. Give a one-line plain-English reason for the category, written for someone with no accounting background.`,
            },
            { type: "image_url", image_url: { url: data.imageDataUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "record_receipt",
            description: "Record the extracted receipt details",
            parameters: {
              type: "object",
              properties: {
                vendor: { type: ["string", "null"] },
                date: { type: ["string", "null"], description: "YYYY-MM-DD" },
                amount: { type: ["number", "null"] },
                vat_amount: { type: ["number", "null"] },
                description: { type: ["string", "null"] },
                category: { type: "string", enum: CATEGORIES },
                is_capital_item: { type: "boolean" },
                reason: { type: "string" },
                confident: { type: "boolean" },
              },
              required: [
                "vendor",
                "date",
                "amount",
                "vat_amount",
                "description",
                "category",
                "is_capital_item",
                "reason",
                "confident",
              ],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "record_receipt" } },
    });

    const call = (
      result.choices?.[0]?.message as unknown as {
        tool_calls?: { function: { arguments: string } }[];
      }
    )?.tool_calls?.[0];
    if (!call) throw new Error("Could not read that image. Try a clearer, well-lit photo.");
    return JSON.parse(call.function.arguments) as {
      vendor: string | null;
      date: string | null;
      amount: number | null;
      vat_amount: number | null;
      description: string | null;
      category: string;
      is_capital_item: boolean;
      reason: string;
      confident: boolean;
    };
  });

const LANGUAGES: Record<string, string> = {
  en: "English",
  zu: "isiZulu",
  xh: "isiXhosa",
  af: "Afrikaans",
  nso: "Sepedi",
  tn: "Setswana",
  st: "Sesotho",
  ts: "Xitsonga",
  ss: "siSwati",
  ve: "Tshivenda",
  nr: "isiNdebele",
};

/** Plain-language tax assistant. It explains; it never calculates the numbers itself. */
export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string().min(1).max(4000),
            }),
          )
          .max(40),
        language: z.string().default("en"),
        context: z.string().max(4000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const language = LANGUAGES[data.language] ?? "English";
    const system = `You are the TaxGuard SA assistant, a calm plain-language guide to South African personal and small-business tax.

RESPOND ENTIRELY IN ${language}.

How you talk:
- Short, simple sentences. One question at a time — never ask for several things in one message.
- The first time you use a SARS or accounting term in this conversation, add a one-line plain-English gloss in brackets.
- Use everyday analogies. Tax brackets are a staircase: only the money on a higher step is taxed at the higher rate.
- Never shame anyone for never filing, missing a deadline, or not knowing a term. Be reassuring but factual about deadlines and penalties.
- Check understanding now and then ("Does that make sense so far?").
- If the person seems to struggle with the text, offer a simpler explanation or a worked example instead of repeating yourself.

Hard rules:
- You are NOT SARS, not a registered tax practitioner, not a law firm. You never file or dispute anything for anyone.
- Everything is an ESTIMATE from self-reported information. Never state a final amount owed to SARS as certain, and never promise a refund.
- Never invent figures. If something is missing, say exactly what is missing.
- Never ask for an ID number, bank account number, or eFiling password/PIN. If someone volunteers one, tell them it is not needed and should not be pasted into a chat.
- Escalate: foreign income, capital gains, trusts, unusually large or inconsistent amounts, or a real audit → recommend a registered tax practitioner or a SARS branch.
- Do not do the arithmetic yourself when calculated figures are supplied below — explain those figures instead.

2026 filing season dates: auto-assessments 1–12 July; filing opens 13 July; non-provisional individuals file by 23 October 2026; provisional taxpayers and trusts by 22 January 2027. Late filing carries a fixed monthly administrative penalty that keeps accruing — state that plainly, never as a threat.
${data.context ? `\nFigures already calculated by the app for this user (use these, do not recompute):\n${data.context}` : ""}`;

    const result = await callGateway({
      model: MODEL,
      messages: [{ role: "system", content: system }, ...data.messages],
    });
    return { reply: result.choices?.[0]?.message?.content ?? "" };
  });

/** Plain-language paragraph summarising a bookkeeping period from computed totals. */
export const summariseLedger = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ facts: z.string().min(5).max(4000), language: z.string().default("en") }).parse(data),
  )
  .handler(async ({ data }) => {
    const language = LANGUAGES[data.language] ?? "English";
    const result = await callGateway({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `Write 3-5 short plain-language sentences in ${language} summarising a small business period for the owner. Use ONLY the figures given — never add or recompute a number. No jargon without a one-line gloss. Call every tax figure an estimate. No shame, no fear-mongering.`,
        },
        { role: "user", content: data.facts },
      ],
    });
    return { summary: result.choices?.[0]?.message?.content ?? "" };
  });
