// Only formats whose dimensions we can inspect without trusting client MIME are accepted.
export function inspectImage(data: Buffer) {
  let type = '', ext = '', width = 0, height = 0
  if (data.length > 8*1024*1024 || data.length < 24) throw new Error('Изображение должно быть не больше 8 МБ')
  if(data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && data.toString('ascii',12,16)==='IHDR') {
    type='image/png';ext='png';width=data.readUInt32BE(16);height=data.readUInt32BE(20)
  } else if(data.toString('ascii',0,4)==='RIFF' && data.toString('ascii',8,12)==='WEBP') {
    type='image/webp';ext='webp'
    const chunk=data.toString('ascii',12,16)
    if(chunk==='VP8X' && data.length>=30) {width=1+data.readUIntLE(24,3);height=1+data.readUIntLE(27,3)}
    else if(chunk==='VP8 ' && data.length>=30 && data.subarray(23,26).equals(Buffer.from([157,1,42]))) {width=data.readUInt16LE(26)&16383;height=data.readUInt16LE(28)&16383}
    else if(chunk==='VP8L' && data.length>=25 && data[20]===47) {const bits=data.readUInt32LE(21);width=(bits&16383)+1;height=((bits>>>14)&16383)+1}
  } else if(data[0]===255&&data[1]===216) {
    type='image/jpeg';ext='jpg'
    let i=2
    while(i+8<data.length) {
      if(data[i]!==255)break
      const marker=data[i+1]; i+=2
      if(marker===216||marker===217)continue
      const len=data.readUInt16BE(i)
      if(len<2||i+len>data.length)break
      if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {height=data.readUInt16BE(i+3);width=data.readUInt16BE(i+5);break}
      i+=len
    }
  }
  if(!type||!width||!height||width>12000||height>12000||width*height>40000000) throw new Error('Нужен корректный JPG, PNG или WebP до 40 мегапикселей')
  return {type,ext,width,height}
}
