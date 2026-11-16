import type { RouterConfig } from '@nuxt/schema'

// Переход на другую страницу с якорем (/games#generator): ждём, пока страница отрисуется, и плавно едем к блоку
export default <RouterConfig>{
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) {
      const delay = to.path === from.path ? 0 : 250
      return new Promise((resolve) => setTimeout(() => { scrollToEl(to.hash); resolve(false) }, delay))
    }
    if (to.path !== from.path) return { top: 0 }
    return false
  }
}
