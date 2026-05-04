import { TableEngine, type EngineEvent, cardCode } from '@ton-poker/shared';
import type { CashTableConfig } from './lobby.js';
import { log } from './log.js';
import type {
  ServerMsg,
  TableSnapshot,
  SeatPublic,
  CardCode,
  UserPublic,
} from '@ton-poker/shared';

/** A connected player at a room (may or may not be sitting). */
export interface RoomMember {
  userId: string;
  user: UserPublic;
  send: (msg: ServerMsg) => void;
  /** -1 if observing only. */
  seatIndex: number;
}

/** Default action timer (ms). */
const TURN_MS = 25_000;

/**
 * Room is one cash-table runtime instance. It owns a TableEngine and
 * the WS connections of seated players + observers.
 */
export class Room {
  readonly id: string;
  readonly engine: TableEngine;
  members = new Map<string, RoomMember>(); // userId -> member
  private turnTimer: NodeJS.Timeout | null = null;
  private turnDeadline = 0;
  private handCounter = 0;
  private avgPot = 0n;
  private potSamples = 0;
  private handsLastHour = 0;
  private readonly cfg: CashTableConfig;

  constructor(cfg: CashTableConfig, rakePercent: number, rakeCapBb: number) {
    this.id = cfg.id;
    this.cfg = cfg;
    this.engine = new TableEngine({
      maxSeats: cfg.maxSeats,
      smallBlind: cfg.smallBlind,
      bigBlind: cfg.bigBlind,
      rakePercent,
      rakeCapBb,
    });
  }

  // ---------------- Membership ----------------

  /** Register or update a member's WS handle. */
  attach(member: RoomMember): void {
    const existing = this.members.get(member.userId);
    if (existing) existing.send = member.send;
    else this.members.set(member.userId, member);
    this.broadcastSnapshot();
  }

  detach(userId: string): void {
    const m = this.members.get(userId);
    if (!m) return;
    if (m.seatIndex >= 0) {
      // Mark as sitting out; actual leave/refund handled by server tx layer.
      const seat = this.engine.seatAt(m.seatIndex);
      if (seat.userId === userId) seat.state = 'sitting_out';
    }
    this.members.delete(userId);
    this.broadcastSnapshot();
  }

  /** Sit a member at a seat with given buy-in (already debited at the API layer). */
  sit(userId: string, seatIndex: number, buyIn: bigint): void {
    const m = this.members.get(userId);
    if (!m) throw new Error('Member not in room');
    this.engine.sit(seatIndex, userId, buyIn);
    m.seatIndex = seatIndex;
    this.broadcastSnapshot();
    this.maybeStartHand();
  }

  /** Stand up; returns the chip stack to refund. */
  standUp(userId: string): bigint {
    const m = this.members.get(userId);
    if (!m || m.seatIndex < 0) return 0n;
    const refund = this.engine.leave(m.seatIndex);
    m.seatIndex = -1;
    this.broadcastSnapshot();
    return refund;
  }

  // ---------------- Hand flow ----------------

  private canStartHand(): boolean {
    if (this.engine.street !== 'idle') return false;
    const ready = this.engine.seats.filter(
      (s) => s.userId && s.state !== 'sitting_out' && s.stack > 0n,
    ).length;
    return ready >= 2;
  }

  private maybeStartHand(): void {
    if (!this.canStartHand()) return;
    setTimeout(() => this.startHand(), 800); // small delay between hands
  }

  private startHand(): void {
    if (!this.canStartHand()) return;
    this.handCounter++;
    const handId = `${this.id}-${Date.now()}-${this.handCounter}`;
    const events = this.engine.startHand(handId);
    this.flushEvents(events);
    this.armTurnTimer();
  }

  /** Apply an action from a seated user. */
  act(userId: string, action: { kind: string; amount?: string }): void {
    const m = this.members.get(userId);
    if (!m || m.seatIndex < 0) throw new Error('Not seated');
    const seat = m.seatIndex;
    const events = this.engine.act(seat, {
      kind: action.kind as 'fold',
      amount: action.amount ? BigInt(action.amount) : undefined,
    });
    this.flushEvents(events);

    if (this.engine.street === 'idle') {
      this.clearTurnTimer();
      this.maybeStartHand();
    } else {
      this.armTurnTimer();
    }
  }

  // ---------------- Timers ----------------

  private armTurnTimer(): void {
    this.clearTurnTimer();
    if (this.engine.toActSeat < 0) return;
    this.turnDeadline = Date.now() + TURN_MS;
    this.turnTimer = setTimeout(() => this.timeoutCurrent(), TURN_MS);
  }

  private clearTurnTimer(): void {
    if (this.turnTimer) clearTimeout(this.turnTimer);
    this.turnTimer = null;
  }

  private timeoutCurrent(): void {
    const seat = this.engine.toActSeat;
    if (seat < 0) return;
    try {
      const toCall = this.engine.toCallFor(seat);
      const events = this.engine.act(seat, { kind: toCall === 0n ? 'check' : 'fold' });
      this.flushEvents(events);
      if (this.engine.street === 'idle') {
        this.clearTurnTimer();
        this.maybeStartHand();
      } else {
        this.armTurnTimer();
      }
    } catch (e) {
      log.warn({ err: String(e), seat }, 'timeoutCurrent: act failed');
    }
  }

