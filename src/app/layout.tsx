import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "X-PATH",
  description: "Structured pathology reporting — xpath.report",
};

// viewport-fit=cover (DL-053): without this, env(safe-area-inset-*)
// resolves to 0 on notched/home-indicator devices — the fixed avatar
// and Dictate CTA bar would render right up against (or under) the
// notch/home indicator instead of respecting it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
