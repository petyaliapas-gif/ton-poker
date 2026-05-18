import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { searchOffers, formatPrice } from '../data/mock';

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get('q') ?? '';

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return searchOffers(query);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link to="/" className="hover:text-fg transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-fg">Поиск</span>
      </div>

      <h1 className="text-2xl font-bold text-fg mb-1">
        Результаты поиска
      </h1>
      <p className="text-sm text-muted mb-6">
        По запросу &laquo;{query}&raquo; найдено {results.length} предложений
      </p>

      {results.length > 0 ? (
        <div className="space-y-2">
          {results.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
            >
              <Link
                to={`/offer/${offer.id}`}
                className="card-surface flex items-center gap-4 p-4 group"
              >
                <img src={offer.seller.avatar} alt="" className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-accent text-[10px]">{offer.gameName}</span>
                    {offer.isAutoDelivery && <span className="badge-green text-[10px]">⚡ Авто</span>}
                  </div>
                  <div className="font-medium text-sm text-fg group-hover:text-accent transition-colors truncate">
                    {offer.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-accent">{offer.seller.username}</span>
                    <span className="text-[10px] text-gold">★ {offer.seller.rating}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-green">{formatPrice(offer.price)}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : query.trim() ? (
        <div className="card-surface p-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-bold text-fg text-lg">Ничего не найдено</div>
          <p className="text-sm text-muted mt-2">Попробуйте изменить поисковый запрос</p>
          <Link to="/" className="btn-primary mt-4 inline-flex">Перейти в каталог</Link>
        </div>
      ) : (
        <div className="card-surface p-12 text-center">
          <div className="text-4xl mb-3">🎮</div>
          <div className="font-bold text-fg text-lg">Введите запрос</div>
          <p className="text-sm text-muted mt-2">Ищите игры, предметы, аккаунты и услуги</p>
        </div>
      )}
    </div>
  );
}
