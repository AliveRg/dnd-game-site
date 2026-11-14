const TYPES = ['game', 'news', 'article', 'novelty']

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const b = await readBody<any>(event)
  if (!b.title) throw createError({ statusCode: 400, message: 'Нужен заголовок' })
  const type = TYPES.includes(b.type) ? b.type : 'news'
  const slug = slugify(b.slug || b.title) || `post-${Date.now()}`
  const { rows } = await useDb().query(
    `INSERT INTO posts (type, slug, title, excerpt, body, cover, meta, seo_title, seo_description, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [type, slug, b.title, b.excerpt ?? '', b.body ?? '', b.cover || null, JSON.stringify(b.meta ?? {}), b.seo_title || null, b.seo_description || null, b.published !== false]
  )
  return rows[0]
})
