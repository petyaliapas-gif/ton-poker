import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { buildPots } from './sidepots.js';

test('single pot when contributions equal', () => {
  const pots = buildPots([
    { seat: 0, contributed: 100n, eligible: true },
    { seat: 1, contributed: 100n, eligible: true },
    { seat: 2, contributed: 100n, eligible: true },
  ]);
  assert.equal(pots.length, 1);
  assert.equal(pots[0]!.amount, 300n);
  assert.deepEqual(pots[0]!.eligibleSeats, [0, 1, 2]);
});

test('one all-in creates main + side pot', () => {
  const pots = buildPots([
    { seat: 0, contributed: 50n, eligible: true }, // all-in
    { seat: 1, contributed: 200n, eligible: true },
    { seat: 2, contributed: 200n, eligible: true },
  ]);
  assert.equal(pots.length, 2);
  assert.equal(pots[0]!.amount, 150n); // 50*3
  assert.deepEqual(pots[0]!.eligibleSeats, [0, 1, 2]);
  assert.equal(pots[1]!.amount, 300n); // 150*2
  assert.deepEqual(pots[1]!.eligibleSeats, [1, 2]);
});

test('two all-ins create three pot layers', () => {
  const pots = buildPots([
    { seat: 0, contributed: 30n, eligible: true },
    { seat: 1, contributed: 80n, eligible: true },
    { seat: 2, contributed: 200n, eligible: true },
  ]);
  assert.equal(pots.length, 3);
  assert.equal(pots[0]!.amount, 90n); // 30*3
  assert.deepEqual(pots[0]!.eligibleSeats, [0, 1, 2]);
  assert.equal(pots[1]!.amount, 100n); // 50*2
  assert.deepEqual(pots[1]!.eligibleSeats, [1, 2]);
  assert.equal(pots[2]!.amount, 120n); // 120
  assert.deepEqual(pots[2]!.eligibleSeats, [2]);
});

test('folded players still contribute but are not eligible', () => {
  const pots = buildPots([
    { seat: 0, contributed: 100n, eligible: false }, // folded
    { seat: 1, contributed: 100n, eligible: true },
    { seat: 2, contributed: 100n, eligible: true },
  ]);
  assert.equal(pots.length, 1);
  assert.equal(pots[0]!.amount, 300n);
  assert.deepEqual(pots[0]!.eligibleSeats, [1, 2]);
});
