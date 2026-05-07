import { Sparkles } from "lucide-react";

type SponsoredBadgeProps = {
  label: string;
};

export function SponsoredBadge({ label }: SponsoredBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-blue/18 bg-blue/8 px-3 py-1 text-[11px] font-medium text-white/78">
      <Sparkles className="h-3.5 w-3.5" />
      <span>Sponsored · {label}</span>
    </div>
  );
}
