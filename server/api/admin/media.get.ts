export default defineEventHandler(async(event)=>{
  await requireAdmin(event)
  const {rows}=await useDb().query('SELECT *, \'/media/\' || key AS url FROM media_assets ORDER BY created_at DESC LIMIT 200')
  return rows
})
