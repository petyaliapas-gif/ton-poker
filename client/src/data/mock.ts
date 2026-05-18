export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  offersCount: number;
  image: string;
}

export interface Seller {
  id: string;
  username: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  ordersCompleted: number;
  registeredAt: string;
  isOnline: boolean;
  isVerified: boolean;
  lastSeen: string;
  description: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  gameId: string;
  gameName: string;
  categoryType: 'account' | 'currency' | 'items' | 'boosting' | 'key' | 'service';
  seller: Seller;
  rating: number;
  reviewsCount: number;
  isAutoDelivery: boolean;
  isFeatured: boolean;
  createdAt: string;
  server?: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  offerId: string;
}

export const GAMES: GameCategory[] = [
  { id: 'cs2', name: 'Counter-Strike 2', slug: 'cs2', icon: '/cs2.svg', color: '#f0a030', offersCount: 15423, image: 'https://placehold.co/400x200/1a1a2e/f0a030?text=CS2' },
  { id: 'dota2', name: 'Dota 2', slug: 'dota2', icon: '/dota2.svg', color: '#e74c3c', offersCount: 8754, image: 'https://placehold.co/400x200/1a1a2e/e74c3c?text=Dota+2' },
  { id: 'genshin', name: 'Genshin Impact', slug: 'genshin', icon: '/genshin.svg', color: '#3498db', offersCount: 12100, image: 'https://placehold.co/400x200/1a1a2e/3498db?text=Genshin' },
  { id: 'valorant', name: 'Valorant', slug: 'valorant', icon: '/valorant.svg', color: '#ff4655', offersCount: 9300, image: 'https://placehold.co/400x200/1a1a2e/ff4655?text=Valorant' },
  { id: 'fortnite', name: 'Fortnite', slug: 'fortnite', icon: '/fortnite.svg', color: '#00d4ff', offersCount: 6200, image: 'https://placehold.co/400x200/1a1a2e/00d4ff?text=Fortnite' },
  { id: 'roblox', name: 'Roblox', slug: 'roblox', icon: '/roblox.svg', color: '#ff6b6b', offersCount: 4500, image: 'https://placehold.co/400x200/1a1a2e/ff6b6b?text=Roblox' },
  { id: 'lol', name: 'League of Legends', slug: 'lol', icon: '/lol.svg', color: '#c89b3c', offersCount: 11200, image: 'https://placehold.co/400x200/1a1a2e/c89b3c?text=LoL' },
  { id: 'wow', name: 'World of Warcraft', slug: 'wow', icon: '/wow.svg', color: '#f48cba', offersCount: 7800, image: 'https://placehold.co/400x200/1a1a2e/f48cba?text=WoW' },
  { id: 'minecraft', name: 'Minecraft', slug: 'minecraft', icon: '/mc.svg', color: '#7bc96f', offersCount: 3400, image: 'https://placehold.co/400x200/1a1a2e/7bc96f?text=Minecraft' },
  { id: 'pubg', name: 'PUBG', slug: 'pubg', icon: '/pubg.svg', color: '#f7c948', offersCount: 5100, image: 'https://placehold.co/400x200/1a1a2e/f7c948?text=PUBG' },
  { id: 'apex', name: 'Apex Legends', slug: 'apex', icon: '/apex.svg', color: '#cd3333', offersCount: 4200, image: 'https://placehold.co/400x200/1a1a2e/cd3333?text=Apex' },
  { id: 'telegram', name: 'Telegram Games', slug: 'telegram', icon: '/tg.svg', color: '#0088cc', offersCount: 2800, image: 'https://placehold.co/400x200/1a1a2e/0088cc?text=Telegram' },
];

