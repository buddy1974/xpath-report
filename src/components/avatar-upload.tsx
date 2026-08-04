"use client";

// X-PATH — profile picture upload: FormData -> Server Action -> server-
// side R2 PUT (see profile/actions.ts:uploadAvatar for why this isn't a
// direct browser-to-R2 presigned PUT — R-036). Refreshes the Avatar
// preview by bumping a cache-busting query param rather than a full
// page reload.
import { useState } from "react";
import { uploadAvatar } from "@/app/(app)/dashboard/profile/actions";
import { Avatar } from "./avatar";
import { STRINGS, t, type Locale } from "@/lib/i18n";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

export function AvatarUpload({ label, locale = "en" }: { label: string; locale?: Locale }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  async function handleFile(file: File) {
    setError(null);
    if (!ALLOWED.has(file.type) || file.size > MAX_BYTES) {
      setError(t(STRINGS.avatarUploadFailed, locale));
      return;
    }
    setBusy(true);
    try {
      const formData = new FormData();
      formData.set("avatar", file);
      await uploadAvatar(formData);
      setRefreshKey((k) => k + 1);
    } catch {
      setError(t(STRINGS.avatarUploadFailed, locale));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar label={label} size={56} refreshKey={refreshKey} />
      <div>
        <label className="inline-block rounded-lg border border-petrol text-petrol px-3.5 py-2 text-sm font-semibold hover:bg-petrol/5 transition-colors cursor-pointer min-h-[40px]">
          {busy ? t(STRINGS.avatarUploading, locale) : t(STRINGS.avatarChangePhoto, locale)}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
              e.target.value = "";
            }}
          />
        </label>
        {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
      </div>
    </div>
  );
}
