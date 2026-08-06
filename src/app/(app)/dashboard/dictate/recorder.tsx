"use client";

/**
 * X-PATH — dictation recorder (M4, rebuilt offline-first DL-055)
 * ------------------------------------------------------------------
 * Stopping a recording writes the audio to the local offline queue
 * (IndexedDB) IMMEDIATELY and shows "saved" — it never blocks on, or
 * risks losing data to, a network call (the single highest-priority
 * item from the offline-first research: X-PATH's real environment is
 * mobile data in Cameroon, not hospital-grade connectivity).
 *
 * Upload + transcription now happen entirely in the background
 * (lib/offline-queue.ts) — this is a deliberate behavior change from
 * the earlier version, which blocked on upload/transcribe in the same
 * screen and let the pathologist review/edit the transcript right
 * there. That review step now happens later, from the Workspace list,
 * once the item has actually synced (kind: "dictation", already
 * transcribed) — the pathologist can walk away right after stopping
 * the recording and come back whenever the transcript is ready,
 * online or not, in this session or a later one. Transcript
 * editing itself is unchanged (still always shown as AI-generated and
 * editable before saving — Header G1/G8).
 */
import { useRef, useState } from "react";
import { enqueueDictation } from "@/lib/offline-queue";
import { STRINGS, t, type Locale } from "@/lib/i18n";

type Phase = "idle" | "recording" | "saved" | "error";

export function Recorder({ locale = "en" }: { locale?: Locale }) {
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        void handleStopped(mimeType);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setPhase("recording");
    } catch {
      setError(t(STRINGS.micDenied, locale));
      setPhase("error");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function handleStopped(mimeType: string) {
    // Optimistic: write to the local queue and show "saved" immediately.
    // No network call in this function at all — enqueueDictation only
    // touches IndexedDB; upload/transcribe happen in the background.
    const blob = new Blob(chunksRef.current, { type: mimeType });
    try {
      await enqueueDictation(blob, mimeType, language);
      setPhase("saved");
    } catch {
      // IndexedDB itself failing (private-browsing storage limits, etc.)
      // is the one real "can't save at all" case — everything past this
      // point is a background concern, not a blocking one.
      setError(t(STRINGS.somethingWentWrong, locale));
      setPhase("error");
    }
  }

  const busy = phase === "recording";

  return (
    <div className="max-w-xl">
      <label className="text-sm font-semibold block mb-4">
        {t(STRINGS.languageLabel, locale)}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as "en" | "fr")}
          disabled={busy}
          className="ml-2 border border-neutral-300 rounded px-2 py-1 text-sm"
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </label>

      {(phase === "idle" || phase === "error" || phase === "saved") && (
        <button onClick={startRecording} className="rounded-md bg-petrol px-4 py-2 text-white text-sm font-semibold min-h-[44px]">
          {phase === "saved" ? t(STRINGS.recordAnother, locale) : t(STRINGS.startRecording, locale)}
        </button>
      )}

      {phase === "recording" && (
        <button onClick={stopRecording} className="rounded-md bg-red-600 px-4 py-2 text-white text-sm font-semibold min-h-[44px]">
          {t(STRINGS.stopRecording, locale)}
        </button>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {phase === "saved" && (
        <p className="mt-3 text-sm text-mint font-medium flex items-center gap-1.5">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
          </svg>
          {t(STRINGS.savedToWorkspace, locale)}
        </p>
      )}
    </div>
  );
}
