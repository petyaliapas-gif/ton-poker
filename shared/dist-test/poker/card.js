export const SUITS = ['s', 'h', 'd', 'c'];
export const RANKS = [
    '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A',
];
/** Numeric rank: 2..14 (Ace high). */
export const RANK_VALUE = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    T: 10, J: 11, Q: 12, K: 13, A: 14,
};
export function cardCode(c) {
    return `${c.rank}${c.suit}`;
}
export function parseCard(code) {
    if (code.length !== 2)
        throw new Error(`Bad card code: ${code}`);
    const r = code[0];
    const s = code[1];
    if (!(r in RANK_VALUE))
        throw new Error(`Bad rank: ${r}`);
    if (!SUITS.includes(s))
        throw new Error(`Bad suit: ${s}`);
    return { rank: r, suit: s };
}
export function rankValue(r) {
    return RANK_VALUE[r];
}
/** Build a fresh ordered 52-card deck. */
export function freshDeck() {
    const out = [];
    for (const r of RANKS)
        for (const s of SUITS)
            out.push({ rank: r, suit: s });
    return out;
}
//# sourceMappingURL=card.js.map