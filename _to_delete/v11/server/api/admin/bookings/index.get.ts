export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { rows } = await useDb().query(`
    SELECT b.*, s.starts_at, p.title AS game_title
    FROM bookings b
    LEFT JOIN game_sessions s ON s.id = b.session_id
    LEFT JOIN posts p ON p.id = s.game_id
    ORDER BY b.created_at DESC LIMIT 300`)
  return rows
})
