import { readBoundedBody } from '../utils/request-body'

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  if (path.startsWith('/api/admin') || path.startsWith('/dragons') || path === '/api/booking') {
    setResponseHeader(event, 'Cache-Control', 'no-store')
    setResponseHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  }
  if (!path.startsWith('/api/') || ['GET','HEAD','OPTIONS'].includes(event.method)) return
  const origin = getRequestHeader(event, 'origin')
  const configured = String(useRuntimeConfig().public.siteUrl)
  const actual = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin
  const allowed = new Set([new URL(configured).origin])
  // Development and the platform's technical hostname still require an exact same-origin request.
  if (process.env.NODE_ENV !== 'production' || getRequestHeader(event,'host')?.endsWith('.twc1.net')) allowed.add(actual)
  if (!origin || !allowed.has(origin) || getRequestHeader(event,'sec-fetch-site') === 'cross-site') throw createError({statusCode:403,message:'Недопустимый источник запроса'})
  const limit = path === '/api/admin/upload' ? 9 * 1024 * 1024 : 128 * 1024
  const length = Number(getRequestHeader(event,'content-length') || 0)
  if (length > limit) throw createError({statusCode:413,message:'Слишком большой запрос'})
  try {
    // H3 1.x readBody/readMultipartFormData reuse this raw-body cache.
    const raw = await readBoundedBody(event.node.req, limit)
    ;(event.node.req as any)[Symbol.for('h3RawBody')] = Promise.resolve(raw)
  } catch (error:any) {
    throw createError({statusCode:error.statusCode===413?413:400,message:error.statusCode===413?'Слишком большой запрос':'Не удалось прочитать запрос'})
  }
})
