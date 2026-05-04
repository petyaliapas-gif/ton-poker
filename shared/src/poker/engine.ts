import { type Card, cardCode } from './card.js';
import { secureShuffle } from './deck.js';
import { evaluateBest, compareScores, type HandEval } from './evaluator.js';
import { buildPots, type Pot, type PotContribution } from './sidepots.js';

export type Street = 'idle' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export type SeatState =
  | 'empty'
  | 'sitting_out'
  | 'waiting'
  | 'playing'
  | 'folded'
  | 'all_in';

export interface Seat {
  index: number;
  userId: string | null;
  stack: bigint; // chips at the seat
  hole: Card[]; // hidden hole cards
  bet: bigint; // committed this street
  totalBet: bigint; // committed this hand (for side pots)
  state: SeatState;
  hasActedThisStreet: boolean;
  /** `true` if currently sitting and was dealt cards in the current hand. */
  inHand: boolean;
}

export interface EngineConfig {
  maxSeats: 2 | 6 | 9;
  smallBlind: bigint;
  bigBlind: bigint;
  rakePercent: number; // e.g. 5
  rakeCapBb: number; // e.g. 3 (cap at 3 big blinds)
  /** Min stack required to be dealt in (BB multiplier). Defaults to 1. */
  minStackBb?: number;
}

export interface ActionInput {
  kind: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';
  /** For bet/raise: total bet size for this street (not delta). */
  amount?: bigint;
}

export type EngineEvent =
  | { kind: 'hand_started'; handId: string; dealerSeat: number; commitment: string }
  | { kind: 'blinds_posted'; sb: number; bb: number; sbAmount: bigint; bbAmount: bigint }
  | { kind: 'cards_dealt'; seats: number[] }
  | { kind: 'action_taken'; seat: number; action: ActionInput; afterStack: bigint; potAfter: bigint }
  | { kind: 'street_advanced'; street: Street; community: Card[] }
  | { kind: 'turn_started'; seat: number; toCall: bigint; minRaise: bigint }
  | { kind: 'showdown'; reveals: { seat: number; hole: Card[]; eval: HandEval }[] }
  | { kind: 'pot_won'; awards: { seat: number; amount: bigint; potIndex: number }[]; }
  | { kind: 'rake_taken'; amount: bigint }
  | { kind: 'hand_ended'; seed: string };

export class TableEngine {
  readonly config: EngineConfig;
  seats: Seat[];
  buttonSeat = -1;
  street: Street = 'idle';
  community: Card[] = [];
  deck: Card[] = [];
  /** Largest current-street bet anyone has put up. */
  currentBet = 0n;
  /** Min raise increment (i.e. the size of the last full raise). */
  minRaise = 0n;
  /** Last seat that made a bet/raise; action closes when it reaches them again. */
  lastAggressorSeat = -1;
  /** Index of the seat to act next, or -1 if none. */
  toActSeat = -1;
  handId: string | null = null;
  commitment: string | null = null;
  seed: string | null = null;
  events: EngineEvent[] = [];

  constructor(config: EngineConfig) {
    this.config = config;
    this.seats = Array.from({ length: config.maxSeats }, (_, i) => ({
      index: i,
      userId: null,
      stack: 0n,
      hole: [],
      bet: 0n,
      totalBet: 0n,
      state: 'empty',
      hasActedThisStreet: false,
      inHand: false,
    }));
  }

  // ---------------- Seat management ----------------

  sit(seatIndex: number, userId: string, buyIn: bigint): void {
    const seat = this.seatAt(seatIndex);
    if (seat.state !== 'empty') throw new Error('Seat is occupied');
    if (buyIn <= 0n) throw new Error('Buy-in must be positive');
    seat.userId = userId;
    seat.stack = buyIn;
    seat.state = 'waiting';
  }

  leave(seatIndex: number): bigint {
    const seat = this.seatAt(seatIndex);
    if (seat.state === 'empty') return 0n;
    const refund = seat.stack;
    if (seat.inHand && this.street !== 'idle') {
      // Mark as folded for the rest of the hand; chips already in pot stay.
      seat.state = 'folded';
      seat.inHand = false;
      seat.userId = null;
      // Still remove user, but they cannot return until hand ends.
      seat.stack = 0n;
      return refund;
    }
    seat.userId = null;
    seat.stack = 0n;
    seat.hole = [];
    seat.bet = 0n;
    seat.totalBet = 0n;
    seat.state = 'empty';
    seat.hasActedThisStreet = false;
    seat.inHand = false;
    return refund;
  }

