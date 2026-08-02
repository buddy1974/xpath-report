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
        token.totpVerified = false; // set true by /api/auth/verify-totp
      }
      // Set via unstable_update({ totpVerified: true }) from
      // /api/auth/verify-totp after a correct TOTP code.
      if (trigger === "update" && (session as any)?.totpVerified) {
        token.totpVerified = true;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.sub;
      (session as any).tenantId = token.tenantId;
      (session as any).role = token.role;
      (session as any).totpVerified = token.totpVerified ?? false;
      return session;
    },
    authorized({ auth, request }) {
      const isAuthed = !!auth?.user;
      const totpOk = (auth as any)?.totpVerified === true;
      const { pathname } = request.nextUrl;

      const onAuthPages =
        pathname.startsWith("/sign-in") || pathname.startsWith("/verify");

      if (!isAuthed && !onAuthPages) return false;
      if (isAuthed && !totpOk && pathname.startsWith("/dashboard")) {
        return Response.redirect(new URL("/verify", request.nextUrl));
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
