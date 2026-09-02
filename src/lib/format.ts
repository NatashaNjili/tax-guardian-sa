export function rands(value: number | string | null | undefined, decimals = 2) {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(n) ? n : 0);
}

export function randsShort(value: number | string | null | undefined) {
  return rands(value, 0);
}

export function percent(value: number, decimals = 1) {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function monthLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
}

export function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
