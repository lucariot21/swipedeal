import { cn } from "@/lib/utils";

type DealScoreBadgeProps = {
  score: number;
  heatLevel: "warm" | "hot" | "wild";
};

const labelMap = {
  warm: "Warm",
  hot: "Hot",
  wild: "Wild",
} as const;

const colorMap = {
  warm: "from-white/12 to-white/6 text-white/90",
  hot: "from-blue/20 to-lime/12 text-lime",
  wild: "from-orange/26 to-lime/12 text-orange",
} as const;

export function DealScoreBadge({ score, heatLevel }: DealScoreBadgeProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[22px] border border-white/10 bg-gradient-to-br px-3 py-2",
        colorMap[heatLevel],
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.24),transparent_70%)] opacity-40" />
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8 text-lg font-semibold">
          {score.toFixed(1)}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-white/55">
            Deal score
          </p>
          <p className="text-sm font-semibold">{labelMap[heatLevel]}</p>
        </div>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue via-lime to-orange"
          style={{ width: `${Math.min(score * 10, 100)}%` }}
        />
      </div>
    </div>
  );
}
