export interface QueueEntry {
  socketId: string;
  userId: string;
  name?: string;
  country?: string;
  joinedAt: number;
}

export interface Match {
  matchId: string;
  a: QueueEntry;
  b: QueueEntry;
  createdAt: number;
}

export class Matchmaker {
  queue: QueueEntry[] = [];
  matches = new Map<string, Match>();
  bySocket = new Map<string, string>();
  recent = new Map<string, Set<string>>();

  enqueue(entry: QueueEntry) {
    this.removeFromQueue(entry.socketId);
    this.queue.push(entry);
  }

  removeFromQueue(socketId: string) {
    this.queue = this.queue.filter(q => q.socketId !== socketId);
  }

  private compatible(a: QueueEntry, b: QueueEntry, isBlocked: (x: string, y: string) => boolean) {
    if (a.socketId === b.socketId) return false;
    if (a.userId === b.userId) return false;
    if (isBlocked(a.userId, b.userId)) return false;
    return true;
  }

  private score(a: QueueEntry, b: QueueEntry): number {
    const recentA = this.recent.get(a.userId);
    const recentB = this.recent.get(b.userId);
    let s = 0;
    if (recentA && recentA.has(b.userId)) s -= 100;
    if (recentB && recentB.has(a.userId)) s -= 100;
    if (a.country && b.country && a.country === b.country) s += 5;
    return s;
  }

  tryMatch(
    isBlocked: (x: string, y: string) => boolean,
    makeMatchId: () => string
  ): Match | null {
    if (this.queue.length < 2) return null;
    let best: { i: number; j: number; score: number } | null = null;
    for (let i = 0; i < this.queue.length; i++) {
      for (let j = i + 1; j < this.queue.length; j++) {
        const a = this.queue[i], b = this.queue[j];
        if (!this.compatible(a, b, isBlocked)) continue;
        const s = this.score(a, b);
        if (!best || s > best.score) best = { i, j, score: s };
      }
    }
    if (!best) return null;
    const a = this.queue[best.i];
    const b = this.queue[best.j];
    this.queue = this.queue.filter(q => q.socketId !== a.socketId && q.socketId !== b.socketId);

    const match: Match = { matchId: makeMatchId(), a, b, createdAt: Date.now() };
    this.matches.set(match.matchId, match);
    this.bySocket.set(a.socketId, match.matchId);
    this.bySocket.set(b.socketId, match.matchId);

    this.rememberPartner(a.userId, b.userId);
    this.rememberPartner(b.userId, a.userId);
    return match;
  }

  private rememberPartner(a: string, b: string) {
    if (!this.recent.has(a)) this.recent.set(a, new Set());
    const set = this.recent.get(a)!;
    set.add(b);
    if (set.size > 20) {
      const first = set.values().next().value;
      if (first) set.delete(first);
    }
  }

  endMatch(socketId: string): Match | null {
    const matchId = this.bySocket.get(socketId);
    if (!matchId) return null;
    const match = this.matches.get(matchId) || null;
    if (!match) return null;
    this.matches.delete(matchId);
    this.bySocket.delete(match.a.socketId);
    this.bySocket.delete(match.b.socketId);
    return match;
  }

  partnerOf(socketId: string): QueueEntry | null {
    const matchId = this.bySocket.get(socketId);
    if (!matchId) return null;
    const match = this.matches.get(matchId);
    if (!match) return null;
    return match.a.socketId === socketId ? match.b : match.a;
  }
}
