import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AccessibilityInitScript } from "@/components/accessibility-init-script";
import { RegisterServiceWorker } from "@/components/register-service-worker";

export const metadata: Metadata = {
  title: "X-PATH",
  description: "Structured pathology reporting — xpath.report",
  // Installable-PWA pass — manifest + iOS-specific tags. iOS ignores
  // manifest.json's icons/theme_color entirely and needs these
  // explicitly (apple-touch-icon, apple-mobile-web-app-*).
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    // black-translucent lets content extend under the status bar —
    // pairs with the safe-area-inset padding already built for the
    // floating avatar/Dictate CTA bar (DL-053).
    statusBarStyle: "black-translucent",
    title: "X-PATH",
  },
};

// viewport-fit=cover (DL-053): without this, env(safe-area-inset-*)
// resolves to 0 on notched/home-indicator devices — the fixed avatar
// and Dictate CTA bar would render right up against (or under) the
// notch/home indicator instead of respecting it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0E4B54",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Next's typed `appleWebApp.capable` metadata only emits the
            newer standardized "mobile-web-app-capable" tag — iOS
            Safari still only recognizes the legacy Apple-prefixed one
            (confirmed live: Chrome DevTools showed the standardized
            tag present but this one absent). Both needed for real
            standalone-mode support across iOS + Android/Chrome. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <AccessibilityInitScript />
      </head>
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
