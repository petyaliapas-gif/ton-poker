# TON Poker

Telegram Mini App — мультиплеерный Texas Hold'em покер на TON. Депозит через
[CryptoBot](https://help.send.tg/) (TON), Telegram Stars — для косметики и
турнирных билетов (см. «Безопасный режим» ниже).

## Структура

```
ton-poker/
├── shared/        # @ton-poker/shared — движок покера + общие типы
├── server/        # @ton-poker/server — Fastify + WS + Prisma + grammY
├── client/        # @ton-poker/client — React + Vite Mini App
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Стек

- **Backend**: Node.js 20 + TypeScript + Fastify + `@fastify/websocket` + Prisma + PostgreSQL + Redis (планы) + grammY (Telegram Bot)
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Платежи**: Crypto Pay (CryptoBot) для TON, Telegram Stars (XTR) для косметики/билетов
- **Покер-движок**: чистый TS, провабли-фейр через SHA-256 commit-reveal, тесты на Node test runner

## Запуск локально

```bash
cp .env.example .env
# заполни TELEGRAM_BOT_TOKEN, CRYPTO_PAY_TOKEN, MINI_APP_URL

# 1. Поднять PG + Redis
docker compose up -d

# 2. Установить зависимости
npm install

# 3. Сгенерировать Prisma клиент и применить миграции
npm run prisma:migrate:dev --workspace=server

# 4. Собрать shared
npm run build --workspace=shared

# 5. Запустить backend и frontend параллельно
npm run dev
```

После этого:
- Backend: http://localhost:3000 (Fastify + WS на /ws)
- Frontend: http://localhost:5173 (Mini App)

Чтобы привязать к Telegram, в [@BotFather](https://t.me/BotFather) сделай:
```
/newapp → выбери своего бота → задай URL твоего фронтенда
```

## Тесты и проверки

```bash
npm test          # покер-движок + auth verifier
npm run typecheck # tsc на всех воркспейсах
```

## Безопасный режим (Profile A)

Условия Telegram Stars запрещают gambling. По умолчанию **Stars→TON конвертация
выключена** (см. `src/routes/stars.ts`: `ton_credit` возвращает 403). За Stars
можно купить только косметику и турнирные билеты. Cash-столы — только TON через
CryptoBot.

Если ты решил рискнуть: установи `ENABLE_STARS_TON_CREDIT=true` в `.env` сервера.
**Ответственность за блокировку бота — твоя**.

## Монетизация

- **Rake** — 5% от пота, cap 3 BB. Не берём с пота меньше 2 BB и при префлоп-фолдах.
- **Tournament fee** — 10% от buy-in (конфиг `TOURNAMENT_FEE_PERCENT`).
- **Stars-маржа** — 15% при покупке косметики/билетов в Stars (конфиг `STARS_MARGIN`).
- **VIP** — кешбек 30% рейка для подписчиков.
- **Реферальная программа** — 25% рейка с приведённого игрока.

Подробности — в [`docs/monetization.md`](docs/monetization.md) после разворачивания.

## Лицензия

Proprietary. Все права у @petyaliapas.
