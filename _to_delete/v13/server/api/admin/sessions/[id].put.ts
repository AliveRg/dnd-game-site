export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = await readBody<any>(event)
  const { rows } = await useDb().query(
    `UPDATE game_sessions SET game_id=$2, starts_at=$3, duration_h=$4, max_players=$5, price=$6, is_weekly=$7, note=$8, status=$9
     WHERE id=$1 RETURNING *`,
    [Number(getRouterParam(event, 'id')), b.game_id || null, b.starts_at, b.duration_h || 4, b.max_players || 5, b.price || 2000, Boolean(b.is_weekly), b.note || '', b.status || 'open']
  )
  return rows[0]
})
