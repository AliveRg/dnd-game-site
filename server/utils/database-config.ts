import { createError } from 'h3'

/** Panel fields sometimes receive the quotes or assignment from an env file. */
export function normalizeDatabaseUrl(input: unknown): string {
  let value = typeof input === 'string' ? input.trim() : ''
  if (value.startsWith('NUXT_DATABASE_URL=')) value = value.slice('NUXT_DATABASE_URL='.length).trim()
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
  try {
    const url = new URL(value)
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.pathname.length < 2 || url.hash) throw new Error('invalid database URL')
    return value
  } catch {
    // Never expose URL.input/cause: it can contain the database password.
    throw createError({ statusCode: 503, statusMessage: 'Database configuration error', message: 'Некорректная NUXT_DATABASE_URL. Укажите PostgreSQL URL с кодированным паролем.' })
  }
}
