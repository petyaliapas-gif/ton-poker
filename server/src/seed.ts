import { getPrisma } from './db.js';
import { log } from './log.js';

interface SeedCosmetic {
  id: string;
  name: string;
  description: string;
  category: 'AVATAR' | 'CARD_BACK' | 'TABLE_FELT' | 'CHIP_SET' | 'EMOJI';
  priceStars: number;
  imageUrl: string;
}

const COSMETICS: SeedCosmetic[] = [
  { id: 'avatar-shark', name: 'Аватар: Акула', description: 'Хищный профиль для агрессивного стиля.', category: 'AVATAR', priceStars: 250, imageUrl: '🦈' },
  { id: 'avatar-king', name: 'Аватар: Король', description: 'Корона на твоём профиле — для настоящих чемпионов.', category: 'AVATAR', priceStars: 800, imageUrl: '♛' },
  { id: 'card-back-neon', name: 'Рубашка: Neon', description: 'Светящиеся рубашки карт в неоновом стиле.', category: 'CARD_BACK', priceStars: 350, imageUrl: '🃏' },
  { id: 'felt-emerald', name: 'Стол: Изумруд', description: 'Изумрудно-зелёное сукно с золотой каймой.', category: 'TABLE_FELT', priceStars: 500, imageUrl: '🟢' },
  { id: 'chip-set-gold', name: 'Фишки: Gold', description: 'Премиум-набор золотых фишек.', category: 'CHIP_SET', priceStars: 750, imageUrl: '🪙' },
  { id: 'emoji-fire', name: 'Эмодзи: 🔥-пакет', description: 'Пакет огненных эмодзи для чата за столом.', category: 'EMOJI', priceStars: 100, imageUrl: '🔥' },
];

export async function seedCosmetics(): Promise<void> {
  const db = getPrisma();
  let inserted = 0;
  for (const c of COSMETICS) {
    const existing = await db.cosmeticItem.findUnique({ where: { id: c.id } });
    if (existing) continue;
    await db.cosmeticItem.create({
      data: {
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category,
        priceStars: BigInt(c.priceStars),
        imageUrl: c.imageUrl,
      },
    });
    inserted++;
  }
  if (inserted > 0) log.info({ inserted }, 'seeded cosmetic items');
}
