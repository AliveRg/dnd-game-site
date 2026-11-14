// 1) Ссылки-якоря на той же странице (#booking и т.п.) → точная плавная прокрутка, даже при повторном нажатии.
// 2) Появление блоков при прокрутке: всё, что ниже первого экрана, мягко «всплывает», когда до него доходишь.
export default defineNuxtPlugin((nuxtApp) => {
  document.addEventListener(
    'click',
    (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const a = (e.target as HTMLElement).closest?.('a[href*="#"]') as HTMLAnchorElement | null
      if (!a || a.target === '_blank') return
      const url = new URL(a.href, location.href)
      if (url.pathname !== location.pathname || !url.hash) return
      const el = document.querySelector(decodeURIComponent(url.hash))
      if (!el) return
      e.preventDefault()
      e.stopPropagation()
      scrollToEl(el)
    },
    true
  )

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const io = new IntersectionObserver(
    (entries) => {
      const shown = entries.filter((x) => x.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
      shown.forEach((x, i) => {
        const el = x.target as HTMLElement
        el.style.setProperty('--rv-d', `${Math.min(i, 6) * 80}ms`)
        el.classList.add('rv-in')
        io.unobserve(el)
        // после анимации убираем классы, чтобы не мешать hover-эффектам и transform у элементов
        setTimeout(() => { el.classList.remove('rv', 'rv-in'); el.style.removeProperty('--rv-d') }, 1400)
      })
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
  )
  const SEL = [
    'main .section .container-x > :not(.decor):not(.grid):not(.contents)',
    'main .section .container-x > .grid > *',
    '#booking .card'
  ].join(',')
  const setup = () =>
    requestAnimationFrame(() => {
      const fold = window.innerHeight
      document.querySelectorAll<HTMLElement>(SEL).forEach((el) => {
        if (el.dataset.rv || el.closest('.rv')) return
        el.dataset.rv = '1'
        if (el.getBoundingClientRect().top < fold) return // первый экран не прячем - без мигания
        el.classList.add('rv')
        io.observe(el)
      })
    })
  nuxtApp.hook('page:finish', setup)
  nuxtApp.hook('app:mounted', setup)
})
