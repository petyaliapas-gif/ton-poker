import type { FastifyInstance } from 'fastify';
import { CASH_TABLES, publicTableInfo, findTable } from '../lobby.js';
import type { RoomManager } from '../room-manager.js';

export function registerLobbyRoutes(app: FastifyInstance, mgr: RoomManager): void {
  app.get('/api/lobby/cash', async () => {
    return CASH_TABLES.map((t) => {
      const room = mgr.get(t.id);
      const stats = room?.publicStats() ?? {
        seated: 0,
        waiting: 0,
        avgPot: 0n,
        handsPerHour: 0,
      };
      return publicTableInfo(t, stats);
    });
  });

  app.get<{ Params: { id: string } }>('/api/lobby/cash/:id', async (req, reply) => {
    const cfg = findTable(req.params.id);
    if (!cfg) return reply.code(404).send({ error: 'table not found' });
    const room = mgr.get(cfg.id);
    const stats = room?.publicStats() ?? {
      seated: 0,
      waiting: 0,
      avgPot: 0n,
      handsPerHour: 0,
    };
    return publicTableInfo(cfg, stats);
  });
}
