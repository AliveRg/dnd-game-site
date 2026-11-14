<script setup lang="ts">
// Сюжет как карта колоды: рубашка с названием → при наведении (или тапе) переворачивается к описанию
const props = defineProps<{ game: { slug: string; title: string; excerpt: string; cover?: string | null; meta: any }; open?: boolean }>()
import { shortTitle } from '#shared/game-icons'
const flipped = ref(!!props.open)
const m = computed(() => props.game.meta || {})
// Мышь - переворот при наведении; палец/стилус - по тапу. Определяем по типу указателя, а не по устройству
let lastPointer = 'mouse'
function onEnter(e: PointerEvent) { lastPointer = e.pointerType; if (!props.open && e.pointerType === 'mouse') flipped.value = true }
function onLeave(e: PointerEvent) { if (!props.open && e.pointerType === 'mouse') flipped.value = false }
function onClick(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('a')) return // клик по ссылке - переход
  if (!props.open && lastPointer !== 'mouse') flipped.value = !flipped.value
}
</script>

<template>
  <div class="story-card" tabindex="0" @pointerenter="onEnter" @pointerdown="lastPointer = $event.pointerType" @pointerleave="onLeave" @click="onClick" @keydown.enter="!open && (flipped = !flipped)" @focusin="flipped = true" @focusout="!open && (flipped = false)">
    <TarotCard v-model:flipped="flipped" :interactive="false" variant="dark" :glow="false" width="100%">
      <!-- Рубашка: только загадка и призыв перевернуть -->
      <template #back>
        <div class="sc-call">
          <p class="sc-q">Что скрывает карта?</p>
          <p class="sc-hint"><span class="sc-turn" aria-hidden="true">↻</span><span class="sc-mouse">наведи и переверни</span><span class="sc-touch">нажми и переверни</span></p>
        </div>
      </template>
      <div class="flex h-full flex-col text-left">
        <div class="flex items-start justify-between gap-2">
          <div class="flex flex-wrap gap-1.5">
            <span class="badge">{{ m.kind }}</span>
            <span v-if="m.adult" class="badge" style="background: #8a1c1c; color: #f1e6cf">18+</span>
          </div>
          <PlayersBadge :players="m.players" size="xs" :caption="false" class="-mr-1 -mt-1" />
        </div>
        <GameIcon :slug="game.slug" :width="100" class="mx-auto -mt-2 flex-none text-candle" />
        <p v-if="m.series" class="mt-3 text-[11px] uppercase tracking-widest text-candle">{{ m.series }}</p>
        <h3 class="mt-1 text-2xl text-parchment">{{ shortTitle(game.title, m.series) }}</h3>
        <p class="mt-2 line-clamp-5 text-sm leading-relaxed text-ash">{{ game.excerpt }}</p>
        <div class="mt-auto flex justify-end pt-3"><NuxtLink :to="`/games/${game.slug}`" class="btn-primary px-4 py-2 text-sm">Подробнее</NuxtLink></div>
      </div>
    </TarotCard>
  </div>
</template>

<style>
.story-card { cursor: pointer; }
.story-card .tarot-content { padding: 22px 18px 18px; }
/* Призыв на рубашке: мягко «дышит», при наведении на колоду разгорается */
.sc-call { position: absolute; inset-inline: 7%; bottom: 5%; padding: 12px 10px 10px; border-radius: 12px; text-align: center;
  background: #130b09ee; border: 1px solid #f0a04055; box-shadow: 0 -6px 18px #000a; }
.sc-q { font-family: var(--font-display); font-size: 21px; line-height: 1.05; background: var(--gold-text); -webkit-background-clip: text; background-clip: text; color: transparent; animation: sc-breathe 3.2s ease-in-out infinite; }
.sc-hint { margin-top: 5px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: #e9c271; }
.sc-turn { display: inline-block; font-size: 14px; letter-spacing: 0; animation: sc-spin 3.2s ease-in-out infinite; }
.sc-touch { display: none; }
@media (hover: none) { .sc-mouse { display: none; } .sc-touch { display: inline; } }
@keyframes sc-breathe { 50% { opacity: .72; } }
@keyframes sc-spin { 0%, 60% { transform: rotate(0); } 85%, 100% { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .sc-q, .sc-turn { animation: none; } }
</style>
