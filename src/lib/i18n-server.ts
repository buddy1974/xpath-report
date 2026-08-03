/**
 * X-PATH — server-only locale resolution (M7)
 * ------------------------------------------------------------------
 * Split from i18n.ts so `next/headers` never ends up in a client bundle
 * — Server Components call getLocale(); Client Components receive the
 * resolved Locale as a prop instead.
 */
import { cookies } from "next/headers";
import { LOCALES, type Locale } from "./i18n";

const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return LOCALES.includes(value as Locale) ? (value as Locale) : "en";
}
