"use client";

// X-PATH — editable transcript before choosing a template (DL-055).
// Recorder no longer blocks on transcription in the same screen (it's
// offline-first now — see recorder.tsx), so correcting a Whisper
// mis-transcription moved here, the first screen that actually shows
// the finished transcript. Same capability as before, relocated, not
// removed (Header G1/G8: AI-generated text is always human-reviewable
// before it feeds structuring).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveTranscriptEdit } from "../../dictate/actions";
import { STRINGS, t, type Locale } from "@/lib/i18n";

export function TranscriptEditor({
  dictationId,
  initialText,
  locale,
}: {
  dictationId: string;
  initialText: string;
  locale: Locale;
}) {
  const router = useRouter();
  const [text, setText] = useState(initialText);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="font-semibold text-xs uppercase tracking-wide text-neutral-400 mb-1">
        {t(STRINGS.transcriptSectionLabel, locale)}
      </p>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setSaved(false);
        }}
        rows={8}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-700 focus:border-petrol focus:ring-1 focus:ring-petrol/30 outline-none"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          disabled={saving || text === initialText}
          onClick={async () => {
            setSaving(true);
            await saveTranscriptEdit(dictationId, text);
            setSaving(false);
            setSaved(true);
            router.refresh(); // re-suggests templates from the corrected text too
          }}
          className="rounded-lg bg-petrol px-3.5 py-2 text-white text-sm font-semibold hover:bg-petrol-deep transition-colors min-h-[40px] disabled:opacity-50"
        >
          {t(STRINGS.saveButton, locale)}
        </button>
        {saved && <span className="text-sm text-mint font-medium">{t(STRINGS.savedMessage, locale)}</span>}
      </div>
    </div>
  );
}
