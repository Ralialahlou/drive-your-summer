export const CAMPAIGN_END = new Date('2026-07-27T23:59:59+01:00')

export const LS = {
  USER: 'dys_user',
  RECEIPTS: 'dys_receipts',
  SESSION: 'dys_session',
  RESET: 'dys_reset_code',
  LANG: 'dys_lang',
} as const

export interface Level {
  name: string
  nameAr: string
  min: number
  max: number
  emoji: string
}

export const LEVELS: Level[] = [
  /* page 1 */
  { name: 'Co-Pilote', nameAr: 'مساعد سائق', min: 1000, max: 5000, emoji: '🏁' },
  { name: 'Pilote', nameAr: 'سائق', min: 5000, max: 10000, emoji: '🚗' },
  { name: 'Grand Pilote', nameAr: 'سائق متمرس', min: 10000, max: 20000, emoji: '🏎️' },
  { name: 'Champion', nameAr: 'بطل', min: 20000, max: 30000, emoji: '🥇' },
  { name: 'Élite', nameAr: 'نخبة', min: 30000, max: 40000, emoji: '⭐' },
  /* page 2 */
  { name: 'Expert', nameAr: 'خبير', min: 40000, max: 50000, emoji: '💫' },
  { name: 'Expert Or', nameAr: 'خبير ذهبي', min: 50000, max: 60000, emoji: '✨' },
  { name: 'VIP', nameAr: 'VIP', min: 60000, max: 70000, emoji: '👑' },
  { name: 'VIP Or', nameAr: 'VIP ذهبي', min: 70000, max: 80000, emoji: '💎' },
  { name: 'Prestige', nameAr: 'بريستيج', min: 80000, max: 90000, emoji: '🔥' },
  { name: 'Prestige Or', nameAr: 'بريستيج ذهبي', min: 90000, max: 100000, emoji: '🌟' },
  { name: 'Légende', nameAr: 'أسطورة', min: 100000, max: Infinity, emoji: '🏆' },
]

export const LEVELS_PAGE1 = 5

export interface User {
  firstName: string
  lastName: string
  phone: string
  email: string
  pin: string
  createdAt: number
}

export interface Receipt {
  id: number
  amount: number
  image: string
  date: number
}
