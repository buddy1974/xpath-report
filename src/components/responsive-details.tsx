"use client";

// X-PATH — desktop-parity pass (DL-060). Wraps the standing
// progressive-disclosure `<details>` pattern (DL-053/055) so a section
// that's deliberately collapsed-by-default on mobile (screen space is
// scarce) opens by default on lg+ screens (screen space isn't) — still
// a real, user-toggleable `<details>` either way, this only sets the
// initial state. Native `<details>` has no CSS-only way to vary its
// open/closed default by breakpoint, hence the small client wrapper.
import { useEffect, useRef } from "react";

export function ResponsiveDetails({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      el.open = mq.matches;
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <details ref={ref} className={className}>
      {children}
    </details>
  );
}
