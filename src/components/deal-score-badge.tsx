import { cn } from "@/lib/utils";

type DealScoreBadgeProps = {
  score: number;
  heatLevel: "warm" | "hot" | "wild";
};

const labelMap = {
  warm: "Steady",
  hot: "Hot",
  wild: "Peak",
} as const;

const colorMap = {
  warm: "bg-white/[0.04] text-white/90",
  hot: "bg-blue/10 text-white",
  wild: "bg-orange/10 text-white",
} as const;

export function DealScoreBadge({ score, heatLevel }: DealScoreBadgeProps) {
  return (
    <div
      className={cn(
        "max-w-[108px] shrink-0 rounded-[18px] border border-white/8 px-2.5 py-2",
        colorMap[heatLevel],
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-black/20 text-base font-semibold">
          {score.toFixed(1)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] uppercase tracking-[0.18em] text-white/45">
            Deal score
          </p>
          <p className="text-sm font-semibold">{labelMap[heatLevel]}</p>
        </div>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-lime to-blue"
          style={{ width: `${Math.min(score * 10, 100)}%` }}
        />
      </div>
    </div>
  );
}
