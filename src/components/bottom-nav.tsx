"use client";

import { motion } from "framer-motion";
import { Compass, Gift, Home, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppTab } from "@/types/deal";

type BottomNavProps = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
  unlockedRewardsCount: number;
};

const tabs = [
  { id: "feed", label: "Feed", icon: Home },
  { id: "trending", label: "Trending", icon: Compass },
  { id: "rewards", label: "Rewards", icon: Gift },
  { id: "profile", label: "Profil", icon: UserRound },
] satisfies Array<{
  id: AppTab;
  label: string;
  icon: typeof Home;
}>;

export function BottomNav({
  activeTab,
  onChange,
  unlockedRewardsCount,
}: BottomNavProps) {
  return (
    <div className="glass-panel rounded-[24px] px-2 py-2">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;

          return (
            <button
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-[18px] px-3 py-2.5 text-[11px] text-white/46 transition-colors",
                isActive && "text-white",
              )}
              key={tab.id}
              onClick={() => onChange(tab.id)}
              type="button"
            >
              {isActive ? (
                <motion.div
                  className="absolute inset-0 rounded-[18px] bg-white/8"
                  layoutId="nav-pill"
                  transition={{ type: "spring", duration: 0.45 }}
                />
              ) : null}
              <div className="relative flex items-center justify-center">
                <Icon className={cn("h-5 w-5", isActive && "text-lime")} />
                {tab.id === "rewards" && unlockedRewardsCount > 0 ? (
                  <div className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[9px] font-semibold text-black">
                    {unlockedRewardsCount}
                  </div>
                ) : null}
              </div>
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
