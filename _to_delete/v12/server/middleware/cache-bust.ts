// Любая запись через API (админка, заявка) сбрасывает кэш сюжетов и расписания, чтобы изменения были видны сразу
export default defineEventHandler((event) => {
  if (event.method === 'GET' || !event.path.startsWith('/api/')) return
  event.node.res.once('finish', () => dropDbCache())
})
