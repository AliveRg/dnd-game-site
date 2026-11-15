import type { IncomingMessage } from 'node:http'

/** Reads at most limit bytes; chunked bodies are subject to the same ceiling. */
export function readBoundedBody(request: IncomingMessage, limit: number): Promise<Buffer> {
  return new Promise((resolve,reject)=>{
    const chunks:Buffer[]=[]
    let size=0
    const cleanup=()=>{request.off('data',data);request.off('end',end);request.off('error',fail);request.off('aborted',aborted)}
    const fail=(error:Error)=>{cleanup();reject(error)}
    const aborted=()=>fail(new Error('Request aborted'))
    const data=(chunk:Buffer)=>{
      size+=chunk.length
      if(size>limit){
        cleanup();chunks.length=0
        // Drain without buffering, so the server can deliver a 413 response.
        request.on('error',()=>{});request.resume()
        reject(Object.assign(new Error('Слишком большой запрос'),{statusCode:413}));return
      }
      chunks.push(chunk)
    }
    const end=()=>{cleanup();resolve(Buffer.concat(chunks,size))}
    request.on('data',data);request.on('end',end);request.on('error',fail);request.on('aborted',aborted)
  })
}
