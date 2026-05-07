"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import type { SponsoredCampaign } from "@/types/prototype";

type CampaignBannerProps = {
  campaign: SponsoredCampaign;
  onPrimaryAction: () => void;
};

export function CampaignBanner({ campaign, onPrimaryAction }: CampaignBannerProps) {
  return (
    <div
      className="overflow-hidden rounded-[28px] border border-white/10 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.28)]"
      style={{
        background: `linear-gradient(145deg, ${campaign.accent}24, ${campaign.glow}14, rgba(7,7,10,0.95) 100%)`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/22 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/70">
            <Sparkles className="h-3.5 w-3.5" style={{ color: campaign.glow }} />
            {campaign.sponsor} campaign
          </div>
          <h3 className="mt-3 font-display text-[26px] leading-none font-semibold text-white">
            {campaign.headline}
          </h3>
          <p className="mt-3 max-w-[92%] text-sm leading-6 text-white/68">{campaign.kicker}</p>
        </div>
        <button
          className="shrink-0 rounded-[18px] border border-white/10 bg-white/8 p-3 text-white"
          onClick={onPrimaryAction}
          type="button"
        >
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
      <button
        className="mt-4 rounded-[18px] bg-black/24 px-4 py-3 text-sm font-medium text-white/82"
        onClick={onPrimaryAction}
        type="button"
      >
        {campaign.ctaLabel}
      </button>
    </div>
  );
}
