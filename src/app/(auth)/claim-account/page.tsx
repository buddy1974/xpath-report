import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { encrypt, decrypt } from "@/lib/crypto";
import { getLocale } from "@/lib/i18n-server";
import { STRINGS, t } from "@/lib/i18n";
import { completeProfile, confirmEnrollment } from "./actions";

export default async function ClaimAccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!session || !userId) redirect("/sign-in");

  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = rows[0];
  if (!user || !user.mustCompleteSetup) redirect("/dashboard");

  const locale = await getLocale();
  const ERRORS: Record<string, string> = {
    name_required: t(STRINGS.claimNameRequired, locale),
    department_required: t(STRINGS.claimDepartmentRequired, locale),
    phone_required: t(STRINGS.claimPhoneRequired, locale),
    email_invalid: t(STRINGS.claimEmailInvalid, locale),
    password_weak: t(STRINGS.claimPasswordWeak, locale),
    password_mismatch: t(STRINGS.claimPasswordMismatch, locale),
    email_taken: t(STRINGS.claimEmailTaken, locale),
    invalid: t(STRINGS.verifyErrorInvalid, locale),
    locked: locale === "fr" ? "Trop de codes incorrects. Réessayez dans 15 minutes." : "Too many incorrect codes. Try again in 15 minutes.",
    not_enrolled: t(STRINGS.claimNotEnrolled, locale),
  };

  const params = await searchParams;
  const error = params?.error ? ERRORS[params.error] : undefined;

  if (!user.profileCompletedAt) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <form action={completeProfile} className="w-full max-w-sm space-y-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-petrol">{t(STRINGS.step1Of2, locale)}</p>
            <h2 className="text-xl font-semibold mt-1">{t(STRINGS.completeYourProfile, locale)}</h2>
            <p className="text-sm text-neutral-500 mt-1">{t(STRINGS.completeProfileExplainer, locale)}</p>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
          )}
          <label className="block text-sm font-semibold">
            {t(STRINGS.fullNameLabel, locale)}
            <input name="displayName" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm font-semibold">
            {t(STRINGS.unitDepartmentLabel, locale)}
            <input name="department" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm font-semibold">
            {t(STRINGS.phoneLabel, locale)}
            <input name="phone" type="tel" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm font-semibold">
            {t(STRINGS.realWorkEmailLabel, locale)}
            <input name="email" type="email" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm font-semibold">
            {t(STRINGS.newPasswordLabel, locale)}
            <input name="password" type="password" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm font-semibold">
            {t(STRINGS.confirmPasswordLabel, locale)}
            <input name="confirmPassword" type="password" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <button type="submit" className="w-full rounded-md bg-petrol py-2.5 text-white text-sm font-semibold">
            {t(STRINGS.continueButton, locale)}
          </button>
        </form>
      </main>
    );
  }

  // Step 2: TOTP enrollment. Generate the secret once and persist it
  // (totpEnabled stays false until confirmed) so re-visiting this page
  // mid-flow shows the SAME QR code rather than invalidating a scan.
  let secret: string;
  if (user.totpSecretEncrypted) {
    secret = decrypt(user.totpSecretEncrypted);
  } else {
    secret = authenticator.generateSecret();
    await db.update(users).set({ totpSecretEncrypted: encrypt(secret) }).where(eq(users.id, user.id));
  }
  const otpauth = authenticator.keyuri(user.email, "X-PATH", secret);
  const qrDataUrl = await QRCode.toDataURL(otpauth);

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm text-center space-y-5">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-petrol">{t(STRINGS.step2Of2, locale)}</p>
          <h2 className="text-xl font-semibold mt-1">{t(STRINGS.setUp2fa, locale)}</h2>
          <p className="text-sm text-neutral-600 mt-1">{t(STRINGS.setUp2faExplainer, locale)}</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="TOTP enrollment QR code" className="mx-auto rounded-md border border-neutral-200" />
        <p className="text-xs text-neutral-400 break-all">
          {t(STRINGS.manualEntryPrefix, locale)} {secret}
        </p>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
        )}
        <form action={confirmEnrollment} className="space-y-4">
          <input
            name="code"
            inputMode="numeric"
            maxLength={6}
            className="w-full text-center tracking-[0.5em] text-lg rounded-md border border-hema px-3 py-2"
            placeholder="••••••"
          />
          <button className="w-full rounded-md bg-petrol py-2.5 text-white text-sm font-semibold">
            {t(STRINGS.verifyAndFinish, locale)}
          </button>
        </form>
      </div>
    </main>
  );
}
