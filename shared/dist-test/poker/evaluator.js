import { RANKS, rankValue } from './card.js';
/**
 * Hand category, ordered by strength.
 * Higher numeric value beats lower.
 */
export const HandCategory = {
    HighCard: 1,
    Pair: 2,
    TwoPair: 3,
    ThreeOfKind: 4,
    Straight: 5,
    Flush: 6,
    FullHouse: 7,
    FourOfKind: 8,
    StraightFlush: 9,
    RoyalFlush: 10,
};
export const HAND_NAMES = {
    1: 'High Card',
    2: 'Pair',
    3: 'Two Pair',
    4: 'Three of a Kind',
    5: 'Straight',
    6: 'Flush',
    7: 'Full House',
    8: 'Four of a Kind',
    9: 'Straight Flush',
    10: 'Royal Flush',
};
/** Pick the best 5-card hand from 7 cards. */
export function evaluateBest(cards) {
    if (cards.length < 5)
        throw new Error('Need at least 5 cards');
    let best = null;
    // C(n,5)
    const idxs = combinations(cards.length, 5);
    for (const c of idxs) {
        const five = [
            cards[c[0]],
            cards[c[1]],
            cards[c[2]],
            cards[c[3]],
            cards[c[4]],
        ];
        const ev = evalFive(five);
        if (!best || compareScores(ev.score, best.score) > 0)
            best = ev;
    }
    return best;
}
export function compareScores(a, b) {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
        const av = a[i] ?? 0;
        const bv = b[i] ?? 0;
        if (av !== bv)
            return av - bv;
    }
    return 0;
}
function combinations(n, k) {
    const out = [];
    const buf = new Array(k).fill(0);
    function rec(start, depth) {
        if (depth === k) {
            out.push(buf.slice());
            return;
        }
        for (let i = start; i <= n - (k - depth); i++) {
            buf[depth] = i;
            rec(i + 1, depth + 1);
        }
    }
    rec(0, 0);
    return out;
}
/** Evaluate exactly 5 cards. */
export function evalFive(cards) {
    const sorted = [...cards].sort((a, b) => rankValue(b.rank) - rankValue(a.rank));
    const ranks = sorted.map((c) => rankValue(c.rank));
    const suits = sorted.map((c) => c.suit);
    const isFlush = suits.every((s) => s === suits[0]);
    const straightHigh = checkStraight(ranks);
    const isStraight = straightHigh > 0;
    const counts = new Map();
    for (const r of ranks)
        counts.set(r, (counts.get(r) ?? 0) + 1);
    const groups = [...counts.entries()].sort((a, b) => {
        if (b[1] !== a[1])
            return b[1] - a[1];
        return b[0] - a[0];
    });
    // Royal / Straight flush
    if (isFlush && isStraight) {
        const cat = straightHigh === 14 ? HandCategory.RoyalFlush : HandCategory.StraightFlush;
        return mk(cat, [cat, straightHigh], sorted);
    }
    if (groups[0][1] === 4) {
        const quad = groups[0][0];
        const kicker = groups[1][0];
        return mk(HandCategory.FourOfKind, [HandCategory.FourOfKind, quad, kicker], sorted);
    }
    if (groups[0][1] === 3 && groups[1] && groups[1][1] >= 2) {
        return mk(HandCategory.FullHouse, [HandCategory.FullHouse, groups[0][0], groups[1][0]], sorted);
    }
    if (isFlush) {
        return mk(HandCategory.Flush, [HandCategory.Flush, ...ranks], sorted);
    }
    if (isStraight) {
        return mk(HandCategory.Straight, [HandCategory.Straight, straightHigh], sorted);
    }
    if (groups[0][1] === 3) {
        const trip = groups[0][0];
        const kickers = ranks.filter((r) => r !== trip);
        return mk(HandCategory.ThreeOfKind, [HandCategory.ThreeOfKind, trip, ...kickers], sorted);
    }
    if (groups[0][1] === 2 && groups[1] && groups[1][1] === 2) {
        const hi = Math.max(groups[0][0], groups[1][0]);
        const lo = Math.min(groups[0][0], groups[1][0]);
        const kicker = groups[2][0];
        return mk(HandCategory.TwoPair, [HandCategory.TwoPair, hi, lo, kicker], sorted);
    }
    if (groups[0][1] === 2) {
        const pair = groups[0][0];
        const kickers = ranks.filter((r) => r !== pair);
        return mk(HandCategory.Pair, [HandCategory.Pair, pair, ...kickers], sorted);
    }
    return mk(HandCategory.HighCard, [HandCategory.HighCard, ...ranks], sorted);
}
function mk(category, score, best) {
    return { category, score, best, name: HAND_NAMES[category] };
}
/**
 * Returns the high card of the straight, or 0 if not a straight.
 * Handles wheel A-2-3-4-5 (high card = 5).
 * `ranks` is sorted descending and must have exactly 5 elements.
 */
function checkStraight(ranks) {
    // Wheel
    if (ranks[0] === 14 &&
        ranks[1] === 5 &&
        ranks[2] === 4 &&
        ranks[3] === 3 &&
        ranks[4] === 2) {
        return 5;
    }
    for (let i = 1; i < ranks.length; i++) {
        if (ranks[i] + 1 !== ranks[i - 1])
            return 0;
    }
    return ranks[0];
}
export const _ranksUsed = RANKS;
//# sourceMappingURL=evaluator.js.map