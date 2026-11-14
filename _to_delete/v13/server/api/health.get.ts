export default defineEventHandler(async () => {
  let db: 'off' | 'ok' | 'error' = 'off'
  if (isDbConfigured()) {
    try {
      await useDb().query('SELECT 1')
      db = 'ok'
    } catch {
      db = 'error'
    }
  }
  // Всегда 200, чтобы App Platform не перезапускал контейнер из-за временных проблем с БД
  return { ok: true, db, time: new Date().toISOString() }
})
