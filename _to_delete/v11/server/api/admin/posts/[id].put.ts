export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const b = await readBody<any>(event)
  const { rows } = await useDb().query(
    `UPDATE posts SET type=$2, slug=$3, title=$4, excerpt=$5, body=$6, cover=$7, meta=$8, seo_title=$9, seo_description=$10, published=$11, updated_at=now()
     WHERE id=$1 RETURNING *`,
    [id, b.type, slugify(b.slug || b.title), b.title, b.excerpt ?? '', b.body ?? '', b.cover || null, JSON.stringify(b.meta ?? {}), b.seo_title || null, b.seo_description || null, b.published !== false]
  )
  if (!rows[0]) throw createError({ statusCode: 404 })
  return rows[0]
})
