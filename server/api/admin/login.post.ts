import { randomUUID } from 'node:crypto'
export default defineEventHandler(async (event) => {
  rateLimit(event, 'login', 10, 15 * 60_000)
  const { login, password } = await readBody<{ login: string; password: string }>(event)
  if (!checkCredentials(String(login || ''), String(password || ''))) {
    throw createError({ statusCode: 401, message: 'Неверный логин или пароль' })
  }
  const session = await getAdminSession(event)
  await session.clear()
  const sessionId = randomUUID()
  try {
  await useDb().query("DELETE FROM admin_sessions WHERE expires_at<now()")
  await useDb().query("INSERT INTO admin_sessions(id,expires_at) VALUES($1,now()+interval '7 days')", [sessionId])
  } catch (error: any) {
    if (error?.statusCode === 503) throw error
    console.error('[admin-login] database failure', String(error?.code || 'connection_unavailable'))
    throw createError({ statusCode: 503, message: 'Не удалось подключиться к базе данных. Проверьте настройки PostgreSQL в Timeweb.' })
  }
  await session.update({ admin: true, sessionId })
  return { ok: true }
})
