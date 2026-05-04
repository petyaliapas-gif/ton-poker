import { CASH_TABLES, findTable } from './lobby.js';
import { Room } from './room.js';
/** Singleton manager for all in-memory cash-table rooms. */
export class RoomManager {
    cfg;
    rooms = new Map();
    constructor(cfg) {
        this.cfg = cfg;
        for (const t of CASH_TABLES) {
            this.rooms.set(t.id, new Room(t, cfg.RAKE_PERCENT, cfg.RAKE_CAP_BB));
        }
    }
    get(tableId) {
        return this.rooms.get(tableId);
    }
    list() {
        return [...this.rooms.values()];
    }
    ensureExists(tableId) {
        const cfg = findTable(tableId);
        if (!cfg)
            throw new Error(`Unknown table: ${tableId}`);
        let room = this.rooms.get(tableId);
        if (!room) {
            room = new Room(cfg, this.cfg.RAKE_PERCENT, this.cfg.RAKE_CAP_BB);
            this.rooms.set(tableId, room);
        }
        return room;
    }
}
//# sourceMappingURL=room-manager.js.map