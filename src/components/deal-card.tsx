"use client";

import { motion } from "framer-motion";
import { Bookmark, Flame, Share2, Sparkles, TrendingUp } from "lucide-react";
import { DealScoreBadge } from "@/components/deal-score-badge";
import { ProductVisual } from "@/components/product-visual";
import { SponsoredBadge } from "@/components/sponsored-badge";
import { cn, formatCompactNumber, formatPrice } from "@/lib/utils";
import type { Deal } from "@/types/deal";
import type { CTAExperimentVariant } from "@/types/prototype";

type DealCardProps = {
  deal: Deal;
  isActive: boolean;
  isSaved: boolean;
  isHotVoted: boolean;
  ctaVariant: CTAExperimentVariant;
  onSave: () => void;
  onShare: () => void;
  onHotVote: () => void;
  onOpenDeal: () => void;
};

function ActionButton({
  active,
  children,
  label,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      aria-label={label}
      className={cn(
        "flex h-12 items-center justify-center gap-2 rounded-[16px] border border-white/8 bg-white/[0.04] px-3 text-sm text-white/68 transition-colors",
        active && "border-lime/30 bg-lime/12 text-lime",
      )}
      onClick={onClick}
      type="button"
      whileTap={{ scale: 0.95 }}
    >
      {children}
      <span>{label}</span>
    </motion.button>
  );
}

export function DealCard({
  deal,
  isActive,
  isSaved,
  isHotVoted,
  ctaVariant,
  onSave,
  onShare,
  onHotVote,
  onOpenDeal,
}: DealCardProps) {
  const ctaLabel =
    ctaVariant === "momentum"
      ? {
          title: "Zum Deal",
          subtitle: "Fast moving price",
          className:
            "bg-[linear-gradient(120deg,#d7ff57_0%,#bff56a_100%)] text-black shadow-[0_16px_36px_rgba(215,255,87,0.18)]",
        }
      : {
          title: "Zum Deal",
          subtitle: `${formatCompactNumber(deal.views)} people checked this`,
          className:
            "bg-[linear-gradient(120deg,#ffffff_0%,#d8ecff_100%)] text-black shadow-[0_16px_36px_rgba(255,255,255,0.12)]",
        };

  return (
    <motion.article
      animate={{
        scale: isActive ? 1 : 0.992,
        opacity: isActive ? 1 : 0.9,
        y: isActive ? 0 : 6,
      }}
      className="glass-panel relative flex h-full flex-col overflow-hidden rounded-[28px] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.34)]"
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_22%)]" />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <p className="inline-flex max-w-[10.5rem] truncate rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/52">
              {deal.category}
            </p>
            {deal.isSponsored && deal.sponsorLabel ? <SponsoredBadge label={deal.sponsorLabel} /> : null}
          </div>
          <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-white/38">{deal.tag}</p>
        </div>
      </div>

      <div className="relative z-10 mt-4 overflow-hidden rounded-[24px] border border-white/8 bg-[#10141c]">
        <motion.div
          animate={{ scale: isActive ? 1.02 : 1 }}
          className="relative h-[26vh] min-h-[210px] max-h-[260px]"
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <ProductVisual
            alt={deal.title}
            artwork={deal.artwork}
            className="object-cover"
            image={deal.image}
            priority={isActive}
            sizes="(max-width: 768px) 100vw, 390px"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.18)_70%,rgba(0,0,0,0.48))]" />
          <div className="absolute right-3 top-3">
            <DealScoreBadge heatLevel={deal.heatLevel} score={deal.dealScore} />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4">
            <div className="flex flex-wrap gap-2">
              <div className="rounded-full bg-black/34 px-3 py-1 text-xs text-white/78">
                {formatCompactNumber(deal.views)} views
              </div>
              <div className="rounded-full bg-black/34 px-3 py-1 text-xs text-white/78">
                {formatCompactNumber(deal.saves)} saves
              </div>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-black/34 px-3 py-1 text-xs text-white/78">
              <Flame className="h-3.5 w-3.5 text-orange" />
              <span>{deal.popularity}% hot</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mt-4 flex flex-1 flex-col">
        {deal.personalizationReason ? (
          <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full border border-lime/16 bg-lime/10 px-3 py-1 text-[11px] text-lime">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{deal.personalizationReason}</span>
          </div>
        ) : null}
        <h2 className="line-clamp-2 font-display text-[24px] leading-[1.08] font-semibold tracking-tight text-white">
          {deal.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-white/62">{deal.aiSummary}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/42">
          <span>{deal.shop}</span>
          <span>{deal.rating.toFixed(1)} rated</span>
          <span>{deal.stock} in stock</span>
          <span>{deal.timeDropMinutes}m ago</span>
        </div>

        <motion.div
          animate={{ opacity: [0.7, 1], y: [8, 0] }}
          className="mt-3 grid grid-cols-3 gap-2"
          key={`${deal.id}-pricing`}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-2.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/42">Now</p>
            <span className="mt-2 block font-display text-[22px] leading-none font-semibold text-white">
              {formatPrice(deal.currentPrice)}
            </span>
          </div>
          <div className="rounded-[18px] border border-white/8 bg-white/[0.03] p-2.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/42">Was</p>
            <span className="mt-2 block text-sm text-white/40 line-through">
              {formatPrice(deal.oldPrice)}
            </span>
          </div>
          <div className="rounded-[18px] border border-lime/16 bg-lime/8 p-2.5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/42">Off</p>
            <span className="mt-2 block font-display text-[22px] leading-none font-semibold text-lime">
              -{deal.discountPercent.toFixed(0)}%
            </span>
          </div>
        </motion.div>

      </div>

      <div className="relative z-10 mt-3">
        <motion.button
          className={cn("w-full rounded-[18px] px-5 py-3.5 text-black", ctaLabel.className)}
          onClick={onOpenDeal}
          type="button"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col items-start">
              <span className="text-base font-semibold">{ctaLabel.title}</span>
              <span className="mt-0.5 text-xs font-medium text-black/70">{ctaLabel.subtitle}</span>
            </div>
            <TrendingUp className="h-5 w-5" />
          </div>
        </motion.button>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <ActionButton active={isSaved} label="Save" onClick={onSave}>
            <motion.div animate={isSaved ? { scale: [1, 1.18, 1] } : { scale: 1 }}>
              <Bookmark className={cn("h-4.5 w-4.5", isSaved && "fill-current")} />
            </motion.div>
          </ActionButton>
          <ActionButton active={isHotVoted} label="Hot" onClick={onHotVote}>
            <Flame className={cn("h-4.5 w-4.5", isHotVoted && "fill-current")} />
          </ActionButton>
          <ActionButton label="Share" onClick={onShare}>
            <Share2 className="h-4.5 w-4.5" />
          </ActionButton>
        </div>
      </div>
    </motion.article>
  );
}
