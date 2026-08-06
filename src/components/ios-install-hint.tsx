"use client";

// X-PATH — installable-PWA pass. iOS Safari fires no
// `beforeinstallprompt` event (see lib/use-pwa-install.ts for the
// Android/Chrome path) — the only way to "install" there is the
// manual Share -> Add to Home Screen flow, so this is a one-time,
// dismissible explainer instead of a real install button. Same
// per-device localStorage-dismiss pattern as the announcement ticker
// (DL-054) — inline, not fixed-positioned, so it can never collide
// with the pathologist's bottom-fixed Dictate CTA bar.
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { STRINGS, t, type Locale } from "@/lib/i18n";

const STORAGE_KEY = "xpath.iosInstallHintDismissed";

function isIos(): boolean {
  const ua = navigator.userAgent;
  const isAppleTouch = /iPad|iPhone|iPod/.test(ua);
  const isIpadOsDesktopUa = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return isAppleTouch || isIpadOsDesktopUa;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
  );
}

export function IosInstallHint({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    if (!isIos() || isStandalone()) return;
    setShow(true);
  }, []);

  // Same standing carve-out as the Dictate CTA bar/avatar/ticker
  // (DL-051/053/054/055).
  const hidden =
    pathname.startsWith("/dashboard/dictate") ||
    pathname.startsWith("/dashboard/review") ||
    pathname.startsWith("/dashboard/structure");
  if (!show || hidden) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  };

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-petrol/20 bg-petrol/5 p-4 mb-6">
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 mt-0.5 text-petrol">
        <path d="M10 2a.75.75 0 0 1 .75.75v8.69l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 1 1 1.06-1.06l2.22 2.22V2.75A.75.75 0 0 1 10 2Z" />
        <path d="M4.5 12.75a.75.75 0 0 0-1.5 0v3A2.75 2.75 0 0 0 5.75 18.5h8.5A2.75 2.75 0 0 0 17 15.75v-3a.75.75 0 0 0-1.5 0v3c0 .69-.56 1.25-1.25 1.25h-8.5c-.69 0-1.25-.56-1.25-1.25v-3Z" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-petrol">{t(STRINGS.iosInstallHintTitle, locale)}</p>
        <p className="text-sm text-neutral-600 mt-1">{t(STRINGS.iosInstallHintBody, locale)}</p>
        <button
          type="button"
          onClick={dismiss}
          className="mt-2 text-sm font-semibold text-petrol min-h-[44px]"
        >
          {t(STRINGS.iosInstallHintDismiss, locale)}
        </button>
      </div>
    </div>
  );
}
