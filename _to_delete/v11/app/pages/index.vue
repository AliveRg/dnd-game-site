<script setup lang="ts">
const cfg = useRuntimeConfig().public
const city = cfg.cityIn ? ` ${cfg.cityIn}` : ''

useSiteSeo({
  title: `Клуб D&D и НРИ${city} - партия 4 часа за 2000 ₽`,
  description: `Играйте в Dungeons & Dragons 5e и другие НРИ${city}: опытный мастер, до 5 игроков, новый сюжет каждую неделю. Партия 4 часа - 2000 ₽ по акции. Запись онлайн.`
})

const { data: games } = await useGames()

const features = [
  { icon: '🎲', title: 'Новая история каждую неделю', text: 'Каждую неделю открываем запись на новый сюжет в новом сеттинге - от сказки до хоррора.' },
  { icon: '🕯️', title: 'Атмосфера за столом', text: 'Карты, миниатюры, свечи и музыка. Приходите и просто играйте - всё уже готово.' },
  { icon: '🧭', title: 'Новичкам - можно', text: 'Объясним правила за 10 минут, поможем собрать персонажа. Опыт не нужен.' },
  { icon: '👥', title: 'До 5 игроков', text: 'Маленькие столы - каждому игроку хватает внимания мастера и времени на отыгрыш.' }
]

const faq = [
  { q: 'Я никогда не играл в D&D. Можно прийти?', a: 'Да. Мастер объяснит правила, поможет с персонажем. Для первой игры советуем сказочные ваншоты низкого уровня.' },
  { q: 'Сколько длится партия?', a: 'Стандартная партия - 4 часа, длинная - 6 часов. Кампании идут несколько встреч.' },
  { q: 'Сколько стоит?', a: 'По акции 2000 ₽ за 4 часа (до 31 января, далее 2500 ₽), 3000 ₽ за 6 часов. Если вас пригласил игрок клуба - 1500 ₽, а пригласившему -500 ₽ за каждого друга (скидка до 25%).' },
  { q: 'Сколько человек за столом?', a: 'До 5 игроков на партию. Есть отдельные истории на двоих.' },
  { q: 'Нужно ли что-то приносить?', a: 'Нет: кубики, листы персонажей, карты и миниатюры есть в клубе. Свои кубики - приветствуются.' },
  { q: 'Можно отменить запись?', a: 'Да, бесплатно - если предупредите не позже чем за 24 часа до игры. Так мы успеем позвать на ваше место другого игрока.' },
  { q: 'С какого возраста можно играть?', a: 'С 14 лет (до 16 - с согласия родителей). Сюжеты 18+ отмечены отдельно - на них только совершеннолетние.' },
  { q: 'Когда проходят игры?', a: 'В будни вечером (обычно с 18:00), в выходные - днём и вечером. Точные даты - в календаре записи.' }
]

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
    })
  }]
})
</script>

<template>
  <div>
    <!-- 1. HERO: форма выровнена по верху заголовка (одна визуальная линия) -->
    <section class="relative flex min-h-[calc(100dvh-72px)] items-center overflow-hidden">
      <HeroSlides />
      <div class="container-x relative grid items-start gap-8 py-10 md:py-12 lg:grid-cols-[1.2fr_1fr]">
        <!-- Главный текст в своей рамке -->
        <div class="hero-frame">
          <span class="badge mb-4">Акция · партия 4 часа - 2 000 ₽</span>
          <h1 class="text-4xl md:text-6xl" style="line-height: 1">Клуб настольных ролевых игр D&amp;D{{ city }}</h1>
          <p class="mt-5 max-w-xl text-lg text-parchment/85">
            Уникальные сюжеты и миры, живой мастер и до 5 игроков за столом. Каждую неделю - новая история в новом сеттинге.
          </p>
          <div class="mt-6 flex flex-wrap justify-end gap-3">
            <NuxtLink to="/games" class="btn-ghost">Смотреть сюжеты</NuxtLink>
            <NuxtLink to="#booking" class="btn-primary">Выбрать дату</NuxtLink>
          </div>
          <div class="hero-frame-sep" />
          <FateRoll />
        </div>
        <div class="flex lg:justify-end">
          <!-- череп сидит на правом нижнем углу формы: угол - в центре картинки -->
          <div class="relative w-full max-w-md">
            <QuickForm />
            <img src="/decor/skull.webp" alt="" class="decor bottom-0 right-0 hidden w-32 translate-x-1/2 translate-y-1/2 lg:block" decoding="async" />
          </div>
        </div>
      </div>
    </section>

    <!-- 2. О КЛУБЕ -->
    <section id="about" class="section">
      <div class="container-x">
        <SectionTitle icon="candle">О клубе</SectionTitle>
        <p class="mb-6 max-w-3xl text-lg text-ash">
          Хижина Всякой Всячины - клуб настольных ролевых игр{{ city }}: место, где собираются за одним столом, чтобы вместе рассказать историю.
          Играем в Dungeons &amp; Dragons 5e (редакция 2024), Витрувий, «Десять свечей», «Смерть в стиле Диско» и другие системы.
        </p>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="f in features" :key="f.title" class="card">
            <p class="text-3xl">{{ f.icon }}</p>
            <h3 class="mt-3 text-2xl">{{ f.title }}</h3>
            <p class="mt-2 text-sm text-ash">{{ f.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. КОЛОДА ИСТОРИЙ (карты переворачиваются) -->
    <section class="section">
      <div class="container-x">
        <SectionTitle icon="book">Уникальные сюжеты и миры</SectionTitle>
        <p class="-mt-3 mb-6 text-ash">Наведите на карту (или нажмите на телефоне), чтобы открыть историю.</p>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StoryCard v-for="g in games.slice(0, 8)" :key="g.slug" :game="g" class="mx-auto w-full max-w-[320px]" />
        </div>
        <div class="mt-6 flex justify-end">
          <NuxtLink to="/games" class="btn-ghost">Все сюжеты и карта миров →</NuxtLink>
        </div>
      </div>
    </section>

    <!-- 4. ИСТОРИЯ НЕДЕЛИ + туман войны -->
    <LazyWeeklyStory hydrate-on-visible />

    <!-- 5. ЦЕНЫ -->
    <section id="prices" class="section">
      <div class="container-x">
        <SectionTitle icon="goblet">Цены</SectionTitle>
        <PricingCards />
      </div>
    </section>

    <!-- 6. ГЕНЕРАТОР ГЕРОЯ -->
    <section id="generator" class="section">
      <div class="container-x"><LazyHeroTeaser hydrate-on-visible /></div>
    </section>

    <!-- 7. FAQ (запись - общий блок внизу каждой страницы) -->
    <section class="section">
      <div class="container-x">
        <SectionTitle icon="potion">Частые вопросы</SectionTitle>
        <div class="max-w-[57rem]"><FaqList :items="faq" /></div>
      </div>
    </section>
  </div>
</template>
