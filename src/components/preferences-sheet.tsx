"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SponsoredShop } from "@/types/deal";
import type { PricePreference, ShoppingMode, UserPreferences } from "@/types/prototype";

type PreferencesSheetProps = {
  isOpen: boolean;
  preferences: UserPreferences;
  availableCategories: string[];
  onClose: () => void;
  onChange: (preferences: UserPreferences) => void;
  onReset: () => void;
};

const sponsorOptions: SponsoredShop[] = ["NeonTech", "SneakerVault", "HomeHackz"];

const priceOptions: Array<{
  value: PricePreference;
  label: string;
  subtitle: string;
}> = [
  { value: "all", label: "All prices", subtitle: "Balanced mix" },
  { value: "budget", label: "Budget", subtitle: "Under 100 EUR first" },
  { value: "premium", label: "Premium", subtitle: "Higher-ticket focus" },
];

const modeOptions: Array<{
  value: ShoppingMode;
  label: string;
  subtitle: string;
}> = [
  { value: "balanced", label: "Balanced", subtitle: "Mixed discovery" },
  { value: "deals-first", label: "Deals first", subtitle: "Discount-led ranking" },
  { value: "premium-first", label: "Premium first", subtitle: "Quality-led ranking" },
];

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={cn(
        "rounded-full border px-3 py-2 text-sm transition-colors",
        active
          ? "border-lime/28 bg-lime/12 text-lime"
          : "border-white/10 bg-white/6 text-white/64",
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export function PreferencesSheet({
  isOpen,
  preferences,
  availableCategories,
  onClose,
  onChange,
  onReset,
}: PreferencesSheetProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex items-end bg-black/54 p-3 backdrop-blur-md"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            animate={{ y: 0, opacity: 1 }}
            className="w-full overflow-hidden rounded-[32px] border border-white/10 bg-[#0d1119] p-5 shadow-[0_28px_100px_rgba(0,0,0,0.5)]"
            exit={{ y: 24, opacity: 0 }}
            initial={{ y: 34, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] uppercase tracking-[0.28em] text-white/62">
                  <SlidersHorizontal className="h-3.5 w-3.5 text-blue" />
                  Feed tuning
                </div>
                <h3 className="mt-3 font-display text-[30px] leading-none font-semibold text-white">
                  Bias the feed toward your taste
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/62">
                  These controls steer ranking in real time without breaking the pitch flow.
                </p>
              </div>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-white/70"
                onClick={onClose}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <section>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">
                  Shopping mode
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {modeOptions.map((option) => (
                    <button
                      className={cn(
                        "rounded-[22px] border p-3 text-left",
                        preferences.shoppingMode === option.value
                          ? "border-lime/24 bg-lime/10 text-white"
                          : "border-white/10 bg-white/6 text-white/62",
                      )}
                      key={option.value}
                      onClick={() =>
                        onChange({
                          ...preferences,
                          shoppingMode: option.value,
                        })
                      }
                      type="button"
                    >
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="mt-1 text-xs text-white/52">{option.subtitle}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">
                  Price preference
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {priceOptions.map((option) => (
                    <button
                      className={cn(
                        "rounded-[22px] border p-3 text-left",
                        preferences.pricePreference === option.value
                          ? "border-blue/24 bg-blue/10 text-white"
                          : "border-white/10 bg-white/6 text-white/62",
                      )}
                      key={option.value}
                      onClick={() =>
                        onChange({
                          ...preferences,
                          pricePreference: option.value,
                        })
                      }
                      type="button"
                    >
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="mt-1 text-xs text-white/52">{option.subtitle}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">
                      Favorite categories
                    </p>
                    <p className="mt-1 text-xs text-white/52">
                      Pin categories to push them up the stack.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs text-white/62">
                    <Sparkles className="h-3.5 w-3.5 text-lime" />
                    Live ranking
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableCategories.slice(0, 8).map((category) => {
                    const active = preferences.favoriteCategories.includes(category);

                    return (
                      <ToggleChip
                        active={active}
                        key={category}
                        label={category}
                        onClick={() =>
                          onChange({
                            ...preferences,
                            favoriteCategories: active
                              ? preferences.favoriteCategories.filter((value) => value !== category)
                              : [...preferences.favoriteCategories, category],
                          })
                        }
                      />
                    );
                  })}
                </div>
              </section>

              <section>
                <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">
                  Sponsor affinity
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sponsorOptions.map((sponsor) => {
                    const active = preferences.favoriteSponsors.includes(sponsor);

                    return (
                      <ToggleChip
                        active={active}
                        key={sponsor}
                        label={sponsor}
                        onClick={() =>
                          onChange({
                            ...preferences,
                            favoriteSponsors: active
                              ? preferences.favoriteSponsors.filter((value) => value !== sponsor)
                              : [...preferences.favoriteSponsors, sponsor],
                          })
                        }
                      />
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Sponsored focus</p>
                    <p className="mt-1 text-xs leading-5 text-white/52">
                      Push clearly labeled sponsor deals higher for campaign review.
                    </p>
                  </div>
                  <button
                    className={cn(
                      "flex h-10 w-[4.5rem] items-center rounded-full border px-1 transition-colors",
                      preferences.sponsoredOnly
                        ? "border-lime/24 bg-lime/14"
                        : "border-white/10 bg-white/6",
                    )}
                    onClick={() =>
                      onChange({
                        ...preferences,
                        sponsoredOnly: !preferences.sponsoredOnly,
                      })
                    }
                    type="button"
                  >
                    <span
                      className={cn(
                        "h-8 w-8 rounded-full bg-white transition-transform",
                        preferences.sponsoredOnly ? "translate-x-8" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>
              </section>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-[20px] border border-white/10 bg-white/8 px-4 py-3 text-sm font-medium text-white/74"
                onClick={onReset}
                type="button"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                className="flex-1 rounded-[20px] bg-[linear-gradient(120deg,#D7FF57_0%,#3AA7FF_100%)] px-4 py-3 text-sm font-semibold text-black"
                onClick={onClose}
                type="button"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
