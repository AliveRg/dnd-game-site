export default defineEventHandler(async(event)=>{
  setResponseHeader(event,'Cache-Control','no-store')
  try {
    if(!isDbConfigured()) throw new Error('unconfigured')
    await useDb().query('SELECT 1')
    return {ok:true,db:'ok'}
  } catch {
    setResponseStatus(event,503)
    return {ok:false,db:'unavailable'}
  }
})
