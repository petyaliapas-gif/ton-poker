import type { AppConfig } from '../config.js';
import { tonToNano } from '../config.js';
import { log } from '../log.js';

/**
 * Stars→TON conversion service.
 *
 * Net USD per star = STAR_USD_PRICE * (1 - TG_STAR_FEE_RATIO)
 * Max TON per star = net_usd / ton_usd
 * Offered TON per star = max * (1 - STARS_MARGIN)
 *
 * TON price is fetched from CoinGecko every TON_PRICE_REFRESH_SEC seconds
 * with a fallback to a stable static price if the network is down.
 */
export interface TonPriceSnapshot {
  usd: number;
  fetchedAt: number; // unix ms
  source: 'coingecko' | 'static-fallback';
}

const FALLBACK_TON_USD = 2.5;

export class PricingService {
  private current: TonPriceSnapshot = {
    usd: FALLBACK_TON_USD,
    fetchedAt: 0,
    source: 'static-fallback',
  };
  private refreshTimer: NodeJS.Timeout | null = null;

  constructor(private cfg: AppConfig) {}

  start(): void {
    this.refresh();
    this.refreshTimer = setInterval(
      () => this.refresh(),
      this.cfg.TON_PRICE_REFRESH_SEC * 1000,
    );
  }

  stop(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = null;
  }

  async refresh(): Promise<void> {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=usd',
        { signal: AbortSignal.timeout(8000) },
      );
      const data = (await res.json()) as { 'the-open-network'?: { usd?: number } };
      const usd = data['the-open-network']?.usd;
      if (typeof usd === 'number' && usd > 0) {
        this.current = { usd, fetchedAt: Date.now(), source: 'coingecko' };
        log.debug({ usd }, 'TON price refreshed');
      }
    } catch (err) {
      log.warn({ err: String(err) }, 'TON price refresh failed; keeping previous');
    }
  }

  get tonUsd(): number {
    return this.current.usd;
  }

  snapshot(): TonPriceSnapshot {
    return { ...this.current };
  }

  /** Compute breakeven & offered TON-per-star. */
  conversion(): {
    starsUsd: number;
    netUsdPerStar: number;
    maxTonPerStar: number;
    tonPerStar: number;
    margin: number;
  } {
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
  starsToNanoTon(stars: number): bigint {
    const { tonPerStar } = this.conversion();
    const ton = stars * tonPerStar;
    return tonToNano(ton.toFixed(9));
  }

  /** Predefined Stars → TON packages displayed in the cashier. */
  packages(): Array<{ stars: number; ton: string; bonus?: string }> {
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

function nanoFormat(n: bigint): string {
  const whole = n / 1_000_000_000n;
  const frac = (n % 1_000_000_000n).toString().padStart(9, '0').slice(0, 4);
  return `${whole}.${frac}`;
}
