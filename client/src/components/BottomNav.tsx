import { NavLink } from 'react-router-dom';
import clsx from '../lib/clsx';

const ITEMS = [
  { to: '/', label: 'Лобби', icon: '🎲' },
  { to: '/tournaments', label: 'Турниры', icon: '🏆' },
  { to: '/cashier', label: 'Касса', icon: '💎' },
  { to: '/shop', label: 'Магазин', icon: '✨' },
  { to: '/profile', label: 'Профиль', icon: '👤' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-line bg-bg/80 backdrop-blur safe-bottom">
      <div className="mx-auto max-w-md grid grid-cols-5">
        {ITEMS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => clsx('nav-tab', isActive && 'active')}
          >
            <span className="text-lg">{it.icon}</span>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
