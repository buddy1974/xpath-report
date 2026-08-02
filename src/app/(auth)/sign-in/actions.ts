"use server";

/**
 * X-PATH — sign-in server action
 * ------------------------------------------------------------------
 * FIX: the sign-in form used to POST directly to NextAuth's own
 * /api/auth/callback/credentials endpoint. That endpoint requires a
 * csrfToken field (Auth.js's double-submit-cookie CSRF check), which the
 * plain HTML form never included — real browser submissions failed with
 * ?error=MissingCSRF. This was missed earlier because scripted
 * verification manually fetched /api/auth/csrf and injected the token
 * itself, which a real user's browser never does. Caught by an actual
 * browser walkthrough of the claim wizard.
 *
 * Fix: call `signIn` from @/auth directly in a Server Action instead.
 * That's an in-process call, not an HTTP round-trip to the callback
 * endpoint, so Auth.js's CSRF-cookie check doesn't apply — Next.js's own
 * built-in Origin-header check for Server Actions covers CSRF here
 * instead (same protection the claim wizard's actions already rely on).
 */
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function signInAction(formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      "cf-turnstile-response": formData.get("cf-turnstile-response"),
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect("/sign-in?error=invalid");
    }
    throw err;
  }

  // authorized() in auth.config.ts routes onward to /claim-account or
  // /verify as needed — this is just the entry point.
  redirect("/dashboard");
}
