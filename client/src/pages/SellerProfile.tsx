import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSellerById, getOffersBySeller, formatPrice, REVIEWS } from '../data/mock';

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const seller = useMemo(() => (id ? getSellerById(id) : undefined), [id]);
  const offers = useMemo(() => (id ? getOffersBySeller(id) : []), [id]);

  if (!seller) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">👤</div>
        <h1 className="text-2xl font-bold text-fg">Продавец не найден</h1>
        <Link to="/" className="btn-primary mt-6 inline-flex">На главную</Link>
      </div>
    );
  }

  const reviews = REVIEWS.slice(0, 6);
  const regDate = new Date(seller.registeredAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link to="/" className="hover:text-fg transition-colors">Главная</Link>
        <span>/</span>
        <span className="text-fg">{seller.username}</span>
      </div>

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="relative">
            <img src={seller.avatar} alt={seller.username} className="w-20 h-20 rounded-2xl" />
            {seller.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green rounded-full border-4 border-surface" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-fg">{seller.username}</h1>
              {seller.isVerified && (
                <span className="badge-green">✓ Верифицирован</span>
              )}
              {seller.isOnline ? (
                <span className="badge-accent">Онлайн</span>
              ) : (
                <span className="text-xs text-muted">{seller.lastSeen}</span>
              )}
            </div>
            <p className="text-sm text-muted mt-2 max-w-xl">{seller.description}</p>
            <div className="text-xs text-muted mt-2">На площадке с {regDate}</div>
          </div>
          <button className="btn-primary shrink-0">Написать</button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-line">
          <div className="bg-elevated rounded-xl p-4 text-center">
            <div className="text-2xl font-extrabold text-gold">★ {seller.rating}</div>
            <div className="text-xs text-muted mt-1">Рейтинг</div>
          </div>
          <div className="bg-elevated rounded-xl p-4 text-center">
            <div className="text-2xl font-extrabold text-fg">{seller.reviewsCount.toLocaleString()}</div>
            <div className="text-xs text-muted mt-1">Отзывов</div>
          </div>
          <div className="bg-elevated rounded-xl p-4 text-center">
            <div className="text-2xl font-extrabold text-fg">{seller.ordersCompleted.toLocaleString()}</div>
            <div className="text-xs text-muted mt-1">Продаж</div>
          </div>
          <div className="bg-elevated rounded-xl p-4 text-center">
            <div className="text-2xl font-extrabold text-fg">{offers.length}</div>
            <div className="text-xs text-muted mt-1">Активных</div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Offers */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-fg mb-4">
            Предложения <span className="text-muted font-normal text-sm">({offers.length})</span>
          </h2>
          <div className="space-y-2">
            {offers.map((offer, i) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <Link
                  to={`/offer/${offer.id}`}
                  className="card-surface flex items-center gap-4 p-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="badge-accent text-[10px]">{offer.gameName}</span>
                      {offer.isAutoDelivery && <span className="badge-green text-[10px]">⚡ Авто</span>}
                    </div>
                    <div className="font-medium text-sm text-fg group-hover:text-accent transition-colors truncate">
                      {offer.title}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-green">{formatPrice(offer.price)}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Reviews */}
        <div>
          <h2 className="text-xl font-bold text-fg mb-4">Последние отзывы</h2>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="card-surface p-4">
                <div className="flex items-center gap-2 mb-2">
                  <img src={review.avatar} alt="" className="w-7 h-7 rounded-full" />
                  <span className="font-medium text-sm text-fg">{review.author}</span>
                  <span className="text-xs text-gold ml-auto">{'★'.repeat(review.rating)}</span>
                </div>
                <p className="text-xs text-muted">{review.text}</p>
                <div className="text-[10px] text-muted mt-2">{review.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
