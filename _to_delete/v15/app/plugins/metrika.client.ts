// Яндекс Метрика для SPA: init с defer + ручной hit на каждую смену страницы.
// Цели: ymGoal('booking_sent'), ymGoal('hero_form_sent') - создать такие же в интерфейсе Метрики (тип "JavaScript-событие").
declare global {
  interface Window { ym?: (...args: any[]) => void }
}

export default defineNuxtPlugin(() => {
  const id = Number(useRuntimeConfig().public.yandexMetrikaId)
  const router = useRouter()

  if (id) {
    ;(function (m: any, e: Document, t: string, r: string, i: string) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments) }
      m[i].l = Date.now()
      const k = e.createElement(t) as HTMLScriptElement
      k.async = true
      k.src = r
      e.head.appendChild(k)
    })(window, document, 'script', `https://mc.yandex.ru/metrika/tag.js?id=${id}`, 'ym')

    window.ym!(id, 'init', { defer: true, clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true })
    window.ym!(id, 'hit', location.href, { title: document.title, referer: document.referrer })

    let prev = location.href
    router.afterEach((to) => {
      nextTick(() => {
        const url = location.origin + to.fullPath
        window.ym?.(id, 'hit', url, { title: document.title, referer: prev })
        prev = url
      })
    })
  }

  // Сохраняем UTM с первого захода - уйдут вместе с заявкой
  const q = router.currentRoute.value.query
  const utm = Object.fromEntries(Object.entries(q).filter(([k]) => k.startsWith('utm_') || k === 'yclid'))
  if (Object.keys(utm).length) {
    try { sessionStorage.setItem('utm', JSON.stringify(utm)) } catch {}
  }

  return {
    provide: {
      ymGoal: (goal: string, params?: Record<string, unknown>) => {
        if (id) window.ym?.(id, 'reachGoal', goal, params)
      }
    }
  }
})
