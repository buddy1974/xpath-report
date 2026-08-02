import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { encrypt, decrypt } from "@/lib/crypto";
import { completeProfile, confirmEnrollment } from "./actions";

const ERRORS: Record<string, string> = {
  name_required: "Enter your name.",
  department_required: "Enter your unit / department.",
  phone_required: "Enter a phone number.",
  email_invalid: "Enter a valid email address.",
  password_weak: "Password needs 12+ characters with upper/lower case, a number, and a symbol.",
  password_mismatch: "Passwords don't match.",
  email_taken: "That email is already in use in this workspace.",
  invalid: "That code didn't match. Try the next code from your app.",
  locked: "Too many incorrect codes. Try again in 15 minutes.",
  not_enrolled: "Enrollment secret missing — reload the page.",
};

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

  const params = await searchParams;
  const error = params?.error ? ERRORS[params.error] : undefined;

  if (!user.profileCompletedAt) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <form action={completeProfile} className="w-full max-w-sm space-y-4">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-petrol">Step 1 of 2</p>
            <h2 className="text-xl font-semibold mt-1">Complete your profile</h2>
            <p className="text-sm text-neutral-500 mt-1">
              This replaces the placeholder account you were given. Your new email and password become your login going forward.
            </p>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
          )}
          <label className="block text-sm font-semibold">
            Full name
            <input name="displayName" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm font-semibold">
            Unit / department
            <input name="department" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm font-semibold">
            Phone
            <input name="phone" type="tel" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm font-semibold">
            Your real work email
            <input name="email" type="email" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm font-semibold">
            New password
            <input name="password" type="password" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm font-semibold">
            Confirm password
            <input name="confirmPassword" type="password" required className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" />
          </label>
          <button type="submit" className="w-full rounded-md bg-petrol py-2.5 text-white text-sm font-semibold">
            Continue
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
          <p className="text-xs font-bold tracking-widest uppercase text-petrol">Step 2 of 2</p>
          <h2 className="text-xl font-semibold mt-1">Set up two-factor authentication</h2>
          <p className="text-sm text-neutral-600 mt-1">
            Scan with an authenticator app, then enter the 6-digit code. No SMS — nothing to intercept.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="TOTP enrollment QR code" className="mx-auto rounded-md border border-neutral-200" />
        <p className="text-xs text-neutral-400 break-all">Manual entry: {secret}</p>
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
            Verify &amp; finish
          </button>
        </form>
      </div>
    </main>
  );
}
