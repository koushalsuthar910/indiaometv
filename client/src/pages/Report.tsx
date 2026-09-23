import { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext';

export default function Report() {
  const { push } = useToast();
  const [cats, setCats] = useState<{ id: string; label: string }[]>([]);
  const [selected, setSelected] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/reports/categories`)
      .then(r => r.json()).then(setCats).catch(() => {});
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="text-3xl font-extrabold">Report</h1>
      <p className="text-slate-400 mt-2">The fastest way to report someone is the <b>Report</b> button while you're in a chat — moderators receive the session context automatically.</p>
      <div className="card p-5 mt-6">
        <label className="text-sm text-slate-300">Reason</label>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
        >
          <option value="">Select a reason…</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <label className="text-sm text-slate-300 mt-4 block">Details (optional)</label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value.slice(0, 500))}
          className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm h-28"
        />
        <button
          className="btn-primary mt-4"
          onClick={() => {
            if (!selected) { push('Please choose a reason.', 'error'); return; }
            push('Please file this report from inside a chat so we can attach the session.', 'info');
          }}
        >Submit</button>
      </div>
    </div>
  );
}
