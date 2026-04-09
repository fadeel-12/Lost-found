import en from "./en";
import de from "./de";
import ar from "./ar";

export type Locale = "en" | "de" | "ar";

export const LOCALES: { value: Locale; label: string; dir: "ltr" | "rtl" }[] = [
  { value: "en", label: "English", dir: "ltr" },
  { value: "de", label: "Deutsch", dir: "ltr" },
  { value: "ar", label: "العربية", dir: "rtl" },
];

export const translations = { en, de, ar };
export type { Translations } from "./en";
export { en, de, ar };
