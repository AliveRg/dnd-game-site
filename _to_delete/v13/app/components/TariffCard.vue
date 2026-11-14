<script setup lang="ts">
// Тариф как предмет D&D: обычный / редкий / легендарный. Анимации - только transform/opacity (дёшево для GPU).
import { TIER_LABEL, REGULAR_PRICE_4H, PROMO_UNTIL } from '#shared/utils/pricing'
const props = defineProps<{ t: { id: string; title: string; hours: number; price: number; note: string; tier: 'common' | 'rare' | 'legendary'; badge?: string }; selected?: boolean; compact?: boolean }>()
const until = new Date(PROMO_UNTIL).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
const embers = Array.from({ length: 7 }, (_, i) => ({ left: `${10 + i * 13}%`, '--d': `${2.2 + (i % 3) * 0.7}s`, '--delay': `${-i * 0.55}s` }))
</script>

<template>
  <div class="tariff" :class="[`t-${t.tier}`, { selected, compact }]">
    <span v-if="t.tier === 'legendary'" class="t-ring" aria-hidden="true" />
    <!-- Выбранный тариф отмечается золотой монетой (вместо галочки) -->
    <svg v-if="selected" class="t-coin" viewBox="0 0 40 40" aria-hidden="true">
      <defs><radialGradient :id="`tc-${t.id}`" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#F7F2E6" /><stop offset=".45" stop-color="#ff5a4a" /><stop offset="1" stop-color="#8a0000" /></radialGradient></defs>
      <circle cx="20" cy="20" r="18" :fill="`url(#tc-${t.id})`" stroke="#040404" stroke-width="1.6" />
      <circle cx="20" cy="20" r="13.5" fill="none" stroke="#7a4210" stroke-width="1" stroke-dasharray="1.6 1.8" />
      <path d="M20 9.5 29.5 15v10L20 30.5 10.5 25V15Z" fill="#DF0000" stroke="#5a2e08" stroke-width="1.2" />
      <path d="M20 9.5 25 21H15ZM15 21l5 9.5 5-9.5M10.5 15 15 21M29.5 15 25 21M10.5 25 15 21M29.5 25 25 21" fill="none" stroke="#5a2e08" stroke-width=".9" />
      <ellipse cx="14" cy="11" rx="5" ry="2.2" fill="#fff8" transform="rotate(-30 14 11)" />
    </svg>
    <div class="t-body">
      <span v-if="t.tier === 'legendary'" class="t-embers" aria-hidden="true"><i v-for="(e, i) in embers" :key="i" :style="e" /></span>
      <div class="flex items-center justify-between gap-2">
        <span class="t-tier">{{ TIER_LABEL[t.tier] }}</span>
        <span v-if="t.badge" class="badge">{{ t.badge }}</span>
      </div>
      <svg class="t-gem" viewBox="0 0 40 40" aria-hidden="true">
        <path d="M8 15 14 7h12l6 8-12 18Z" class="g1" /><path d="M8 15h24L20 33Z" class="g2" /><path d="M14 7l-2 8h16l-2-8M20 7v8M12 15l8 18 8-18" class="g3" />
      </svg>
      <p class="t-price">{{ t.price.toLocaleString('ru-RU') }} ₽</p>
      <p class="t-title">{{ t.title }}</p>
      <template v-if="!compact">
        <p class="mt-1 text-sm text-ash">с человека · {{ t.hours }} {{ t.hours === 6 ? 'часов' : 'часа' }} игры</p>
        <p v-if="t.id === 'promo4'" class="mt-1 text-xs text-candle">Акция до {{ until }}, далее {{ REGULAR_PRICE_4H }} ₽</p>
        <p class="mt-3 flex-1 text-sm text-parchment/80">{{ t.note }}</p>
        <div class="mt-4 flex justify-end"><slot /></div>
      </template>
    </div>
  </div>
</template>

