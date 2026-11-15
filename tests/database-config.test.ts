import {test} from 'node:test'
import assert from 'node:assert/strict'
import {normalizeDatabaseUrl} from '../server/utils/database-config.ts'
const url='postgresql://user:p%23%7C%2B@db.example:5432/database'
test('panel URL accepts raw, whitespace, env quotes, and copied assignment',()=>{
 for(const value of [url,`  ${url}  `,`"${url}"`,`'${url}'`,`NUXT_DATABASE_URL="${url}"`]) assert.equal(normalizeDatabaseUrl(value),url)
})
test('invalid URL is rejected without retaining raw input or password',()=>{
 for(const value of ['', 'secret-password', 'https://user:secret-password@host/db', 'postgresql://user:secret-password@host/db#raw-password', 'postgresql://host']) {
  assert.throws(()=>normalizeDatabaseUrl(value),(e:any)=>{
   assert.equal(e.statusCode,503);assert.equal(e.cause?.input,undefined)
   assert.ok(!JSON.stringify(e).includes('secret-password'));assert.ok(!String(e).includes('secret-password'));return true
  })
 }
})

test('raw reserved characters in panel passwords are encoded without changing credentials',()=>{
 const raw='postgresql://user:A<6#|_raw+@db.example:5432/database'
 const normalized=normalizeDatabaseUrl(raw)
 const parsed=new URL(normalized)
 assert.equal(decodeURIComponent(parsed.password),'A<6#|_raw+')
 assert.equal(parsed.hostname,'db.example')
 assert.equal(parsed.hash,'')
 assert.ok(normalized.includes('%23'))
 assert.equal(normalizeDatabaseUrl(normalized),normalized)
 assert.throws(()=>normalizeDatabaseUrl('postgresql://user:password@host/db#fragment'),{statusCode:503})
})
