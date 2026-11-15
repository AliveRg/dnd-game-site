export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = validatePost(await readBody(event))
  try {
    const {rows} = await useDb().query(`INSERT INTO posts(type,slug,title,excerpt,body,cover,meta,seo_title,seo_description,published) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,[b.type,b.slug,b.title.trim(),b.excerpt??'',b.body??'',b.cover||null,JSON.stringify(b.meta),b.seo_title||null,b.seo_description||null,b.published])
    invalidateContent()
    return rows[0]
  } catch(e:any) { if(e.code==='23505') throw createError({statusCode:409,message:'Этот адрес уже занят'}); throw e }
})
