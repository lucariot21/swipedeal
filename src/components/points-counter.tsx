"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import type { RewardTier } from "@/types/deal";

type PointsCounterProps = {
  points: number;
  streak: number;
  pulseKey: number;
  nextReward?: RewardTier;
};

export function PointsCounter({
  points,
  streak,
  pulseKey,
  nextReward,
}: PointsCounterProps) {
  const nextRewardLabel = nextReward
    ? nextReward.threshold === 25
      ? "5% code"
      : nextReward.threshold === 50
        ? "Early access"
        : "Mystery drop"
    : "Complete";
  const previousThreshold = nextReward
    ? nextReward.threshold === 25
      ? 0
      : nextReward.threshold === 50
        ? 25
        : 50
    : 100;
  const progress = nextReward
    ? Math.min(
        100,
        ((points - previousThreshold) /
          (nextReward.threshold - previousThreshold || 1)) *
          100,
      )
    : 100;

  return (
    <div className="glass-panel overflow-hidden rounded-[22px] px-4 py-3">
      <div className="flex items-end justify-between gap-4">
        <div className="relative min-w-0">
          <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-white/42">
            <Zap className="h-3.5 w-3.5 text-lime" />
            Score
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[30px] font-semibold text-white">{points}</span>
            <span className="text-sm text-white/45">pts</span>
          </div>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={pulseKey}
              animate={{ opacity: [0, 1, 0], y: [8, -12, -24], scale: [0.9, 1, 0.96] }}
              className="pointer-events-none absolute -right-6 top-6 rounded-full bg-lime px-2 py-1 text-[11px] font-semibold text-black shadow-[0_0_18px_rgba(215,255,87,0.28)]"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              +1
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="shrink-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-sm text-white/78">
            <Flame className="h-4 w-4 text-orange" />
            <span>{streak}d</span>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-white/42">
          <span className="shrink-0">Next reward</span>
          <span className="min-w-0 truncate text-right">{nextRewardLabel}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full bg-[linear-gradient(90deg,#d7ff57_0%,#8ef28a_100%)]"
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
