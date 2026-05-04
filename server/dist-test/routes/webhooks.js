import { CryptoPayClient } from '../payments/cryptopay.js';
import { loadConfig } from '../config.js';
import { getPrisma } from '../db.js';
/**
 * Crypto Pay webhook. Telegram-side BotPayments (Stars) webhooks are handled
 * via grammy's pre_checkout/successful_payment handlers, not here.
 */
export function registerWebhookRoutes(app) {
    const cfg = loadConfig();
    const db = getPrisma();
    app.post('/webhooks/cryptopay', async (req, reply) => {
        const sig = req.headers['crypto-pay-api-signature'];
        if (typeof sig !== 'string' || !cfg.CRYPTO_PAY_TOKEN) {
            return reply.code(401).send({ ok: false });
        }
        const raw = JSON.stringify(req.body);
        const valid = CryptoPayClient.verifyWebhook(cfg.CRYPTO_PAY_TOKEN, sig, raw);
        if (!valid)
            return reply.code(401).send({ ok: false });
        const body = req.body;
        if (body.update_type === 'invoice_paid' && body.payload.status === 'paid') {
            const invoiceId = String(body.payload.invoice_id);
            const txn = await db.transaction.findFirst({
                where: { externalId: invoiceId, kind: 'DEPOSIT_TON_CRYPTOBOT', status: 'PENDING' },
            });
            if (txn) {
                await db.$transaction([
                    db.transaction.update({
                        where: { id: txn.id },
                        data: { status: 'CONFIRMED' },
                    }),
                    db.user.update({
                        where: { id: txn.userId },
                        data: {
                            balanceTon: { increment: txn.amountTon },
                            monthlyDepositTon: { increment: txn.amountTon },
                        },
                    }),
                ]);
            }
        }
        return { ok: true };
    });
}
//# sourceMappingURL=webhooks.js.map