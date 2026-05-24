export type Locale = string;
export type I18nMessages = Record<string, string>;
export type I18nResources = Record<Locale, I18nMessages>;
export type LocaleOption = { code: Locale; label: string };


