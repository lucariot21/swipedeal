"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import { ProductVisual } from "@/components/product-visual";
import { SponsoredBadge } from "@/components/sponsored-badge";
import { formatCompactNumber, formatPrice } from "@/lib/utils";
import type { Deal } from "@/types/deal";

type TrendingListProps = {
  deals: Deal[];
  onWatchDeal: (dealId: number) => void;
};

export function TrendingList({ deals, onWatchDeal }: TrendingListProps) {
  return (
    <div className="space-y-3">
      {deals.map((deal, index) => (
        <button
          className="glass-panel flex w-full items-center gap-3 rounded-[22px] p-3 text-left"
          key={deal.id}
          onClick={() => onWatchDeal(deal.id)}
          type="button"
        >
          <div className="flex w-8 flex-col items-center justify-center gap-1 text-white/44">
            <span className="font-display text-lg leading-none text-white">{index + 1}</span>
            <Sparkles className="h-3.5 w-3.5 text-lime" />
          </div>
          <div className="relative h-20 w-20 overflow-hidden rounded-[18px] border border-white/8">
            <ProductVisual
              alt={deal.title}
              artwork={deal.artwork}
              className="object-cover"
              image={deal.image}
              sizes="80px"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-white">{deal.title}</p>
              <ArrowUpRight className="h-4 w-4 text-white/34" />
            </div>
            <p className="text-xs text-white/48">{deal.category} · {deal.shop}</p>
            {deal.personalizationReason ? (
              <p className="mt-1 text-xs text-lime">{deal.personalizationReason}</p>
            ) : null}
            <div className="mt-2 flex items-center gap-2 text-xs text-white/64">
              <span className="rounded-full bg-white/[0.05] px-2.5 py-1">
                {formatCompactNumber(deal.views)} views
              </span>
              <span className="rounded-full bg-white/[0.05] px-2.5 py-1">
                {deal.dealScore.toFixed(1)} / 10
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-end gap-2">
                <span className="font-display text-lg font-semibold text-white">
                  {formatPrice(deal.currentPrice)}
                </span>
                <span className="text-xs text-lime">-{deal.discountPercent.toFixed(0)}%</span>
              </div>
              {deal.isSponsored && deal.sponsorLabel ? (
                <SponsoredBadge label={deal.sponsorLabel} />
              ) : null}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
