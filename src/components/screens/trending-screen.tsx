import { Flame, Radar } from "lucide-react";
import { CampaignBanner } from "@/components/campaign-banner";
import { TrendingList } from "@/components/trending-list";
import { formatCompactNumber } from "@/lib/utils";
import type { Deal } from "@/types/deal";
import type { SponsoredCampaign } from "@/types/prototype";

type TrendingScreenProps = {
  deals: Deal[];
  campaign: SponsoredCampaign | null;
  onOpenCampaign: () => void;
  onWatchDeal: (dealId: number) => void;
};

export function TrendingScreen({
  deals,
  campaign,
  onOpenCampaign,
  onWatchDeal,
}: TrendingScreenProps) {
  const totalViews = deals.reduce((sum, deal) => sum + deal.views, 0);
  const averageScore =
    deals.reduce((sum, deal) => sum + deal.dealScore, 0) / Math.max(deals.length, 1);

  return (
    <div className="no-scrollbar h-full overflow-y-auto px-4 pb-10">
      {campaign ? (
        <div className="mb-4">
          <CampaignBanner campaign={campaign} onPrimaryAction={onOpenCampaign} />
        </div>
      ) : null}

      <div className="glass-panel rounded-[26px] p-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.22em] text-white/58">
          <Flame className="h-3.5 w-3.5 text-orange" />
          Trending
        </div>
        <h2 className="mt-4 font-display text-[30px] leading-none font-semibold text-white">
          What people are opening right now.
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/58">
          Fast shortlist of the strongest deals by score, activity and fit.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[20px] border border-white/8 bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">Heat index</p>
            <p className="mt-2 font-display text-3xl font-semibold text-lime">
              {averageScore.toFixed(1)}
            </p>
          </div>
          <div className="rounded-[20px] border border-white/8 bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">Views stacked</p>
            <p className="mt-2 font-display text-3xl font-semibold text-white">
              {formatCompactNumber(totalViews)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-3 mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/42">
        <Radar className="h-3.5 w-3.5 text-blue" />
        Top deals
      </div>
      <TrendingList deals={deals.slice(0, 8)} onWatchDeal={onWatchDeal} />
    </div>
  );
}
