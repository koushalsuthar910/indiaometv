import type { Server as IOServer, Socket } from 'socket.io';
import { store } from '../services/store.js';
import { moderateMessage, moderateReport } from '../services/moderation.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { Matchmaker, type QueueEntry } from './matchmaking.js';
import { newId } from '../utils/ids.js';
import { config } from '../config.js';

const matchmaker = new Matchmaker();

export function attachSocket(io: IOServer) {
  (io as any).__metrics = {
    connected: 0,
    inQueue: () => matchmaker.queue.length,
    matches: () => matchmaker.matches.size
  };

  io.on('connection', (socket: Socket) => {
    (io as any).__metrics.connected++;

    let sessionId: string | null = null;
    let userId: string | null = null;
    let entry: QueueEntry | null = null;
    const msgTimes: number[] = [];

    // ---------- Session ----------
    socket.on(
      'session:init',
      (payload: { sessionId?: string; name?: string; country?: string }, ack?: Function) => {
        const existing = payload?.sessionId ? store.getSession(payload.sessionId) : undefined;
        const session =
          existing ??
          store.createSession(socket.handshake.address, socket.handshake.headers['user-agent']);
        sessionId = session.id;
        userId = session.id;
        entry = {
          socketId: socket.id,
          userId: session.id,
          name: payload?.name?.slice(0, 24),
          country: payload?.country?.slice(0, 3),
          joinedAt: Date.now()
        };
        ack?.({ sessionId: session.id });
      }
    );

    const ensureEntry = (): QueueEntry | null => entry;

    // ---------- Queue ----------
    socket.on('queue:join', () => {
      if (!userId || !ensureEntry()) {
        return socket.emit('error:app', { message: 'Session not initialized' });
      }
      const ban = store.isBanned(userId);
      if (ban) {
        socket.emit('error:app', { message: 'You are temporarily banned from IndiaomeTV.' });
        return;
      }
      endCurrentMatch('skip');
      matchmaker.enqueue(entry!);
      socket.emit('queue:waiting');
      tryCreateMatch(io);
    });

    socket.on('queue:leave', () => {
      if (!entry) return;
      matchmaker.removeFromQueue(entry.socketId);
      socket.emit('queue:left');
    });

    // ---------- Next / End ----------
    socket.on('chat:next', () => {
      endCurrentMatch('skip');
      if (!entry) return;
      matchmaker.enqueue(entry);
      socket.emit('queue:waiting');
      tryCreateMatch(io);
    });

    socket.on('match:end', () => {
      endCurrentMatch('ended');
      socket.emit('queue:left');
    });

    // ---------- Signaling ----------
    const relay = (event: string, payload: any) => {
      const partner = matchmaker.partnerOf(socket.id);
      if (!partner) return;
      io.to(partner.socketId).emit(event, payload);
    };

    socket.on('signal:offer', (sdp) => relay('signal:offer', { sdp }));
    socket.on('signal:answer', (sdp) => relay('signal:answer', { sdp }));
    socket.on('signal:ice', (candidate) => relay('signal:ice', { candidate }));

    // ---------- Text chat ----------
    socket.on('chat:message', (payload: { text: string }, ack?: Function) => {
      if (!userId) return;
      const now = Date.now();
      msgTimes.push(now);
      while (msgTimes.length && msgTimes[0] < now - 5000) msgTimes.shift();
      if (msgTimes.length > 5) return ack?.({ error: 'rate_limited' });
      if (!rateLimit(`chat:${userId}`, 30, 60_000)) return ack?.({ error: 'rate_limited' });

      const verdict = moderateMessage(payload?.text ?? '');
      if (!verdict.allow) return ack?.({ error: verdict.reason });

      const partner = matchmaker.partnerOf(socket.id);
      if (!partner) return ack?.({ error: 'no_partner' });
      const safe = String(payload.text).slice(0, 500);
      io.to(partner.socketId).emit('chat:message', { text: safe, at: now });
      ack?.({ ok: true, at: now });
    });

    // ---------- Report ----------
    socket.on(
      'user:report',
      (payload: { reason: string; details?: string }, ack?: Function) => {
        if (!userId) return ack?.({ error: 'no_session' });
        if (!rateLimit(`report:${userId}`, 5, 60_000)) return ack?.({ error: 'rate_limited' });
        const verdict = moderateReport(payload?.reason);
        if (!verdict.allow) return ack?.({ error: 'invalid_reason' });
        const partner = matchmaker.partnerOf(socket.id);
        if (!partner) return ack?.({ error: 'no_partner' });
        const report = store.addReport({
          reporterId: userId,
          reportedId: partner.userId,
          reason: payload.reason,
          details: (payload.details || '').slice(0, 500),
          matchId: matchmaker.bySocket.get(socket.id)
        });
        ack?.({ ok: true, reportId: report.id });
      }
    );

    // ---------- Block ----------
    socket.on('user:block', (_payload, ack?: Function) => {
      if (!userId) return ack?.({ error: 'no_session' });
      const partner = matchmaker.partnerOf(socket.id);
      if (!partner) return ack?.({ error: 'no_partner' });
      store.addBlock(userId, partner.userId);
      ack?.({ ok: true });
      endCurrentMatch('blocked');
      if (entry) {
        matchmaker.enqueue(entry);
        socket.emit('queue:waiting');
        tryCreateMatch(io);
      }
    });

    // ---------- Disconnect ----------
    socket.on('disconnect', () => {
      (io as any).__metrics.connected = Math.max(0, (io as any).__metrics.connected - 1);
      endCurrentMatch('disconnected');
      if (entry) matchmaker.removeFromQueue(entry.socketId);
    });

    // ---------- Match lifecycle ----------
    /**
     * Ends the current match for `socket` and decides what happens to the
     * partner. Called from every path that tears down a session.
     *
     *  - 'skip'         → user pressed Next. Partner is re-queued.
     *  - 'blocked'      → user pressed Block. Partner is re-queued.
     *  - 'ended'        → user pressed End (going home). Partner is dropped.
     *  - 'disconnected' → user closed tab / lost connection. Partner is dropped.
     */
    function endCurrentMatch(reason: 'skip' | 'ended' | 'blocked' | 'disconnected') {
      const match = matchmaker.endMatch(socket.id);
      if (!match) return;

      const other = match.a.socketId === socket.id ? match.b : match.a;

      // Notify the other side that the match ended.
      io.to(other.socketId).emit('match:ended', { reason });

      // Explicit end or a dropped socket → do not re-queue the partner.
      if (reason === 'ended' || reason === 'disconnected') {
        matchmaker.removeFromQueue(other.socketId);
        return;
      }

      // Skip or Block → re-queue the partner so they immediately look for
      // someone new instead of sitting idle on a dead match.
      const otherSocket = io.sockets.sockets.get(other.socketId);
      if (otherSocket && otherSocket.connected) {
        matchmaker.enqueue(other);
        io.to(other.socketId).emit('queue:waiting');
        // Kick the matcher now that a fresh candidate is available.
        tryCreateMatch(io);
      }
    }
  });

  // ---------- Matcher ----------
  function tryCreateMatch(io: IOServer) {
    // Loop until no more matches are possible.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const match = matchmaker.tryMatch(
        (a, b) => store.isBlocked(a, b),
        () => newId('m_')
      );
      if (!match) break;

      // A is the initiator (creates the offer).
      io.to(match.a.socketId).emit('match:found', {
        matchId: match.matchId,
        initiator: true,
        peer: { name: match.b.name, country: match.b.country }
      });
      io.to(match.b.socketId).emit('match:found', {
        matchId: match.matchId,
        initiator: false,
        peer: { name: match.a.name, country: match.a.country }
      });
    }
  }
}

// ---------- Metrics (used by admin routes) ----------
export function matchmakerMetrics() {
  return {
    queue: matchmaker.queue.length,
    matches: matchmaker.matches.size,
    queueEntries: matchmaker.queue.map((q) => ({
      userId: q.userId,
      country: q.country,
      joinedAt: q.joinedAt
    })),
    activeMatches: Array.from(matchmaker.matches.values()).map((m) => ({
      matchId: m.matchId,
      a: m.a.userId,
      b: m.b.userId,
      createdAt: m.createdAt
    }))
  };
}

export { config };