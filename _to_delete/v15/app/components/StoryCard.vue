<script setup lang="ts">
// Сюжет как карта колоды: рубашка с названием → при наведении (или тапе) переворачивается к описанию
const props = defineProps<{ game: { slug: string; title: string; excerpt: string; cover?: string | null; meta: any }; open?: boolean }>()
import { shortTitle } from '#shared/game-icons'
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
          <span class="vc-house" :title="`Игроков: ${m.players}`"><span class="inline-flex items-center gap-0.5"><IconPeople class="text-[11px]" />{{ players }}</span></span>
          <span v-if="m.level" class="vc-shield" :title="`Уровень ${m.level}`"><span><small>ур.</small>{{ m.level }}</span></span>
        </div>
        <span class="vc-orb" :class="m.adult && 'adult'" :title="m.adult ? '18+' : m.kind">{{ m.adult ? '18+' : kindMark }}</span>
      </template>
      <div class="flex h-full flex-col">
        <span class="sc-kind">{{ m.kind }}</span>
        <div class="relative mx-auto mt-1">
          <GameIcon :slug="game.slug" :width="112" class="relative z-[1]" />
          <span class="sc-shadow" />
        </div>
        <p v-if="m.series" class="mt-2 text-[10px] font-bold uppercase tracking-[.18em]" style="color: var(--c3)">{{ m.series }}</p>
        <h3 class="mt-0.5 text-[26px] leading-none">{{ shortTitle(game.title, m.series) }}</h3>
        <p class="mt-2 line-clamp-4 text-[13px] leading-relaxed" style="color: color-mix(in srgb, var(--ink) 78%, var(--c3))">{{ game.excerpt }}</p>
        <div class="relative z-[1] mt-auto flex justify-end pt-2"><NuxtLink :to="`/games/${game.slug}`" class="sc-more">Подробнее</NuxtLink></div>
      </div>
    </TarotCard>
  </div>
</template>

<style>
.story-card { cursor: pointer; padding: 0 6px; }
.story-card .tarot-content { padding: 22px 16px 14px 26px; }
.sc-kind { align-self: center; padding: 3px 10px; border-radius: 99px; font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; background: var(--c2); color: var(--ink); }
.sc-shadow { position: absolute; left: 18%; right: 18%; bottom: -4px; height: 9px; border-radius: 50%; background: #0000004d; }
.sc-more { padding: 7px 16px; border-radius: 99px; font-size: 13px; font-weight: 800; color: var(--c1); background: #F7F2E6; box-shadow: 0 3px 0 #0004; transition: transform .2s, box-shadow .2s, background .2s; }
.sc-more:hover { background: var(--c3); transform: translateY(-1px); box-shadow: 0 5px 12px #0006, 0 0 14px color-mix(in srgb, var(--c3) 60%, transparent); }
/* Призыв на рубашке: мягко «дышит», при наведении на колоду разгорается */
.sc-call { position: absolute; inset-inline: 8%; bottom: 6%; padding: 11px 10px 9px; border-radius: 14px; text-align: center;
  background: #F7F2E6; color: #2a0909; box-shadow: 0 4px 0 #0005; }
.sc-q { font-family: var(--font-display); font-size: 21px; font-weight: 700; line-height: 1.05; animation: sc-breathe 3.2s ease-in-out infinite; }
.sc-hint { margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 10px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #a10d0d; }
.sc-turn { display: inline-block; font-size: 14px; letter-spacing: 0; animation: sc-spin 3.2s ease-in-out infinite; }
.sc-touch { display: none; }
@media (hover: none) { .sc-mouse { display: none; } .sc-touch { display: inline; } }
@keyframes sc-breathe { 50% { opacity: .72; } }
@keyframes sc-spin { 0%, 60% { transform: rotate(0); } 85%, 100% { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .sc-q, .sc-turn { animation: none; } }
</style>
