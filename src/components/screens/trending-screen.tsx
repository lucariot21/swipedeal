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

      <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(58,167,255,0.18),rgba(255,122,24,0.08)_44%,rgba(7,7,10,0.96)_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.36)]">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/18 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-white/65">
          <Flame className="h-3.5 w-3.5 text-orange" />
          Trending heat
        </div>
        <h2 className="mt-4 font-display text-[34px] leading-none font-semibold text-white">
          The deals people are opening right now.
        </h2>
        <p className="mt-3 text-sm leading-6 text-white/66">
          Built for fast yes-or-no decisions: top score, rising views and premium visual fit
          surfaced first.
        </p>
        <p className="mt-2 text-sm leading-6 text-lime">
          Ranking adapts to your saves, hot votes, click behavior and stated preferences.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">Heat index</p>
            <p className="mt-2 font-display text-3xl font-semibold text-lime">
              {averageScore.toFixed(1)}
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/8 p-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">Views stacked</p>
            <p className="mt-2 font-display text-3xl font-semibold text-white">
              {formatCompactNumber(totalViews)}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-3 mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.26em] text-white/45">
        <Radar className="h-3.5 w-3.5 text-blue" />
        Top deals
      </div>
      <TrendingList deals={deals.slice(0, 8)} onWatchDeal={onWatchDeal} />
    </div>
  );
}
