<script setup lang="ts">
defineProps<{ game: { slug: string; title: string; excerpt: string; cover?: string | null; meta: any } }>()
</script>

<template>
  <NuxtLink :to="`/games/${game.slug}`" class="card group flex flex-col overflow-hidden p-0 transition hover:border-candle">
    <div class="relative aspect-[16/10] overflow-hidden" :style="{ background: `linear-gradient(135deg, ${game.meta?.accent || '#2a2019'}, #120d0a)` }">
      <img v-if="game.cover" :src="game.cover" :alt="game.title" loading="lazy" class="h-full w-full object-cover transition group-hover:scale-105" />
      <span v-if="game.meta?.adult" class="absolute right-3 top-3 rounded bg-blood px-2 py-0.5 text-xs font-bold">18+</span>
      <span class="absolute bottom-3 left-3 rounded bg-ink/80 px-2 py-0.5 text-xs">{{ game.meta?.kind }}</span>
    </div>
    <div class="flex flex-1 flex-col p-5">
      <p v-if="game.meta?.series" class="text-xs uppercase tracking-widest text-candle">{{ game.meta.series }}</p>
      <h3 class="mt-1 text-2xl">{{ game.title }}</h3>
      <p class="mt-2 flex-1 text-sm text-ash">{{ game.excerpt }}</p>
      <div class="mt-4 flex flex-wrap gap-2 text-xs">
        <span class="rounded bg-wood-2 px-2 py-1">{{ game.meta?.system }}</span>
        <span class="rounded bg-wood-2 px-2 py-1"><IconPeople /> {{ game.meta?.players }}</span>
        <span v-if="game.meta?.level" class="rounded bg-wood-2 px-2 py-1">ур. {{ game.meta.level }}</span>
      </div>
    </div>
  </NuxtLink>
</template>