  seatAt(i: number): Seat {
    const s = this.seats[i];
    if (!s) throw new Error(`Bad seat index ${i}`);
    return s;
  }

  /** Number of seats currently occupied (not necessarily in current hand). */
  get occupiedCount(): number {
    return this.seats.filter((s) => s.state !== 'empty').length;
  }

  /** Number of players still contesting the current pot. */
  get liveCount(): number {
    return this.seats.filter((s) => s.inHand && s.state !== 'folded').length;
  }

  // ---------------- Hand lifecycle ----------------

  /** Start a new hand. Throws if not enough players. */
  startHand(handId: string): EngineEvent[] {
    const ready = this.seats.filter(
      (s) => s.state !== 'empty' && s.state !== 'sitting_out' && s.stack > 0n,
    );
    if (ready.length < 2) throw new Error('Need at least 2 players');

    // Reset state
    this.events = [];
    this.community = [];
    this.currentBet = 0n;
    this.minRaise = this.config.bigBlind;
    this.lastAggressorSeat = -1;
    this.handId = handId;

    for (const s of this.seats) {
      s.hole = [];
      s.bet = 0n;
      s.totalBet = 0n;
      s.hasActedThisStreet = false;
      s.inHand = false;
      if (s.state === 'folded') s.state = s.userId ? 'waiting' : 'empty';
    }

    // Move button to next eligible seat
    this.buttonSeat = this.nextEligibleSeat(this.buttonSeat);

    // Mark in-hand players
    for (const s of this.seats) {
      if (s.userId && s.state !== 'sitting_out' && s.stack > 0n) {
        s.inHand = true;
        s.state = 'playing';
      }
    }

    // Shuffle deck (provably fair: commitment first, seed revealed after hand)
    const sh = secureShuffle();
    this.deck = sh.deck;
    this.commitment = sh.commitment;
    this.seed = sh.seed;
    this.push({
      kind: 'hand_started',
      handId,
      dealerSeat: this.buttonSeat,
      commitment: sh.commitment,
    });

    this.postBlinds();
    this.dealHoleCards();
    this.street = 'preflop';

    // First to act preflop: seat after BB; heads-up: button (SB) acts first.
    const bb = this.bigBlindSeat();
    this.toActSeat = this.liveCount === 2 ? this.buttonSeat : this.nextLive(bb);
    this.push({
      kind: 'turn_started',
      seat: this.toActSeat,
      toCall: this.toCallFor(this.toActSeat),
      minRaise: this.minRaise,
    });

    return this.events;
  }

  private postBlinds(): void {
    const live = this.seats.filter((s) => s.inHand);
    let sbSeat: number;
    let bbSeat: number;
    if (live.length === 2) {
      // Heads-up: button is SB, other is BB.
      sbSeat = this.buttonSeat;
      bbSeat = this.nextLive(this.buttonSeat);
    } else {
      sbSeat = this.nextLive(this.buttonSeat);
      bbSeat = this.nextLive(sbSeat);
    }
    const sb = this.takeBlind(sbSeat, this.config.smallBlind);
    const bb = this.takeBlind(bbSeat, this.config.bigBlind);
    this.currentBet = bb;
    this.push({
      kind: 'blinds_posted',
      sb: sbSeat,
      bb: bbSeat,
      sbAmount: sb,
      bbAmount: bb,
    });
  }

  private takeBlind(seatIndex: number, amount: bigint): bigint {
    const s = this.seatAt(seatIndex);
    const post = amount > s.stack ? s.stack : amount;
    s.stack -= post;
    s.bet += post;
    s.totalBet += post;
    if (s.stack === 0n) s.state = 'all_in';
    return post;
  }

  private dealHoleCards(): void {
    const order: number[] = [];
    let cur = this.nextLive(this.buttonSeat);
    while (true) {
      order.push(cur);
      cur = this.nextLive(cur);
      if (cur === this.nextLive(this.buttonSeat)) break;
    }
    // Two passes, one card each.
    for (let pass = 0; pass < 2; pass++) {
      for (const idx of order) {
        const s = this.seatAt(idx);
        s.hole.push(this.deck.pop()!);
      }
    }
    this.push({ kind: 'cards_dealt', seats: order });
  }

  // ---------------- Action handling ----------------

