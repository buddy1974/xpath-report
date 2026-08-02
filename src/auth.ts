/**
 * X-PATH — Auth.js (v5) full configuration (Node runtime)
 * ------------------------------------------------------------------
 * Credentials sign-in + authenticator-app TOTP as a second factor.
 * TOTP secrets are stored ENCRYPTED (lib/crypto.ts). No SMS (Header DL-008).
 *
 * This is the FULL config — it uses bcrypt and the Drizzle/Neon client,
 * both Node-only. It must only be imported from route handlers, server
 * actions, and server components — NEVER from middleware.ts (Edge
 * runtime). Middleware uses the edge-safe `auth.config.ts` instead.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;

        const rows = await db
          .select()
          .from(users)
          .where(and(eq(users.email, email), eq(users.isActive, true)))
          .limit(1);
        const user = rows[0];
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          // carried into the JWT for tenant scoping + 2FA gating
          tenantId: user.tenantId,
          role: user.role,
          totpEnabled: user.totpEnabled,
        } as any;
      },
    }),
  ],
});
