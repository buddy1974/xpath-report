/**
 * X-PATH — middleware (Edge runtime)
 * Gates the app: authenticated + TOTP-verified for /dashboard and beyond.
 * (Header G1/G2: no unauthenticated or un-verified access to clinical shell.)
 *
 * Uses the edge-safe `auth.config.ts` only — no bcrypt, no DB client here.
 * The route-gating logic itself lives in `authConfig.callbacks.authorized`
 * so it is exercised identically wherever NextAuth evaluates a session.
 */
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const { auth: middleware } = NextAuth(authConfig);
export default middleware;

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/verify"],
};
