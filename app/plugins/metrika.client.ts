declare global { interface Window { ym?: (...args: any[]) => void; dataLayer?: unknown[] } }
export default defineNuxtPlugin(() => {
  const id = Number(useRuntimeConfig().public.yandexMetrikaId)
  const router = useRouter()
  const admin = (path: string) => path === '/dragons' || path.startsWith('/dragons/')
  if (admin(router.currentRoute.value.path)) return { provide: { ymGoal: () => {} } }
  window.dataLayer ||= []
  if (id) {
    const w = window as any
    w.ym ||= function () { (w.ym.a ||= []).push(arguments) }
    w.ym.l = Date.now()
    const src = `https://mc.yandex.ru/metrika/tag.js?id=${id}`
    if (![...document.scripts].some(s => s.src === src)) {
      const script = document.createElement('script'); script.async = true; script.src = src; document.head.appendChild(script)
    }
    window.ym!(id, 'init', { defer: true, ssr: true, webvisor: true, clickmap: true, ecommerce: 'dataLayer', referrer: document.referrer, url: location.href, accurateTrackBounce: true, trackLinks: true })
    window.ym!(id, 'hit', location.origin + location.pathname, { title: document.title, referer: document.referrer })
    let previous = location.origin + location.pathname
    router.beforeEach(to => {
      if (admin(to.path)) { location.assign(to.fullPath); return false }
    })
    router.afterEach(to => {
      if (admin(to.path)) return
      nextTick(() => {
        const url = location.origin + to.path
        if (url === previous) return
        window.ym?.(id, 'hit', url, { title: document.title, referer: previous }); previous = url
      })
    })
  }
  const utm = Object.fromEntries(Object.entries(router.currentRoute.value.query).filter(([k]) => ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','yclid'].includes(k)))
  if (Object.keys(utm).length) try { sessionStorage.setItem('utm', JSON.stringify(utm)) } catch {}
  return { provide: { ymGoal: (goal: string) => { if (id && !admin(router.currentRoute.value.path)) window.ym?.(id, 'reachGoal', goal) } } }
})
