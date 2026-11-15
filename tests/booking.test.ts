import {test} from 'node:test'
import assert from 'node:assert/strict'
import {validateBooking,normalizePhone} from '../shared/utils/booking.ts'
const good={name:'Иван',contact:'8 (904) 090-17-64',consent:true,source:'extended',requestId:'7fa4abbb-0e5a-4c89-bb51-3d422f604277',players:2,tariff:'promo4'}
test('phone normalizes Russian and international numbers',()=>{
 assert.equal(normalizePhone(good.contact),'+79040901764')
 assert.equal(normalizePhone('+44 20 7946 0958'),'+442079460958')
})
test('booking keeps fields and strips unknown analytics keys',()=>{
 const b=validateBooking({...good,comment:'  хочу играть ',utm:{utm_source:'test',password:'secret'}})
 assert.equal(b.comment,'хочу играть');assert.equal(b.players,2);assert.deepEqual(b.utm,{utm_source:'test'})
})
test('invalid requests do not get silently clamped',()=>{
 for(const amendment of [{players:0},{players:1.5},{players:6},{tariff:'invented'},{consent:false},{sessionId:1},{source:'x'},{requestId:'bad'},{name:'A'},{contact:'telegram'},{comment:'x'.repeat(2001)}]) {
  assert.throws(()=>validateBooking({...good,...amendment}))
 }
})
