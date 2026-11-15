import { seedGames } from '../../data/games'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const seedOne = () => {
    const g = seedGames.find((x) => x.slug === slug)
    return g ? { id: 0, type: 'game', ...g, seo_title: g.seoTitle, seo_description: g.seoDescription } : null
  }
  // БД недоступна → стартовые данные сюжета, без ожидания
  const row = await cachedDb(`post:${slug}`, 60_000, async () => (await useDb().query(`SELECT * FROM posts WHERE slug = $1 AND published`, [slug])).rows[0] ?? null, () => isDbConfigured() ? null : seedOne())
  if (!row) throw createError({ statusCode: 404, message: 'Не найдено' })
  return dashless(row)
})
