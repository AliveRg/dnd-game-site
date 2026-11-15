import {test} from 'node:test'
import assert from 'node:assert/strict'
import {validatePostMeta,validateSiteContent,validatePost} from '../server/utils/content.ts'

test('rejects malformed public-consumer metadata before database writes',()=>{
 for(const value of [{genres:'хоррор'},{genres:[12]},{gallery:'not an array'},{gallery:[{url:'/images/test.webp',alt:42}]},{gallery:[{url:'https://evil.test/a.webp',alt:'bad'}]},{edition:{}},{category:[]},{sources:['https://example.test']},{map:{x:'zero',y:2}},{adult:'false'},{accent:'url(javascript:x)'},{coverAlt:{}}]) assert.throws(()=>validatePostMeta(value),{statusCode:400})
 // Full API validator calls metadata validation before any DB insert/update.
 Object.assign(globalThis,{slugify:(s:string)=>s.toLowerCase().replaceAll(' ','-')})
 assert.throws(()=>validatePost({type:'game',title:'Example',meta:{genres:'broken'}}),{statusCode:400})
})
test('accepts typed game/reference fields and gallery',()=>{
 const meta={genres:['хоррор'],gallery:[{url:'/images/club/01-master-axe-960.webp',alt:'Участник'}],edition:'2014',category:'Основы',sources:'https://www.dndbeyond.com/srd',map:{x:200,y:300},adult:false,accent:'#123456'}
 assert.deepEqual(validatePostMeta(meta),meta)
})
test('site content allows default gallery editing while preserving order and rejecting invalid fields',()=>{
 const images=[{url:'/images/club/01-master-axe-960.webp',alt:'Первое фото'},{url:'/media/uploads/test.webp',alt:'Второе фото'}]
 assert.deepEqual(validateSiteContent('club',{title:'Клуб',images}).images,images)
 assert.deepEqual(validateSiteContent('club',{images:[]}).images,[])
 assert.throws(()=>validateSiteContent('club',{images:[{url:'/images/test.webp',alt:null}]}),{statusCode:400})
 assert.throws(()=>validateSiteContent('privacy',{text:'changed'}),{statusCode:400})
})
