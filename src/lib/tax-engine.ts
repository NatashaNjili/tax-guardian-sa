/**
 * TaxGuard SA tax engine.
 *
 * All arithmetic happens here, in deterministic code — never in an AI model.
 * Bracket/rebate/threshold figures are supplied from the tax_rate_config
 * table so they can be updated each Budget without touching this logic.
 */

export type Bracket = { min: number; max: number | null; rate: number; base: number };
export type Rebates = { primary: number; secondary: number; tertiary: number };
export type Thresholds = { under65: number; age65: number; age75: number };
export type TurnoverBand = { min: number; max: number | null; rate: number; base: number };
export type VatThresholds = { compulsory: number; voluntary: number };

export type TaxConfig = {
  tax_year: string;
  brackets: Bracket[];
  rebates: Rebates;
  thresholds: Thresholds;
  turnover_tax_bands: TurnoverBand[] | null;
  vat_thresholds: VatThresholds | null;
  interest_rates: Record<string, number> | null;
  source_note: string | null;
};

export type MissingConfig = { missing: true; reason: string };

export function rebateFor(rebates: Rebates, age: number): number {
  let total = rebates.primary;
  if (age >= 65) total += rebates.secondary;
  if (age >= 75) total += rebates.tertiary;
  return total;
}

export function thresholdFor(thresholds: Thresholds, age: number): number {
  if (age >= 75) return thresholds.age75;
  if (age >= 65) return thresholds.age65;
  return thresholds.under65;
}

/** Progressive tax on annual taxable income, before rebates. */
export function taxBeforeRebates(brackets: Bracket[], annualIncome: number) {
  const income = Math.max(0, annualIncome);
  const bracket =
    brackets.find((b) => income >= b.min && (b.max === null || income <= b.max)) ??
    brackets[brackets.length - 1];
  const tax = bracket.base + (income - bracket.min + (bracket.min > 0 ? 1 : 0)) * bracket.rate;
  return { tax: Math.max(0, tax), bracket };
}

export type AnnualResult = {
  annualIncome: number;
  taxBeforeRebates: number;
  rebate: number;
  annualTax: number;
  monthlyTax: number;
  marginalRate: number;
  effectiveRate: number;
  belowThreshold: boolean;
  threshold: number;
};

export function calculateAnnualTax(
  config: TaxConfig,
  annualIncome: number,
  age = 30,
): AnnualResult {
  const threshold = thresholdFor(config.thresholds, age);
  const { tax, bracket } = taxBeforeRebates(config.brackets, annualIncome);
  const rebate = rebateFor(config.rebates, age);
  const annualTax = Math.max(0, tax - rebate);
  return {
    annualIncome,
    taxBeforeRebates: tax,
    rebate,
    annualTax,
    monthlyTax: annualTax / 12,
    marginalRate: bracket.rate,
    effectiveRate: annualIncome > 0 ? annualTax / annualIncome : 0,
    belowThreshold: annualIncome <= threshold,
    threshold,
  };
}

/** Estimated PAYE for one month of employment income (annualised method). */
export function estimateMonthlyPaye(config: TaxConfig, grossForMonth: number, age = 30) {
  const result = calculateAnnualTax(config, grossForMonth * 12, age);
  return { ...result, estimatedPaye: result.monthlyTax };
}

export type PayeStatus = "aligned" | "shortfall" | "over_deducted" | "no_paye";

export function payeStatus(estimated: number, actual: number): PayeStatus {
  if (estimated > 0 && actual <= 0) return "no_paye";
  const diff = estimated - actual;
  const tolerance = Math.max(50, estimated * 0.05);
  if (Math.abs(diff) <= tolerance) return "aligned";
  return diff > 0 ? "shortfall" : "over_deducted";
}

export const payeStatusMeta: Record<
  PayeStatus,
  { label: string; tone: "success" | "warning" | "info" | "destructive"; note: string }
