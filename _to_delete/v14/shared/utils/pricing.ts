// Тарифы из ТЗ. Меняешь цены - только здесь (используется и на фронте, и в письме).
export const TARIFFS = [
  { id: 'promo4', title: 'Партия 4 часа', hours: 4, price: 2000, badge: 'Акция', note: 'Основной формат', tier: 'rare' },
  { id: 'long6', title: 'Длинная партия 6 часов', hours: 6, price: 3000, note: 'Для тех, кто не может остановиться', tier: 'legendary' },
  { id: 'invited4', title: 'По приглашению, 4 часа', hours: 4, price: 1500, note: 'Если вас позвал игрок клуба', tier: 'common' }
] as const

// Редкость тарифа (как у предметов в D&D): чем дороже - тем богаче оформление
export const TIER_LABEL = { common: 'Обычный', rare: 'Редкий', legendary: 'Легендарный' } as const
export const TARIFFS_BY_PRICE = [...TARIFFS].sort((a, b) => a.price - b.price)

export type TariffId = (typeof TARIFFS)[number]['id']

export const FRIEND_DISCOUNT = 500 // скидка пригласившему за каждого друга (только 4-часовые партии)
export const FRIEND_DISCOUNT_CAP = 0.25 // потолок скидки пригласившему - 25% от его цены
// Акция: 2000 ₽ за 4 часа. Срок и обычная цена - допущение «по рынку», подтвердить у заказчика
export const PROMO_UNTIL = '2027-01-31'
export const REGULAR_PRICE_4H = 2500
export const MAX_PLAYERS = 5

/**
 * Оценка стоимости для заявки.
 * players - сколько мест бронирует человек (он + друзья, которых он приводит).
 * Друзья идут по тарифу "по приглашению", а пригласившему -500 ₽ за каждого (не ниже 0).
 * Скидка не больше 25% от цены пригласившего (решение от 13.11).
 */
export function estimatePrice(tariffId: string, players: number) {
  const t = TARIFFS.find((x) => x.id === tariffId) ?? TARIFFS[0]
  const friends = Math.max(0, Math.min(players, MAX_PLAYERS) - 1)
  if (t.id === 'long6') return { total: t.price * (friends + 1), perHost: t.price, friends, discount: 0 }
  if (t.id === 'invited4') return { total: t.price * (friends + 1), perHost: t.price, friends, discount: 0 }
  const discount = Math.min(Math.round(t.price * FRIEND_DISCOUNT_CAP), friends * FRIEND_DISCOUNT)
  const invited = TARIFFS.find((x) => x.id === 'invited4')!.price
  return { total: t.price - discount + friends * invited, perHost: t.price - discount, friends, discount }
}
