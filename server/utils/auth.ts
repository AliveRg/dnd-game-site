import type { H3Event } from 'h3'
import { timingSafeEqual } from 'node:crypto'

const SESSION_NAME = 'dragons'

function sessionConfig() {
  const password = useRuntimeConfig().sessionPassword
  if (!password || password.length < 32) {
    throw createError({ statusCode: 503, message: 'NUXT_SESSION_PASSWORD должен быть 32+ символа' })
  }
  return { name: SESSION_NAME, password, maxAge: 60 * 60 * 24 * 7, cookie: { sameSite: 'lax' as const, httpOnly: true, secure: process.env.NODE_ENV === 'production' } }
}

export const getAdminSession = (event: H3Event) => useSession<{ admin?: boolean; sessionId?: string }>(event, sessionConfig())

export function checkCredentials(login: string, password: string) {
  const c = useRuntimeConfig()
  if (!c.adminLogin || !c.adminPassword) return false
  const eq = (a: string, b: string) => {
    const ba = Buffer.from(a)
    const bb = Buffer.from(b)
    return ba.length === bb.length && timingSafeEqual(ba, bb)
  }
  return eq(login, c.adminLogin) && eq(password, c.adminPassword)
}

export async function requireAdmin(event: H3Event) {
  const session = await getAdminSession(event)
  setResponseHeader(event, 'Cache-Control', 'no-store')
  if (!session.data.admin || !session.data.sessionId) throw createError({ statusCode: 401, message: 'Нужен вход' })
  const active = await useDb().query('SELECT 1 FROM admin_sessions WHERE id=$1 AND expires_at>now()', [session.data.sessionId])
  if (!active.rowCount) { await session.clear(); throw createError({statusCode:401,message:'Сессия завершена. Войдите снова'}) }
}

// Простой rate-limit в памяти (для логина и заявок)
const hits = new Map<string, { n: number; t: number }>()
export function rateLimit(event: H3Event, key: string, limit: number, windowMs: number) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const k = `${key}:${ip}`
  const now = Date.now()
  const h = hits.get(k)
  if (!h || now - h.t > windowMs) {
    hits.set(k, { n: 1, t: now })
    return
  }
  h.n++
  if (h.n > limit) throw createError({ statusCode: 429, message: 'Слишком много попыток, попробуйте позже' })
}
