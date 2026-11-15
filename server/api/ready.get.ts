// Dependency readiness for monitoring and verifying deployment configuration.
// This endpoint is deliberately not the Docker liveness probe.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  if (!isDbConfigured()) {
    setResponseStatus(event, 503)
    return { ok: false, db: 'unconfigured' }
  }
  try {
    await useDb().query('SELECT 1')
    return { ok: true, db: 'ok' }
  } catch {
    setResponseStatus(event, 503)
    return { ok: false, db: 'unavailable' }
  }
})
