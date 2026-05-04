import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { evalFive, evaluateBest, HandCategory, compareScores } from './evaluator.js';
import { parseCard } from './card.js';
const C = (s) => s.split(' ').map(parseCard);
test('royal flush beats straight flush', () => {
    const royal = evalFive(C('As Ks Qs Js Ts'));
    const sf = evalFive(C('9h 8h 7h 6h 5h'));
    assert.equal(royal.category, HandCategory.RoyalFlush);
    assert.equal(sf.category, HandCategory.StraightFlush);
    assert.ok(compareScores(royal.score, sf.score) > 0);
});
test('wheel A-2-3-4-5 is a straight with high card 5', () => {
    const wheel = evalFive(C('5d 4c 3h 2s Ah'));
    assert.equal(wheel.category, HandCategory.Straight);
    assert.equal(wheel.score[1], 5);
});
test('four of a kind beats full house', () => {
    const quads = evalFive(C('Ah As Ad Ac 2s'));
    const full = evalFive(C('Kh Ks Kd 2c 2s'));
    assert.equal(quads.category, HandCategory.FourOfKind);
    assert.equal(full.category, HandCategory.FullHouse);
    assert.ok(compareScores(quads.score, full.score) > 0);
});
test('flush beats straight', () => {
    const flush = evalFive(C('Ah Th 8h 5h 2h'));
    const str = evalFive(C('9c 8d 7h 6s 5d'));
    assert.equal(flush.category, HandCategory.Flush);
    assert.equal(str.category, HandCategory.Straight);
    assert.ok(compareScores(flush.score, str.score) > 0);
});
test('two pair compares high pair first, then low, then kicker', () => {
    const a = evalFive(C('Ah Ad 2c 2s 9h')); // AA22 K9
    const b = evalFive(C('Kh Kd Qc Qs Jh')); // KKQQ J
    assert.ok(compareScores(a.score, b.score) > 0);
    const c = evalFive(C('Ah Ad 2c 2s 9h'));
    const d = evalFive(C('Ah Ac 2d 2h 8s'));
    assert.ok(compareScores(c.score, d.score) > 0); // 9 beats 8 kicker
});
test('evaluateBest picks best 5 of 7', () => {
    // Hole AA + board AAK99 → quads
    const ev = evaluateBest(C('As Ah Ad Ac Kd 9h 9c'));
    assert.equal(ev.category, HandCategory.FourOfKind);
    assert.equal(ev.score[1], 14);
});
test('high card tiebreak compares all 5 kickers', () => {
    const a = evalFive(C('Ah Kd Qc 9s 7h'));
    const b = evalFive(C('Ah Kd Qc 9s 6h'));
    assert.ok(compareScores(a.score, b.score) > 0);
});
//# sourceMappingURL=evaluator.test.js.map