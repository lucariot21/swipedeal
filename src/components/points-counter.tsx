"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, Gem, Zap } from "lucide-react";
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
    <div className="glass-panel rounded-[28px] px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="relative">
          <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/45">
            <Zap className="h-3.5 w-3.5 text-lime" />
            Pitch score
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold text-white">
              {points}
            </span>
            <span className="text-sm text-white/45">pts</span>
          </div>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={pulseKey}
              animate={{ opacity: [0, 1, 0], y: [8, -12, -24], scale: [0.9, 1, 0.96] }}
              className="pointer-events-none absolute -right-8 top-7 rounded-full bg-lime px-2 py-1 text-xs font-semibold text-black shadow-[0_0_24px_rgba(215,255,87,0.44)]"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              +1
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-2 text-sm text-white/80">
            <Flame className="h-4 w-4 text-orange" />
            <span>{streak} day streak</span>
          </div>
          <div className="inline-flex items-center gap-1 text-xs text-white/45">
            <Gem className="h-3.5 w-3.5 text-blue" />
            <span>{nextReward ? `${nextReward.threshold - points} to unlock` : "All rewards live"}</span>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-white/42">
          <span>Next reward</span>
          <span>{nextReward ? nextReward.title : "Complete"}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/8">
          <motion.div
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full bg-[linear-gradient(90deg,#3AA7FF_0%,#D7FF57_58%,#FF7A18_100%)]"
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
