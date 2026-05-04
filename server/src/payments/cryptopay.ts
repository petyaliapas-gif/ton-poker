import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import type { AppConfig } from '../config.js';

/**
 * Minimal Crypto Pay (CryptoBot) client.
 * Docs: https://help.crypt.bot/crypto-pay-api
 */
export interface CreateInvoiceOptions {
  asset: 'TON' | 'USDT' | 'BTC' | 'ETH' | 'BNB' | 'TRX' | 'USDC' | 'JET';
  amount: string; // human readable, e.g. "1.5"
  description?: string;
  hidden_message?: string;
  paid_btn_name?: 'viewItem' | 'openChannel' | 'openBot' | 'callback';
  paid_btn_url?: string;
  payload?: string;
  allow_comments?: boolean;
  allow_anonymous?: boolean;
  expires_in?: number; // seconds
}

export interface CryptoPayInvoice {
  invoice_id: number;
  status: 'active' | 'paid' | 'expired';
  hash: string;
  asset: string;
  amount: string;
  pay_url: string;
  bot_invoice_url?: string;
  mini_app_invoice_url?: string;
  description?: string;
  created_at: string;
  paid_at?: string;
  payload?: string;
}

export interface CreateCheckOptions {
  asset: 'TON' | 'USDT' | 'BTC' | 'ETH';
  amount: string;
  pin_to_user_id?: number;
  pin_to_username?: string;
}

export class CryptoPayClient {
  constructor(
    private apiUrl: string,
    private token: string,
  ) {}

  static fromConfig(c: AppConfig): CryptoPayClient | null {
    if (!c.CRYPTO_PAY_TOKEN) return null;
    return new CryptoPayClient(c.CRYPTO_PAY_API_URL, c.CRYPTO_PAY_TOKEN);
  }

  async getMe(): Promise<{ app_id: number; name: string; payment_processing_bot_username: string }> {
    return this.call('getMe', {});
  }

  async getBalance(): Promise<Array<{ currency_code: string; available: string; onhold: string }>> {
    return this.call('getBalance', {});
  }

  async createInvoice(opts: CreateInvoiceOptions): Promise<CryptoPayInvoice> {
    return this.call('createInvoice', opts);
  }

  async getInvoices(invoiceIds: number[]): Promise<{ items: CryptoPayInvoice[] }> {
    return this.call('getInvoices', { invoice_ids: invoiceIds.join(',') });
  }

  /**
   * Create a Crypto Pay "check" — a transferable cheque the recipient redeems in @CryptoBot.
   * Used for withdrawals.
   */
  async createCheck(opts: CreateCheckOptions): Promise<{ check_id: number; bot_check_url: string }> {
    return this.call('createCheck', opts);
  }

  async transfer(opts: {
    user_id: number;
    asset: 'TON' | 'USDT' | 'BTC';
    amount: string;
    spend_id: string;
    comment?: string;
    disable_send_notification?: boolean;
  }): Promise<{ transfer_id: number; status: string }> {
    return this.call('transfer', opts);
  }

  async getExchangeRates(): Promise<Array<{ source: string; target: string; rate: string }>> {
    return this.call('getExchangeRates', {});
  }

  /**
   * Verify a Crypto Pay webhook payload.
   * Header: `crypto-pay-api-signature: <hex>`
   * `signature = HMAC_SHA256(SHA256(token), JSON.stringify(body))`.
   */
  static verifyWebhook(token: string, signatureHex: string, rawBody: string): boolean {
    const secret = createHash('sha256').update(token).digest();
    const calc = createHmac('sha256', secret).update(rawBody).digest();
    const provided = Buffer.from(signatureHex, 'hex');
    if (provided.length !== calc.length) return false;
    return timingSafeEqual(provided, calc);
  }

  private async call<T>(method: string, body: object): Promise<T> {
    const res = await fetch(`${this.apiUrl}/api/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Crypto-Pay-API-Token': this.token,
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { ok: boolean; result?: T; error?: { code: number; name: string } };
    if (!json.ok) {
      throw new Error(`CryptoPay ${method} failed: ${json.error?.name ?? 'unknown'}`);
    }
    return json.result as T;
  }
}
