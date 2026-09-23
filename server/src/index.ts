import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server as IOServer } from 'socket.io';
import { config } from './config.js';
import { adminRouter } from './routes/admin.js';
import { reportsRouter } from './routes/reports.js';
import { attachSocket } from './websocket/index.js';
import { rateLimit } from './middleware/rateLimit.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '64kb' }));

app.use((req, res, next) => {
  const key = `http:${req.ip}`;
  if (!rateLimit(key, 120, 60_000)) return res.status(429).json({ error: 'Too many requests' });
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true, name: 'IndiaomeTV', env: config.nodeEnv }));
app.use('/api/reports', reportsRouter);
app.use('/api/admin', adminRouter);

const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: config.clientUrl, credentials: true },
  maxHttpBufferSize: 64 * 1024
});

attachSocket(io);

server.listen(config.port, () => {
  console.log(`[IndiaomeTV] server listening on :${config.port}`);
});
