import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { verifyInitData } from '../auth/telegram.js';
import { loadConfig, tonToNano } from '../config.js';
import { getPrisma } from '../db.js';
import type { CryptoPayClient } from '../payments/cryptopay.js';
import type { PricingService } from '../payments/pricing.js';

const DepositBody = z.object({
  initData: z.string(),
  amountTon: z.string().regex(/^\d+(\.\d+)?$/),
});
const WithdrawBody = z.object({
  initData: z.string(),
  amountTon: z.string().regex(/^\d+(\.\d+)?$/),
});

export function registerCashierRoutes(
  app: FastifyInstance,
  pricing: PricingService,
  cryptoPay: CryptoPayClient | null,
): void {
  const cfg = loadConfig();
  const db = getPrisma();

  app.get('/api/cashier/conversion', async () => {
    return {
      tonUsd: pricing.tonUsd,
      conversion: pricing.conversion(),
      packages: pricing.packages(),
      starsUsd: cfg.STAR_USD_PRICE,
      tgFee: cfg.TG_STAR_FEE_RATIO,
      margin: cfg.STARS_MARGIN,
    };
  });

  app.post('/api/cashier/deposit', async (req, reply) => {
    const parsed = DepositBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'bad body' });
    const { initData, amountTon } = parsed.data;
    if (!cryptoPay) return reply.code(503).send({ error: 'CryptoPay not configured' });

    const auth = verifyInitData(initData, cfg.TELEGRAM_BOT_TOKEN);
    if (!auth.user) return reply.code(401).send({ error: 'no user' });

    const nano = tonToNano(amountTon);
    if (nano < tonToNano(cfg.MIN_DEPOSIT_TON)) {
      return reply.code(400).send({ error: `min deposit is ${cfg.MIN_DEPOSIT_TON} TON` });
    }

    const user = await db.user.findUnique({ where: { telegramId: BigInt(auth.user.id) } });
    if (!user) return reply.code(401).send({ error: 'user missing' });

    const inv = await cryptoPay.createInvoice({
      asset: 'TON',
      amount: amountTon,
      description: `TON Poker — пополнение баланса`,
      payload: `deposit:${user.id}`,
      paid_btn_name: 'callback',
      paid_btn_url: cfg.PUBLIC_URL,
      expires_in: 30 * 60,
    });

    await db.transaction.create({
      data: {
        userId: user.id,
        kind: 'DEPOSIT_TON_CRYPTOBOT',
        amountTon: nano,
        externalId: String(inv.invoice_id),
        status: 'PENDING',
        meta: {
          asset: 'TON',
          amount: amountTon,
          pay_url: inv.pay_url,
          mini_app_invoice_url: inv.mini_app_invoice_url,
        },
      },
    });

    return {
      payUrl: inv.pay_url,
      miniAppUrl: inv.mini_app_invoice_url,
      invoiceId: inv.invoice_id,
      expiresIn: 30 * 60,
    };
  });

  app.post('/api/cashier/withdraw', async (req, reply) => {
    const parsed = WithdrawBody.safeParse(req.body);
    if (!parsed.success) return reply.code(400).send({ error: 'bad body' });
    const { initData, amountTon } = parsed.data;
    if (!cryptoPay) return reply.code(503).send({ error: 'CryptoPay not configured' });

    const auth = verifyInitData(initData, cfg.TELEGRAM_BOT_TOKEN);
    if (!auth.user) return reply.code(401).send({ error: 'no user' });

    const nano = tonToNano(amountTon);
    if (nano < tonToNano(cfg.MIN_WITHDRAW_TON)) {
      return reply.code(400).send({ error: `min withdrawal is ${cfg.MIN_WITHDRAW_TON} TON` });
    }
    const fee = tonToNano(cfg.WITHDRAW_FEE_TON);
    const total = nano + fee;

    const user = await db.user.findUnique({ where: { telegramId: BigInt(auth.user.id) } });
    if (!user) return reply.code(401).send({ error: 'user missing' });
    if (user.balanceTon < total) {
      return reply.code(400).send({ error: 'insufficient balance' });
    }

    // Deduct first; if transfer fails, reverse.
    await db.user.update({
      where: { id: user.id },
      data: { balanceTon: user.balanceTon - total },
    });
    try {
      const check = await cryptoPay.createCheck({
        asset: 'TON',
        amount: amountTon,
        pin_to_user_id: Number(user.telegramId),
      });
      await db.transaction.create({
        data: {
          userId: user.id,
          kind: 'WITHDRAW_TON_CRYPTOBOT',
          amountTon: -total,
          externalId: String(check.check_id),
          status: 'CONFIRMED',
          meta: { fee: cfg.WITHDRAW_FEE_TON, bot_check_url: check.bot_check_url },
        },
      });
      return { ok: true, claimUrl: check.bot_check_url };
    } catch (err) {
      // Rollback
      await db.user.update({
        where: { id: user.id },
        data: { balanceTon: { increment: total } },
      });
      req.log.error({ err: String(err) }, 'withdraw failed');
      return reply.code(500).send({ error: 'withdrawal failed' });
    }
  });
}
