import tailwindcss from '@tailwindcss/vite'

// В разработке картинки не кэшируются (иначе после правок браузер показывает старые). В проде - неделя + фоновое обновление
const assetCache = process.env.NODE_ENV === 'production' ? 'public, max-age=604800, stale-while-revalidate=2592000' : 'no-cache'

// Все переменные ниже переопределяются через окружение: NUXT_<KEY>
// Пример: runtimeConfig.smtpHost  <-  NUXT_SMTP_HOST
//         runtimeConfig.public.siteUrl  <-  NUXT_PUBLIC_SITE_URL
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },

  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: { include: ['three', 'three/examples/jsm/loaders/GLTFLoader.js'] }
  },

  runtimeConfig: {
    // БД (Timeweb PostgreSQL)
    databaseUrl: '',
    dbSsl: 'false',

    // Почта
    smtpHost: '',
    smtpPort: '465',
    smtpUser: '',
    smtpPass: '',
    mailFrom: '',
    mailTo: '',

    // S3 (Timeweb Object Storage)
    s3Endpoint: 'https://s3.twcstorage.ru',
    s3Region: 'ru-1',
    s3Bucket: '',
    s3AccessKey: '',
    s3SecretKey: '',

    // Админка /dragons
    adminLogin: '',
    adminPassword: '',
    sessionPassword: '',

    public: {
      siteUrl: 'https://dungeons-bgd.ru',
      siteName: 'Хижина Всякой Всячины',
      // Город в предложном падеже для SEO-заголовков
      cityIn: 'в Белгороде',
      city: 'Белгород',
      // 'false' - сайт закрыт от индексации (пока работает на техническом домене Timeweb). Купили домен → 'true'
      indexable: 'false',
      // Бросок d20 после заявки: 20 = бонус (один раз на контакт). Выключить: NUXT_PUBLIC_DICE_BONUS=false
      diceBonus: 'false',
      diceBonusText: 'чай и печенье за счёт Хижины',
      yandexMetrikaId: '114256712'
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon-64.png?v=5' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png?v=5' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png?v=5' },
        // Шрифты лежат локально (public/fonts, @font-face в main.css). Предзагружаем 2 главных кириллических файла
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/inter-cyrillic-wght-normal.woff2', crossorigin: '' },
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/cormorant-sc-cyrillic-700-normal.woff2', crossorigin: '' }
      ],
      meta: [
        { name: 'theme-color', content: '#100904' },
        { name: 'yandex-verification', content: '4b93841bf1a2d148' }
      ]
    }
  },

  routeRules: {
    // объединённые страницы - старые адреса ведут на новые (301, для SEO)
    '/o-klube': { redirect: { to: '/klub', statusCode: 301 } },
    '/news': { redirect: { to: '/klub#novosti', statusCode: 301 } },
    '/karta': { redirect: { to: '/games#karta', statusCode: 301 } },
    '/ceny': { redirect: { to: '/raspisanie', statusCode: 301 } },
    '/dragons': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' } },
    '/dragons/sw.js': { headers: { 'Service-Worker-Allowed': '/dragons', 'Cache-Control': 'no-cache' } },
    '/dragons/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/api/admin/**': { headers: { 'X-Robots-Tag': 'noindex' } },
    '/images/**': { headers: { 'Cache-Control': assetCache } },
    '/art/**': { headers: { 'Cache-Control': assetCache } },
    '/photos/**': { headers: { 'Cache-Control': assetCache } },
    '/test-assets/**': { headers: { 'Cache-Control': assetCache } },
    // список сюжетов меняется редко - кэш на сервере 60 с (меньше запросов к БД)
    '/fonts/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    '/media/**': { headers: { 'Cache-Control': 'public, max-age=2592000' } }
  },

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true }
  },
  experimental: {
    // отложенная гидратация (hydrate-on-visible и т.п.)
    lazyHydration: true
  },
  features: {
    // CSS страницы встраивается в HTML - без лишнего запроса перед отрисовкой
    inlineStyles: true
  }
})
