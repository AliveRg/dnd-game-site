<script setup lang="ts">
// Карта с двумя сторонами в стиле расписных ассетов: рубашка - кожа и орех (public/art/card-back.webp),
// лицо - тёмный орех с латунным кантом и уголками (variant dark) или пергамент (variant paper). theme.glow - свет мира за картинкой.
// Слоты: default - лицо, #back - поверх рубашки, #outside - плашки снаружи лица (игроки, уровень, эмблема).
// v-model:flipped - true = лицом вверх. Переворот - только transform (GPU).
import { CARD_VARIANTS, type CardTheme } from '#shared/card-themes'

const props = withDefaults(
  defineProps<{ flipped?: boolean; interactive?: boolean; variant?: 'paper' | 'gold' | 'dark'; theme?: CardTheme; glow?: boolean; width?: string; label?: string }>(),
  { flipped: false, interactive: true, variant: 'paper', glow: true, width: '280px', label: 'Перевернуть карту' }
)
const emit = defineEmits<{ 'update:flipped': [boolean] }>()

const vars = computed(() => {
  const t = props.theme ?? CARD_VARIANTS[props.variant]
  return { '--glow': t.glow }
})
const shown = ref(props.flipped) // какая сторона сверху (для лучей/искр)
watch(
  () => props.flipped,
  (v) => setTimeout(() => (shown.value = v), v ? 260 : 0)
)
const sparks = Array.from({ length: 12 }, (_, i) => ({ left: `${22 + ((i * 37) % 56)}%`, top: `${20 + ((i * 53) % 60)}%`, '--i': i }))
function toggle() {
  if (props.interactive) emit('update:flipped', !props.flipped)
}
</script>

<template>
  <div class="tarot" :style="{ '--w': width }">
    <div v-if="glow && shown" class="tarot-fx" aria-hidden="true">
      <div class="tarot-rays" />
      <span v-for="(sp, i) in sparks" :key="i" class="tarot-spark" :style="sp" />
    </div>

    <div
      class="tarot-inner"
      :class="{ 'is-front': flipped }"
      :role="interactive ? 'button' : undefined"
      :tabindex="interactive ? 0 : undefined"
      :aria-label="interactive ? label : undefined"
      :aria-pressed="interactive ? flipped : undefined"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
    >
      <!-- Рубашка -->
      <div class="tarot-face tarot-back">
        <img src="/art/card-back.webp" alt="" class="tc-back-img" loading="lazy" decoding="async" />
        <slot name="back" />
      </div>
      <!-- Лицо -->
      <div class="tarot-face tarot-front tc-face" :class="`v-${variant}`" :style="vars">
        <div class="tc-panel">
          <div class="tarot-content"><slot /></div>
        </div>
        <slot name="outside" />
      </div>
    </div>
  </div>
</template>

<style>
.tarot { position: relative; width: var(--w); max-width: 100%; aspect-ratio: 2 / 3; perspective: 1600px; }
.tarot-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; will-change: transform;
  transition: transform .7s cubic-bezier(.3, .7, .25, 1); cursor: default; }
.tarot-inner.is-front { transform: rotateY(180deg); }
.tarot-inner[role='button'] { cursor: pointer; }
.tarot-inner[role='button']:focus-visible { outline: 2px solid #e0a24a; outline-offset: 6px; border-radius: 22px; }
.tarot-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; transform: translateZ(0); }
.tarot-front { transform: rotateY(180deg) translateZ(0); }

