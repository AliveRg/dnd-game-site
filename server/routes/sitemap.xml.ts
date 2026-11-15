import { seedGames } from '../data/games'
import { LANDINGS, pagePath } from '#shared/seo-pages'

export default defineEventHandler(async (event) => {
  const site = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
  const urls: { loc: string; lastmod?: string; priority: string }[] = [
    { loc: '/', priority: '1.0' },
    { loc: '/games', priority: '0.9' },
    { loc: '/klub', priority: '0.7' },
    { loc: '/informaciya', priority: '0.7' },
    { loc: '/stati', priority: '0.7' },
    { loc: '/spravochnik', priority: '0.7' },

    { loc: '/kontakty', priority: '0.6' },
    ...LANDINGS.map((p) => ({ loc: pagePath(p), priority: p.kind === 'landing' ? '0.9' : '0.6' }))
  ]
  if (isDbConfigured()) {
    const { rows } = await useDb().query(`SELECT type, slug, updated_at FROM posts WHERE published`)
    for (const r of rows) {
      urls.push({ loc: r.type === 'game' ? `/games/${r.slug}` : r.type === 'article' ? `/stati/${r.slug}` : r.type === 'reference' ? `/spravochnik/${r.slug}` : `/news/${r.slug}`, lastmod: new Date(r.updated_at).toISOString(), priority: r.type === 'game' ? '0.8' : '0.5' })
    }
  } else {
    for (const g of seedGames) urls.push({ loc: `/games/${g.slug}`, priority: '0.8' })
  }
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site}${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`
})
