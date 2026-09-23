/**
 * Basic server-side moderation hooks.
 * This is intentionally minimal and does NOT claim to detect all abuse.
 * Plug in an external moderation provider here later.
 */
export interface ModerationVerdict {
  allow: boolean;
  reason?: string;
}

const PROFANITY = [/f+u+c+k+/i, /s+h+i+t+/i];

export function moderateMessage(text: string): ModerationVerdict {
  if (typeof text !== 'string' || text.length === 0) return { allow: false, reason: 'empty' };
  if (text.length > 500) return { allow: false, reason: 'too_long' };
  for (const rx of PROFANITY) {
    if (rx.test(text)) return { allow: false, reason: 'profanity' };
  }
  return { allow: true };
}

export function moderateReport(reason: string): ModerationVerdict {
  const allowed = ['nudity','harassment','hate','spam','scam','underage','other'];
  return allowed.includes(reason) ? { allow: true } : { allow: false, reason: 'invalid_reason' };
}
