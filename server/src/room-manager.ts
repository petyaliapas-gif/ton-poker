import { CASH_TABLES, findTable } from './lobby.js';
import { Room } from './room.js';
import type { AppConfig } from './config.js';

/** Singleton manager for all in-memory cash-table rooms. */
export class RoomManager {
  private rooms = new Map<string, Room>();

  constructor(private cfg: AppConfig) {
    for (const t of CASH_TABLES) {
      this.rooms.set(t.id, new Room(t, cfg.RAKE_PERCENT, cfg.RAKE_CAP_BB));
    }
  }

  get(tableId: string): Room | undefined {
    return this.rooms.get(tableId);
  }

  list(): Room[] {
    return [...this.rooms.values()];
  }

  ensureExists(tableId: string): Room {
    const cfg = findTable(tableId);
    if (!cfg) throw new Error(`Unknown table: ${tableId}`);
    let room = this.rooms.get(tableId);
    if (!room) {
      room = new Room(cfg, this.cfg.RAKE_PERCENT, this.cfg.RAKE_CAP_BB);
      this.rooms.set(tableId, room);
    }
    return room;
  }
}
