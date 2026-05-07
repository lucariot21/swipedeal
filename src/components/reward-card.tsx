import { LockKeyhole, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Deal, RewardTier } from "@/types/deal";

type RewardCardProps = {
  reward: RewardTier;
  points: number;
  onInspect: () => void;
  linkedDeal: Deal | null;
  onWatchDeal: (dealId: number) => void;
};

export function RewardCard({
  reward,
  points,
  onInspect,
  linkedDeal,
  onWatchDeal,
}: RewardCardProps) {
  const unlocked = points >= reward.threshold;
  const previousThreshold =
    reward.threshold === 25 ? 0 : reward.threshold === 50 ? 25 : 50;
  const progress = Math.min(
    100,
    Math.max(
      0,
      ((points - previousThreshold) / (reward.threshold - previousThreshold || 1)) * 100,
    ),
  );

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[24px] border p-4 text-left",
        unlocked
          ? "reward-shimmer border-white/10 bg-white/[0.05]"
          : "border-white/8 bg-white/[0.03]",
      )}
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(circle at top, ${reward.accent}18, transparent 28%), radial-gradient(circle at 78% 82%, ${reward.glow}12, transparent 18%)`,
        }}
      />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/45">
              Unlock at {reward.threshold} pts
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-white">
              {reward.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/66">{reward.subtitle}</p>
          </div>
          <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-[18px] border",
              unlocked ? "border-lime/24 bg-lime/10" : "border-white/8 bg-white/[0.04]",
              )}
            >
            {unlocked ? (
              <Sparkles className="h-5 w-5 text-lime" />
            ) : (
              <LockKeyhole className="h-5 w-5 text-white/55" />
            )}
          </div>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#3AA7FF_0%,#D7FF57_60%,#FF7A18_100%)]"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-white/48">
          <span>{reward.sponsor}</span>
          <span>{unlocked ? "Unlocked" : `${Math.max(reward.threshold - points, 0)} pts left`}</span>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            className="flex-1 rounded-[16px] bg-white/[0.06] px-4 py-3 text-sm font-medium text-white/78"
            onClick={onInspect}
            type="button"
          >
            Reward details
          </button>
          {linkedDeal ? (
            <button
              className="flex-1 rounded-[16px] bg-[linear-gradient(120deg,#d7ff57_0%,#bff56a_100%)] px-4 py-3 text-sm font-semibold text-black"
              onClick={() => onWatchDeal(linkedDeal.id)}
              type="button"
            >
              View sponsor drop
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
