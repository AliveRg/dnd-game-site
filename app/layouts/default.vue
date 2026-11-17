<script setup lang="ts">
import { CLUB_PHONE, CLUB_PHONE_LABEL, CLUB_ADDRESS } from '#shared/club-content'
import { LANDINGS, pagePath, fillCity } from '#shared/seo-pages'
const cfg = useRuntimeConfig().public
const route = useRoute()
const open = ref(false)
const {data:articles}=await usePreviewFetch<any[]>('/api/posts',{query:{type:'article'},default:()=>[]})
// Меню из 4 пунктов: объединённые страницы
const nav = [
  { to: '/', label: 'Главная' },
  { to: '/klub', label: 'Клуб и статьи' },
  { to: '/games', label: 'Сюжеты и карта' },
  { to: '/raspisanie', label: 'Расписание и цены' },
  { to: '/kontakty', label: 'Контакты' },
  { to: '/spravochnik', label: 'Справочник' }
]
// Генератор героя: на главной - прокрутка к блоку, на других страницах - блок на «Сюжеты и карта»
function goGenerator() {
  open.value = false
  // генератор теперь один большой лист на своей странице
  navigateTo('/generator-geroya')
}
const short = (s: string) => fillCity(s, cfg.cityIn, cfg.city).replace(/:.*$/, '')
// Блок записи внизу каждой страницы (кроме тех, где он не нужен)
const showBooking = computed(() => !route.path.startsWith('/dragons'))

useHead({
  meta: String(cfg.indexable) === 'true' ? [] : [{ name: 'robots', content: 'noindex, nofollow' }],
  titleTemplate: (t) => (t ? `${t}` : `${cfg.siteName} - клуб настольных ролевых игр D&D`),
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'EntertainmentBusiness',
        name: cfg.siteName,
        url: cfg.siteUrl,
        image: `${cfg.siteUrl}/images/og.jpg`,
        description: 'Клуб настольных ролевых игр: D&D 5e, ваншоты и кампании, до 5 игроков за столом.',
        priceRange: '1500-3000 ₽',
        telephone: CLUB_PHONE,
        areaServed: { '@type': 'City', name: 'Белгород' },
        address: { '@type': 'PostalAddress', addressLocality: 'Белгород', streetAddress: CLUB_ADDRESS, addressCountry: 'RU' }
      })
    }
  ]
})
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header class="fixed inset-x-0 top-0 z-40 shadow-[0_6px_20px_#000a]" style="background: linear-gradient(180deg,#1d1107f2,#100904f5); backdrop-filter: none">
      <div class="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between gap-3 px-4 md:px-6">
        <NuxtLink to="/" class="flex items-center gap-2.5" aria-label="На главную">
          <LogoSkull />
          <span class="gold-text whitespace-nowrap font-display text-xl leading-none lg:max-xl:hidden">NRI клуб</span>
        </NuxtLink>
        <nav class="hidden items-center gap-1.5 lg:flex" aria-label="Основное меню">
          <NuxtLink v-for="n in nav" :key="n.to" :to="n.to" class="nav-pill whitespace-nowrap">{{ n.label }}</NuxtLink>
        </nav>
        <div class="hidden items-center gap-2 lg:flex">
          <button type="button" class="btn-ghost hidden whitespace-nowrap px-3 py-2 text-sm xl:inline-flex" title="Генератор героя" @click="goGenerator"><img src="/art/decor-dice.webp" alt="" class="h-6 w-6 object-contain" /><span class="hidden min-[1360px]:inline">Генератор героя</span></button>
          <NuxtLink to="#booking" class="btn-primary whitespace-nowrap py-2">Записаться</NuxtLink>
        </div>
        <button class="nav-pill lg:hidden" :aria-expanded="open" aria-label="Меню" @click="open = !open">☰</button>
      </div>
      <div class="metal-band" />
      <nav v-if="open" class="container-x grid gap-2 bg-ink py-4 lg:hidden" @click="open = false">
        <NuxtLink v-for="n in nav" :key="n.to" :to="n.to" class="nav-pill py-2.5">{{ n.label }}</NuxtLink>
        <div class="flex justify-end gap-2"><button type="button" class="btn-ghost" @click.stop="goGenerator">Генератор героя</button><NuxtLink to="#booking" class="btn-primary">Записаться</NuxtLink></div>
      </nav>
    </header>

    <main class="flex-1 pt-[72px]"><p class="bg-amber-950 px-4 py-2 text-center text-sm text-amber-100">Предпросмотр новой версии · формы и админка доступны только на основном сервере</p>
      <slot />
      <LazyBookingSection v-if="showBooking" hydrate-on-visible />
    </main>

    <div class="metal-band" />
    <footer class="relative overflow-hidden py-8 text-sm text-ash" style="background: linear-gradient(180deg,#0e0202,#060101); box-shadow: inset 0 1px 0 #e0a24a44">
      <DecorIcon name="nails" class="decor bottom-2 right-4 hidden h-24 w-24 rotate-12 opacity-80 md:block" />
      <div class="container-x mb-6 grid gap-6 sm:grid-cols-3">
        <div>
          <p class="mb-2 font-semibold text-parchment">Играть</p>
          <NuxtLink v-for="p in LANDINGS" :key="p.slug" :to="pagePath(p)" class="block py-0.5 hover:text-candle">{{ short(p.h1) }}</NuxtLink>
        </div>
        <div>
          <p class="mb-2 font-semibold text-parchment">Статьи</p>
          <NuxtLink v-for="p in articles" :key="p.slug" :to="`/stati/${p.slug}`" class="block py-0.5 hover:text-candle">{{p.title}}</NuxtLink>
        </div>
        <div>
          <p class="mb-2 font-semibold text-parchment">Клуб</p>
          <NuxtLink v-for="n in nav" :key="n.to" :to="n.to" class="block py-0.5 hover:text-candle">{{ n.label }}</NuxtLink>
          <NuxtLink to="/generator-geroya" class="block py-0.5 hover:text-candle">Генератор героя</NuxtLink>
        </div>
      </div>
      <div class="container-x flex flex-col justify-between gap-4 md:flex-row">
        <div><a :href="'tel:'+CLUB_PHONE" class="block text-parchment" @click="$ymGoal('phone_click')">{{CLUB_PHONE_LABEL}}</a><p class="mt-2">Белгород, {{CLUB_ADDRESS}} · Очные игры в Белгороде</p></div>
        <p>© {{ new Date().getFullYear() }} {{ cfg.siteName }}. Клуб настольных ролевых игр.</p>
        <div class="flex flex-wrap gap-x-5 gap-y-1">
          <NuxtLink to="/privacy" class="hover:text-candle">Политика конфиденциальности</NuxtLink>
          <NuxtLink to="/privacy?doc=soglasie" class="hover:text-candle">Согласие на обработку данных</NuxtLink>
        </div>
      </div>
    </footer>
    <LazyCookieNote hydrate-on-idle />
  </div>
</template>