  // ---------------- Broadcast ----------------

  private flushEvents(events: EngineEvent[]): void {
    for (const ev of events) {
      this.broadcastEvent(ev);
    }
    this.broadcastSnapshot();
  }

  private broadcastEvent(ev: EngineEvent): void {
    // Translate internal engine event → wire event.
    let wireEvent: import('@ton-poker/shared').TableEvent | null = null;
    switch (ev.kind) {
      case 'hand_started':
        wireEvent = { kind: 'hand_started', handId: ev.handId, dealerSeat: ev.dealerSeat };
        break;
      case 'cards_dealt':
        wireEvent = { kind: 'cards_dealt', seats: ev.seats };
        break;
      case 'street_advanced': {
        const cards = ev.community.map(cardCode) as CardCode[];
        if (ev.street === 'flop' && cards.length >= 3) {
          wireEvent = { kind: 'flop', cards: [cards[0]!, cards[1]!, cards[2]!] };
        } else if (ev.street === 'turn' && cards.length >= 4) {
          wireEvent = { kind: 'turn', card: cards[3]! };
        } else if (ev.street === 'river' && cards.length >= 5) {
          wireEvent = { kind: 'river', card: cards[4]! };
        }
        break;
      }
      case 'action_taken':
        wireEvent = {
          kind: 'action_taken',
          seat: ev.seat,
          action: {
            kind: ev.action.kind,
            ...(ev.action.amount !== undefined ? { amount: ev.action.amount.toString() } : {}),
          },
          afterStack: ev.afterStack.toString(),
        };
        break;
      case 'turn_started':
        wireEvent = {
          kind: 'turn_started',
          seat: ev.seat,
          deadlineTs: this.turnDeadline,
          toCall: ev.toCall.toString(),
          minRaise: ev.minRaise.toString(),
        };
        break;
      case 'showdown':
        wireEvent = {
          kind: 'showdown',
          reveals: ev.reveals.map((r) => ({
            seat: r.seat,
            hole: r.hole.map(cardCode),
            rank: r.eval.name,
          })),
        };
        break;
      case 'pot_won': {
        const totalAwarded = ev.awards.reduce((acc, a) => acc + a.amount, 0n);
        if (totalAwarded > 0n) {
          this.avgPot =
            this.potSamples === 0
              ? totalAwarded
              : (this.avgPot * BigInt(this.potSamples) + totalAwarded) / BigInt(this.potSamples + 1);
          this.potSamples++;
          this.handsLastHour++;
        }
        wireEvent = {
          kind: 'pot_won',
          winners: ev.awards.map((a) => ({
            seat: a.seat,
            amount: a.amount.toString(),
            reason: a.potIndex === 0 ? 'main pot' : `side pot ${a.potIndex}`,
          })),
        };
        break;
      }
      case 'rake_taken':
        wireEvent = { kind: 'rake_taken', amount: ev.amount.toString() };
        break;
      case 'hand_ended':
        wireEvent = { kind: 'hand_ended' };
        break;
      case 'blinds_posted':
        // No direct wire event; covered by snapshot updates.
        break;
    }
    if (wireEvent) {
      const msg: ServerMsg = { t: 'event', event: wireEvent };
      for (const m of this.members.values()) m.send(msg);
    }
  }

  private broadcastSnapshot(): void {
    for (const m of this.members.values()) {
      m.send({ t: 'snapshot', snapshot: this.snapshotFor(m.userId) });
    }
  }

  snapshotFor(userId: string): TableSnapshot {
    const e = this.engine;
    const seats: SeatPublic[] = e.seats.map((s) => {
      const member =
        s.userId !== null
          ? [...this.members.values()].find((m) => m.userId === s.userId)
          : undefined;
      const out: SeatPublic = {
        seatIndex: s.index,
        user: member ? member.user : null,
        stack: s.stack.toString(),
        bet: s.bet.toString(),
        totalBet: s.totalBet.toString(),
        state: s.state,
        isDealer: s.index === e.buttonSeat,
        isSmallBlind: false,
        isBigBlind: false,
        hasCards: s.hole.length > 0,
        timeBank: 0,
      };
      return out;
    });

    const myHole = (() => {
      const seat = this.engine.seats.find((s) => s.userId === userId);
      if (!seat) return undefined;
      return seat.hole.map(cardCode);
    })();

    const pots = e.pots();
    return {
      tableId: this.id,
      handId: e.handId,
      street: e.street,
      pot: e.totalPot().toString(),
      sidePots: pots.map((p) => ({
        amount: p.amount.toString(),
        eligibleSeats: p.eligibleSeats,
      })),
      community: e.community.map(cardCode),
      currentSeat: e.toActSeat >= 0 ? e.toActSeat : null,
      minRaise: e.minRaise.toString(),
      toCall: e.toActSeat >= 0 ? e.toCallFor(e.toActSeat).toString() : '0',
      seats,
      ...(myHole && myHole.length > 0 ? { myHole } : {}),
    };
  }

  publicStats(): { seated: number; waiting: number; avgPot: bigint; handsPerHour: number } {
    const seated = this.engine.seats.filter((s) => s.state !== 'empty').length;
    const waiting = this.members.size - seated;
    return {
      seated,
      waiting,
      avgPot: this.avgPot,
      handsPerHour: this.handsLastHour,
    };
  }
}
