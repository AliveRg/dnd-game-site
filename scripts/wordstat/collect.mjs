// Bounded Wordstat research; credentials are local-only. No made-up counts.
import fs from 'node:fs/promises'
import path from 'node:path'
const root = path.resolve(import.meta.dirname, '../..')
const key = process.env.WORDSTAT_API_KEY, folderId = process.env.WORDSTAT_FOLDER_ID
if (!key || !folderId) throw new Error('Set WORDSTAT_API_KEY and WORDSTAT_FOLDER_ID')
const base = 'https://searchapi.api.cloud.yandex.net/v2/wordstat/'
const raw = path.join(root, 'seo/raw')
await fs.mkdir(raw, { recursive: true })
async function call(method, body, attempt = 0) {
 const res = await fetch(base + method, { method:'POST', headers:{Authorization:`Api-Key ${key}`,'Content-Type':'application/json'}, body:JSON.stringify({folderId,...body}), signal:AbortSignal.timeout(30000) })
 if ((res.status===429 || res.status>=500) && attempt<2) { await new Promise(r=>setTimeout(r,1000*(attempt+1))); return call(method,body,attempt+1) }
 const data = await res.json().catch(()=>({}))
 if (!res.ok) throw new Error(`Wordstat HTTP ${res.status}: ${String(data.message || data.error?.message || 'request failed').replaceAll(key,'[redacted]')}`)
 return data
}
const stamp = new Date().toISOString()
const diagnostic = await call('topRequests',{phrase:'днд',numPhrases:'20',regions:['225'],devices:['DEVICE_ALL']})
await fs.writeFile(path.join(raw,'diagnostic.json'),JSON.stringify(diagnostic,null,2))
if (process.argv.includes('--diagnostic')) { console.log('Wordstat diagnostic OK; raw response saved locally'); process.exit(0) }
// Verify Belgorod against official region response before collecting local queries.
const regions = await call('getRegionsTree',{})
await fs.writeFile(path.join(raw,'regions.json'),JSON.stringify(regions,null,2))
function findRegion(x) { if (!x || typeof x!=='object') return; if (/^белгород$/i.test(x.label||x.name||x.regionName||'')) return String(x.id||x.regionId); for (const v of Object.values(x)) { if (v && typeof v==='object') { const found=findRegion(v); if(found)return found } } }
const belgorod = findRegion(regions)
if (!belgorod) throw new Error('Belgorod not verified in region tree; local collection stopped')
const seeds=JSON.parse(await fs.readFile(path.join(import.meta.dirname,'seeds.json'),'utf8')).slice(0,Math.min(30,Number(process.env.WORDSTAT_MASK_LIMIT||30)))
const rows=[]
for (let i=0;i<seeds.length;i++) {
 const seed=seeds[i], region=/белгород/i.test(seed.phrase)?belgorod:'225'
 const data=await call('topRequests',{phrase:seed.phrase,numPhrases:'100',regions:[region],devices:['DEVICE_ALL']})
 await fs.writeFile(path.join(raw,`mask-${i}.json`),JSON.stringify(data,null,2))
 for (const hit of data.results||[]) rows.push({phrase:hit.phrase,count:Number(hit.count),match_type:'broad',region,period:'API statistics unavailable after 2026-10-07',fetched_at:stamp,seed:seed.phrase,cluster:region===belgorod?'local':'reference',proposed_url:region===belgorod?'/dnd-belgorod':'/spravochnik'})
 await new Promise(r=>setTimeout(r,400))
}
const exactLimit=Math.min(20,Number(process.env.WORDSTAT_EXACT_LIMIT||20))
const unique=[...new Map(rows.map(x=>[`${x.region}:${x.phrase}`,x])).values()].sort((a,b)=>b.count-a.count)
for (const row of unique.slice(0,exactLimit)) {
 const phrase='"'+row.phrase.split(/\s+/).map(x=>'!'+x).join(' ')+'"'
 const data=await call('topRequests',{phrase,numPhrases:'1',regions:[row.region],devices:['DEVICE_ALL']})
 rows.push({...row,count:Number(data.totalCount),match_type:'exact'})
}
const keys=['phrase','count','match_type','region','period','fetched_at','seed','cluster','proposed_url']
const csv=[keys.join(','),...rows.map(row=>keys.map(k=>'"'+String(row[k]??'').replaceAll('"','""')+'"').join(','))].join('\n')
await fs.writeFile(path.join(root,'seo/wordstat-report.csv'),csv)
console.log(`Saved ${rows.length} measured rows (historic availability limit stated in CSV)`)
