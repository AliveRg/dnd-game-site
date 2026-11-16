<script setup lang="ts">
import { storyTheme } from '#shared/card-themes'
import { shortTitle } from '#shared/story-art'
const route = useRoute()
const cfg = useRuntimeConfig().public
const { data: game, error } = await useFetch<any>(`/api/posts/${route.params.slug}`)
if (error.value || !game.value) throw createError({ statusCode: 404, message: 'Сюжет не найден', fatal: true })

const m = computed(() => game.value.meta || {})
const theme = computed(() => storyTheme(game.value.slug))
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
    <!-- Шапка сюжета: свет мира, диорама локации и пара предметов со стола -->
    <div class="story-hero relative overflow-hidden" :style="{ '--glow': theme.glow }">
      <img v-if="game.cover" :src="game.cover" :alt="game.title" class="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div class="container-x relative grid items-center gap-6 py-10 md:grid-cols-[1fr_auto] md:py-14">
        <div>
          <p v-if="m.series" class="text-sm uppercase tracking-widest text-candle">{{ m.series }}</p>
          <h1 class="text-4xl md:text-6xl">{{ shortTitle(game.title, m.series) }}</h1>
          <div class="mt-5 flex flex-wrap gap-2">
            <span class="badge">{{ m.kind }}</span>
            <span class="story-chip"><img src="/art/ui-players.webp" alt="" />{{ m.players }}</span>
            <span v-if="m.level" class="story-chip"><img src="/art/ui-level.webp" alt="" />ур. {{ m.level }}</span>
            <span v-if="m.adult" class="story-chip !border-blood">18+</span>
          </div>
        </div>
        <div class="relative mx-auto w-[min(440px,85vw)]">
          <span class="story-halo" aria-hidden="true" />
          <GameIcon :slug="game.slug" :width="440" class="story-art relative w-full" />
          <img src="/art/decor-candle.webp" alt="" class="story-prop -left-6 bottom-2 w-16 md:w-20" />
          <img src="/art/decor-dice.webp" alt="" class="story-prop -right-4 bottom-0 w-14 md:w-16" />
        </div>
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

<style>
.story-hero { background: radial-gradient(60% 90% at 78% 55%, color-mix(in srgb, var(--glow) 30%, transparent), #0000 70%), linear-gradient(180deg, #1d1107, #100904); border-bottom: 1px solid #5a3416; }
.story-halo { position: absolute; left: 10%; right: 10%; bottom: 6%; height: 30%; border-radius: 50%; background: radial-gradient(closest-side, color-mix(in srgb, var(--glow) 55%, transparent), #0000); filter: blur(18px); }
.story-art { filter: drop-shadow(0 18px 24px #000c); animation: story-float 6s ease-in-out infinite; }
.story-prop { position: absolute; filter: drop-shadow(0 8px 10px #000b); }
.story-chip { display: inline-flex; align-items: center; gap: 6px; padding: 3px 10px 3px 4px; border-radius: 99px; font-size: 13px; font-weight: 700; color: #f3e6c8; border: 1px solid #a8813c88; background: #100904aa; }
.story-chip img { width: 24px; height: 24px; object-fit: contain; }
@keyframes story-float { 50% { transform: translateY(-6px); } }
@media (prefers-reduced-motion: reduce) { .story-art { animation: none; } }
</style>
