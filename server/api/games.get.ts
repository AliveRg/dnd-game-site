import { seedGames } from '../data/games'

// Точки на карте по умолчанию берём из стартовых данных, если в админке их ещё не задали
const defaultMap = (slug: string) => seedGames.find((g) => g.slug === slug)?.meta.map
const seed = () => seedGames.map((g, i) => ({ id: i + 1, type: 'game', slug: g.slug, title: g.title, excerpt: g.excerpt, cover: g.cover ?? null, meta: g.meta }))

export default defineEventHandler(async () =>
  dashless(await cachedDb(
    'games',
    60_000,
    async () => {
      const { rows } = await useDb().query(`SELECT id, type, slug, title, excerpt, cover, meta FROM posts WHERE type = 'game' AND published ORDER BY id`)
      return rows.map((r) => ({ ...r, meta: { ...r.meta, map: r.meta?.map ?? defaultMap(r.slug) } }))
    },
    seed // Cold-start outage uses the original public catalog; a cached DB result (even []) wins.
  ))
)
