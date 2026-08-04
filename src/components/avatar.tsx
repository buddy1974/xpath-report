"use client";

// X-PATH — shows the user's uploaded profile picture if one exists,
// falling back to the existing gradient-initial badge otherwise. Tries
// /api/avatar/me and swaps to the fallback on error (404 = no upload
// yet) rather than needing avatarKey threaded through the session/JWT.
import { useState } from "react";

export function Avatar({ label, size = 32, refreshKey }: { label: string; size?: number; refreshKey?: number }) {
  const [failed, setFailed] = useState(false);
  const initial = (label || "?").trim().slice(0, 1).toUpperCase();

  if (failed) {
    return (
      <span
        className="rounded-xl bg-gradient-to-br from-eosin to-hema shadow-sm flex items-center justify-center text-white font-bold shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.42 }}
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/api/avatar/me${refreshKey ? `?v=${refreshKey}` : ""}`}
      alt=""
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="rounded-xl object-cover shadow-sm shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
