import { TARIFFS, MAX_PLAYERS } from './pricing.ts'

export function normalizePhone(value: unknown): string {
  if (typeof value !== 'string' || !/^[+\d\s()\-.]+$/.test(value)) throw new Error('Укажите телефон')
  let digits = value.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) digits = '7' + digits.slice(1)
  if (digits.length < 8 || digits.length > 15 || digits.startsWith('0')) throw new Error('Укажите корректный телефон')
  return '+' + digits
}

export function validateBooking(raw: unknown) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Некорректная заявка')
  const b = raw as Record<string, unknown>
  const text = (key: string, max: number, min = 0) => {
    if (b[key] !== undefined && typeof b[key] !== 'string') throw new Error(`Некорректное поле ${key}`)
    const value = String(b[key] ?? '').trim()
    if (value.length < min || value.length > max) throw new Error(`Проверьте поле ${key}`)
    return value
  }
  const name = text('name', 120, 2)
  const contact = normalizePhone(b.contact)
  const comment = text('comment', 2000)
  const invitedBy = text('invitedBy', 120)
  const tariff = b.tariff ?? 'promo4'
  const players = b.players ?? 1
  if (!TARIFFS.some(t => t.id === tariff)) throw new Error('Неизвестный тариф')
  if (typeof players !== 'number' || !Number.isInteger(players) || players < 1 || players > MAX_PLAYERS) throw new Error('Выберите от 1 до 5 мест')
  if (b.consent !== true) throw new Error('Нужно согласие на обработку персональных данных')
  if (b.sessionId !== undefined && b.sessionId !== null) throw new Error('Запись на дату временно недоступна')
  if (b.source !== 'quick' && b.source !== 'extended') throw new Error('Некорректный источник заявки')
  if (typeof b.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.requestId)) throw new Error('Обновите форму и повторите отправку')
  const utm: Record<string, string> = {}
  if (b.utm && typeof b.utm === 'object' && !Array.isArray(b.utm)) {
    for (const [key,value] of Object.entries(b.utm).sort(([a],[c])=>a.localeCompare(c))) if (/^(utm_(source|medium|campaign|term|content)|yclid|group_id)$/.test(key) && typeof value === 'string') utm[key] = value.slice(0, 300)
  }
  return {name,contact,comment,tariff: String(tariff),players,invitedBy,source:b.source,requestId:b.requestId,utm}
}
