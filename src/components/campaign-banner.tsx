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
      className="glass-panel overflow-hidden rounded-[24px] px-4 py-3"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02)), linear-gradient(90deg, ${campaign.accent}10, transparent 34%, rgba(10,12,18,0.96) 80%)`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/58">
            <Sparkles className="h-3.5 w-3.5" style={{ color: campaign.glow }} />
            Sponsored
          </div>
          <p className="mt-2 truncate font-display text-lg font-semibold text-white">
            {campaign.headline}
          </p>
          <p className="mt-1 truncate text-xs text-white/52">{campaign.kicker}</p>
        </div>
        <button
          className="shrink-0 rounded-[16px] border border-white/8 bg-white/[0.06] px-3 py-2.5 text-sm font-medium text-white"
          onClick={onPrimaryAction}
          type="button"
        >
          <span className="flex items-center gap-2">
            {campaign.ctaLabel}
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </button>
      </div>
    </div>
  );
}
