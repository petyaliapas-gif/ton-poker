import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { loadConfig } from './config.js';
import { log } from './log.js';
import { getPrisma, closePrisma } from './db.js';
import { CryptoPayClient } from './payments/cryptopay.js';
import { PricingService } from './payments/pricing.js';
import { RoomManager } from './room-manager.js';
import { createBot } from './bot.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerLobbyRoutes } from './routes/lobby.js';
import { registerCashierRoutes } from './routes/cashier.js';
import { registerStarsRoutes } from './routes/stars.js';
import { registerWebhookRoutes } from './routes/webhooks.js';
import { registerWebSocket } from './ws.js';

async function main(): Promise<void> {
  const cfg = loadConfig();
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport:
        cfg.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss.l' } }
          : undefined,
    },
  });
  await app.register(cors, { origin: true });
  await app.register(websocket);

  // Sanity-check DB connection (lazy on first query in dev).
  await getPrisma().$queryRaw`SELECT 1`.catch((err) => {
    log.error({ err: String(err) }, 'database connection failed');
    throw err;
  });

  const pricing = new PricingService(cfg);
  pricing.start();

  const cryptoPay = CryptoPayClient.fromConfig(cfg);
  if (!cryptoPay) {
    log.warn('CRYPTO_PAY_TOKEN not set — deposit/withdraw disabled');
  }

  const mgr = new RoomManager(cfg);

  const bot = createBot(cfg);

  registerAuthRoutes(app);
  registerLobbyRoutes(app, mgr);
  registerCashierRoutes(app, pricing, cryptoPay);
  registerStarsRoutes(app, bot, pricing);
  registerWebhookRoutes(app);
  registerWebSocket(app, mgr);

  app.get('/health', async () => ({ ok: true, ts: Date.now() }));

  // Start bot in long-poll mode for dev (use webhook in prod).
  if (cfg.NODE_ENV !== 'test') {
    void bot.start({
      onStart: (info) => log.info({ username: info.username }, 'bot started'),
    });
  }

  await app.listen({ host: '0.0.0.0', port: cfg.PORT });
  log.info({ port: cfg.PORT, env: cfg.NODE_ENV }, 'server listening');

  for (const sig of ['SIGINT', 'SIGTERM'] as const) {
    process.on(sig, async () => {
      log.info({ sig }, 'shutting down');
      pricing.stop();
      await bot.stop();
      await app.close();
      await closePrisma();
      process.exit(0);
    });
  }
}

main().catch((err) => {
  log.error({ err: String(err) }, 'fatal');
  process.exit(1);
});
