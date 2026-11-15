<script setup lang="ts">
// Карта с двумя сторонами в плоском векторном стиле: цветная рамка, камень сверху, «земля» с точками внизу,
// капсулы-детали снаружи рамки. Рубашка - единая для всех (красная с золотым черепом), лицо - в цветах мира (theme).
// Слоты: default - лицо, #back - поверх рубашки, #outside - плашки снаружи лица (игроки, уровень, эмблема).
// v-model:flipped - true = лицом вверх. Переворот - только transform (GPU).
import { SKULL_SVG } from '#shared/skull'
import { CARD_VARIANTS, type CardTheme } from '#shared/card-themes'

const props = withDefaults(
  defineProps<{ flipped?: boolean; interactive?: boolean; variant?: 'paper' | 'gold' | 'dark'; theme?: CardTheme; glow?: boolean; width?: string; label?: string }>(),
  { flipped: false, interactive: true, variant: 'paper', glow: true, width: '280px', label: 'Перевернуть карту' }
)
const emit = defineEmits<{ 'update:flipped': [boolean] }>()

const vars = computed(() => {
  const t = props.theme ?? CARD_VARIANTS[props.variant]
  return { '--c1': t.c1, '--c2': t.c2, '--c3': t.c3, '--c4': t.c4, '--ink': t.ink }
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
      <div class="tarot-face tarot-back vc" style="--c1: #2a0909; --c2: #a10d0d; --c3: #ff6a5a; --c4: #DF0000">
        <span class="vc-pill vp1" /><span class="vc-pill vp2" /><span class="vc-pill vp3" />
        <div class="vc-frame">
          <div class="vc-panel">
            <div class="vc-ground" />
            <span class="vc-star s1" /><span class="vc-star s2" /><span class="vc-star s3" />
            <div class="vc-emblem"><svg viewBox="0 0 100 100" v-html="SKULL_SVG" /></div>
            <slot name="back" />
          </div>
        </div>
        <span class="vc-gem" />
      </div>
      <!-- Лицо -->
      <div class="tarot-face tarot-front vc" :class="`v-${variant}`" :style="vars">
        <span class="vc-pill vp1" /><span class="vc-pill vp2" /><span class="vc-pill vp3" />
        <div class="vc-frame">
          <div class="vc-panel">
            <div class="vc-ground" />
            <span class="vc-star s1" /><span class="vc-star s2" /><span class="vc-star s3" />
            <div class="tarot-content"><slot /></div>
          </div>
        </div>
        <span class="vc-gem" />
        <slot name="outside" />
      </div>
    </div>
  </div>
</template>

<style>
.tarot { position: relative; width: var(--w); max-width: 100%; aspect-ratio: 5 / 7; perspective: 1600px; }
.tarot-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; will-change: transform;
  transition: transform .7s cubic-bezier(.3, .7, .25, 1); cursor: default; }
.tarot-inner.is-front { transform: rotateY(180deg); }
.tarot-inner[role='button'] { cursor: pointer; }
.tarot-inner[role='button']:focus-visible { outline: 2px solid #DF0000; outline-offset: 6px; border-radius: 22px; }
.tarot-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; transform: translateZ(0); }
.tarot-front { transform: rotateY(180deg) translateZ(0); }

/* --- Векторная карта --- */
.vc { color: var(--ink, #F7F2E6); }
.vc-frame { position: absolute; inset: 0; border-radius: 24px; padding: 9px; background: var(--c2);
  box-shadow: inset 0 0 0 2px #ffffff22, 0 16px 30px #000a, 0 0 26px color-mix(in srgb, var(--c2) 45%, transparent); }
.vc-panel { position: relative; height: 100%; border-radius: 17px; overflow: hidden; background: var(--c1);
  box-shadow: inset 0 0 0 2px #0000001f; }
/* «Земля» внизу: диагональный пласт + светлое пятно с точками */
.vc-ground { position: absolute; inset: auto 0 0 0; height: 29%; background: var(--c2); clip-path: polygon(0 34%, 32% 18%, 58% 30%, 100% 0, 100% 100%, 0 100%); }
.vc-ground::after { content: ''; position: absolute; right: 0; bottom: 0; width: 62%; height: 82%; border-top-left-radius: 70% 60%;
  background: radial-gradient(circle, var(--c1) 0 3.2px, #0000 3.6px) 0 0 / 22px 22px, color-mix(in srgb, var(--c3) 55%, var(--c2)); opacity: .9; }
.vc-star { position: absolute; width: 14px; height: 14px; background: var(--c3); opacity: .5;
  clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%); }
.vc-star.s1 { top: 12%; left: 14%; } .vc-star.s2 { top: 34%; right: 13%; width: 10px; height: 10px; } .vc-star.s3 { top: 52%; left: 9%; width: 8px; height: 8px; }
/* Камень на верхней грани */
.vc-gem { position: absolute; left: 50%; top: -11px; width: 44px; height: 22px; translate: -50% 0; background: var(--c4);
  clip-path: polygon(22% 0, 78% 0, 100% 50%, 78% 100%, 22% 100%, 0 50%); box-shadow: inset 0 -6px 0 #0003; z-index: 2; }
.vc-gem::after { content: ''; position: absolute; inset: 22% 30%; background: #fff8; clip-path: polygon(20% 0, 80% 0, 100% 50%, 80% 100%, 20% 100%, 0 50%); }
/* Капсулы снаружи рамки */
.vc-pill { position: absolute; z-index: -1; height: 12px; border-radius: 99px; background: var(--c2); rotate: -32deg; }
.vc-pill.vp1 { right: -16px; top: 22%; width: 34px; }
.vc-pill.vp2 { right: -12px; top: calc(22% + 18px); width: 24px; opacity: .8; }
.vc-pill.vp3 { left: -14px; bottom: 16%; width: 30px; }
/* Рубашка: эмблема-череп в круге */
.vc-emblem { position: absolute; left: 50%; top: 42%; width: 54%; aspect-ratio: 1; translate: -50% -50%; border-radius: 50%;
  border: 4px solid #F7F2E6; background: radial-gradient(circle at 50% 40%, #4a0f0f, #1c0505); display: grid; place-items: center;
  box-shadow: 0 0 0 7px #a10d0d55, 0 0 30px #DF000066; }
.vc-emblem svg { width: 74%; height: 74%; }
.tarot-content { position: relative; height: 100%; display: flex; flex-direction: column; padding: 24px 18px 16px; text-align: center; overflow: hidden; }

/* Лучи и искры за картой */
.tarot-fx { position: absolute; left: 50%; top: 50%; width: 240%; aspect-ratio: 1; transform: translate(-50%, -50%); pointer-events: none; z-index: -1;
  -webkit-mask: radial-gradient(closest-side, #000 18%, #0009 45%, #0000 100%); mask: radial-gradient(closest-side, #000 18%, #0009 45%, #0000 100%);
  animation: tarot-in .6s ease-out; }
.tarot-rays { position: absolute; inset: 0; border-radius: 50%; background: repeating-conic-gradient(from 0deg, #F7F2E640 0deg 4deg, #0000 4deg 15deg);
  animation: tarot-rays 40s linear infinite; will-change: transform; }
@keyframes tarot-rays { to { transform: rotate(360deg); } }
@keyframes tarot-in { from { opacity: 0; } }
.tarot-spark { position: absolute; width: 10px; height: 10px; background: #fff6d0;
  clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
  animation: tarot-twinkle calc(1.6s + var(--i) * .17s) ease-in-out infinite; animation-delay: calc(var(--i) * -.23s); }
@keyframes tarot-twinkle { 0%, 100% { opacity: .1; transform: scale(.4); } 50% { opacity: 1; transform: scale(1); } }

/* Иконки сюжетов внутри карт - в светлом цвете мира */
.vc .game-icon { color: var(--c3); }
.vc.v-paper .game-icon, .vc.v-gold .game-icon { color: #5a0000; }

/* Внешние плашки: «домик» (игроки) и «щит» (уровень) слева, круглая эмблема справа */
.vc-side { position: absolute; left: -16px; top: 46%; display: flex; flex-direction: column; gap: 6px; z-index: 3; }
.vc-house, .vc-shield { position: relative; width: 44px; display: grid; place-items: center; font: 800 15px/1 var(--font-sans); color: var(--c1); }
.vc-house { height: 46px; padding-top: 10px; background: var(--c3); clip-path: polygon(50% 0, 100% 30%, 100% 100%, 0 100%, 0 30%); }
.vc-shield { height: 48px; padding-bottom: 8px; background: #F7F2E6; color: #3a0b0b; clip-path: polygon(0 0, 100% 0, 100% 55%, 50% 100%, 0 55%); }
.vc-house::before, .vc-shield::before { content: ''; position: absolute; inset: 3px; background: inherit; filter: brightness(1.12); clip-path: inherit; z-index: -1; }
.vc-side small { display: block; font-size: 8px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; opacity: .75; margin-bottom: 2px; text-align: center; }
.vc-orb { position: absolute; right: -14px; top: 9%; z-index: 3; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
  background: var(--c1); border: 3px solid #F7F2E6; color: var(--c3); font: 800 12px/1 var(--font-sans); box-shadow: 0 4px 10px #0008; }
.vc-orb.adult { background: #DF0000; color: #fff; }

@media (prefers-reduced-motion: reduce) {
  .tarot-inner { transition-duration: .01s; }
  .tarot-rays, .tarot-spark { animation: none; }
}
</style>
