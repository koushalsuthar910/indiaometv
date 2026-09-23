import { Router } from 'express';
import { store } from '../services/store.js';
import { matchmakerMetrics } from '../websocket/index.js';
import { adminAuth } from '../middleware/adminAuth.js';

export const adminRouter = Router();
adminRouter.use(adminAuth);

adminRouter.get('/stats', (_req, res) => {
  const m = matchmakerMetrics();
  res.json({
    activeUsers: m.queue + m.matches * 2,
    inQueue: m.queue,
    activeMatches: m.matches,
    reports: store.reports.length,
    unresolvedReports: store.reports.filter(r => !r.resolved).length,
    blocks: store.blocks.length,
    bans: store.bans.length,
    sessions: store.sessions.size
  });
});

adminRouter.get('/matches', (_req, res) => {
  res.json(matchmakerMetrics().activeMatches);
});

adminRouter.get('/queue', (_req, res) => {
  res.json(matchmakerMetrics().queueEntries);
});

adminRouter.get('/reports', (_req, res) => {
  res.json(store.reports.slice(-200).reverse());
});

adminRouter.post('/reports/:id/resolve', (req, res) => {
  const r = store.reports.find(x => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Not found' });
  r.resolved = true;
  res.json(r);
});

adminRouter.get('/bans', (_req, res) => res.json(store.bans));

adminRouter.post('/ban', (req, res) => {
  const { userId, reason, durationMs } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const ban = store.ban(userId, reason || 'manual', durationMs ?? null);
  res.json(ban);
});

adminRouter.post('/unban', (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });
  store.unban(userId);
  res.json({ ok: true });
});

adminRouter.get('/blocks', (_req, res) => res.json(store.blocks));
adminRouter.get('/sessions', (_req, res) => res.json(Array.from(store.sessions.values()).slice(-200)));
