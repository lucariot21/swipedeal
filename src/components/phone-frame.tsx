type PhoneFrameProps = {
  children: React.ReactNode;
};

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-bg md:min-h-screen md:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-blue/15 blur-[120px]" />
        <div className="absolute bottom-8 left-10 h-56 w-56 rounded-full bg-orange/10 blur-[110px]" />
      </div>
      <div className="relative h-dvh w-full overflow-hidden md:h-[844px] md:w-[390px] md:rounded-[42px] md:border md:border-white/12 md:bg-black md:p-[10px] md:shadow-[0_32px_120px_rgba(0,0,0,0.56)]">
        <div className="hidden md:block">
          <div className="absolute left-1/2 top-4 z-40 h-1.5 w-24 -translate-x-1/2 rounded-full bg-white/15" />
        </div>
        <div className="relative h-full w-full overflow-hidden bg-bg md:rounded-[34px]">
          {children}
        </div>
      </div>
    </main>
  );
}
