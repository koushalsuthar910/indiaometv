import DeveloperCard from '../components/DeveloperCard';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PermissionGate, { Consent } from '../components/PermissionGate';
import { useSession } from '../contexts/SessionContext';

export default function Home() {
  const navigate = useNavigate();
  const { setSession, session } = useSession();
  const [showGate, setShowGate] = useState(false);

  const handleContinue = (c: Consent) => {
    const sid = session?.sessionId ?? `s_${Math.random().toString(36).slice(2, 14)}`;
    setSession({ sessionId: sid, name: c.name || undefined, country: c.country || undefined });
    navigate('/chat', { state: { mode: c.mode } });
  };

  return (
    <div className="flex-1 flex flex-col items-center px-5 sm:px-8 py-10 sm:py-16">
      <div className="w-full max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-xs font-semibold text-indigo-300 mb-6">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live random video chat
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Talk to Strangers.<br />
          <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">Meet Someone New.</span>
        </h1>
        <p className="mt-5 text-slate-300 max-w-xl mx-auto">
          IndiaomeTV connects you with a random person for a 1-to-1 video chat. Press <b>Next</b> to meet someone new. Conversations are peer-to-peer and never recorded.
        </p>
      </div>

      <div className="w-full max-w-xl mt-10">
        {!showGate ? (
          <div className="card p-6 space-y-4 text-center">
            <button className="btn-primary w-full text-lg !py-4" onClick={() => setShowGate(true)}>
              ▶ Start Video Chat
            </button>
            <button className="btn-ghost w-full" onClick={() => { setShowGate(true); }}>
              💬 Text Chat only
            </button>
            <p className="text-xs text-slate-500">Free · No signup · 18+ only</p>
          </div>
        ) : (
          <PermissionGate onContinue={handleContinue} />
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl w-full mt-12">
        {[
          { icon: '⚡', title: 'Instant match', text: 'Get paired in seconds with our queue.' },
          { icon: '🔒', title: 'Peer-to-peer', text: 'WebRTC keeps video/audio between you two.' },
          { icon: '🛡️', title: 'Report & block', text: 'One-tap safety controls on every call.' }
        ].map(f => (
          <div key={f.title} className="card p-5">
            <div className="text-2xl">{f.icon}</div>
            <div className="font-bold mt-2">{f.title}</div>
            <div className="text-sm text-slate-400 mt-1">{f.text}</div>
          </div>
        ))}
      </div>
      <DeveloperCard />
    </div>
  );
}
