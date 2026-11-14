<script setup lang="ts">
const cfg = useRuntimeConfig().public
useSiteSeo({ title: `Карта миров — все сюжеты клуба НРИ ${cfg.cityIn}`, description: 'Интерактивная карта миров Хижины: хребет Гроссглокнер, пустыня Омашу, Полуденное Королевство, Реальный мир. Выберите историю и запишитесь.' })
const { data: games } = await useFetch<any[]>('/api/games', { default: () => [] })
const focus = ref<string | null>(null)
</script>

<template>
  <section class="py-10">
    <div class="container-x">
      <h1 class="section-title mb-2">Карта миров</h1>
      <p class="mb-6 text-ash">Каждая точка — отдельная история. Нажмите, чтобы узнать подробности и записаться.</p>
      <div class="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div class="frame-wood corners aspect-[10/7] lg:aspect-auto lg:h-[70vh]">
          <ClientOnly>
            <WorldMap :games="games" :focus="focus" />
            <template #fallback><img src="/images/world-map.webp" alt="Карта миров" class="h-full w-full rounded-2xl object-cover" /></template>
          </ClientOnly>
        </div>
        <!-- Список дублирует карту: для SEO (ссылки в HTML) и для тех, кому неудобно тыкать в карту -->
        <nav class="card max-h-[70vh] overflow-y-auto p-3" aria-label="Сюжеты на карте">
          <div v-for="g in games" :key="g.slug" class="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-wood-2">
            <button class="text-left text-sm" @click="focus = null; nextTick(() => (focus = g.slug))">
              <span class="mr-1 inline-block h-2 w-2 rounded-full" :style="{ background: g.meta?.accent || '#e0a040' }" />{{ g.title }}
            </button>
            <NuxtLink :to="`/games/${g.slug}`" class="text-xs text-candle">→</NuxtLink>
          </div>
        </nav>
      </div>
    </div>
  </section>
</template>