  /**
   * Apply an action from the seat whose turn it is.
   * Returns the events generated.
   */
  act(seatIndex: number, action: ActionInput): EngineEvent[] {
    if (this.street === 'idle' || this.street === 'showdown') {
      throw new Error('No active street');
    }
    if (this.toActSeat !== seatIndex) {
      throw new Error(`Not seat ${seatIndex}'s turn (it is ${this.toActSeat})`);
    }
    this.events = [];
    const seat = this.seatAt(seatIndex);
    if (!seat.inHand || seat.state === 'folded' || seat.state === 'all_in') {
      throw new Error('Seat cannot act');
    }
    const toCall = this.currentBet - seat.bet;

    switch (action.kind) {
      case 'fold': {
        seat.state = 'folded';
        seat.hasActedThisStreet = true;
        break;
      }
      case 'check': {
        if (toCall !== 0n) throw new Error('Cannot check, must call or fold');
        seat.hasActedThisStreet = true;
        break;
      }
      case 'call': {
        const pay = toCall > seat.stack ? seat.stack : toCall;
        seat.stack -= pay;
        seat.bet += pay;
        seat.totalBet += pay;
        if (seat.stack === 0n) seat.state = 'all_in';
        seat.hasActedThisStreet = true;
        break;
      }
      case 'bet': {
        if (this.currentBet !== 0n) throw new Error('Cannot bet, there is already a bet');
        const total = action.amount ?? 0n;
        if (total < this.config.bigBlind) throw new Error('Bet must be at least one big blind');
        const delta = total - seat.bet;
        if (delta > seat.stack) throw new Error('Not enough chips to bet');
        seat.stack -= delta;
        seat.bet += delta;
        seat.totalBet += delta;
        this.currentBet = total;
        this.minRaise = total;
        this.lastAggressorSeat = seatIndex;
        if (seat.stack === 0n) seat.state = 'all_in';
        // Reset other live players' "acted" flag (they need to respond)
        this.markOthersToAct(seatIndex);
        seat.hasActedThisStreet = true;
        break;
      }
      case 'raise': {
        if (this.currentBet === 0n) throw new Error('Nothing to raise; use bet');
        const total = action.amount ?? 0n;
        const minTotal = this.currentBet + this.minRaise;
        const delta = total - seat.bet;
        if (delta > seat.stack) throw new Error('Not enough chips to raise');
        const isAllIn = delta === seat.stack;
        if (!isAllIn && total < minTotal) {
          throw new Error(`Raise must be at least to ${minTotal.toString()}`);
        }
        seat.stack -= delta;
        seat.bet += delta;
        seat.totalBet += delta;
        const raiseSize = total - this.currentBet;
        // Only update minRaise if this raise is full-sized (not a short all-in).
        if (raiseSize >= this.minRaise) this.minRaise = raiseSize;
        this.currentBet = total;
        this.lastAggressorSeat = seatIndex;
        if (seat.stack === 0n) seat.state = 'all_in';
        this.markOthersToAct(seatIndex);
        seat.hasActedThisStreet = true;
        break;
      }
      case 'all_in': {
        const delta = seat.stack;
        const total = seat.bet + delta;
        seat.stack = 0n;
        seat.bet = total;
        seat.totalBet += delta;
        seat.state = 'all_in';
        seat.hasActedThisStreet = true;
        if (total > this.currentBet) {
          const raiseSize = total - this.currentBet;
          if (raiseSize >= this.minRaise) {
            this.minRaise = raiseSize;
            this.lastAggressorSeat = seatIndex;
            this.markOthersToAct(seatIndex);
          } else {
            this.lastAggressorSeat = seatIndex;
          }
          this.currentBet = total;
        }
        break;
      }
    }

    this.push({
      kind: 'action_taken',
      seat: seatIndex,
      action,
      afterStack: seat.stack,
      potAfter: this.totalPot(),
    });

    // If only one player left, award pot.
    if (this.liveCount === 1) {
      this.endHandUncontested();
      return this.events;
    }

    // Advance to next actor or next street.
    this.advanceTurn();
    return this.events;
  }

  private markOthersToAct(exceptSeat: number): void {
    for (const s of this.seats) {
      if (
        s.inHand &&
        s.state !== 'folded' &&
        s.state !== 'all_in' &&
        s.index !== exceptSeat
      ) {
        s.hasActedThisStreet = false;
      }
    }
  }

