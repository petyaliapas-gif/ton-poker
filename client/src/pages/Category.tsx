import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getGameById, getOffersByGame, formatPrice, CATEGORY_LABELS, GAMES } from '../data/mock';
import type { Offer } from '../data/mock';

type SortKey = 'price-asc' | 'price-desc' | 'rating' | 'newest';

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [filterType, setFilterType] = useState<Offer['categoryType'] | 'all'>('all');
  const [autoOnly, setAutoOnly] = useState(false);

  const game = useMemo(() => {
    if (!slug) return undefined;
    return getGameById(slug) ?? GAMES.find(g => g.slug === slug);
  }, [slug]);

  const offers = useMemo(() => {
    if (!game) return [];
    let list = getOffersByGame(game.id);
    if (filterType !== 'all') list = list.filter(o => o.categoryType === filterType);
    if (autoOnly) list = list.filter(o => o.isAutoDelivery);

    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.seller.rating - a.seller.rating); break;
      case 'newest': list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
    }
    return list;
  }, [game, filterType, autoOnly, sortBy]);

  if (!game) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">🎮</div>
        <h1 className="text-2xl font-bold text-fg">Игра не найдена</h1>
        <p className="text-muted mt-2">Попробуйте выбрать другую игру из каталога</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">На главную</Link>
      </div>
    );
  }

  const categoryTypes = Object.entries(CATEGORY_LABELS) as Array<[Offer['categoryType'], string]>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link to="/" className="hover:text-fg transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-fg">{game.name}</span>
      </div>

      {/* Game header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface p-6 mb-6 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `radial-gradient(circle at 80% 20%, ${game.color}60, transparent 60%)` }}
        />
        <div className="relative">
          <h1 className="text-3xl font-extrabold text-fg">{game.name}</h1>
          <p className="text-sm text-muted mt-1">
            {game.offersCount.toLocaleString('ru-RU')} предложений от проверенных продавцов
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {categoryTypes.map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterType(filterType === key ? 'all' : key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  filterType === key
                    ? 'bg-accent text-white border-accent'
                    : 'bg-elevated text-muted border-line hover:text-fg hover:border-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{offers.length} предложений</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoOnly}
              onChange={(e) => setAutoOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-elevated border-line accent-accent"
            />
            <span className="text-xs text-muted">⚡ Только автовыдача</span>
          </label>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="bg-elevated border border-line rounded-lg px-3 py-2 text-xs text-fg outline-none focus:border-accent"
        >
          <option value="rating">По рейтингу</option>
          <option value="price-asc">Сначала дешевые</option>
          <option value="price-desc">Сначала дорогие</option>
          <option value="newest">Сначала новые</option>
        </select>
      </div>

      {/* Offers list */}
      <div className="space-y-2">
        {offers.map((offer, i) => (
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
                  <span className="font-medium text-sm text-fg group-hover:text-accent transition-colors truncate">
                    {offer.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={`/seller/${offer.seller.id}`}
                    className="text-xs text-accent hover:text-accent-light"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {offer.seller.username}
                  </Link>
                  <span className="text-[10px] text-gold">★ {offer.seller.rating}</span>
                  <span className="text-[10px] text-muted">({offer.seller.reviewsCount} отзывов)</span>
                  {offer.seller.isVerified && (
                    <span className="badge-green text-[10px]">✓ Проверен</span>
                  )}
                  {offer.isAutoDelivery && (
                    <span className="badge-accent text-[10px]">⚡ Авто</span>
                  )}
                  {offer.server && (
                    <span className="text-[10px] text-muted">Сервер: {offer.server}</span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="text-lg font-bold text-green">{formatPrice(offer.price)}</div>
                <div className="text-[10px] text-muted mt-0.5">
                  {offer.reviewsCount} отзывов
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
        {offers.length === 0 && (
          <div className="card-surface p-12 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <div className="font-bold text-fg">Ничего не найдено</div>
            <div className="text-sm text-muted mt-1">Попробуйте изменить фильтры</div>
          </div>
        )}
      </div>
    </div>
  );
}
