import { redirect } from "next/navigation";

// The capture/dictate screen now lives at /dashboard itself for
// pathologists (DL-043) — this route just keeps old links/bookmarks
// working rather than 404ing.
export default function DictatePageRedirect() {
  redirect("/dashboard");
}