  private advanceTurn(): void {
    // Find next seat that still needs to act.
    let next = this.nextLive(this.toActSeat);
    let safety = 0;
    while (safety++ < 20) {
      const s = this.seatAt(next);
      if (
        s.inHand &&
        s.state !== 'folded' &&
        s.state !== 'all_in' &&
        (!s.hasActedThisStreet || s.bet < this.currentBet)
      ) {
        this.toActSeat = next;
        this.push({
          kind: 'turn_started',
          seat: next,
          toCall: this.toCallFor(next),
          minRaise: this.minRaise,
        });
        return;
      }
      next = this.nextLive(next);
      if (next === this.toActSeat) break;
    }
    // Street ended.
    this.advanceStreet();
  }

  private advanceStreet(): void {
    // Collect bets (they are already in seat.totalBet).
    for (const s of this.seats) s.bet = 0n;
    this.currentBet = 0n;
    this.minRaise = this.config.bigBlind;
    for (const s of this.seats) {
      if (s.inHand && s.state !== 'folded' && s.state !== 'all_in') {
        s.hasActedThisStreet = false;
      }
    }

    switch (this.street) {
      case 'preflop':
        this.dealCommunity(3);
        this.street = 'flop';
        break;
      case 'flop':
        this.dealCommunity(1);
        this.street = 'turn';
        break;
      case 'turn':
        this.dealCommunity(1);
        this.street = 'river';
        break;
      case 'river':
        this.street = 'showdown';
        this.runShowdown();
        return;
      default:
        return;
    }

    this.push({ kind: 'street_advanced', street: this.street, community: [...this.community] });

    // If all remaining are all-in, fast-forward streets to showdown.
    const canActPlayers = this.seats.filter(
      (s) => s.inHand && s.state !== 'folded' && s.state !== 'all_in',
    );
    if (canActPlayers.length <= 1) {
      this.advanceStreet();
      return;
    }

    // Postflop action starts left of button.
    let next = this.nextLive(this.buttonSeat);
    let safety = 0;
    while (
      safety++ < 20 &&
      (this.seatAt(next).state === 'folded' || this.seatAt(next).state === 'all_in')
    ) {
      next = this.nextLive(next);
    }
    this.toActSeat = next;
    this.push({
      kind: 'turn_started',
      seat: next,
      toCall: 0n,
      minRaise: this.minRaise,
    });
  }

  private dealCommunity(n: number): void {
    // Burn one card.
    this.deck.pop();
    for (let i = 0; i < n; i++) this.community.push(this.deck.pop()!);
  }

  private endHandUncontested(): void {
    const winner = this.seats.find((s) => s.inHand && s.state !== 'folded')!;
    const pot = this.totalPot();
    const rake = this.calcRake(pot, /*uncontested*/ false);
    const award = pot - rake;
    winner.stack += award;
    if (rake > 0n) this.push({ kind: 'rake_taken', amount: rake });
    this.push({
      kind: 'pot_won',
      awards: [{ seat: winner.index, amount: award, potIndex: 0 }],
    });
    this.finishHand();
  }

  private runShowdown(): void {
    // Reveal all live hands (those that did not fold).
    const reveals: { seat: number; hole: Card[]; eval: HandEval }[] = [];
    for (const s of this.seats) {
      if (s.inHand && s.state !== 'folded') {
        const ev = evaluateBest([...s.hole, ...this.community]);
        reveals.push({ seat: s.index, hole: [...s.hole], eval: ev });
      }
    }
    this.push({ kind: 'showdown', reveals });

    // Build pots.
    const contribs: PotContribution[] = this.seats.map((s) => ({
      seat: s.index,
      contributed: s.totalBet,
      eligible: s.inHand && s.state !== 'folded',
    }));
    const pots = buildPots(contribs);

    // Apply rake to first (main) pot only.
    const mainPot = pots[0];
    let totalRake = 0n;
    if (mainPot && mainPot.amount > 0n) {
      const rake = this.calcRake(mainPot.amount, true);
      mainPot.amount -= rake;
      totalRake = rake;
    }
    if (totalRake > 0n) this.push({ kind: 'rake_taken', amount: totalRake });

    const awards: { seat: number; amount: bigint; potIndex: number }[] = [];
    pots.forEach((pot, idx) => {
      const eligibleEvals = reveals.filter((r) => pot.eligibleSeats.includes(r.seat));
      if (eligibleEvals.length === 0) return;
      let best: HandEval | null = null;
      for (const r of eligibleEvals) {
        if (!best || compareScores(r.eval.score, best.score) > 0) best = r.eval;
      }
      const winners = eligibleEvals.filter(
        (r) => compareScores(r.eval.score, best!.score) === 0,
      );
      const share = pot.amount / BigInt(winners.length);
      const remainder = pot.amount - share * BigInt(winners.length);
      winners.forEach((w, i) => {
        let extra = 0n;
        if (i < Number(remainder)) extra = 1n;
        const amt = share + extra;
        this.seatAt(w.seat).stack += amt;
        awards.push({ seat: w.seat, amount: amt, potIndex: idx });
      });
    });
    this.push({ kind: 'pot_won', awards });
    this.finishHand();
  }

