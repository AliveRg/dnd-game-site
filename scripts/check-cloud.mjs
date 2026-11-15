// Read-only checks; does not start Nuxt/migrations or print credentials.
import pg from 'pg'
import { S3Client, HeadBucketCommand } from '@aws-sdk/client-s3'
import fs from 'node:fs/promises'
const text = await fs.readFile(new URL('../server/utils/timeweb-ca.ts',import.meta.url),'utf8')
const ca = text.match(/`([\s\S]*?)`/)?.[1]
if (!ca) throw new Error('Timeweb CA is missing')
const db = new pg.Client({connectionString:process.env.NUXT_DATABASE_URL,ssl:{ca,rejectUnauthorized:true},connectionTimeoutMillis:10000,query_timeout:10000})
try { await db.connect(); await db.query('BEGIN READ ONLY'); const r=await db.query("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"); console.log('PostgreSQL TLS OK; tables:',r.rows.map(x=>x.tablename).join(', ')||'(empty)'); await db.query('ROLLBACK') } catch(e) { console.log('PostgreSQL connection failed:',e.code||e.name);process.exitCode=1 } finally { await db.end().catch(()=>{}) }
const s3=new S3Client({endpoint:process.env.NUXT_S3_ENDPOINT,region:process.env.NUXT_S3_REGION,forcePathStyle:true,credentials:{accessKeyId:process.env.NUXT_S3_ACCESS_KEY,secretAccessKey:process.env.NUXT_S3_SECRET_KEY},requestHandler:{connectionTimeout:10000,requestTimeout:10000},maxAttempts:1})
try { await s3.send(new HeadBucketCommand({Bucket:process.env.NUXT_S3_BUCKET})); console.log('S3 HeadBucket OK') }catch(e){console.log('S3 connection failed:',e.name,e.$metadata?.httpStatusCode||'');process.exitCode=1}finally{s3.destroy()}
