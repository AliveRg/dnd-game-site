export default defineEventHandler(async (event) => {
  rateLimit(event, 'login', 10, 15 * 60_000)
  const { login, password } = await readBody<{ login: string; password: string }>(event)
  if (!checkCredentials(String(login || ''), String(password || ''))) {
    throw createError({ statusCode: 401, message: 'Неверный логин или пароль' })
  }
  const session = await getAdminSession(event)
  await session.update({ admin: true })
  return { ok: true }
})
