"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import { ProductVisual } from "@/components/product-visual";
import { formatPrice } from "@/lib/utils";
import type { Deal } from "@/types/deal";
import type { DealJumpOrigin } from "@/types/prototype";

type DealTransitionOverlayProps = {
  deal: Deal | null;
  origin: DealJumpOrigin | null;
};

export function DealTransitionOverlay({
  deal,
  origin,
}: DealTransitionOverlayProps) {
  return (
    <AnimatePresence>
      {deal ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-black/38 px-6 backdrop-blur-md"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <motion.div
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-[320px] overflow-hidden rounded-[32px] border border-white/12 bg-[#0b0e15]/96 p-3 shadow-[0_28px_100px_rgba(0,0,0,0.48)]"
            exit={{ opacity: 0, y: -20, scale: 1.04 }}
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
          >
            <div className="relative h-52 overflow-hidden rounded-[24px] border border-white/10">
              <ProductVisual
                alt={deal.title}
                artwork={deal.artwork}
                className="object-cover"
                image={deal.image}
                sizes="320px"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.56))]" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/28 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-white/72">
                  <Sparkles className="h-3.5 w-3.5 text-lime" />
                  {origin} jump
                </div>
              </div>
            </div>
            <div className="px-2 pb-2 pt-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">
                Dropping into live feed
              </p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-white">{deal.title}</h3>
                  <p className="mt-2 text-sm text-white/56">{deal.shop}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-semibold text-lime">
                    {formatPrice(deal.currentPrice)}
                  </p>
                  <p className="mt-1 text-xs text-white/42">-{deal.discountPercent.toFixed(0)}%</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-white/52">
                <ArrowDown className="h-4 w-4 text-blue" />
                <span>Aligning the exact card in the feed</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
