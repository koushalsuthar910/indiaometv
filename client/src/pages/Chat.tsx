import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import ControlBar from '../components/ControlBar';
import { LocalPreview, RemoteVideo } from '../components/VideoPanel';
import TextChat from '../components/TextChat';
import DevPanel from '../components/DevPanel';
import { useLocalMedia } from '../hooks/useLocalMedia';
import { useWebRTC } from '../hooks/useWebRTC';
import { useSession } from '../contexts/SessionContext';
import { useToast } from '../contexts/ToastContext';

type Status = 'idle' | 'permission' | 'waiting' | 'connecting' | 'connected' | 'ended' | 'error';

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const mode: 'video' | 'text' = location.state?.mode ?? 'video';

  const { session, update } = useSession();
  const { push } = useToast();

  const local = useLocalMedia();
  const socketRef = useRef<Socket | null>(null);
  const [socketReady, setSocketReady] = useState(false);
  const socket = socketRef.current;

  const [status, setStatus] = useState<Status>('permission');
  const [peerInfo, setPeerInfo] = useState<{ name?: string; country?: string } | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  const [micOn, setMicOn] = useState(mode === 'video');
  const [camOn, setCamOn] = useState(mode === 'video');
  const remoteRef = useRef<HTMLVideoElement>(null);

  const webrtc = useWebRTC(() => socketRef.current, local.stream);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await local.request({ video: mode === 'video', audio: true });
        if (cancelled) return;
        s.getAudioTracks().forEach(t => (t.enabled = micOn));
        s.getVideoTracks().forEach(t => (t.enabled = camOn));
        setStatus('waiting');
      } catch {
        push('Camera/microphone permission was denied.', 'error');
        setStatus('error');
      }
    })();
    return () => { cancelled = true; local.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!local.stream) return;
    const url = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    const s = io(url, { transports: ['websocket'], reconnection: true, reconnectionAttempts: 5 });
    socketRef.current = s;

    s.on('connect', () => {
      setSocketReady(true);
      s.emit('session:init', {
        sessionId: session?.sessionId,
        name: session?.name,
        country: session?.country
      }, (resp: { sessionId: string }) => {
        if (resp?.sessionId && resp.sessionId !== session?.sessionId) {
          update({ sessionId: resp.sessionId });
        }
        s.emit('queue:join');
      });
    });

    s.on('disconnect', () => {
      setSocketReady(false);
      push('Disconnected from IndiaomeTV. Trying to reconnect…', 'error');
    });

    s.on('queue:waiting', () => setStatus('waiting'));

    s.on('match:found', async (payload: { matchId: string; initiator: boolean; peer: { name?: string; country?: string } }) => {
      setMatchId(payload.matchId);
      setPeerInfo(payload.peer ?? null);
      setStatus('connecting');
      setChatKey(k => k + 1);
      await webrtc.start(payload.initiator);
    });

    s.on('signal:offer', async ({ sdp }: any) => { await webrtc.handleOffer(sdp); });
    s.on('signal:answer', async ({ sdp }: any) => { await webrtc.handleAnswer(sdp); });
    s.on('signal:ice', async ({ candidate }: any) => { await webrtc.handleIce(candidate); });

    s.on('match:ended', ({ reason }: { reason: string }) => {
      webrtc.close();
      setMatchId(null);
      setPeerInfo(null);
      if (reason === 'disconnected') push('The other person left the chat.', 'info');
      if (reason === 'blocked') push('You blocked this user.', 'success');
      setStatus('waiting');
    });

    return () => {
      s.emit('queue:leave');
      s.removeAllListeners();
      s.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [local.stream]);

  useEffect(() => {
    if (webrtc.state === 'connected' && status !== 'connected') setStatus('connected');
    if (webrtc.state === 'failed' && (status === 'connecting' || status === 'connected')) {
      push('Connection failed. Trying another person…', 'error');
      handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webrtc.state]);

  const handleNext = useCallback(() => {
    webrtc.close();
    setMatchId(null);
    setPeerInfo(null);
    socketRef.current?.emit('chat:next');
    setStatus('waiting');
  }, [webrtc]);

  const handleEnd = useCallback(() => {
    webrtc.close();
    socketRef.current?.emit('match:end');
    local.stop();
    navigate('/');
  }, [webrtc, local, navigate]);

  const toggleMic = useCallback(() => {
    local.stream?.getAudioTracks().forEach(t => (t.enabled = !micOn));
    setMicOn(v => !v);
  }, [local.stream, micOn]);

  const toggleCam = useCallback(async () => {
    if (!local.stream) return;
    const next = !camOn;
    local.stream.getVideoTracks().forEach(t => (t.enabled = next));
    setCamOn(next);
  }, [local.stream, camOn]);

  const handleReport = useCallback(() => {
    const reason = window.prompt(
      'Why are you reporting this user?\nOptions: nudity, harassment, hate, spam, scam, underage, other'
    );
    if (!reason) return;
    const valid = ['nudity','harassment','hate','spam','scam','underage','other'];
    const r = reason.trim().toLowerCase();
    if (!valid.includes(r)) { push('Invalid reason. Please use one of: ' + valid.join(', '), 'error'); return; }
    socketRef.current?.emit('user:report', { reason: r }, (resp: any) => {
      if (resp?.error) push('Report failed: ' + resp.error, 'error');
      else push('Thank you. Your report was submitted.', 'success');
    });
  }, [push]);

  const handleBlock = useCallback(() => {
    if (!confirm('Block this user? You will not be matched with them again.')) return;
    socketRef.current?.emit('user:block', {}, () => push('User blocked.', 'success'));
  }, [push]);

  const handleFullscreen = useCallback(() => {
    const el = remoteRef.current?.parentElement as HTMLElement | null;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  }, []);

  const statusLabel = useMemo(() => ({
    permission: 'Requesting camera/mic…',
    waiting: 'Looking for someone to chat with…',
    connecting: 'Connecting…',
    connected: 'Connected',
    ended: 'Chat ended',
    error: 'Error',
    idle: ''
  } as Record<Status, string>)[status], [status]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[#0b0b14]">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="relative flex-1 min-h-0 bg-black/60 overflow-hidden">
          <div className="absolute inset-0">
            {webrtc.remoteStream && status === 'connected' ? (
              <RemoteVideo stream={webrtc.remoteStream} videoRef={remoteRef} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-300">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-30 animate-ping absolute inset-0" />
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center">
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                </div>
                <div className="text-center px-6">
                  <div className="text-lg font-bold">{statusLabel || 'Ready'}</div>
                  {status === 'waiting' && <div className="text-sm text-slate-400 mt-1">Tip: make sure your camera and mic are working.</div>}
                </div>
              </div>
            )}
          </div>

          {peerInfo && status === 'connected' && (
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur border border-white/10 text-xs flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-semibold">{peerInfo.name || 'Stranger'}</span>
              {peerInfo.country && <span className="text-slate-400">· {peerInfo.country}</span>}
            </div>
          )}

          <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur border border-white/10 text-xs">
            {status === 'connected' ? <span className="text-emerald-300">● Live</span>
              : status === 'connecting' ? <span className="text-amber-300">● Connecting</span>
              : <span className="text-slate-300">● {statusLabel}</span>}
          </div>

          <div className="absolute bottom-3 right-3 w-28 sm:w-40 aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-black">
            {local.stream ? (
              <LocalPreview stream={local.stream} muted />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No camera</div>
            )}
            {!camOn && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] text-slate-300">Camera off</div>
            )}
            {!micOn && (
              <div className="absolute top-1 left-1 bg-rose-600 text-white rounded-full text-[10px] px-2 py-0.5">muted</div>
            )}
          </div>
        </div>

        <ControlBar
          micOn={micOn}
          camOn={camOn}
          onToggleMic={toggleMic}
          onToggleCam={toggleCam}
          onNext={handleNext}
          onEnd={handleEnd}
          onReport={handleReport}
          onBlock={handleBlock}
          onFullscreen={handleFullscreen}
          canNext={socketReady && status !== 'permission'}
        />
      </div>

      <div className="lg:w-80 lg:border-l border-t lg:border-t-0 border-white/10 bg-white/[.03] flex flex-col h-64 lg:h-auto">
        <TextChat socket={socket} enabled={status === 'connected'} clearKey={chatKey} />
      </div>

      {import.meta.env.VITE_DEV_PANEL === 'true' && (
        <DevPanel
          data={{
            session: session?.sessionId?.slice(0, 10) ?? '—',
            socket: socketReady ? 'connected' : 'offline',
            match: matchId ?? '—',
            status,
            rtc: webrtc.state,
            ice: webrtc.iceState,
            signaling: webrtc.sigState,
            mic: micOn, cam: camOn
          }}
        />
      )}
    </div>
  );
}
