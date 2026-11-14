export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { rows } = await useDb().query(`
    SELECT s.*, p.title AS game_title,
      COALESCE(SUM(b.players) FILTER (WHERE b.status <> 'cancelled'),0)::int AS taken
    FROM game_sessions s
    LEFT JOIN posts p ON p.id = s.game_id
    LEFT JOIN bookings b ON b.session_id = s.id
    GROUP BY s.id, p.title
    ORDER BY s.starts_at DESC LIMIT 200`)
  return rows
})
