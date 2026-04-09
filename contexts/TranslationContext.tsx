"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, LOCALES, type Locale, type Translations } from "@/lib/i18n";

const STORAGE_KEY = "lostify_locale";

type TranslationContextValue = {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  dir: "ltr" | "rtl";
};

const TranslationContext = createContext<TranslationContextValue>({
  locale: "en",
  t: translations.en,
  setLocale: () => {},
  dir: "ltr",
});

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && translations[saved]) setLocaleState(saved);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    const dir = LOCALES.find((l) => l.value === newLocale)?.dir ?? "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = newLocale;
  };

  useEffect(() => {
    const dir = LOCALES.find((l) => l.value === locale)?.dir ?? "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  const dir = LOCALES.find((l) => l.value === locale)?.dir ?? "ltr";

  return (
    <TranslationContext.Provider
      value={{ locale, t: translations[locale], setLocale, dir }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
