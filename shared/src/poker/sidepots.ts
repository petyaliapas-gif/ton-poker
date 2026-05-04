/**
 * Side pot calculation.
 * Each entry represents a player's total contribution to the pot for the hand
 * and whether they are still eligible to win (i.e. did not fold).
 */
export interface PotContribution {
  seat: number;
  contributed: bigint;
  eligible: boolean;
}

export interface Pot {
  amount: bigint;
  eligibleSeats: number[];
}

/**
 * Build the main pot and any side pots from per-player contributions.
 * Side pots are layered: lowest all-in level forms the main pot,
 * subsequent layers form side pots only contested by players still in.
 */
export function buildPots(contribs: PotContribution[]): Pot[] {
  const remaining = contribs
    .filter((c) => c.contributed > 0n)
    .map((c) => ({ ...c }));

  const pots: Pot[] = [];
  while (remaining.length > 0) {
    const levels = [...remaining]
      .map((c) => c.contributed)
      .filter((v) => v > 0n)
      .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    if (levels.length === 0) break;
    const level = levels[0]!;

    let amount = 0n;
    const eligible: number[] = [];
    for (const c of remaining) {
      const take = c.contributed < level ? c.contributed : level;
      amount += take;
      c.contributed -= take;
      if (c.eligible && take > 0n) eligible.push(c.seat);
    }
    pots.push({ amount, eligibleSeats: dedupSorted(eligible) });
    for (let i = remaining.length - 1; i >= 0; i--) {
      if (remaining[i]!.contributed === 0n) remaining.splice(i, 1);
    }
  }

  return pots;
}

function dedupSorted(a: number[]): number[] {
  return [...new Set(a)].sort((x, y) => x - y);
}
