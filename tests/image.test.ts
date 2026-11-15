import {test} from 'node:test'
import assert from 'node:assert/strict'
import {inspectImage} from '../server/utils/image.ts'
test('inspects PNG signature and dimensions independent of MIME',()=>{
 const b=Buffer.alloc(32);Buffer.from([137,80,78,71,13,10,26,10]).copy(b);b.write('IHDR',12);b.writeUInt32BE(100,16);b.writeUInt32BE(200,20)
 assert.deepEqual(inspectImage(b),{type:'image/png',ext:'png',width:100,height:200})
})
test('rejects SVG, huge dimensions and large body',()=>{
 assert.throws(()=>inspectImage(Buffer.from('<svg onload="alert(1)"></svg>')))
 const b=Buffer.alloc(32);Buffer.from([137,80,78,71,13,10,26,10]).copy(b);b.write('IHDR',12);b.writeUInt32BE(9000,16);b.writeUInt32BE(9000,20)
 assert.throws(()=>inspectImage(b));assert.throws(()=>inspectImage(Buffer.alloc(9*1024*1024)))
})
