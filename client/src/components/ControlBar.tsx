interface Props {
  micOn: boolean;
  camOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onNext: () => void;
  onEnd: () => void;
  onReport: () => void;
  onBlock: () => void;
  onFullscreen: () => void;
  canNext: boolean;
}

const IconBtn = ({ active, danger, label, onClick, children, big }: any) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`relative flex items-center justify-center rounded-full transition active:scale-95
      ${big ? 'h-16 w-16' : 'h-14 w-14'}
      ${danger ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/40'
        : active ? 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'}`}
  >
    {children}
  </button>
);

export default function ControlBar(p: Props) {
  return (
    <div className="w-full flex items-center justify-center gap-3 sm:gap-4 px-3 py-3">
      <IconBtn active={p.micOn} label={p.micOn ? 'Mute microphone' : 'Unmute microphone'} onClick={p.onToggleMic}>
        {p.micOn ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="3" x2="21" y2="21"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9V5a3 3 0 0 0-5.94-.6"/><path d="M19 10v2a7 7 0 0 1-.11 1.23M5 10v2a7 7 0 0 0 10.61 6.09"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
        )}
      </IconBtn>

      <IconBtn active={p.camOn} label={p.camOn ? 'Turn camera off' : 'Turn camera on'} onClick={p.onToggleCam}>
        {p.camOn ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="14" height="12" rx="3"/><path d="M22 8l-6 4 6 4V8z"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M16 16V8a3 3 0 0 0-3-3H7M2 8v8a3 3 0 0 0 3 3h7M22 8l-6 4 6 4V8z"/></svg>
        )}
      </IconBtn>

      <button
        onClick={p.onNext}
        disabled={!p.canNext}
        className="btn-primary h-16 px-8 sm:px-10 text-base font-extrabold tracking-wide shadow-indigo-900/50"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
        NEXT
      </button>

      <IconBtn danger label="End chat" onClick={p.onEnd}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 14s3-6 10-6 10 6 10 6l-3 3-4-4s-1-1-3-1-3 1-3 1l-4 4-3-3z"/></svg>
      </IconBtn>

      <div className="hidden sm:flex gap-2">
        <IconBtn label="Report" onClick={p.onReport} active={false}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="M12 14v8"/><path d="M4.93 4.93a10 10 0 1 0 14.14 0" opacity="0.5"/></svg>
        </IconBtn>
        <IconBtn label="Block" onClick={p.onBlock} active={false}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        </IconBtn>
        <IconBtn label="Fullscreen" onClick={p.onFullscreen} active={false}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10V4h6M20 14v6h-6M14 4h6v6M10 20H4v-6"/></svg>
        </IconBtn>
      </div>
    </div>
  );
}
