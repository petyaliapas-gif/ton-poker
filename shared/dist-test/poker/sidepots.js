/**
 * Build the main pot and any side pots from per-player contributions.
 * Side pots are layered: lowest all-in level forms the main pot,
 * subsequent layers form side pots only contested by players still in.
 */
export function buildPots(contribs) {
    const remaining = contribs
        .filter((c) => c.contributed > 0n)
        .map((c) => ({ ...c }));
    const pots = [];
    while (remaining.length > 0) {
        const levels = [...remaining]
            .map((c) => c.contributed)
            .filter((v) => v > 0n)
            .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
        if (levels.length === 0)
            break;
        const level = levels[0];
        let amount = 0n;
        const eligible = [];
        for (const c of remaining) {
            const take = c.contributed < level ? c.contributed : level;
            amount += take;
            c.contributed -= take;
            if (c.eligible && take > 0n)
                eligible.push(c.seat);
        }
        pots.push({ amount, eligibleSeats: dedupSorted(eligible) });
        for (let i = remaining.length - 1; i >= 0; i--) {
            if (remaining[i].contributed === 0n)
                remaining.splice(i, 1);
        }
    }
    return pots;
}
function dedupSorted(a) {
    return [...new Set(a)].sort((x, y) => x - y);
}
//# sourceMappingURL=sidepots.js.map