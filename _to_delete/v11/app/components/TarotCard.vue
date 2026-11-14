<script setup lang="ts">
// Карта с двумя сторонами: рубашка (/cards/back-v3.svg) и лицо с инфо/функционалом (слот).
// Переворот - 3D-поворот с лёгким «изгибом» (skew + масштаб + блик), как у настоящей карты.
// v-model:flipped - true = лицом вверх.
const props = withDefaults(
  defineProps<{ flipped?: boolean; interactive?: boolean; variant?: 'paper' | 'gold' | 'dark'; glow?: boolean; width?: string; back?: string; label?: string }>(),
  { flipped: false, interactive: true, variant: 'paper', glow: true, width: '280px', back: '/cards/back-v3.svg', label: 'Перевернуть карту' }
)
const emit = defineEmits<{ 'update:flipped': [boolean] }>()

const shown = ref(props.flipped) // какая сторона сверху (для лучей/искр)
watch(
  () => props.flipped,
  (v) => setTimeout(() => (shown.value = v), v ? 260 : 0)
)
// Позиции искр - фиксированные «случайные»
const sparks = Array.from({ length: 12 }, (_, i) => ({ left: `${22 + ((i * 37) % 56)}%`, top: `${20 + ((i * 53) % 60)}%`, '--i': i }))
function toggle() {
  if (props.interactive) emit('update:flipped', !props.flipped)
}
</script>

<template>
  <div class="tarot" :style="{ '--w': width }">
    <!-- Лучи и искры за картой, когда она открыта -->
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
      <div class="tarot-face tarot-back">
        <img :src="back" alt="" draggable="false" />
        <slot name="back" />
      </div>
      <div class="tarot-face tarot-front" :class="`v-${variant}`">
        <div class="tarot-frame">
          <span class="st st-tl">✦</span><span class="st st-tr">✦</span><span class="st st-bl">✦</span><span class="st st-br">✦</span>
          <div class="tarot-content"><slot /></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.tarot { position: relative; width: var(--w); max-width: 100%; aspect-ratio: 5 / 7; perspective: 1600px; }
/* Плавный оптимизированный переворот: только transform (GPU), без перерисовки содержимого */
.tarot-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; will-change: transform;
  transition: transform .7s cubic-bezier(.3, .7, .25, 1); cursor: default; }
.tarot-inner.is-front { transform: rotateY(180deg); }
.tarot-inner[role='button'] { cursor: pointer; }
.tarot-inner[role='button']:focus-visible { outline: 2px solid #f0a040; outline-offset: 6px; border-radius: 22px; }

.tarot-face { position: absolute; inset: 0; border-radius: 22px; overflow: hidden; backface-visibility: hidden; -webkit-backface-visibility: hidden;
  transform: translateZ(0); box-shadow: 0 14px 30px #000b, 0 0 0 1px #0008; }
.tarot-back img { width: 100%; height: 100%; display: block; object-fit: cover; user-select: none; }
.tarot-front { transform: rotateY(180deg) translateZ(0); }

/* Лицевые стороны - без текстур дерева */
.tarot-front.v-paper { background: radial-gradient(120% 90% at 50% 20%, #f6ead0, #e6d3ad 60%, #d2b98a); color: #2b1d10; }
.tarot-front.v-dark { background: radial-gradient(120% 90% at 50% 15%, #2a1a10, #170d0a 65%, #0f0806); color: #f1e6cf; }
.tarot-front.v-gold { background: radial-gradient(120% 80% at 30% 10%, #fff5, #0000 50%), linear-gradient(180deg, #0000, #0003), url('/textures/gold.webp') center / cover; color: #2a1203; }
.tarot-frame { position: absolute; inset: 12px; border-radius: 30px 30px 30px 30px / 40px; border: 2px solid currentColor; display: flex; }
.v-paper .tarot-frame { border-color: #8a5a1f; box-shadow: inset 0 0 0 4px #f3e6c8, inset 0 0 0 5px #8a5a1f66; }
.v-dark .tarot-frame { border-color: #c8913c; box-shadow: inset 0 0 0 4px #1d1410, inset 0 0 0 5px #c8913c55; }
.v-gold .tarot-frame { border-color: #5a3a15; box-shadow: inset 0 0 0 4px #e9c27188, inset 0 0 0 5px #5a3a1588; border-style: double; border-width: 4px; }
.tarot-frame .st { position: absolute; font-size: 14px; line-height: 1; color: #c8913c; }
.v-gold .tarot-frame .st { color: #5a3a15; }
.st-tl { top: 8px; left: 10px; } .st-tr { top: 8px; right: 10px; } .st-bl { bottom: 8px; left: 10px; } .st-br { bottom: 8px; right: 10px; }
.tarot-content { position: relative; flex: 1; display: flex; flex-direction: column; padding: 26px 20px 20px; text-align: center; overflow: hidden; }

/* Лучи и искры: квадратная область по центру, мягко растворяются в прозрачность (без «стены») */
.tarot-fx { position: absolute; left: 50%; top: 50%; width: 240%; aspect-ratio: 1; transform: translate(-50%, -50%); pointer-events: none; z-index: -1;
  -webkit-mask: radial-gradient(closest-side, #000 18%, #0009 45%, #0000 100%); mask: radial-gradient(closest-side, #000 18%, #0009 45%, #0000 100%);
  animation: tarot-in .6s ease-out; }
.tarot-rays { position: absolute; inset: 0; border-radius: 50%; background: repeating-conic-gradient(from 0deg, #ffd99a40 0deg 4deg, #0000 4deg 15deg);
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
