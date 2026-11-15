// Container liveness: database configuration/outages must not restart the web process.
// Dependency readiness is reported separately at /api/ready.
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return { ok: true }
})
