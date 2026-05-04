import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, fmtTon, type CashTableInfo } from '../lib/api';
import clsx from '../lib/clsx';
import BalanceBar from '../components/BalanceBar';
import Logo from '../components/Logo';

const STAKE_LABEL: Record<CashTableInfo['stake'], { label: string; color: string }> = {
  micro: { label: 'Micro', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  low: { label: 'Low', color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
  mid: { label: 'Mid', color: 'text-violet-400 border-violet-500/40 bg-violet-500/10' },
  high: { label: 'High', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  highroller: { label: 'High Roller', color: 'text-gold border-gold/50 bg-gold/10' },
};

const TABS: Array<{ id: CashTableInfo['stake'] | 'all'; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'micro', label: 'Micro' },
  { id: 'low', label: 'Low' },
  { id: 'mid', label: 'Mid' },
  { id: 'high', label: 'High' },
  { id: 'highroller', label: 'VIP' },
];

export default function Lobby() {
  const [tables, setTables] = useState<CashTableInfo[]>([]);
  const [tab, setTab] = useState<CashTableInfo['stake'] | 'all'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        const data = await api.cashTables();
        if (!cancelled) setTables(data);
      } catch (err) {
        if (!cancelled) setError(String(err));
      }
    };
    fetchAll();
    const id = setInterval(fetchAll, 4000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const filtered = tab === 'all' ? tables : tables.filter((t) => t.stake === tab);

  return (
    <div className="min-h-full pb-24">
      <BalanceBar />
      <div className="px-4 pt-2 flex items-center justify-between">
        <Logo />
        <Link to="/profile" className="stat-pill">VIP</Link>
      </div>

      {/* Hero */}
      <section className="px-4 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border border-line bg-felt-radial p-5 shadow-felt-inner"
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-gold/20 blur-3xl pointer-events-none" />
          <h1 className="font-extrabold text-2xl">Готов сорвать банк?</h1>
          <p className="text-sm text-muted mt-1">
            Cash-столы Texas Hold'em на TON. Турниры и фрироллы — по билетам за Stars.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="stat-pill">⚡ {tables.reduce((a, t) => a + t.seated, 0)} играют сейчас</div>
            <div className="stat-pill">🎯 рейк 5%, cap 3 BB</div>
          </div>
        </motion.div>
      </section>

      {/* Tabs */}
      <div className="px-4 mt-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                'px-3.5 py-1.5 text-sm font-semibold rounded-full border whitespace-nowrap transition',
                tab === t.id
                  ? 'bg-accent text-white border-accent shadow-glow-accent'
                  : 'bg-elevated text-muted border-line hover:text-fg',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <ul className="px-4 mt-3 space-y-2">
        {error && (
          <li className="card-surface p-4 text-sm text-rose-300">{error}</li>
        )}
        {filtered.map((t, i) => (
          <motion.li
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              to={`/table/${t.id}`}
              className="card-surface flex items-center justify-between p-3 active:scale-[0.99] transition"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      'rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      STAKE_LABEL[t.stake].color,
                    )}
                  >
                    {STAKE_LABEL[t.stake].label}
                  </span>
                  <span className="text-sm font-semibold truncate">{t.name}</span>
                </div>
                <div className="text-[11px] text-muted mt-1">
                  {fmtTon(t.smallBlind, 2)} / {fmtTon(t.bigBlind, 2)} TON · buy-in {fmtTon(t.minBuyIn, 1)}–{fmtTon(t.maxBuyIn, 0)} TON
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold">
                  {t.seated}/{t.maxSeats}
                  <span className="ml-1 text-muted text-xs font-medium">
                    {t.maxSeats === 2 ? 'HU' : t.maxSeats === 6 ? '6-max' : '9-max'}
                  </span>
                </div>
                <div className="text-[11px] text-muted">
                  {t.handsPerHour > 0 ? `${t.handsPerHour}/час` : 'ожидают игроков'}
                </div>
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
