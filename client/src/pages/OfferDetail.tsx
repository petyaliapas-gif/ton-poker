import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getOfferById, formatPrice, REVIEWS, CATEGORY_LABELS } from '../data/mock';

export default function OfferDetail() {
  const { id } = useParams<{ id: string }>();
  const offer = useMemo(() => (id ? getOfferById(id) : undefined), [id]);

  if (!offer) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">📦</div>
        <h1 className="text-2xl font-bold text-fg">Предложение не найдено</h1>
        <Link to="/" className="btn-primary mt-6 inline-flex">На главную</Link>
      </div>
    );
  }

  const reviews = REVIEWS.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6 flex-wrap">
        <Link to="/" className="hover:text-fg transition-colors">Главная</Link>
        <span>/</span>
        <Link to={`/category/${offer.gameId}`} className="hover:text-fg transition-colors">{offer.gameName}</Link>
        <span>/</span>
        <span className="text-fg truncate max-w-xs">{offer.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-surface p-6"
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge-accent">{offer.gameName}</span>
              <span className="badge-gold">{CATEGORY_LABELS[offer.categoryType]}</span>
              {offer.isAutoDelivery && <span className="badge-green">⚡ Автовыдача</span>}
              {offer.server && <span className="badge-rose">Сервер: {offer.server}</span>}
            </div>
            <h1 className="text-2xl font-extrabold text-fg">{offer.title}</h1>
            <p className="text-sm text-muted mt-3 leading-relaxed">{offer.description}</p>

            <div className="border-t border-line mt-6 pt-4">
              <h3 className="font-semibold text-fg text-sm mb-3">Детали предложения</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-elevated rounded-xl p-3">
                  <div className="text-[11px] text-muted">Игра</div>
                  <div className="text-sm font-medium text-fg mt-0.5">{offer.gameName}</div>
                </div>
                <div className="bg-elevated rounded-xl p-3">
                  <div className="text-[11px] text-muted">Категория</div>
                  <div className="text-sm font-medium text-fg mt-0.5">{CATEGORY_LABELS[offer.categoryType]}</div>
                </div>
                <div className="bg-elevated rounded-xl p-3">
                  <div className="text-[11px] text-muted">Выдача</div>
                  <div className="text-sm font-medium text-fg mt-0.5">{offer.isAutoDelivery ? 'Автоматическая' : 'Ручная'}</div>
                </div>
                <div className="bg-elevated rounded-xl p-3">
                  <div className="text-[11px] text-muted">Отзывы</div>
                  <div className="text-sm font-medium text-fg mt-0.5">★ {offer.rating} ({offer.reviewsCount})</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reviews section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-surface p-6"
          >
            <h3 className="font-bold text-fg text-lg mb-4">Отзывы покупателей</h3>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-3 pb-4 border-b border-line last:border-0 last:pb-0">
                  <img src={review.avatar} alt="" className="w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-fg">{review.author}</span>
                      <span className="text-xs text-gold">{'★'.repeat(review.rating)}</span>
                      <span className="text-[10px] text-muted ml-auto">{review.date}</span>
                    </div>
                    <p className="text-sm text-muted mt-1">{review.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Price card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card-surface p-6 sticky top-20"
          >
            <div className="text-3xl font-extrabold text-green mb-1">{formatPrice(offer.price)}</div>
            <div className="text-xs text-muted mb-4">Цена за 1 шт.</div>
            <button className="btn-green w-full text-base py-3 mb-2">
              Купить сейчас
            </button>
            <button className="btn-ghost w-full">
              Написать продавцу
            </button>

            <div className="border-t border-line mt-4 pt-4">
              <div className="flex items-center gap-2 text-xs text-muted mb-2">
                <svg className="w-4 h-4 text-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Безопасная сделка через гарант
              </div>
              <div className="flex items-center gap-2 text-xs text-muted mb-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {offer.isAutoDelivery ? 'Моментальная выдача' : 'Выдача в течение 30 мин'}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <svg className="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Возврат при проблемах
              </div>
            </div>
          </motion.div>

          {/* Seller card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-surface p-5"
          >
            <div className="flex items-center gap-3">
              <img src={offer.seller.avatar} alt="" className="w-12 h-12 rounded-full" />
              <div className="min-w-0">
                <Link
                  to={`/seller/${offer.seller.id}`}
                  className="font-bold text-fg hover:text-accent transition-colors"
                >
                  {offer.seller.username}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  {offer.seller.isOnline ? (
                    <span className="flex items-center gap-1 text-[11px] text-green">
                      <span className="w-1.5 h-1.5 bg-green rounded-full" />
                      Онлайн
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted">{offer.seller.lastSeen}</span>
                  )}
                  {offer.seller.isVerified && (
                    <span className="badge-green text-[10px]">✓</span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center bg-elevated rounded-lg p-2">
                <div className="text-sm font-bold text-gold">★ {offer.seller.rating}</div>
                <div className="text-[10px] text-muted">Рейтинг</div>
              </div>
              <div className="text-center bg-elevated rounded-lg p-2">
                <div className="text-sm font-bold text-fg">{offer.seller.reviewsCount}</div>
                <div className="text-[10px] text-muted">Отзывов</div>
              </div>
              <div className="text-center bg-elevated rounded-lg p-2">
                <div className="text-sm font-bold text-fg">{offer.seller.ordersCompleted}</div>
                <div className="text-[10px] text-muted">Продаж</div>
              </div>
            </div>
            <Link
              to={`/seller/${offer.seller.id}`}
              className="btn-ghost w-full mt-3 text-xs"
            >
              Все предложения продавца
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
