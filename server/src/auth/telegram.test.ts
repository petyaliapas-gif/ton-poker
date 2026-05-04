import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { createHmac } from 'node:crypto';
import { verifyInitData } from './telegram.js';

function signInitData(params: Record<string, string>, botToken: string): string {
  const sorted = Object.keys(params).sort();
  const dataCheck = sorted.map((k) => `${k}=${params[k]}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = createHmac('sha256', secret).update(dataCheck).digest('hex');
  const usp = new URLSearchParams();
  for (const k of sorted) usp.set(k, params[k]!);
  usp.set('hash', hash);
  return usp.toString();
}

test('verifyInitData accepts a freshly signed payload', () => {
  const token = '123:fake-bot-token';
  const user = { id: 42, first_name: 'Petya', username: 'petya' };
  const params = {
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify(user),
  };
  const init = signInitData(params, token);
  const parsed = verifyInitData(init, token);
  assert.equal(parsed.user?.id, 42);
  assert.equal(parsed.user?.first_name, 'Petya');
});

test('verifyInitData rejects tampered hash', () => {
  const token = '123:fake-bot-token';
  const params = {
    auth_date: String(Math.floor(Date.now() / 1000)),
    user: JSON.stringify({ id: 1, first_name: 'A' }),
  };
  const init = signInitData(params, token);
  const tampered = init.replace(/hash=[a-f0-9]+/, (m) => m.slice(0, -1) + '0');
  assert.throws(() => verifyInitData(tampered, token));
});

test('verifyInitData rejects stale payload', () => {
  const token = 't';
  const params = {
    auth_date: String(Math.floor(Date.now() / 1000) - 100_000),
    user: JSON.stringify({ id: 1, first_name: 'A' }),
  };
  const init = signInitData(params, token);
  assert.throws(() => verifyInitData(init, token, 60));
});
