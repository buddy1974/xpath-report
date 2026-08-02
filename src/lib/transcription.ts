/**
 * X-PATH — Whisper transcription (Header §5: pseudonymize before any
 * external AI call)
 * ------------------------------------------------------------------
 * Only raw audio bytes are sent to OpenAI — no patient name, MRN, DOB,
 * or any other structured identifying field is ever attached to this
 * request. That satisfies the pseudonymization requirement for
 * everything X-PATH itself controls.
 *
 * What this does NOT solve: a pathologist could still speak a patient's
 * name out loud during dictation, and Whisper would transcribe it
 * verbatim — the audio itself isn't redacted before transcription (doing
 * that would require transcribing first, which defeats gating
 * transcription behind redaction). This is a real, open risk — tracked
 * in docs/known-risks.md, mitigated procedurally for now (pathologists
 * asked not to speak identifiers; the transcript is reviewed by the
 * pathologist before it's ever used) rather than technically solved.
 */

export async function transcribeAudio(
  bytes: Buffer,
  filename: string,
  language?: "en" | "fr",
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const form = new FormData();
  form.append("file", new Blob([bytes]), filename);
  form.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1");
  if (language) form.append("language", language);

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Whisper transcription failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as { text: string };
  return data.text;
}
