"use client";

// X-PATH — registers the app-shell service worker (public/sw.js).
// Renders nothing; fire-and-forget on mount, same pattern as
// offline-queue-init.tsx's always-mounted init effect.
import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Non-fatal — the app works fully without it, just without the
      // install-ability/asset-caching benefit.
    });
  }, []);

  return null;
}
