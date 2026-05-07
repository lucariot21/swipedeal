"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronsDown } from "lucide-react";
import { DealCard } from "@/components/deal-card";
import type { Deal } from "@/types/deal";
import type { CTAExperimentVariant } from "@/types/prototype";

type DealFeedProps = {
  deals: Deal[];
  activeDealId: number;
  focusDealId: number | null;
  savedIds: number[];
  hotVotedIds: number[];
  ctaVariant: CTAExperimentVariant;
  onActiveDealChange: (dealId: number) => void;
  onSaveDeal: (dealId: number) => void;
  onShareDeal: (dealId: number) => void;
  onHotVoteDeal: (dealId: number) => void;
  onOpenDeal: (dealId: number) => void;
};

export function DealFeed({
  deals,
  activeDealId,
  focusDealId,
  savedIds,
  hotVotedIds,
  ctaVariant,
  onActiveDealChange,
  onSaveDeal,
  onShareDeal,
  onHotVoteDeal,
  onOpenDeal,
}: DealFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastActiveIdRef = useRef<number | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);

  const syncActiveDeal = useEffectEvent(() => {
    const container = containerRef.current;

    if (!container || deals.length === 0) {
      return;
    }

    const nextIndex = Math.min(
      deals.length - 1,
      Math.max(0, Math.round(container.scrollTop / container.clientHeight)),
    );
    const nextDealId = deals[nextIndex]?.id;

    if (!nextDealId || lastActiveIdRef.current === nextDealId) {
      return;
    }

    lastActiveIdRef.current = nextDealId;
    setHasScrolled(nextIndex > 0);
    onActiveDealChange(nextDealId);
  });

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let frame = 0;

    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        syncActiveDeal();
      });
    };

    syncActiveDeal();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [deals.length]);

  useEffect(() => {
    if (!focusDealId || !containerRef.current) {
      return;
    }

    const targetIndex = deals.findIndex((deal) => deal.id === focusDealId);

    if (targetIndex < 0) {
      return;
    }

    containerRef.current.scrollTo({
      top: targetIndex * containerRef.current.clientHeight,
      behavior: "smooth",
    });
  }, [deals, focusDealId]);

  return (
    <div className="relative h-full">
      <div
        className="no-scrollbar h-full snap-y snap-mandatory overflow-y-auto px-4"
        ref={containerRef}
      >
        {deals.map((deal) => (
          <section
            className="flex h-full snap-start items-stretch py-2"
            id={`deal-${deal.id}`}
            key={deal.id}
          >
            <DealCard
              ctaVariant={ctaVariant}
              deal={deal}
              isActive={activeDealId === deal.id}
              isHotVoted={hotVotedIds.includes(deal.id)}
              isSaved={savedIds.includes(deal.id)}
              onHotVote={() => onHotVoteDeal(deal.id)}
              onOpenDeal={() => onOpenDeal(deal.id)}
              onSave={() => onSaveDeal(deal.id)}
              onShare={() => onShareDeal(deal.id)}
            />
          </section>
        ))}
      </div>

      {!hasScrolled && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], y: [0, 8, 0] }}
          className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/34 px-3 py-2 text-xs text-white/72 backdrop-blur-xl"
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <ChevronsDown className="h-4 w-4 text-lime" />
          <span>Swipe for the next full-screen deal</span>
        </motion.div>
      )}
    </div>
  );
}
