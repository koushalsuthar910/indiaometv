import { useEffect, useRef } from 'react';

export function LocalPreview({ stream, muted }: { stream: MediaStream | null; muted?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted ?? true}
      className="w-full h-full object-cover"
    />
  );
}

export function RemoteVideo({ stream, videoRef }: { stream: MediaStream | null; videoRef?: React.RefObject<HTMLVideoElement> }) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const ref = videoRef ?? internalRef;
  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream;
    }
  }, [stream, ref]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      className="w-full h-full object-cover"
    />
  );
}
