import { seedGames } from '../data/games'
import { ARTICLES, fillCity } from '../../shared/seo-pages'
import { referenceLibrary } from '../data/reference-library'
import { referenceDrafts } from '../data/reference-drafts'

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
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_note TEXT NOT NULL DEFAULT '';
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'extended';
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS request_id UUID;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS request_hash TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS bookings_request_id_idx ON bookings(request_id) WHERE request_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS bookings_created_idx ON bookings(created_at DESC);
      CREATE TABLE IF NOT EXISTS admin_sessions (id UUID PRIMARY KEY, expires_at TIMESTAMPTZ NOT NULL);
      CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now());
      CREATE TABLE IF NOT EXISTS site_content (
        section TEXT PRIMARY KEY,
        content JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS media_assets (
        key TEXT PRIMARY KEY, mime TEXT NOT NULL, width INTEGER, height INTEGER,
        alt TEXT NOT NULL DEFAULT '', created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      -- Сохраняем исторические броски
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS roll INTEGER;
      ALTER TABLE bookings ADD COLUMN IF NOT EXISTS bonus BOOLEAN NOT NULL DEFAULT false;
    `)

    const seedClient = await db.connect()
    try {
      await seedClient.query('BEGIN')
      await seedClient.query("SELECT pg_advisory_xact_lock(81624190)")
      const applied = await seedClient.query("SELECT 1 FROM schema_migrations WHERE name='seed-games-v1'")
      if (!applied.rowCount) {
        const { rows } = await seedClient.query("SELECT count(*)::int AS n FROM posts WHERE type='game'")
        if (rows[0].n === 0) {
          for (const g of seedGames) {
            await seedClient.query(
              `INSERT INTO posts (type, slug, title, excerpt, body, cover, meta, seo_title, seo_description)
               VALUES ('game',$1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(slug) DO NOTHING`,
              [g.slug,g.title,g.excerpt,g.body,g.cover??null,JSON.stringify(g.meta),g.seoTitle,g.seoDescription]
            )
          }
        }
        await seedClient.query("INSERT INTO schema_migrations(name) VALUES('seed-games-v1')")
      }
      const articleSeed = await seedClient.query("SELECT 1 FROM schema_migrations WHERE name='seed-articles-v1'")
      if (!articleSeed.rowCount) {
        const cfg=useRuntimeConfig().public
        const fill=(text:string)=>fillCity(text,String(cfg.cityIn),String(cfg.city))
        for (const article of ARTICLES) {
          const body=[article.intro,...article.sections.map(section=>[section.h2,section.text,...(section.list??[])].join('\n')),...(article.faq??[]).map(item=>`${item.q}\n${item.a}`)].join('\n\n')
          await seedClient.query(`INSERT INTO posts(type,slug,title,excerpt,body,seo_title,seo_description,published) VALUES('article',$1,$2,$3,$4,$5,$6,true) ON CONFLICT(slug) DO NOTHING`,[article.slug,fill(article.h1),fill(article.description),body.replaceAll('{city}',String(cfg.cityIn)).replaceAll('{cityName}',String(cfg.city)),fill(article.title),fill(article.description)])
        }
        await seedClient.query("INSERT INTO schema_migrations(name) VALUES('seed-articles-v1')")
      }
      const referenceSeed=await seedClient.query("SELECT 1 FROM schema_migrations WHERE name='seed-reference-drafts-v1'")
      if (!referenceSeed.rowCount) {
        for(const draft of referenceDrafts) {
          const meta={category:draft.category,edition:draft.edition,sources:draft.sources,wordstatVerified:false}
          await seedClient.query(`INSERT INTO posts(type,slug,title,excerpt,body,meta,published) VALUES('reference',$1,$2,$3,$4,$5,false) ON CONFLICT(slug) DO NOTHING`,[draft.slug,draft.title,draft.excerpt,draft.body,JSON.stringify(meta)])
        }
        await seedClient.query("INSERT INTO schema_migrations(name) VALUES('seed-reference-drafts-v1')")
      }
      const refresh = await seedClient.query("SELECT 1 FROM schema_migrations WHERE name='nri-public-refresh-v1'")
      if (!refresh.rowCount) {
        for (const item of referenceLibrary) {
          await seedClient.query(`INSERT INTO posts(type,slug,title,excerpt,body,meta,published) VALUES('reference',$1,$2,$3,$4,$5,true) ON CONFLICT(slug) DO NOTHING`,[item.slug,item.title,item.excerpt,item.body,JSON.stringify(item.meta)])
        }
        await seedClient.query(`UPDATE site_content SET content=jsonb_set(content,'{text}',to_jsonb($1::text)) WHERE section='club'`,['Клуб настольных ролевых игр в Белгороде с несколькими мастерами. Выбирайте истории и форматы по интересам. Ведущие помогают новичкам, готовят приключения и проводят партии; дату и ведущего согласуем при записи.'])
        // Update only known club photographs, including CMS content and post galleries.
        const replacements = [
          ['/photos/hero-master.webp','/photos/hero-room.webp'],['/photos/hero-maps.webp','/photos/hero-room.webp'],['/photos/hero-girl.webp','/photos/hero-room.webp'],
          ['/photos/g-master.webp','/photos/g-room.webp'],['/photos/g-maps.webp','/photos/g-shelves.webp'],['/photos/g-girl.webp','/photos/g-minis.webp'],['/photos/g-axe.webp','/photos/g-shelves.webp'],['/photos/master.webp','/photos/g-shelves.webp'],
          ['Участник клуба с книгой правил и игровым реквизитом','Книги правил и игровые материалы'],['Ведущий проводит игру за ширмой мастера','Игровая комната клуба'],['Участница игры с реквизитом за игровым столом','Коллекция миниатюр'],['Ведущий показывает карты игровых миров','Книги правил и настольные игры'],['+79040901764','+79999999999'],['+7 (904) 090-17-64','+7 (999) 999-99-99'],
          ['01-master-axe-','02-books-'],['03-game-master-','06-room-'],['04-player-','05-miniatures-'],['07-world-maps-','02-books-']
        ]
        for(const [before,after] of replacements) {
          await seedClient.query('UPDATE site_content SET content=replace(content::text,$1,$2)::jsonb WHERE strpos(content::text,$1)>0',[before,after])
          await seedClient.query(`UPDATE posts SET cover=replace(cover,$1,$2), meta=replace(meta::text,$1,$2)::jsonb WHERE strpos(COALESCE(cover,'') || meta::text,$1)>0`,[before,after])
        }
        await seedClient.query("INSERT INTO schema_migrations(name) VALUES('nri-public-refresh-v1')")
      }
      await seedClient.query('COMMIT')
    } catch (e) {
      await seedClient.query('ROLLBACK')
      throw e
    } finally { seedClient.release() }
    console.log('[db] миграции ок')
  } catch (e: any) {
    console.error('[db] ошибка миграции:', e.message)
  }
})
