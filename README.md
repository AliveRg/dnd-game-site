# Хижина Всякой Всячины — сайт клуба НРИ

Nuxt 4 · Vue 3 · Tailwind 4 · PostgreSQL · S3 · Docker (Timeweb App Platform)

[Совместная работа, ветки и выборочный выпуск](docs/COLLABORATION.md)

## Быстрый старт (локально)

```bash
npm install
cp .env.example .env      # уже создан с ключами — проверь
npm run dev               # http://localhost:3100  (порт 3100, чтобы не драться с сайтом студии на 3000)
```

Без `NUXT_DATABASE_URL` сайт работает на стартовых данных (сюжеты видны, календарь пустой, админка без данных).
С локальной БД: `npm run db:up` (нужен Docker Desktop) → в `.env` `NUXT_DATABASE_URL=postgresql://dnd:dnd@localhost:5432/dnd`.

Проверка как в проде: `docker build -t dnd . && docker run -p 3100:3000 --env-file .env dnd   # → http://localhost:3100`

## Где что лежит

```
app/
  pages/index.vue            главная (hero, о клубе, сюжеты, цены, календарь, FAQ)
  pages/games/…              список и страница сюжета
  pages/news/…               новости / новинки / статьи
  pages/dragons/index.vue    админка
  components/                HeroSlides, QuickForm, PricingCards, BookingCalendar, GameCard
  assets/css/main.css        палитра и базовые классы (btn-primary, card, input…)
  plugins/metrika.client.ts  Яндекс Метрика + цели + UTM
shared/utils/pricing.ts      ТАРИФЫ — менять цены только тут
server/
  api/booking.post.ts        приём заявки (места, БД, письмо)
  api/admin/*                API админки
  plugins/migrate.ts         создание таблиц при старте
  data/games.ts              13 стартовых сюжетов
  routes/                    sitemap.xml, robots.txt, /media/* (картинки из S3)
seo/semantic-core.xlsx       SEO-ядро 12k+, Директ, минус-слова, мета-теги
scripts/wordstat/            сбор реальной частотности (npm run wordstat)
docs/                        ТЗ, деплой, стайл-гайд по сюжетам
```

## Деплой
См. [docs/DEPLOY.md](docs/DEPLOY.md). Коротко: push в `main` → App Platform сам соберёт Dockerfile и обновит сайт.

## SEO-частотность
1. В `.env` заполнить `WORDSTAT_FOLDER_ID` (ID каталога в console.yandex.cloud, где создан ключ).
2. `npm run wordstat` → `seo/semantic-core-filled.xlsx`.

## Оптимизация (держать в голове при дизайне)
- **Картинки:** только webp/avif, hero ≤ 250 КБ, 1920 px по длинной стороне; остальные через `loading="lazy"`. Первое фото hero — `fetchpriority="high"`.
- **Шрифты:** 2 семейства максимум, woff2 локально в `public/fonts`, `font-display: swap`, кириллический subset. Google Fonts из РФ грузятся нестабильно.
- **Анимации:** только `transform`/`opacity` (GPU), уважать `prefers-reduced-motion`. Частицы/дым — canvas с ограничением FPS или лёгкий webm/видео вместо JS.
- **Видео на фон:** если будет — webm + mp4, ≤ 2–3 МБ, `muted playsinline`, постер-картинка, на мобиле можно отдавать картинку.
- **Сторонние скрипты:** Метрика уже `async`; виджеты VK/Telegram — грузить по клику.
- **Проверка:** PageSpeed Insights / Lighthouse мобильный ≥ 90, LCP < 2,5 с.
