import {test} from 'node:test'
import assert from 'node:assert/strict'
import {cachedDb,dropDbCache} from '../server/utils/db.ts'
let configured=true
Object.assign(globalThis,{isDbConfigured:()=>configured,useRuntimeConfig:()=>({databaseUrl:configured?'invalid': ''})})
const fail=async()=>{throw new Error('simulated unavailable database')}
test('cold outage uses public catalog fallback; successful empty list and hidden detail stay authoritative',async()=>{
 dropDbCache()
 assert.deepEqual(await cachedDb('empty-games',-1,async()=>[],()=>['original']),[])
 assert.equal(await cachedDb('hidden-post',-1,async()=>null,()=>({title:'original'})),null)
 assert.deepEqual(await cachedDb('cold-games',0,fail,()=>['original']),['original'])
 assert.deepEqual(await cachedDb('empty-games',-1,fail,()=>['original']),[])
 assert.equal(await cachedDb('hidden-post',-1,fail,()=>({title:'original'})),null)
})
