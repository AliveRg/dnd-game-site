// Единая точка для мета-тегов страницы: title, description, canonical, OG
export function useSiteSeo(opts: { title: string; description: string; image?: string; path?: string; type?: 'website' | 'article' }) {
  const cfg = useRuntimeConfig().public
  const route = useRoute()
  const site = cfg.siteUrl.replace(/\/$/, '')
  const url = site + (opts.path ?? route.path)
  const image = opts.image?.startsWith('http') ? opts.image : site + (opts.image || '/images/og.jpg')

  useSeoMeta({
    title: opts.title,
    description: opts.description,
    ogTitle: opts.title,
    ogDescription: opts.description,
    ogType: opts.type ?? 'website',
    ogUrl: url,
    ogImage: image,
    ogLocale: 'ru_RU',
    ogSiteName: cfg.siteName,
    twitterCard: 'summary_large_image'
  })
  useHead({ link: [{ rel: 'canonical', href: url }] })
}

export function getUtm(): Record<string, string> {
  if (import.meta.server) return {}
  try { return JSON.parse(sessionStorage.getItem('utm') || '{}') } catch { return {} }
}
