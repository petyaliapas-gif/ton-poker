import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Lobby from './pages/Lobby';
import TablePage from './pages/Table';
import Cashier from './pages/Cashier';
import Profile from './pages/Profile';
import Tournaments from './pages/Tournaments';
import Shop from './pages/Shop';
import BottomNav from './components/BottomNav';
import { useAuth } from './store/auth';

export default function App() {
  const { refresh, error, loading, user } = useAuth();

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading && !user) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-muted">Подключаюсь к Telegram…</div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen grid place-items-center px-6">
        <div className="card-surface p-5 text-center">
          <div className="text-2xl mb-2">🔒</div>
          <div className="font-bold">Не получается войти</div>
          <div className="text-xs text-muted mt-1">
            Открой приложение из Telegram (через бота). Прямой запуск в браузере не поддерживается.
          </div>
          <details className="mt-2 text-[11px] text-muted text-left">
            <summary>детали</summary>
            <pre className="overflow-x-auto bg-bg p-2 rounded mt-1">{error}</pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/table/:id" element={<TablePage />} />
        <Route path="/tournaments" element={<Tournaments />} />
        <Route path="/cashier" element={<Cashier />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <BottomNav />
    </div>
  );
}
