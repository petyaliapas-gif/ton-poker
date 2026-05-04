import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
export class CryptoPayClient {
    apiUrl;
    token;
    constructor(apiUrl, token) {
        this.apiUrl = apiUrl;
        this.token = token;
    }
    static fromConfig(c) {
        if (!c.CRYPTO_PAY_TOKEN)
            return null;
        return new CryptoPayClient(c.CRYPTO_PAY_API_URL, c.CRYPTO_PAY_TOKEN);
    }
    async getMe() {
        return this.call('getMe', {});
    }
    async getBalance() {
        return this.call('getBalance', {});
    }
    async createInvoice(opts) {
        return this.call('createInvoice', opts);
    }
    async getInvoices(invoiceIds) {
        return this.call('getInvoices', { invoice_ids: invoiceIds.join(',') });
    }
    /**
     * Create a Crypto Pay "check" — a transferable cheque the recipient redeems in @CryptoBot.
     * Used for withdrawals.
     */
    async createCheck(opts) {
        return this.call('createCheck', opts);
    }
    async transfer(opts) {
        return this.call('transfer', opts);
    }
    async getExchangeRates() {
        return this.call('getExchangeRates', {});
    }
    /**
     * Verify a Crypto Pay webhook payload.
     * Header: `crypto-pay-api-signature: <hex>`
     * `signature = HMAC_SHA256(SHA256(token), JSON.stringify(body))`.
     */
    static verifyWebhook(token, signatureHex, rawBody) {
        const secret = createHash('sha256').update(token).digest();
        const calc = createHmac('sha256', secret).update(rawBody).digest();
        const provided = Buffer.from(signatureHex, 'hex');
        if (provided.length !== calc.length)
            return false;
        return timingSafeEqual(provided, calc);
    }
    async call(method, body) {
        const res = await fetch(`${this.apiUrl}/api/${method}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Crypto-Pay-API-Token': this.token,
            },
            body: JSON.stringify(body),
        });
        const json = (await res.json());
        if (!json.ok) {
            throw new Error(`CryptoPay ${method} failed: ${json.error?.name ?? 'unknown'}`);
        }
        return json.result;
    }
}
//# sourceMappingURL=cryptopay.js.map