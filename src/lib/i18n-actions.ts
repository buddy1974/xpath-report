"use server";

/**
 * X-PATH — locale switcher (M7)
 * ------------------------------------------------------------------
 * A plain UI preference cookie, not httpOnly — no security implication,
 * so this is a straightforward Server Action rather than needing the
 * same-origin CSRF care a state-changing clinical action would (see
 * api/auth/verify-totp/route.ts for that pattern). GET-triggerable in
 * spirit, POST here only because Server Actions require it.
 */
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOCALES, type Locale } from "./i18n";

export async function setLocaleAction(locale: string, returnTo: string) {
  const store = await cookies();
  if (LOCALES.includes(locale as Locale)) {
    store.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  }
  redirect(returnTo);
}
