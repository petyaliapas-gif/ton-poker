import { useState } from 'react';
import { motion } from 'framer-motion';
import BalanceBar from '../components/BalanceBar';
import { api } from '../lib/api';
import { openInvoice, showAlert, notify } from '../lib/tg';

interface CosmeticDef {
  id: string;
  name: string;
  price: number;
  emoji: string;
}

const PLACEHOLDERS: CosmeticDef[] = [
  { id: 'avatar-shark', name: 'Аватар: Акула', price: 250, emoji: '🦈' },
  { id: 'card-back-neon', name: 'Рубашка: Neon', price: 350, emoji: '🃏' },
  { id: 'felt-emerald', name: 'Стол: Изумруд', price: 500, emoji: '🟢' },
  { id: 'chip-set-gold', name: 'Фишки: Gold', price: 750, emoji: '🪙' },
  { id: 'emoji-fire', name: 'Эмодзи: 🔥-пакет', price: 100, emoji: '🔥' },
  { id: 'avatar-king', name: 'Аватар: Король', price: 800, emoji: '♛' },
];

export default function Shop() {
  const [busy, setBusy] = useState<string | null>(null);

  const buy = async (item: CosmeticDef) => {
    setBusy(item.id);
    try {
      const { link } = await api.createStarsInvoice({
        itemKind: 'cosmetic',
        itemId: item.id,
        stars: item.price,
      });
      openInvoice(link, (status) => {
        if (status === 'paid') {
          notify('success');
          showAlert(`Покупка «${item.name}» оформлена!`);
        } else if (status === 'failed') {
          notify('error');
          showAlert(`Платёж не прошёл.`);
        }
      });
    } catch (err) {
      notify('error');
      showAlert(`Не удалось создать счёт: ${String(err)}`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-full pb-24">
      <BalanceBar />
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-extrabold">Магазин</h1>
        <p className="text-sm text-muted">
          Косметика и эмодзи за Telegram Stars. Не влияет на игровой баланс.
        </p>

        <ul className="grid grid-cols-2 gap-2 mt-3">
          {PLACEHOLDERS.map((p, i) => (
            <motion.li
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-surface p-3 flex flex-col items-center text-center gap-1.5"
            >
              <div className="text-3xl">{p.emoji}</div>
              <div className="text-xs font-bold">{p.name}</div>
              <button
                disabled={busy === p.id}
                onClick={() => buy(p)}
                className="btn-gold w-full text-[11px] py-1.5"
              >
                {busy === p.id ? '…' : `⭐ ${p.price}`}
              </button>
            </motion.li>
          ))}
        </ul>
        <div className="text-[11px] text-muted mt-3 text-center">
          Платежи проводятся через Telegram Stars.
        </div>
      </div>
    </div>
  );
}
