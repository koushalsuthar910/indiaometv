type Bucket = { tokens: number; reset: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || b.reset < now) {
    b = { tokens: max, reset: now + windowMs };
    buckets.set(key, b);
  }
  if (b.tokens <= 0) return false;
  b.tokens -= 1;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
}, 60_000).unref?.();
