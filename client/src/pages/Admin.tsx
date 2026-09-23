import { useEffect, useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Admin() {
  const { push } = useToast();
  const [token, setToken] = useState(() => localStorage.getItem('indiaometv.admin') || '');
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [bans, setBans] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);

  const load = async () => {
    try {
      const h = { Authorization: `Bearer ${token}` };
      const [s, r, b, m, q] = await Promise.all([
        fetch(`${API}/api/admin/stats`, { headers: h }).then(x => x.json()),
        fetch(`${API}/api/admin/reports`, { headers: h }).then(x => x.json()),
        fetch(`${API}/api/admin/bans`, { headers: h }).then(x => x.json()),
        fetch(`${API}/api/admin/matches`, { headers: h }).then(x => x.json()),
        fetch(`${API}/api/admin/queue`, { headers: h }).then(x => x.json())
      ]);
      setStats(s); setReports(r); setBans(b); setMatches(m); setQueue(q);
    } catch {
      push('Failed to load admin data.', 'error');
    }
  };

  useEffect(() => { if (token) load(); const id = setInterval(() => token && load(), 5000); return () => clearInterval(id); }, [token]);

  const resolve = async (id: string) => {
    await fetch(`${API}/api/admin/reports/${id}/resolve`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    load();
  };
  const ban = async (userId: string, durationMs: number | null) => {
    await fetch(`${API}/api/admin/ban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, reason: 'manual', durationMs })
    });
    load();
  };
  const unban = async (userId: string) => {
    await fetch(`${API}/api/admin/unban`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId })
    });
    load();
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto py-16 px-5">
        <div className="card p-6 space-y-3">
          <h1 className="text-2xl font-extrabold">Admin</h1>
          <input
            value={token} onChange={e => setToken(e.target.value)}
            placeholder="Admin token"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2"
          />
          <button className="btn-primary w-full" onClick={() => { localStorage.setItem('indiaometv.admin', token); load(); }}>Enter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Admin Dashboard</h1>
        <button className="btn-ghost !py-2 !px-4 text-sm" onClick={() => { localStorage.removeItem('indiaometv.admin'); setToken(''); }}>Sign out</button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ['Active users', stats.activeUsers],
            ['Active matches', stats.activeMatches],
            ['In queue', stats.inQueue],
            ['Unresolved reports', stats.unresolvedReports],
            ['Total reports', stats.reports],
            ['Blocks', stats.blocks],
            ['Bans', stats.bans],
            ['Sessions', stats.sessions]
          ].map(([k, v]) => (
            <div key={k as string} className="card p-4">
              <div className="text-2xl font-extrabold">{v as any}</div>
              <div className="text-xs text-slate-400">{k as string}</div>
            </div>
          ))}
        </div>
      )}

      <section className="card p-5">
        <h2 className="font-bold mb-3">Active matches</h2>
        <div className="text-xs font-mono space-y-1 max-h-40 overflow-auto">
          {matches.map(m => <div key={m.matchId}>{m.matchId} · {m.a} ↔ {m.b}</div>)}
          {matches.length === 0 && <div className="text-slate-500">No active matches</div>}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-bold mb-3">Queue</h2>
        <div className="text-xs font-mono space-y-1 max-h-40 overflow-auto">
          {queue.map(q => <div key={q.userId}>{q.userId} · {q.country || '—'}</div>)}
          {queue.length === 0 && <div className="text-slate-500">Empty</div>}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-bold mb-3">Recent reports</h2>
        <div className="space-y-2">
          {reports.map(r => (
            <div key={r.id} className="flex items-start justify-between gap-3 border border-white/10 rounded-xl p-3 text-sm">
              <div>
                <div className="font-semibold">{r.reason} {r.resolved && <span className="text-emerald-400 text-xs">· resolved</span>}</div>
                <div className="text-xs text-slate-400">reporter {r.reporterId} → reported {r.reportedId}</div>
                {r.details && <div className="text-xs text-slate-300 mt-1">"{r.details}"</div>}
                <div className="text-xs text-slate-500 mt-1">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {!r.resolved && <button className="btn-ghost !py-1 !px-3 text-xs" onClick={() => resolve(r.id)}>Resolve</button>}
                <button className="btn-danger !py-1 !px-3 text-xs" onClick={() => ban(r.reportedId, 24 * 3600_000)}>Ban 24h</button>
                <button className="btn-danger !py-1 !px-3 text-xs" onClick={() => ban(r.reportedId, null)}>Ban permanent</button>
              </div>
            </div>
          ))}
          {reports.length === 0 && <div className="text-slate-500 text-sm">No reports</div>}
        </div>
      </section>

      <section className="card p-5">
        <h2 className="font-bold mb-3">Bans</h2>
        <div className="space-y-2 text-sm">
          {bans.map(b => (
            <div key={b.id} className="flex justify-between items-center border border-white/10 rounded-xl p-3">
              <div>
                <div>{b.userId} · {b.reason}</div>
                <div className="text-xs text-slate-500">{b.expiresAt ? `expires ${new Date(b.expiresAt).toLocaleString()}` : 'permanent'}</div>
              </div>
              <button className="btn-ghost !py-1 !px-3 text-xs" onClick={() => unban(b.userId)}>Unban</button>
            </div>
          ))}
          {bans.length === 0 && <div className="text-slate-500">No bans</div>}
        </div>
      </section>
    </div>
  );
}
