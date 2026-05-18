import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-dark grid place-items-center">
                <span className="text-white font-bold text-sm">FP</span>
              </div>
              <div>
                <div className="font-bold text-fg text-lg leading-none">FunPay</div>
                <div className="text-[10px] text-muted leading-none mt-0.5">marketplace</div>
              </div>
            </Link>
            <p className="text-sm text-muted mt-4 max-w-xs">
              Безопасная площадка для покупки и продажи игровых товаров, аккаунтов и услуг.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-lg bg-elevated grid place-items-center text-muted hover:text-accent hover:bg-accent/10 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-elevated grid place-items-center text-muted hover:text-accent hover:bg-accent/10 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-elevated grid place-items-center text-muted hover:text-accent hover:bg-accent/10 transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.96 6.504-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h3 className="font-semibold text-fg text-sm mb-4">Каталог</h3>
            <ul className="space-y-2.5">
              {['CS2', 'Dota 2', 'Genshin Impact', 'Valorant', 'Fortnite', 'LoL'].map((g) => (
                <li key={g}>
                  <Link to={`/category/${g.toLowerCase().replace(/\s+/g, '')}`} className="text-sm text-muted hover:text-fg transition-colors">
                    {g}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-semibold text-fg text-sm mb-4">Информация</h3>
            <ul className="space-y-2.5">
              {['О нас', 'Как это работает', 'Правила', 'Гарантии', 'Контакты'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted hover:text-fg transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-fg text-sm mb-4">Поддержка</h3>
            <ul className="space-y-2.5">
              {['FAQ', 'Тикеты', 'Чат поддержки', 'Жалобы', 'Партнерская программа'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted hover:text-fg transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-line mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-muted">
            &copy; 2024 FunPay. Все права защищены. Не является азартной игрой.
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-xs text-muted hover:text-fg transition-colors">Пользовательское соглашение</a>
            <a href="#" className="text-xs text-muted hover:text-fg transition-colors">Политика конфиденциальности</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
