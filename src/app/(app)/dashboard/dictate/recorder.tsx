"use client";

/**
 * X-PATH — dictation recorder (M4)
 * ------------------------------------------------------------------
 * Record -> upload direct to R2 (presigned URL, not through the
 * serverless function) -> transcribe -> pathologist reviews/edits ->
 * save to the private workspace. Transcript is always shown as
 * AI-generated and editable before saving (Header G1/G8 — AI content
 * visibly marked, human validates, never silently trusted).
 */
import { useRef, useState } from "react";
import { createCapture, transcribeCapture, saveTranscriptEdit } from "./actions";

type Phase = "idle" | "recording" | "uploading" | "transcribing" | "editing" | "saved" | "error";

export function Recorder() {
  const [language, setLanguage] = useState<"en" | "fr">("en");
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [itemId, setItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setError(null);
    setTranscript("");
    setItemId(null);
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
      setError("Microphone access denied or unavailable.");
      setPhase("error");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  async function handleStopped(mimeType: string) {
    setPhase("uploading");
    try {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const { itemId: newItemId, uploadUrl } = await createCapture(language, mimeType);
      setItemId(newItemId);

      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
        body: blob,
      });
      if (!putRes.ok) throw new Error("Upload to storage failed.");

      setPhase("transcribing");
      const { text } = await transcribeCapture(newItemId);
      setTranscript(text);
      setPhase("editing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPhase("error");
    }
  }

  async function save() {
    if (!itemId) return;
    await saveTranscriptEdit(itemId, transcript);
    setPhase("saved");
  }

  const busy = phase === "recording" || phase === "uploading" || phase === "transcribing";

  return (
    <div className="max-w-xl">
      <label className="text-sm font-semibold block mb-4">
        Language
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
        <button onClick={startRecording} className="rounded-md bg-petrol px-4 py-2 text-white text-sm font-semibold">
          {phase === "saved" ? "Record another" : "Start recording"}
        </button>
      )}

      {phase === "recording" && (
        <button onClick={stopRecording} className="rounded-md bg-red-600 px-4 py-2 text-white text-sm font-semibold">
          Stop recording
        </button>
      )}

      {(phase === "uploading" || phase === "transcribing") && (
        <p className="text-sm text-neutral-500">{phase === "uploading" ? "Uploading…" : "Transcribing…"}</p>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      {(phase === "editing" || phase === "saved") && (
        <div className="mt-4">
          <label className="block text-sm font-semibold mb-1">
            Transcript{" "}
            <span className="text-neutral-400 font-normal">— AI-generated, review and correct before saving</span>
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={10}
            className="w-full border border-neutral-300 rounded-md p-3 text-sm"
          />
          <button onClick={save} className="mt-2 rounded-md bg-petrol px-4 py-2 text-white text-sm font-semibold">
            Save
          </button>
          {phase === "saved" && <span className="ml-3 text-sm text-green-700">Saved to your private workspace.</span>}
        </div>
      )}
    </div>
  );
}
