<script setup lang="ts">
// Карта миров + колода в одном блоке: наведение подсвечивает локацию, клик (или выбор в списке справа) открывает её сюжеты.
import { MAP_ZONES, MAP_W, MAP_H, type MapZone } from '#shared/map-zones'

const { data: games } = await useGames()
const bySlug = computed(() => Object.fromEntries(games.value.map((g) => [g.slug, g])))
const zones = computed(() => MAP_ZONES.map((z) => ({ ...z, games: z.stories.map((s) => bySlug.value[s]).filter(Boolean) })).filter((z) => z.games.length))

const selectedId = ref<string>('gorodok')
const hoverId = ref<string | null>(null)
const storyIdx = ref(0)
const selected = computed(() => zones.value.find((z) => z.id === selectedId.value) ?? zones.value[0])
const story = computed(() => selected.value?.games[storyIdx.value] ?? selected.value?.games[0])
const label = computed(() => zones.value.find((z) => z.id === (hoverId.value ?? selectedId.value)))
// Выпадающий список локаций: закрыт, показывает выбранное место; выбрали - закрылся
const listOpen = ref(false)
const dd = ref<HTMLElement>()
function pick(z: MapZone) {
  selectedId.value = z.id
  storyIdx.value = 0
  listOpen.value = false
}
const onDoc = (e: Event) => { if (listOpen.value && !dd.value?.contains(e.target as Node)) listOpen.value = false }
const onKey = (e: KeyboardEvent) => e.key === 'Escape' && (listOpen.value = false)
onMounted(() => { document.addEventListener('pointerdown', onDoc); window.addEventListener('keydown', onKey) })
onBeforeUnmount(() => { document.removeEventListener('pointerdown', onDoc); window.removeEventListener('keydown', onKey) })
const pct = (z: { center: { x: number; y: number } }) => ({ left: `${(z.center.x / MAP_W) * 100}%`, top: `${(z.center.y / MAP_H) * 100}%` })
</script>

<template>
  <div class="grid gap-5 lg:grid-cols-[1fr_300px]">
    <!-- Карта -->
    <div class="frame-wood corners self-start !p-2">
      <div class="relative overflow-hidden rounded-xl" :style="{ aspectRatio: `${MAP_W} / ${MAP_H}` }">
        <img src="/images/world-map-v2.webp" alt="Карта миров клуба: локации всех сюжетов" class="absolute inset-0 h-full w-full select-none object-cover" :width="MAP_W" :height="MAP_H" loading="lazy" decoding="async" draggable="false" />
        <svg class="map-zones absolute inset-0 h-full w-full" :viewBox="`0 0 ${MAP_W} ${MAP_H}`" role="list" aria-label="Локации на карте">
          <polygon
            v-for="z in zones"
            :key="z.id"
            :points="z.points"
            class="zone"
            :class="{ active: z.id === selectedId }"
            role="listitem"
            tabindex="0"
            :aria-label="z.name"
            @pointerenter="hoverId = z.id"
            @pointerleave="hoverId = null"
            @click="pick(z)"
            @keydown.enter="pick(z)"
          />
        </svg>
        <div v-if="label" class="map-label" :style="pct(label)" aria-hidden="true">{{ label.name }}</div>
      </div>
    </div>

    <!-- Справа: выпадающий список локаций + место -->
    <div class="flex flex-col gap-4">
      <div ref="dd" class="zone-dd" :class="listOpen && 'open'">
        <p class="mb-1.5 text-xs uppercase tracking-widest text-ash">Локация · {{ zones.length }} на карте</p>
        <button type="button" class="zone-dd-btn" :aria-expanded="listOpen" aria-haspopup="listbox" @click="listOpen = !listOpen">
          <GameIcon v-if="selected" :slug="selected.stories[0]" :width="40" class="flex-none text-candle" />
          <span class="flex-1 truncate text-left">{{ selected?.name }}</span>
          <svg class="zone-dd-chev" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5 6 6.5l5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" /></svg>
        </button>
        <Transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-150" leave-to-class="opacity-0 -translate-y-1">
          <div v-if="listOpen" class="zone-dd-panel zone-list" role="listbox" aria-label="Локации">
            <button
              v-for="z in zones"
              :key="z.id"
              type="button"
              role="option"
              :aria-selected="z.id === selectedId"
              class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition"
              :class="z.id === selectedId ? 'bg-[#f0a04022] text-candle-2' : 'hover:bg-[#ffffff0d]'"
              @click="pick(z)"
              @pointerenter="hoverId = z.id"
              @pointerleave="hoverId = null"
            >
              <GameIcon :slug="z.stories[0]" :width="38" class="flex-none text-candle" />
              <span class="flex-1">{{ z.name }}</span>
              <span v-if="z.games.length > 1" class="text-xs text-ash">{{ z.games.length }} ист.</span>
            </button>
          </div>
        </Transition>
      </div>

      <div v-if="selected && story" class="flex flex-col items-center gap-2">
        <p class="self-start text-sm text-ash">{{ selected.desc }}</p>
        <div v-if="selected.games.length > 1" class="flex gap-1.5 self-start">
          <button v-for="(g, i) in selected.games" :key="g.slug" type="button" class="nav-pill px-2.5 py-1 text-xs" :class="i === storyIdx && 'router-link-exact-active'" @click="storyIdx = i">
            История {{ i + 1 }}
          </button>
        </div>
        <StoryCard :key="story.slug" :game="story" open class="w-full max-w-[300px]" />
      </div>
    </div>
  </div>
