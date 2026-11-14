import { seedGames } from '../data/games'

// Создаёт таблицы при старте и заливает стартовые сюжеты, если таблица пустая.
export default defineNitroPlugin(async () => {
  if (!isDbConfigured()) {
    console.warn('[db] NUXT_DATABASE_URL не задан - сайт работает без БД (заявки и админка отключены)')
    return
  }
  const db = useDb()
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id           SERIAL PRIMARY KEY,
        type         TEXT NOT NULL DEFAULT 'news',        -- game | news | article | novelty
        slug         TEXT NOT NULL UNIQUE,
        title        TEXT NOT NULL,
        excerpt      TEXT NOT NULL DEFAULT '',
        body         TEXT NOT NULL DEFAULT '',            -- markdown/простой текст
        cover        TEXT,                                -- ключ в S3 или /images/...
        meta         JSONB NOT NULL DEFAULT '{}'::jsonb,  -- система, игроки, уровень, жанры, 18+ и т.д.
        seo_title    TEXT,
        seo_description TEXT,
        published    BOOLEAN NOT NULL DEFAULT true,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS game_sessions (
        id           SERIAL PRIMARY KEY,
        game_id      INTEGER REFERENCES posts(id) ON DELETE SET NULL,
        starts_at    TIMESTAMPTZ NOT NULL,
        duration_h   NUMERIC(3,1) NOT NULL DEFAULT 4,
        max_players  INTEGER NOT NULL DEFAULT 5 CHECK (max_players BETWEEN 1 AND 10),
        price        INTEGER NOT NULL DEFAULT 2000,
        is_weekly    BOOLEAN NOT NULL DEFAULT false,      -- "история недели"
        note         TEXT NOT NULL DEFAULT '',
        status       TEXT NOT NULL DEFAULT 'open',        -- open | closed | cancelled
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS game_sessions_starts_idx ON game_sessions(starts_at);

      CREATE TABLE IF NOT EXISTS bookings (
        id           SERIAL PRIMARY KEY,
        session_id   INTEGER REFERENCES game_sessions(id) ON DELETE SET NULL,
        name         TEXT NOT NULL,
        contact      TEXT NOT NULL,
        players      INTEGER NOT NULL DEFAULT 1,
        tariff       TEXT NOT NULL DEFAULT 'promo4',
        invited_by   TEXT NOT NULL DEFAULT '',
        friends      INTEGER NOT NULL DEFAULT 0,
        comment      TEXT NOT NULL DEFAULT '',
        utm          JSONB NOT NULL DEFAULT '{}'::jsonb,
        status       TEXT NOT NULL DEFAULT 'new',          -- new | confirmed | cancelled
        created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      -- бросок d20 при записи
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS roll INTEGER;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bonus BOOLEAN NOT NULL DEFAULT false;
    `)

    const { rows } = await db.query(`SELECT count(*)::int AS n FROM posts WHERE type = 'game'`)
    if (rows[0].n === 0) {
      for (const g of seedGames) {
        await db.query(
          `INSERT INTO posts (type, slug, title, excerpt, body, cover, meta, seo_title, seo_description)
           VALUES ('game', $1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (slug) DO NOTHING`,
          [g.slug, g.title, g.excerpt, g.body, g.cover ?? null, JSON.stringify(g.meta), g.seoTitle, g.seoDescription]
        )
      }
      console.log(`[db] залито стартовых сюжетов: ${seedGames.length}`)
    }
    console.log('[db] миграции ок')
  } catch (e: any) {
    console.error('[db] ошибка миграции:', e.message)
  }
})
