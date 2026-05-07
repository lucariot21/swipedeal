import { PhoneFrame } from "@/components/phone-frame";

export default function Loading() {
  return (
    <PhoneFrame>
      <div className="relative flex h-full flex-col overflow-hidden px-4 pt-4">
        <div className="ambient-grid absolute inset-0 opacity-20" />
        <div className="glass-panel relative z-10 mb-4 flex items-center justify-between rounded-[28px] px-4 py-3">
          <div className="space-y-2">
            <div className="h-2 w-16 rounded-full bg-white/10" />
            <div className="h-5 w-24 rounded-full bg-white/15" />
          </div>
          <div className="h-11 w-28 rounded-2xl bg-white/10" />
        </div>
        <div className="glass-panel reward-shimmer relative z-10 flex-1 rounded-[32px] p-4">
          <div className="h-10 w-32 rounded-full bg-white/10" />
          <div className="mt-4 h-[42vh] rounded-[28px] bg-white/8" />
          <div className="mt-5 h-4 w-20 rounded-full bg-white/10" />
          <div className="mt-3 h-10 w-4/5 rounded-2xl bg-white/12" />
          <div className="mt-4 flex gap-2">
            <div className="h-16 flex-1 rounded-3xl bg-white/8" />
            <div className="h-16 flex-1 rounded-3xl bg-white/8" />
          </div>
          <div className="mt-auto flex items-center gap-3 pt-6">
            <div className="h-14 flex-1 rounded-[20px] bg-white/12" />
            <div className="h-14 w-14 rounded-[20px] bg-white/10" />
            <div className="h-14 w-14 rounded-[20px] bg-white/10" />
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}
