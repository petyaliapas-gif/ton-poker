import { motion } from 'framer-motion';
import clsx from '../lib/clsx';

const SUITS = {
  s: { glyph: '♠', color: 'text-fg' },
  c: { glyph: '♣', color: 'text-fg' },
  h: { glyph: '♥', color: 'text-rose-400' },
  d: { glyph: '♦', color: 'text-amber-400' },
} as const;

interface CardProps {
  code?: string; // e.g. "Ah". If undefined -> face-down.
  size?: 'xs' | 'sm' | 'md' | 'lg';
  highlighted?: boolean;
  delay?: number;
}

const SIZES = {
  xs: 'w-7 h-10 text-[10px]',
  sm: 'w-9 h-13 text-xs',
  md: 'w-12 h-17 text-sm',
  lg: 'w-16 h-22 text-base',
};

export default function Card({ code, size = 'md', highlighted = false, delay = 0 }: CardProps) {
  if (!code) {
    return (
      <motion.div
        initial={{ rotateY: 180, opacity: 0, y: -20 }}
        animate={{ rotateY: 0, opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.35, ease: 'easeOut' }}
        className={clsx(
          'relative flex items-center justify-center rounded-lg shadow-card border border-line',
          'bg-gradient-to-br from-accent/40 via-elevated to-bg',
          SIZES[size],
        )}
      >
        <div className="absolute inset-1 rounded-md border border-accent/30 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.06),transparent)]">
          <div className="absolute inset-0 grid place-items-center text-accent/60 text-2xl font-bold">
            ⬢
          </div>
        </div>
      </motion.div>
    );
  }
  const r = code[0]!;
  const s = code[1] as keyof typeof SUITS;
  const suit = SUITS[s];
  return (
    <motion.div
      initial={{ rotateY: 180, opacity: 0, y: -10 }}
      animate={{ rotateY: 0, opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className={clsx(
        'relative flex flex-col rounded-lg bg-white text-black shadow-card border border-line',
        SIZES[size],
        highlighted && 'ring-2 ring-gold shadow-glow-gold',
      )}
    >
      <div className={clsx('flex flex-col items-start pl-1.5 pt-0.5 leading-none font-bold', suit.color)}>
        <span>{r === 'T' ? '10' : r}</span>
        <span className="text-base leading-none">{suit.glyph}</span>
      </div>
      <div className={clsx('absolute inset-0 grid place-items-center text-2xl', suit.color)}>
        {suit.glyph}
      </div>
    </motion.div>
  );
}
