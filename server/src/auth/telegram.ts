import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verify Telegram WebApp `initData` per
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * 1. Parse the query string.
 * 2. Extract `hash` param (the HMAC-SHA-256 of the data).
 * 3. Build data_check_string = sorted(`${k}=${v}`) joined by `\n`.
 * 4. secret_key = HMAC_SHA256("WebAppData", bot_token).
 * 5. Compare HMAC_SHA256(secret_key, data_check_string) with `hash`.
 */
export interface TelegramInitDataUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface ParsedInitData {
  user?: TelegramInitDataUser;
  auth_date: number;
  hash: string;
  start_param?: string;
  query_id?: string;
  raw: Record<string, string>;
}

export function verifyInitData(
  initData: string,
  botToken: string,
  maxAgeSec = 86_400,
): ParsedInitData {
  if (!initData) throw new Error('initData is empty');
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) throw new Error('initData missing hash');
  params.delete('hash');

  const pairs: [string, string][] = [];
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
  const user = userJson ? (JSON.parse(userJson) as TelegramInitDataUser) : undefined;

  const raw: Record<string, string> = {};
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
export function sha256Hex(s: string): string {
  return createHash('sha256').update(s).digest('hex');
}
