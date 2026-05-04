/** Custom TON Poker wordmark + diamond mark. */
export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-8 h-8 grid place-items-center">
        <svg viewBox="0 0 32 32" className="w-8 h-8 absolute inset-0">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3aa0ff" />
              <stop offset="100%" stopColor="#2078d4" />
            </linearGradient>
          </defs>
          <path
            d="M16 2 L30 9 L16 30 L2 9 Z"
            fill="url(#lg)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.5"
          />
          <path d="M16 2 L16 30 M2 9 L30 9" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
        </svg>
        <span className="relative text-white font-bold text-xs">♠</span>
      </div>
      <div className="leading-none">
        <div className="font-extrabold tracking-tight text-fg text-base">TON Poker</div>
        <div className="text-[10px] text-muted -mt-0.5">play. earn. cash out.</div>
      </div>
    </div>
  );
}
