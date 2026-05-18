import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAMES, getFeaturedOffers, formatPrice, OFFERS } from '../data/mock';

const stats = [
  { label: 'Товаров', value: '120K+', icon: '📦' },
  { label: 'Продавцов', value: '15K+', icon: '👥' },
  { label: 'Сделок', value: '2M+', icon: '✅' },
  { label: 'Игр', value: '50+', icon: '🎮' },
];

export default function Home() {
  const featured = getFeaturedOffers();

  return (
    <div className="min-h-full">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-green/5 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="badge-accent mb-4">Крупнейший маркетплейс игровых товаров</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-fg leading-tight">
              Покупай и продавай{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-green">
                игровые товары
              </span>
            </h1>
            <p className="text-lg text-muted mt-4 max-w-lg">
              Аккаунты, валюта, предметы, буст — всё для твоей любимой игры. Безопасные сделки с гарантией.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/category/cs2" className="btn-primary px-6 py-3 text-base">
                Начать покупки
              </Link>
              <button className="btn-outline px-6 py-3 text-base">
                Стать продавцом
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12"
          >
            {stats.map((s) => (
              <div key={s.label} className="card-surface p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-extrabold text-fg">{s.value}</div>
                <div className="text-xs text-muted mt-0.5">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Game Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-fg">Популярные игры</h2>
            <p className="text-sm text-muted mt-1">Выбери игру и найди нужный товар</p>
          </div>
          <Link to="/" className="text-sm text-accent hover:text-accent-light transition-colors font-medium">
            Все игры →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                to={`/category/${game.slug}`}
                className="group block card-surface overflow-hidden"
              >
                <div
                  className="h-24 sm:h-28 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${game.color}22, ${game.color}08)` }}
                >
                  <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{ background: `radial-gradient(circle at 70% 30%, ${game.color}40, transparent 70%)` }}
                  />
                  <div className="absolute bottom-2 right-2 text-3xl opacity-30 group-hover:opacity-50 transition-opacity">
                    🎮
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-semibold text-sm text-fg truncate group-hover:text-accent transition-colors">
                    {game.name}
                  </div>
                  <div className="text-[11px] text-muted mt-0.5">
                    {game.offersCount.toLocaleString('ru-RU')} предложений
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Offers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-fg">Лучшие предложения</h2>
            <p className="text-sm text-muted mt-1">Проверенные продавцы с высоким рейтингом</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/offer/${offer.id}`} className="block card-surface overflow-hidden group">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="badge-accent text-[10px]">{offer.gameName}</span>
                    {offer.isAutoDelivery && (
                      <span className="badge-green text-[10px]">⚡ Авто</span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-fg group-hover:text-accent transition-colors line-clamp-2 min-h-[2.5rem]">
                    {offer.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-3">
                    <img src={offer.seller.avatar} alt={offer.seller.username} className="w-6 h-6 rounded-full" />
                    <span className="text-xs text-muted truncate">{offer.seller.username}</span>
                    <span className="text-xs text-gold ml-auto">★ {offer.seller.rating}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
                    <div className="text-lg font-bold text-green">{formatPrice(offer.price)}</div>
                    <button className="btn-primary text-xs px-3 py-1.5">Купить</button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Offers Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold text-fg mb-6">Новые предложения</h2>
        <div className="space-y-2">
          {OFFERS.slice(0, 10).map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Link
                to={`/offer/${offer.id}`}
                className="card-surface flex items-center gap-4 p-4 group"
              >
                <img src={offer.seller.avatar} alt="" className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-fg group-hover:text-accent transition-colors truncate">
                    {offer.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted">{offer.seller.username}</span>
                    <span className="text-[10px] text-gold">★ {offer.seller.rating}</span>
                    <span className="text-[10px] text-muted">· {offer.gameName}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-green">{formatPrice(offer.price)}</div>
                  {offer.isAutoDelivery && (
                    <div className="text-[10px] text-green-light mt-0.5">⚡ Автовыдача</div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-bold text-fg text-center mb-10">Как это работает</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Выбери товар', desc: 'Найди нужный товар или услугу среди тысяч предложений от проверенных продавцов.', color: 'from-accent/20 to-accent/5' },
            { step: '02', title: 'Оплати безопасно', desc: 'Деньги хранятся на нашем счёте до подтверждения получения товара покупателем.', color: 'from-green/20 to-green/5' },
            { step: '03', title: 'Получи мгновенно', desc: 'Автоматическая выдача или передача через чат. Гарантия возврата при проблемах.', color: 'from-gold/20 to-gold/5' },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.15 }}
              className="card-surface p-6 relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color}`} />
              <div className="text-3xl font-extrabold text-line mb-3">{item.step}</div>
              <h3 className="font-bold text-lg text-fg">{item.title}</h3>
              <p className="text-sm text-muted mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
