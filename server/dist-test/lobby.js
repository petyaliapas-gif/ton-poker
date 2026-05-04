import { tonToNano } from './config.js';
const T = (id, name, stake, sb, bb, min, max, seats) => ({
    id,
    name,
    stake,
    smallBlind: tonToNano(sb),
    bigBlind: tonToNano(bb),
    minBuyIn: tonToNano(min),
    maxBuyIn: tonToNano(max),
    maxSeats: seats,
});
/** Cash table catalog. Edit / extend freely. */
export const CASH_TABLES = [
    // Micro
    T('micro-hu-1', 'Newbie Heads-Up I', 'micro', 0.01, 0.02, 0.4, 2, 2),
    T('micro-hu-2', 'Newbie Heads-Up II', 'micro', 0.01, 0.02, 0.4, 2, 2),
    T('micro-6m', 'Micro 6-Max', 'micro', 0.01, 0.02, 0.4, 2, 6),
    // Low
    T('low-hu', 'Low Heads-Up', 'low', 0.05, 0.1, 2, 10, 2),
    T('low-6m', 'Low 6-Max', 'low', 0.05, 0.1, 2, 10, 6),
    T('low-9m', 'Low Full Ring', 'low', 0.05, 0.1, 2, 10, 9),
    // Mid
    T('mid-6m', 'Pro 6-Max', 'mid', 0.25, 0.5, 10, 50, 6),
    T('mid-9m', 'Pro Full Ring', 'mid', 0.25, 0.5, 10, 50, 9),
    // High
    T('high-6m', 'High Stakes 6-Max', 'high', 1, 2, 40, 200, 6),
    T('high-hu', 'High Stakes Heads-Up', 'high', 1, 2, 40, 200, 2),
    // High roller
    T('hr-6m', 'High Roller 6-Max', 'highroller', 5, 10, 200, 1000, 6),
];
export function findTable(id) {
    return CASH_TABLES.find((t) => t.id === id);
}
/**
 * Public lobby info; the table manager fills in dynamic fields (seated, waiting).
 */
export function publicTableInfo(cfg, dyn) {
    return {
        id: cfg.id,
        name: cfg.name,
        stake: cfg.stake,
        smallBlind: cfg.smallBlind.toString(),
        bigBlind: cfg.bigBlind.toString(),
        minBuyIn: cfg.minBuyIn.toString(),
        maxBuyIn: cfg.maxBuyIn.toString(),
        maxSeats: cfg.maxSeats,
        seated: dyn.seated,
        waiting: dyn.waiting,
        avgPot: dyn.avgPot.toString(),
        handsPerHour: dyn.handsPerHour,
    };
}
//# sourceMappingURL=lobby.js.map