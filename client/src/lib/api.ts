import { getInitData } from './tg';

const BASE = import.meta.env.VITE_API_BASE ?? '';

async function req<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export interface AuthResponse {
  user: { id: string; telegramId: number; username: string | null; firstName: string; avatarUrl: string | null; vipUntil: number | null };
  balanceTon: string;
  lockedTon: string;
}

export interface CashTableInfo {
  id: string;
  name: string;
  stake: 'micro' | 'low' | 'mid' | 'high' | 'highroller';
  smallBlind: string;
  bigBlind: string;
  minBuyIn: string;
  maxBuyIn: string;
  maxSeats: 2 | 6 | 9;
  seated: number;
  waiting: number;
  avgPot: string;
  handsPerHour: number;
}

export const api = {
  auth: () =>
    req<AuthResponse>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ initData: getInitData() }),
    }),
  cashTables: () => req<CashTableInfo[]>('/api/lobby/cash'),
  conversion: () =>
    req<{
      tonUsd: number;
      conversion: { starsUsd: number; netUsdPerStar: number; maxTonPerStar: number; tonPerStar: number; margin: number };
      packages: Array<{ stars: number; ton: string }>;
    }>('/api/cashier/conversion'),
  createDeposit: (amountTon: string) =>
    req<{ payUrl: string; miniAppUrl?: string; invoiceId: number; expiresIn: number }>(
      '/api/cashier/deposit',
      { method: 'POST', body: JSON.stringify({ initData: getInitData(), amountTon }) },
    ),
  createWithdraw: (amountTon: string) =>
    req<{ ok: boolean; claimUrl: string }>('/api/cashier/withdraw', {
      method: 'POST',
      body: JSON.stringify({ initData: getInitData(), amountTon }),
    }),
  createStarsInvoice: (params: { itemKind: 'cosmetic' | 'tournament_ticket'; itemId: string; stars: number }) =>
    req<{ link: string }>('/api/stars/invoice', {
      method: 'POST',
      body: JSON.stringify({ initData: getInitData(), ...params }),
    }),
};

/** Format nanoTON bigint string as human-readable TON. */
export function fmtTon(nano: string | bigint, digits = 2): string {
  const n = typeof nano === 'bigint' ? nano : BigInt(nano || '0');
  const whole = n / 1_000_000_000n;
  const frac = (n % 1_000_000_000n).toString().padStart(9, '0').slice(0, digits);
  return `${whole}.${frac}`;
}
