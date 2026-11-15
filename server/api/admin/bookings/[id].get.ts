export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event,'id'))
  if (!Number.isInteger(id) || id<1) throw createError({statusCode:400})
  const {rows} = await useDb().query('SELECT * FROM bookings WHERE id=$1',[id])
  if (!rows[0]) throw createError({statusCode:404,message:'Заявка не найдена'})
  return rows[0]
})
