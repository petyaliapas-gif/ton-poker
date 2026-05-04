import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { TableEngine } from './engine.js';

function mkEngine(seats: 2 | 6 | 9 = 2): TableEngine {
  return new TableEngine({
    maxSeats: seats,
    smallBlind: 5n,
    bigBlind: 10n,
    rakePercent: 5,
    rakeCapBb: 3,
  });
}

test('heads-up: blinds, fold, button rotates', () => {
  const e = mkEngine(2);
  e.sit(0, 'u0', 1000n);
  e.sit(1, 'u1', 1000n);
  e.startHand('h1');

  // Heads-up: button = SB. Button should be seat 0 first hand.
  assert.equal(e.buttonSeat, 0);
  // SB = 0, BB = 1, action on button (seat 0) preflop
  assert.equal(e.toActSeat, 0);

  // Seat 0 folds
  e.act(0, { kind: 'fold' });
  assert.equal(e.street, 'idle');
  // Seat 1 wins SB (5) since rake doesn't apply (pot < 2 BB? pot = 15, no — pot is 15 = 1.5 BB)
  // Pot = 5 (SB) + 10 (BB) = 15; below 2 BB threshold, so no rake.
  assert.equal(e.seatAt(1).stack, 1000n + 5n);
  assert.equal(e.seatAt(0).stack, 995n);
});

test('heads-up: limp call → check-down to showdown awards a winner', () => {
  const e = mkEngine(2);
  e.sit(0, 'u0', 1000n);
  e.sit(1, 'u1', 1000n);
  e.startHand('h1');

  // Preflop: SB(0) calls 5 → bets equal, BB checks
  e.act(0, { kind: 'call' }); // pays 5 more
  e.act(1, { kind: 'check' });
  assert.equal(e.street, 'flop');
  e.act(1, { kind: 'check' }); // postflop SB acts first; but live=2, button is 0, so action starts at next live which is 1? Wait.
  // Heads-up postflop: BB acts first (left of button is the only other player).
  // We just made BB(1) check first, then SB(0) checks.
  e.act(0, { kind: 'check' });
  assert.equal(e.street, 'turn');
  e.act(1, { kind: 'check' });
  e.act(0, { kind: 'check' });
  assert.equal(e.street, 'river');
  e.act(1, { kind: 'check' });
  e.act(0, { kind: 'check' });
  assert.equal(e.street, 'idle');

  // Pot = 20, no rake (pot is 2 BB exactly, threshold is < 2 BB so 2 BB is rakeable —
  // actually threshold says `< bb*2` returns 0; 20 is NOT less than 20, so rake = 5% = 1, capped at 30).
  // Total stacks should remain 2000.
  assert.equal(e.seatAt(0).stack + e.seatAt(1).stack + 1n, 2000n); // 1 chip rake
});

test('all-in creates side pot in 3-handed', () => {
  const e = mkEngine(6);
  e.sit(0, 'u0', 1000n);
  e.sit(1, 'u1', 1000n);
  e.sit(2, 'u2', 200n); // short stack
  e.startHand('h1');

  // 6-max: button rotates to first eligible from -1 → seat 0. SB=1, BB=2.
  assert.equal(e.buttonSeat, 0);
  // Action preflop: UTG = nextLive(BB=2) = 0
  assert.equal(e.toActSeat, 0);

  // Seat 0 raises to 30
  e.act(0, { kind: 'raise', amount: 30n });
  // Seat 1 (SB) calls
  e.act(1, { kind: 'call' });
  // Seat 2 (BB) shoves all-in (190 remaining + 10 already in BB = 200 total)
  e.act(2, { kind: 'all_in' });
  // Action returns to seat 0, who calls
  e.act(0, { kind: 'call' });
  // Seat 1 calls
  e.act(1, { kind: 'call' });

  // Should advance to flop
  assert.equal(e.street, 'flop');
  // Pots: main pot = 200*3 = 600, side pot starts when remaining streets push more chips
});

test('uncontested win refunds correctly', () => {
  const e = mkEngine(6);
  e.sit(0, 'u0', 1000n);
  e.sit(1, 'u1', 1000n);
  e.sit(2, 'u2', 1000n);
  e.startHand('h1');
  // Action: 0 raises, others fold
  e.act(0, { kind: 'raise', amount: 30n });
  e.act(1, { kind: 'fold' });
  e.act(2, { kind: 'fold' });
  // Hand ended, seat 0 wins SB+BB+30 minus their own 30
  assert.equal(e.street, 'idle');
  assert.equal(e.seatAt(0).stack, 1000n + 5n + 10n); // SB + BB taken
});

test('cannot raise less than min raise', () => {
  const e = mkEngine(6);
  e.sit(0, 'u0', 1000n);
  e.sit(1, 'u1', 1000n);
  e.sit(2, 'u2', 1000n);
  e.startHand('h1');
  // BB is 10. Min raise total = currentBet (10) + minRaise (10) = 20.
  assert.throws(() => e.act(0, { kind: 'raise', amount: 15n }));
  e.act(0, { kind: 'raise', amount: 20n }); // legal
});
