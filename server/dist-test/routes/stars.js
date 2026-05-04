import { z } from 'zod';
import { InlineKeyboard } from 'grammy';
import { verifyInitData } from '../auth/telegram.js';
import { loadConfig } from '../config.js';
import { getPrisma } from '../db.js';
const StarsInvoiceBody = z.object({
    initData: z.string(),
    /** Item to purchase. Profile A: only cosmetics & tournament tickets. */
    itemKind: z.enum(['cosmetic', 'tournament_ticket', 'ton_credit']),
    itemId: z.string().min(1).max(64),
    stars: z.number().int().positive().max(1_000_000),
});
/**
 * Telegram Stars (currency XTR) invoices.
 *
 * In risk profile A we only allow Stars purchases for non-cash items
 * (cosmetics + tournament tickets). The "ton_credit" branch is gated
 * behind ENABLE_STARS_TON_CREDIT (default off).
 */
export function registerStarsRoutes(app, bot, pricing) {
    const cfg = loadConfig();
    const db = getPrisma();
    /** Returns Stars→TON conversion table for the cashier UI. */
    app.get('/api/stars/conversion', async () => pricing.conversion());
    /**
     * Server creates a Stars invoice link via createInvoiceLink.
     * Currency = XTR, prices in nano-stars (i.e. integer Stars).
     * Client then opens it with TG.WebApp.openInvoice.
     */
    app.post('/api/stars/invoice', async (req, reply) => {
        const parsed = StarsInvoiceBody.safeParse(req.body);
        if (!parsed.success)
            return reply.code(400).send({ error: 'bad body' });
        const { initData, itemKind, itemId, stars } = parsed.data;
        const auth = verifyInitData(initData, cfg.TELEGRAM_BOT_TOKEN);
        if (!auth.user)
            return reply.code(401).send({ error: 'no user' });
        const user = await db.user.findUnique({ where: { telegramId: BigInt(auth.user.id) } });
        if (!user)
            return reply.code(401).send({ error: 'user missing' });
        if (itemKind === 'ton_credit') {
            // Profile A: disabled by default. Enable only if you accept ToS risk.
            return reply.code(403).send({
                error: 'Stars→TON conversion is disabled in safe mode (profile A). Use /deposit for TON.',
            });
        }
        let title;
        let description;
        if (itemKind === 'cosmetic') {
            const item = await db.cosmeticItem.findUnique({ where: { id: itemId } });
            if (!item)
                return reply.code(404).send({ error: 'cosmetic not found' });
            if (item.priceStars !== BigInt(stars)) {
                return reply.code(400).send({ error: 'price mismatch' });
            }
            title = item.name;
            description = item.description;
        }
        else {
            const tournament = await db.tournament.findUnique({ where: { id: itemId } });
            if (!tournament)
                return reply.code(404).send({ error: 'tournament not found' });
            if (tournament.buyInStars == null || tournament.buyInStars !== BigInt(stars)) {
                return reply.code(400).send({ error: 'price mismatch' });
            }
            title = `Билет: ${tournament.name}`;
            description = `Регистрация в турнире ${tournament.name}`;
        }
        const payload = JSON.stringify({ uid: user.id, kind: itemKind, id: itemId });
        // grammy exposes raw bot.api methods.
        const link = await bot.api.createInvoiceLink(title, description, payload, '', // provider_token: empty for Stars (XTR)
        'XTR', [{ label: title, amount: stars }]);
        await db.transaction.create({
            data: {
                userId: user.id,
                kind: itemKind === 'cosmetic'
                    ? 'STARS_PURCHASE_COSMETIC'
                    : 'STARS_PURCHASE_TICKET',
                amountTon: 0n,
                amountStars: BigInt(stars),
                externalId: payload,
                status: 'PENDING',
                meta: { itemId, link },
            },
        });
        return { link };
    });
    /** Deep-link helper for sharing a tournament. */
    app.get('/api/tournaments/:id/share', async (req, reply) => {
        const t = await db.tournament.findUnique({ where: { id: req.params.id } });
        if (!t)
            return reply.code(404).send({ error: 'not found' });
        const kb = new InlineKeyboard().webApp('Открыть в TON Poker', `${cfg.MINI_APP_URL}?startapp=t_${t.id}`);
        return { keyboard: kb.inline_keyboard };
    });
}
//# sourceMappingURL=stars.js.map