// Плавная прокрутка к блоку с поправкой на шапку. Секции страницы рендерятся лениво (content-visibility),
// поэтому на время прокрутки включаем их полностью, а в конце доводим позицию, если что-то сдвинулось.
const HEADER = 84
export function scrollToEl(target: string | Element | null | undefined, offset = HEADER) {
  if (!import.meta.client) return
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  const root = document.documentElement
  root.classList.add('cv-off')
  const y = () => Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: y(), behavior: reduce ? 'auto' : 'smooth' })
  let fixes = 0
  const settle = () => {
    const d = Math.abs(el.getBoundingClientRect().top - offset)
    if (d > 4 && fixes++ < 3) { window.scrollTo({ top: y(), behavior: 'smooth' }); setTimeout(settle, 500); return }
    root.classList.remove('cv-off')
  }
  setTimeout(settle, reduce ? 50 : 750)
}
