import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { dictionaries, localeLabels } from "./i18n/dictionaries";
import type { I18nMessages, I18nResources, Locale, LocaleOption } from "./i18n/types";
export type { I18nMessages, I18nResources, Locale, LocaleOption } from "./i18n/types";

const pluginDictionaries: I18nResources = {};
const listeners = new Set<() => void>();
let version = 0;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  locales: LocaleOption[];
  t: (key: string, fallback?: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => readInitialLocale());
  const [registryVersion, setRegistryVersion] = useState(version);
  useEffect(() => {
    const listener = () => setRegistryVersion(version);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale: (next) => {
        localStorage.setItem("tiphia.locale", next);
        setLocale(next);
      },
      locales: availableLocales(),
      t: (key, fallback, vars) => format(lookupMessage(locale, key, fallback), vars),
    }),
    [locale, registryVersion],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function registerI18nResources(resources: I18nResources, labels: Record<string, string> = {}) {
  Object.entries(resources).forEach(([locale, messages]) => {
    pluginDictionaries[locale] = {
      ...(pluginDictionaries[locale] || {}),
      ...messages,
    };
  });
  Object.assign(localeLabels, labels);
  version += 1;
  listeners.forEach((listener) => listener());
}

export function availableLocales(): LocaleOption[] {
  return Array.from(new Set([...Object.keys(dictionaries), ...Object.keys(pluginDictionaries)]))
    .sort((left, right) => (left === "zh-CN" ? -1 : right === "zh-CN" ? 1 : left.localeCompare(right)))
    .map((code) => ({ code, label: localeLabels[code] || code }));
}

function lookupMessage(locale: Locale, key: string, fallback?: string) {
  return (
    pluginDictionaries[locale]?.[key] ||
    dictionaries[locale]?.[key] ||
    pluginDictionaries["zh-CN"]?.[key] ||
    dictionaries["zh-CN"]?.[key] ||
    fallback ||
    key
  );
}

function format(value: string, vars?: Record<string, string | number>) {
  if (!vars) {
    return value;
  }
  return Object.entries(vars).reduce(
    (text, [key, replacement]) => text.split(`{${key}}`).join(String(replacement)),
    value,
  );
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return value;
}

function readInitialLocale(): Locale {
  const stored = localStorage.getItem("tiphia.locale");
  if (stored === "en-US" || stored === "zh-CN") {
    return stored;
  }
  return navigator.language.toLowerCase().startsWith("en") ? "en-US" : "zh-CN";
}



