export default defineEventHandler(async(event)=>{
  await requireAdmin(event)
  const b=await readBody(event)
  const content=validateSiteContent(b?.section,b?.content)
  await useDb().query(`INSERT INTO site_content(section,content) VALUES($1,$2) ON CONFLICT(section) DO UPDATE SET content=EXCLUDED.content,updated_at=now()`,[b.section,JSON.stringify(content)])
  invalidateContent()
  return {ok:true}
})
