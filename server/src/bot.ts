import { Bot, InlineKeyboard } from 'grammy';
import type { AppConfig } from './config.js';
import { getPrisma } from './db.js';
import { log } from './log.js';

export function createBot(cfg: AppConfig): Bot {
  const bot = new Bot(cfg.TELEGRAM_BOT_TOKEN);
  const db = getPrisma();

  bot.command('start', async (ctx) => {
    const kb = new InlineKeyboard().webApp('🎲 Открыть стол', cfg.MINI_APP_URL);
    await ctx.reply(
      `*TON Poker*\n\nТехасский холдем на TON между реальными игроками.\n` +
        `\n• Депозит и вывод через @CryptoBot (TON)` +
        `\n• Косметика и турнирные билеты — за Telegram Stars\n` +
        `\nЖми кнопку, чтобы сесть за стол 👇`,
      { parse_mode: 'Markdown', reply_markup: kb },
    );
  });

  bot.command('balance', async (ctx) => {
    const user = await db.user.findUnique({
      where: { telegramId: BigInt(ctx.from?.id ?? 0) },
    });
    if (!user) {
      await ctx.reply('Сначала открой Mini App, чтобы я тебя зарегистрировал.');
      return;
    }
    const ton = (Number(user.balanceTon) / 1e9).toFixed(4);
    const locked = (Number(user.lockedTon) / 1e9).toFixed(4);
    await ctx.reply(`💰 Баланс: *${ton} TON*\n🪑 На столах: *${locked} TON*`, {
      parse_mode: 'Markdown',
    });
  });

  // Telegram Stars payments lifecycle:
  bot.on('pre_checkout_query', async (ctx) => {
    // Always approve; we already validated via createInvoiceLink.
    await ctx.answerPreCheckoutQuery(true);
  });

  bot.on(':successful_payment', async (ctx) => {
    const sp = ctx.message?.successful_payment;
    if (!sp) return;
    const payload = (() => {
      try {
        return JSON.parse(sp.invoice_payload) as { uid: string; kind: string; id: string };
      } catch {
        return null;
      }
    })();
    if (!payload) return;

    const txn = await db.transaction.findFirst({
      where: {
        userId: payload.uid,
        externalId: sp.invoice_payload,
        status: 'PENDING',
      },
    });
    if (!txn) return;

    if (payload.kind === 'cosmetic') {
      await db.$transaction([
        db.cosmetic.upsert({
          where: {
            userId_itemId: { userId: payload.uid, itemId: payload.id },
          },
          create: { userId: payload.uid, itemId: payload.id },
          update: {},
        }),
        db.transaction.update({
          where: { id: txn.id },
          data: { status: 'CONFIRMED' },
        }),
      ]);
    } else if (payload.kind === 'tournament_ticket') {
      await db.$transaction([
        db.tournamentEntry.upsert({
          where: {
            tournamentId_userId: { tournamentId: payload.id, userId: payload.uid },
          },
          create: { tournamentId: payload.id, userId: payload.uid },
          update: {},
        }),
        db.transaction.update({
          where: { id: txn.id },
          data: { status: 'CONFIRMED' },
        }),
      ]);
    }
  });

  bot.catch((err) => log.error({ err: err.error }, 'bot error'));
  return bot;
}