export const SELLERS: Seller[] = [
  {
    id: 's1', username: 'ProTrader', avatar: 'https://placehold.co/80x80/6c5ce7/ffffff?text=PT',
    rating: 4.9, reviewsCount: 2341, ordersCompleted: 5120, registeredAt: '2021-03-15',
    isOnline: true, isVerified: true, lastSeen: 'Сейчас онлайн',
    description: 'Профессиональный продавец игровых аккаунтов и валюты. Работаю 5 лет. Гарантия на все товары.',
  },
  {
    id: 's2', username: 'GameVault', avatar: 'https://placehold.co/80x80/00d68f/ffffff?text=GV',
    rating: 4.8, reviewsCount: 1875, ordersCompleted: 3800, registeredAt: '2022-01-20',
    isOnline: true, isVerified: true, lastSeen: 'Сейчас онлайн',
    description: 'Магазин игровых товаров. Быстрая доставка, честные цены. Более 3000 довольных клиентов.',
  },
  {
    id: 's3', username: 'BoostKing', avatar: 'https://placehold.co/80x80/ffc048/000000?text=BK',
    rating: 4.7, reviewsCount: 956, ordersCompleted: 2100, registeredAt: '2022-06-10',
    isOnline: false, isVerified: true, lastSeen: '15 мин назад',
    description: 'Буст в любых играх. Быстро, качественно, конфиденциально. Топ-500 игрок.',
  },
  {
    id: 's4', username: 'SkinMaster', avatar: 'https://placehold.co/80x80/ff6b81/ffffff?text=SM',
    rating: 4.6, reviewsCount: 743, ordersCompleted: 1500, registeredAt: '2023-02-28',
    isOnline: true, isVerified: false, lastSeen: 'Сейчас онлайн',
    description: 'Скины CS2 по лучшим ценам. Автовыдача 24/7. Принимаю криптовалюту.',
  },
  {
    id: 's5', username: 'RankPusher', avatar: 'https://placehold.co/80x80/a29bfe/ffffff?text=RP',
    rating: 4.9, reviewsCount: 1200, ordersCompleted: 2800, registeredAt: '2021-08-05',
    isOnline: false, isVerified: true, lastSeen: '2 часа назад',
    description: 'Профессиональный бустер. Valorant, CS2, Apex. Стримлю процесс по запросу.',
  },
];

const categoryTypes: Array<Offer['categoryType']> = ['account', 'currency', 'items', 'boosting', 'key', 'service'];

function generateOffers(): Offer[] {
  const offerTemplates = [
    { gameId: 'cs2', gameName: 'Counter-Strike 2', titles: [
      'AK-47 | Redline (Field-Tested)', 'AWP | Dragon Lore (Factory New)', 'M4A4 | Howl (Minimal Wear)',
      'Knife Karambit | Fade', 'Gloves Sport | Vice', 'Аккаунт CS2 Global Elite 3000+ часов',
      'Буст до Global Elite', 'Prime аккаунт CS2 с инвентарем', '500 часов CS2 + медали',
    ]},
    { gameId: 'dota2', gameName: 'Dota 2', titles: [
      'Аркана Phantom Assassin', 'Сет Pudge Arcana Bundle', 'Аккаунт 6000 MMR',
      'Буст MMR +1000', 'Immortal ранг аккаунт', 'Калибровка 10 матчей',
      'Collector Cache 2024 полный набор',
    ]},
    { gameId: 'genshin', gameName: 'Genshin Impact', titles: [
      'Аккаунт AR60 все 5* персонажи', 'Аккаунт с Raiden + Nahida + Furina',
      'Фарм 10000 примогемов', '100 Intertwined Fates', 'C6 Hu Tao аккаунт',
      'Буст Spiral Abyss 36*', 'Genesis Crystals 6480 шт',
    ]},
    { gameId: 'valorant', gameName: 'Valorant', titles: [
      'Аккаунт Immortal 3', 'Буст до Radiant', 'Скин Vandal Prime',
      'Аккаунт с редкими скинами', 'Valorant Points 5000', 'Буст рейтинга +5 рангов',
    ]},
    { gameId: 'fortnite', gameName: 'Fortnite', titles: [
      'Аккаунт с редкими скинами OG', 'V-Bucks 13500', 'Battle Pass уровень 100',
      'Рефандер аккаунт 2018', 'Буст до Champion', 'Аккаунт Galaxy Skin',
    ]},
    { gameId: 'lol', gameName: 'League of Legends', titles: [
      'Аккаунт Challenger', 'Буст до Diamond', 'Все чемпионы + 200 скинов',
      'Riot Points 5000', 'Ранговая калибровка', 'Smurf аккаунт Diamond',
    ]},
    { gameId: 'wow', gameName: 'World of Warcraft', titles: [
      'Золото 500K WoW Classic', 'Аккаунт 480 ilvl', 'Прокачка 1-70',
      'Mythic+ буст +20', 'Raid carry Heroic', 'Маунт Invincible',
    ]},
    { gameId: 'roblox', gameName: 'Roblox', titles: [
      'Robux 10000', 'Аккаунт с Premium', 'Limiteds коллекция',
      'Blox Fruits аккаунт макс', 'Game Pass пакет',
    ]},
  ];

  const offers: Offer[] = [];
  let id = 1;

  for (const template of offerTemplates) {
    for (const title of template.titles) {
      const seller = SELLERS[id % SELLERS.length]!;
      const catType = categoryTypes[id % categoryTypes.length]!;
      offers.push({
        id: `offer-${id}`,
        title,
        description: `${title}. Быстрая доставка, гарантия. Моментальная выдача после оплаты. Связь 24/7.`,
        price: Math.round((5 + Math.random() * 500) * 100) / 100,
        currency: 'RUB',
        gameId: template.gameId,
        gameName: template.gameName,
        categoryType: catType as Offer['categoryType'],
        seller: seller,
        rating: Math.round((4 + Math.random()) * 10) / 10,
        reviewsCount: Math.floor(Math.random() * 500) + 10,
        isAutoDelivery: Math.random() > 0.4,
        isFeatured: Math.random() > 0.7,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        server: Math.random() > 0.5 ? ['EU', 'NA', 'RU', 'Asia'][Math.floor(Math.random() * 4)] : undefined,
      });
      id++;
    }
  }
  return offers;
}

