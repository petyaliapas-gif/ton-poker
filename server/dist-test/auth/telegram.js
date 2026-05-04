import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
export function verifyInitData(initData, botToken, maxAgeSec = 86_400) {
    if (!initData)
        throw new Error('initData is empty');
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash)
        throw new Error('initData missing hash');
    params.delete('hash');
    const pairs = [];
    params.forEach((value, key) => pairs.push([key, value]));
    pairs.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    const dataCheckString = pairs.map(([k, v]) => `${k}=${v}`).join('\n');
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calc = createHmac('sha256', secretKey).update(dataCheckString).digest();
    const provided = Buffer.from(hash, 'hex');
    if (provided.length !== calc.length || !timingSafeEqual(provided, calc)) {
        throw new Error('initData hash mismatch');
    }
    const authDate = Number(params.get('auth_date') ?? 0);
    if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) {
        throw new Error('initData expired');
    }
    const userJson = params.get('user');
    const user = userJson ? JSON.parse(userJson) : undefined;
    const raw = {};
    pairs.forEach(([k, v]) => (raw[k] = v));
    return {
        user,
        auth_date: authDate,
        hash,
        start_param: params.get('start_param') ?? undefined,
        query_id: params.get('query_id') ?? undefined,
        raw,
    };
}
/** Compute SHA-256 hex of a string (for non-secret IDs). */
export function sha256Hex(s) {
    return createHash('sha256').update(s).digest('hex');
}
//# sourceMappingURL=telegram.js.map