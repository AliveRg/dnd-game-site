export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event,'id'))
  const b = await readBody(event)
  if (!Number.isInteger(id) || id<1 || !b || typeof b !== 'object') throw createError({statusCode:400})
  if (b.status !== undefined && !['new','confirmed','cancelled'].includes(b.status)) throw createError({statusCode:400,message:'Некорректный статус'})
  if (b.admin_note !== undefined && (typeof b.admin_note !== 'string' || b.admin_note.length>4000)) throw createError({statusCode:400,message:'Заметка до 4000 символов'})
  if (b.viewed !== undefined && typeof b.viewed !== 'boolean') throw createError({statusCode:400})
  const db=await useDb().connect()
  try {
    await db.query('BEGIN')
    const initial=await db.query('SELECT session_id FROM bookings WHERE id=$1',[id])
    if(!initial.rows[0])throw createError({statusCode:404})
    const sessionId=initial.rows[0].session_id
    if(sessionId)await db.query('SELECT id FROM game_sessions WHERE id=$1 FOR UPDATE',[sessionId])
    const current=await db.query('SELECT status,players FROM bookings WHERE id=$1 FOR UPDATE',[id])
    if(sessionId && current.rows[0].status==='cancelled' && b.status && b.status!=='cancelled'){
      const capacity=await db.query("SELECT s.max_players-(SELECT COALESCE(SUM(players),0) FROM bookings WHERE session_id=s.id AND status<>'cancelled') AS left FROM game_sessions s WHERE s.id=$1",[sessionId])
      if(capacity.rows[0].left<current.rows[0].players)throw createError({statusCode:409,message:'Для восстановления заявки недостаточно мест'})
    }
    const {rows}=await db.query(`UPDATE bookings SET status=COALESCE($2,status),admin_note=COALESCE($3,admin_note),viewed_at=CASE WHEN $4::boolean IS NULL THEN viewed_at WHEN $4 THEN COALESCE(viewed_at,now()) ELSE NULL END WHERE id=$1 RETURNING *`,[id,b.status??null,b.admin_note??null,b.viewed??null])
    await db.query('COMMIT')
    return rows[0]
  }catch(error){await db.query('ROLLBACK');throw error}finally{db.release()}
})
