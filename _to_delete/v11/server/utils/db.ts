import pg from 'pg'
import { TIMEWEB_CA } from './timeweb-ca'

let pool: pg.Pool | null = null

export function useDb(): pg.Pool {
  if (pool) return pool
  const config = useRuntimeConfig()
  if (!config.databaseUrl) {
    throw createError({ statusCode: 503, message: 'База данных не настроена (NUXT_DATABASE_URL)' })
  }
  pool = new pg.Pool({
    connectionString: config.databaseUrl,
    // NUXT_DB_SSL=true → SSL с проверкой сертификата Timeweb (аналог sslmode=verify-full)
    ssl: String(config.dbSsl) === 'true' ? { ca: TIMEWEB_CA, rejectUnauthorized: true } : undefined,
    max: 5,
    idleTimeoutMillis: 30_000,
    // Не висим, если БД недоступна (например, локально без белого IP): быстрый отказ → сайт берёт запасные данные
    connectionTimeoutMillis: 4000,
    query_timeout: 8000
  })
  pool.on('error', (e) => console.error('[db] pool error', e.message))
  return pool
}

export function isDbConfigured() {
  return Boolean(useRuntimeConfig().databaseUrl)
}

export function slugify(input: string) {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k',
    л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c',
    ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
  }
  return input
    .toLowerCase()
    .split('')
    .map((c) => map[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// Кэш ответов + «предохранитель»: если БД только что не ответила, 30 с не ждём её снова, сразу отдаём запасной вариант.
// Так переходы по страницам не тормозят, даже когда БД недоступна.
const cache = new Map<string, { at: number; value: any }>()
let dbDownUntil = 0
export async function cachedDb<T>(key: string, ttlMs: number, load: () => Promise<T>, fallback: () => T): Promise<T> {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.value
  if (!isDbConfigured() || Date.now() < dbDownUntil) return hit?.value ?? fallback()
  try {
    const value = await load()
    cache.set(key, { at: Date.now(), value })
    return value
  } catch (e: any) {
    console.error(`[${key}] БД недоступна:`, e.message)
    dbDownUntil = Date.now() + 30_000
    return hit?.value ?? fallback()
  }
}
export function dropDbCache(prefix = '') {
  for (const k of cache.keys()) if (k.startsWith(prefix)) cache.delete(k)
}

// На сайте только обычный дефис: длинные тире из текстов в БД (их могли вставить в админке) заменяем при выдаче
export function dashless<T>(v: T): T {
  if (typeof v === 'string') return v.replace(/[—–−]/g, '-') as T
  if (Array.isArray(v)) return v.map(dashless) as T
  if (v && typeof v === 'object' && !(v instanceof Date)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dashless(x)])) as T
  return v
}
