"use client";

/**
 * X-PATH — offline-first capture queue (DL-055, top-priority item)
 * ------------------------------------------------------------------
 * X-PATH's real environment (Cameroon, mobile data, intermittent
 * connectivity) doesn't match the hospital-grade-connectivity
 * assumption most reference systems bake in. This is the single
 * highest-value item from that research: stopping a recording or
 * saving a scanned note must NEVER block on — or be lost to — a
 * network call.
 *
 * Design, and two real constraints stated plainly rather than
 * overclaimed:
 *  - Every captured item is written to IndexedDB FIRST, synchronously
 *    with the UI showing "saved." All server communication (creating
 *    the workspace-item row, uploading audio, transcribing) happens
 *    afterward, in the background, retried with backoff+jitter.
 *  - The Web Background Sync API (sync continuing while the browser
 *    itself is fully closed) is NOT supported in Safari/iOS at all and
 *    only partially elsewhere — this module does not depend on it. The
 *    real guarantee is: nothing is lost (it's in IndexedDB), and sync
 *    resumes automatically the moment the app is open and online,
 *    which is the achievable, honest version of "offline-first" for a
 *    web app across the real device mix this lab will use.
 *  - There is no cross-browser Battery Status API anymore (removed for
 *    privacy reasons in most browsers). "Battery-aware" here means:
 *    exponential backoff (fewer wake-ups over time, not constant
 *    polling) and syncing only while the tab is open — not literal
 *    battery-level detection.
 *
 * Presigned R2 upload URLs expire in 5 minutes (lib/r2.ts) — far
 * shorter than a realistic offline gap — so a fresh URL is fetched
 * immediately before every upload attempt, never reused from an
 * earlier attempt (see actions.ts:getUploadUrl).
 */
import { openDB, type IDBPDatabase } from "idb";
import { createCapture, getUploadUrl, transcribeCapture, saveOcrNote } from "@/app/(app)/dashboard/dictate/actions";

export type QueueStatus = "queued" | "syncing" | "failed" | "done";
export type QueueStep = "create" | "upload" | "transcribe" | "save";

export interface QueueItem {
  localId: string;
  kind: "dictation" | "note";
  createdAt: number;
  status: QueueStatus;
  step: QueueStep;
  attempts: number;
  firstAttemptAt: number | null;
  lastAttemptAt: number | null;
  nextRetryAt: number | null;
  lastError: string | null; // always plain-language — never raw HTTP/network text
  // dictation-only
  language?: "en" | "fr";
  mimeType?: string;
  blob?: Blob;
  serverItemId?: string;
  // note-only
  text?: string;
}

const DB_NAME = "xpath-offline-queue";
const STORE = "captures";
const MAX_ATTEMPTS = 10;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const BASE_DELAY_MS = 5_000;
const MAX_DELAY_MS = 5 * 60_000;

const CHANGE_EVENT = "xpath-queue-changed";

function notifyChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function onQueueChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

let dbPromise: Promise<IDBPDatabase> | null = null;
function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "localId" });
        }
      },
    });
  }
  return dbPromise;
}

async function putItem(item: QueueItem): Promise<void> {
  const db = await getDb();
  await db.put(STORE, item);
  notifyChanged();
}

async function deleteItem(localId: string): Promise<void> {
  const db = await getDb();
  await db.delete(STORE, localId);
  notifyChanged();
}

/** All non-"done" items, most recent first — for UI display. */
export async function listQueueItems(): Promise<QueueItem[]> {
  const db = await getDb();
  const all = (await db.getAll(STORE)) as QueueItem[];
  return all.filter((i) => i.status !== "done").sort((a, b) => b.createdAt - a.createdAt);
}

function randomId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function enqueueDictation(blob: Blob, mimeType: string, language: "en" | "fr"): Promise<string> {
  const localId = randomId();
  const item: QueueItem = {
    localId,
    kind: "dictation",
    createdAt: Date.now(),
    status: "queued",
    step: "create",
    attempts: 0,
    firstAttemptAt: null,
    lastAttemptAt: null,
    nextRetryAt: 0,
    lastError: null,
    language,
    mimeType,
    blob,
  };
  await putItem(item);
  void runSync();
  return localId;
}

export async function enqueueNote(text: string): Promise<string> {
  const localId = randomId();
  const item: QueueItem = {
    localId,
    kind: "note",
    createdAt: Date.now(),
    status: "queued",
    step: "save",
    attempts: 0,
    firstAttemptAt: null,
    lastAttemptAt: null,
    nextRetryAt: 0,
    lastError: null,
    text,
  };
  await putItem(item);
  void runSync();
  return localId;
}

/** Resets a FAILED item back to queued and syncs immediately — the
 * one-tap retry the UX spec calls for. */
export async function retryItem(localId: string): Promise<void> {
  const db = await getDb();
  const item = (await db.get(STORE, localId)) as QueueItem | undefined;
  if (!item) return;
  item.status = "queued";
  item.attempts = 0;
  item.firstAttemptAt = null;
  item.nextRetryAt = 0;
  item.lastError = null;
  await putItem(item);
  void runSync();
}

