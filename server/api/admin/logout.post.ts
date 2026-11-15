export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const session = await getAdminSession(event)
  await useDb().query('DELETE FROM admin_sessions WHERE id=$1', [session.data.sessionId])
  await session.clear()
  return { ok: true }
})
