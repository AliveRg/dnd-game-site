<script setup lang="ts">
// Сюжет как карта колоды: рубашка с названием → при наведении (или тапе) переворачивается к описанию
const props = defineProps<{ game: { slug: string; title: string; excerpt: string; cover?: string | null; meta: any }; open?: boolean }>()
import { shortTitle } from '#shared/story-art'
import { storyTheme } from '#shared/card-themes'
const flipped = ref(!!props.open)
const m = computed(() => props.game.meta || {})
const theme = computed(() => storyTheme(props.game.slug))
const players = computed(() => (/\d/.test(m.value.players || '') ? m.value.players : '?'))
const kindMark = computed(() => ({ Ваншот: '1×', Модуль: 'М', Кампания: '∞' } as Record<string, string>)[m.value.kind] || '◆')
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
    <TarotCard v-model:flipped="flipped" :interactive="false" :theme="theme" variant="dark" :glow="false" width="100%">
      <!-- Рубашка: только загадка и призыв перевернуть -->
      <template #back>
        <div class="sc-call">
          <p class="sc-q">Что скрывает карта?</p>
          <p class="sc-hint"><span class="sc-turn" aria-hidden="true">↻</span><span class="sc-mouse">наведи и переверни</span><span class="sc-touch">нажми и переверни</span></p>
        </div>
      </template>
      <!-- Снаружи лица: игроки («домик»), уровень («щит»), эмблема формата -->
      <template #outside>
        <div class="vc-side">
          <span class="vc-house" :title="`Игроков: ${m.players}`"><img src="/art/ui-players.webp" alt="" /><b>{{ players }}</b></span>
          <span v-if="m.level" class="vc-shield" :title="`Уровень ${m.level}`"><img src="/art/ui-level.webp" alt="" /><b>{{ m.level }}</b></span>
        </div>
        <span class="vc-orb" :class="m.adult && 'adult'" :title="m.adult ? '18+' : m.kind">{{ m.adult ? '18+' : kindMark }}</span>
      </template>
      <div class="flex h-full flex-col">
        <span class="sc-kind">{{ m.kind }}</span>
        <GameIcon :slug="game.slug" :width="200" class="sc-art" />
        <p v-if="m.series" class="mt-1 text-[10px] font-bold uppercase tracking-[.18em] text-candle">{{ m.series }}</p>
        <h3 class="mt-0.5 text-[24px] leading-none">{{ shortTitle(game.title, m.series) }}</h3>
        <p class="mt-2 line-clamp-2 px-1 text-[13px] leading-relaxed text-[#d6c6a6]">{{ game.excerpt }}</p>
        <div class="relative z-[1] mt-auto flex justify-center pt-2"><NuxtLink :to="`/games/${game.slug}`" class="sc-more">Подробнее</NuxtLink></div>
      </div>
    </TarotCard>
  </div>
</template>

<style>
.story-card { cursor: pointer; padding: 0 6px; }
.story-card .tarot-content { padding: 20px 20px 16px; }
/* медальон формата сидит в правом верхнем углу внутри рамки */
.story-card .vc-orb { top: 13px; right: 13px; width: 34px; height: 34px; font-size: 11px; border-width: 1.5px; }
.sc-kind { align-self: center; padding: 3px 10px; border-radius: 99px; font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: #2f190a; background: var(--gold); box-shadow: inset 0 1px 0 #fff6; }
.sc-art { width: 92%; height: auto; margin: 2px auto 0; aspect-ratio: 3 / 2; transition: transform var(--t-slow) var(--ease); }
.story-card:hover .sc-art { transform: scale(1.05) translateY(-2px); }
.sc-more { padding: 7px 16px; border-radius: 99px; font-size: 13px; font-weight: 800; color: #1d1107; background: var(--gold); box-shadow: inset 0 1px 0 #fff7, 0 3px 0 #5a3010; transition: transform var(--t-fast) var(--ease), filter var(--t) var(--ease); }
.sc-more:hover { filter: brightness(1.08); transform: translateY(-1px); }
/* Призыв на рубашке: мягко «дышит», при наведении на колоду разгорается */
.sc-call { position: absolute; inset-inline: 9%; bottom: 7%; padding: 10px 10px 8px; border-radius: 12px; text-align: center;
  background: linear-gradient(180deg, #f3e6c8, #e2cfa6); color: #2f190a; box-shadow: 0 0 0 1px #a8813c, 0 6px 14px #000b; }
.sc-q { font-family: var(--font-display); font-size: 21px; font-weight: 700; line-height: 1.05; animation: sc-breathe 3.2s ease-in-out infinite; }
.sc-hint { margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #7e4515; }
.sc-turn { display: inline-block; font-size: 14px; letter-spacing: 0; animation: sc-spin 3.2s ease-in-out infinite; }
.sc-touch { display: none; }
@media (hover: none) { .sc-mouse { display: none; } .sc-touch { display: inline; } }
@keyframes sc-breathe { 50% { opacity: .72; } }
@keyframes sc-spin { 0%, 60% { transform: rotate(0); } 85%, 100% { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .sc-q, .sc-turn { animation: none; } }
</style>
