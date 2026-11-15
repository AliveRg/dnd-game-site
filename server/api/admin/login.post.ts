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
  await useDb().query("DELETE FROM admin_sessions WHERE expires_at<now()")
  await useDb().query("INSERT INTO admin_sessions(id,expires_at) VALUES($1,now()+interval '7 days')", [sessionId])
  await session.update({ admin: true, sessionId })
  return { ok: true }
})
