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
    prerender: { crawlLinks: false, routes: ['/dnd-belgorod','/nri-belgorod','/nastolnye-igry-belgorod','/dnd-dlya-novichkov','/horror-nri','/igry-na-dvoih','/den-rozhdeniya','/korporativ',"/", "/klub", "/games", "/kontakty", "/raspisanie", "/informaciya", "/spravochnik", "/stati", "/privacy", "/generator-geroya", "/games/gorodok", "/games/vysshaya-instanciya-poteryannye-vo-vremeni", "/games/domik-u-morya", "/games/vysshaya-instanciya-mest-poluroslikov", "/games/bastion", "/games/kashtanische", "/games/pod-steklom", "/games/himera", "/games/nalyansk-delo-7212", "/games/mest-goblinov", "/games/smert-v-stile-disko", "/games/istorii-vysokoy-travy", "/games/desyat-svechey", "/stati/chto-takoe-dnd", "/stati/kak-igrat-v-dnd", "/stati/rasy-dnd", "/stati/klassy-dnd", "/stati/list-personazha-dnd", "/stati/kak-sozdat-personazha-dnd", "/stati/kubiki-dnd", "/stati/zaklinaniya-dnd", "/stati/chto-takoe-nri", "/spravochnik/guide-start", "/spravochnik/guide-table", "/spravochnik/guide-bring", "/spravochnik/guide-session-zero", "/spravochnik/guide-one-shot", "/spravochnik/guide-roleplay", "/spravochnik/guide-editions", "/spravochnik/guide-character", "/spravochnik/guide-background", "/spravochnik/guide-party", "/spravochnik/guide-level", "/spravochnik/guide-multiclass", "/spravochnik/guide-homebrew", "/spravochnik/guide-dispute", "/spravochnik/guide-pvp", "/spravochnik/guide-absence", "/spravochnik/guide-notes", "/spravochnik/guide-metagame", "/spravochnik/guide-describe", "/spravochnik/guide-check", "/spravochnik/guide-save", "/spravochnik/guide-advantage", "/spravochnik/guide-twenty", "/spravochnik/guide-passive", "/spravochnik/guide-initiative", "/spravochnik/guide-turn", "/spravochnik/guide-armor", "/spravochnik/guide-bonus", "/spravochnik/guide-reaction", "/spravochnik/guide-dash", "/spravochnik/guide-opportunity", "/spravochnik/guide-critical", "/spravochnik/guide-concentration", "/spravochnik/guide-slots", "/spravochnik/guide-cantrip", "/spravochnik/guide-components", "/spravochnik/guide-upcast", "/spravochnik/guide-spell-bonus", "/spravochnik/guide-session-time", "/spravochnik/guide-rules-source"] },
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
