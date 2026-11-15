export default defineEventHandler(async () => {
  return cachedDb('site-content',30000,async()=>{
    const {rows}=await useDb().query('SELECT section,content FROM site_content')
    return Object.fromEntries(rows.map(r=>[r.section,r.content]))
  },()=>({}))
})
