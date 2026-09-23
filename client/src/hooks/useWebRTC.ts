import { useCallback, useRef, useState } from 'react';
import { iceServers } from '../utils/webrtc';

export type RTCState = 'idle' | 'connecting' | 'connected' | 'failed' | 'disconnected';

/**
 * useWebRTC — manages a single RTCPeerConnection for the current match.
 *
 * The socket is read lazily through a getter so that it works even if the
 * socket is created AFTER this hook is initialised (which is the case here:
 * the socket lives in a useEffect and this hook is called earlier).
 */
export function useWebRTC(
  getSocket: () => { emit: (ev: string, ...args: any[]) => void } | null,
  localStream: MediaStream | null
) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const pendingIce = useRef<RTCIceCandidateInit[]>([]);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [state, setState] = useState<RTCState>('idle');
  const [iceState, setIceState] = useState<RTCIceConnectionState>('new');
  const [sigState, setSigState] = useState<RTCSignalingState>('stable');

  const close = useCallback(() => {
    pcRef.current?.getSenders().forEach(s => { try { s.track?.stop?.(); } catch {} });
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    pendingIce.current = [];
    setRemoteStream(null);
    setState('idle');
    setIceState('new');
    setSigState('stable');
  }, []);

  const start = useCallback(async (initiator: boolean) => {
    const socket = getSocket();
    if (!socket || !localStream) return;
    close();

    const pc = new RTCPeerConnection({ iceServers: iceServers() });
    pcRef.current = pc;

    const remote = new MediaStream();
    setRemoteStream(remote);

    localStream.getTracks().forEach(t => pc.addTrack(t, localStream));

    pc.ontrack = (e) => {
      e.streams[0].getTracks().forEach(track => {
        if (!remote.getTracks().some(t => t.id === track.id)) remote.addTrack(track);
      });
      setRemoteStream(new MediaStream(remote.getTracks()));
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('signal:ice', e.candidate.toJSON());
    };

    pc.onconnectionstatechange = () => {
      const s = pc.connectionState;
      if (s === 'connected') setState('connected');
      else if (s === 'connecting') setState('connecting');
      else if (s === 'failed') setState('failed');
      else if (s === 'disconnected' || s === 'closed') setState('disconnected');
    };
    pc.oniceconnectionstatechange = () => setIceState(pc.iceConnectionState);
    pc.onsignalingstatechange = () => setSigState(pc.signalingState);

    if (initiator) {
      setState('connecting');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('signal:offer', { type: offer.type, sdp: offer.sdp });
    } else {
      setState('connecting');
    }
  }, [getSocket, localStream, close]);

  const handleOffer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    const socket = getSocket();
    const pc = pcRef.current;
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    for (const c of pendingIce.current) { try { await pc.addIceCandidate(c); } catch {} }
    pendingIce.current = [];
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket?.emit('signal:answer', { type: answer.type, sdp: answer.sdp });
  }, [getSocket]);

  const handleAnswer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    const pc = pcRef.current;
    if (!pc) return;
    if (pc.signalingState === 'have-local-offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      for (const c of pendingIce.current) { try { await pc.addIceCandidate(c); } catch {} }
      pendingIce.current = [];
    }
  }, []);

  const handleIce = useCallback(async (candidate: RTCIceCandidateInit) => {
    const pc = pcRef.current;
    if (!pc) return;
    if (!pc.remoteDescription || pc.remoteDescription.type === undefined) {
      pendingIce.current.push(candidate);
      return;
    }
    try { await pc.addIceCandidate(candidate); } catch {}
  }, []);

  const replaceVideoTrack = useCallback(async (track: MediaStreamTrack | null) => {
    const pc = pcRef.current;
    if (!pc) return;
    const sender = pc.getSenders().find(s => s.track?.kind === 'video');
    if (sender) await sender.replaceTrack(track);
  }, []);

  return { start, close, handleOffer, handleAnswer, handleIce, replaceVideoTrack, remoteStream, state, iceState, sigState };
}