</template>

<style>
.map-zones .zone { fill: transparent; stroke: transparent; stroke-width: 3; vector-effect: non-scaling-stroke; cursor: pointer; transition: fill .2s, stroke .2s; outline: none; }
.map-zones .zone:hover, .map-zones .zone:focus-visible { fill: #ffd28a2e; stroke: #ffc670; }
.map-zones .zone.active { fill: #ffd28a24; stroke: #f0a040; stroke-dasharray: 10 6; }
.map-zones:has(.zone:hover) .zone.active:not(:hover) { stroke-opacity: .5; fill: transparent; }
.map-label { position: absolute; transform: translate(-50%, -50%); pointer-events: none; white-space: nowrap; padding: 5px 12px; border-radius: 8px;
  font-family: var(--font-display); font-size: 18px; line-height: 1; color: #ffe2a8; background: #130b09e6; border: 1px solid #f0a04099; box-shadow: 0 6px 16px #000a; }
.zone-dd { position: relative; z-index: 5; }
.zone-dd-btn { display: flex; width: 100%; align-items: center; gap: 10px; padding: 8px 12px 8px 8px; border-radius: 12px; font-size: 15px; color: #f1e6cf;
  border: 1px solid #f0a04066; background: linear-gradient(180deg, #170d0bd9, #130b09eb), url('/textures/wood.webp') center / 520px;
  box-shadow: inset 0 1px 0 #ffffff12, 0 6px 16px #0008; transition: border-color .2s, box-shadow .2s; }
.zone-dd-btn:hover, .zone-dd.open .zone-dd-btn { border-color: #f0a040; box-shadow: inset 0 1px 0 #ffffff12, 0 6px 16px #0008, 0 0 16px #f0a04044; }
.zone-dd-chev { width: 12px; height: 8px; color: #f0a040; transition: transform .25s; }
.zone-dd.open .zone-dd-chev { transform: rotate(180deg); }
.zone-dd-panel { position: absolute; left: 0; right: 0; top: calc(100% + 6px); max-height: 320px; overflow-y: auto; padding: 6px; border-radius: 12px;
  border: 1px solid #f0a04066; background: #150c0a; box-shadow: 0 16px 34px #000d; }
.zone-list { scrollbar-width: thin; scrollbar-color: #8a5a1f transparent; }
</style>
