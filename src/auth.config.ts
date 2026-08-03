/**
 * X-PATH — Edge-safe Auth.js config
 * ------------------------------------------------------------------
 * `middleware.ts` runs on the Edge runtime, which does NOT support
 * Node-only APIs (bcryptjs, the Drizzle/Neon client, etc). This file
 * holds only what middleware needs: session shape callbacks and the
 * route-gating `authorized` check. No providers, no bcrypt, no DB.
 *
 * The full config (Credentials provider, bcrypt, DB lookups) lives in
 * `auth.ts` and is used by route handlers / server actions, which run
 * on the Node runtime. Never import `auth.ts` from `middleware.ts`.
 */
import type { NextAuthConfig } from "next-auth";

// DL-038: Marcel's explicit, direct instruction — TOTP fully removed for
// this one administrator account (password-only login). Not a default and
// not a pattern to extend; every other account still requires 2FA via
// /api/auth/verify-totp. See docs/decision-log.md.
const TOTP_EXEMPT_EMAILS = ["dev-administrator@xpath.report"];

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  // Vercel preview URLs differ per deploy — trust the request host instead
  // of requiring AUTH_URL to match exactly (production still pins the host
  // via Vercel env once xpath.report is wired at M7).
  trustHost: true,
  providers: [], // populated in auth.ts (Node runtime only)
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.tenantId = (user as any).tenantId;
        token.role = (user as any).role;
        token.totpEnabled = (user as any).totpEnabled;
        // set true by /api/auth/verify-totp, except the DL-038 exemption
        // above, which is trusted at password-verification time already.
        token.totpVerified = TOTP_EXEMPT_EMAILS.includes(
          String((user as any).email ?? "").toLowerCase()
        );
        token.mustCompleteSetup = (user as any).mustCompleteSetup;
      }
      // Set via unstable_update(...) from /api/auth/verify-totp (login
      // 2FA) or the claim wizard (first-time profile + TOTP enrollment).
      const s = session as any;
      if (trigger === "update" && s?.totpVerified) token.totpVerified = true;
      if (trigger === "update" && s?.mustCompleteSetup === false) token.mustCompleteSetup = false;
      // Claim wizard Step 1 replaces the placeholder email/name with the
      // real ones (src/app/(auth)/claim-account/actions.ts:completeProfile).
      // Without this, the JWT keeps caching the old values for the rest of
      // the session — DB is correct immediately, but anything reading
      // session.user.email/name (e.g. the dashboard header) shows stale
      // data until the next full login. Caught by an actual browser
      // walkthrough of the claim wizard, not the earlier scripted tests.
      if (trigger === "update" && s?.user?.email) token.email = s.user.email;
      if (trigger === "update" && s?.user?.name) token.name = s.user.name;
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.sub;
      if (token.email) session.user.email = token.email as string;
      if (token.name) session.user.name = token.name as string;
      (session as any).tenantId = token.tenantId;
      (session as any).role = token.role;
      (session as any).totpVerified = token.totpVerified ?? false;
      (session as any).mustCompleteSetup = token.mustCompleteSetup ?? false;
      return session;
    },
    authorized({ auth, request }) {
      const isAuthed = !!auth?.user;
      const mustCompleteSetup = (auth as any)?.mustCompleteSetup === true;
      const totpOk = (auth as any)?.totpVerified === true;
      const { pathname } = request.nextUrl;

      const onAuthPages =
        pathname.startsWith("/sign-in") ||
        pathname.startsWith("/verify") ||
        pathname.startsWith("/claim-account");

      if (!isAuthed && !onAuthPages) return false;

      if (isAuthed && pathname.startsWith("/dashboard")) {
        // Never-claimed accounts (placeholder login, no profile/TOTP yet)
        // go through the claim wizard first — it ends with the account in
        // the same state /verify would otherwise require.
        if (mustCompleteSetup) return Response.redirect(new URL("/claim-account", request.nextUrl));
        if (!totpOk) return Response.redirect(new URL("/verify", request.nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