export const OFFERS = generateOffers();

export const REVIEWS: Review[] = [
  { id: 'r1', author: 'Максим К.', avatar: 'https://placehold.co/40x40/6c5ce7/fff?text=M', rating: 5, text: 'Все супер, получил товар за 2 минуты! Рекомендую продавца.', date: '2024-03-15', offerId: 'offer-1' },
  { id: 'r2', author: 'Алексей П.', avatar: 'https://placehold.co/40x40/00d68f/fff?text=A', rating: 5, text: 'Быстрая доставка, все работает. Уже не первый раз покупаю.', date: '2024-03-14', offerId: 'offer-1' },
  { id: 'r3', author: 'Дмитрий С.', avatar: 'https://placehold.co/40x40/ffc048/000?text=D', rating: 4, text: 'Хороший товар, но пришлось подождать 10 минут.', date: '2024-03-13', offerId: 'offer-2' },
  { id: 'r4', author: 'Елена В.', avatar: 'https://placehold.co/40x40/ff6b81/fff?text=E', rating: 5, text: 'Отличный продавец! Помог с активацией, все объяснил.', date: '2024-03-12', offerId: 'offer-3' },
  { id: 'r5', author: 'Иван Н.', avatar: 'https://placehold.co/40x40/a29bfe/fff?text=I', rating: 5, text: 'Покупаю здесь регулярно. Всегда доволен качеством.', date: '2024-03-11', offerId: 'offer-4' },
  { id: 'r6', author: 'Сергей Т.', avatar: 'https://placehold.co/40x40/e74c3c/fff?text=S', rating: 4, text: 'Нормально, но цена немного завышена.', date: '2024-03-10', offerId: 'offer-5' },
  { id: 'r7', author: 'Андрей М.', avatar: 'https://placehold.co/40x40/3498db/fff?text=A', rating: 5, text: 'Моментальная выдача! 10 из 10!', date: '2024-03-09', offerId: 'offer-6' },
  { id: 'r8', author: 'Кирилл Л.', avatar: 'https://placehold.co/40x40/2ecc71/fff?text=K', rating: 5, text: 'Лучший магазин на площадке. Рекомендую всем!', date: '2024-03-08', offerId: 'offer-7' },
];

export const CATEGORY_LABELS: Record<Offer['categoryType'], string> = {
  account: 'Аккаунты',
  currency: 'Валюта',
  items: 'Предметы',
  boosting: 'Буст',
  key: 'Ключи',
  service: 'Услуги',
};

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(price);
}

export function getGameById(id: string): GameCategory | undefined {
  return GAMES.find(g => g.id === id);
}

export function getOffersByGame(gameId: string): Offer[] {
  return OFFERS.filter(o => o.gameId === gameId);
}

export function getOfferById(id: string): Offer | undefined {
  return OFFERS.find(o => o.id === id);
}

export function getSellerById(id: string): Seller | undefined {
  return SELLERS.find(s => s.id === id);
}

export function getOffersBySeller(sellerId: string): Offer[] {
  return OFFERS.filter(o => o.seller.id === sellerId);
}

export function getFeaturedOffers(): Offer[] {
  return OFFERS.filter(o => o.isFeatured).slice(0, 8);
}

export function searchOffers(query: string): Offer[] {
  const q = query.toLowerCase();
  return OFFERS.filter(o =>
    o.title.toLowerCase().includes(q) ||
    o.gameName.toLowerCase().includes(q) ||
    o.seller.username.toLowerCase().includes(q)
  );
}
