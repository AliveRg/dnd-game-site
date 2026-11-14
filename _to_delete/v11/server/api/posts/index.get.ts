// /api/posts?type=news|article|novelty&limit=12
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const type = String(q.type || 'news')
  const limit = Math.min(Number(q.limit) || 12, 50)
  const rows = await cachedDb(
    `posts:${type}:${limit}`,
    60_000,
    async () =>
      (await useDb().query(
        `SELECT id, type, slug, title, excerpt, cover, meta, created_at FROM posts
         WHERE type = $1 AND published ORDER BY created_at DESC LIMIT $2`,
        [type, limit]
      )).rows,
    () => []
  )
  return dashless(rows)
})
