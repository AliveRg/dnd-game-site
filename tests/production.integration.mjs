// Real HTTP smoke flow against a built Nitro bundle, isolated local PG schema and local fake S3.
// Run explicitly with TEST_DATABASE_URL pointing ONLY to localhost and Node >=22.
import assert from 'node:assert/strict'
import {spawn} from 'node:child_process'
import {createServer} from 'node:http'
import {once} from 'node:events'
import {randomUUID} from 'node:crypto'
import pg from 'pg'
const database=new URL(process.env.TEST_DATABASE_URL||'')
assert.ok(['127.0.0.1','localhost'].includes(database.hostname),'Only an explicit localhost TEST_DATABASE_URL is accepted')
const pool=new pg.Pool({connectionString:database.href})
const schema='bundle_'+randomUUID().replaceAll('-','')
await pool.query(`CREATE SCHEMA ${schema}`)
database.searchParams.set('options',`-c search_path=${schema}`)
const s3Objects=new Map()
const s3=createServer(async(req,res)=>{
 const chunks=[];for await(const chunk of req)chunks.push(chunk)
 if(req.method==='PUT'){s3Objects.set(new URL(req.url,'http://localhost').pathname,{body:Buffer.concat(chunks),type:req.headers['content-type']});res.statusCode=200;res.setHeader('ETag','"test"');res.end();return}
 const value=s3Objects.get(new URL(req.url,'http://localhost').pathname)
 if(value){res.setHeader('Content-Type',value.type);res.end(value.body)}else{res.statusCode=404;res.end()}
})
s3.listen(0,'127.0.0.1');await once(s3,'listening')
const probe=createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');const port=probe.address().port;await new Promise(resolve=>probe.close(resolve))
const base=`http://127.0.0.1:${port}`
const child=spawn(process.execPath,['.output/server/index.mjs'],{env:{...process.env,NODE_ENV:'production',HOST:'127.0.0.1',PORT:String(port),NITRO_PORT:String(port),NUXT_PUBLIC_SITE_URL:base,NUXT_DATABASE_URL:process.env.TEST_QUOTED_DATABASE_URL==='true'?JSON.stringify(database.href):database.href,NUXT_DB_SSL:'false',NUXT_ADMIN_LOGIN:'test-admin',NUXT_ADMIN_PASSWORD:'local-only-integration-password',NUXT_SESSION_PASSWORD:'integration-session-password-with-more-than-thirty-two-characters',NUXT_S3_ENDPOINT:`http://127.0.0.1:${s3.address().port}`,NUXT_S3_BUCKET:'test-images',NUXT_S3_REGION:'ru-1',NUXT_S3_ACCESS_KEY:'TESTACCESSKEY',NUXT_S3_SECRET_KEY:'test-secret-local-only'},stdio:['ignore','pipe','pipe']})
let logs='';child.stdout.on('data',data=>logs+=data);child.stderr.on('data',data=>logs+=data)
const jar=new Map()
async function call(path,{method='GET',body,cookie=true,origin=base}={}){
 const headers={};if(method!=='GET')headers.Origin=origin;if(cookie&&jar.size)headers.Cookie=[...jar].map(([k,v])=>`${k}=${v}`).join('; ')
 if(body&&!(body instanceof FormData)){headers['Content-Type']='application/json';body=JSON.stringify(body)}
 const response=await fetch(base+path,{method,headers,body,redirect:'manual'})
 for(const value of response.headers.getSetCookie()){const [pair]=value.split(';');const i=pair.indexOf('=');jar.set(pair.slice(0,i),pair.slice(i+1))}
 const text=await response.text();let data;try{data=JSON.parse(text)}catch{data=text}
 return{status:response.status,data,headers:response.headers}
}
try{
 let started=false
 for(let attempt=0;attempt<100;attempt++){try{const r=await call('/api/health');if(r.status===200){started=true;break}}catch{}await new Promise(resolve=>setTimeout(resolve,100))}
 assert.ok(started,logs)
 assert.equal((await call('/generator-geroya')).status,200)
 assert.equal((await call('/api/admin/posts',{cookie:false})).status,401)
 assert.equal((await call('/api/admin/login',{method:'POST',body:{login:'test-admin',password:'local-only-integration-password'}})).status,200)
 const originalCookie=[...jar].map(([k,v])=>`${k}=${v}`).join('; ')
 const bookingBody={name:'HTTP Тест',contact:'+79040901764',comment:'Тест заявки',tariff:'promo4',players:2,invitedBy:'Друг',source:'extended',consent:true,requestId:randomUUID()}
 const b=await call('/api/booking',{method:'POST',body:bookingBody});assert.equal(b.status,200);assert.ok(b.data.id)
 assert.equal((await call('/api/booking',{method:'POST',body:bookingBody})).data.id,b.data.id)
 const list=await call('/api/admin/bookings?page=1&pageSize=20');assert.equal(list.status,200);assert.equal(list.data.total,1);assert.equal(list.data.unread,1);assert.match(list.headers.get('cache-control'),/no-store/)
 assert.equal((await call(`/api/admin/bookings/${b.data.id}`)).data.viewed_at,null)
 const mark=await call(`/api/admin/bookings/${b.data.id}`,{method:'PUT',body:{viewed:true,status:'confirmed',admin_note:'HTTP заметка'}});assert.equal(mark.status,200);assert.ok(mark.data.viewed_at)
 const corrupt=await call('/api/admin/posts',{method:'POST',body:{type:'game',title:'Bad metadata',meta:{genres:'invalid'}}});assert.equal(corrupt.status,400)
 const post=await call('/api/admin/posts',{method:'POST',body:{type:'reference',title:'HTTP справочник',slug:'http-integration-reference',body:'Проверенный текст',excerpt:'Короткое описание',published:false,meta:{edition:'2014',category:'Тест',sources:'https://www.dndbeyond.com/srd',gallery:[]}}});assert.equal(post.status,200)
 assert.equal((await call('/api/posts/http-integration-reference')).status,404)
 const publish=await call(`/api/admin/posts/${post.data.id}`,{method:'PUT',body:{...post.data,published:true}});assert.equal(publish.status,200)
 assert.equal((await call('/api/posts/http-integration-reference')).status,200)
 assert.equal((await call('/spravochnik/http-integration-reference')).status,200)
 assert.equal((await call('/news/http-integration-reference')).status,404)
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64')
 const multipart=new FormData();multipart.append('file',new Blob([png],{type:'image/png'}),'test.png')
 const uploaded=await call('/api/admin/upload',{method:'POST',body:multipart});assert.equal(uploaded.status,200,JSON.stringify(uploaded.data));assert.match(uploaded.data.url,/^\/media\/uploads\//)
 assert.equal((await call(uploaded.data.url)).status,200)
 const content={title:'HTTP Клуб',text:'Редактирование проверено',images:[{url:'/images/club/01-master-axe-960.webp',alt:'Оригинальное фото'},{url:uploaded.data.url,alt:'Тестовая загрузка'}]}
 assert.equal((await call('/api/admin/site-content',{method:'PUT',body:{section:'club',content}})).status,200)
 const publicContent=await call('/api/site-content');assert.equal(publicContent.data.club.title,content.title);assert.equal(publicContent.data.club.images.length,2)
 assert.equal((await call('/klub')).status,200)
 assert.equal((await call('/api/admin/site-content',{method:'PUT',origin:'https://evil.test',body:{section:'club',content}})).status,403)
 const calendarBody={...bookingBody,contact:'calendar@example.test',requestId:randomUUID()}
 const calendar=await call('/api/calendar-booking',{method:'POST',body:calendarBody});assert.equal(calendar.status,200);assert.ok(calendar.data.id)
 assert.equal((await call('/api/calendar-booking',{method:'POST',body:calendarBody})).data.id,calendar.data.id)
 assert.equal((await call('/api/calendar-booking',{method:'POST',body:{...calendarBody,requestId:randomUUID(),consent:'true'}})).status,400)
 assert.equal((await call('/api/calendar-booking',{method:'POST',body:{...calendarBody,requestId:randomUUID(),players:1.5}})).status,400)
 assert.equal((await call('/api/admin/logout',{method:'POST'})).status,200)
 const replay=await fetch(base+'/api/admin/posts',{headers:{Cookie:originalCookie}});assert.equal(replay.status,401)
 console.log('PASS: production HTTP auth, persistence/idempotency, pagination/read/status/note, metadata rejection, draft/publication, canonical type guard, S3 mock upload/media, page-gallery editing, CSRF and revoked-cookie replay')
}finally{
 child.kill('SIGTERM');await once(child,'exit').catch(()=>{})
 s3.closeAllConnections();await new Promise(resolve=>s3.close(()=>resolve()))
 await pool.query(`DROP SCHEMA ${schema} CASCADE`);await pool.end()
 if(logs.includes('ERROR')||logs.includes('[db] ошибка'))console.error(logs)
}
