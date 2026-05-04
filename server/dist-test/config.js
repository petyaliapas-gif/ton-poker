import 'dotenv/config';
import { z } from 'zod';
const Schema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    PUBLIC_URL: z.string().url().default('http://localhost:3000'),
    JWT_SECRET: z.string().min(16),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
    // Telegram
    TELEGRAM_BOT_TOKEN: z.string().min(10),
    TELEGRAM_BOT_USERNAME: z.string().optional(),
    MINI_APP_URL: z.string().url(),
    WEBHOOK_URL: z
        .string()
        .optional()
        .transform((v) => (v ? v : undefined))
        .pipe(z.string().url().optional()),
    // CryptoBot
    CRYPTO_PAY_API_URL: z.string().url().default('https://testnet-pay.crypt.bot'),
    CRYPTO_PAY_TOKEN: z
        .string()
        .optional()
        .transform((v) => (v ? v : undefined)),
    CRYPTO_PAY_WEBHOOK_SECRET: z
        .string()
        .optional()
        .transform((v) => (v ? v : undefined)),
    // Pricing
    STAR_USD_PRICE: z.coerce.number().positive().default(0.013),
    TG_STAR_FEE_RATIO: z.coerce.number().min(0).max(1).default(0.30),
    STARS_MARGIN: z.coerce.number().min(0).max(0.5).default(0.15),
    TON_PRICE_REFRESH_SEC: z.coerce.number().int().positive().default(60),
    RAKE_PERCENT: z.coerce.number().min(0).max(20).default(5),
    RAKE_CAP_BB: z.coerce.number().int().positive().default(3),
    TOURNAMENT_FEE_PERCENT: z.coerce.number().min(0).max(50).default(10),
    VIP_RAKEBACK_PERCENT: z.coerce.number().min(0).max(100).default(30),
    // Limits
    MIN_DEPOSIT_TON: z.coerce.number().positive().default(0.5),
    MAX_DEPOSIT_TON_NO_KYC_MONTHLY: z.coerce.number().positive().default(1000),
    MIN_WITHDRAW_TON: z.coerce.number().positive().default(1),
    WITHDRAW_FEE_TON: z.coerce.number().min(0).default(0.1),
    // Anti-fraud
    GEO_BLOCK_COUNTRIES: z.string().default(''),
    ALLOW_BOT_USERS: z
        .union([z.literal('true'), z.literal('false')])
        .default('false')
        .transform((v) => v === 'true'),
});
let cached = null;
export function loadConfig() {
    if (cached)
        return cached;
    const parsed = Schema.safeParse(process.env);
    if (!parsed.success) {
        // eslint-disable-next-line no-console
        console.error('[config] invalid environment:', parsed.error.flatten().fieldErrors);
        throw new Error('Invalid environment configuration');
    }
    cached = parsed.data;
    return cached;
}
/** Helper to convert a TON decimal value (e.g. 1.5) to nanoTON bigint. */
export function tonToNano(ton) {
    const s = typeof ton === 'number' ? ton.toFixed(9) : ton;
    const [whole, frac = ''] = s.split('.');
    const padded = (frac + '000000000').slice(0, 9);
    return BigInt(whole) * 1000000000n + BigInt(padded || '0');
}
export function nanoToTon(n) {
    const neg = n < 0n;
    const abs = neg ? -n : n;
    const whole = abs / 1000000000n;
    const frac = (abs % 1000000000n).toString().padStart(9, '0').replace(/0+$/, '');
    return `${neg ? '-' : ''}${whole}${frac ? '.' + frac : ''}`;
}
//# sourceMappingURL=config.js.map