  private finishHand(): void {
    this.push({ kind: 'hand_ended', seed: this.seed ?? '' });
    this.street = 'idle';
    this.toActSeat = -1;
    for (const s of this.seats) {
      s.hole = [];
      s.bet = 0n;
      s.totalBet = 0n;
      s.inHand = false;
      s.hasActedThisStreet = false;
      if (s.state !== 'empty') {
        s.state = s.stack > 0n ? 'waiting' : 'sitting_out';
      }
    }
  }

  // ---------------- Helpers ----------------

  /** Total chips currently in the pot (committed across all streets). */
  totalPot(): bigint {
    return this.seats.reduce((acc, s) => acc + s.totalBet, 0n);
  }

  toCallFor(seatIndex: number): bigint {
    const s = this.seatAt(seatIndex);
    const c = this.currentBet - s.bet;
    return c < 0n ? 0n : c;
  }

  bigBlindSeat(): number {
    if (this.liveCount === 2) return this.nextLive(this.buttonSeat);
    return this.nextLive(this.nextLive(this.buttonSeat));
  }

  smallBlindSeat(): number {
    if (this.liveCount === 2) return this.buttonSeat;
    return this.nextLive(this.buttonSeat);
  }

  private nextEligibleSeat(from: number): number {
    const n = this.seats.length;
    for (let off = 1; off <= n; off++) {
      const idx = (from + off + n) % n;
      const s = this.seats[idx]!;
      if (s.userId && s.state !== 'sitting_out' && s.stack > 0n) return idx;
    }
    throw new Error('No eligible seats');
  }

  private nextLive(from: number): number {
    const n = this.seats.length;
    for (let off = 1; off <= n; off++) {
      const idx = (from + off + n) % n;
      const s = this.seats[idx]!;
      if (s.inHand) return idx;
    }
    throw new Error('No live seat');
  }

  /**
   * Calculate rake:
   *   rakePercent% of pot, capped at rakeCapBb * BB.
   * No rake on uncontested wins (hand ends preflop with one player left)
   * unless the pot exceeded N BB — controlled by `apply`.
   */
  private calcRake(pot: bigint, postflopShowdown: boolean): bigint {
    if (pot < this.config.bigBlind * 2n) return 0n; // no rake on tiny pots
    if (!postflopShowdown && this.community.length === 0) return 0n; // no flop, no drop
    const pct = BigInt(Math.round(this.config.rakePercent * 100));
    const raw = (pot * pct) / 10000n;
    const cap = this.config.bigBlind * BigInt(this.config.rakeCapBb);
    return raw > cap ? cap : raw;
  }

  push(e: EngineEvent): void {
    this.events.push(e);
  }

  // ---------------- Snapshots / debug ----------------

  /** Public snapshot, with hole cards hidden by default. */
  snapshot(forUserId?: string): {
    street: Street;
    pot: string;
    community: string[];
    currentSeat: number;
    minRaise: string;
    seats: Array<{
      index: number;
      userId: string | null;
      stack: string;
      bet: string;
      totalBet: string;
      state: SeatState;
      hasCards: boolean;
      hole?: string[];
    }>;
  } {
    return {
      street: this.street,
      pot: this.totalPot().toString(),
      community: this.community.map(cardCode),
      currentSeat: this.toActSeat,
      minRaise: this.minRaise.toString(),
      seats: this.seats.map((s) => {
        const reveal = forUserId && s.userId === forUserId ? s.hole.map(cardCode) : undefined;
        const out: ReturnType<TableEngine['snapshot']>['seats'][number] = {
          index: s.index,
          userId: s.userId,
          stack: s.stack.toString(),
          bet: s.bet.toString(),
          totalBet: s.totalBet.toString(),
          state: s.state,
          hasCards: s.hole.length > 0,
        };
        if (reveal) out.hole = reveal;
        return out;
      }),
    };
  }

  /** Build side pots for current state. */
  pots(): Pot[] {
    return buildPots(
      this.seats.map((s) => ({
        seat: s.index,
        contributed: s.totalBet,
        eligible: s.inHand && s.state !== 'folded',
      })),
    );
  }
}
