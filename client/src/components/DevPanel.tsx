export default function DevPanel({ data }: { data: Record<string, unknown> }) {
  if (import.meta.env.VITE_DEV_PANEL !== 'true') return null;
  return (
    <div className="fixed bottom-3 right-3 z-40 text-[11px] font-mono bg-black/70 border border-white/10 backdrop-blur rounded-xl p-3 space-y-1 max-w-xs">
      <div className="text-indigo-300 font-bold mb-1">DEV PANEL</div>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="flex justify-between gap-2">
          <span className="text-slate-400">{k}</span>
          <span className="truncate">{String(v)}</span>
        </div>
      ))}
    </div>
  );
}
