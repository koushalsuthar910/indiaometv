import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface Session { sessionId: string; name?: string; country?: string; }
interface Ctx {
  session: Session | null;
  setSession: (s: Session) => void;
  update: (patch: Partial<Session>) => void;
}

const SessionCtx = createContext<Ctx>({ session: null, setSession: () => {}, update: () => {} });
export const useSession = () => useContext(SessionCtx);

const KEY = 'indiaometv.session';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<Session | null>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const setSession = (s: Session) => {
    setSessionState(s);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
  };
  const update = (patch: Partial<Session>) => {
    setSessionState(prev => {
      const next = { ...(prev ?? { sessionId: '' }), ...patch } as Session;
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  useEffect(() => {}, []);
  return <SessionCtx.Provider value={{ session, setSession, update }}>{children}</SessionCtx.Provider>;
}
