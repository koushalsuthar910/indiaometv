import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  adminToken: process.env.ADMIN_TOKEN || 'dev-admin-token',
  sessionSecret: process.env.SESSION_SECRET || 'dev-session-secret',
  databaseUrl: process.env.DATABASE_URL || '',
  turn: {
    url: process.env.TURN_SERVER || '',
    username: process.env.TURN_USERNAME || '',
    password: process.env.TURN_PASSWORD || ''
  }
};

export const isProd = config.nodeEnv === 'production';
