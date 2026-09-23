import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(url: string, enabled: boolean) {
  const ref = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const s = io(url, { transports: ['websocket'] });
    ref.current = s;
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    return () => { s.disconnect(); ref.current = null; };
  }, [url, enabled]);
  return { socket: ref.current, connected };
}
