import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

type Toast = { id: number; message: string; kind: 'info' | 'success' | 'error' };
type Ctx = { push: (message: string, kind?: Toast['kind']) => void };

const ToastCtx = createContext<Ctx>({ push: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, kind: Toast['kind'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className={`animate-slide-up pointer-events-auto px-4 py-3 rounded-2xl shadow-lg border text-sm font-medium
              ${t.kind === 'error' ? 'bg-rose-600/90 border-rose-400/40'
                : t.kind === 'success' ? 'bg-emerald-600/90 border-emerald-400/40'
                : 'bg-indigo-600/90 border-indigo-400/40'} text-white`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
