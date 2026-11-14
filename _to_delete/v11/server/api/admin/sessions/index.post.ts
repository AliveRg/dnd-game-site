export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = await readBody<any>(event)
  if (!b.starts_at) throw createError({ statusCode: 400, message: 'Нужна дата' })
  const { rows } = await useDb().query(
    `INSERT INTO game_sessions (game_id, starts_at, duration_h, max_players, price, is_weekly, note, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [b.game_id || null, b.starts_at, b.duration_h || 4, b.max_players || 5, b.price || 2000, Boolean(b.is_weekly), b.note || '', b.status || 'open']
  )
  return rows[0]
})
