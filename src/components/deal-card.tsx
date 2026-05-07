"use client";

import { motion } from "framer-motion";
import { Bookmark, Eye, Flame, Share2, Sparkles, TrendingUp } from "lucide-react";
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
        "flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/10 bg-white/6 text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors",
        active && "border-lime/40 bg-lime/14 text-lime",
      )}
      onClick={onClick}
      type="button"
      whileTap={{ scale: 0.92 }}
    >
      {children}
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
          title: "Deal sichern",
          subtitle: "Fast moving price",
          className:
            "bg-[linear-gradient(120deg,#D7FF57_0%,#B8FF4C_30%,#3AA7FF_100%)] text-black shadow-[0_16px_46px_rgba(215,255,87,0.32)]",
        }
      : {
          title: "Deal checken",
          subtitle: `${formatCompactNumber(deal.views)} already looked`,
          className:
            "bg-[linear-gradient(120deg,#FFFFFF_0%,#99D1FF_38%,#3AA7FF_100%)] text-black shadow-[0_16px_46px_rgba(58,167,255,0.28)]",
        };

  return (
    <motion.article
      animate={{
        scale: isActive ? 1 : 0.985,
        opacity: isActive ? 1 : 0.86,
        y: isActive ? 0 : 10,
      }}
      className="glass-panel relative flex h-full flex-col overflow-hidden rounded-[34px] px-4 pb-4 pt-3 shadow-[0_22px_70px_rgba(0,0,0,0.42)]"
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(circle at top, ${deal.accentPrimary}36, transparent 34%), radial-gradient(circle at 82% 68%, ${deal.accentSecondary}24, transparent 28%)`,
        }}
      />

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/55">
            {deal.category}
          </p>
          <div className="flex flex-wrap gap-2">
            {deal.isSponsored && deal.sponsorLabel ? (
              <SponsoredBadge label={deal.sponsorLabel} />
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] text-white/66">
                <TrendingUp className="h-3.5 w-3.5 text-lime" />
                <span>{deal.shop}</span>
              </div>
            )}
          </div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-right text-[11px] text-white/60">
          <div className="mb-1 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-blue" />
            <span>Price fell {deal.timeDropMinutes}m ago</span>
          </div>
          <span className="text-lime">{deal.tag}</span>
        </div>
      </div>

      <div className="relative z-10 mt-4 overflow-hidden rounded-[28px] border border-white/10 bg-black/24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_65%)]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/10 to-transparent" />
        <motion.div
          animate={{ scale: isActive ? 1.02 : 1 }}
          className="relative h-[39vh] min-h-[290px] max-h-[396px]"
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
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.26)_72%,rgba(0,0,0,0.58))]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4">
            <div>
              <p className="mb-1 inline-flex items-center gap-1 rounded-full bg-black/34 px-3 py-1 text-[11px] font-medium text-white/72">
                <Flame className="h-3.5 w-3.5 text-orange" />
                <span>{deal.popularity}% of users call this hot</span>
              </p>
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/78">
                  {formatCompactNumber(deal.views)} views
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/78">
                  {formatCompactNumber(deal.saves)} saves
                </div>
              </div>
            </div>
            <motion.div
              animate={{ scale: [1, 1.04, 1] }}
              className="rounded-[24px]"
              transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY }}
            >
              <DealScoreBadge heatLevel={deal.heatLevel} score={deal.dealScore} />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mt-5 flex-1">
        <div className="max-w-[88%]">
          {deal.personalizationReason ? (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-lime/16 bg-lime/10 px-3 py-1 text-[11px] text-lime">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{deal.personalizationReason}</span>
            </div>
          ) : null}
          <h2 className="font-display text-[30px] leading-[1.02] font-semibold tracking-tight text-white">
            {deal.title}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/68">{deal.aiSummary}</p>
        </div>

        <motion.div
          animate={{ opacity: [0.6, 1], y: [10, 0] }}
          className="mt-5 grid grid-cols-[1.3fr_0.9fr] gap-3"
          key={`${deal.id}-pricing`}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
              Current price
            </p>
            <div className="mt-2 flex items-end gap-3">
              <span className="font-display text-[34px] font-semibold leading-none text-white">
                {formatPrice(deal.currentPrice)}
              </span>
              <span className="pb-1 text-sm text-white/38 line-through">
                {formatPrice(deal.oldPrice)}
              </span>
            </div>
          </div>
          <div className="rounded-[26px] border border-lime/22 bg-lime/10 p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/45">
              Discount
            </p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-[34px] font-semibold leading-none text-lime">
                -{deal.discountPercent.toFixed(0)}%
              </span>
            </div>
            <p className="mt-2 text-xs text-white/65">Rated {deal.rating.toFixed(1)} with live stock at {deal.stock}</p>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mt-5 flex items-center gap-3">
        <motion.button
          className={cn(
            "flex-1 rounded-[22px] px-5 py-3 text-black",
            ctaLabel.className,
          )}
          onClick={onOpenDeal}
          type="button"
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex flex-col items-start">
            <span className="text-base font-semibold">{ctaLabel.title}</span>
            <span className="mt-0.5 text-xs font-medium text-black/70">{ctaLabel.subtitle}</span>
          </div>
        </motion.button>
        <ActionButton active={isSaved} label="Save deal" onClick={onSave}>
          <motion.div animate={isSaved ? { scale: [1, 1.18, 1] } : { scale: 1 }}>
            <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
          </motion.div>
        </ActionButton>
        <ActionButton active={isHotVoted} label="Vote hot" onClick={onHotVote}>
          <Flame className={cn("h-5 w-5", isHotVoted && "fill-current")} />
        </ActionButton>
        <ActionButton label="Share deal" onClick={onShare}>
          <Share2 className="h-5 w-5" />
        </ActionButton>
      </div>

      <div className="relative z-10 mt-3 flex items-center justify-between text-xs text-white/45">
        <div className="flex items-center gap-2">
          <Eye className="h-3.5 w-3.5 text-blue" />
          <span>{formatCompactNumber(deal.views)} viewed today</span>
        </div>
        <span>{deal.isSponsored ? "Sponsored deal clearly labeled" : "Organic community pick"}</span>
      </div>
    </motion.article>
  );
}
