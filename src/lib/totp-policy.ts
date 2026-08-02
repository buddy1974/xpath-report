/**
 * X-PATH — TOTP lockout policy (docs/security-checklist.md: rate limiting
 * on /api/auth/*). Shared between the verify route (enforcement) and the
 * verify page (user-facing copy) so the numbers can't drift apart.
 */
export const MAX_FAILED_TOTP_ATTEMPTS = 5;
export const TOTP_LOCKOUT_MINUTES = 15;
