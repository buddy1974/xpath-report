"use server";

// X-PATH — shared dashboard-shell actions (DL-053). Sign-out moved out
// of layout.tsx's inline action so it can be imported directly into the
// client-side UserMenu component instead of threaded through as a prop.
import { signOut } from "@/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}
