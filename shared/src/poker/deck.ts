import { randomBytes, createHash } from 'node:crypto';
import { type Card, freshDeck } from './card.js';

/**
 * Cryptographically secure Fisher–Yates shuffle.
 * Produces a commit-reveal seed so we can publish a SHA-256 commitment
 * before the hand starts and reveal the seed after the hand for provable fairness.
 */
export interface ShuffleResult {
  deck: Card[];
  /** 32 random bytes used as the seed (hex). */
  seed: string;
  /** SHA-256(seed) hex commitment, can be published before the hand. */
  commitment: string;
}

export function shuffle(rng: () => number = Math.random): Card[] {
  const deck = freshDeck();
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const di = deck[i]!;
    const dj = deck[j]!;
    deck[i] = dj;
    deck[j] = di;
  }
  return deck;
}

export function secureShuffle(): ShuffleResult {
  const seedBuf = randomBytes(32);
  const seed = seedBuf.toString('hex');
  const commitment = createHash('sha256').update(seedBuf).digest('hex');
  // PRNG seeded from the secret bytes via repeated SHA-256 expansion.
  let counter = 0;
  let pool = createHash('sha256').update(seedBuf).update(Buffer.from([counter++])).digest();
  let offset = 0;
  const next = (): number => {
    if (offset + 4 > pool.length) {
      pool = createHash('sha256').update(seedBuf).update(Buffer.from([counter++])).digest();
      offset = 0;
    }
    const v = pool.readUInt32BE(offset);
    offset += 4;
    return v / 0x1_0000_0000;
  };
  const deck = shuffle(next);
  return { deck, seed, commitment };
}
