import { verifyInitData } from '../auth/telegram.js';
import { upsertUserFromInitData, toPublic } from '../services/users.js';
import { loadConfig } from '../config.js';
import { getPrisma } from '../db.js';
/**
 * POST /api/auth
 * Body: { initData: string }
 * Returns: { user: UserPublic, balanceTon: string, lockedTon: string }
 */
export function registerAuthRoutes(app) {
    const cfg = loadConfig();
    const db = getPrisma();
    app.post('/api/auth', async (req, reply) => {
        try {
            const { initData } = req.body ?? {};
            if (!initData)
                return reply.code(400).send({ error: 'initData required' });
            const parsed = verifyInitData(initData, cfg.TELEGRAM_BOT_TOKEN);
            if (!parsed.user)
                return reply.code(401).send({ error: 'no user in initData' });
            if (parsed.user.is_bot && !cfg.ALLOW_BOT_USERS) {
                return reply.code(403).send({ error: 'bots not allowed' });
            }
            const country = (req.headers['cf-ipcountry'] ?? req.headers['x-country']);
            const blocked = cfg.GEO_BLOCK_COUNTRIES.split(',')
                .map((c) => c.trim().toUpperCase())
                .filter(Boolean);
            if (country && blocked.includes(country.toUpperCase())) {
                return reply.code(451).send({ error: 'unavailable in your region' });
            }
            const user = await upsertUserFromInitData(db, parsed.user, country?.toUpperCase());
            if (user.selfExcludedUntil && user.selfExcludedUntil > new Date()) {
                return reply.code(403).send({ error: 'self-excluded' });
            }
            return {
                user: toPublic(user),
                balanceTon: user.balanceTon.toString(),
                lockedTon: user.lockedTon.toString(),
            };
        }
        catch (err) {
            req.log.warn({ err: String(err) }, 'auth failed');
            return reply.code(401).send({ error: 'auth failed' });
        }
    });
}
//# sourceMappingURL=auth.js.map