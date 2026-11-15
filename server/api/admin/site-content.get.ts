export default defineEventHandler(async(event)=>{
  await requireAdmin(event)
  const {rows}=await useDb().query('SELECT section,content FROM site_content')
  return Object.fromEntries(rows.map(r=>[r.section,r.content]))
})
