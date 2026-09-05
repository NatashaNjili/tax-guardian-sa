export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "af", label: "Afrikaans" },
  { value: "zu", label: "isiZulu" },
  { value: "xh", label: "isiXhosa" },
  { value: "st", label: "Sesotho" },
  { value: "tn", label: "Setswana" },
  { value: "nso", label: "Sepedi" },
  { value: "ts", label: "Xitsonga" },
  { value: "ss", label: "siSwati" },
  { value: "ve", label: "Tshivenda" },
  { value: "nr", label: "isiNdebele" },
] as const;

export function languageLabel(value: string) {
  return LANGUAGE_OPTIONS.find((l) => l.value === value)?.label ?? "English";
}
