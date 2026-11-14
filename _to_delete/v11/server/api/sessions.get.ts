import { seedGames } from '../data/games'

// Ближайшие открытые партии с количеством свободных мест (для календаря записи)
export default defineEventHandler(async () => dashless(await cachedDb('sessions', 15_000, load, () => [])))

async function load() {
  const { rows } = await useDb().query(`
    SELECT s.id, s.starts_at, s.duration_h, s.max_players, s.price, s.is_weekly, s.note,
           p.slug AS game_slug, p.title AS game_title, p.excerpt AS game_excerpt, p.cover AS game_cover, p.meta AS game_meta,
           GREATEST(s.max_players - COALESCE(SUM(b.players) FILTER (WHERE b.status <> 'cancelled'), 0), 0)::int AS seats_left
    FROM game_sessions s
    LEFT JOIN posts p ON p.id = s.game_id
    LEFT JOIN bookings b ON b.session_id = s.id
    WHERE s.status = 'open' AND s.starts_at > now()
    GROUP BY s.id, p.id
    ORDER BY s.starts_at
    LIMIT 60`)
  // точка на карте по умолчанию - из стартовых данных
  return rows.map((r) => ({ ...r, game_meta: { ...(r.game_meta ?? {}), map: r.game_meta?.map ?? seedGames.find((g) => g.slug === r.game_slug)?.meta.map } }))
}
