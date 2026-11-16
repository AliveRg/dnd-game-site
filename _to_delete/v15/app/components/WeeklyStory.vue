<script setup lang="ts">
import { zoneOfGame } from '#shared/map-zones'
// «История недели»: ближайшая партия с флажком is_weekly (иначе - просто ближайшая).
// Карта сюжета под туманом открывается по мере того, как записываются игроки.
const { data: sessions } = await useSessions()
const s = computed(() => sessions.value.find((x) => x.is_weekly) ?? sessions.value[0] ?? null)
const taken = computed(() => (s.value ? s.value.max_players - s.value.seats_left : 0))
const ratio = computed(() => (s.value ? taken.value / s.value.max_players : 0))
const image = computed(() => s.value?.game_meta?.fogMap || '/images/world-map-v2.webp')
const point = computed(() => (s.value?.game_meta?.fogMap ? null : zoneOfGame(s.value?.game_slug)?.center ?? null))
const when = computed(() =>
  s.value ? new Date(s.value.starts_at).toLocaleString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' }) : ''
)
</script>

<template>
  <section v-if="s" class="section relative" data-allow-mismatch="class">
    <div class="container-x grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
      <FogMap :image="image" :point="point" :ratio="ratio" :seed="s.game_slug || String(s.id)">
        <div class="absolute bottom-3 left-3 rounded-lg bg-ink/90 px-3 py-1.5 text-sm">
          🗺 Открыто {{ Math.round(ratio * 100) }}% карты
        </div>
      </FogMap>
      <div>
        <span class="badge">История недели</span>
        <h2 class="mt-3 text-4xl md:text-5xl">{{ s.game_title || 'Новая история' }}</h2>
        <p class="mt-3 capitalize text-ash">{{ when }}</p>
        <p class="mt-4 text-lg text-parchment/85">{{ s.game_excerpt }}</p>
        <div class="mt-6 rounded-xl border border-wood-2 bg-ink/70 p-4">
          <p class="text-sm text-ash">Карта откроется полностью, когда соберётся стол</p>
          <div class="mt-2 flex gap-1.5">
            <span v-for="i in s.max_players" :key="i" class="h-2.5 flex-1 rounded-full" :class="i <= taken ? 'bg-candle' : 'bg-wood-2'" />
          </div>
          <p class="mt-2 text-sm"><b class="text-candle">{{ taken }}</b> из {{ s.max_players }} мест занято</p>
        </div>
        <div class="mt-6 flex flex-wrap justify-end gap-3">
          <NuxtLink v-if="s.game_slug" :to="`/games/${s.game_slug}`" class="btn-ghost">О сюжете</NuxtLink>
          <NuxtLink to="#booking" class="btn-primary">Занять место</NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
