/**
 * X-PATH — NextAuth route handler (Node runtime)
 * Wires the Credentials provider (auth.ts) to /api/auth/*.
 */
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
