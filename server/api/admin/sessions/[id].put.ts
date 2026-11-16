export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = await readBody<any>(event)
  const id=Number(getRouterParam(event,'id'))
  const maxPlayers=b.max_players??5
  if(!Number.isInteger(maxPlayers)||maxPlayers<1||maxPlayers>10)throw createError({statusCode:400,message:'Укажите от 1 до 10 мест'})
  const db=await useDb().connect()
  try{
  await db.query('BEGIN')
  const session=await db.query('SELECT id FROM game_sessions WHERE id=$1 FOR UPDATE',[id])
  if(!session.rows[0])throw createError({statusCode:404})
  const taken=await db.query("SELECT COALESCE(SUM(players),0)::int AS n FROM bookings WHERE session_id=$1 AND status<>'cancelled'",[id])
  if(maxPlayers<taken.rows[0].n)throw createError({statusCode:409,message:'Мест меньше, чем уже записанных игроков'})
  const { rows } = await db.query(
    `UPDATE game_sessions SET game_id=$2, starts_at=$3, duration_h=$4, max_players=$5, price=$6, is_weekly=$7, note=$8, status=$9
     WHERE id=$1 RETURNING *`,
    [Number(getRouterParam(event, 'id')), b.game_id || null, b.starts_at, b.duration_h || 4, b.max_players || 5, b.price || 2000, Boolean(b.is_weekly), b.note || '', b.status || 'open']
  )
  await db.query('COMMIT')
  return rows[0]
  }catch(error){await db.query('ROLLBACK');throw error}finally{db.release()}
})
