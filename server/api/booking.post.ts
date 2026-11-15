import { createHash } from 'node:crypto'
import { validateBooking } from '../../shared/utils/booking'

export default defineEventHandler(async (event) => {
  rateLimit(event, 'booking', 5, 10 * 60_000)
  const raw = await readBody(event)
  if (raw?.website) throw createError({ statusCode: 400, message: 'Не удалось отправить форму' })
  let b: ReturnType<typeof validateBooking>
  try { b = validateBooking(raw) } catch (e) { throw createError({ statusCode: 400, message: (e as Error).message }) }
  if (!isDbConfigured()) throw createError({ statusCode: 503, message: 'Приём заявок временно недоступен. Позвоните +7 (904) 090-17-64' })
  const hash = createHash('sha256').update(JSON.stringify({ ...b, requestId: undefined })).digest('hex')
  try {
    const db = useDb()
    const { rows } = await db.query(
      `INSERT INTO bookings (name,contact,players,tariff,invited_by,friends,comment,utm,source,request_id,request_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (request_id) WHERE request_id IS NOT NULL DO NOTHING RETURNING id`,
      [b.name,b.contact,b.players,b.tariff,b.invitedBy,b.players-1,b.comment,JSON.stringify(b.utm),b.source,b.requestId,hash])
    if (rows[0]) return {ok:true,id:rows[0].id}
    const existing = await db.query('SELECT id,request_hash FROM bookings WHERE request_id=$1',[b.requestId])
    if (existing.rows[0]?.request_hash !== hash) throw createError({statusCode:409,message:'Эта отправка уже использована. Обновите форму'})
    return {ok:true,id:existing.rows[0].id}
  } catch (e: any) {
    if (e.statusCode === 409) throw e
    console.error('[booking] database request failed', e.code ?? 'unknown')
    throw createError({statusCode:503,message:'Не удалось сохранить заявку. Попробуйте позже или позвоните нам'})
  }
})
