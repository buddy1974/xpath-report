/**
 * X-PATH — display accessibility preferences (DL-055)
 * ------------------------------------------------------------------
 * Font size + high contrast, applied as data attributes on <html> (see
 * globals.css) and persisted to localStorage — same pattern as the
 * onboarding checklist's client-only preference storage. Purely
 * presentational; no server round-trip, no per-user DB column, since
 * this is a device/browser display preference, not clinical data.
 */
export type FontSize = "normal" | "large" | "xlarge";

const FONT_SIZE_KEY = "xpath.fontSize";
const HIGH_CONTRAST_KEY = "xpath.highContrast";

export function getStoredFontSize(): FontSize {
  if (typeof window === "undefined") return "normal";
  const v = window.localStorage.getItem(FONT_SIZE_KEY);
  return v === "large" || v === "xlarge" ? v : "normal";
}

export function getStoredHighContrast(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(HIGH_CONTRAST_KEY) === "1";
}

export function applyFontSize(size: FontSize) {
  window.localStorage.setItem(FONT_SIZE_KEY, size);
  if (size === "normal") document.documentElement.removeAttribute("data-font-size");
  else document.documentElement.setAttribute("data-font-size", size);
}

export function applyHighContrast(enabled: boolean) {
  window.localStorage.setItem(HIGH_CONTRAST_KEY, enabled ? "1" : "0");
  if (enabled) document.documentElement.setAttribute("data-contrast", "high");
  else document.documentElement.removeAttribute("data-contrast");
}

/** Inlined verbatim into a <script> tag by AccessibilityInitScript — must stay dependency-free. */
export const ACCESSIBILITY_INIT_SCRIPT = `
(function () {
  try {
    var fs = localStorage.getItem("${FONT_SIZE_KEY}");
    if (fs === "large" || fs === "xlarge") document.documentElement.setAttribute("data-font-size", fs);
    var hc = localStorage.getItem("${HIGH_CONTRAST_KEY}");
    if (hc === "1") document.documentElement.setAttribute("data-contrast", "high");
  } catch (e) {}
})();
`;
