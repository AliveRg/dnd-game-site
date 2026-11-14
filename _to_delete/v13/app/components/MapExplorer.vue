<script setup lang="ts">
// Карта миров + колода в одном блоке: наведение подсвечивает локацию, клик (или выбор в списке справа) открывает её сюжеты.
import { MAP_ZONES, type MapZone } from '#shared/map-zones'

const { data: games } = await useGames()
const bySlug = computed(() => Object.fromEntries(games.value.map((g) => [g.slug, g])))
const zones = computed(() => MAP_ZONES.map((z) => ({ ...z, games: z.stories.map((s) => bySlug.value[s]).filter(Boolean) })).filter((z) => z.games.length))

const selectedId = ref<string>('gorodok')
const hoverId = ref<string | null>(null)
const storyIdx = ref(0)
const selected = computed(() => zones.value.find((z) => z.id === selectedId.value) ?? zones.value[0])
const story = computed(() => selected.value?.games[storyIdx.value] ?? selected.value?.games[0])
const label = computed(() => zones.value.find((z) => z.id === (hoverId.value ?? selectedId.value)))
function pick(z: MapZone) {
  selectedId.value = z.id
  storyIdx.value = 0
}
// подпись над островом: позицию считает 3D-карта
const vmap = ref<{ screenOf: (id: string) => { x: number; y: number } | null }>()
const labelPos = ref<{ x: number; y: number } | null>(null)
function onMapHover(id: string | null, pos: { x: number; y: number } | null) {
  hoverId.value = id
  labelPos.value = pos ?? vmap.value?.screenOf(selectedId.value) ?? null
}
watch([selectedId, hoverId], () => nextTick(() => { const id = hoverId.value ?? selectedId.value; const p = vmap.value?.screenOf(id); if (p) labelPos.value = p }))
</script>

<template>
  <div>
    <div class="grid gap-6 lg:grid-cols-[1fr_340px]">
      <!-- Воксельная карта: без рамки, отделена от фона свечением воды -->
      <div class="relative self-start">
        <VoxelMap ref="vmap" :selected="selectedId" :hover="hoverId" @hover="onMapHover" @pick="(id) => pick(zones.find((z) => z.id === id)!)" />
        <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 translate-y-1" leave-active-class="transition duration-100" leave-to-class="opacity-0">
          <div v-if="label && labelPos" :key="label.id" class="map-label" :style="{ left: `${labelPos.x}px`, top: `${labelPos.y}px` }" aria-hidden="true">{{ label.name }}</div>
        </Transition>
        <p class="mt-1 text-center text-xs text-ash">Наведите на остров (или нажмите) - он построится и откроет свою историю.</p>
      </div>

      <!-- Список локаций: название + описание, выбранная подсвечена -->
      <div class="zone-list card !p-2" role="listbox" aria-label="Локации">
        <p class="px-3 pb-1 pt-2 text-xs uppercase tracking-widest text-ash">Локации · {{ zones.length }}</p>
        <button
          v-for="z in zones"
          :key="z.id"
          type="button"
          role="option"
          :aria-selected="z.id === selectedId"
          class="zone-item"
          :class="{ on: z.id === selectedId, hot: z.id === hoverId }"
          @click="pick(z)"
          @pointerenter="hoverId = z.id"
          @pointerleave="hoverId = null"
        >
          <GameIcon :slug="z.stories[0]" :width="40" class="zi-ico" />
          <span class="min-w-0">
            <b>{{ z.name }}</b>
            <small>{{ z.desc }}</small>
          </span>
          <em v-if="z.games.length > 1">{{ z.games.length }}</em>
        </button>
      </div>
    </div>

    <!-- Выбранная история: плоская панель под картой -->
    <Transition name="zs" mode="out-in">
      <div v-if="selected && story" :key="story.slug" class="zone-story card mt-6">
        <GameIcon :slug="story.slug" :width="150" class="zs-ico" />
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="badge">{{ story.meta?.kind }}</span>
            <span v-if="story.meta?.adult" class="badge" style="background: #8a0000">18+</span>
            <span class="text-xs uppercase tracking-widest text-ash">{{ selected.name }}</span>
            <div v-if="selected.games.length > 1" class="ml-auto flex gap-1.5">
              <button v-for="(g, i) in selected.games" :key="g.slug" type="button" class="nav-pill px-2.5 py-1 text-xs" :class="i === storyIdx && 'router-link-exact-active'" @click="storyIdx = i">История {{ i + 1 }}</button>
            </div>
          </div>
          <h3 class="mt-2 text-3xl">{{ story.title }}</h3>
          <p class="mt-1 max-w-3xl text-ash">{{ story.excerpt }}</p>
          <div class="mt-3 flex flex-wrap gap-2 text-xs text-ash">
            <span class="zs-tag"><IconPeople /> {{ story.meta?.players }}</span>
            <span v-if="story.meta?.level" class="zs-tag">ур. {{ story.meta.level }}</span>
            <span v-if="story.meta?.system" class="zs-tag">{{ story.meta.system }}</span>
          </div>
        </div>
        <div class="flex items-end gap-3 self-end">
          <NuxtLink to="#booking" class="btn-ghost">Записаться</NuxtLink>
          <NuxtLink :to="`/games/${story.slug}`" class="btn-primary">Подробнее</NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
.map-label { position: absolute; transform: translate(-50%, -50%); pointer-events: none; white-space: nowrap; padding: 5px 12px; border-radius: 8px;
  font-family: var(--font-display); font-size: 18px; line-height: 1; color: #F7F2E6; background: #040404e6; border: 1px solid #DF000099; box-shadow: 0 6px 16px #000a; }
.zone-list { max-height: 560px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #3a3333 transparent; display: flex; flex-direction: column; gap: 2px; }
.zone-item { display: grid; grid-template-columns: 40px 1fr auto; align-items: center; gap: 10px; padding: 7px 10px; border-radius: 10px; text-align: left; border: 1px solid transparent;
  transition: background var(--t) var(--ease), border-color var(--t) var(--ease), transform var(--t) var(--ease); }
.zone-item b { display: block; font-size: 14px; font-weight: 700; color: #F7F2E6; }
.zone-item small { display: block; font-size: 11px; line-height: 1.3; color: #959595; }
.zone-item em { font-style: normal; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 99px; background: #DF0000; color: #fff; }
.zone-item .zi-ico { color: #959595; transition: color var(--t) var(--ease); }
.zone-item.hot, .zone-item:hover { background: #ffffff0a; transform: translateX(2px); }
.zone-item.on { background: #DF000018; border-color: #DF000066; } .zone-item.on .zi-ico, .zone-item:hover .zi-ico { color: #DF0000; }
.zone-story { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
.zs-ico { flex: none; color: #DF0000; }
.zs-tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 99px; border: 1px solid #3a3333; color: #c9c2b4; }
.zs-enter-active, .zs-leave-active { transition: opacity var(--t) var(--ease), transform var(--t) var(--ease); }
.zs-enter-from { opacity: 0; transform: translateY(8px); } .zs-leave-to { opacity: 0; }
</style>
