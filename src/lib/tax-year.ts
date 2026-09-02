/** South African tax year runs 1 March to 28/29 February. */
export function taxYearFor(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const startYear = d.getMonth() >= 2 ? year : year - 1;
  return `${startYear}/${String((startYear + 1) % 100).padStart(2, "0")}`;
}

export function currentTaxYear() {
  return taxYearFor(new Date());
}

export type FilingKey = "auto_assessment" | "non_provisional" | "provisional";

/**
 * 2026 filing season dates. These change every year — review before each season.
 */
export const FILING_SEASON = {
  year: 2026,
  autoAssessmentWindow: { start: "2026-07-01", end: "2026-07-12" },
  filingOpens: "2026-07-13",
  nonProvisionalDeadline: "2026-10-23",
  provisionalDeadline: "2027-01-22",
  provisionalPeriod1: "2026-08-31",
  provisionalPeriod2: "2027-02-28",
};

export function deadlineFor(key: FilingKey) {
  if (key === "provisional")
    return { date: FILING_SEASON.provisionalDeadline, label: "Provisional taxpayers and trusts" };
  if (key === "auto_assessment")
    return {
      date: FILING_SEASON.autoAssessmentWindow.end,
      label: "Auto-assessment notices issued 1–12 July",
    };
  return {
    date: FILING_SEASON.nonProvisionalDeadline,
    label: "Individuals who are not provisional taxpayers",
  };
}

export function daysUntil(iso: string) {
  const target = new Date(`${iso}T23:59:59`);
  return Math.ceil((target.getTime() - Date.now()) / 86_400_000);
}

/** True when today falls outside the tax year the seeded config was written for. */
export function configIsStale(configYears: string[]) {
  return !configYears.includes(currentTaxYear());
}
