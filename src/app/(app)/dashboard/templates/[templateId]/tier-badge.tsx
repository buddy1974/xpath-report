import type { FieldTier } from "@/lib/templates";

const STYLES: Record<FieldTier, string> = {
  core: "bg-petrol/10 text-petrol",
  conditional: "bg-amber-100 text-amber-700",
  "non-core": "bg-neutral-100 text-neutral-500",
};

export function TierBadge({ tier }: { tier: FieldTier }) {
  return <span className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${STYLES[tier]}`}>{tier}</span>;
}