type ErrorClass = "transient" | "permanent" | "auth";

function classifyError(e: unknown, httpStatus?: number): ErrorClass {
  if (httpStatus != null) {
    if (httpStatus >= 500 || httpStatus === 408 || httpStatus === 429) return "transient";
    if (httpStatus === 401 || httpStatus === 403) return "auth";
    if (httpStatus >= 400) return "permanent";
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) return "transient";
  const message = e instanceof Error ? e.message : String(e);
  if (/not authenticated/i.test(message)) return "auth";
  if (/fetch failed|failed to fetch|network|timeout/i.test(message)) return "transient";
  // Default to transient — for a medical app, retrying too much is far
  // safer than giving up on real data too early (Header: never lose
  // the underlying dictation/scan data regardless of upload state).
  return "transient";
}

function plainLanguageError(cls: ErrorClass): string {
  if (cls === "auth") return "Sign-in expired. Sign in again, then this will finish saving automatically.";
  if (cls === "permanent") return "This item couldn't be saved. Tap retry, or contact support if it keeps happening.";
  return "Waiting for a better connection to finish saving.";
}

function backoffDelay(attempts: number): number {
  const base = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** attempts);
  const jitter = base * (0.8 + Math.random() * 0.4); // ±20%
  return jitter;
}

async function processDictation(item: QueueItem): Promise<void> {
  if (item.step === "create") {
    const { itemId } = await createCapture(item.language!, item.mimeType!);
    item.serverItemId = itemId;
    item.step = "upload";
    await putItem(item);
  }
  if (item.step === "upload") {
    const { uploadUrl } = await getUploadUrl(item.serverItemId!, item.mimeType!);
    const res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": item.mimeType! }, body: item.blob });
    if (!res.ok) {
      const cls = classifyError(null, res.status);
      throw Object.assign(new Error(`Upload failed (${res.status})`), { cls });
    }
    item.step = "transcribe";
    await putItem(item);
  }
  if (item.step === "transcribe") {
    await transcribeCapture(item.serverItemId!);
  }
}

async function processNote(item: QueueItem): Promise<void> {
  await saveOcrNote(item.text!);
}

let syncing = false;
let syncTimer: ReturnType<typeof setTimeout> | null = null;

/** Processes every due item once. Safe to call concurrently — reentrant
 * calls no-op while a pass is already running. */
export async function runSync(): Promise<void> {
  if (syncing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    scheduleNextPass();
    return;
  }
  syncing = true;
  try {
    const db = await getDb();
    const all = (await db.getAll(STORE)) as QueueItem[];
    const now = Date.now();
    for (const item of all) {
      if (item.status === "done" || item.status === "failed") continue;
      if (item.status === "syncing") continue;
      if (item.nextRetryAt && item.nextRetryAt > now) continue;

      item.status = "syncing";
      item.attempts += 1;
      item.lastAttemptAt = now;
      if (!item.firstAttemptAt) item.firstAttemptAt = now;
      await putItem(item);

      try {
        if (item.kind === "dictation") await processDictation(item);
        else await processNote(item);

        item.status = "done";
        item.lastError = null;
        await putItem(item);
        // Fully synced server-side now — the Workspace page's normal
        // DB query will show it; no reason to keep it in the local
        // queue too (would otherwise double-render or grow unbounded).
        await deleteItem(item.localId);
      } catch (e) {
        const cls: ErrorClass = (e as any)?.cls ?? classifyError(e);
        const tooOld = item.firstAttemptAt != null && now - item.firstAttemptAt > MAX_AGE_MS;
        const tooManyAttempts = item.attempts >= MAX_ATTEMPTS;
        const givingUp = cls === "permanent" || tooOld || tooManyAttempts;

        item.lastError = plainLanguageError(cls);
        if (givingUp) {
          item.status = "failed";
          item.nextRetryAt = null;
        } else {
          item.status = "queued";
          item.nextRetryAt = Date.now() + backoffDelay(item.attempts);
        }
        await putItem(item);
      }
    }
  } finally {
    syncing = false;
  }
  scheduleNextPass();
}

function scheduleNextPass() {
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => void runSync(), BASE_DELAY_MS);
}

/** The manual "force sync" affordance — bypasses backoff timers for
 * every queued/failed item (failed items are NOT auto-retried by
 * runSync, so force-sync also resets them to queued first). */
export async function forceSyncAll(): Promise<void> {
  const db = await getDb();
  const all = (await db.getAll(STORE)) as QueueItem[];
  for (const item of all) {
    if (item.status === "failed") {
      item.status = "queued";
      item.attempts = 0;
      item.nextRetryAt = 0;
    } else if (item.status === "queued") {
      item.nextRetryAt = 0;
    }
  }
  await Promise.all(all.map((i) => putItem(i)));
  await runSync();
}

/** Call once, near app start (dashboard layout), to begin the
 * background sync loop and react to connectivity changes. */
export function initOfflineQueue(): () => void {
  if (typeof window === "undefined") return () => {};
  const onOnline = () => void runSync();
  window.addEventListener("online", onOnline);
  void runSync();
  return () => window.removeEventListener("online", onOnline);
}
