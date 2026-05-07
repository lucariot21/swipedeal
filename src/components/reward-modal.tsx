"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Gift, Sparkles, X } from "lucide-react";
import type { RewardTier } from "@/types/deal";

type RewardModalProps = {
  reward: RewardTier | null;
  onClose: () => void;
};

const confettiPieces = [
  "left-8 top-12 h-3 w-3",
  "left-20 top-24 h-2 w-2",
  "right-10 top-16 h-4 w-2",
  "right-24 top-28 h-3 w-3",
  "left-1/2 top-8 h-3 w-3 -translate-x-1/2",
  "left-14 bottom-24 h-2 w-4",
  "right-16 bottom-28 h-2 w-2",
];

export function RewardModal({ reward, onClose }: RewardModalProps) {
  return (
    <AnimatePresence>
      {reward ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex items-end bg-black/50 p-3 backdrop-blur-md"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className="relative w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#0d1019] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.48)]"
            exit={{ y: 28, opacity: 0 }}
            initial={{ y: 36, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.38, ease: "easeOut" }}
          >
            <div
              className="absolute inset-0 opacity-90"
              style={{
                background: `radial-gradient(circle at top, ${reward.accent}42, transparent 34%), radial-gradient(circle at 82% 74%, ${reward.glow}32, transparent 28%)`,
              }}
            />
            {confettiPieces.map((pieceClass, index) => (
              <motion.div
                animate={{ opacity: [0, 1, 0], y: [0, 18, 38], rotate: [0, 24, 72] }}
                className={`absolute rounded-full bg-white/70 ${pieceClass}`}
                key={pieceClass}
                style={{
                  backgroundColor: index % 2 === 0 ? reward.accent : reward.glow,
                }}
                transition={{
                  delay: index * 0.08,
                  duration: 1.2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 1.8,
                }}
              />
            ))}
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-[24px] border border-white/10 bg-white/8 p-3">
                  <Gift className="h-6 w-6" style={{ color: reward.accent }} />
                </div>
                <button
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/70"
                  onClick={onClose}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-5">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime/18 bg-lime/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-lime">
                  <Sparkles className="h-3.5 w-3.5" />
                  Reward unlocked
                </div>
                <h3 className="font-display text-[34px] leading-[1.04] font-semibold text-white">
                  {reward.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">{reward.subtitle}</p>
              </div>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-white/6 p-4">
                <div className="flex items-center justify-between text-sm text-white/72">
                  <span>Sponsor shop</span>
                  <span className="font-semibold text-white">{reward.sponsor}</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-white/48">
                  Prototype reward only. In a production build this would open a real claim
                  flow with tracking, inventory checks and clear legal copy.
                </p>
              </div>

              <button
                className="mt-6 w-full rounded-[22px] bg-[linear-gradient(120deg,#FFFFFF_0%,#D7FF57_46%,#3AA7FF_100%)] px-5 py-4 text-sm font-semibold text-black"
                onClick={onClose}
                type="button"
              >
                Keep Scrolling
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
