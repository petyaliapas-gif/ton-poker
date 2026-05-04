import { motion } from 'framer-motion';
import clsx from '../lib/clsx';

const COLORS: Record<string, string> = {
  white: 'from-white via-zinc-100 to-zinc-200 text-zinc-900 ring-zinc-300',
  red: 'from-red-400 via-red-500 to-red-700 text-white ring-red-300',
  green: 'from-emerald-400 via-emerald-500 to-emerald-700 text-white ring-emerald-300',
  blue: 'from-sky-400 via-sky-500 to-sky-700 text-white ring-sky-300',
  black: 'from-zinc-700 via-zinc-800 to-zinc-950 text-white ring-zinc-500',
  purple: 'from-fuchsia-400 via-fuchsia-500 to-fuchsia-700 text-white ring-fuchsia-300',
  gold: 'from-amber-300 via-amber-400 to-amber-600 text-amber-950 ring-amber-200',
};

const SIZES = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

interface ChipProps {
  color: keyof typeof COLORS;
  label?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export default function Chip({ color, label, size = 'md', className }: ChipProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={clsx(
        'relative grid place-items-center rounded-full bg-gradient-to-b ring-2 shadow-card font-bold',
        COLORS[color],
        SIZES[size],
        className,
      )}
    >
      <div className="absolute inset-1 rounded-full border border-dashed border-white/30" />
      {label ? <span className="relative">{label}</span> : null}
    </motion.div>
  );
}

/**
 * Render a stylized stack of chips representing an amount.
 * Heuristic chip colors and counts so big stacks look big.
 */
export function ChipStack({ amount, className }: { amount: bigint; className?: string }) {
  const tiers: Array<{ color: keyof typeof COLORS; threshold: bigint }> = [
    { color: 'white', threshold: 1_000_000_000n }, // 1 TON
    { color: 'red', threshold: 5_000_000_000n },
    { color: 'green', threshold: 20_000_000_000n },
    { color: 'blue', threshold: 50_000_000_000n },
    { color: 'black', threshold: 200_000_000_000n },
    { color: 'gold', threshold: 1_000_000_000_000n },
  ];
  let activeTier: keyof typeof COLORS = 'white';
  for (const t of tiers) {
    if (amount >= t.threshold) activeTier = t.color;
  }
  const count = Math.min(8, 1 + Number(amount / 5_000_000_000n));
  return (
    <div className={clsx('relative inline-block', className)} style={{ width: 32, height: 32 + count * 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute left-0"
          style={{ bottom: i * 3 }}
        >
          <Chip color={activeTier} size="sm" />
        </div>
      ))}
    </div>
  );
}
