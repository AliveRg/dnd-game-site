<script setup lang="ts">
const route = useRoute()
const cfg = useRuntimeConfig().public
const { data: game, error } = await useFetch<any>(`/api/posts/${route.params.slug}`)
if (error.value || !game.value) throw createError({ statusCode: 404, message: 'Сюжет не найден', fatal: true })

const m = computed(() => game.value.meta || {})
useSiteSeo({
  title: game.value.seo_title || `${game.value.title} - ${m.value.kind} | ${cfg.siteName}`,
  description: game.value.seo_description || game.value.excerpt,
  image: game.value.cover || undefined,
  type: 'article'
})
const paragraphs = computed(() => String(game.value.body || '').split(/\n{2,}/))
</script>

<template>
  <article>
    <div class="relative h-[45vh] min-h-72 overflow-hidden" :style="{ background: `linear-gradient(135deg, ${m.accent || '#2a2019'}, #120d0a)` }">
      <img v-if="game.cover" :src="game.cover" :alt="game.title" class="absolute inset-0 h-full w-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
      <div class="container-x relative flex h-full flex-col justify-end pb-10">
        <p v-if="m.series" class="text-sm uppercase tracking-widest text-candle">{{ m.series }}</p>
        <h1 class="text-4xl md:text-6xl">{{ game.title }}</h1>
      </div>
    </div>

    <div class="container-x grid gap-10 py-12 lg:grid-cols-[2fr_1fr]">
      <div class="space-y-4 text-lg leading-relaxed">
        <p v-for="(p, i) in paragraphs" :key="i" class="whitespace-pre-line">{{ p }}</p>
      </div>
      <aside class="card h-fit space-y-3 text-sm">
        <p v-if="m.adult" class="rounded bg-blood px-3 py-1 text-center font-bold">18+</p>
        <p><span class="text-ash">Формат:</span> {{ m.kind }}</p>
        <p><span class="text-ash">Система:</span> {{ m.system }}</p>
        <p><span class="text-ash">Игроков:</span> {{ m.players }}</p>
        <p v-if="m.level"><span class="text-ash">Уровень:</span> {{ m.level }}</p>
        <p v-if="m.duration"><span class="text-ash">Длительность:</span> {{ m.duration }}</p>
        <p v-if="m.genres?.length"><span class="text-ash">Жанры:</span> {{ m.genres.join(', ') }}</p>
        <p><span class="text-ash">Цена:</span> <NuxtLink to="/raspisanie" class="underline">от 1 500 ₽ по тарифам</NuxtLink></p>
        <p v-if="m.source" class="text-xs text-ash">Сюжет: {{ m.source }}</p>
        <div class="flex justify-end"><NuxtLink to="#booking" class="btn-primary">Записаться</NuxtLink></div>
      </aside>
    </div>
  </article>
</template>
