import { useState } from 'react';

export interface Consent {
  name: string;
  country: string;
  ageConfirmed: boolean;
  termsAccepted: boolean;
  mode: 'video' | 'text';
}

export default function PermissionGate({ onContinue }: { onContinue: (c: Consent) => void }) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [age, setAge] = useState(false);
  const [terms, setTerms] = useState(false);
  const [mode, setMode] = useState<'video' | 'text'>('video');

  const canStart = age && terms;

  return (
    <div className="card p-5 sm:p-6 space-y-4 animate-slide-up">
      <div>
        <h3 className="font-bold text-lg mb-1">Before you start</h3>
        <p className="text-sm text-slate-400">We'll ask your browser for camera and microphone permission when you press Start.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs text-slate-400">Display name (optional)</span>
          <input
            value={name}
            onChange={e => setName(e.target.value.slice(0, 24))}
            placeholder="e.g. Sam"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </label>
        <label className="block">
          <span className="text-xs text-slate-400">Country (optional)</span>
          <input
            value={country}
            onChange={e => setCountry(e.target.value.toUpperCase().slice(0, 2))}
            placeholder="IN, US…"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setMode('video')}
          className={`rounded-2xl px-4 py-3 border text-sm font-semibold transition ${mode === 'video' ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
        >🎥 Video chat</button>
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`rounded-2xl px-4 py-3 border text-sm font-semibold transition ${mode === 'text' ? 'bg-indigo-600 border-indigo-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
        >💬 Text only</button>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" checked={age} onChange={e => setAge(e.target.checked)} className="mt-1 accent-indigo-500" />
        <span>I confirm I am <b>18 or older</b>. IndiaomeTV is intended for adults only.</span>
      </label>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} className="mt-1 accent-indigo-500" />
        <span>
          I agree to the <a className="text-indigo-300 underline" href="/terms" target="_blank">Terms of Service</a> and{' '}
          <a className="text-indigo-300 underline" href="/safety" target="_blank">Community Guidelines</a>.
        </span>
      </label>

      <button
        className="btn-primary w-full"
        disabled={!canStart}
        onClick={() => onContinue({ name, country, ageConfirmed: age, termsAccepted: terms, mode })}
      >
        Start {mode === 'video' ? 'Video ' : ''}Chat
      </button>
      <p className="text-[11px] text-slate-500 text-center">
        We never record or store your video or audio. See <a className="underline" href="/privacy" target="_blank">Privacy</a>.
      </p>
    </div>
  );
}
