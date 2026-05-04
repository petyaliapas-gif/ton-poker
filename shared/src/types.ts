/**
 * Shared protocol types between client and server.
 * Money is always represented in nanoTON (1 TON = 1_000_000_000 nanoTON)
 * and serialized as a stringified bigint to avoid JS Number precision loss.
 */

export type NanoTon = string; // bigint serialized as decimal string

export interface UserPublic {
  id: string;
  telegramId: number;
  username: string | null;
  firstName: string;
  avatarUrl: string | null;
  vipUntil: number | null; // unix ms
}

export interface BalanceInfo {
  ton: NanoTon; // available balance
  locked: NanoTon; // sitting at tables / in tournaments
}

export interface CashTableInfo {
  id: string;
  name: string;
  stake: StakeLevel;
  smallBlind: NanoTon;
  bigBlind: NanoTon;
  minBuyIn: NanoTon;
  maxBuyIn: NanoTon;
  maxSeats: 2 | 6 | 9;
  seated: number;
  waiting: number;
  avgPot: NanoTon;
  handsPerHour: number;
}

export type StakeLevel = 'micro' | 'low' | 'mid' | 'high' | 'highroller';

export interface TableSnapshot {
  tableId: string;
  handId: string | null;
  street: Street;
  pot: NanoTon;
  sidePots: SidePot[];
  community: CardCode[];
  currentSeat: number | null;
  minRaise: NanoTon;
  toCall: NanoTon;
  seats: SeatPublic[];
  /** Hole cards visible only to the recipient; server fills only their own seat. */
  myHole?: CardCode[];
}

export interface SidePot {
  amount: NanoTon;
  eligibleSeats: number[];
}

export interface SeatPublic {
  seatIndex: number;
  user: UserPublic | null;
  stack: NanoTon;
  bet: NanoTon; // current street bet
  totalBet: NanoTon; // total bet this hand (for side pots)
  state: SeatState;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  hasCards: boolean;
  /** Reveal at showdown only. */
  revealedHole?: CardCode[];
  timeBank: number; // ms remaining
}

// SeatState and Street are re-exported from the poker engine via index.ts.
import type { SeatState as _SeatState, Street as _Street } from './poker/engine.js';
export type SeatState = _SeatState;
export type Street = _Street;

export type CardCode = string; // 2-char code, e.g. "Ah", "Td", "2c"

/** Action types a player can take on their turn. */
export type ActionKind = 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all_in';

export interface PlayerAction {
  kind: ActionKind;
  /** For bet/raise: total bet size for the street, in nanoTON. */
  amount?: NanoTon;
}

/** WS messages: client -> server */
export type ClientMsg =
  | { t: 'hello'; initData: string; tableId: string; seatIndex?: number; buyIn?: NanoTon }
  | { t: 'sit'; seatIndex: number; buyIn: NanoTon }
  | { t: 'leave' }
  | { t: 'action'; action: PlayerAction }
  | { t: 'sit_out' }
  | { t: 'sit_in' }
  | { t: 'chat'; text: string };

/** WS messages: server -> client */
export type ServerMsg =
  | { t: 'snapshot'; snapshot: TableSnapshot }
  | { t: 'event'; event: TableEvent }
  | { t: 'error'; code: string; message: string }
  | { t: 'chat'; userId: string; firstName: string; text: string; ts: number };

export type TableEvent =
  | { kind: 'hand_started'; handId: string; dealerSeat: number }
  | { kind: 'cards_dealt'; seats: number[] }
  | { kind: 'flop'; cards: [CardCode, CardCode, CardCode] }
  | { kind: 'turn'; card: CardCode }
  | { kind: 'river'; card: CardCode }
  | { kind: 'action_taken'; seat: number; action: PlayerAction; afterStack: NanoTon }
  | { kind: 'pot_update'; pot: NanoTon }
  | { kind: 'showdown'; reveals: { seat: number; hole: CardCode[]; rank: string }[] }
  | { kind: 'pot_won'; winners: { seat: number; amount: NanoTon; reason: string }[] }
  | { kind: 'rake_taken'; amount: NanoTon }
  | { kind: 'hand_ended' }
  | { kind: 'player_joined'; seat: number; user: UserPublic; stack: NanoTon }
  | { kind: 'player_left'; seat: number }
  | { kind: 'turn_started'; seat: number; deadlineTs: number; toCall: NanoTon; minRaise: NanoTon };
