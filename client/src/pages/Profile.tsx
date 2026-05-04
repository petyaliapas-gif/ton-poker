import { useAuth } from '../store/auth';
import { fmtTon } from '../lib/api';
import BalanceBar from '../components/BalanceBar';

export default function Profile() {
  const { user, balanceTon, lockedTon } = useAuth();
  if (!user) return null;
  return (
    <div className="min-h-full pb-24">
      <BalanceBar />
      <div className="px-4 pt-2">
        <h1 className="text-2xl font-extrabold">Профиль</h1>

        <div className="card-surface p-4 mt-3 flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-elevated grid place-items-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-bold">{user.firstName[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-lg truncate">{user.firstName}</div>
            <div className="text-xs text-muted truncate">@{user.username ?? '—'} · #{user.telegramId}</div>
            <div className="mt-1 text-[11px] text-muted">
              {user.vipUntil ? '🌟 VIP до ' + new Date(user.vipUntil).toLocaleDateString() : 'Не VIP'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="card-surface p-3">
            <div className="text-[11px] text-muted">Баланс</div>
            <div className="text-lg font-bold text-gold">{fmtTon(balanceTon, 4)} TON</div>
          </div>
          <div className="card-surface p-3">
            <div className="text-[11px] text-muted">На столах</div>
            <div className="text-lg font-bold">{fmtTon(lockedTon, 4)} TON</div>
          </div>
        </div>

        <div className="card-surface p-4 mt-3">
          <div className="font-bold text-base">Реферальная программа</div>
          <p className="text-xs text-muted mt-1">
            Приведи друга — получай 25% от его рейка пожизненно.
          </p>
          <div className="mt-2 bg-elevated rounded-lg p-2 font-mono text-xs flex items-center justify-between">
            <span className="truncate">https://t.me/ton_poker_bot?start=ref_{user.telegramId}</span>
            <button
              className="btn-ghost text-[11px] py-1 px-2"
              onClick={() =>
                navigator.clipboard?.writeText(
                  `https://t.me/ton_poker_bot?start=ref_${user.telegramId}`,
                )
              }
            >
              Копировать
            </button>
          </div>
        </div>

        <div className="card-surface p-4 mt-3">
          <div className="font-bold text-base">Ответственная игра</div>
          <p className="text-xs text-muted mt-1">
            Если игра перестала приносить удовольствие — сделай паузу. Сервис позволяет временно
            заморозить аккаунт. Напиши в поддержку{' '}
            <a className="text-accent underline" href="https://t.me/ton_poker_support">
              @ton_poker_support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
