export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { status } = await readBody<{ status: string }>(event)
  if (!['new', 'confirmed', 'cancelled'].includes(status)) throw createError({ statusCode: 400 })
  await useDb().query(`UPDATE bookings SET status=$2 WHERE id=$1`, [Number(getRouterParam(event, 'id')), status])
  return { ok: true }
})
