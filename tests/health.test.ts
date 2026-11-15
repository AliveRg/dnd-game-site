import { test } from 'node:test'
import assert from 'node:assert/strict'
let configured = false
let available = false
let queries = 0
Object.assign(globalThis, {
  defineEventHandler: (handler: unknown) => handler,
  setResponseHeader: (event: any, name: string, value: string) => { event.headers[name] = value },
  setResponseStatus: (event: any, status: number) => { event.status = status },
  isDbConfigured: () => configured,
  useDb: () => ({ query: async () => { queries++; if (!available) throw new Error('private connection failure') } })
})
const health = (await import('../server/api/health.get.ts')).default
const ready = (await import('../server/api/ready.get.ts')).default
const event = () => ({ status: 200, headers: {} as Record<string, string> })
test('liveness succeeds without querying an absent or unavailable database', async () => {
  for (const value of [false, true]) {
    configured = value; available = false; queries = 0
    const e = event()
    assert.deepEqual(await health(e as any), { ok: true })
    assert.equal(e.status, 200)
    assert.equal(e.headers['Cache-Control'], 'no-store')
    assert.equal(queries, 0)
  }
})
test('readiness distinguishes missing configuration, failed database, and working database', async () => {
  configured = false; queries = 0
  let e = event()
  assert.deepEqual(await ready(e as any), { ok: false, db: 'unconfigured' })
  assert.equal(e.status, 503); assert.equal(queries, 0)
  configured = true; available = false; e = event()
  assert.deepEqual(await ready(e as any), { ok: false, db: 'unavailable' })
  assert.equal(e.status, 503)
  available = true; e = event()
  assert.deepEqual(await ready(e as any), { ok: true, db: 'ok' })
  assert.equal(e.status, 200)
})
