<script setup lang="ts">
// Карта миров + список сюжетов. Если карта не загрузилась — клик по списку ведёт на страницу сюжета
const { data: games } = await useFetch<any[]>('/api/games', { default: () => [] })
const focus = ref<string | null>(null)
const ready = ref(false)
function pick(slug: string) {
  if (!ready.value) return navigateTo(`/games/${slug}`)
  focus.value = null
  nextTick(() => (focus.value = slug))
}
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-[1fr_280px]">
    <div class="frame-wood corners aspect-[10/7] lg:aspect-auto lg:h-[66vh]">
      <ClientOnly>
        <WorldMap :games="games" :focus="focus" @ready="ready = true" />
        <template #fallback><img src="/images/world-map.webp" alt="Карта миров" class="h-full w-full rounded-2xl object-cover" /></template>
      </ClientOnly>
    </div>
    <nav class="card max-h-[66vh] overflow-y-auto p-3" aria-label="Сюжеты на карте">
      <div v-for="g in games" :key="g.slug" class="flex items-center justify-between gap-2 rounded-lg px-2 py-2 transition hover:bg-[#ffffff0d]">
        <button type="button" class="flex-1 text-left text-sm" @click="pick(g.slug)">
          <span class="mr-1.5 inline-block h-2 w-2 rounded-full" :style="{ background: g.meta?.accent || '#f0a040' }" />{{ g.title }}
        </button>
        <NuxtLink :to="`/games/${g.slug}`" class="text-xs text-candle" :aria-label="`Открыть «${g.title}»`">→</NuxtLink>
      </div>
    </nav>
  </div>
</template>
