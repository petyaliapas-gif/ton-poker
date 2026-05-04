import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../store/auth';
import { TableSocket } from '../lib/ws';
import PokerTable from '../components/PokerTable';
import { fmtTon } from '../lib/api';
import { haptic, notify } from '../lib/tg';
import clsx from '../lib/clsx';
import type { TableSnapshot } from '@ton-poker/shared';

export default function TablePage() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const { user } = useAuth();
  const [snapshot, setSnapshot] = useState<TableSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showBuyIn, setShowBuyIn] = useState<number | null>(null);
  const [buyInAmount, setBuyInAmount] = useState('5');
  const sockRef = useRef<TableSocket | null>(null);

  useEffect(() => {
    if (!id) return;
    const sock = new TableSocket(id);
    sockRef.current = sock;
    sock.on((msg) => {
      switch (msg.t) {
        case 'snapshot':
          setSnapshot(msg.snapshot);
          break;
        case 'error':
          setError(msg.message);
          notify('error');
          break;
        case 'event':
          if (msg.event.kind === 'pot_won') notify('success');
          if (msg.event.kind === 'turn_started' && msg.event.seat !== undefined) haptic('light');
          break;
      }
    });
    sock.connect();
    return () => {
      sock.close();
      sockRef.current = null;
    };
  }, [id]);

  const mySeat = useMemo(() => {
    if (!snapshot || !user) return null;
    return snapshot.seats.find((s) => s.user?.id === user.id) ?? null;
  }, [snapshot, user]);

  const isMyTurn = mySeat !== null && snapshot?.currentSeat === mySeat.seatIndex;

  const sit = (seatIndex: number) => {
    setShowBuyIn(seatIndex);
  };

  const confirmSit = () => {
    if (showBuyIn === null) return;
    const amount = (Number(buyInAmount) * 1e9).toString();
    sockRef.current?.send({ t: 'sit', seatIndex: showBuyIn, buyIn: amount });
    setShowBuyIn(null);
  };

  return (
    <div className="min-h-full pb-24 px-3 pt-3 safe-top">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => nav(-1)}
          className="btn-ghost px-3 py-1.5 text-xs"
          aria-label="back"
        >
          ← Назад
        </button>
        <div className="text-xs text-muted">{id}</div>
        {mySeat ? (
          <button
            className="btn-danger px-3 py-1.5 text-xs"
            onClick={() => sockRef.current?.send({ t: 'leave' })}
          >
            Встать
          </button>
        ) : (
          <div className="w-16" />
        )}
      </div>

      {error && (
        <div className="card-surface bg-rose-500/10 border-rose-500/40 text-rose-300 text-xs p-2 mb-2">
          {error}
        </div>
      )}

      {snapshot && (
        <PokerTable
          snapshot={snapshot}
          selfUserId={user?.id ?? null}
          onSit={sit}
        />
      )}

      {/* Action bar */}
      {snapshot && mySeat && isMyTurn && (
        <ActionBar
          snapshot={snapshot}
          mySeat={mySeat}
          onAction={(action, amount) => {
            sockRef.current?.send({
              t: 'action',
              action: { kind: action as 'fold', ...(amount ? { amount } : {}) },
            });
            haptic('medium');
          }}
        />
      )}

      {/* Buy-in modal */}
      {showBuyIn !== null && (
        <Modal onClose={() => setShowBuyIn(null)}>
          <div className="text-base font-bold mb-2">Зайти за стол</div>
          <div className="text-xs text-muted mb-3">
            Введи сумму buy-in в TON. Вернуть фишки в баланс можно в любой момент.
          </div>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            value={buyInAmount}
            onChange={(e) => setBuyInAmount(e.target.value)}
            className="w-full bg-elevated rounded-lg p-2.5 text-center text-lg font-bold text-gold border border-line outline-none focus:border-accent"
          />
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button className="btn-ghost" onClick={() => setShowBuyIn(null)}>
              Отмена
            </button>
            <button className="btn-gold" onClick={confirmSit}>
              Сесть
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ActionBar({
  snapshot,
  mySeat,
  onAction,
}: {
  snapshot: TableSnapshot;
  mySeat: TableSnapshot['seats'][number];
  onAction: (kind: string, amount?: string) => void;
}) {
  const toCall = BigInt(snapshot.toCall ?? '0');
  const myStack = BigInt(mySeat.stack);
  const minRaise = BigInt(snapshot.minRaise);
  const myBet = BigInt(mySeat.bet);
  const currentBet = myBet + toCall;
  const minRaiseTotal = currentBet + minRaise;

  const [bet, setBet] = useState<string>(minRaiseTotal.toString());

  useEffect(() => {
    setBet(minRaiseTotal.toString());
  }, [minRaiseTotal.toString()]);

  const canCheck = toCall === 0n;
  const canBet = currentBet === 0n;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-16 inset-x-0 z-40 px-3 safe-bottom"
    >
      <div className="card-surface p-3 max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-2 mb-2">
          <button className="btn-danger" onClick={() => onAction('fold')}>
            Fold
          </button>
          {canCheck ? (
            <button className="btn-ghost" onClick={() => onAction('check')}>
              Check
            </button>
          ) : (
            <button className="btn-ghost" onClick={() => onAction('call')}>
              Call {fmtTon(toCall, 2)}
            </button>
          )}
          <button
            className="btn-primary"
            onClick={() =>
              canBet
                ? onAction('bet', bet)
                : onAction('raise', bet)
            }
          >
            {canBet ? 'Bet' : 'Raise'} {fmtTon(bet, 2)}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={Number(minRaiseTotal)}
            max={Number(myStack + myBet)}
            value={Number(bet)}
            onChange={(e) => setBet(e.target.value)}
            className="flex-1 accent-accent"
          />
          <button className="btn-gold px-2 py-1 text-xs" onClick={() => onAction('all_in')}>
            All-in
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {[
            { label: '½ pot', mul: 0.5 },
            { label: '¾ pot', mul: 0.75 },
            { label: 'Pot', mul: 1 },
            { label: '2× pot', mul: 2 },
          ].map((p) => (
            <button
              key={p.label}
              className="bg-elevated rounded-lg py-1 text-[11px] font-bold text-muted hover:text-fg"
              onClick={() => {
                const pot = BigInt(snapshot.pot);
                const amount = currentBet + (pot * BigInt(Math.round(p.mul * 100))) / 100n;
                const clamped = amount > myStack + myBet ? myStack + myBet : amount;
                setBet(clamped.toString());
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={clsx(
        'fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm p-4',
      )}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, scale: 0.95, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        className="card-surface w-full max-w-sm p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
