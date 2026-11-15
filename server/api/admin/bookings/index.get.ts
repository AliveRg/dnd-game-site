export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const page = Math.max(1, Math.floor(Number(q.page) || 1))
  const pageSize = Math.min(100, Math.max(1, Math.floor(Number(q.pageSize) || 20)))
  const search = String(q.q ?? '').slice(0,120)
  const status = ['new','confirmed','cancelled'].includes(String(q.status)) ? String(q.status) : ''
  const paginated = q.page !== undefined || q.pageSize !== undefined || q.q !== undefined || q.status !== undefined || q.unread !== undefined
  const where = `WHERE ($1='' OR b.name ILIKE '%' || $1 || '%' OR b.contact ILIKE '%' || $1 || '%') AND ($2='' OR b.status=$2) AND (NOT $3 OR b.viewed_at IS NULL)`
  const args = [search,status,q.unread === 'true']
  const {rows} = await useDb().query(`SELECT b.*,s.starts_at,p.title AS game_title FROM bookings b LEFT JOIN game_sessions s ON s.id=b.session_id LEFT JOIN posts p ON p.id=s.game_id ${where} ORDER BY b.created_at DESC,b.id DESC LIMIT $4 OFFSET $5`,[...args,paginated?pageSize:300,paginated?(page-1)*pageSize:0])
  if (!paginated) return rows
  const total = await useDb().query(`SELECT count(*)::int AS n FROM bookings b ${where}`,args)
  const unread = await useDb().query('SELECT count(*)::int AS n FROM bookings WHERE viewed_at IS NULL')
  return {items:rows,total:total.rows[0].n,unread:unread.rows[0].n,page,pageSize}
})
