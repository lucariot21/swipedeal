"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

type ToastProps = {
  message: string | null;
};

export function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none absolute inset-x-6 bottom-28 z-40 rounded-[22px] border border-white/10 bg-black/56 px-4 py-3 text-sm text-white/82 shadow-[0_16px_48px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
          exit={{ opacity: 0, y: 18 }}
          initial={{ opacity: 0, y: 18 }}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-4.5 w-4.5 text-lime" />
            <span>{message}</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
