import { useCallback, useRef, useState } from 'react';
import { getLocalMedia } from '../utils/webrtc';

export function useLocalMedia() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const request = useCallback(async (opts: { video: boolean; audio: boolean }) => {
    setError(null);
    try {
      const s = await getLocalMedia(opts);
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = s;
      setStream(s);
      return s;
    } catch (e: any) {
      const name = e?.name as string | undefined;
      let message = 'Unable to access camera/microphone.';
      if (name === 'NotAllowedError') message = opts.video ? 'Camera permission is required for video chat.' : 'Microphone permission is required for voice chat.';
      if (name === 'NotFoundError') message = 'No camera or microphone found. You can continue with audio-only.';
      setError(message);
      if (opts.video && opts.audio) {
        try {
          const audioOnly = await getLocalMedia({ video: false, audio: true });
          streamRef.current = audioOnly;
          setStream(audioOnly);
          return audioOnly;
        } catch { /* ignore */ }
      }
      throw e;
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setStream(null);
  }, []);

  return { stream, error, request, stop, streamRef };
}