> = {
  aligned: {
    label: "PAYE appears aligned",
    tone: "success",
    note: "What was deducted is close to what we estimate for this period.",
  },
  shortfall: {
    label: "Possible PAYE shortfall",
    tone: "warning",
    note: "Less PAYE was deducted than our estimate. Consider setting the difference aside while you check.",
  },
  over_deducted: {
    label: "Possible over-deduction",
    tone: "info",
    note: "More PAYE was deducted than our estimate. This may or may not lead to a refund — only SARS can confirm.",
  },
  no_paye: {
    label: "No PAYE deduction detected",
    tone: "destructive",
    note: "No PAYE was recorded for this period, while your recorded income indicates income tax may be applicable.",
  },
};

/** Turnover tax (simplified small-business regime) on annual turnover. */
export function calculateTurnoverTax(bands: TurnoverBand[] | null, annualTurnover: number) {
  if (!bands || bands.length === 0) return null;
  const band =
    bands.find((b) => annualTurnover >= b.min && (b.max === null || annualTurnover <= b.max)) ??
    null;
  if (!band) return null;
  return {
    band,
    tax: Math.max(0, band.base + (annualTurnover - band.min) * band.rate),
  };
}

export type PeriodTotals = {
  income: number;
  costOfSales: number;
  operatingExpenses: number;
  capitalItems: number;
  profit: number;
  receiptCount: number;
};

export const EXPENSE_CATEGORIES = [
  { value: "cost_of_sales", label: "Stock / cost of sales", group: "cost_of_sales" },
  { value: "transport", label: "Transport & vehicle", group: "operating" },
  { value: "rent", label: "Rent", group: "operating" },
  { value: "utilities", label: "Utilities", group: "operating" },
  { value: "wages", label: "Salaries & wages paid", group: "operating" },
  { value: "professional_fees", label: "Professional fees", group: "operating" },
  { value: "marketing", label: "Marketing", group: "operating" },
  { value: "repairs", label: "Repairs & maintenance", group: "operating" },
  { value: "bank_charges", label: "Bank charges", group: "operating" },
  { value: "insurance", label: "Insurance", group: "operating" },
  { value: "telephone_data", label: "Telephone & data", group: "operating" },
  { value: "small_tools", label: "Small tools & equipment", group: "operating" },
  { value: "capital_asset", label: "Capital asset (depreciate)", group: "capital" },
  { value: "home_office", label: "Home office portion", group: "operating" },
  { value: "other", label: "Other — needs review", group: "operating" },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]["value"];

export function categoryLabel(value: string) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value)?.label ?? "Other — needs review";
}

export const DEPOSIT_CATEGORIES = [
  { value: "business_sale", label: "Business sale / income", taxable: true },
  { value: "salary", label: "Salary received", taxable: true },
  { value: "loan", label: "Loan received", taxable: false },
  { value: "refund", label: "Refund", taxable: false },
  { value: "reimbursement", label: "Reimbursement", taxable: false },
  { value: "own_transfer", label: "Transfer between my own accounts", taxable: false },
  { value: "gift", label: "Gift", taxable: false },
  { value: "other", label: "Other", taxable: false },
  { value: "untagged", label: "Not tagged yet", taxable: false },
] as const;

export function depositIsTaxable(category: string) {
  return DEPOSIT_CATEGORIES.find((c) => c.value === category)?.taxable ?? false;
}

export function depositLabel(category: string) {
  return DEPOSIT_CATEGORIES.find((c) => c.value === category)?.label ?? "Other";
}

export function summarisePeriod(
  deposits: { amount: number; category: string }[],
  expenses: { amount: number; category: string; is_capital_item: boolean }[],
): PeriodTotals {
  const income = deposits
    .filter((d) => depositIsTaxable(d.category))
    .reduce((sum, d) => sum + Number(d.amount), 0);
  let costOfSales = 0;
  let operatingExpenses = 0;
  let capitalItems = 0;
  for (const e of expenses) {
    const amount = Number(e.amount);
    if (e.is_capital_item || e.category === "capital_asset") capitalItems += amount;
    else if (e.category === "cost_of_sales") costOfSales += amount;
    else operatingExpenses += amount;
  }
  return {
    income,
    costOfSales,
    operatingExpenses,
    capitalItems,
    profit: income - costOfSales - operatingExpenses,
    receiptCount: expenses.length,
  };
}
