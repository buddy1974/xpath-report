"use client";

// X-PATH — starts the offline-queue sync loop once per app session
// (DL-055). Deliberately always mounted regardless of the sync banner's
// visibility (which hides on Dictate/Review) — sync itself must keep
// running everywhere, only the ambient notification hides.
import { useEffect } from "react";
import { initOfflineQueue } from "@/lib/offline-queue";

export function OfflineQueueInit() {
  useEffect(() => initOfflineQueue(), []);
  return null;
}
