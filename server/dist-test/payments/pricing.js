import { tonToNano } from '../config.js';
import { log } from '../log.js';
const FALLBACK_TON_USD = 2.5;
export class PricingService {
    cfg;
    current = {
        usd: FALLBACK_TON_USD,
        fetchedAt: 0,
        source: 'static-fallback',
    };
    refreshTimer = null;
    constructor(cfg) {
        this.cfg = cfg;
    }
    start() {
        this.refresh();
        this.refreshTimer = setInterval(() => this.refresh(), this.cfg.TON_PRICE_REFRESH_SEC * 1000);
    }
    stop() {
        if (this.refreshTimer)
            clearInterval(this.refreshTimer);
        this.refreshTimer = null;
    }
    async refresh() {
        try {
            const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd', { signal: AbortSignal.timeout(8000) });
            const data = (await res.json());
            const usd = data['the-open-network']?.usd;
            if (typeof usd === 'number' && usd > 0) {
                this.current = { usd, fetchedAt: Date.now(), source: 'coingecko' };
                log.debug({ usd }, 'TON price refreshed');
            }
        }
        catch (err) {
            log.warn({ err: String(err) }, 'TON price refresh failed; keeping previous');
        }
    }
    get tonUsd() {
        return this.current.usd;
    }
    snapshot() {
        return { ...this.current };
    }
    /** Compute breakeven & offered TON-per-star. */
    conversion() {
        const starsUsd = this.cfg.STAR_USD_PRICE;
        const netUsdPerStar = starsUsd * (1 - this.cfg.TG_STAR_FEE_RATIO);
        const maxTonPerStar = netUsdPerStar / this.current.usd;
        const tonPerStar = maxTonPerStar * (1 - this.cfg.STARS_MARGIN);
        return {
            starsUsd,
            netUsdPerStar,
            maxTonPerStar,
            tonPerStar,
            margin: this.cfg.STARS_MARGIN,
        };
    }
    /** TON (nanoTON) the user receives for `stars`. */
    starsToNanoTon(stars) {
        const { tonPerStar } = this.conversion();
        const ton = stars * tonPerStar;
        return tonToNano(ton.toFixed(9));
    }
    /** Predefined Stars → TON packages displayed in the cashier. */
    packages() {
        const presets = [100, 500, 1000, 2500, 5000, 10000];
        return presets.map((stars) => {
            const nano = this.starsToNanoTon(stars);
            return {
                stars,
                ton: nanoFormat(nano),
            };
        });
    }
}
function nanoFormat(n) {
    const whole = n / 1000000000n;
    const frac = (n % 1000000000n).toString().padStart(9, '0').slice(0, 4);
    return `${whole}.${frac}`;
}
//# sourceMappingURL=pricing.js.map