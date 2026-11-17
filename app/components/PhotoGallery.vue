<script setup lang="ts">
// Галерея клуба: «плитка» из фото, неоновый кант, при наведении фото оживает. Клик открывает фото крупно (стрелки, Esc).
const props = withDefaults(defineProps<{ compact?: boolean; images?: {url:string;alt:string}[] }>(), { compact: false })
const all = [
  { src: '/photos/g-minis.webp', alt: 'Коллекция миниатюр на полках', cap: 'Миниатюры для приключений', cls: '' },
  { src: '/photos/g-shelves.webp', alt: 'Книги правил и настольные игры', cap: 'Книги и игры', cls: '' },
  { src: '/photos/g-room.webp', alt: 'Игровая комната без людей', cap: 'Наш игровой стол', cls: 'g-banner' }
]
const photos = computed(() => {const list=props.images!==undefined?props.images.map(p=>({src:p.url,alt:p.alt,cap:p.alt,cls:''})):all;return props.compact?list.slice(0,6):list})
const open = ref<number | null>(null)
const go = (d: number) => open.value !== null && (open.value = (open.value + d + photos.value.length) % photos.value.length)
const onKey = (e: KeyboardEvent) => {
  if (open.value === null) return
  if (e.key === 'Escape') open.value = null
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'ArrowLeft') go(-1)
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="pg" :class="compact && 'pg-compact'">
    <button v-for="(p, i) in photos" :key="p.src" type="button" class="pg-item" :class="p.cls" :aria-label="`Открыть фото: ${p.cap}`" @click="open = i">
      <img :src="p.src" :alt="p.alt" loading="lazy" decoding="async" />
      <span class="pg-cap">{{ p.cap }}</span>
    </button>
    <Teleport to="body">
      <Transition enter-active-class="transition duration-300" enter-from-class="opacity-0" leave-active-class="transition duration-200" leave-to-class="opacity-0">
        <div v-if="open !== null" class="pg-box" role="dialog" aria-modal="true" :aria-label="photos[open]!.cap" @click.self="open = null">
          <img :key="open" :src="photos[open]!.src" :alt="photos[open]!.alt" class="pg-big" />
          <p class="pg-big-cap">{{ photos[open]!.cap }}</p>
          <button type="button" class="pg-nav l" aria-label="Предыдущее фото" @click="go(-1)">‹</button>
          <button type="button" class="pg-nav r" aria-label="Следующее фото" @click="go(1)">›</button>
          <button type="button" class="pg-x" aria-label="Закрыть" @click="open = null">×</button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.pg { display: grid; gap: 14px; grid-template-columns: repeat(2, 1fr); grid-auto-rows: 200px; grid-auto-flow: dense; }
@media (min-width: 900px) { .pg { grid-template-columns: repeat(4, 1fr); grid-auto-rows: 230px; } }
.pg .g-tall { grid-row: span 2; } .pg .g-banner { grid-column: 1 / -1; grid-row: span 2; } .pg .g-banner img { object-position: 50% 62%; }
@media (min-width: 900px) { .pg .g-banner { grid-row: span 1; height: 300px; } } @media (min-width: 900px) { .pg .g-wide { grid-column: span 2; } }
.pg-compact { grid-auto-rows: 190px; } @media (min-width: 900px) { .pg-compact { grid-auto-rows: 210px; } }
.pg-item { position: relative; overflow: hidden; border-radius: 16px; border: 1px solid #e0a24a55; background: #1d1107; cursor: zoom-in;
  box-shadow: 0 0 20px #e0a24a1a; transition: border-color var(--t) var(--ease), box-shadow var(--t) var(--ease); }
.pg-item img { width: 100%; height: 100%; object-fit: cover; filter: saturate(.85) brightness(.82) sepia(.15) hue-rotate(-12deg); transform: scale(1.02);
  transition: transform .9s var(--ease), filter var(--t-slow) var(--ease); }
.pg-item::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, #0000 50%, #100904e6); pointer-events: none; }
.pg-item:hover, .pg-item:focus-visible { border-color: #e0a24a; box-shadow: 0 0 28px #e0a24a66; outline: none; }
.pg-item:hover img, .pg-item:focus-visible img { transform: scale(1.08); filter: saturate(1) brightness(1) sepia(0); }
.pg-cap { position: absolute; z-index: 1; left: 14px; right: 14px; bottom: 12px; text-align: left; font: 700 18px/1.1 var(--font-display); color: #f3e6c8; text-shadow: 0 0 12px #e0a24a88, 0 2px 6px #000; }
.pg-box { position: fixed; inset: 0; z-index: 70; display: grid; place-items: center; padding: 4vh 6vw; background: #100904f2; }
.pg-big { max-width: 100%; max-height: 82vh; border-radius: 16px; border: 1px solid #e0a24a88; box-shadow: 0 0 50px #e0a24a44; animation: pg-in .45s var(--ease); }
@keyframes pg-in { from { opacity: 0; transform: scale(.96); } }
.pg-big-cap { margin-top: 12px; font: 700 22px var(--font-display); color: #f3e6c8; text-shadow: 0 0 12px #e0a24a88; }
.pg-nav, .pg-x { position: absolute; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; font-size: 30px; line-height: 1; color: #f3e6c8;
  border: 1px solid #e0a24a88; background: #1d1107cc; transition: box-shadow var(--t) var(--ease), background var(--t) var(--ease); }
.pg-nav:hover, .pg-x:hover { background: #e0a24a; box-shadow: 0 0 18px #e0a24a; }
.pg-nav.l { left: 2vw; top: 50%; } .pg-nav.r { right: 2vw; top: 50%; } .pg-x { right: 2vw; top: 2vw; }
@media (prefers-reduced-motion: reduce) { .pg-item img, .pg-big { transition: none; animation: none; } }
</style>
