"use client";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Cloud,
  MousePointerClick,
  RadioTower,
} from "lucide-react";
import type { AnalyticsSummary } from "@/lib/analytics";
import { buildEventLabel } from "@/lib/analytics";
import { formatPercent, formatTime } from "@/lib/utils";
import type { Deal } from "@/types/deal";
import type { CTAExperimentVariant, ServerAnalyticsSnapshot } from "@/types/prototype";

type AnalyticsPanelProps = {
  deals: Deal[];
  variant: CTAExperimentVariant;
  summary: AnalyticsSummary;
  serverSnapshot: ServerAnalyticsSnapshot | null;
};

const variantLabelMap = {
  momentum: "Momentum",
  "social-proof": "Social Proof",
} satisfies Record<CTAExperimentVariant, string>;

export function AnalyticsPanel({
  deals,
  variant,
  summary,
  serverSnapshot,
}: AnalyticsPanelProps) {
  const bestVariant =
    serverSnapshot?.variantPerformance.sort((left, right) => right.ctr - left.ctr)[0] ?? null;

  return (
    <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">Conversion lab</p>
          <h3 className="mt-2 font-display text-[28px] leading-none font-semibold text-white">
            Live experiment telemetry
          </h3>
        </div>
        <div className="rounded-full border border-white/8 bg-black/20 px-3 py-2 text-xs text-white/72">
          CTA Variant: {variantLabelMap[variant]}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[20px] border border-white/8 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-white/54">
            <MousePointerClick className="h-4 w-4 text-lime" />
            <span className="text-xs uppercase tracking-[0.24em]">CTA CTR</span>
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-white">
            {formatPercent(summary.ctaCtr)}
          </p>
          <p className="mt-2 text-xs text-white/48">
            {summary.ctaClicks} clicks from {summary.views} deal views
          </p>
        </div>
        <div className="rounded-[20px] border border-white/8 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-white/54">
            <RadioTower className="h-4 w-4 text-blue" />
            <span className="text-xs uppercase tracking-[0.24em]">Sponsor CTR</span>
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-white">
            {formatPercent(summary.sponsorCtr)}
          </p>
          <p className="mt-2 text-xs text-white/48">
            {summary.sponsorClicks} sponsor clicks in-session
          </p>
        </div>
        <div className="rounded-[20px] border border-white/8 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-white/54">
            <Activity className="h-4 w-4 text-orange" />
            <span className="text-xs uppercase tracking-[0.24em]">Intent stack</span>
          </div>
          <p className="mt-3 font-display text-3xl font-semibold text-white">
            {summary.saveActions + summary.hotActions + summary.shareActions}
          </p>
          <p className="mt-2 text-xs text-white/48">
            Saves {summary.saveActions} - Hot {summary.hotActions} - Shares {summary.shareActions}
          </p>
        </div>
        <div className="rounded-[20px] border border-white/8 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-white/54">
            <BarChart3 className="h-4 w-4 text-lime" />
            <span className="text-xs uppercase tracking-[0.24em]">Best lane</span>
          </div>
          <p className="mt-3 text-lg font-semibold text-white">{summary.topResponsiveCategory}</p>
          <p className="mt-2 text-xs text-white/48">{summary.rewardUnlocks} rewards unlocked so far</p>
        </div>
      </div>

      <div className="mt-5 rounded-[20px] border border-white/8 bg-white/[0.04] p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <ArrowUpRight className="h-4 w-4 text-lime" />
          Hypothesis
        </div>
        <p className="mt-3 text-sm leading-6 text-white/72">{summary.hypothesis}</p>
      </div>

      <div className="mt-5 rounded-[20px] border border-white/8 bg-black/20 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Cloud className="h-4 w-4 text-blue" />
          Server snapshot
        </div>
        {serverSnapshot ? (
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-white/48">Synced events</p>
              <p className="mt-1 font-display text-2xl font-semibold text-white">
                {serverSnapshot.totalEvents}
              </p>
            </div>
            <div>
              <p className="text-white/48">Winning variant</p>
              <p className="mt-1 text-base font-semibold text-white">
                {bestVariant ? `${variantLabelMap[bestVariant.variant]} - ${formatPercent(bestVariant.ctr)}` : "Pending"}
              </p>
            </div>
            <div>
              <p className="text-white/48">Server top categories</p>
              <p className="mt-1 text-sm text-white/74">
                {serverSnapshot.topCategories.join(" - ") || "No category yet"}
              </p>
            </div>
            <div>
              <p className="text-white/48">Sponsor click share</p>
              <p className="mt-1 text-sm text-white/74">
                {formatPercent(serverSnapshot.sponsorClickShare)}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-white/52">
            Waiting for server sync. Local analytics is already active.
          </p>
        )}
      </div>

      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">Recent events</p>
        <div className="mt-3 space-y-2">
          {summary.recentEvents.length === 0 ? (
            <div className="rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/52">
              Scroll and interact with deals to populate the analytics rail.
            </div>
          ) : (
            summary.recentEvents.map((event) => (
              <div
                className="flex items-center justify-between gap-4 rounded-[18px] border border-white/8 bg-black/20 px-4 py-3 text-sm"
                key={event.id}
              >
                <span className="text-white/72">{buildEventLabel(event, deals)}</span>
                <span className="shrink-0 text-xs text-white/42">{formatTime(event.ts)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