/* --- Рубашка: готовая иллюстрация --- */
.tarot-back { filter: drop-shadow(0 14px 16px #000b); }
.tc-back-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: fill; }
/* --- Лицо: тёмный орех, латунный кант, расписные уголки --- */
.tc-face { border-radius: 22px; padding: 7px; color: #f3e6c8;
  background: linear-gradient(180deg, #7e4515, #45250e 40%, #2f190a); box-shadow: inset 0 1px 0 #f2b45a55, 0 0 0 1px #100904, 0 16px 30px #000b; }
.tc-panel { position: relative; height: 100%; border-radius: 16px; overflow: hidden;
  background: url('/art/corner-progression-2-tl.webp') top 3px left 3px / 44px no-repeat, url('/art/corner-progression-2-tr.webp') top 3px right 3px / 44px no-repeat,
    url('/art/corner-progression-2-bl.webp') bottom 3px left 3px / 44px no-repeat, url('/art/corner-progression-2-br.webp') bottom 3px right 3px / 44px no-repeat,
    radial-gradient(70% 38% at 50% 24%, color-mix(in srgb, var(--glow) 32%, transparent), #0000 75%),
    linear-gradient(180deg, #24150a, #160c05);
  box-shadow: inset 0 0 0 1px #a8813c88, inset 0 0 30px #0008; }
.tc-face.v-paper .tc-panel { background: url('/art/corner-progression-2-tl.webp') top 3px left 3px / 44px no-repeat, url('/art/corner-progression-2-tr.webp') top 3px right 3px / 44px no-repeat,
    url('/art/corner-progression-2-bl.webp') bottom 3px left 3px / 44px no-repeat, url('/art/corner-progression-2-br.webp') bottom 3px right 3px / 44px no-repeat,
    radial-gradient(70% 40% at 50% 24%, #fff8, #0000 75%), linear-gradient(180deg, #f3e6c8, #e2cfa6); color: #2f190a; box-shadow: inset 0 0 0 1px #a8813c, inset 0 0 40px #7e451533; }
.tarot-content { position: relative; height: 100%; display: flex; flex-direction: column; padding: 22px 18px 16px; text-align: center; overflow: hidden; }

/* Внешние плашки: игроки и уровень слева, медальон формата справа */
.vc-side { position: absolute; left: -14px; top: 40%; display: flex; flex-direction: column; gap: 8px; z-index: 3; }
.vc-house, .vc-shield { position: relative; width: 46px; height: 46px; display: grid; place-items: center; }
.vc-house img, .vc-shield img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 3px 6px #000c); }
.vc-house b, .vc-shield b { position: relative; margin-top: 18px; padding: 0 5px; border-radius: 6px; font: 800 12px/1.3 var(--font-sans); color: #f3e6c8; background: #100904dd; box-shadow: 0 0 0 1px #a8813c; }
.vc-shield b { margin-top: 6px; background: none; box-shadow: none; font-size: 15px; text-shadow: 0 1px 3px #000; }
.vc-orb { position: absolute; right: -12px; top: 8%; z-index: 3; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
  background: radial-gradient(circle at 35% 30%, #f6c873, #b16f23 60%, #7e4515); border: 2px solid #2f190a; color: #2f190a; font: 800 12px/1 var(--font-sans); box-shadow: 0 0 0 1px #a8813c, 0 4px 10px #000a; }
.vc-orb.adult { background: radial-gradient(circle at 35% 30%, #e5604a, #7a1a12); color: #f3e6c8; }

/* Лучи и искры за картой */
.tarot-fx { position: absolute; left: 50%; top: 50%; width: 240%; aspect-ratio: 1; transform: translate(-50%, -50%); pointer-events: none; z-index: -1;
  -webkit-mask: radial-gradient(closest-side, #000 18%, #0009 45%, #0000 100%); mask: radial-gradient(closest-side, #000 18%, #0009 45%, #0000 100%);
  animation: tarot-in .6s ease-out; }
.tarot-rays { position: absolute; inset: 0; border-radius: 50%; background: repeating-conic-gradient(from 0deg, #f3e6c840 0deg 4deg, #0000 4deg 15deg);
  animation: tarot-rays 40s linear infinite; will-change: transform; }
@keyframes tarot-rays { to { transform: rotate(360deg); } }
@keyframes tarot-in { from { opacity: 0; } }
.tarot-spark { position: absolute; width: 10px; height: 10px; background: #fff6d0;
  clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
  animation: tarot-twinkle calc(1.6s + var(--i) * .17s) ease-in-out infinite; animation-delay: calc(var(--i) * -.23s); }
@keyframes tarot-twinkle { 0%, 100% { opacity: .1; transform: scale(.4); } 50% { opacity: 1; transform: scale(1); } }



@media (prefers-reduced-motion: reduce) {
  .tarot-inner { transition-duration: .01s; }
  .tarot-rays, .tarot-spark { animation: none; }
}
</style>
