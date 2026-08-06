"use client";

import { useEffect, useState } from "react";
import { listQueueItems, onQueueChanged, type QueueItem } from "./offline-queue";

/** Live view of the offline queue — re-reads on every queue change
 * (item added, status change, sync completion). */
export function useSyncQueue(): QueueItem[] {
  const [items, setItems] = useState<QueueItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      void listQueueItems().then((next) => {
        if (!cancelled) setItems(next);
      });
    };
    refresh();
    const unsubscribe = onQueueChanged(refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return items;
}
