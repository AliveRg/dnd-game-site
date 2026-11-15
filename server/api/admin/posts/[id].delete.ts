export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await useDb().query(`DELETE FROM posts WHERE id=$1`, [Number(getRouterParam(event, 'id'))])
  invalidateContent()
  return { ok: true }
})
