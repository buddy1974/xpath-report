"use client";

// X-PATH — persistent, always-reachable Dictate CTA (DL-051, Marcel's
// decision: a full-width bar fixed to the bottom of the screen, not a
// floating action button). Dictation is the app's core purpose — this
// makes it reachable without scrolling from every screen except:
//  - /dashboard/dictate itself (redundant — already there)
//  - /dashboard/review/* (that screen has its own fixed bottom bar,
//    review-form.tsx:512 — stacking two fixed bottom bars would collide)
// Safe-area bottom padding added (DL-053) so it clears the home
// indicator on notched devices instead of rendering flush against it.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { STRINGS, t, type Locale } from "@/lib/i18n";

export function DictateCtaBar({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const hidden = pathname.startsWith("/dashboard/dictate") || pathname.startsWith("/dashboard/review");
  if (hidden) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-neutral-200 bg-white/95 backdrop-blur px-4 pt-3 sm:hidden"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
    >
      <Link
        href="/dashboard/dictate"
        className="flex items-center justify-center gap-2 w-full rounded-xl bg-petrol py-3.5 text-white font-semibold shadow-sm hover:bg-petrol-deep transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M10 2a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M5.5 9.5a.75.75 0 0 1 .75.75v.5a3.75 3.75 0 1 0 7.5 0v-.5a.75.75 0 0 1 1.5 0v.5a5.25 5.25 0 0 1-4.5 5.197V17.5h2a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1 0-1.5h2v-1.553A5.25 5.25 0 0 1 4.75 10.75v-.5a.75.75 0 0 1 .75-.75Z" />
        </svg>
        {t(STRINGS.dictateCtaBarLabel, locale)}
      </Link>
    </div>
  );
}
