import { motion, AnimatePresence } from 'framer-motion';
import Card from './Card';
import { ChipStack } from './Chip';
import { fmtTon } from '../lib/api';
import clsx from '../lib/clsx';
import type { TableSnapshot, SeatPublic } from '@ton-poker/shared';

interface Props {
  snapshot: TableSnapshot;
  selfUserId: string | null;
  onSit?: (seatIndex: number) => void;
}

/**
 * Oval poker table renderer.
 * Seats are positioned around an ellipse based on the seat index and total maxSeats.
 */
export default function PokerTable({ snapshot, selfUserId, onSit }: Props) {
  const seats = snapshot.seats;
  const maxSeats = seats.length;

  const positions = seatPositions(maxSeats);

  return (
    <div className="relative w-full aspect-[5/7] max-w-md mx-auto">
      {/* Felt */}
      <div className="absolute inset-3 rounded-[48%] bg-felt-radial border border-felt-edge shadow-felt-inner" />
      {/* Rail */}
      <div className="absolute inset-0 rounded-[48%] bg-rail-grad shadow-rail" style={{ padding: 12 }}>
        <div className="absolute inset-2 rounded-[48%] border border-amber-900/40" />
      </div>

      {/* Center: pot + community cards */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-widest text-felt-highlight font-semibold">
            Pot
          </div>
          <div className="font-bold text-gold text-lg drop-shadow-[0_0_8px_rgba(243,199,95,0.4)]">
            {fmtTon(snapshot.pot, 3)} TON
          </div>
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => {
            const code = snapshot.community[i];
            return code ? (
              <Card key={i} code={code} size="sm" delay={0.05 * i} />
            ) : (
              <div
                key={i}
                className="w-9 h-13 rounded-lg border border-dashed border-felt-highlight/40 bg-black/10"
              />
            );
          })}
        </div>
        {snapshot.street !== 'idle' && (
          <div className="stat-pill bg-felt-edge/70 text-felt-highlight border border-felt-highlight/40 mt-1">
            {streetLabel(snapshot.street)}
          </div>
        )}
      </div>

      {/* Seats */}
      {seats.map((seat, i) => {
        const pos = positions[i]!;
        return (
          <SeatView
            key={seat.seatIndex}
            seat={seat}
            x={pos.x}
            y={pos.y}
            isCurrentTurn={snapshot.currentSeat === seat.seatIndex}
            isSelf={!!selfUserId && seat.user?.id === selfUserId}
            myHole={
              !!selfUserId && seat.user?.id === selfUserId ? snapshot.myHole : undefined
            }
            onSit={onSit}
            handId={snapshot.handId}
          />
        );
      })}
    </div>
  );
}

function streetLabel(s: TableSnapshot['street']): string {
  switch (s) {
    case 'preflop':
      return 'PREFLOP';
    case 'flop':
      return 'FLOP';
    case 'turn':
      return 'TURN';
    case 'river':
      return 'RIVER';
    case 'showdown':
      return 'SHOWDOWN';
    case 'idle':
      return 'WAITING';
  }
}

interface SeatViewProps {
  seat: SeatPublic;
  x: string;
  y: string;
  isCurrentTurn: boolean;
  isSelf: boolean;
  myHole?: string[];
  onSit?: (seatIndex: number) => void;
  handId: string | null;
}

function SeatView({ seat, x, y, isCurrentTurn, isSelf, myHole, onSit, handId }: SeatViewProps) {
  const empty = !seat.user;
  return (
    <div
      className="absolute"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      {empty ? (
        <button
          onClick={() => onSit?.(seat.seatIndex)}
          className="grid place-items-center w-16 h-16 rounded-full border-2 border-dashed border-felt-highlight/50 text-felt-highlight/70 text-[10px] font-bold hover:border-gold hover:text-gold transition"
        >
          СЕСТЬ
        </button>
      ) : (
        <motion.div
          className={clsx(
            'flex flex-col items-center gap-1 relative',
            seat.state === 'folded' && 'opacity-40',
          )}
          animate={isCurrentTurn ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={isCurrentTurn ? { repeat: Infinity, duration: 1.4 } : {}}
        >
          {/* Hole cards */}
          {seat.hasCards && (
            <div className="flex gap-0.5 -mb-1">
              {isSelf && myHole && myHole.length === 2 ? (
                <>
                  <Card code={myHole[0]!} size="xs" />
                  <Card code={myHole[1]!} size="xs" />
                </>
              ) : (
                <>
                  <Card size="xs" />
                  <Card size="xs" />
                </>
              )}
            </div>
          )}
          {/* Avatar + name */}
          <div
            className={clsx(
              'w-14 h-14 rounded-full overflow-hidden border-2 grid place-items-center bg-elevated',
              isCurrentTurn ? 'border-gold shadow-glow-gold' : 'border-line',
            )}
          >
            {seat.user?.avatarUrl ? (
              <img
                src={seat.user.avatarUrl}
                alt={seat.user.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-sm">
                {seat.user?.firstName[0]?.toUpperCase()}
              </span>
            )}
            {seat.isDealer && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-black text-[10px] font-bold grid place-items-center shadow">
                D
              </span>
            )}
          </div>
          <div
            className={clsx(
              'card-surface px-2 py-0.5 text-[11px] font-bold flex flex-col items-center min-w-[68px]',
              isCurrentTurn && 'ring-1 ring-gold',
              seat.state === 'all_in' && 'ring-1 ring-rose-500 text-rose-300',
            )}
          >
            <span className="truncate max-w-[70px]">
              {seat.user?.firstName}
            </span>
            <span className="text-gold">{fmtTon(seat.stack, 2)}</span>
          </div>
          {/* Bet chips */}
          <AnimatePresence>
            {BigInt(seat.bet) > 0n && (
              <motion.div
                key={`${handId}-${seat.seatIndex}-${seat.bet}`}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 30, opacity: 0 }}
                className="absolute top-full mt-1 flex flex-col items-center"
              >
                <ChipStack amount={BigInt(seat.bet)} />
                <span className="text-[10px] text-fg font-bold mt-0.5 bg-black/40 px-1 rounded">
                  {fmtTon(seat.bet, 2)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          {seat.state === 'all_in' && (
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-extrabold text-rose-400 bg-black/70 px-1 rounded">
              ALL-IN
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}

/**
 * Compute seat positions as percentage strings around an oval.
 * Seat 0 is at the bottom (player's position).
 */
function seatPositions(n: number): Array<{ x: string; y: string }> {
  const out: Array<{ x: string; y: string }> = [];
  // Oval radii (% of container)
  const rx = 48;
  const ry = 44;
  const cx = 50;
  const cy = 50;
  for (let i = 0; i < n; i++) {
    // Place seat 0 at bottom (angle = 90°), rotate clockwise.
    const angle = Math.PI / 2 + (2 * Math.PI * i) / n;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    out.push({ x: `${x}%`, y: `${y}%` });
  }
  return out;
}
