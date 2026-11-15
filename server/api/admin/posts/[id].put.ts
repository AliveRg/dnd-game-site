export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id=Number(getRouterParam(event,'id'))
  if(!Number.isInteger(id)||id<1) throw createError({statusCode:400})
  const b=validatePost(await readBody(event))
  try {
    const old=await useDb().query('SELECT slug FROM posts WHERE id=$1',[id])
    if(!old.rows[0]) throw createError({statusCode:404})
    // Keep stable URLs: changing slug requires a separately reviewed redirect.
    if(old.rows[0].slug!==b.slug) throw createError({statusCode:409,message:'Адрес опубликованного материала сохраняется. Создайте новый материал для другого адреса'})
    const {rows}=await useDb().query(`UPDATE posts SET type=$2,slug=$3,title=$4,excerpt=$5,body=$6,cover=$7,meta=$8,seo_title=$9,seo_description=$10,published=$11,updated_at=now() WHERE id=$1 RETURNING *`,[id,b.type,b.slug,b.title.trim(),b.excerpt??'',b.body??'',b.cover||null,JSON.stringify(b.meta),b.seo_title||null,b.seo_description||null,b.published])
    invalidateContent(); return rows[0]
  } catch(e:any) {if(e.code==='23505')throw createError({statusCode:409,message:'Этот адрес уже занят'}); throw e}
})
