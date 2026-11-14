<script setup lang="ts">
// Сюжеты и карта миров - одно целое: карта + список локаций + карточка сюжета
const cfg = useRuntimeConfig().public
const city = cfg.cityIn ? ` ${cfg.cityIn}` : ''
useSiteSeo({
  title: `Сюжеты и карта миров - ваншоты D&D 5e и НРИ${city}`,
  description: 'Все истории клуба на карте миров: ваншоты, модули и кампании по D&D 5e, Витрувию и другим НРИ. Выбирайте место и записывайтесь.'
})
const { data: games } = await useGames()
</script>

<template>
  <div>
    <section id="karta" class="section">
      <div class="container-x">
        <SectionTitle icon="key" as="h1">Сюжеты и карта миров</SectionTitle>
        <p class="-mt-3 mb-6 text-ash">Наведите на место на карте - оно подсветится. Нажмите на него или выберите локацию в списке, чтобы открыть историю.</p>
        <MapExplorer />
        <!-- Для поисковиков: все сюжеты ссылками -->
        <nav class="sr-only" aria-label="Все сюжеты">
          <NuxtLink v-for="g in games" :key="g.slug" :to="`/games/${g.slug}`">{{ g.title }}</NuxtLink>
        </nav>
      </div>
    </section>

    <section id="generator" class="section">
      <div class="container-x">
        <HeroTeaser />
      </div>
    </section>
  </div>
</template>
