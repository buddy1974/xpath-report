/**
 * X-PATH — transcript -> template structuring engine (M5)
 * ------------------------------------------------------------------
 * Maps a dictation transcript onto a confirmed template's fields.
 * Never fabricates (Header G8): the model is instructed to fill a field
 * only when the transcript explicitly supports it, and must supply a
 * verbatim quote grounding every value it returns. That quote is then
 * checked against the actual transcript text server-side — a field
 * whose quote doesn't really appear in the transcript is dropped, not
 * trusted. Every returned path/option is also validated against the
 * template's own flattened field list (lib/templates/flatten.ts) — a
 * path or option key the model invents is rejected, not stored.
 *
 * AI_STRUCTURING_PROVIDER selects OpenAI or Anthropic (Header §8 stack:
 * "AI structuring swappable OpenAI/Anthropic, transcription stays
 * OpenAI-only"). Both are called via bare fetch, matching how
 * lib/transcription.ts calls Whisper — no new SDK dependency for a
 * single JSON endpoint.
 */
import type { FlatField } from "./templates/flatten";

export interface StructuredFieldValue {
  path: string;
  value: string | string[];
  quote: string;
}

const INSTRUCTIONS = `You are extracting structured field values from a pathologist's own dictation transcript, for a pathology report template.

Rules — follow exactly:
1. Only fill a field if the transcript EXPLICITLY and unambiguously supports a specific value. If you are not certain, leave it out entirely.
2. Never infer, guess, or fill in a value the pathologist did not actually say.
3. For single-select and multi-select fields, choose only from the exact "key" values given in that field's options — never invent a new key. For multi-select, return an array of keys.
4. For text/number fields, return the value as a plain string.
5. For every field you fill, include "quote": a short, word-for-word excerpt copied exactly from the transcript that grounds your answer.
6. Return ONLY a JSON object of the shape { "fields": [ { "path": "...", "value": "..." | ["...","..."], "quote": "..." } ] }. No commentary, no markdown fences.`;

function buildPrompt(transcript: string, fields: FlatField[]): string {
  const fieldSpec = fields.map((f) => ({
    path: f.path,
    label: f.label,
    type: f.type,
    options: f.options,
  }));
  return `TRANSCRIPT:\n"""\n${transcript}\n"""\n\nFILLABLE FIELDS (JSON):\n${JSON.stringify(fieldSpec)}\n\nReturn the JSON object described in the instructions.`;
}

async function callOpenAI(transcript: string, fields: FlatField[]): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: INSTRUCTIONS },
        { role: "user", content: buildPrompt(transcript, fields) },
      ],
      temperature: 0,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI structuring call failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

async function callAnthropic(transcript: string, fields: FlatField[]): Promise<any> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  const model = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: INSTRUCTIONS,
      messages: [{ role: "user", content: buildPrompt(transcript, fields) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic structuring call failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  const text = data.content?.[0]?.text ?? "{}";
  // Strip markdown fences defensively, in case the model wraps the JSON anyway.
  const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/```$/, "");
  return JSON.parse(cleaned);
}

/**
 * Returns only field values that (a) reference a real field path, (b)
 * for select fields, reference a real option key, and (c) whose quote
 * genuinely appears in the transcript. Anything else is dropped, not
 * surfaced as a guess.
 */
export function validateAndGround(
  raw: any,
  fields: FlatField[],
  transcript: string,
): StructuredFieldValue[] {
  const byPath = new Map(fields.map((f) => [f.path, f]));
  const normalizedTranscript = transcript.toLowerCase();
  const out: StructuredFieldValue[] = [];

  const rawFields = Array.isArray(raw?.fields) ? raw.fields : [];
  for (const item of rawFields) {
    const field = byPath.get(item?.path);
    if (!field) continue; // invented a path — reject

    const quote = String(item?.quote ?? "").trim();
    if (!quote || !normalizedTranscript.includes(quote.toLowerCase())) continue; // ungrounded — reject

    if (field.type === "single-select" || field.type === "multi-select") {
      const validKeys = new Set((field.options ?? []).map((o) => o.key));
      const values = Array.isArray(item.value) ? item.value : [item.value];
      const filtered = values.filter((v: unknown) => typeof v === "string" && validKeys.has(v));
      if (filtered.length === 0) continue; // invented an option key — reject
      out.push({ path: field.path, value: field.type === "multi-select" ? filtered : filtered[0], quote });
    } else {
      if (typeof item.value !== "string" || !item.value.trim()) continue;
      out.push({ path: field.path, value: item.value, quote });
    }
  }

  return out;
}

export async function structureTranscript(
  transcript: string,
  fields: FlatField[],
): Promise<StructuredFieldValue[]> {
  const provider = process.env.AI_STRUCTURING_PROVIDER || "openai";
  const raw = provider === "anthropic" ? await callAnthropic(transcript, fields) : await callOpenAI(transcript, fields);
  return validateAndGround(raw, fields, transcript);
}
