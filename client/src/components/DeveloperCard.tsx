export default function DeveloperCard({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="text-xs text-slate-400 text-center">
        Built by{' '}
        <span className="font-semibold text-slate-200">Koushal Suthar</span>
        {' · '}
        <a
          href="https://instagram.com/koushalll09"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-300 hover:text-indigo-200 underline"
        >
          @koushalll09
        </a>
        {' · '}
        <a
          href="https://wa.me/919649554772"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-300 hover:text-indigo-200 underline"
        >
          +91 96495 54772
        </a>
      </div>
    );
  }

  return (
    <div className="card p-6 max-w-md mx-auto mt-12 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 mx-auto flex items-center justify-center text-2xl font-extrabold text-white shadow-lg shadow-indigo-900/40">
        KS
      </div>
      <div className="mt-3 font-bold text-lg">Koushal Suthar</div>
      <div className="text-xs text-slate-400 uppercase tracking-widest mb-4">Developer</div>
      <p className="text-sm text-slate-300 mb-5">
        Creator of IndiaomeTV. Built with React, Node.js, WebRTC &amp; Socket.IO.
      </p>
      <div className="flex flex-col gap-2 text-sm">
        <a
          href="https://instagram.com/koushalll09"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
          <span>@koushalll09</span>
        </a>
        <a
          href="https://wa.me/919649554772"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
          <span>+91 96495 54772</span>
        </a>
      </div>
    </div>
  );
}
