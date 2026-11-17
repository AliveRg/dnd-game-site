import { createHash } from 'node:crypto'
import { validateBooking } from '../../shared/utils/booking'

export default defineEventHandler(async (event) => {
  rateLimit(event, 'calendar-booking', 5, 10 * 60_000)
  const raw = await readBody(event)
  const sessionId = raw?.sessionId ?? null
  if (sessionId !== null && (!Number.isSafeInteger(sessionId) || sessionId <= 0)) {
    throw createError({statusCode:400,message:'Некорректная дата игры'})
  }
  if (typeof raw?.contact !== 'string' || raw.contact.trim().length < 3 || raw.contact.length > 120) {
    throw createError({statusCode:400,message:'Оставьте телефон или контакт для связи'})
  }
  let booking: ReturnType<typeof validateBooking>
  try {
    booking = validateBooking({...raw,contact:'+70000000000',sessionId:null})
    if (raw.website) throw new Error('Не удалось отправить форму')
  } catch (error) {
    throw createError({statusCode:400,message:(error as Error).message})
  }
  booking.contact = raw.contact.trim()
  if (!isDbConfigured()) throw createError({statusCode:503,message:'Приём заявок временно недоступен. Позвоните +7 (999) 999-99-99'})
  const hash = createHash('sha256').update(JSON.stringify({...booking,requestId:undefined,sessionId})).digest('hex')
  let db
  try {
    db = await useDb().connect()
    await db.query('BEGIN')
    await db.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[booking.requestId])
    const existing = await db.query('SELECT id,request_hash FROM bookings WHERE request_id=$1',[booking.requestId])
    if (existing.rows[0]) {
      if (existing.rows[0].request_hash !== hash) throw createError({statusCode:409,message:'Эта отправка уже использована. Обновите форму'})
      await db.query('COMMIT')
      return {ok:true,id:existing.rows[0].id,roll:null,bonus:false,bonusText:null}
    }
    if (sessionId) {
      const result = await db.query('SELECT max_players,status,starts_at FROM game_sessions WHERE id=$1 FOR UPDATE',[sessionId])
      const session = result.rows[0]
      if (!session || session.status !== 'open' || new Date(session.starts_at).getTime() <= Date.now()) {
        throw createError({statusCode:409,message:'Запись на эту партию закрыта'})
      }
      const taken = await db.query("SELECT COALESCE(SUM(players),0)::int AS n FROM bookings WHERE session_id=$1 AND status<>'cancelled'",[sessionId])
      if (session.max_players-taken.rows[0].n < booking.players) throw createError({statusCode:409,message:'Для вашей компании недостаточно мест'})
    }
    const result = await db.query(
      'INSERT INTO bookings(session_id,name,contact,players,tariff,invited_by,friends,comment,utm,source,request_id,request_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id',
      [sessionId,booking.name,booking.contact,booking.players,booking.tariff,booking.invitedBy,booking.players-1,booking.comment,JSON.stringify(booking.utm),booking.source,booking.requestId,hash])
    await db.query('COMMIT')
    return {ok:true,id:result.rows[0].id,roll:null,bonus:false,bonusText:null}
  } catch (error:any) {
    if(db)await db.query('ROLLBACK').catch(()=>{})
    if (error.statusCode===409) throw error
    console.error('[calendar-booking] database request failed',error.code??'unknown')
    throw createError({statusCode:503,message:'Не удалось сохранить заявку. Попробуйте позже или позвоните нам'})
  } finally {db?.release()}
})
