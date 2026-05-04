import { verifyInitData } from './auth/telegram.js';
import { loadConfig } from './config.js';
import { getPrisma } from './db.js';
import { lockBalance } from './services/balance.js';
import { toPublic } from './services/users.js';
import { log } from './log.js';
/**
 * WebSocket protocol: client connects to /ws?tableId=<id>&initData=<...>
 * After auth, server sends snapshot. Client sends ClientMsg messages.
 */
export function registerWebSocket(app, mgr) {
    const cfg = loadConfig();
    const db = getPrisma();
    app.get('/ws', { websocket: true }, async (socket, req) => {
        const url = new URL(req.url, 'http://localhost');
        const tableId = url.searchParams.get('tableId');
        const initData = url.searchParams.get('initData');
        if (!tableId || !initData) {
            socket.send(JSON.stringify({ t: 'error', code: 'BAD_REQUEST', message: 'missing params' }));
            socket.close();
            return;
        }
        let auth;
        try {
            auth = verifyInitData(initData, cfg.TELEGRAM_BOT_TOKEN);
        }
        catch (err) {
            socket.send(JSON.stringify({ t: 'error', code: 'AUTH', message: String(err) }));
            socket.close();
            return;
        }
        if (!auth.user) {
            socket.send(JSON.stringify({ t: 'error', code: 'NO_USER', message: 'no user' }));
            socket.close();
            return;
        }
        const user = await db.user.findUnique({ where: { telegramId: BigInt(auth.user.id) } });
        if (!user) {
            socket.send(JSON.stringify({ t: 'error', code: 'NO_ACCOUNT', message: 'auth first' }));
            socket.close();
            return;
        }
        const room = mgr.get(tableId);
        if (!room) {
            socket.send(JSON.stringify({ t: 'error', code: 'NO_TABLE', message: 'unknown table' }));
            socket.close();
            return;
        }
        const send = (m) => {
            try {
                socket.send(JSON.stringify(m, bigintReplacer));
            }
            catch (err) {
                log.warn({ err: String(err) }, 'ws send failed');
            }
        };
        const userPublic = toPublic(user);
        room.attach({
            userId: user.id,
            user: userPublic,
            send,
            seatIndex: room.engine.seats.findIndex((s) => s.userId === user.id) ?? -1,
        });
        socket.on('message', async (raw) => {
            let msg;
            try {
                msg = JSON.parse(raw.toString());
            }
            catch {
                send({ t: 'error', code: 'BAD_JSON', message: 'invalid JSON' });
                return;
            }
            try {
                await handle(msg);
            }
            catch (err) {
                send({ t: 'error', code: 'ACTION_FAILED', message: String(err) });
            }
        });
        socket.on('close', () => {
            room.detach(user.id);
        });
        async function handle(msg) {
            switch (msg.t) {
                case 'hello':
                    // already handled at connect
                    break;
                case 'sit': {
                    const buyIn = BigInt(msg.buyIn);
                    if (buyIn <= 0n)
                        throw new Error('bad buyIn');
                    await lockBalance(db, user.id, buyIn);
                    try {
                        room.sit(user.id, msg.seatIndex, buyIn);
                    }
                    catch (err) {
                        // Refund lock
                        await lockBalance(db, user.id, -buyIn);
                        throw err;
                    }
                    await db.transaction.create({
                        data: {
                            userId: user.id,
                            kind: 'TABLE_BUY_IN',
                            amountTon: -buyIn,
                            status: 'CONFIRMED',
                            meta: { tableId: room.id, seat: msg.seatIndex },
                        },
                    });
                    break;
                }
                case 'leave': {
                    const refund = room.standUp(user.id);
                    if (refund > 0n) {
                        await lockBalance(db, user.id, -refund);
                        await db.transaction.create({
                            data: {
                                userId: user.id,
                                kind: 'TABLE_CASH_OUT',
                                amountTon: refund,
                                status: 'CONFIRMED',
                                meta: { tableId: room.id },
                            },
                        });
                    }
                    break;
                }
                case 'action':
                    room.act(user.id, {
                        kind: msg.action.kind,
                        ...(msg.action.amount ? { amount: msg.action.amount } : {}),
                    });
                    break;
                case 'sit_out': {
                    const seatIdx = room.engine.seats.findIndex((s) => s.userId === user.id);
                    if (seatIdx >= 0) {
                        const s = room.engine.seatAt(seatIdx);
                        if (s.state !== 'empty')
                            s.state = 'sitting_out';
                    }
                    break;
                }
                case 'sit_in': {
                    const seatIdx = room.engine.seats.findIndex((s) => s.userId === user.id);
                    if (seatIdx >= 0) {
                        const s = room.engine.seatAt(seatIdx);
                        if (s.state === 'sitting_out')
                            s.state = 'waiting';
                    }
                    break;
                }
                case 'chat':
                    // Broadcast moderated chat (basic length limit; full moderation is TODO).
                    if (typeof msg.text === 'string' && msg.text.length > 0 && msg.text.length <= 200) {
                        for (const m of room.members.values()) {
                            m.send({
                                t: 'chat',
                                userId: user.id,
                                firstName: user.firstName,
                                text: msg.text,
                                ts: Date.now(),
                            });
                        }
                    }
                    break;
            }
        }
    });
}
/** JSON.stringify replacer that converts bigints to strings. */
function bigintReplacer(_k, v) {
    return typeof v === 'bigint' ? v.toString() : v;
}
//# sourceMappingURL=ws.js.map