<style>
.tariff { position: relative; border-radius: 16px; isolation: isolate; transition: transform .3s cubic-bezier(.3,.7,.25,1); height: 100%; }
.tariff:hover { transform: translateY(-3px); }
.t-body { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; padding: 18px 18px 16px; border-radius: inherit; overflow: hidden;
  background: linear-gradient(180deg, #1b110dee, #040404f5); border: 1px solid #3a3333; }
.compact .t-body { padding: 12px 12px 12px; }
.t-tier { font-size: 10px; font-weight: 800; letter-spacing: .18em; text-transform: uppercase; }
.t-gem { width: 34px; height: 34px; margin: 10px 0 6px; }
.compact .t-gem { width: 26px; height: 26px; margin: 6px 0 2px; }
.t-gem .g3 { fill: none; stroke: #0007; stroke-width: 1; }
.t-price { font-family: var(--font-display); font-size: 42px; line-height: 1; font-weight: 700; }
.compact .t-price { font-size: 28px; }
.t-title { margin-top: 4px; font-size: 15px; color: #F7F2E6; }
.compact .t-title { font-size: 13px; color: #959595; }

/* - Обычный: бронза, спокойно - */
.t-common .t-tier { color: #c79a6b; }
.t-common .g1 { fill: #9a6a3c; } .t-common .g2 { fill: #c79a6b; }
.t-common .t-price { color: #e6c8a3; }
.t-common.selected .t-body { border-color: #c79a6b; box-shadow: 0 0 0 1px #c79a6b66; }

/* - Редкий: золото, мягкое свечение, блик по камню - */
.t-rare .t-tier { color: #ff8a7a; }
.t-rare .t-body { border-color: #DF000088; }
.t-rare .g1 { fill: #DF0000; } .t-rare .g2 { fill: #F7F2E6; }
.t-rare .t-price { background: var(--gold-text); -webkit-background-clip: text; background-clip: text; color: transparent; }
.t-rare::after { content: ''; position: absolute; inset: -1px; z-index: 0; border-radius: inherit; opacity: .35; box-shadow: 0 0 22px #DF000088; transition: opacity .3s; }
.t-rare:hover::after, .t-rare.selected::after { opacity: 1; }
.t-rare.selected .t-body { border-color: #ff8a7a; }
.t-rare .t-gem { filter: drop-shadow(0 0 6px #DF000099); }

/* - Легендарный: бегущая огненная рамка, искры, пульсирующий камень - */
.t-legendary .t-tier { color: #ff8a3c; text-shadow: 0 0 8px #ff6a1a88; }
.t-legendary .t-body { border-color: transparent; margin: 2px; height: calc(100% - 4px); }
.t-ring { position: absolute; inset: 0; z-index: 0; border-radius: inherit; overflow: hidden; }
.t-ring::before { content: ''; position: absolute; left: 50%; top: 50%; width: 250%; aspect-ratio: 1; translate: -50% -50%;
  background: conic-gradient(#ff6a1a, #F7F2E6, #8a1c1c, #DF0000, #ff6a1a); animation: t-spin 4s linear infinite; will-change: transform; }
.t-legendary { box-shadow: 0 0 26px #ff6a1a44; }
.t-legendary:hover, .t-legendary.selected { box-shadow: 0 0 36px #ff6a1a88; }
.t-legendary .g1 { fill: #ff6a1a; } .t-legendary .g2 { fill: #F7F2E6; }
.t-legendary .t-gem { animation: t-gem 2.4s ease-in-out infinite; filter: drop-shadow(0 0 8px #ff6a1a); }
.t-legendary .t-price { background: linear-gradient(180deg, #fff1c9, #ffb050 50%, #ff6a1a); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0 10px #ff6a1a55); }
.t-embers { position: absolute; inset: 0; pointer-events: none; z-index: -1; }
.t-embers i { position: absolute; bottom: -6px; width: 4px; height: 4px; border-radius: 50%; background: #ffb050; box-shadow: 0 0 6px #ff6a1a;
  animation: t-ember var(--d) linear infinite; animation-delay: var(--delay); opacity: 0; }
@keyframes t-spin { to { transform: rotate(360deg); } }
@keyframes t-gem { 50% { transform: scale(1.12) rotate(-6deg); } }
@keyframes t-ember { 0% { transform: translateY(0) translateX(0); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(-160px) translateX(10px); opacity: 0; } }
.t-coin { position: absolute; z-index: 3; top: -13px; right: -12px; width: 34px; height: 34px; filter: drop-shadow(0 3px 5px #000c) drop-shadow(0 0 8px #DF000088);
  animation: t-coin .6s cubic-bezier(.3,1.5,.5,1) both; }
@keyframes t-coin { from { transform: scale(.2) rotateY(540deg); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .t-coin { animation: none; } }
@media (prefers-reduced-motion: reduce) { .t-ring::before, .t-legendary .t-gem, .t-embers i { animation: none; } }
</style>
