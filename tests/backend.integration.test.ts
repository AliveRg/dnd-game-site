import {test} from 'node:test'
import assert from 'node:assert/strict'
import {randomUUID} from 'node:crypto'
import pg from 'pg'
import * as h3 from 'h3'
import {createServer,request} from 'node:http'
import {readBoundedBody} from '../server/utils/request-body.ts'

const configured=Boolean(process.env.TEST_DATABASE_URL)
test('bounded streaming reader rejects chunked requests above ceiling',async()=>{
 const server=createServer(async(req,res)=>{try{const body=await readBoundedBody(req,32);res.end(String(body.length))}catch(e:any){res.statusCode=e.statusCode||500;res.end('too large')}})
 await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve))
 try{
  const port=(server.address() as any).port
  const status=await new Promise<number>((resolve,reject)=>{
   const req=request({host:'127.0.0.1',port,method:'POST',headers:{'transfer-encoding':'chunked'}},res=>{res.resume();res.on('end',()=>resolve(res.statusCode!))});req.on('error',reject);req.write('x'.repeat(20));req.end('y'.repeat(20))
  });assert.equal(status,413)
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()))}
})

test('real PostgreSQL migration, idempotent booking, markers and draft isolation',{skip:!configured},async()=>{
 const pool=new pg.Pool({connectionString:process.env.TEST_DATABASE_URL})
 // This test is restricted to an explicitly provided localhost test database.
 const url=new URL(process.env.TEST_DATABASE_URL!)
 assert.ok(['127.0.0.1','localhost'].includes(url.hostname),'Never run this test against a production host')
 const schema='test_'+randomUUID().replaceAll('-','')
 await pool.query(`CREATE SCHEMA ${schema}`)
 const scoped=new pg.Pool({connectionString:process.env.TEST_DATABASE_URL,options:`-c search_path=${schema}`})
 let body:any,event:any={}
 const config={public:{city:'Белгород',cityIn:'в Белгороде'}}
 Object.assign(globalThis,h3,{defineNitroPlugin:(f:any)=>f,useDb:()=>scoped,isDbConfigured:()=>true,useRuntimeConfig:()=>config,rateLimit:()=>{},readBody:async()=>body,requireAdmin:async()=>{},getRouterParam:()=>String(event.id)})
 try {
  const migration=(await import('../server/plugins/migrate.ts')).default
  await migration()
  await migration()
  const articleCount=(await scoped.query("SELECT count(*)::int n FROM posts WHERE type='article'")).rows[0].n
  assert.ok(articleCount>0)
  const drafts=(await scoped.query("SELECT * FROM posts WHERE type='reference'")).rows
  assert.equal(drafts.length,10);assert.ok(drafts.every(p=>!p.published));assert.ok(drafts.every(p=>p.meta.sources.includes('dndbeyond.com/srd')))
  const booking=(await import('../server/api/booking.post.ts')).default
  body={name:'Тестовый игрок',contact:'8 (904) 090-17-64',consent:true,source:'extended',requestId:randomUUID(),players:2,tariff:'promo4',comment:'integration test'}
  const first:any=await booking(event);assert.ok(first.id)
  assert.equal((await booking(event) as any).id,first.id)
  assert.equal((await scoped.query('SELECT count(*)::int n FROM bookings')).rows[0].n,1)
  body={...body,comment:'changed'}
  await assert.rejects(()=>booking(event),{statusCode:409})
  body={...body,requestId:randomUUID(),players:1.5}
  await assert.rejects(()=>booking(event),{statusCode:400})
  event={id:first.id}
  const get=(await import('../server/api/admin/bookings/[id].get.ts')).default
  const read:any=await get(event);assert.equal(read.viewed_at,null)
  body={viewed:true,status:'confirmed',admin_note:'Позвонить'}
  const put=(await import('../server/api/admin/bookings/[id].put.ts')).default
  const updated:any=await put(event);assert.ok(updated.viewed_at);assert.equal(updated.status,'confirmed');assert.equal(updated.admin_note,'Позвонить')
  body={viewed:false};const unread:any=await put(event);assert.equal(unread.viewed_at,null);assert.equal(unread.status,'confirmed')
  const keep=(await scoped.query("SELECT id FROM posts WHERE type='article' LIMIT 1")).rows[0]
  await scoped.query("UPDATE posts SET body='edited by admin' WHERE id=$1",[keep.id])
  await migration()
  assert.equal((await scoped.query('SELECT body FROM posts WHERE id=$1',[keep.id])).rows[0].body,'edited by admin')
  Object.assign(globalThis,{useDb:()=>({query:async()=>{throw new Error('database down')}})})
  body={name:'Тест',contact:'+79040901764',consent:true,source:'quick',requestId:randomUUID()}
  await assert.rejects(()=>booking({} as any),{statusCode:503})
 }finally{await scoped.end();await pool.query(`DROP SCHEMA ${schema} CASCADE`);await pool.end()}
})
