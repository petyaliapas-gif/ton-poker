import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, fmtTon } from '../lib/api';
import { useAuth } from '../store/auth';
import { openInvoice, showAlert, notify } from '../lib/tg';
import BalanceBar from '../components/BalanceBar';
import clsx from '../lib/clsx';

export default function Cashier() {
  const { user, balanceTon, refresh } = useAuth();
  const [tab, setTab] = useState<'deposit' | 'withdraw' | 'stars'>('deposit');
  const [amount, setAmount] = useState('5');
  const [conv, setConv] = useState<{
    tonUsd: number;
    conversion: { tonPerStar: number; margin: number };
    packages: Array<{ stars: number; ton: string }>;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.conversion().then(setConv).catch(console.warn);
  }, []);

  const deposit = async () => {
    setBusy(true);
    try {
      const inv = await api.createDeposit(amount);
      // Prefer the Mini App invoice URL if available; fall back to pay_url.
      const url = inv.miniAppUrl ?? inv.payUrl;
      openInvoice(url, async (status) => {
        if (status === 'paid') {
          notify('success');
          showAlert(`Принято! ${amount} TON будут зачислены через минуту.`);
          setTimeout(refresh, 6000);
        }
      });
    } catch (err) {
      showAlert(`Не удалось создать счёт: ${String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    setBusy(true);
    try {
      const res = await api.createWithdraw(amount);
      notify('success');
      showAlert(`Чек создан. Открой @CryptoBot и забери ${amount} TON.`);
      window.open(res.claimUrl, '_blank');
      refresh();
    } catch (err) {
      showAlert(`Не удалось вывести: ${String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full pb-24">
      <BalanceBar />
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-extrabold">Касса</h1>
        <p className="text-sm text-muted">
          Депозит и вывод в TON через @CryptoBot. Stars — для косметики и турнирных билетов.
        </p>

        <div className="mt-3 flex gap-1 bg-elevated p-1 rounded-xl">
          {(['deposit', 'withdraw', 'stars'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                'flex-1 py-2 rounded-lg text-sm font-semibold transition',
                tab === t ? 'bg-accent text-white shadow-glow-accent' : 'text-muted hover:text-fg',
              )}
            >
              {t === 'deposit' ? 'Пополнить' : t === 'withdraw' ? 'Вывести' : 'Stars'}
            </button>
          ))}
        </div>

        {tab !== 'stars' ? (
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-surface p-4 mt-3"
          >
            <div className="text-xs text-muted">Сумма</div>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                inputMode="decimal"
                min="0.1"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-bg/40 rounded-lg p-3 text-lg font-bold text-gold border border-line outline-none focus:border-accent"
              />
              <span className="text-sm font-bold text-muted">TON</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {(tab === 'deposit'
                ? ['1', '5', '20', '100']
                : ['1', '5', '20', '100']
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={clsx(
                    'rounded-lg py-2 text-xs font-bold border transition',
                    amount === p
                      ? 'bg-accent border-accent text-white shadow-glow-accent'
                      : 'bg-elevated border-line text-muted hover:text-fg',
                  )}
                >
                  {p} TON
                </button>
              ))}
            </div>
            {tab === 'deposit' ? (
              <button className="btn-primary w-full mt-3" disabled={busy} onClick={deposit}>
                {busy ? 'Создаю счёт…' : 'Создать счёт в @CryptoBot'}
              </button>
            ) : (
              <button className="btn-gold w-full mt-3" disabled={busy} onClick={withdraw}>
                {busy ? 'Готовлю чек…' : `Вывести ${amount} TON`}
              </button>
            )}
            {tab === 'withdraw' && (
              <div className="text-[11px] text-muted mt-2">
                Доступно: <span className="text-gold">{fmtTon(balanceTon, 4)}</span> TON · комиссия:{' '}
                <span className="text-fg">0.1 TON</span>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-surface p-4 mt-3"
          >
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Курс TON</span>
              <span className="font-mono">${conv?.tonUsd.toFixed(2) ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted mt-1">
              <span>Маржа</span>
              <span className="font-mono">
                {conv ? `${Math.round(conv.conversion.margin * 100)}%` : '—'}
              </span>
            </div>
            <div className="text-xs text-muted mt-3">
              В безопасном режиме (профиль А) Stars используются только для покупки косметики и
              турнирных билетов. Для cash-столов — пополни баланс через @CryptoBot.
            </div>
            {conv && (
              <ul className="grid grid-cols-2 gap-2 mt-3">
                {conv.packages.map((p) => (
                  <li
                    key={p.stars}
                    className="bg-elevated rounded-xl p-3 border border-line text-center"
                  >
                    <div className="text-base font-extrabold text-gold">⭐ {p.stars}</div>
                    <div className="text-[11px] text-muted mt-0.5">≈ {p.ton} TON</div>
                  </li>
                ))}
              </ul>
            )}
            <div className="text-[11px] text-muted mt-3">
              <strong className="text-fg">Не активно</strong> в безопасном режиме. Включить
              конвертацию Stars → TON: установи <code className="font-mono">ENABLE_STARS_TON_CREDIT=true</code>
              {' '}в <code className="font-mono">.env</code> сервера (на свой страх и риск).
            </div>
          </motion.div>
        )}

        <div className="text-[11px] text-muted text-center mt-4">
          {user ? `User #${user.telegramId}` : 'Не авторизован'}
        </div>
      </div>
    </div>
  );
}
