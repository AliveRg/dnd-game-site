export default defineEventHandler((event) => {
  const pub = useRuntimeConfig().public
  const site = pub.siteUrl.replace(/\/$/, '')
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  // Пока нет боевого домена (NUXT_PUBLIC_INDEXABLE=false) - закрываем всё, чтобы Яндекс не проиндексировал технический адрес
  if (String(pub.indexable) !== 'true' || getRequestURL(event).hostname !== new URL(site).hostname) return `User-agent: *\nDisallow: /\n`
  return `User-agent: *
Disallow: /dragons
Disallow: /api/
Clean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term&yclid&gclid

Sitemap: ${site}/sitemap.xml
`
})
