import catalog from '#shared/preview/catalog.json'
// Static, public-only snapshot: never forwards requests to production APIs.
export function usePreviewFetch<T = any>(url: any, options: any = {}) {
  const key = () => `preview:${toValue(url)}:${toValue(options.query?.type) || ''}`
  return useAsyncData<T>(key, async () => {
    const path = String(toValue(url))
    if (path === '/api/site-content') return {} as T
    if (path === '/api/sessions') return [] as T
    if (path === '/api/games') return catalog.filter(p => p.type === 'game') as T
    if (path.startsWith('/api/posts/')) return (catalog.find(p => p.slug === decodeURIComponent(path.slice(11))) || null) as T
    return catalog.filter(p => p.type === (toValue(options.query?.type) || 'news')).slice(0, Number(toValue(options.query?.limit) || 100)) as T
  }, { default: options.default })
}
