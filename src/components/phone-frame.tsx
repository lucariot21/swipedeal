type PhoneFrameProps = {
  children: React.ReactNode;
};

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-bg md:min-h-screen md:p-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="ambient-grid absolute inset-0 opacity-[0.18]" />
        <div className="absolute left-1/2 top-12 h-64 w-64 -translate-x-1/2 rounded-full bg-blue/10 blur-[120px]" />
        <div className="absolute bottom-12 right-12 h-44 w-44 rounded-full bg-lime/6 blur-[110px]" />
      </div>
      <div className="relative h-dvh w-full overflow-hidden md:h-[844px] md:w-[402px] md:rounded-[42px] md:border md:border-white/10 md:bg-[#0b0d12] md:p-[10px] md:shadow-[0_24px_80px_rgba(0,0,0,0.46)]">
        <div className="hidden md:block">
          <div className="absolute left-1/2 top-4 z-40 h-1.5 w-24 -translate-x-1/2 rounded-full bg-white/12" />
        </div>
        <div className="relative h-full w-full overflow-hidden bg-bg md:rounded-[32px] md:border md:border-white/6">
          {children}
        </div>
      </div>
    </main>
  );
}
