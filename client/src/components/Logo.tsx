export default function Logo({ size = 36, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6366f1" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#lg)" />
        <path d="M20 32c0-6.6 5.4-12 12-12s12 5.4 12 12" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="32" cy="24" r="4" fill="white" />
        <rect x="22" y="34" width="20" height="14" rx="4" fill="white" />
      </svg>
      {withText && (
        <span className="text-lg font-extrabold tracking-tight">
          Indiaome<span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">TV</span>
        </span>
      )}
    </div>
  );
}
