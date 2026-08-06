import { ACCESSIBILITY_INIT_SCRIPT } from "@/lib/accessibility";

/** Runs before paint so a returning user's font-size/contrast choice never flashes unstyled. */
export function AccessibilityInitScript() {
  return <script dangerouslySetInnerHTML={{ __html: ACCESSIBILITY_INIT_SCRIPT }} />;
}
