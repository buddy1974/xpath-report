"use client";

/**
 * X-PATH — photo-to-text scan for the pathologist's own notes,
 * requisition forms, and specimen labels (Cowork addendum).
 * ------------------------------------------------------------------
 * Header G1 boundary, enforced structurally, not just by a UI label:
 * this uses Tesseract.js, a dedicated character-recognition engine —
 * it can only ever detect text-shaped glyphs and return them as a
 * string. It has no image-captioning or scene-description capability,
 * so unlike a general vision-capable LLM, it is architecturally
 * incapable of "interpreting" a photo of a slide or tissue even if
 * someone pointed the camera at one by mistake — it would either find
 * no text or garbage text, never a description of what it sees. This
 * is deliberately NOT built on the same OpenAI/Anthropic path used for
 * transcription/structuring, precisely to keep OCR and image
 * interpretation structurally separate capabilities.
 *
 * Runs entirely in the browser (dynamically imported so the ~2MB
 * engine never loads for pathologists who don't use this feature) —
 * the photo itself never leaves the device, never touches R2 or any
 * server of ours, and is discarded once text extraction finishes.
 * Precisely: Tesseract.js's own generic engine/language-model files
 * (no patient/user data, same fixed assets for every install) load
 * from its default CDN the first time this feature is used in a
 * session, same as any client-side library fetched at runtime — that
 * is a real network request, just never one carrying the photo or its
 * contents. Nothing patient-identifying is ever transmitted, so there
 * is nothing to pseudonymize.
 *
 * Extracted text is shown in a plain editable textarea with a copy
 * button — never written into any form field automatically (Header G1:
 * the pathologist reviews and chooses where it goes, same principle as
 * AI-suggested template fields always requiring human confirmation).
 */
import { useRef, useState } from "react";
import { STRINGS, t, type Locale } from "@/lib/i18n";

type Phase = "idle" | "processing" | "done" | "error";

export function OcrScan({ locale = "en" }: { locale?: Locale }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setPhase("processing");
    setCopied(false);
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const {
        data: { text: recognized },
      } = await worker.recognize(file);
      await worker.terminate();
      setText(recognized.trim());
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-petrol">{t(STRINGS.scanHeading, locale)}</h2>
      <p className="text-sm text-neutral-500 mt-1">{t(STRINGS.scanBody, locale)}</p>

      <label className="inline-block mt-4 rounded-lg border border-petrol text-petrol px-3.5 py-2 text-sm font-semibold hover:bg-petrol/5 transition-colors cursor-pointer min-h-[40px]">
        {phase === "processing" ? t(STRINGS.scanProcessing, locale) : t(STRINGS.scanChooseImage, locale)}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic"
          className="hidden"
          disabled={phase === "processing"}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </label>

      {phase === "error" && <p className="text-sm text-red-600 mt-2">{t(STRINGS.scanFailed, locale)}</p>}

      {phase === "done" && (
        <div className="mt-4">
          <label className="block text-xs font-semibold text-neutral-500 mb-1.5">{t(STRINGS.scanResultLabel, locale)}</label>
          {text ? (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-petrol focus:ring-1 focus:ring-petrol/30 outline-none"
              />
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(text);
                    setCopied(true);
                  }}
                  className="rounded-lg bg-petrol px-3.5 py-2 text-white text-sm font-semibold hover:bg-petrol-deep transition-colors min-h-[40px]"
                >
                  {copied ? t(STRINGS.scanCopiedConfirm, locale) : t(STRINGS.scanCopyButton, locale)}
                </button>
                <p className="text-xs text-neutral-400">{t(STRINGS.scanNeverAutoInserted, locale)}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-neutral-500">{t(STRINGS.scanNoTextFound, locale)}</p>
          )}
        </div>
      )}
    </div>
  );
}
