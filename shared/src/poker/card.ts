export const SUITS = ['s', 'h', 'd', 'c'] as const;
export type Suit = (typeof SUITS)[number];

export const RANKS = [
  '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A',
] as const;
export type Rank = (typeof RANKS)[number];

/** Numeric rank: 2..14 (Ace high). */
export const RANK_VALUE: Record<Rank, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
  T: 10, J: 11, Q: 12, K: 13, A: 14,
};

export interface Card {
  rank: Rank;
  suit: Suit;
}

export function cardCode(c: Card): string {
  return `${c.rank}${c.suit}`;
}

export function parseCard(code: string): Card {
  if (code.length !== 2) throw new Error(`Bad card code: ${code}`);
  const r = code[0] as Rank;
  const s = code[1] as Suit;
  if (!(r in RANK_VALUE)) throw new Error(`Bad rank: ${r}`);
  if (!SUITS.includes(s)) throw new Error(`Bad suit: ${s}`);
  return { rank: r, suit: s };
}

export function rankValue(r: Rank): number {
  return RANK_VALUE[r];
}

/** Build a fresh ordered 52-card deck. */
export function freshDeck(): Card[] {
  const out: Card[] = [];
  for (const r of RANKS) for (const s of SUITS) out.push({ rank: r, suit: s });
  return out;
}
