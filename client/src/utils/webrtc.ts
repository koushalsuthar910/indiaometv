export function iceServers(): RTCIceServer[] {
  const servers: RTCIceServer[] = [];

  const stun = (import.meta.env.VITE_STUN_SERVER as string | undefined) || 'stun:stun.l.google.com:19302';
  stun
    .split(',')
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
    .forEach((url: string) => servers.push({ urls: url }));

  const turnUrl = import.meta.env.VITE_TURN_SERVER as string | undefined;
  const turnUser = import.meta.env.VITE_TURN_USERNAME as string | undefined;
  const turnPass = import.meta.env.VITE_TURN_PASSWORD as string | undefined;

  if (turnUrl) {
    turnUrl
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0)
      .forEach((url: string) => {
        servers.push({ urls: url, username: turnUser, credential: turnPass });
      });
  }

  return servers;
}

export async function getLocalMedia(opts: { video: boolean; audio: boolean }): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new DOMException('getUserMedia not supported', 'NotSupportedError');
  }
  return navigator.mediaDevices.getUserMedia({
    video: opts.video ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } : false,
    audio: opts.audio
  });
}
