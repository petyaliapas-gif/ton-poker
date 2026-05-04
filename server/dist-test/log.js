import pino from 'pino';
const pretty = process.env.NODE_ENV !== 'production'
    ? {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss.l' },
    }
    : undefined;
export const log = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    ...(pretty ? { transport: pretty } : {}),
});
//# sourceMappingURL=log.js.map