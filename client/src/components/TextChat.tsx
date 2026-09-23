import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';

interface Msg { text: string; at: number; mine: boolean; system?: boolean; }

export default function TextChat({ socket, enabled, clearKey }: { socket: Socket | null; enabled: boolean; clearKey: string | number }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => { setMessages([]); }, [clearKey]);

  useEffect(() => {
    if (!socket) return;
    const onMsg = (m: { text: string; at: number }) => setMessages(prev => [...prev, { ...m, mine: false }]);
    socket.on('chat:message', onMsg);
    return () => { socket.off('chat:message', onMsg); };
  }, [socket]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const value = text.trim();
    if (!value || !socket || !enabled) return;
    socket.emit('chat:message', { text: value }, (resp: any) => {
      if (resp?.error) {
        setMessages(prev => [...prev, { text: `⚠ ${resp.error}`, at: Date.now(), mine: true, system: true }]);
        return;
      }
      setMessages(prev => [...prev, { text: value, at: resp?.at ?? Date.now(), mine: true }]);
      setText('');
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="text-sm font-semibold">Text chat</div>
        <div className={`text-xs ${enabled ? 'text-emerald-300' : 'text-slate-500'}`}>{enabled ? 'Connected' : 'Waiting…'}</div>
      </div>
      <div ref={scroller} className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.length === 0 && (
          <div className="text-sm text-slate-400 text-center mt-6">Say hi 👋</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] text-sm px-3 py-2 rounded-2xl animate-fade-in
            ${m.mine ? 'ml-auto bg-indigo-600/80 text-white' : 'bg-white/10 text-slate-100'} ${m.system ? 'opacity-80' : ''}`}>
            <div>{m.text}</div>
            <div className="text-[10px] opacity-60 mt-1">{new Date(m.at).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="border-t border-white/10 p-3 flex gap-2"
      >
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={enabled ? 'Type a message…' : 'Waiting for a match…'}
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none focus:border-indigo-400"
          disabled={!enabled}
          maxLength={500}
        />
        <button className="btn-primary !py-2 !px-4 text-sm" type="submit" disabled={!enabled || !text.trim()}>Send</button>
      </form>
    </div>
  );
}
