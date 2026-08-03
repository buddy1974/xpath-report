import { TOTP_LOCKOUT_MINUTES } from "@/lib/totp-policy";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t } from "@/lib/i18n";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const ERRORS: Record<string, string> = {
    invalid: t(STRINGS.verifyErrorInvalid, locale),
    not_enrolled: t(STRINGS.verifyErrorNotEnrolled, locale),
    locked:
      locale === "fr"
        ? `Trop de codes incorrects. Réessayez dans ${TOTP_LOCKOUT_MINUTES} minutes.`
        : `Too many incorrect codes. Try again in ${TOTP_LOCKOUT_MINUTES} minutes.`,
  };
  const error = params?.error ? ERRORS[params.error] : undefined;

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="mx-auto w-12 h-12 rounded-xl bg-hema/10 flex items-center justify-center">
          <span className="w-5 h-5 rounded border-2 border-hema" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{t(STRINGS.twoFactorHeading, locale)}</h2>
          <p className="text-sm text-neutral-600 mt-1">{t(STRINGS.twoFactorBody, locale)}</p>
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        <form action="/api/auth/verify-totp" method="post" className="space-y-4">
          <input
            name="code"
            inputMode="numeric"
            maxLength={6}
            className="w-full text-center tracking-[0.5em] text-lg rounded-md border border-hema px-3 py-2"
            placeholder="••••••"
          />
          <button className="w-full rounded-md bg-petrol py-2.5 text-white text-sm font-semibold">
            {t(STRINGS.verifyAndContinue, locale)}
          </button>
        </form>
        <p className="text-xs text-neutral-500">{t(STRINGS.authenticatorOnlyNote, locale)}</p>
      </div>
    </main>
  );
}
