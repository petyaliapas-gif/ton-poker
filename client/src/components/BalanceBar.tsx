import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { fmtTon } from '../lib/api';

export default function BalanceBar() {
  const { user, balanceTon, lockedTon } = useAuth();
  if (!user) return null;
  return (
    <div className="sticky top-0 z-40 safe-top px-4 pb-3 bg-gradient-to-b from-bg via-bg to-transparent backdrop-blur">
      <div className="card-surface flex items-center justify-between p-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-elevated grid place-items-center overflow-hidden border border-line">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.firstName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold">{user.firstName[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate">{user.firstName}</div>
            <div className="text-[11px] text-muted">
              на столах: <span className="text-gold">{fmtTon(lockedTon, 2)}</span> TON
            </div>
          </div>
        </div>
        <Link to="/cashier" className="btn-gold">
          <span className="text-base">💎</span>
          <span>{fmtTon(balanceTon, 2)} TON</span>
        </Link>
      </div>
    </div>
  );
}
