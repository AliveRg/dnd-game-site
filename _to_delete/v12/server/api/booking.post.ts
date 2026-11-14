import { randomInt } from 'node:crypto'
import { estimatePrice, MAX_PLAYERS, TARIFFS } from '#shared/utils/pricing'

interface BookingBody {
  sessionId?: number | null
  name?: string
  contact?: string
  players?: number
  tariff?: string
  invitedBy?: string
  comment?: string
  consent?: boolean
  website?: string // honeypot - у людей всегда пустой
  utm?: Record<string, string>
}

const clean = (v: unknown, max = 200) => String(v ?? '').trim().slice(0, max)

export default defineEventHandler(async (event) => {
  rateLimit(event, 'booking', 5, 10 * 60_000)
  const body = await readBody<BookingBody>(event)

  if (body.website) return { ok: true } // бот - делаем вид, что всё ок

  const name = clean(body.name, 80)
  const contact = clean(body.contact, 120)
  const players = Math.max(1, Math.min(Number(body.players) || 1, MAX_PLAYERS))
  const tariff = TARIFFS.some((t) => t.id === body.tariff) ? String(body.tariff) : 'promo4'
  const invitedBy = clean(body.invitedBy, 80)
  const comment = clean(body.comment, 1000)
  const sessionId = body.sessionId ? Number(body.sessionId) : null

  if (name.length < 2) throw createError({ statusCode: 400, message: 'Укажите имя' })
  if (contact.length < 3) throw createError({ statusCode: 400, message: 'Укажите Telegram, VK или e-mail для связи' })
  if (!body.consent) throw createError({ statusCode: 400, message: 'Нужно согласие на обработку персональных данных' })

  // Бросок d20 делает сервер (нельзя подкрутить в браузере). 20 = бонус, один раз на контакт
  const pub = useRuntimeConfig().public
  const diceOn = String(pub.diceBonus) === 'true'
  const roll = diceOn ? randomInt(1, 21) : null
  let bonus = roll === 20

  let sessionInfo = 'без даты (подобрать)'
  let bookingId: number | null = null

  if (isDbConfigured()) {
    const db = await useDb().connect()
    try {
      await db.query('BEGIN')
      if (sessionId) {
        // Блокируем строку партии, чтобы два человека не заняли последнее место одновременно
        const s = await db.query(
          `SELECT s.id, s.starts_at, s.max_players, s.status, p.title
           FROM game_sessions s LEFT JOIN posts p ON p.id = s.game_id
           WHERE s.id = $1 FOR UPDATE OF s`,
          [sessionId]
        )
        const row = s.rows[0]
        if (!row || row.status !== 'open') throw createError({ statusCode: 409, message: 'Запись на эту партию закрыта' })
        const taken = await db.query(
          `SELECT COALESCE(SUM(players),0)::int AS n FROM bookings WHERE session_id = $1 AND status <> 'cancelled'`,
          [sessionId]
        )
        const left = row.max_players - taken.rows[0].n
        if (players > left) {
          throw createError({ statusCode: 409, message: left > 0 ? `Осталось мест: ${left}` : 'Мест больше нет' })
        }
        sessionInfo = `${row.title ?? 'Партия'} - ${new Date(row.starts_at).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`
      }
      if (bonus) {
        const had = await db.query(`SELECT 1 FROM bookings WHERE lower(contact) = lower($1) AND bonus LIMIT 1`, [contact])
        if (had.rowCount) bonus = false
      }
      const ins = await db.query(
        `INSERT INTO bookings (session_id, name, contact, players, tariff, invited_by, friends, comment, utm, roll, bonus)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
        [sessionId, name, contact, players, tariff, invitedBy, players - 1, comment, JSON.stringify(body.utm ?? {}), roll, bonus]
      )
      bookingId = ins.rows[0].id
      await db.query('COMMIT')
    } catch (e) {
      await db.query('ROLLBACK')
      throw e
    } finally {
      db.release()
    }
  }

  const price = estimatePrice(tariff, players)
  const tariffTitle = TARIFFS.find((t) => t.id === tariff)?.title

  let sent = false
  try {
    sent = await sendMail(`Новая заявка${bookingId ? ` #${bookingId}` : ''}: ${name}, мест: ${players}`, {
      Имя: name,
      Контакт: contact,
      Партия: sessionInfo,
      Мест: players,
      Тариф: tariffTitle,
      'Кто пригласил': invitedBy || '-',
      'Оценка стоимости': `${price.total} ₽ (скидка пригласившему ${price.discount} ₽)`,
      Комментарий: comment || '-',
      'Бросок d20': roll ? `${roll}${bonus ? ` - КРИТ! Бонус: ${pub.diceBonusText}` : ''}` : '-',
      UTM: body.utm ? JSON.stringify(body.utm) : '-'
    })
  } catch (e: any) {
    console.error('[mail] ошибка отправки:', e.message)
    // Заявка уже в БД - не роняем ответ пользователю
    if (!bookingId) throw createError({ statusCode: 500, message: 'Не удалось отправить заявку, напишите нам напрямую' })
  }
  // Ни БД, ни почты - заявка бы потерялась. В dev это ок, в проде - ошибка
  if (!sent && !bookingId && process.env.NODE_ENV === 'production') {
    throw createError({ statusCode: 503, message: 'Приём заявок временно не работает, напишите нам напрямую' })
  }

  return { ok: true, id: bookingId, roll, bonus, bonusText: bonus ? pub.diceBonusText : null }
})
