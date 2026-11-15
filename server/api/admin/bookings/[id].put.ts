export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event,'id'))
  const b = await readBody(event)
  if (!Number.isInteger(id) || id<1 || !b || typeof b !== 'object') throw createError({statusCode:400})
  if (b.status !== undefined && !['new','confirmed','cancelled'].includes(b.status)) throw createError({statusCode:400,message:'Некорректный статус'})
  if (b.admin_note !== undefined && (typeof b.admin_note !== 'string' || b.admin_note.length>4000)) throw createError({statusCode:400,message:'Заметка до 4000 символов'})
  if (b.viewed !== undefined && typeof b.viewed !== 'boolean') throw createError({statusCode:400})
  const {rows} = await useDb().query(`UPDATE bookings SET status=COALESCE($2,status),admin_note=COALESCE($3,admin_note),viewed_at=CASE WHEN $4::boolean IS NULL THEN viewed_at WHEN $4 THEN COALESCE(viewed_at,now()) ELSE NULL END WHERE id=$1 RETURNING *`,[id,b.status??null,b.admin_note??null,b.viewed??null])
  if (!rows[0]) throw createError({statusCode:404})
  return rows[0]
})
