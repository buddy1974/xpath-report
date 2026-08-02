/**
 * X-PATH — Cloudflare Turnstile verification (server-side)
 * ------------------------------------------------------------------
 * Verified inside the Credentials provider's authorize() — the earliest
 * point X-PATH's own code runs before a password/DB check happens. Not
 * literally "before NextAuth's route handler runs" (we don't control a
 * pre-hook there for the built-in credentials callback endpoint), but
 * before any bcrypt/DB work — the same practical bot/credential-stuffing
 * mitigation the requirement is for.
 *
 * Inactive by design until CLOUDFLARE_TURNSTILE_SECRET_KEY is set — see
 * the 🔔 SIGNAL in docs/PROGRESS.md. Returns true (pass) when unconfigured
 * so it ships now without breaking already-verified login.
 */
export async function verifyTurnstile(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured yet — feature inactive

  if (!token) return false;

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token }),
  });
  if (!res.ok) return false;

  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}
