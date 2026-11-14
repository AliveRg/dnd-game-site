export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { rows } = await useDb().query(`SELECT * FROM posts ORDER BY type, created_at DESC`)
  return rows
})
