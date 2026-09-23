import { newId } from '../utils/ids.js';

export interface Session {
  id: string;
  createdAt: number;
  ip?: string;
  userAgent?: string;
  banned?: boolean;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  details?: string;
  matchId?: string;
  createdAt: number;
  resolved: boolean;
}

export interface Block {
  id: string;
  userId: string;
  blockedId: string;
  createdAt: number;
}

export interface Ban {
  id: string;
  userId: string;
  reason: string;
  expiresAt: number | null;
  createdAt: number;
}

class Store {
  sessions = new Map<string, Session>();
  reports: Report[] = [];
  blocks: Block[] = [];
  bans: Ban[] = [];

  createSession(ip?: string, userAgent?: string): Session {
    const s: Session = { id: newId('s_'), createdAt: Date.now(), ip, userAgent };
    this.sessions.set(s.id, s);
    return s;
  }

  getSession(id: string) { return this.sessions.get(id); }

  isBanned(userId: string): Ban | undefined {
    const now = Date.now();
    return this.bans.find(b => b.userId === userId && (b.expiresAt === null || b.expiresAt > now));
  }

  addReport(r: Omit<Report, 'id' | 'createdAt' | 'resolved'>): Report {
    const report: Report = { ...r, id: newId('r_'), createdAt: Date.now(), resolved: false };
    this.reports.push(report);
    return report;
  }

  addBlock(userId: string, blockedId: string): Block {
    const existing = this.blocks.find(b => b.userId === userId && b.blockedId === blockedId);
    if (existing) return existing;
    const b: Block = { id: newId('b_'), userId, blockedId, createdAt: Date.now() };
    this.blocks.push(b);
    const rev: Block = { id: newId('b_'), userId: blockedId, blockedId: userId, createdAt: Date.now() };
    this.blocks.push(rev);
    return b;
  }

  isBlocked(a: string, b: string) {
    return this.blocks.some(x =>
      (x.userId === a && x.blockedId === b) || (x.userId === b && x.blockedId === a)
    );
  }

  ban(userId: string, reason: string, durationMs: number | null = null): Ban {
    const b: Ban = {
      id: newId('ban_'),
      userId,
      reason,
      expiresAt: durationMs ? Date.now() + durationMs : null,
      createdAt: Date.now()
    };
    this.bans.push(b);
    return b;
  }

  unban(userId: string) {
    this.bans = this.bans.filter(b => b.userId !== userId);
  }
}

export const store = new Store();
